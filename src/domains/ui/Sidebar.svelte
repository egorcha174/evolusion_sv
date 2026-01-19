<script lang="ts">
  import { onMount } from 'svelte';
  import { haStore } from '../ha/store';
  import { sidebarWidth, loadUIState, saveUIState } from './store';
  
  let timeStr = $state(new Date().toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit'
  }));

  // Resizing state
  let width = $state(280);
  let isResizing = $state(false);

  onMount(() => {
    loadUIState();
    
    // Subscribe to store updates
    const unsub = sidebarWidth.subscribe(w => width = w);

    const interval = setInterval(() => {
      timeStr = new Date().toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    }, 1000);
    
    return () => {
      clearInterval(interval);
      unsub();
    };
  });

  function startResize(e: MouseEvent) {
    e.preventDefault();
    isResizing = true;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResize);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none'; // Prevent selection while dragging
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isResizing) return;
    
    let newWidth = e.clientX;
    
    // Constraints
    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;
    
    width = newWidth;
    // We update local state immediately for smooth animation, 
    // but save to store/persistence only on stop to avoid hammering localStorage
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
</script>

<aside class="sidebar" style="width: {width}px">
  <!-- Resize Handle -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="resize-handle" 
    onmousedown={startResize}
  ></div>

  <!-- Widget: Clock -->
  <div class="widget clock-widget">
    <div class="time">{timeStr}</div>
    <div class="date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
  </div>

  <!-- Widget: Weather -->
  <div class="widget weather-widget">
    <div class="weather-icon">
       <iconify-icon icon="mdi:weather-partly-cloudy" width="48"></iconify-icon>
    </div>
    <div class="weather-info">
      <div class="temp">
        {#if $haStore.entities.has('weather.home')}
          {$haStore.entities.get('weather.home')?.attributes.temperature ?? '--'}°
        {:else}
          --°
        {/if}
      </div>
      <div class="condition">
         {#if $haStore.entities.has('weather.home')}
            {$haStore.entities.get('weather.home')?.state ?? 'Unknown'}
         {:else}
            Home
         {/if}
      </div>
    </div>
  </div>

  <!-- Widget: Camera (Placeholder) -->
  <div class="widget camera-widget">
    <div class="camera-placeholder">
      <iconify-icon icon="mdi:cctv" width="32"></iconify-icon>
      <span>Front Door</span>
    </div>
  </div>

  <!-- Status Info (Bottom) -->
  <div class="status-info">
    <div class="status-row">
       {#if $haStore.isConnected}
          <div class="status-dot connected"></div>
          <span class="status-text">Connected</span>
       {:else if $haStore.isLoading}
          <div class="status-dot loading"></div>
          <span class="status-text">Connecting...</span>
       {:else}
          <div class="status-dot disconnected"></div>
          <span class="status-text">Offline</span>
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
    transition: width 0.05s linear; /* Fast response */
    overflow-x: hidden;
  }

  .resize-handle {
    position: absolute;
    top: 0;
    right: 0;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    z-index: 60;
    transition: background 0.2s;
  }
  
  .resize-handle:hover, .sidebar:hover .resize-handle {
    background: rgba(128, 128, 128, 0.1);
  }

  /* Widgets General */
  .widget {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  /* Clock */
  .clock-widget {
    text-align: center;
  }

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

  /* Weather */
  .weather-widget {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    background: var(--bg-card);
    padding: 1rem;
    border-radius: 16px;
    border: 1px solid var(--border-card);
  }

  .weather-icon {
    color: var(--accent-info);
  }

  .weather-info {
    display: flex;
    flex-direction: column;
  }

  .temp {
    font-size: 2rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1;
  }

  .condition {
    font-size: 0.85rem;
    color: var(--text-muted);
    text-transform: capitalize;
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
  
  .camera-placeholder span {
    font-size: 0.8rem;
    font-weight: 500;
  }

  /* Status (Bottom) */
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
    gap: 10px;
    padding: 0.5rem;
    background: var(--bg-card);
    border-radius: 8px;
    white-space: nowrap;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-dot.connected {
    background-color: var(--accent-success);
    animation: blink 2s infinite ease-in-out;
  }

  .status-dot.loading {
    background-color: var(--accent-warning);
    animation: blink 0.5s infinite ease-in-out;
  }

  .status-dot.disconnected {
    background-color: var(--accent-error);
  }

  .status-text {
    font-weight: 500;
    color: var(--text-primary);
  }

  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
  }

  @media (max-width: 768px) {
    .sidebar { display: none; }
  }
</style>