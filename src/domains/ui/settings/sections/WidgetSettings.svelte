<script lang="ts">
  import { t } from "svelte-i18n";
  import { clockSettings } from "../../widgets/clockStore";

  import Section from "../Section.svelte";
  import Switch from "../controls/Switch.svelte";
  import WeatherSettings from "./WeatherSettings.svelte";
</script>

<Section
  title={$t("settings.widgets.title")}
  description={$t("settings.widgets.description")}
  initiallyOpen={true}
>
  <!-- CLOCK SUBSECTION -->
  <div class="subsection-title">{$t("settings.widgets.clock")}</div>
  <Switch
    label={$t("settings.widgets.showDate")}
    bind:checked={$clockSettings.showDate}
  />
  <Switch
    label={$t("settings.widgets.showSeconds")}
    bind:checked={$clockSettings.showSeconds}
  />

  <div class="divider"></div>
  <WeatherSettings />
</Section>

<style>
  .divider {
    height: 1px;
    background: var(--border-divider);
    margin: 1.5rem 0;
  }
  .subsection-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin: 1.5rem 0 1rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Removed unused styles for control-row, label, select, actions, btn, note */
</style>
