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
    }, 1000); // Updated to 1s
    return () => clearInterval(interval);
  });
</script>

<div class="sidebar">
  <div class="weather-section">
    <div class="time">{timeStr}</div>
    
    <div class="weather-main">
      <div class="temp">
        {#if $haStore.entities.has('weather.home')}
          {$haStore.entities.get('weather.home')?.attributes.temperature ?? '--'}°
        {:else}
          --°
        {/if}
      </div>
      <div class="condition">Home</div>
    </div>
  </div>

  <div class="quick-links">
    <a href="/" class="link active">
      <iconify-icon icon="mdi:view-dashboard"></iconify-icon> Dashboard
    </a>
    <a href="/entities" class="link">
      <iconify-icon icon="mdi:format-list-bulleted"></iconify-icon> Entities
    </a>
    <a href="/settings" class="link">
      <iconify-icon icon="mdi:cog"></iconify-icon> Settings
    </a>
  </div>

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
    width: 260px;
    height: 100%;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border-primary);
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    overflow-y: auto;
    z-index: 50;
    color: var(--text-secondary);
    box-shadow: 2px 0 10px rgba(0,0,0,0.02);
    flex-shrink: 0;
  }

  .weather-section {
    text-align: center;
    border-bottom: 1px solid var(--border-divider);
    padding-bottom: 1.5rem;
    margin-bottom: 1rem;
  }

  .time {
    font-size: 2.5rem;
    font-weight: 300;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  .temp {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .condition {
    font-size: 0.85rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .quick-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .link {
    padding: 0.85rem 1rem;
    background: transparent;
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
    text-decoration: none;
  }

  .link:hover {
    background: var(--bg-sidebar-active-item);
    color: var(--text-primary);
  }
  
  .link.active {
    color: var(--accent-primary);
    background: var(--bg-sidebar-active-item);
  }

  .status-info {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-muted);
    border-top: 1px solid var(--border-divider);
    padding-top: 1rem;
  }

  .status-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 0.5rem;
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