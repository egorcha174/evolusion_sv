import type { HAEntity } from "$lib/types";

// --- Types ---

export interface TimerConfig {
    id: string;
    name: string;
    cycleDays?: number;
    cycleValue?: number;
    unit?: "sec" | "min" | "hour" | "day" | "month";
    lastResetDate: string | null; // ISO string

    // Visual Customizations
    fillColors?: [string, string, string]; // Start, Mid, End
    animation?: "smooth" | "wave" | "bubbles" | "trash" | "none";
    fillDirection?: "bottom-to-top" | "top-to-bottom";
    fillOpacity?: number; // 0..1

    // Text Customizations
    showName?: boolean;
    nameFontSize?: number;
    namePosition?: { x: number; y: number };
    daysRemainingFontSize?: number;
    daysRemainingPosition?: { x: number; y: number };
    unitFontSize?: number;
    unitPosition?: { x: number; y: number };
    showUnit?: boolean;
}

export const LOW_BATTERY_THRESHOLD = 20;

// --- Generators ---

/**
 * Generates a virtual entity for a Battery Monitor widget.
 * Aggregates all entities with battery_level or device_class: battery.
 */
export function createBatteryWidgetEntity(
    allEntities: HAEntity[],
): HAEntity | null {
    const batteryDevices = allEntities
        .filter((e) => {
            // Check attributes first
            if (typeof e.attributes.battery_level === "number") return true;

            // Check device class (must have a numeric state)
            if (
                e.attributes.device_class === "battery" &&
                !isNaN(parseFloat(e.state))
            )
                return true;

            return false;
        })
        .map((e) => {
            let level =
                typeof e.attributes.battery_level === "number"
                    ? e.attributes.battery_level
                    : parseFloat(e.state);

            return {
                id: e.entity_id,
                name: e.attributes.friendly_name || e.entity_id,
                level: Math.round(level),
            };
        })
        .sort((a, b) => a.level - b.level);

    if (batteryDevices.length === 0) return null;

    const lowCount = batteryDevices.filter(
        (d) => d.level <= LOW_BATTERY_THRESHOLD,
    ).length;

    return {
        entity_id: "internal.battery_monitor",
        state: String(batteryDevices.length),
        attributes: {
            friendly_name: "Уровень заряда",
            icon: "mdi:battery-50",
            widget_type: "battery",
            platform: "virtual", // Custom marker
            battery_devices: batteryDevices, // Custom attribute
            low_battery_count: lowCount,
        },
        context: { id: "virtual", parent_id: null, user_id: null },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
    };
}

/**
 * Generates a virtual entity for a single Event Timer.
 */
export function createTimerWidgetEntity(config: TimerConfig): HAEntity {
    const now = new Date();
    const unit = config.unit || "day";
    const cycleValue =
        config.cycleValue && config.cycleValue > 0
            ? config.cycleValue
            : config.cycleDays && config.cycleDays > 0
                ? config.cycleDays
                : 1;

    let remaining = cycleValue;
    let fillPercentage = 0;

    if (config.lastResetDate) {
        const resetDate = new Date(config.lastResetDate);
        if (!isNaN(resetDate.getTime())) {
            let unitsPassed = 0;
            if (unit === "month") {
                const nowIndex = now.getFullYear() * 12 + now.getMonth();
                const resetIndex =
                    resetDate.getFullYear() * 12 + resetDate.getMonth();
                unitsPassed = nowIndex - resetIndex;
                if (now.getDate() < resetDate.getDate()) {
                    unitsPassed -= 1;
                }
                unitsPassed = Math.max(0, unitsPassed);
            } else {
                const ms = now.getTime() - resetDate.getTime();
                const unitMs =
                    unit === "sec"
                        ? 1000
                        : unit === "min"
                            ? 1000 * 60
                            : unit === "hour"
                                ? 1000 * 60 * 60
                                : 1000 * 60 * 60 * 24;
                unitsPassed = Math.floor(ms / unitMs);
            }

            remaining = Math.max(0, cycleValue - unitsPassed);
            fillPercentage = Math.min(100, (unitsPassed / cycleValue) * 100);
        }
    }

    return {
        entity_id: `internal.event_timer_${config.id}`,
        state: remaining > 0 ? "active" : "expired",
        attributes: {
            friendly_name: config.name,
            icon: "mdi:timer-outline",
            widget_type: "timer",
            platform: "virtual",

            // Timer Specifics used by the Widget Component
            config: config,
            days_remaining: remaining,
            fill_percentage: fillPercentage,
            status_text: `Осталось ${remaining} ${unit}`,
        },
        context: { id: "virtual", parent_id: null, user_id: null },
        last_changed: config.lastResetDate || new Date().toISOString(),
        last_updated: new Date().toISOString(),
    };
}
