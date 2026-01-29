

<script lang="ts">
  import { onMount } from 'svelte';
  import { t, locale } from 'svelte-i18n';
  import { haStore } from '../ha/store';
  import { sidebarWidth, loadUIState, saveUIState, isSettingsOpen } from './store';
  import { time } from '../app/time';
  import { clockSettings } from './widgets/clockStore';
  import { cameraSettings } from './widgets/cameraStore';
  import WeatherWidget from './widgets/WeatherWidget.svelte';
  import CameraWidget from './widgets/CameraWidget.svelte';
  
  // Resizing state
  let width = $state(280);
  let isResizing = $state(false);
  let isCollapsed = $state(false);

  onMount(() => {
    loadUIState();
    
    // Subscribe to store updates
    const unsub = sidebarWidth.subscribe(w => width = w);
    return () => {
      unsub();
    };
  });

  function startResize(e: MouseEvent) {
    e.preventDefault();
    isResizing = true;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResize);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isResizing) return;
    
    let newWidth;
    if (document.dir === 'rtl') {
       newWidth = window.innerWidth - e.clientX;
    } else {
       newWidth = e.clientX;
    }

    // Constraints
    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;
    
    width = newWidth;
  }

  function stopResize() {
    if (isResizing) {
      isResizing = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      saveUIState(width);
    }
  }

  function getLatencyColor(ms: number | undefined): string {
    if (ms === undefined) return 'var(--text-muted)';
    if (ms < 50) return 'var(--accent-success)';
    if (ms < 150) return 'var(--accent-warning)';
    return 'var(--accent-error)';
  }

  // Clock Derived State
  let timeStr = $derived($time.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: $clockSettings.showSeconds ? '2-digit' : undefined
  }));
  
  let dateStr = $derived($time.toLocaleDateString($locale || 'en', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
  }));

  // Find the selected camera entity from the main store
  let selectedCamera = $derived(
    $cameraSettings.selectedEntityId
      ? $haStore.entities.get($cameraSettings.selectedEntityId)
      : undefined,
  );
</script>

