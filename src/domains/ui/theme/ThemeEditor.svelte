
<script lang="ts">
  import { t } from 'svelte-i18n';
  import type { ThemeFile, ColorScheme } from '../../../themes/types';
  import { applyThemeCSS } from '../../../themes/utils';
  import 'iconify-icon';

  let { draft = $bindable(), onSave, onCancel } = $props<{ 
    draft: ThemeFile, 
    onSave: (theme: ThemeFile) => void,
    onCancel: () => void 
  }>();

  let activeTab = $state<'light' | 'dark'>('light');
  
  let currentScheme = $derived(draft.theme.scheme[activeTab]);

  // Helper to update deeply nested color
  function updateColor(key: keyof ColorScheme, value: string) {
    // 1. Update draft state
    (draft.theme.scheme[activeTab] as any)[key] = value;
    
    // 2. Live Preview: Apply immediately to CSS
    applyThemeCSS(draft.theme.scheme[activeTab]);
  }

  // Groups of colors for better UI organization
  const colorGroups = [
    {
      title: 'Backgrounds',
      fields: [
        { key: 'dashboardBackgroundColor1', label: 'Dashboard Bg' },
        { key: 'cardBackground', label: 'Card Bg' },
        { key: 'bgPanel', label: 'Panel Bg', fallback: '#ffffff' }, // Optional in schema, ensure fallback
      ]
    },
    {
      title: 'Text & Icons',
      fields: [
        { key: 'textPrimary', label: 'Primary Text' },
        { key: 'textSecondary', label: 'Secondary Text' },
        { key: 'accentPrimary', label: 'Accent Color' },
      ]
    },
    {
        title: 'Status',
        fields: [
            { key: 'stateOn', label: 'State On' },
            { key: 'stateOff', label: 'State Off' }
        ]
    }
  ];
</script>

<div class="inline-editor">
  <div class="editor-header">
    <h3>Edit Theme</h3>
    <div class="header-actions">
       <button class="btn primary small" onclick={() => onSave(draft)}>{$t('common.save')}</button>
       <button class="btn text small" onclick={onCancel}>{$t('common.cancel')}</button>
    </div>
  </div>

  <div class="form-row">
    <label>Name</label>
    <input type="text" bind:value={draft.theme.name} />
  </div>

  <div class="scheme-tabs">
    <button class="tab" class:active={activeTab === 'light'} onclick={() => activeTab = 'light'}>
        <iconify-icon icon="mdi:white-balance-sunny"></iconify-icon> Light
    </button>
    <button class="tab" class:active={activeTab === 'dark'} onclick={() => activeTab = 'dark'}>
        <iconify-icon icon="mdi:weather-night"></iconify-icon> Dark
    </button>
  </div>

  <div class="colors-container">
     <!-- Render simplified color inputs. In a real app this would iterate all schema fields -->
     {#each colorGroups as group}
        <div class="group">
           <h4>{group.title}</h4>
           {#each group.fields as field}
              <div class="color-row">
                 <label>{field.label}</label>
                 <div class="input-wrapper">
                    <input 
                        type="color" 
                        value={(currentScheme as any)[field.key] || field.fallback || '#000000'} 
                        oninput={(e) => updateColor(field.key as keyof ColorScheme, e.currentTarget.value)}
                    />
                    <span class="hex">{(currentScheme as any)[field.key]}</span>
                 </div>
              </div>
           {/each}
        </div>
     {/each}
     
     <div class="hint">
        Click Save to persist changes. Changes are previewed live.
     </div>
  </div>
</div>

<style>
  .inline-editor {
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 1rem;
    border: 1px solid var(--border-primary);
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  h3 { margin: 0; font-size: 1rem; color: var(--text-primary); }
  
  .header-actions { display: flex; gap: 0.5rem; }

  .form-row { margin-bottom: 1rem; }
  .form-row label { display: block; margin-bottom: 0.25rem; font-size: 0.85rem; color: var(--text-secondary); }
  .form-row input { 
    width: 100%; padding: 0.5rem; border-radius: 6px; 
    border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary);
  }

  .scheme-tabs {
    display: flex;
    margin-bottom: 1rem;
    background: var(--bg-input);
    padding: 4px;
    border-radius: 8px;
  }
  
  .tab {
    flex: 1;
    border: none;
    background: transparent;
    padding: 6px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 0.9rem;
    color: var(--text-secondary);
    transition: all 0.2s;
  }
  
  .tab.active {
    background: var(--bg-card);
    color: var(--text-primary);
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    font-weight: 500;
  }

  .colors-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .group h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.8rem;
    text-transform: uppercase;
    color: var(--text-muted);
    letter-spacing: 0.5px;
  }
  
  .color-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .color-row label { font-size: 0.9rem; color: var(--text-primary); }
  
  .input-wrapper { display: flex; align-items: center; gap: 0.5rem; }
  
  input[type="color"] {
    -webkit-appearance: none;
    border: none;
    width: 24px;
    height: 24px;
    padding: 0;
    background: none;
    cursor: pointer;
    border-radius: 50%;
    overflow: hidden;
  }
  
  input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
  input[type="color"]::-webkit-color-swatch { border: 1px solid rgba(0,0,0,0.1); border-radius: 50%; }
  
  .hex {
    font-family: monospace;
    font-size: 0.8rem;
    color: var(--text-secondary);
    width: 60px;
  }

  .btn {
    padding: 0.4rem 0.8rem; border-radius: 6px; border: none; font-weight: 500; cursor: pointer; font-size: 0.85rem;
  }
  .btn.primary { background: var(--accent-primary); color: white; }
  .btn.text { background: transparent; color: var(--text-secondary); }
  .btn.text:hover { background: var(--bg-chip); color: var(--text-primary); }
  
  .hint { margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted); text-align: center; }
</style>
