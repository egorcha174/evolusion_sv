
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { t } from 'svelte-i18n';
  import { isSettingsOpen } from '../store';
  import { usePersistedWidth } from '../composables/usePersistedWidth.svelte';
  
  // Sections
  import ConnectionSettings from './sections/ConnectionSettings.svelte';
  import ThemeSettings from './sections/ThemeSettings.svelte';
  import WidgetSettings from './sections/WidgetSettings.svelte';
  import DataManagement from './sections/DataManagement.svelte';
  
  import 'iconify-icon';

  const STORAGE_KEY_WIDTH = 'evolusion_settings_width';
  
  // Use composable for resizing logic
  const resizer = usePersistedWidth(STORAGE_KEY_WIDTH, 420);

  function close() {
    isSettingsOpen.set(false);
  }
</script>

{#if $isSettingsOpen}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="backdrop" onclick={close}></div>

  <!-- Drawer -->
  <aside 
    class="settings-drawer" 
    style="width: {resizer.width}px"
    transition:fly={{ x: 400, duration: 300, opacity: 1 }}
  >
    <!-- Resize Handle -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
      class="resize-handle" 
      class:active={resizer.isResizing}
      onmousedown={resizer.startResize}
    ></div>

    <header class="drawer-header">
      <h2>{$t('settings.title')}</h2>
      <button class="close-btn" onclick={close} aria-label="Close settings">
        <iconify-icon icon="mdi:close" width="24"></iconify-icon>
      </button>
    </header>

    <div class="drawer-content">
      <div class="scroll-inner">
        <ConnectionSettings />
        <ThemeSettings />
        <WidgetSettings />
        <DataManagement />

        <div class="footer-info">
          Evolusion v0.0.1
        </div>
      </div>
    </div>
  </aside>
{/if}

<style>
  .backdrop {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: transparent;
    z-index: 2000;
  }

  .settings-drawer {
    position: fixed;
    top: 0;
    right: 0;
    max-width: 100vw;
    height: 100%;
    max-height: 100dvh;
    
    /* --- FORCE NEUTRAL LIGHT THEME (ISOLATION) --- */
    /* This ensures the settings panel is always legible regardless of the active global theme */
    
    /* Backgrounds */
    --bg-page: #F2F2F7;
    --bg-panel: #FFFFFF;
    --bg-card: #FFFFFF;
    --bg-card-hover: #F2F2F7;
    --bg-secondary: #F9F9F9;
    --bg-input: #FFFFFF;
    --bg-header: #F9F9F9;
    --bg-chip: #E5E5EA;
    --bg-chip-active: #D1D1D6;
    --bg-sidebar: #F2F2F7;
    
    /* Text */
    --text-primary: #1C1C1E;
    --text-secondary: #636366;
    --text-muted: #AEAEB2;
    --text-on-accent: #FFFFFF;
    
    /* Borders */
    --border-primary: #E5E5EA;
    --border-divider: #C7C7CC;
    --border-input: #D1D1D6;
    --border-focus: #007AFF;
    
    /* Accents (Neutral Blue Default) */
    --accent-primary: #007AFF;
    --accent-secondary: #5856D6;
    --accent-success: #34C759;
    --accent-warning: #FF9500;
    --accent-error: #FF3B30;
    --accent-info: #007AFF;
    
    /* Apply base styles */
    background: var(--bg-page);
    color: var(--text-primary);
    
    box-shadow: -4px 0 24px rgba(0,0,0,0.15);
    z-index: 2001;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--border-primary);
    transition: width 0.05s linear;
  }
  
  .resize-handle {
    position: absolute;
    top: 0;
    left: -6px;
    width: 12px;
    height: 100%;
    cursor: col-resize;
    z-index: 2005;
    background: transparent;
    transition: background 0.2s;
  }
  
  .resize-handle:hover, .resize-handle.active {
    background: linear-gradient(to right, transparent 40%, var(--accent-primary) 40%, var(--accent-primary) 60%, transparent 60%);
  }
  
  :global(body.rtl) .resize-handle { left: auto; right: -6px; }
  :global(body.rtl) .settings-drawer { right: auto; left: 0; border-left: none; border-right: 1px solid var(--border-primary); box-shadow: 4px 0 24px rgba(0,0,0,0.15); }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-divider);
    background: var(--bg-header); 
    flex-shrink: 0;
  }

  .drawer-header h2 { margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--text-primary); }
  .close-btn { background: transparent; border: none; cursor: pointer; color: var(--text-secondary); padding: 8px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .close-btn:hover { background: var(--bg-chip); color: var(--text-primary); }

  .drawer-content {
    flex: 1 1 auto;
    overflow-y: auto;
    overflow-x: hidden;
    height: 0;
    scrollbar-width: thin;
    scrollbar-color: var(--border-input) transparent;
  }
  
  .scroll-inner { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; min-height: min-content; }

  .footer-info { text-align: center; color: var(--text-muted); font-size: 0.75rem; margin-top: auto; padding-top: 1rem; }

  @media (max-width: 480px) {
    .settings-drawer { width: 100vw; max-width: 100vw; }
    .resize-handle { display: none; }
  }
</style>
