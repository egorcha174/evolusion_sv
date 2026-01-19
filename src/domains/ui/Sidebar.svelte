<script lang="ts">
  import { haStore } from '../ha/store';
  
  let timeStr = $state(new Date().toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit'
  }));

  $effect(() => {
    const interval = setInterval(() => {
      timeStr = new Date().toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    }, 1000);
    return () => clearInterval(interval);
  });
</script>

<div class="sidebar">
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
</div>

<style>
  .sidebar {
    position: relative;
    width: 280px; /* Slightly wider for widgets */
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
  }

  .date {
    font-size: 0.9rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 500;
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
    background: var(--bg-card); /* Subtle card bg for status */
    border-radius: 8px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
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