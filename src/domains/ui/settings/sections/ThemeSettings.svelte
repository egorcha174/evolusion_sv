<script lang="ts">
  import { t } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import { themeStore } from '../../theme/store';
  import { defaultTheme } from '../../../../themes';
  import { exportTheme, importTheme } from '../../theme/io';
  import { setLocale, availableLanguages, currentLang } from '../../../../lib/i18n';
  import type { ThemeMode, ThemeFile } from '../../../../themes/types';
  
  import Section from '../Section.svelte';
  import ThemeEditor from '../../theme/ThemeEditor.svelte';
  import 'iconify-icon';

  let isEditingTheme = $state(false);
  let themeDraft = $state<ThemeFile | null>(null);
  let themeFileInput: HTMLInputElement;

  let allThemes = $derived(
    $themeStore.themes.map(t => ({
      ...t,
      isBuiltIn: !t.theme.isCustom
    }))
  );

  function handleThemeSelect(id: string) {
    if (isEditingTheme) {
       if (!confirm($t('common.cancel') + '?')) return;
       cancelThemeEdit();
    }
    themeStore.setActiveTheme(id);
  }

  function createThemeCopy(baseTheme: ThemeFile) {
    const newId = `custom_${Date.now()}`;
    const newName = `${baseTheme.theme.name} (Copy)`;
    
    themeDraft = JSON.parse(JSON.stringify(baseTheme));
    if (themeDraft) {
        themeDraft.manifest.name = newName;
        themeDraft.theme.id = newId;
        themeDraft.theme.name = newName;
        themeDraft.theme.isCustom = true;
        isEditingTheme = true;
    }
  }

  function editCustomTheme(theme: ThemeFile) {
    themeDraft = JSON.parse(JSON.stringify(theme));
    isEditingTheme = true;
  }

  function saveTheme(theme: ThemeFile) {
    themeStore.saveTheme(theme);
    themeStore.setActiveTheme(theme.theme.id);
    isEditingTheme = false;
    themeDraft = null;
  }

  function deleteTheme(id: string) {
    if (confirm($t('templates.manager.confirmDelete'))) {
        themeStore.deleteTheme(id);
        if (isEditingTheme && themeDraft?.theme.id === id) {
            isEditingTheme = false;
            themeDraft = null;
        }
    }
  }

  function cancelThemeEdit() {
    isEditingTheme = false;
    themeDraft = null;
    themeStore.setActiveTheme($themeStore.activeThemeId);
  }

  async function handleThemeImport(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const theme = await importTheme(file);
      themeStore.saveTheme(theme);
      themeStore.setActiveTheme(theme.theme.id);
      alert(`Theme "${theme.theme.name}" imported successfully!`);
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      if (themeFileInput) themeFileInput.value = '';
    }
  }

  function handleThemeExport(theme: ThemeFile) {
    try {
      exportTheme(theme);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  }
</script>

<Section title={$t('settings.appearance')} description={$t('settings.appearanceDesc')} initiallyOpen={true}>
  <div class="control-row">
    <label>
      {$t('settings.language')}
      <select value={$currentLang} onchange={(e) => setLocale(e.currentTarget.value)}>
        {#each $availableLanguages as lang}
          <option value={lang.code}>{lang.name}</option>
        {/each}
      </select>
    </label>
  </div>

  <div class="control-row">
    <label>
      {$t('settings.themeMode')}
      <select value={$themeStore.mode} onchange={(e) => themeStore.setMode(e.currentTarget.value as ThemeMode)}>
        <option value="auto">{$t('settings.themeModeAuto')}</option>
        <option value="light">{$t('settings.themeModeDay')}</option>
        <option value="dark">{$t('settings.themeModeNight')}</option>
      </select>
    </label>
  </div>

  <div class="theme-gallery-section">
     <div class="section-header-row">
        <div class="label">{$t('settings.theme')}</div>
        <input 
           type="file" 
           hidden 
           accept=".json" 
           bind:this={themeFileInput}
           onchange={handleThemeImport} 
        />
     </div>
     
     <div class="theme-grid">
       {#each allThemes as theme (theme.theme.id)}
         <!-- svelte-ignore a11y_click_events_have_key_events -->
         <!-- svelte-ignore a11y_no_static_element_interactions -->
         <div 
            class="theme-card" 
            class:active={$themeStore.activeThemeId === theme.theme.id}
            onclick={() => handleThemeSelect(theme.theme.id)}
         >
            <div class="preview" style:background={theme.theme.scheme.light.dashboardBackgroundColor1}>
               <div class="mini-card" style:background={theme.theme.scheme.light.cardBackground}></div>
               <div class="mini-accent" style:background={theme.theme.scheme.light.accentPrimary}></div>
            </div>
            <div class="meta">
               <span class="name">{theme.theme.name}</span>
               <div class="actions">
                  <button class="icon-btn small" onclick={(e) => { e.stopPropagation(); handleThemeExport(theme); }} title={$t('settings.exportTheme')}>
                     <iconify-icon icon="mdi:download"></iconify-icon>
                  </button>

                  {#if theme.isBuiltIn}
                     <button class="icon-btn small" onclick={(e) => { e.stopPropagation(); createThemeCopy(theme); }} title="Copy">
                        <iconify-icon icon="mdi:content-copy"></iconify-icon>
                     </button>
                  {:else}
                     <button class="icon-btn small" onclick={(e) => { e.stopPropagation(); editCustomTheme(theme); }} title="Edit">
                        <iconify-icon icon="mdi:pencil"></iconify-icon>
                     </button>
                     <button class="icon-btn small danger" onclick={(e) => { e.stopPropagation(); deleteTheme(theme.theme.id); }} title="Delete">
                        <iconify-icon icon="mdi:delete"></iconify-icon>
                     </button>
                  {/if}
               </div>
            </div>
         </div>
       {/each}
       
       <button class="theme-card create-btn" onclick={() => createThemeCopy(defaultTheme)}>
          <iconify-icon icon="mdi:plus" width="32"></iconify-icon>
          <span>{$t('templates.manager.create')}</span>
       </button>

       <button class="theme-card create-btn" onclick={() => themeFileInput.click()}>
          <iconify-icon icon="mdi:upload" width="32"></iconify-icon>
          <span>{$t('settings.importTheme')}</span>
       </button>
     </div>
  </div>
  
  {#if isEditingTheme && themeDraft}
     <div class="editor-wrapper" transition:slide>
        <ThemeEditor 
           draft={themeDraft} 
           onSave={saveTheme} 
           onCancel={cancelThemeEdit} 
        />
     </div>
  {/if}
</Section>

<style>
  .control-row { margin-bottom: 1rem; }
  label { display: flex; justify-content: space-between; align-items: center; width: 100%; font-weight: 500; color: var(--text-primary); cursor: pointer; font-size: 0.9rem; }
  select { padding: 0.4rem; border-radius: 6px; border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); min-width: 140px; font-size: 0.9rem; max-width: 60%; }

  .theme-gallery-section { display: flex; flex-direction: column; gap: 0.75rem; }
  .section-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
  .section-header-row .label { font-weight: 500; color: var(--text-primary); font-size: 0.9rem; }

  .theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .theme-card {
    border: 2px solid var(--border-primary);
    border-radius: 8px;
    background: var(--bg-card);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
  }
  
  .theme-card:hover { border-color: var(--border-focus); transform: translateY(-2px); }
  .theme-card.active { border-color: var(--accent-primary); box-shadow: 0 0 0 2px rgba(var(--accent-primary-rgb), 0.2); }
  
  .preview { height: 60px; width: 100%; position: relative; background: #eee; }
  .mini-card { position: absolute; top: 10px; left: 10px; right: 10px; height: 20px; border-radius: 4px; background: white; opacity: 0.8; }
  .mini-accent { position: absolute; bottom: 10px; right: 10px; width: 20px; height: 20px; border-radius: 50%; background: blue; }
  
  .meta {
    padding: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-primary);
  }
  
  .name { font-size: 0.8rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-primary); }
  
  .actions { display: flex; gap: 4px; }
  
  .icon-btn.small {
    padding: 4px;
    width: 24px; height: 24px;
    font-size: 14px;
    border-radius: 4px;
    background: var(--bg-input); 
    border: 1px solid var(--border-primary);
    display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary);
  }
  .icon-btn.small:hover { background: var(--bg-card-hover); border-color: var(--border-focus); color: var(--text-primary); }
  .icon-btn.small.danger:hover { color: var(--accent-error); border-color: var(--accent-error); }
  
  .create-btn {
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    min-height: 94px; background: var(--bg-secondary); border: 1px dashed var(--border-primary); color: var(--text-secondary);
  }
  .create-btn:hover { border-color: var(--accent-primary); color: var(--accent-primary); }
  
  .editor-wrapper { margin-top: 1rem; border-top: 1px solid var(--border-divider); padding-top: 1rem; }

  @media (max-width: 480px) {
    .theme-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
  }
</style>