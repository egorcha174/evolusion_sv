
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { haStore } from '../ha/store';
  import { sidebarWidth, loadUIState, saveUIState } from './store';
  import { timeString } from '../app/time';
  import { weatherStore, initWeather, destroyWeather, weatherSettings } from '../../lib/weather/store';
  
  // Resizing state
  let width = $state(280);
  let isResizing = $state(false);

  onMount(() => {
    loadUIState();
    
    // Initialize services
    initWeather();
    
    // Subscribe to store updates
    const unsub = sidebarWidth.subscribe(w => width = w);
    return () => {
      unsub();
      destroyWeather();
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
  
  function formatDay(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
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
    <div class="date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
  </div>

  <!-- Widget: Weather -->
  <div class="widget weather-widget">
    {#if $weatherStore.isLoading && !$weatherStore.current}
       <div class="spinner"></div>
    {:else if $weatherStore.error}
       <div class="weather-error">
          <iconify-icon icon="mdi:cloud-off-outline" width="24"></iconify-icon>
       </div>
    {:else if $weatherStore.current}
      <!-- Current Weather -->
      <div class="current-weather">
        <div class="weather-icon">
           <iconify-icon icon={$weatherStore.current.icon} width="48"></iconify-icon>
        </div>
        <div class="weather-info">
          <div class="temp">
            {$weatherStore.current.temperature}°
          </div>
          <div class="condition">
             {$weatherStore.current.condition}
          </div>
        </div>
      </div>
      
      <!-- Forecast -->
      {#if $weatherSettings.showForecast && $weatherStore.current.forecast.length > 0}
        <div 
          class="forecast-list" 
          class:horizontal={$weatherSettings.forecastLayout === 'horizontal'}
        >
           {#each $weatherStore.current.forecast as day}
             <div class="forecast-item">
               <div class="forecast-day">{formatDay(day.date)}</div>
               <div class="forecast-icon">
                 <iconify-icon icon={day.icon} width="20"></iconify-icon>
               </div>
               <div class="forecast-temp">
                 <span class="max">{day.maxTemp}°</span>
                 {#if $weatherSettings.forecastLayout === 'vertical'}
                   <span class="min">{day.minTemp}°</span>
                 {/if}
               </div>
             </div>
           {/each}
        </div>
      {/if}

    {:else}
       <!-- Fallback/Empty -->
       <div class="current-weather">
         <div class="weather-icon">
           <iconify-icon icon="mdi:weather-partly-cloudy" width="48"></iconify-icon>
         </div>
         <div class="weather-info">
           <div class="temp">--°</div>
           <div class="condition">Offline</div>
         </div>
       </div>
    {/if}
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
          {#if $haStore.latency !== undefined}
            <span class="latency" style="color: {getLatencyColor($haStore.latency)}">
              ({$haStore.latency}ms)
            </span>
          {/if}
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
    transition: width 0.05s linear;
    overflow-x: hidden;
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

  /* Weather */
  .weather-widget {
    display: flex;
    flex-direction: column; /* Changed to column to stack forecast */
    gap: 1rem;
    background: var(--bg-card);
    padding: 1rem;
    border-radius: 16px;
    border: 1px solid var(--border-card);
    min-height: 80px;
    width: 100%;
  }
  
  .current-weather {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
  }

  .weather-icon { color: var(--accent-info); }
  .weather-info { display: flex; flex-direction: column; }
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

  .weather-error {
    color: var(--accent-error);
    opacity: 0.7;
  }
  
  /* Forecast List - Default Vertical */
  .forecast-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-top: 1px solid var(--border-divider, rgba(128,128,128,0.1));
    padding-top: 0.75rem;
  }
  
  .forecast-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.85rem;
  }
  
  .forecast-day {
    color: var(--text-secondary);
    width: 40px;
  }
  
  .forecast-icon {
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .forecast-temp {
    display: flex;
    gap: 0.5rem;
    font-variant-numeric: tabular-nums;
  }
  
  .forecast-temp .max { font-weight: 600; color: var(--text-primary); }
  .forecast-temp .min { color: var(--text-muted); }

  /* Forecast List - Horizontal Mode */
  .forecast-list.horizontal {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 4px; /* Space for scrollbar */
    gap: 8px;
    /* Hide scrollbar for webkit but allow scrolling */
    scrollbar-width: thin;
  }
  
  .forecast-list.horizontal::-webkit-scrollbar {
    height: 4px;
  }
  
  .forecast-list.horizontal::-webkit-scrollbar-thumb {
    background: var(--text-muted);
    border-radius: 2px;
  }

  .forecast-list.horizontal .forecast-item {
    flex-direction: column;
    min-width: 48px;
    justify-content: flex-start;
    gap: 4px;
    background: var(--bg-card-hover, rgba(0,0,0,0.03));
    padding: 8px 4px;
    border-radius: 8px;
    text-align: center;
  }
  
  .forecast-list.horizontal .forecast-day {
    width: auto;
    font-size: 0.75rem;
  }

  .forecast-list.horizontal .forecast-temp {
    font-size: 0.8rem;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid var(--border-primary);
    border-top: 3px solid var(--accent-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

  @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

  @media (max-width: 768px) { .sidebar { display: none; } }
</style>
