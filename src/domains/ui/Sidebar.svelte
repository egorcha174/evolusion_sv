<script lang="ts">
  import { haStore } from '../ha/store';
  
  // Helper to format time safely
  let timeStr = $state(new Date().toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit'
  }));

  // Update time every minute
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
    <a href="/" class="link">
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
          <span style="color: #4caf50">●</span> Connected
        {:else}
          <span style="color: #f44336">●</span> Offline
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
    background: #1e1e1e;
    border-right: 1px solid #333;
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    overflow-y: auto;
    z-index: 100;
    color: #fff;
    box-shadow: 2px 0 10px rgba(0,0,0,0.2);
  }

  .weather-section {
    text-align: center;
    border-bottom: 1px solid #333;
    padding-bottom: 1.5rem;
    margin-bottom: 1rem;
  }

  .time {
    font-size: 2.5rem;
    font-weight: 300;
    margin-bottom: 0.5rem;
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #fff;
  }

  .weather-main {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .temp {
    font-size: 1.5rem;
    font-weight: 600;
    color: #aaa;
  }

  .condition {
    font-size: 0.85rem;
    color: #777;
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
    color: #ccc;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
  }

  .link:hover {
    background: #2d2d2d;
    color: #fff;
  }

  .link :global(iconify-icon) {
    font-size: 1.2rem;
  }

  .status-info {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: #aaa;
    border-top: 1px solid #333;
    padding-top: 1rem;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .label {
    font-weight: 600;
  }

  .value {
    color: #fff;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  @media (max-width: 768px) {
    .sidebar {
      width: 0;
      padding: 0;
      overflow: hidden;
      /* For MVP, simply hide sidebar on mobile or require a hamburger menu later */
      /* Transforming it to a bottom bar or similar would be better, but keeping simple for now */
      display: none; 
    }
  }
</style>