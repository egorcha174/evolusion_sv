<script lang="ts">
  import { haStore } from '../domains/ha/store';
  import DashboardGrid from '../domains/ui/DashboardGrid.svelte';
</script>

<div class="dashboard-page">
  {#if $haStore.isLoading}
    <div class="status-message">
      <div class="spinner"></div>
      <p>Connecting to Home Assistant...</p>
    </div>
  {:else if $haStore.error}
    <div class="status-message error">
      <iconify-icon icon="mdi:alert-circle" width="48"></iconify-icon>
      <h3>Connection Error</h3>
      <p>{$haStore.error}</p>
      <a href="/settings" class="btn">Check Settings</a>
    </div>
  {:else if !$haStore.isConnected}
    <div class="status-message warning">
      <iconify-icon icon="mdi:lan-disconnect" width="48"></iconify-icon>
      <h3>Not Connected</h3>
      <p>Please configure your server connection in Settings.</p>
      <a href="/settings" class="btn">Go to Settings</a>
    </div>
  {:else}
    <DashboardGrid />
  {/if}
</div>

<style>
  .dashboard-page {
    width: 100%;
    /* Removed max-width to allow full-screen usage */
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .status-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
    margin-top: 2rem;
    min-height: 300px;
    color: #666;
    flex: 1;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .status-message.error {
    color: #d32f2f;
    background: #fffafa;
    border: 1px solid #ffcdd2;
  }

  .status-message.warning {
    color: #ed6c02;
    background: #fff8e1;
    border: 1px solid #ffecb3;
  }

  .status-message h3 {
    margin: 1rem 0 0.5rem 0;
  }

  .btn {
    display: inline-block;
    margin-top: 1.5rem;
    padding: 0.75rem 1.5rem;
    background-color: #2196f3;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: background 0.2s;
  }

  .btn:hover {
    background-color: #1976d2;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #2196f3;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
