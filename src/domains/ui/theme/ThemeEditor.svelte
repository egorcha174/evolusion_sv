
<script lang="ts">
  import { t } from 'svelte-i18n';
  import { themeSettings } from './store';
  import { BUILTIN_THEMES, defaultTheme } from '../../theme/defaults';
  import type { ThemeFile, Theme } from '../../../themes/types';
  import 'iconify-icon';

  let { onClose } = $props<{ onClose: () => void }>();

  // Use a copy for editing
  let customThemes = $derived($themeSettings.customThemes || []);
  
  // Selection
  let selectedId = $state<string>('');
  
  // If we are creating a new one or editing
  let draft = $state<ThemeFile | null>(null);
  let isEditing = $state(false);

  // Computed list for sidebar
  let allThemes = $derived([
    ...BUILTIN_THEMES.map(t => ({ ...t, isBuiltIn: true })),
    ...customThemes.map(t => ({ ...t, isBuiltIn: false }))
  ]);

  function select(id: string) {
    // If editing, confirm discard?
    if (isEditing && draft && draft.theme.id !== id) {
        if (!confirm('Discard changes?')) return;
    }
    
    selectedId = id;
    const found = allThemes.find(t => t.theme.id === id);
    if (found) {
        // Deep clone for drafting
        draft = JSON.parse(JSON.stringify(found));
        isEditing = false;
    }
  }

  function createCopy() {
    if (!draft) return;
    // Create a new ID and clean up
    const newId = `custom_${Date.now()}`;
    const newName = `${draft.theme.name} (Copy)`;
    
    // Transform draft to new Custom Theme
    draft = {
        ...draft,
        manifest: {
            ...draft.manifest,
            name: newName,
            author: 'User',
            version: '1.0.0',
            description: `Based on ${draft.theme.name}`,
            generatedAt: new Date().toISOString()
        },
        theme: {
            ...draft.theme,
            id: newId,
            name: newName,
            isCustom: true
        }
    };
    isEditing = true;
    selectedId = newId; // This ID doesn't exist in list yet, but draft holds it
  }

  function startEdit() {
    if (draft && !draft.theme.isCustom) {
        createCopy();
    } else {
        isEditing = true;
    }
  }

  function save() {
    if (!draft) return;
    
    themeSettings.update(s => {
        const customs = [...s.customThemes];
        const idx = customs.findIndex(c => c.theme.id === draft?.theme.id);
        if (idx >= 0) {
            customs[idx] = draft!;
        } else {
            customs.push(draft!);
        }
        return {
            ...s,
            customThemes: customs,
            activeThemeId: draft!.theme.id // Auto-activate
        };
    });
    
    isEditing = false;
  }

  function deleteTheme() {
    if (!draft || !draft.theme.isCustom) return;
    if (!confirm('Delete this theme?')) return;
    
    const idToDelete = draft.theme.id;
    
    themeSettings.update(s => {
        const customs = s.customThemes.filter(c => c.theme.id !== idToDelete);
        let nextActive = s.activeThemeId;
        if (s.activeThemeId === idToDelete) {
            nextActive = defaultTheme.theme.id;
        }
        return {
            ...s,
            customThemes: customs,
            activeThemeId: nextActive
        };
    });
    
    draft = null;
    selectedId = '';
  }

  // Helper to bind color deeply
  function updateColor(path: string[], value: string) {
      if (!draft) return;
      let obj: any = draft.theme.scheme;
      for(let i=0; i<path.length-1; i++) {
          obj = obj[path[i]];
      }
      obj[path[path.length-1]] = value;
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="editor-overlay" onclick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
  <div class="editor-card">
    <div class="sidebar">
       <div class="sidebar-header">Themes</div>
       <div class="list">
         {#each allThemes as t}
           <button class="item" class:active={selectedId === t.theme.id} onclick={() => select(t.theme.id)}>
             {t.theme.name}
             {#if t.theme.isCustom} * {/if}
           </button>
         {/each}
       </div>
       <div class="footer">
         <button class="btn full" onclick={() => select(BUILTIN_THEMES[0].theme.id)}>Reset Selection</button>
       </div>
    </div>
    
    <div class="main">
       <div class="header">
         <h3>Theme Editor</h3>
         <button class="close-btn" onclick={onClose}><iconify-icon icon="mdi:close"></iconify-icon></button>
       </div>
       
       <div class="content">
         {#if draft}
            <div class="toolbar">
               {#if !isEditing}
                  <button class="btn primary" onclick={startEdit}>
                    {draft.theme.isCustom ? 'Edit Theme' : 'Create Copy to Edit'}
                  </button>
               {:else}
                  <button class="btn text" onclick={() => { isEditing = false; select(selectedId); }}>Cancel</button>
                  <button class="btn primary" onclick={save}>Save Changes</button>
                  {#if draft.theme.isCustom}
                    <button class="btn danger" onclick={deleteTheme}>Delete</button>
                  {/if}
               {/if}
            </div>
            
            <div class="form">
               <div class="form-row">
                 <label>Name</label>
                 <input type="text" bind:value={draft.theme.name} disabled={!isEditing} />
               </div>
               
               <div class="sections-grid">
                 <!-- LIGHT SCHEME -->
                 <div class="scheme-column">
                    <h4>Light Scheme</h4>
                    <div class="color-row">
                       <label>Background</label>
                       <input type="color" value={draft.theme.scheme.light.dashboardBackgroundColor1} 
                              oninput={(e) => updateColor(['light', 'dashboardBackgroundColor1'], e.currentTarget.value)} disabled={!isEditing}/>
                    </div>
                    <div class="color-row">
                       <label>Card Bg</label>
                       <input type="color" value={draft.theme.scheme.light.cardBackground} 
                              oninput={(e) => updateColor(['light', 'cardBackground'], e.currentTarget.value)} disabled={!isEditing}/>
                    </div>
                    <div class="color-row">
                       <label>Accent</label>
                       <input type="color" value={draft.theme.scheme.light.accentPrimary} 
                              oninput={(e) => updateColor(['light', 'accentPrimary'], e.currentTarget.value)} disabled={!isEditing}/>
                    </div>
                    <div class="color-row">
                       <label>Text Primary</label>
                       <input type="color" value={draft.theme.scheme.light.textPrimary} 
                              oninput={(e) => updateColor(['light', 'textPrimary'], e.currentTarget.value)} disabled={!isEditing}/>
                    </div>
                 </div>
                 
                 <!-- DARK SCHEME -->
                 <div class="scheme-column">
                    <h4>Dark Scheme</h4>
                    <div class="color-row">
                       <label>Background</label>
                       <input type="color" value={draft.theme.scheme.dark.dashboardBackgroundColor1} 
                              oninput={(e) => updateColor(['dark', 'dashboardBackgroundColor1'], e.currentTarget.value)} disabled={!isEditing}/>
                    </div>
                    <div class="color-row">
                       <label>Card Bg</label>
                       <input type="color" value={draft.theme.scheme.dark.cardBackground} 
                              oninput={(e) => updateColor(['dark', 'cardBackground'], e.currentTarget.value)} disabled={!isEditing}/>
                    </div>
                    <div class="color-row">
                       <label>Accent</label>
                       <input type="color" value={draft.theme.scheme.dark.accentPrimary} 
                              oninput={(e) => updateColor(['dark', 'accentPrimary'], e.currentTarget.value)} disabled={!isEditing}/>
                    </div>
                    <div class="color-row">
                       <label>Text Primary</label>
                       <input type="color" value={draft.theme.scheme.dark.textPrimary} 
                              oninput={(e) => updateColor(['dark', 'textPrimary'], e.currentTarget.value)} disabled={!isEditing}/>
                    </div>
                 </div>
               </div>
               
               {#if !isEditing}
                 <p class="hint">Click "Edit" to modify all properties.</p>
               {/if}
            </div>
         {:else}
            <div class="empty">Select a theme to view details</div>
         {/if}
       </div>
    </div>
  </div>
</div>

<style>
  .editor-overlay {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    z-index: 4000;
    display: flex; align-items: center; justify-content: center;
  }
  .editor-card {
    width: 800px; height: 600px;
    background: var(--bg-panel);
    border-radius: 12px;
    display: flex;
    overflow: hidden;
    box-shadow: var(--shadow-modal);
    border: 1px solid var(--border-primary);
  }
  
  .sidebar { width: 220px; background: var(--bg-secondary); border-right: 1px solid var(--border-primary); display: flex; flex-direction: column; }
  .sidebar-header { padding: 1rem; font-weight: bold; border-bottom: 1px solid var(--border-primary); }
  .list { flex: 1; overflow-y: auto; padding: 0.5rem; }
  .item { display: block; width: 100%; text-align: left; padding: 0.75rem; border: none; background: transparent; cursor: pointer; color: var(--text-primary); border-radius: 6px; margin-bottom: 2px; }
  .item:hover { background: var(--bg-chip); }
  .item.active { background: var(--accent-primary); color: white; }
  .footer { padding: 1rem; }
  
  .main { flex: 1; display: flex; flex-direction: column; background: var(--bg-page); }
  .header { display: flex; justify-content: space-between; padding: 1rem; border-bottom: 1px solid var(--border-primary); align-items: center; }
  .header h3 { margin: 0; font-size: 1.1rem; }
  .close-btn { background: transparent; border: none; cursor: pointer; font-size: 1.2rem; color: var(--text-secondary); }
  
  .content { padding: 1.5rem; flex: 1; overflow-y: auto; }
  .toolbar { margin-bottom: 1.5rem; display: flex; gap: 1rem; }
  
  .form-row { margin-bottom: 1rem; }
  .form-row label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; }
  input[type="text"] { width: 100%; padding: 0.5rem; background: var(--bg-input); border: 1px solid var(--border-input); color: var(--text-primary); border-radius: 4px; }
  
  .sections-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
  .scheme-column h4 { margin-top: 0; margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; }
  .color-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
  .color-row label { font-size: 0.85rem; }
  
  .btn { padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; }
  .btn.primary { background: var(--accent-primary); color: white; }
  .btn.text { background: transparent; color: var(--text-secondary); border: 1px solid var(--border-primary); }
  .btn.danger { background: rgba(244, 67, 54, 0.1); color: var(--accent-error); }
  .btn.full { width: 100%; }
  
  .empty { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); }
  .hint { margin-top: 2rem; color: var(--text-muted); font-size: 0.8rem; text-align: center; }
</style>
