<script lang="ts">
  import { t } from "svelte-i18n";
  import { clockSettings } from "../../widgets/clockStore";

  import Section from "../Section.svelte";
  import Switch from "../controls/Switch.svelte";
  import WeatherSettings from "./WeatherSettings.svelte";
  import CameraSourceDialog from "../../settings/CameraSourceDialog.svelte";
  import { cameraSettings } from "../../widgets/cameraStore";

  let showCameraDialog = $state(false);

  function saveCameraConfig(config: any) {
    cameraSettings.updateSourceConfig(config);
    showCameraDialog = false;
  }
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

  <div class="divider"></div>
  <div class="subsection-title">
    {$t("settings.widgets.camera", { default: "Camera" })}
  </div>
  <button class="btn secondary" onclick={() => (showCameraDialog = true)}>
    <iconify-icon icon="mdi:cctv"></iconify-icon>
    {$t("settings.widgets.configureCamera", { default: "Configure Source" })}
  </button>
</Section>

{#if showCameraDialog}
  <CameraSourceDialog
    currentConfig={$cameraSettings.cameraSourceConfig}
    onSave={saveCameraConfig}
    onClose={() => (showCameraDialog = false)}
  />
{/if}

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

  .btn {
    width: 100%;
    padding: 10px;
    background: var(--bg-card);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 0.9rem;
    transition: all 0.2s;
  }
  .btn:hover {
    background: var(--bg-card-hover);
  }

  /* Removed unused styles for control-row, label, select, actions, btn, note */
</style>
