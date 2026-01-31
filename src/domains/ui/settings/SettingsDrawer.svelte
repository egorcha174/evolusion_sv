<script module>
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
  import { fly, scale } from "svelte/transition";
  import { t } from "svelte-i18n";
  import { isSettingsOpen } from "../store";
  import { usePersistedWidth } from "../composables/usePersistedWidth.svelte";

  // Sections
  import ConnectionSettings from "./sections/ConnectionSettings.svelte";
  import SecuritySettings from "./sections/SecuritySettings.svelte";
  import ThemeSettings from "./sections/ThemeSettings.svelte";
  import WidgetSettings from "./sections/WidgetSettings.svelte";
  import CameraSettings from "./sections/CameraSettings.svelte";
  import DataManagement from "./sections/DataManagement.svelte";

  import "iconify-icon";

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
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="backdrop"
    onclick={close}
    transition:fly={{ duration: 300, opacity: 0 }}
  ></div>

  <!-- Immersive Floating Panel -->
  <aside
    class="settings-panel glass-panel"
    style="width: {resizer.width}px"
    transition:scale={{
      start: 0.95,
      duration: 300,
      opacity: 0,
      easing: cubicUtil(0.34, 1.56, 0.64, 1),
    }}
  >
    <!-- Resize Handle (Right Side) -->
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
      <button class="close-btn" onclick={close} aria-label="Close settings">
        <iconify-icon icon="mdi:close" width="24"></iconify-icon>
      </button>
    </header>

    <div class="panel-content custom-scrollbar">
      <div class="scroll-inner">
        <ConnectionSettings />
        <SecuritySettings />
        <ThemeSettings />
        <WidgetSettings />
        <CameraSettings />
        <DataManagement />
      </div>
    </div>
  </aside>
{/if}

<style>
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    z-index: var(--z-modal);
  }

  .settings-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    height: 85vh;
    max-height: 800px;
    max-width: 95vw;

    /* Variable Override only for this panel if needed, but inheriting is better */
    /* We use the glass-panel class from app.css for the main background */

    /* Extra Glass Override for "Heavy" panel */
    background: var(--bg-panel, rgba(255, 255, 255, 0.85));

    /* If dark mode is active in the app, let it flow. 
       We removed the forced white theme variables here. */

    border-radius: 24px;
    display: flex;
    flex-direction: column;
    z-index: calc(var(--z-modal) + 1);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    overflow: hidden;
  }

  /* Ensure readability on top of glass */
  :global(.settings-panel) {
    /* Re-establish some baselines if the parent theme is transparent */
    --bg-card: rgba(255, 255, 255, 0.05);
    --bg-input: rgba(0, 0, 0, 0.05);
  }

  .resize-handle {
    position: absolute;
    top: 0;
    right: 0;
    width: 16px;
    height: 100%;
    cursor: col-resize;
    z-index: 2005;
    background: transparent;
  }

  .resize-handle:hover,
  .resize-handle.active {
    background: linear-gradient(
      to right,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
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
    font-size: 1.5rem;
    font-weight: 700;
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
    width: 36px;
    height: 36px;
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
    height: 100%; /* Important for centering content if little */
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
    padding: 2rem;
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
      border-radius: 0;
    }
    .resize-handle {
      display: none;
    }
  }
</style>
