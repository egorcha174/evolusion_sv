<script lang="ts">
  import DashboardGrid from '../domains/ui/DashboardGrid.svelte';
  import DeviceSettingsModal from '../domains/ui/DeviceSettingsModal.svelte';
  import { ha } from '../domains/ha/store.svelte.ts';
  import { app } from '../domains/app/store.svelte.ts';
  import Icon from '@iconify/svelte';
  import type { Tab, Device } from '$lib/types';

  // Reactive statements for store state
  const activeTab = $derived(app.activeTab);
  const isEditMode = $derived(app.isEditMode);
  const searchTerm = $derived(app.searchTerm);
  const editingDevice = $derived(app.editingDevice);

  // Handlers from app store actions
  const onDeviceLayoutChange = app.handleDeviceLayoutChange;
  const onEditDevice = app.setEditingDevice;

  // Handlers for modals
  function handleCloseDeviceSettings() {
    app.setEditingDevice(null);
  }

  // Effect to manage initial tab setup
  $effect(() => {
    if (ha.state.isConnected && !ha.state.isConnecting && app.tabs.length === 0) {
      const newTab: Tab = {
        id: 'main-dashboard',
        name: 'Главная',
        layout: [],
        gridSettings: { cols: 10, rows: 5 }
      };
      app.setTabs([newTab]);
      app.setActiveTabId(newTab.id);
    } else if (ha.state.isConnected && !app.activeTabId && app.tabs.length > 0) {
      app.setActiveTabId(app.tabs[0].id);
    }
  });

</script>

<div class="p-4 flex-grow h-full flex flex-col">
  <div class="flex items-center justify-end mb-4">
    <button
      onclick={() => app.setIsEditMode(!isEditMode)}
      class="flex items-center gap-1 px-3 py-1 rounded-md transition-colors {isEditMode
        ? 'bg-red-500 text-white hover:bg-red-600'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
    >
      <Icon icon="mdi:pencil" class="w-4 h-4" />
      {isEditMode ? 'Завершить' : 'Изменить'}
    </button>
  </div>

  {#if activeTab}
    <DashboardGrid
      tab={activeTab}
      {isEditMode}
      {searchTerm}
      {onDeviceLayoutChange}
      {onEditDevice}
    />
  {:else}
    <div class="flex h-full w-full items-center justify-center text-center text-gray-500 dark:text-gray-400">
      <div>
        <h3 class="text-3xl font-semibold text-gray-400 dark:text-gray-600">Добро пожаловать</h3>
        <p class="mt-2">{ha.state.isConnecting ? 'Подключение к Home Assistant...' : 'Загрузка дашборда...'}</p>
      </div>
    </div>
  {/if}
</div>

{#if editingDevice}
  <DeviceSettingsModal device={editingDevice} onClose={handleCloseDeviceSettings} />
{/if}
