<script lang="ts">
  import { t } from 'svelte-i18n';
  import { appState, saveSavedServers, saveServerConfig } from '../../app/store';
  import { generateId, type ServerConfig } from '$lib/types';
  import 'iconify-icon';

  let { onClose } = $props<{ onClose: () => void }>();

  // State
  let servers = $derived($appState.savedServers || []);
  let selectedId = $state<string | null>(null);
  let mode = $state<'view' | 'edit' | 'create'>('view');

  // Draft for editing/creating
  let draft = $state<ServerConfig>({ id: '', name: '', url: '', token: '' });

  // Init selection: select active server if present
  $effect(() => {
    if (
      !selectedId &&
      $appState.activeServer &&
      servers.some((s) => s.id === $appState.activeServer?.id)
    ) {
      selectedId = $appState.activeServer.id;
      mode = 'view';
    }
  });

  // Derived active selection
  let selectedServer = $derived(servers.find((s) => s.id === selectedId));
  let isActiveConnected = $derived((id: string) => $appState.activeServer?.id === id);

  function handleSelect(id: string) {
    if (mode === 'edit' || mode === 'create') {
      if (!confirm($t('common.cancel') + '?')) return;
    }
    selectedId = id;
    mode = 'view';
  }

  function handleAdd() {
    draft = {
      id: generateId(),
      name: 'New Server',
      url: 'http://homeassistant.local:8123',
      token: '',
    };
    selectedId = null; // Deselect list
    mode = 'create';
  }

  function handleEdit() {
    if (!selectedServer) return;
    draft = JSON.parse(JSON.stringify(selectedServer));
    mode = 'edit';
  }

  function handleDelete() {
    if (!selectedServer) return;
    // Replace hardcoded "Delete X?" with parameterized translation if possible, or just build string
    const msg = $t('settings.serverManager.deleteConfirm', { name: selectedServer.name });
    if (!confirm(msg)) return;

    const newServers = servers.filter((s) => s.id !== selectedId);
    saveSavedServers(newServers);

    if (selectedId === $appState.activeServer?.id) {
      // If we deleted the active one, maybe disconnect or clear active?
      // For now, let's just clear selection
    }
    selectedId = null;
    mode = 'view';
  }

  async function handleSave() {
    // Basic Validation
    if (!draft.url || !draft.token) {
      alert($t('settings.serverManager.validationError'));
      return;
    }

    if (mode === 'create') {
      const newServers = [...servers, draft];
      await saveSavedServers(newServers);
      selectedId = draft.id;
    } else if (mode === 'edit') {
      const newServers = servers.map((s) => (s.id === draft.id ? draft : s));
      await saveSavedServers(newServers);
      // If editing active server, update active config immediately
      if ($appState.activeServer?.id === draft.id) {
        await saveServerConfig(draft);
      }
      selectedId = draft.id;
    }
    mode = 'view';
  }

  function handleCancel() {
    if (mode === 'create') {
      if (servers.length > 0) {
        selectedId = servers[0].id;
        mode = 'view';
      } else {
        selectedId = null;
        mode = 'view';
      }
    } else {
      mode = 'view';
    }
  }

  async function handleConnect() {
    if (selectedServer) {
      await saveServerConfig(selectedServer);
      onClose(); // Close modal on connect
    }
  }

  function handleBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="manager-overlay" onclick={handleBackdrop}>
  <div class="manager-card">
    <!-- LEFT: List -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h4>{$t('settings.serverManager.savedServers')}</h4>
      </div>

      <div class="server-list">
        {#each servers as s (s.id)}
          <button
            class="server-item"
            class:active={selectedId === s.id}
            onclick={() => handleSelect(s.id)}
          >
            <div class="item-info">
              <div class="item-name">{s.name || 'Unnamed'}</div>
              <div class="item-url">{s.url}</div>
            </div>
            {#if isActiveConnected(s.id)}
              <div class="active-dot" title="Active"></div>
            {/if}
          </button>
        {/each}
      </div>

      <div class="sidebar-footer">
        <button class="icon-action" onclick={handleAdd} title={$t('settings.serverManager.add')}>
          <iconify-icon icon="mdi:plus" width="20"></iconify-icon>
        </button>
        <div class="divider-v"></div>
        <button
          class="icon-action"
          onclick={handleEdit}
          disabled={!selectedId}
          title={$t('settings.serverManager.edit')}
        >
          <iconify-icon icon="mdi:pencil" width="18"></iconify-icon>
        </button>
        <button
          class="icon-action danger"
          onclick={handleDelete}
          disabled={!selectedId}
          title={$t('common.delete')}
        >
          <iconify-icon icon="mdi:delete" width="18"></iconify-icon>
        </button>
      </div>
    </div>

    <!-- RIGHT: Content -->
    <div class="content">
      {#if mode === 'view' && !selectedServer}
        <div class="empty-state">
          <div class="empty-icon">
            <iconify-icon icon="mdi:server-network" width="64"></iconify-icon>
          </div>
          <h3>{$t('settings.serverManager.title')}</h3>
          <p>{$t('settings.serverManager.description')}</p>
        </div>
      {:else if mode === 'view' && selectedServer}
        <div class="view-state">
          <div class="view-header">
            <h3>{selectedServer.name}</h3>
            <div class="view-url">{selectedServer.url}</div>
          </div>

          <!-- Read Only Preview -->
          <div class="info-block">
            <label>{$t('settings.serverManager.token')}</label>
            <div class="token-preview">•••••••••••••••••••••••••</div>
          </div>

          <div class="spacer"></div>

          <div class="actions-row">
            <button class="btn primary full" onclick={handleConnect}>
              {$t('settings.serverManager.connect')}
            </button>
          </div>
        </div>
      {:else if (mode === 'create' || mode === 'edit') && draft}
        <div class="form-state">
          <h3>
            {mode === 'create'
              ? $t('settings.serverManager.add')
              : $t('settings.serverManager.edit')}
          </h3>

          <div class="form-group">
            <label for="s-name">{$t('settings.serverManager.name')}</label>
            <input id="s-name" type="text" bind:value={draft.name} placeholder="Home Assistant" />
          </div>

          <div class="form-group">
            <label for="s-url">{$t('settings.serverManager.url')}</label>
            <input
              id="s-url"
              type="text"
              bind:value={draft.url}
              placeholder="http://192.168.1.10:8123"
            />
          </div>

          <div class="form-group">
            <label for="s-token">{$t('settings.serverManager.token')}</label>
            <textarea id="s-token" bind:value={draft.token} rows="4" placeholder="eyJhbG..."
            ></textarea>
          </div>

          <div class="spacer"></div>

          <div class="actions-row">
            <button class="btn text" onclick={handleCancel}>{$t('common.cancel')}</button>
            <button class="btn primary" onclick={handleSave}>{$t('common.save')}</button>
          </div>
        </div>
      {/if}

      <button class="close-absolute" onclick={onClose} aria-label={$t('common.close')}>
        <iconify-icon icon="mdi:close" width="24"></iconify-icon>
      </button>
    </div>
  </div>
</div>

<style>
  .manager-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .manager-card {
    width: 800px;
    height: 500px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
    display: flex;
    overflow: hidden;
    position: relative;
  }

  /* SIDEBAR */
  .sidebar {
    width: 280px;
    background: #f5f5f7;
    border-right: 1px solid #e5e5ea;
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid #e5e5ea;
  }
  .sidebar-header h4 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: #1d1d1f;
  }

  .server-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .server-item {
    background: transparent;
    border: none;
    border-radius: 8px;
    padding: 10px 12px;
    text-align: left;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.1s;
  }

  .server-item:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .server-item.active {
    background: #0071e3;
    color: white;
  }

  .item-info {
    min-width: 0;
    flex: 1;
  }

  .item-name {
    font-weight: 600;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .server-item.active .item-name {
    color: white;
  }

  .item-url {
    font-size: 0.8rem;
    color: #86868b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .server-item.active .item-url {
    color: rgba(255, 255, 255, 0.8);
  }

  .active-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #34c759;
    border: 2px solid #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .sidebar-footer {
    padding: 0.5rem;
    border-top: 1px solid #e5e5ea;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon-action {
    flex: 1;
    background: transparent;
    border: none;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    color: #1d1d1f;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .icon-action:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
  }
  .icon-action:disabled {
    opacity: 0.3;
    cursor: default;
  }
  .icon-action.danger:hover:not(:disabled) {
    color: #ff3b30;
    background: rgba(255, 59, 48, 0.1);
  }

  .divider-v {
    width: 1px;
    height: 20px;
    background: #e5e5ea;
  }

  /* CONTENT */
  .content {
    flex: 1;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    position: relative;
    background: #fff;
  }

  .close-absolute {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #86868b;
  }
  .close-absolute:hover {
    color: #1d1d1f;
  }

  /* Empty State */
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #86868b;
  }
  .empty-icon {
    font-size: 4rem;
    opacity: 0.5;
    margin-bottom: 1rem;
  }
  .empty-state h3 {
    font-size: 1.2rem;
    margin: 0 0 0.5rem 0;
    color: #1d1d1f;
  }

  /* Forms & Views */
  h3 {
    margin: 0 0 1.5rem 0;
    font-size: 1.4rem;
    color: #1d1d1f;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.9rem;
    color: #1d1d1f;
  }
  input,
  textarea {
    width: 100%;
    padding: 0.75rem;
    background: #f5f5f7;
    border: 1px solid transparent;
    border-radius: 8px;
    font-size: 1rem;
    color: #1d1d1f;
  }
  input:focus,
  textarea:focus {
    background: #fff;
    border-color: #0071e3;
    outline: none;
  }

  .view-header {
    margin-bottom: 2rem;
  }
  .view-url {
    color: #86868b;
    font-size: 0.95rem;
    margin-top: 0.25rem;
  }
  .token-preview {
    font-family: monospace;
    background: #f5f5f7;
    padding: 0.75rem;
    border-radius: 8px;
    color: #86868b;
    font-size: 0.9rem;
  }

  .spacer {
    flex: 1;
  }

  .actions-row {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
  }

  .btn {
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
  }
  .btn.primary {
    background: #0071e3;
    color: white;
  }
  .btn.primary:hover {
    background: #0077ed;
  }
  .btn.text {
    background: transparent;
    color: #86868b;
  }
  .btn.text:hover {
    color: #1d1d1f;
    background: #f5f5f7;
  }
  .btn.full {
    width: 100%;
  }

  @media (prefers-color-scheme: dark) {
    /* Force light mode style for this specific component to match screenshot requested, 
        or we can let it adapt. The screenshot is light. 
        I'll keep specific colors above, but add minimal override if app is in dark mode
        so it doesn't look broken. */
  }
</style>
