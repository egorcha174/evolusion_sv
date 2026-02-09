<script lang="ts">
    import { backgroundStore } from "$domains/ui/background/store";
    import type { BackgroundEffectType } from "$domains/ui/background/types";
    import { t } from "svelte-i18n";
    import { slide } from "svelte/transition";

    import Section from "./Section.svelte";
    import Select from "./controls/Select.svelte";
    import LabeledInput from "./controls/LabeledInput.svelte";
    import RangeInput from "./controls/RangeInput.svelte";
    import Switch from "./controls/Switch.svelte";

    const state = backgroundStore;

    // Derived to react to language changes
    let effects = $derived([
        { value: "auto", label: $t("settings.background.effects.auto") },
        { value: "none", label: $t("settings.background.effects.none") },
        { value: "aurora", label: $t("settings.background.effects.aurora") },
        { value: "snow", label: $t("settings.background.effects.snow") },
        { value: "rain", label: $t("settings.background.effects.rain") },
        { value: "clouds", label: $t("settings.background.effects.clouds") },
        { value: "river", label: $t("settings.background.effects.river") },
        {
            value: "thunderstorm",
            label: $t("settings.background.effects.thunderstorm"),
        },
        { value: "tron", label: $t("settings.background.effects.tron") },
        { value: "life", label: $t("settings.background.effects.life") },
        { value: "matrix", label: $t("settings.background.effects.matrix") },
        {
            value: "hyperspace",
            label: $t("settings.background.effects.hyperspace"),
        },
        {
            value: "sun-glare",
            label: $t("settings.background.effects.sun-glare"),
        },
        {
            value: "sun-clouds",
            label: $t("settings.background.effects.sun-clouds"),
        },
    ]);

    function handleEffectChange(value: any) {
        backgroundStore.setUserSelectedEffect(value as BackgroundEffectType);
    }

    function handleAuroraChange(field: string, value: any) {
        backgroundStore.updateAuroraSettings({ [field]: value });
    }
</script>

<Section
    title={$t("settings.background.title")}
    description={$t("settings.background.description", {
        default: "Customize dashboard background effects",
    })}
    initiallyOpen={false}
