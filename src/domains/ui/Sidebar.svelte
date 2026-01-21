
<script lang="ts">
  import { onMount } from 'svelte';
  import { t, locale } from 'svelte-i18n';
  import { haStore } from '../ha/store';
  import { sidebarWidth, loadUIState, saveUIState } from './store';
  import { timeString } from '../app/time';
  import WeatherWidget from './widgets/WeatherWidget.svelte';
  
  // Resizing state
  let width = $state(280);
  let isResizing = $state(false);

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
    
    let newWidth = e.clientX;
    // Check RTL
    if (document.dir === 'rtl') {
       newWidth = window.innerWidth - e.clientX;
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
</script>

<aside class="sidebar" style="width: {width}px">
  <!-- Resize Handle -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="resize-handle" 
    class:active={isResizing}
    onmousedown={startResize}
  ></div>

  <!-- Widget: Clock -->
  <div class="widget clock-widget">
    <div class="time">{$timeString}</div>
    <div class="date">{new Date().toLocaleDateString($locale || 'en', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
  </div>

  <!-- Widget: Weather -->
  <WeatherWidget />

  <!-- Widget: Camera (Placeholder) -->
  <div class="widget camera-widget">
    <div class="camera-placeholder">
      <iconify-icon icon="mdi:cctv" width="32"></iconify-icon>
      <span>{$t('sidebar.camera')}</span>
    </div>
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
    color: var(--text-primary);
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
  .camera-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba(255,255,255,0.5);
    background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
    gap: 0.5rem;
  }
  .camera-placeholder span { font-size: 0.8rem; font-weight: 500; }

  /* Status */
  .status-info {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
    color: var(--text-muted);
    border-top: 1px solid var(--border-divider);
    padding-top: 1.5rem;
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

  @media (max-width: 768px) { .sidebar { display: none; } }
</style>
