<script module lang="ts">
  // Helper for cubic-bezier in transition
  function cubicUtil(a: number, b: number, c: number, d: number) {
    return (t: number) => {
      // Simple approximations for standard svelte ease,
      // but for now we just return t since Svelte 'easing' prop expects a function
      // If we want real spring bounce we need a custom ease function or stick to svelte/easing
      return t;
    };
  }
</script>

<script lang="ts">
  import { fly } from "svelte/transition";
  import { t } from "svelte-i18n";
  import { isSettingsOpen } from "../store";
  import { usePersistedWidth } from "../composables/usePersistedWidth.svelte";

  // Sections
  import ConnectionSettings from "./sections/ConnectionSettings.svelte";
  import SecuritySettings from "./sections/SecuritySettings.svelte";
  import ThemeSettings from "./sections/ThemeSettings.svelte";
  import WeatherSettings from "./sections/WeatherSettings.svelte";
  import WidgetSettings from "./sections/WidgetSettings.svelte";
  import BackgroundSettings from "./BackgroundSettings.svelte";
  import DataManagement from "./sections/DataManagement.svelte";

  import { activeScheme } from "../theme/store";
  import { demoStore } from "../../app/demoStore";
  import "iconify-icon";

  let isDemoActive = $derived($demoStore.isActive);

  function toggleDemo() {
    if (isDemoActive) {
      demoStore.disable();
    } else {
      demoStore.enable();
    }
  }

  $effect(() => {
    console.log("SettingsDrawer: $isSettingsOpen changed to:", $isSettingsOpen);
  });

  const STORAGE_KEY_WIDTH = "evolusion_settings_width";

  // Use composable for resizing logic
  const resizer = usePersistedWidth(STORAGE_KEY_WIDTH, 500); // Default wider for centered modal

  function close() {
    isSettingsOpen.set(false);
  }
</script>

{#if $isSettingsOpen}
  <!-- Removed Backdrop to allow interaction with dashboard while settings are open -->
  <!-- Immersive Floating Panel - Side Drawer -->
  <aside
    class="settings-panel glass-panel"
    style="width: {resizer.width}px; color: {$activeScheme.textPrimary ??
      'inherit'}"
    transition:fly={{
      x: 300,
      duration: 300,
      opacity: 1,
      easing: cubicUtil(0.25, 1, 0.5, 1),
    }}
  >
    <!-- Resize Handle (Left Side for Right Drawer) -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="resize-handle"
      class:active={resizer.isResizing}
      onmousedown={resizer.startResize}
    ></div>

    <header class="panel-header">
      <div class="header-content">
        <h2>{$t("settings.title")}</h2>
        <span class="version-badge">v0.0.1</span>
      </div>
      <button
        class="close-btn"
        onclick={close}
        aria-label={$t("common.closeSettings")}
      >
        <iconify-icon icon="mdi:close" width="24"></iconify-icon>
      </button>
    </header>

    <div class="panel-content custom-scrollbar">
      <div class="scroll-inner">
        <ConnectionSettings />
        <SecuritySettings />
        <ThemeSettings />
        <WidgetSettings />
        <!-- TEMP: Demo Mode Toggle (remove after design phase) -->
        <section class="settings-section demo-section">
          <div class="section-header">
            <div class="section-icon demo-icon">
              <iconify-icon icon="mdi:flask-outline" width="20"></iconify-icon>
            </div>
            <div>
              <h3>Demo Mode <span class="temp-badge">⚠ TEMP</span></h3>
              <p class="section-desc">
                Заполнить дашборд фейковыми устройствами
              </p>
            </div>
          </div>
          <button
            class="demo-toggle"
            class:active={isDemoActive}
            onclick={toggleDemo}
          >
            <iconify-icon
              icon={isDemoActive ? "mdi:stop-circle" : "mdi:play-circle"}
              width="20"
            ></iconify-icon>
            {isDemoActive ? "Выключить демо" : "Включить демо"}
          </button>
        </section>

        <DataManagement />
      </div>
    </div>
  </aside>
{/if}

<style>
  /* Removed .backdrop style */

  .settings-panel {
    position: fixed;
    top: 0;
    right: 0;
    /* Removed transform centering */

    height: 100vh;
    box-sizing: border-box;
    /* Max width limiting might not be needed if user resizes, but keeps sanity */
    max-width: 90vw;

    /* Glass Effect */
    background: var(--bg-panel, rgba(255, 255, 255, 0.85));
    border-left: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    /* Removed border-radius for side panel feel */
    border-radius: 0;

    display: flex;
    flex-direction: column;
    z-index: calc(var(--z-modal) + 1);
    box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15); /* Shadow on the left */
    overflow: hidden;
  }

  .resize-handle {
    position: absolute;
    top: 0;
    left: 0; /* Changed from right to left */
    width: 6px; /* Thinner visual handle, maybe increase touch area if needed */
    height: 100%;
    cursor: col-resize;
    z-index: 2005;
    background: transparent;
  }

  .resize-handle:hover,
  .resize-handle.active {
    background: var(--accent-primary, rgba(33, 150, 243, 0.5));
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 1.5rem;
    border-bottom: 1px solid var(--border-divider, rgba(255, 255, 255, 0.1));
    flex-shrink: 0;

    /* Header Glass Effect */
    background: rgba(255, 255, 255, 0.02);
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: -0.5px;
    color: var(--text-primary);
  }

  .version-badge {
    font-size: 0.75rem;
    padding: 2px 8px;
    background: var(--bg-chip, rgba(0, 0, 0, 0.1));
    border-radius: 12px;
    color: var(--text-secondary);
    font-family: monospace;
  }

  .close-btn {
    background: rgba(0, 0, 0, 0.05);
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    width: 32px; /* Slightly smaller */
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .close-btn:hover {
    background: var(--accent-error);
    color: white;
    transform: rotate(90deg);
  }

  .panel-content {
    flex: 1 1 auto;
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
  }

  /* Custom scrollbar for the panel */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .scroll-inner {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  @media (max-width: 600px) {
    .settings-panel {
      width: 100vw !important;
      height: 100vh;
      max-height: none;
      max-width: none;
      border-right: none;
      border-left: none;
    }
    .resize-handle {
      display: none;
    }
  }

  /* TEMP: Demo Mode styles */
  .demo-section {
    padding: 1rem;
    background: var(--glass-surface, rgba(255, 255, 255, 0.05));
    border-radius: 12px;
    border: 1px dashed var(--accent-warning, #ff9800);
  }
  .section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
  .section-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-chip, rgba(0, 0, 0, 0.1));
    color: var(--text-secondary);
  }
  .demo-icon {
    background: rgba(255, 152, 0, 0.15);
    color: var(--accent-warning, #ff9800);
  }
  .section-header h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .section-desc {
    margin: 2px 0 0;
    font-size: 0.8rem;
    color: var(--text-secondary);
  }
  .temp-badge {
    font-size: 0.65rem;
    padding: 1px 6px;
    background: rgba(255, 152, 0, 0.2);
    color: var(--accent-warning, #ff9800);
    border-radius: 4px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
  .demo-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    border-radius: 8px;
    border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    background: var(--glass-surface, rgba(255, 255, 255, 0.05));
    color: var(--text-primary);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .demo-toggle:hover {
    background: var(--bg-chip, rgba(0, 0, 0, 0.1));
  }
  .demo-toggle.active {
    background: rgba(255, 152, 0, 0.15);
    border-color: var(--accent-warning, #ff9800);
    color: var(--accent-warning, #ff9800);
  }
</style>
