<script lang="ts">
  import { t } from "svelte-i18n";
  import { dashboardStore } from "../app/dashboardStore";
  import { editorStore } from "./editor/store";
  import { untrack } from "svelte";
  import type { DashboardCardConfig } from "$lib/types";

  import BatteryMonitorSettings from "./widgets/settings/BatteryMonitorSettings.svelte";
  import EventTimerSettings from "./widgets/settings/EventTimerSettings.svelte";
  import DeviceSelector from "./editor/components/DeviceSelector.svelte";
  import CameraSourceSettings from "./settings/CameraSourceSettings.svelte";
  import type { CameraSourceConfig, HAEntity } from "$lib/types";
  import DeviceCard from "./DeviceCard.svelte";
  import {
    createBatteryWidgetEntity,
    createTimerWidgetEntity,
  } from "../ha/virtual-devices";
  import { cameraStore } from "$lib/stores/camera.store.svelte";

  let { card, onClose } = $props<{
    tabId: string; // Unused but kept for interface compat if needed later
    card: DashboardCardConfig;
    // Removed unused callbacks
    onEditTemplate?: any;
    onNewTemplate?: any;
    onClose: () => void;
  }>();

  // Get available templates from store
  let templates = $derived(Object.values($dashboardStore.templates || {}));

  // Local state for the selection (don't commit to store yet)
  let selectedTemplateId = $state<string | undefined>(
    untrack(() => card.templateId),
  );

  // Draft core props
  let tempWidgetType = $state(untrack(() => card.widgetType));
  let tempEntityId = $state(untrack(() => card.entityId));

  // Deep copy settings for editing
  let tempSettings = $state(
    card.settings ? JSON.parse(JSON.stringify(card.settings)) : {},
  );
  let pendingTimerResetDate = $state<string | null>(null);

  // Deep copy camera config for editing
  let tempCameraConfig = $state<CameraSourceConfig | undefined>(
    card.cameraSourceConfig
      ? JSON.parse(JSON.stringify(card.cameraSourceConfig))
      : card.widgetType === "camera"
        ? { sourceType: "go2rtc" }
        : undefined,
  );

  // Initialize selectedId from editor override if present
  $effect(() => {
    const override = $editorStore.templateOverrides.get(card.id);
    if (override !== undefined) {
      selectedTemplateId = override;
    }
  });

  function handleSave() {
    const tId =
      card.tabId ||
      $dashboardStore.tabs[card.tabId]?.id ||
      dashboardStore.findTabForCard(card.id);

    if (tId) {
      if (tempWidgetType === "event-timer" && pendingTimerResetDate) {
        tempSettings.lastResetDate = pendingTimerResetDate;
        pendingTimerResetDate = null;
      }
      // 0. Detect Type/Entity changes
      const typeChanged = tempWidgetType !== card.widgetType;
      const entityChanged = tempEntityId !== card.entityId;

      if (typeChanged || entityChanged) {
        // If switching to Widget (e.g. Camera)
        if (tempWidgetType === "camera") {
          // We need to ensure we save the config with the conversion or update
          dashboardStore.convertCardToCamera(tId, card.id, tempCameraConfig);
          // convertCardToCamera handles config save, so skip step 2 below?
          // Actually convertCardToCamera sets widgetType and config.
          // We should proceed to save other settings if needed.
        } else if (tempWidgetType && tempWidgetType !== "entity") {
          // Other widgets
          // We need a specific store method or generic update
          // Since we don't have a generic "convert", we do manual card update via replaceTabCards or updateCardEntity (if entity)
          // updateCardEntity is for entityId.

          // Manual update using what logic we had:
          const tab = $dashboardStore.tabs[tId];
          const updatedCards = tab.cards.map((c) => {
            if (c.id === card.id) {
              return {
                ...c,
                widgetType: tempWidgetType,
                entityId: undefined, // Clear entity if widget
                settings: tempSettings, // Save new settings
              };
            }
            return c;
          });
          dashboardStore.replaceTabCards(tId, updatedCards);
        } else {
          // Switching to Entity (tempWidgetType undefined or 'entity')
          // Use editorStore or dashboardStore?
          // Real application should use dashboardStore for final save.
          // editorStore.updateCardEntity uses editor logic.
          // Let's use editorStore if available, but here we are in 'save'
          if (tempEntityId) {
            editorStore.updateCardEntity(card.id, tempEntityId);
          }
        }
      }

      // 1. Save generic settings (if not handled by type change block above)
      // If we just did a full card replace, this might be redundant but harmless.
      if (Object.keys(tempSettings).length > 0) {
        dashboardStore.updateCardSettings(tId, card.id, tempSettings);
      }

      // 2. Save Camera Source Config (if updated and is camera)
      // If we used convertCardToCamera above, it's done.
      // If we didn't change type but updated config:
      if (tempWidgetType === "camera" && tempCameraConfig) {
        // Only if not just converted (optimization), but sticking to update is safer
        dashboardStore.updateCardCameraSource(tId, card.id, tempCameraConfig);
      }
    }

    // Save template
    if (!tempWidgetType || tempWidgetType === "entity") {
      editorStore.setCardTemplate(card.id, selectedTemplateId);
    }

    onClose();
  }

  function handleDeviceSelect(
    type: "entity" | "camera" | "widget",
    id: string,
  ) {
    if (type === "widget" || type === "camera") {
      // WIDGET SELECTION
      tempWidgetType = id; // 'camera' or 'event-timer' etc.
      tempEntityId = undefined;

      // Initialize defaults
      if (tempWidgetType === "camera") {
        if (!tempCameraConfig) {
          tempCameraConfig = {
            sourceType: "go2rtc",
            go2rtcUrl:
              window.location.protocol +
              "//" +
              window.location.hostname +
              ":1984",
            streamName: "",
          };
        }
      } else {
        tempCameraConfig = undefined;
      }

      // Reset settings roughly for new type (optional, but good UX)
      // tempSettings = {}; // Maybe keep settings? usually widgets have different settings schemas.

      setMode("settings");
    } else {
      // ENTITY SELECTION
      tempWidgetType = undefined; // standard card
      tempEntityId = id;
      tempCameraConfig = undefined;

      setMode("settings");
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  // Tabs for Device vs Settings
  let mode = $state<"settings" | "devices" | "widgets">("settings");

  function setMode(m: "settings" | "devices" | "widgets") {
    mode = m;
  }

  let lockWidgetType = $derived(
    !!card.widgetType && card.widgetType !== "entity",
  );
  let showWidgetPreview = $derived(
    tempWidgetType === "event-timer" || tempWidgetType === "battery-monitor",
  );

  $effect(() => {
    if (lockWidgetType && mode !== "settings") {
      mode = "settings";
    }
  });

  let previewTimerEntity = $derived.by(() => {
    if (tempWidgetType !== "event-timer") return null;
    return createTimerWidgetEntity(tempSettings as any);
  });

  $effect(() => {
    if (tempWidgetType !== "event-timer") {
      pendingTimerResetDate = null;
    }
  });

  let previewBatteryEntity = $derived.by(() => {
    if (tempWidgetType !== "battery-monitor") return null;
    const fakeEntities: HAEntity[] = [
      {
        entity_id: "sensor.battery_sensor_1",
        state: "15",
        attributes: {
          friendly_name: "Sensor 1",
          battery_level: 15,
          device_class: "battery",
        },
        context: { id: "preview", parent_id: null, user_id: null },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      },
      {
        entity_id: "sensor.battery_sensor_2",
        state: "58",
        attributes: {
          friendly_name: "Sensor 2",
          battery_level: 58,
          device_class: "battery",
        },
        context: { id: "preview", parent_id: null, user_id: null },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      },
      {
        entity_id: "sensor.battery_sensor_3",
        state: "92",
        attributes: {
          friendly_name: "Sensor 3",
          battery_level: 92,
          device_class: "battery",
        },
        context: { id: "preview", parent_id: null, user_id: null },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      },
    ];
    return createBatteryWidgetEntity(fakeEntities);
  });
</script>

<!-- Template is already replaced by previous step, styles below -->

<div class="card-settings-overlay" onclick={handleBackdropClick}>
  <div class="card-settings-modal wide">
    <!-- Header -->
    <div class="modal-header">
      <h3>{$t("cardSettings.title", { default: "Card Settings" })}</h3>
      <button class="close-btn" onclick={onClose}>
        <iconify-icon icon="mdi:close"></iconify-icon>
      </button>
    </div>

    <!-- Tabs -->
    {#if !lockWidgetType}
      <div class="modal-tabs">
        <button
          class="modal-tab"
          class:active={mode === "settings"}
          onclick={() => setMode("settings")}
        >
          {$t("cardSettings.tab_settings", { default: "Settings" })}
        </button>
        <button
          class="modal-tab"
          class:active={mode === "devices"}
          onclick={() => setMode("devices")}
        >
          {$t("cardSettings.tab_devices", { default: "Devices" })}
        </button>
        <button
          class="modal-tab"
          class:active={mode === "widgets"}
          onclick={() => setMode("widgets")}
        >
          {$t("cardSettings.tab_widgets", { default: "Widgets" })}
        </button>
      </div>
    {/if}

    <!-- Content -->
    <div class="modal-content">
      {#if mode === "settings"}
        {#if showWidgetPreview}
          <div class="settings-split">
            <div class="settings-panel">
              {#if tempWidgetType === "event-timer"}
                <EventTimerSettings
                  bind:settings={tempSettings}
                  bind:pendingResetDate={pendingTimerResetDate}
                />
              {:else if tempWidgetType === "battery-monitor"}
                <BatteryMonitorSettings bind:settings={tempSettings} />
              {/if}
            </div>
            <div class="preview-panel">
              <div class="preview-title">
                {$t("cardSettings.preview", { default: "Preview" })}
              </div>
              <div class="preview-card">
                {#if previewTimerEntity}
                  <DeviceCard entity={previewTimerEntity} />
                {:else if previewBatteryEntity}
                  <DeviceCard entity={previewBatteryEntity} />
                {/if}
              </div>
            </div>
          </div>
        {:else}
          <div class="settings-panel">
            {#if tempWidgetType === "camera"}
              <!-- Camera Settings -->
              {#if tempCameraConfig}
                <CameraSourceSettings bind:config={tempCameraConfig} />
              {/if}
            {:else}
              <!-- Template Selection for Entity Cards -->
              <div class="form-group">
                <label for="tpl-select">{$t("cardSettings.template")}</label>
                <select id="tpl-select" bind:value={selectedTemplateId}>
                  <option value={undefined}
                    >{$t("cardSettings.noTemplate")}</option
                  >
                  {#each templates as t}
                    <option value={t.id}>{t.name}</option>
                  {/each}
                </select>
                <p class="hint">{$t("cardSettings.manageHint")}</p>
              </div>
            {/if}
          </div>
        {/if}
      {:else if mode === "devices"}
        <div class="selector-panel">
          <DeviceSelector
            showTabs={false}
            activeTab="entities"
            onSelect={handleDeviceSelect}
          />
        </div>
      {:else if mode === "widgets"}
        <div class="selector-panel">
          <DeviceSelector
            showTabs={false}
            activeTab="widgets"
            onSelect={handleDeviceSelect}
          />
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <div class="modal-footer">
      <button class="btn text" onclick={onClose} type="button">
        {$t("common.cancel")}
      </button>
      <button class="btn primary" onclick={handleSave} type="button">
        {$t("common.save")}
      </button>
    </div>
  </div>
</div>

<style>
  .card-settings-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    z-index: 5000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-settings-modal {
    background: var(--bg-panel);
    border-radius: 12px;
    width: 320px; /* Base width */
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-modal);
    border: 1px solid var(--border-primary);
    pointer-events: auto;
    transition: width 0.2s;
    overflow: hidden;
  }

  .card-settings-modal.wide {
    width: min(900px, 92vw);
    height: min(720px, 92vh);
  }

  /* Header */
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-divider);
  }

  .modal-header h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    padding: 4px;
    border-radius: 50%;
  }
  .close-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  /* Tabs */
  .modal-tabs {
    display: flex;
    padding: 0 1.5rem;
    border-bottom: 1px solid var(--border-divider);
    background: var(--bg-surface-mixed); /* Slightly different bg if desired */
    gap: 1.5rem;
  }

  .modal-tab {
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 0.8rem 0;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
  }

  .modal-tab:hover {
    color: var(--text-primary);
  }

  .modal-tab.active {
    color: var(--accent-primary);
    border-bottom-color: var(--accent-primary);
  }

  /* Content */
  .modal-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
  }

  .settings-split {
    display: grid;
    grid-template-columns: 1fr 260px;
    gap: 1.5rem;
    align-items: start;
  }

  .preview-panel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .preview-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .preview-card {
    width: 240px;
    height: 240px;
    pointer-events: none;
  }

  @media (max-width: 900px) {
    .settings-split {
      grid-template-columns: 1fr;
    }
    .preview-card {
      width: 100%;
      height: 240px;
    }
  }

  .settings-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .selector-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0; /* Important for nested scroll */
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 500;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  select {
    width: 100%;
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--border-input);
    background: var(--bg-input);
    color: var(--text-primary);
    font-size: 1rem;
  }

  .hint {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin: 0;
  }

  /* Footer */
  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border-divider);
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    background: var(--bg-panel);
  }

  .btn {
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    border: none;
    font-weight: 500;
    cursor: pointer;
    font-size: 0.95rem;
  }

  .btn.primary {
    background: var(--accent-primary);
    color: white;
  }

  .btn.text {
    background: transparent;
    color: var(--text-secondary);
  }
  .btn.text:hover {
    color: var(--text-primary);
    background: var(--bg-chip);
  }
</style>
