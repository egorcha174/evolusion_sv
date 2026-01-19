<script lang="ts">
  import { haStore } from '../domains/ha/store';
  import DashboardGrid from '../domains/ui/DashboardGrid.svelte';
</script>

<div class="dashboard-page">
  <div class="page-header">
    <h1>Dashboard</h1>
  </div>
  
  {#if $haStore.isLoading}
    <div class="state-container">
      <div class="spinner"></div>
      <p>Connecting to Home Assistant...</p>
    </div>
  {:else if $haStore.error}
    <div class="state-container error">
      <h3>Connection Error</h3>
      <p>{$haStore.error}</p>
      <a href="/settings" class="btn">Check Settings</a>
    </div>
  {:else if !$haStore.isConnected}
    <div class="state-container">
      <h3>Not Connected</h3>
      <p>Please configure your server connection.</p>
      <a href="/settings" class="btn">Go to Settings</a>
    </div>
  {:else}
    <DashboardGrid />
  {/if}
</div>

<style>
  .dashboard-page {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .page-header {
    margin-bottom: 1.5rem;
  }

  h1 {
    margin: 0;
    font-size: 1.75rem;
    color: #333;
  }
  
  .state-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    text-align: center;
    min-height: 200px;
  }
  
  .error {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .btn {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #2196f3;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 500;
  }
  
  .btn:hover {
    background-color: #1976d2;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #2196f3;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
