<script lang="ts">
    import { t } from "svelte-i18n";
    import "iconify-icon";
    import type { TimerConfig } from "$domains/ha/virtual-devices";

    // Bindable settings, cast to TimerConfig partially
    let { settings = $bindable({}), pendingResetDate = $bindable(null) } =
        $props<{
            settings: Partial<TimerConfig>;
            pendingResetDate?: string | null;
        }>();

    // Initialize defaults if missing
    // NOTE: Do NOT generate ID here! It must be created once when widget is added to dashboard
    // so each timer has a stable, unique identifier. ID generation is done in dashboardStore.addWidget()
    if (!settings.name)
        settings.name = $t("widgets.eventTimer.defaultName", {
            default: "Maintenance",
        });
    if (settings.cycleDays === undefined) settings.cycleDays = 30;
    if (settings.cycleValue === undefined)
        settings.cycleValue = settings.cycleDays;
    if (!settings.unit) settings.unit = "day";
    if (!settings.lastResetDate)
        settings.lastResetDate = new Date().toISOString();
    if (!settings.animation) settings.animation = "smooth";
    if (settings.showName === undefined) settings.showName = true;
    if (settings.showUnit === undefined) settings.showUnit = true;
    if (settings.fillOpacity === undefined) settings.fillOpacity = 1;
    if (!settings.fillDirection) settings.fillDirection = "bottom-to-top";
    if (!settings.fillColors)
        settings.fillColors = ["#22c55e", "#f59e0b", "#ef4444"];
    if (!settings.namePosition) settings.namePosition = { x: 50, y: 15 };
    if (!settings.daysRemainingPosition)
        settings.daysRemainingPosition = { x: 50, y: 50 };
    if (!settings.unitPosition) settings.unitPosition = { x: 68, y: 52 };
    // Default colors are handled in the widget, but we can allow override here later

    function handleResetNow() {
        pendingResetDate = new Date().toISOString();
    }

    function toDateInputValue(iso?: string | null) {
        if (!iso) return "";
        const d = new Date(iso);
        if (isNaN(d.getTime())) return "";
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function handleResetDateChange(value: string) {
        if (!value) {
            pendingResetDate = null;
            return;
        }
        const date = new Date(`${value}T00:00:00`);
        if (isNaN(date.getTime())) return;
        pendingResetDate = date.toISOString();
    }
</script>

<div class="settings-group">
    <div class="settings-grid">
        <!-- Name -->
        <div class="field span-2">
            <label for="timer-name">
                {$t("widgets.eventTimer.name", { default: "Name" })}
            </label>
            <input
                id="timer-name"
                type="text"
                bind:value={settings.name}
                placeholder={$t("widgets.eventTimer.namePlaceholder", {
                    default: "e.g. Change Filter",
                })}
            />
        </div>

        <!-- Cycle + Unit -->
        <div class="field">
            <label for="timer-days">
                {$t("widgets.eventTimer.cycleValue", {
                    default: "Cycle Value",
                })}
            </label>
            <div class="inline-grid">
                <input
                    id="timer-days"
                    type="number"
                    min="1"
                    bind:value={settings.cycleValue}
                />
                <select id="timer-unit" bind:value={settings.unit}>
                    <option value="sec">
                        {$t("widgets.eventTimer.units.sec", {
                            default: "sec",
                        })}
                    </option>
                    <option value="min">
                        {$t("widgets.eventTimer.units.min", {
                            default: "min",
                        })}
                    </option>
                    <option value="hour">
                        {$t("widgets.eventTimer.units.hour", {
                            default: "h",
                        })}
                    </option>
                    <option value="day">
                        {$t("widgets.eventTimer.units.day", { default: "d" })}
                    </option>
                    <option value="month">
                        {$t("widgets.eventTimer.units.month", {
                            default: "mo",
                        })}
                    </option>
                </select>
            </div>
        </div>

        <!-- Animation -->
        <div class="field">
            <label for="timer-animation">
                {$t("widgets.eventTimer.animation", { default: "Animation" })}
            </label>
            <select id="timer-animation" bind:value={settings.animation}>
                <option value="smooth">
                    {$t("widgets.eventTimer.animations.smooth", {
                        default: "Smooth",
                    })}
                </option>
                <option value="wave">
                    {$t("widgets.eventTimer.animations.wave", {
                        default: "Wave",
                    })}
                </option>
                <option value="bubbles">
                    {$t("widgets.eventTimer.animations.bubbles", {
                        default: "Bubbles",
                    })}
                </option>
                <option value="trash">
                    {$t("widgets.eventTimer.animations.trash", {
                        default: "Trash",
                    })}
                </option>
                <option value="none">
                    {$t("widgets.eventTimer.animations.none", {
                        default: "None",
                    })}
                </option>
            </select>
        </div>

        <!-- Fill Direction -->
        <div class="field">
            <label for="timer-direction">
                {$t("widgets.eventTimer.fillDirection", {
                    default: "Fill Direction",
                })}
            </label>
            <select id="timer-direction" bind:value={settings.fillDirection}>
                <option value="bottom-to-top">
                    {$t("widgets.eventTimer.fillDirections.bottomToTop", {
                        default: "bottom-to-top",
                    })}
                </option>
                <option value="top-to-bottom">
                    {$t("widgets.eventTimer.fillDirections.topToBottom", {
                        default: "top-to-bottom",
                    })}
                </option>
            </select>
        </div>

        <!-- Fill Opacity -->
        <div class="field">
            <label for="timer-opacity">
                {$t("widgets.eventTimer.opacity", { default: "Fill Opacity" })}
            </label>
            <input
                id="timer-opacity"
                type="number"
                min="0"
                max="1"
                step="0.05"
                bind:value={settings.fillOpacity}
            />
        </div>

        <!-- Fill Colors -->
        <div class="field span-2">
            <label>
                {$t("widgets.eventTimer.colors", { default: "Fill Colors" })}
            </label>
            <div class="color-row">
                <input type="color" bind:value={settings.fillColors[0]} />
                <input type="color" bind:value={settings.fillColors[1]} />
                <input type="color" bind:value={settings.fillColors[2]} />
            </div>
        </div>

        <!-- Last Reset Check -->
        <div class="field span-2">
            <label for="timer-reset">
                {$t("widgets.eventTimer.lastReset", { default: "Last Reset" })}
            </label>
            <div class="last-reset-row">
                <span class="date-display">
                    {settings.lastResetDate
                        ? new Date(settings.lastResetDate).toLocaleDateString()
                        : $t("widgets.eventTimer.never", {
                              default: "Never",
                          })}
                </span>
                <button class="btn-secondary" onclick={handleResetNow}>
                    <iconify-icon icon="mdi:refresh"></iconify-icon>
                    {$t("widgets.eventTimer.resetNow", {
                        default: "Reset Now",
                    })}
                </button>
            </div>
            {#if pendingResetDate}
                <div class="pending-reset">
                    {$t("widgets.eventTimer.resetAfterClose", {
                        default: "Will apply after closing editor",
                    })}
                </div>
            {/if}
        </div>

        <!-- Reset Date Picker -->
        <div class="field span-2">
            <label for="timer-reset-date">
                {$t("widgets.eventTimer.resetDate", {
                    default: "Reset Date",
                })}
            </label>
            <input
                id="timer-reset-date"
                type="date"
                value={toDateInputValue(
                    pendingResetDate ?? settings.lastResetDate,
                )}
                onchange={(e) =>
                    handleResetDateChange(
                        (e.currentTarget as HTMLInputElement).value,
                    )}
            />
        </div>

        <!-- Toggles -->
        <div class="toggle-row span-2">
            <div class="field checkbox">
                <input
                    id="show-name"
                    type="checkbox"
                    bind:checked={settings.showName}
                />
                <label for="show-name">
                    {$t("widgets.eventTimer.showName", {
                        default: "Show Name",
                    })}
                </label>
            </div>
            <div class="field checkbox">
                <input
                    id="show-unit"
                    type="checkbox"
                    bind:checked={settings.showUnit}
                />
                <label for="show-unit">
                    {$t("widgets.eventTimer.showUnit", {
                        default: "Show Unit",
                    })}
                </label>
            </div>
        </div>

        <!-- Positions & Sizes -->
        <div class="field span-2">
            <label>
                {$t("widgets.eventTimer.positions", {
                    default: "Text Positions",
                })}
            </label>
            <div class="position-grid">
                <div class="pos-head"></div>
                <div class="pos-head">
                    {$t("widgets.eventTimer.posX", { default: "X" })}
                </div>
                <div class="pos-head">
                    {$t("widgets.eventTimer.posY", { default: "Y" })}
                </div>
                <div class="pos-head">
                    {$t("widgets.eventTimer.fontSize", {
                        default: "Font (px)",
                    })}
                </div>

                <div class="pos-label">
                    {$t("widgets.eventTimer.positionName", { default: "Name" })}
                </div>
                <input
                    type="number"
                    min="0"
                    max="100"
                    bind:value={settings.namePosition.x}
                />
                <input
                    type="number"
                    min="0"
                    max="100"
                    bind:value={settings.namePosition.y}
                />
                <input type="number" bind:value={settings.nameFontSize} />

                <div class="pos-label">
                    {$t("widgets.eventTimer.positionValue", {
                        default: "Value",
                    })}
                </div>
                <input
                    type="number"
                    min="0"
                    max="100"
                    bind:value={settings.daysRemainingPosition.x}
                />
                <input
                    type="number"
                    min="0"
                    max="100"
                    bind:value={settings.daysRemainingPosition.y}
                />
                <input
                    type="number"
                    bind:value={settings.daysRemainingFontSize}
                />

                <div class="pos-label">
                    {$t("widgets.eventTimer.positionUnit", { default: "Unit" })}
                </div>
                <input
                    type="number"
                    min="0"
                    max="100"
                    bind:value={settings.unitPosition.x}
                />
                <input
                    type="number"
                    min="0"
                    max="100"
                    bind:value={settings.unitPosition.y}
                />
                <input type="number" bind:value={settings.unitFontSize} />
            </div>
        </div>
    </div>
</div>

<style>
    .settings-group {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .settings-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.9rem 1.1rem;
    }

    .span-2 {
        grid-column: span 2;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .field.checkbox {
        flex-direction: row;
        align-items: center;
        gap: 0.75rem;
    }

    .field.checkbox input {
        width: auto;
        margin: 0;
    }

    .inline-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 90px;
        gap: 0.5rem;
        align-items: center;
    }

    .color-row {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .color-row input[type="color"] {
        width: 48px;
        height: 36px;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
    }

    label {
        font-size: 0.85rem;
        color: var(--text-secondary);
        font-weight: 500;
    }

    input[type="text"],
    input[type="number"],
    select {
        padding: 0.6rem 0.7rem;
        background: var(--bg-input, #f5f5f5);
        border: 1px solid var(--border-input, #e0e0e0);
        border-radius: 8px;
        color: var(--text-primary);
        font-size: 0.95rem;
        width: 100%;
        box-sizing: border-box;
    }

    .toggle-row {
        display: flex;
        align-items: center;
        gap: 1.25rem;
    }

    .last-reset-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0.75rem;
        background: var(--bg-surface-mixed, rgba(0, 0, 0, 0.05));
        border-radius: 8px;
        border: 1px solid var(--border-input, rgba(0, 0, 0, 0.1));
    }

    .date-display {
        font-family: monospace;
        color: var(--text-primary);
        font-size: 0.9rem;
    }

    .btn-secondary {
        background: var(--bg-chip, rgba(0, 0, 0, 0.1));
        border: none;
        border-radius: 6px;
        padding: 0.4rem 0.8rem;
        font-size: 0.85rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        color: var(--text-primary);
        transition: background 0.2s;
    }

    .btn-secondary:hover {
        background: var(--bg-hover, rgba(0, 0, 0, 0.2));
    }

    .pending-reset {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 0.35rem;
    }

    .position-grid {
        display: grid;
        grid-template-columns: 90px repeat(3, minmax(0, 1fr));
        gap: 0.45rem 0.6rem;
        align-items: center;
        padding: 0.75rem;
        border: 1px solid var(--border-input, #e0e0e0);
        border-radius: 10px;
        background: var(--bg-input, #f5f5f5);
    }

    .pos-head {
        font-size: 0.75rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    .pos-label {
        font-size: 0.85rem;
        color: var(--text-secondary);
    }

    .position-grid input[type="number"] {
        padding: 0.45rem 0.5rem;
        font-size: 0.9rem;
    }

    :global(body.dark) input,
    :global(body.dark) select {
        background: rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.1);
    }

    @media (max-width: 720px) {
        .settings-grid {
            grid-template-columns: 1fr;
        }

        .span-2 {
            grid-column: span 1;
        }

        .position-grid {
            grid-template-columns: 1fr;
        }

        .pos-head {
            display: none;
        }
    }
</style>
