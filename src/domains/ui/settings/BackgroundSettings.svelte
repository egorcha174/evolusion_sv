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
        backgroundStore.setEffect(value as BackgroundEffectType);
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
        value={$state.effectType}
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
</style>