<aside class="sidebar" style="width: {width}px" class:collapsed={isCollapsed}>
  <!-- Resize Handle -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="resize-handle" 
    class:active={isResizing}
    onmousedown={startResize}
  ></div>

  <div class="sidebar-content">
    <!-- Widget: Clock -->
    <div class="widget clock-widget">
      <div class="time">{timeStr}</div>
      {#if $clockSettings.showDate}
        <div class="date">{dateStr}</div>
      {/if}
    </div>

    <!-- Widget: Weather -->
    <WeatherWidget />

    <!-- Widget: Camera -->
    <div class="widget camera-widget">
      <CameraWidget entity={selectedCamera} />
    </div>

    <!-- Status Info (Bottom) -->
    <div class="status-info">
      <div class="status-row">
        {#if $haStore.isConnected}
            <div class="status-dot connected"></div>
            <span class="status-text">{$t('sidebar.connected')}</span>
            {#if $haStore.latency !== undefined}
              <span class="latency" style="color: {getLatencyColor($haStore.latency)}">
                ({$haStore.latency}ms)
              </span>
            {/if}
        {:else if $haStore.isLoading}
            <div class="status-dot loading"></div>
            <span class="status-text">{$t('sidebar.connecting')}</span>
        {:else}
            <div class="status-dot disconnected"></div>
            <span class="status-text">{$t('sidebar.offline')}</span>
        {/if}
      </div>
    </div>
      <!-- Footer -->
    <div class="sidebar-footer">
      <button
        class="footer-btn"
        onclick={() => {
          console.log('Sidebar: Settings button clicked!');
          isSettingsOpen.set(true);
        }}
        title={$t("settings.title")}
      >
        <iconify-icon icon="mdi:cog"></iconify-icon>
      </button>
      <div class="divider"></div>
      <button class="footer-btn" title="Evolusion">
        <iconify-icon icon="mdi:information-outline"></iconify-icon>
      </button>
      <button
        class="footer-btn"
        id="collapse-btn"
        onclick={() => (isCollapsed = !isCollapsed)}
        title="Collapse"
      >
        <iconify-icon icon="mdi:chevron-left"></iconify-icon>
      </button>
    </div>
  </div>
</aside>

<style>
  .sidebar {
    position: relative;
    height: 100%;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border-primary);
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    overflow-y: auto;
    z-index: 50;
    color: var(--text-secondary);
    box-shadow: 2px 0 10px rgba(0,0,0,0.02);
    flex-shrink: 0;
    transition: width 0.05s linear;
    overflow-x: hidden;
  }
  
  :global(body.rtl) .sidebar {
    border-right: none;
    border-left: 1px solid var(--border-primary);
  }

  .sidebar.collapsed {
    width: 0 !important;
    padding: 0;
    overflow: hidden;
    border-right-color: transparent;
  }

  .sidebar.collapsed #collapse-btn iconify-icon {
    transform: rotate(180deg);
  }

  .sidebar-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    min-width: calc(240px - 3rem); /* 240px is min width, 3rem is padding */
  }

  .resize-handle {
    position: absolute;
    top: 0;
    right: -6px; /* Center over the border */
    width: 12px; /* Easy to grab */
    height: 100%;
    cursor: col-resize;
    z-index: 60;
    background: transparent;
    transition: background 0.2s;
  }
  
  :global(body.rtl) .resize-handle {
    right: auto;
    left: -6px;
  }
  
  /* Show line on hover/active to guide user */
  .resize-handle:hover, .resize-handle.active {
    background: linear-gradient(to right, transparent 45%, var(--accent-primary) 45%, var(--accent-primary) 55%, transparent 55%);
  }

  /* Widgets General */
  .widget {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  /* Clock */
  .clock-widget { text-align: center; }
  .time {
    font-size: 3.5rem;
    font-weight: 200;
    line-height: 1;
    color: var(--clock-text-color, var(--text-primary)); /* Updated with fallback */
    font-variant-numeric: tabular-nums;
    margin-bottom: 0.25rem;
    white-space: nowrap;
  }
  .date {
    font-size: 0.9rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 500;
    white-space: nowrap;
  }

  /* Camera */
  .camera-widget {
    width: 100%;
    aspect-ratio: 16/9;
    background: #000;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    border: 1px solid var(--border-primary);
  }

  /* Status */
  .status-info {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
    color: var(--text-muted);
    border-top: 1px solid var(--border-divider);
    padding-top: 1rem;
    padding-bottom: 1rem;
    width: 100%;
  }
  .status-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0.5rem;
    background: var(--bg-card);
    border-radius: 8px;
    white-space: nowrap;
  }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .status-dot.connected { background-color: var(--accent-success); }
  .status-dot.loading { background-color: var(--accent-warning); animation: blink 0.5s infinite; }
  .status-dot.disconnected { background-color: var(--accent-error); }
  .status-text { font-weight: 500; color: var(--text-primary); }
  
  .latency {
    font-size: 0.75rem;
    font-weight: 600;
    margin-left: 4px;
  }
  
  :global(body.rtl) .latency {
     margin-left: 0;
     margin-right: 4px;
  }

  @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

  /* Footer */
  .sidebar-footer {
    padding-top: 12px;
    border-top: 1px solid var(--border-divider);
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
  .footer-btn {
    flex: 1;
    background: var(--bg-chip);
    border: none;
    border-radius: 8px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .footer-btn:hover {
    background: var(--bg-chip-active);
    color: var(--text-primary);
  }
  #collapse-btn {
    flex: 0 0 40px;
  }
  .divider {
    width: 1px;
    background: var(--border-divider);
    margin: 8px 0;
    flex: 0;
  }

  @media (max-width: 768px) { .sidebar { display: none; } }
</style>