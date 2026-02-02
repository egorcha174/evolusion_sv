<script lang="ts">
    import {
        weatherSettings,
        refreshWeatherConfig,
        saveSettings,
    } from "$lib/weather/store";
    import { t } from "svelte-i18n";
    import { slide } from "svelte/transition";

    import Section from "../Section.svelte";
    import Select from "../controls/Select.svelte";
    import LabeledInput from "../controls/LabeledInput.svelte";
    import Switch from "../controls/Switch.svelte";
    import RangeInput from "../controls/RangeInput.svelte";
    import "iconify-icon";

    // Options for selects
    const providerOptions = [
        { label: "Open-Meteo (Free)", value: "openmeteo" },
        { label: "OpenWeatherMap", value: "openweathermap" },
        { label: "Yandex Weather", value: "yandex" },
        { label: "Home Assistant", value: "homeassistant" },
    ];

    const iconPackOptions = [
        { label: "Default (Material)", value: "default" },
        { label: "Outline", value: "outline" },
        { label: "Filled", value: "filled" },
    ];

    const layoutOptions = [
        { label: "Vertical", value: "vertical" }, // TODO: Translate
        { label: "Horizontal", value: "horizontal" },
    ];

    function handleRefresh() {
        refreshWeatherConfig();
    }
</script>

<Section
    title={$t("settings.weather.title") || "Weather Settings"}
    description={$t("settings.weather.desc") ||
        "Configure weather provider and display"}
    initiallyOpen={false}
>
    <!-- PROVIDER SECTION -->
    <div class="subsection-title">
        {$t("settings.weather.provider") || "Provider"}
    </div>

    <Select
        label={$t("settings.weather.provider_type") || "Provider Type"}
        bind:value={$weatherSettings.provider}
        options={providerOptions}
        onchange={handleRefresh}
    />

    {#if $weatherSettings.provider === "openweathermap"}
        <div transition:slide>
            <div class="info-box">
                <iconify-icon icon="mdi:information"></iconify-icon>
                <span>
                    OpenWeatherMap requires an API key.
                    <a href="https://openweathermap.org/api" target="_blank"
                        >Get key</a
                    >
                </span>
            </div>
            <LabeledInput
                label="API Key"
                bind:value={$weatherSettings.apiKey as string}
                placeholder="Enter OW key"
                type="password"
            />
        </div>
    {/if}

    {#if $weatherSettings.provider === "yandex"}
        <div transition:slide>
            <div class="info-box">
                <iconify-icon icon="mdi:information"></iconify-icon>
                <span>
                    Yandex Weather requires an API key.
                    <a href="https://yandex.ru/dev/weather/" target="_blank"
                        >Get key</a
                    >
                </span>
            </div>
            <LabeledInput
                label="API Key"
                bind:value={$weatherSettings.apiKey as string}
                placeholder="Enter Yandex key"
                type="password"
            />
        </div>
    {/if}

    <div class="control-row">
        <!-- Manual input for refresh interval since RangeInput might be too small range -->
        <!-- Using LabeledInput for number -->
        <LabeledInput
            label={$t("settings.weather.refresh_interval") ||
                "Refresh Interval (min)"}
            bind:value={$weatherSettings.refreshIntervalMinutes}
            type="number"
            hint="Min: 1, Max: 60"
        />
        <!-- We trigger refresh on interval change? Maybe not needed immediately -->
    </div>

    <div class="divider"></div>

    <!-- LOCATION SECTION -->
    <div class="subsection-title">
        {$t("settings.weather.location") || "Location"}
    </div>

    <Switch
        label={$t("settings.weather.use_custom_location") ||
            "Use Custom Location"}
        bind:checked={$weatherSettings.useCustomLocation}
        onchange={handleRefresh}
    />

    {#if $weatherSettings.useCustomLocation}
        <div transition:slide>
            <div class="control-row-duo">
                <LabeledInput
                    label="Latitude"
                    bind:value={$weatherSettings.latitude}
                    type="number"
                    placeholder="51.5074"
                />
                <LabeledInput
                    label="Longitude"
                    bind:value={$weatherSettings.longitude}
                    type="number"
                    placeholder="-0.1278"
                />
            </div>
            <button
                class="btn secondary small"
                onclick={handleRefresh}
                style="margin-top: 5px;"
            >
                <iconify-icon icon="mdi:map-marker-check"></iconify-icon>
                Update Coords
            </button>
        </div>
    {/if}

    <div class="divider"></div>

    <!-- DISPLAY SECTION -->
    <div class="subsection-title">
        {$t("settings.weather.display") || "Display"}
    </div>

    <Select
        label={$t("settings.weatherIconPack") || "Icon Pack"}
        bind:value={$weatherSettings.iconPack}
        options={iconPackOptions}
    />

    <Switch
        label={$t("settings.weather.show_forecast") || "Show Forecast"}
        bind:checked={$weatherSettings.showForecast}
    />

    {#if $weatherSettings.showForecast}
        <div transition:slide>
            <RangeInput
                label={$t("settings.weather.forecast_days") || "Forecast Days"}
                bind:value={$weatherSettings.forecastDays}
                min={1}
                max={7}
            />

            <Select
                label={$t("settings.weather.layout") || "Layout"}
                bind:value={$weatherSettings.forecastLayout}
                options={layoutOptions}
            />
        </div>
    {/if}

    <div class="divider"></div>

    <!-- APPEARANCE (SIZES) -->
    <div class="subsection-title">
        {$t("settings.weather.appearance") || "Appearance"}
    </div>

    <RangeInput
        label={$t("settings.weather.icon_size") || "Current Icon Size"}
        bind:value={$weatherSettings.currentIconSize}
        min={32}
        max={128}
        unit="px"
    />

    <RangeInput
        label={$t("settings.weather.temp_size") || "Current Temp Size"}
        bind:value={$weatherSettings.currentTempSize}
        min={20}
        max={96}
        unit="px"
    />

    <div class="actions">
        <button class="btn secondary" onclick={refreshWeatherConfig}>
            <iconify-icon icon="mdi:refresh"></iconify-icon>
            {$t("settings.updateWeather") || "Force Update"}
        </button>
    </div>
</Section>

<style>
    .subsection-title {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-secondary);
        margin: 1.5rem 0 0.75rem 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .divider {
        height: 1px;
        background: var(--border-divider);
        margin: 1.5rem 0;
    }

    .info-box {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.75rem;
        background: var(--bg-info, rgba(33, 150, 243, 0.1));
        border-radius: 6px;
        font-size: 0.85rem;
        color: var(--text-info, #2196f3);
        margin-bottom: 1rem;
    }

    .info-box a {
        color: inherit;
        text-decoration: underline;
        font-weight: 600;
    }

    .control-row-duo {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .actions {
        margin-top: 1.5rem;
        display: flex;
        justify-content: flex-end;
    }

    .btn {
        padding: 0.6rem 1rem;
        border-radius: 8px;
        border: none;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        transition: all 0.2s;
    }
    .btn.secondary {
        background: var(--bg-chip);
        color: var(--text-primary);
        border: 1px solid var(--border-primary);
    }
    .btn.secondary:hover {
        background: var(--bg-chip-active);
        border-color: var(--accent-primary);
    }
</style>