>
    <Select
        label={$t("settings.background.type")}
        value={$state.userSelectedEffect}
        options={effects}
        onchange={handleEffectChange}
    />

    {#if $state.effectType === "aurora"}
        <div transition:slide class="aurora-settings">
            <div class="subsection-title">
                {$t("settings.background.aurora.title")}
            </div>

            <div class="control-row-duo">
                <LabeledInput
                    label={$t("settings.background.aurora.color1")}
                    type="color"
                    value={$state.settings.aurora.color1}
                    oninput={(e: Event) =>
                        handleAuroraChange(
                            "color1",
                            (e.target as HTMLInputElement).value,
                        )}
                />
                <LabeledInput
                    label={$t("settings.background.aurora.color2")}
                    type="color"
                    value={$state.settings.aurora.color2}
                    oninput={(e: Event) =>
                        handleAuroraChange(
                            "color2",
                            (e.target as HTMLInputElement).value,
                        )}
                />
            </div>
            <LabeledInput
                label={$t("settings.background.aurora.color3")}
                type="color"
                value={$state.settings.aurora.color3}
                oninput={(e: Event) =>
                    handleAuroraChange(
                        "color3",
                        (e.target as HTMLInputElement).value,
                    )}
            />

            <RangeInput
                label={$t("settings.background.aurora.speed")}
                value={$state.settings.aurora.speed}
                min={10}
                max={40}
                step={1}
                unit="s"
                oninput={(e: Event) =>
                    handleAuroraChange(
                        "speed",
                        parseFloat((e.target as HTMLInputElement).value),
                    )}
            />

            <RangeInput
                label={$t("settings.background.aurora.intensity")}
                value={$state.settings.aurora.intensity}
                min={0.1}
                max={2}
                step={0.1}
                oninput={(e: Event) =>
                    handleAuroraChange(
                        "intensity",
                        parseFloat((e.target as HTMLInputElement).value),
                    )}
            />

            <RangeInput
                label={$t("settings.background.aurora.blur")}
                value={$state.settings.aurora.blur}
                min={0}
                max={40}
                step={2}
                unit="px"
                oninput={(e: Event) =>
                    handleAuroraChange(
                        "blur",
                        parseFloat((e.target as HTMLInputElement).value),
                    )}
            />

            <RangeInput
                label={$t("settings.background.aurora.saturation")}
                value={$state.settings.aurora.saturate}
                min={50}
                max={200}
                step={10}
                unit="%"
                oninput={(e: Event) =>
                    handleAuroraChange(
                        "saturate",
                        parseFloat((e.target as HTMLInputElement).value),
                    )}
            />

            <Switch
                label={$t("settings.background.aurora.show_stars")}
                checked={$state.settings.aurora.stars}
                onchange={(c: boolean) => handleAuroraChange("stars", c)}
            />

            {#if $state.settings.aurora.stars}
                <div transition:slide>
                    <RangeInput
                        label={$t("settings.background.aurora.star_speed")}
                        value={$state.settings.aurora.starSpeed}
                        min={3}
                        max={12}
                        step={1}
                        unit="s"
                        oninput={(e: Event) =>
                            handleAuroraChange(
                                "starSpeed",
                                parseFloat(
                                    (e.target as HTMLInputElement).value,
                                ),
                            )}
                    />
                </div>
            {/if}
        </div>
    {:else if $state.effectType === "tron"}
        <div transition:slide class="aurora-settings">
            <div class="subsection-title">
                {$t("settings.background.tron.title", {
                    default: "Tron Settings",
                })}
            </div>

            <LabeledInput
                label={$t("settings.background.tron.background_color", {
                    default: "Background Color",
                })}
                type="color"
                value={$state.settings.tron.backgroundColor}
                oninput={(e: Event) =>
                    backgroundStore.updateTronSettings({
                        backgroundColor: (e.target as HTMLInputElement).value,
                    })}
            />

            <RangeInput
                label={$t("settings.background.tron.max_beams", {
                    default: "Max Beams",
                })}
                value={$state.settings.tron.maxBeams}
                min={3}
                max={20}
                step={1}
                oninput={(e: Event) =>
                    backgroundStore.updateTronSettings({
                        maxBeams: parseInt(
                            (e.target as HTMLInputElement).value,
                        ),
                    })}
            />

            <RangeInput
                label={$t("settings.background.tron.beam_speed", {
                    default: "Beam Speed",
                })}
                value={$state.settings.tron.beamSpeed}
                min={1}
                max={10}
                step={0.5}
                oninput={(e: Event) =>
                    backgroundStore.updateTronSettings({
                        beamSpeed: parseFloat(
                            (e.target as HTMLInputElement).value,
                        ),
                    })}
            />

            <div class="subsection-title" style="margin-top: 1rem;">
                {$t("settings.background.tron.beam_colors", {
                    default: "Beam Colors",
                })}
            </div>

            <div class="color-grid">
                {#each $state.settings.tron.beamColors || [] as color, i}
                    <div class="color-item">
                        <input
                            type="color"
                            value={color}
                            oninput={(e) => {
                                const newColors = [
                                    ...($state.settings.tron.beamColors || []),
                                ];
                                newColors[i] = (
                                    e.target as HTMLInputElement
                                ).value;
                                backgroundStore.updateTronSettings({
                                    beamColors: newColors,
                                });
                            }}
                        />
                        <button
                            class="remove-color-btn"
                            onclick={() => {
                                const newColors = (
                                    $state.settings.tron.beamColors || []
                                ).filter((_, idx) => idx !== i);
                                if (newColors.length === 0)
                                    newColors.push("#00ffff"); // Prevent empty
                                backgroundStore.updateTronSettings({
                                    beamColors: newColors,
                                });
                            }}
                            aria-label="Remove color"
                        >
                            ×
                        </button>
                    </div>
                {/each}

                <button
                    class="add-color-btn"
                    onclick={() => {
                        const newColors = [
                            ...($state.settings.tron.beamColors || []),
                            "#ffffff",
                        ];
                        backgroundStore.updateTronSettings({
                            beamColors: newColors,
                        });
                    }}
                >
                    +
                </button>
            </div>
        </div>
    {:else if $state.effectType === "life"}
        <div transition:slide class="aurora-settings">
            <div class="subsection-title">
                {$t("settings.background.life.title", {
                    default: "Life Settings",
                })}
            </div>

            <LabeledInput
                label={$t("settings.background.life.background_color", {
                    default: "Background Color",
                })}
                type="color"
                value={$state.settings.life.backgroundColor}
                oninput={(e: Event) =>
                    backgroundStore.updateLifeSettings({
                        backgroundColor: (e.target as HTMLInputElement).value,
                    })}
            />

            <LabeledInput
                label={$t("settings.background.life.cell_color", {
                    default: "Cell Color",
                })}
                type="color"
                value={$state.settings.life.cellColor}
                oninput={(e: Event) =>
                    backgroundStore.updateLifeSettings({
                        cellColor: (e.target as HTMLInputElement).value,
                    })}
            />

            <RangeInput
                label={$t("settings.background.life.cell_size", {
                    default: "Cell Size",
                })}
                value={$state.settings.life.cellSize}
                min={5}
                max={30}
                step={1}
                oninput={(e: Event) =>
                    backgroundStore.updateLifeSettings({
                        cellSize: parseInt(
                            (e.target as HTMLInputElement).value,
                        ),
                    })}
            />

            <RangeInput
                label={$t("settings.background.life.update_interval", {
                    default: "Update Interval",
                })}
                value={$state.settings.life.updateInterval}
                min={50}
                max={500}
                step={10}
                oninput={(e: Event) =>
                    backgroundStore.updateLifeSettings({
                        updateInterval: parseInt(
                            (e.target as HTMLInputElement).value,
                        ),
                    })}
            />
        </div>
    {:else if $state.effectType === "matrix"}
        <div transition:slide class="aurora-settings">
            <div class="subsection-title">
                {$t("settings.background.matrix.title", {
                    default: "Matrix Settings",
                })}
            </div>

            <LabeledInput
                label={$t("settings.background.matrix.background_color", {
                    default: "Background Color",
                })}
                type="color"
                value={$state.settings.matrix.backgroundColor}
                oninput={(e: Event) =>
                    backgroundStore.updateMatrixSettings({
                        backgroundColor: (e.target as HTMLInputElement).value,
                    })}
            />

            <div class="control-row-duo">
                <LabeledInput
                    label={$t("settings.background.matrix.glyph_color", {
                        default: "Glyph Color",
                    })}
                    type="color"
                    value={$state.settings.matrix.glyphColor}
                    oninput={(e: Event) =>
                        backgroundStore.updateMatrixSettings({
                            glyphColor: (e.target as HTMLInputElement).value,
                        })}
                />
                <LabeledInput
                    label={$t("settings.background.matrix.glow_color", {
                        default: "Glow Color",
                    })}
                    type="color"
                    value={$state.settings.matrix.glowColor}
                    oninput={(e: Event) =>
                        backgroundStore.updateMatrixSettings({
                            glowColor: (e.target as HTMLInputElement).value,
                        })}
                />
            </div>

            <RangeInput
                label={$t("settings.background.matrix.font_size", {
                    default: "Font Size",
                })}
                value={$state.settings.matrix.fontSize}
                min={10}
                max={28}
                step={1}
                unit="px"
                oninput={(e: Event) =>
                    backgroundStore.updateMatrixSettings({
                        fontSize: parseInt(
                            (e.target as HTMLInputElement).value,
                        ),
                    })}
            />

            <RangeInput
                label={$t("settings.background.matrix.speed", {
                    default: "Speed",
                })}
                value={$state.settings.matrix.speed}
                min={0.25}
                max={1.5}
                step={0.1}
                oninput={(e: Event) =>
                    backgroundStore.updateMatrixSettings({
                        speed: parseFloat((e.target as HTMLInputElement).value),
                    })}
            />

            <RangeInput
                label={$t("settings.background.matrix.fade_strength", {
                    default: "Fade Strength",
                })}
                value={$state.settings.matrix.fadeStrength}
                min={0.02}
                max={0.2}
                step={0.01}
                oninput={(e: Event) =>
                    backgroundStore.updateMatrixSettings({
                        fadeStrength: parseFloat(
                            (e.target as HTMLInputElement).value,
                        ),
                    })}
            />

            <RangeInput
                label={$t("settings.background.matrix.density", {
                    default: "Density",
                })}
                value={$state.settings.matrix.density}
                min={0.5}
                max={1}
                step={0.05}
                oninput={(e: Event) =>
                    backgroundStore.updateMatrixSettings({
                        density: parseFloat(
                            (e.target as HTMLInputElement).value,
                        ),
                    })}
            />
        </div>
    {/if}
</Section>

<style>
    .subsection-title {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-secondary);
        margin: 1rem 0 0.75rem 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .aurora-settings {
        background: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
    }

    .control-row-duo {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .color-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 0.5rem;
    }

    .color-item {
        position: relative;
        display: flex;
        align-items: center;
    }

    .color-item input[type="color"] {
        width: 40px;
        height: 40px;
        padding: 0;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        background: none;
    }

    .remove-color-btn {
        position: absolute;
        top: -6px;
        right: -6px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--accent-error);
        color: white;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        cursor: pointer;
        opacity: 0.8;
    }

    .remove-color-btn:hover {
        opacity: 1;
    }

    .add-color-btn {
        width: 40px;
        height: 40px;
        border-radius: 6px;
        border: 2px dashed var(--border-primary);
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-secondary);
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .add-color-btn:hover {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
    }
</style>
