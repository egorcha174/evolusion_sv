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
    }, 10000);
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
    <div class="status-item">
      <span class="label">Status:</span>
      <span class="value">
        {#if $haStore.isConnected}
          <span style="color: var(--accent-success)">●</span> Connected
        {:else}
          <span style="color: var(--accent-error)">●</span> Offline
        {/if}
      </span>
    </div>
  </div>
</div>

<style>
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: 260px;
    height: 100vh;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border-primary);
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    overflow-y: auto;
    z-index: 100;
    color: var(--text-secondary); /* Sidebar usually dark or distinctive */
    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  }

  /* Specific override if sidebar needs light text on dark bg regardless of theme? 
     No, use palette values. Themes will handle contrast.
  */

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
  }

  .link:hover {
    background: var(--bg-sidebar-active-item);
    color: var(--text-primary);
  }
  
  /* Example active state */
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

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .value {
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  @media (max-width: 768px) {
    .sidebar { display: none; }
  }
</style>