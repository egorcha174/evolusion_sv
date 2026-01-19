<script lang="ts">
  import { haStore } from '../ha/store';
</script>

<div class="header">
  <div class="title-area">
    <h1>Evolusion</h1>
  </div>
  
  <div class="header-right">
    <div class="status">
      <span class="indicator" class:connected={$haStore.isConnected}></span>
      <span class="status-text">
        {#if $haStore.isConnected}
          Connected
        {:else if $haStore.isLoading}
          Connecting...
        {:else}
          Disconnected
        {/if}
      </span>
    </div>
  </div>
</div>

<style>
  .header {
    position: fixed;
    top: 0;
    left: 260px; /* Match sidebar width */
    right: 0;
    height: 64px;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    z-index: 90;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .title-area h1 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: #333;
    letter-spacing: -0.5px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9rem;
    color: #666;
    background: #f5f5f5;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
  }

  .indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ccc;
    transition: background 0.3s;
    box-shadow: 0 0 0 2px rgba(0,0,0,0.05);
  }

  .indicator.connected {
    background: #4caf50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }

  @media (max-width: 768px) {
    .header {
      left: 0;
      padding: 0 1rem;
    }

    .title-area h1 {
      font-size: 1.2rem;
    }
  }
</style>