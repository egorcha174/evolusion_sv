
<script lang="ts">
  import { t } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import type { ThemeFile, ColorScheme } from '../../../themes/types';
  import { applyThemeCSS } from '../../../themes/utils';
  import 'iconify-icon';

  let { draft = $bindable(), onSave, onCancel } = $props<{ 
    draft: ThemeFile, 
    onSave: (theme: ThemeFile) => void,
    onCancel: () => void 
  }>();

  let activeTab = $state<'light' | 'dark'>('light');
  let activeSection = $state<'background' | 'cards' | 'colors' | 'text'>('background');
  
  let currentScheme = $derived(draft.theme.scheme[activeTab]);

  function updateField(key: keyof ColorScheme, value: any) {
    // 1. Update draft state
    // @ts-ignore - Dynamic assignment to scheme
    draft.theme.scheme[activeTab][key] = value;
    
    // 2. Live Preview: Apply immediately to CSS
    applyThemeCSS(draft.theme.scheme[activeTab]);
  }

  // --- Components for Inputs to reduce boilerplate in markup ---
  // Note: In Svelte 5 we can use snippets for this locally
</script>

{#snippet colorInput(label, key)}
  <div class="control-row">
    <label class="control-label">{label}</label>
    <div class="color-wrapper">
      <input 
        type="color" 
        value={currentScheme[key] as string} 
        oninput={(e) => updateField(key, e.currentTarget.value)}
      />
      <span class="hex">{currentScheme[key]}</span>
    </div>
  </div>
{/snippet}

{#snippet rangeInput(label, key, min, max, step, unit = '')}
  <div class="control-col">
    <div class="range-header">
      <label class="control-label">{label}</label>
      <span class="range-val">{currentScheme[key]}{unit}</span>
    </div>
    <input 
      type="range" 
      {min} {max} {step}
      value={currentScheme[key] as number}
      oninput={(e) => updateField(key, parseFloat(e.currentTarget.value))}
    />
  </div>
{/snippet}

<div class="theme-editor">
  <!-- Header -->
  <div class="editor-header">
    <h3>{$t('settings.theme')} Editor</h3>
    <div class="actions">
       <button class="btn primary small" onclick={() => onSave(draft)}>{$t('common.save')}</button>
       <button class="btn text small" onclick={onCancel}>{$t('common.cancel')}</button>
    </div>
  </div>

  <div class="main-config">
    <div class="field-group">
      <label>Theme Name</label>
      <input type="text" class="text-input" bind:value={draft.theme.name} />
    </div>
  </div>

  <!-- Mode Switcher -->
  <div class="mode-tabs">
    <button class="mode-tab" class:active={activeTab === 'light'} onclick={() => activeTab = 'light'}>
        <iconify-icon icon="mdi:white-balance-sunny"></iconify-icon> Light
    </button>
    <button class="mode-tab" class:active={activeTab === 'dark'} onclick={() => activeTab = 'dark'}>
        <iconify-icon icon="mdi:weather-night"></iconify-icon> Dark
    </button>
  </div>

  <!-- Section Tabs -->
  <div class="section-tabs">
    <button class="sec-tab" class:active={activeSection === 'background'} onclick={() => activeSection = 'background'}>
      <iconify-icon icon="mdi:image-outline"></iconify-icon>
      <span>Background</span>
    </button>
    <button class="sec-tab" class:active={activeSection === 'cards'} onclick={() => activeSection = 'cards'}>
      <iconify-icon icon="mdi:card-outline"></iconify-icon>
      <span>Cards</span>
    </button>
    <button class="sec-tab" class:active={activeSection === 'colors'} onclick={() => activeSection = 'colors'}>
      <iconify-icon icon="mdi:palette-outline"></iconify-icon>
      <span>Palette</span>
    </button>
    <button class="sec-tab" class:active={activeSection === 'text'} onclick={() => activeSection = 'text'}>
      <iconify-icon icon="mdi:format-font"></iconify-icon>
      <span>Text</span>
    </button>
  </div>

  <div class="scroll-content">
    {#if activeSection === 'background'}
      <div class="section-content" transition:slide|local>
        <div class="control-col">
          <label class="control-label">Background Type</label>
          <select 
            class="select-input"
            value={currentScheme.dashboardBackgroundType}
            onchange={(e) => updateField('dashboardBackgroundType', e.currentTarget.value)}
          >
            <option value="color">Solid Color</option>
            <option value="gradient">Gradient</option>
            <option value="image">Image URL</option>
          </select>
        </div>

        {#if currentScheme.dashboardBackgroundType === 'color'}
          {@render colorInput('Background Color', 'dashboardBackgroundColor1')}
        {:else if currentScheme.dashboardBackgroundType === 'gradient'}
          {@render colorInput('Start Color', 'dashboardBackgroundColor1')}
          {@render colorInput('End Color', 'dashboardBackgroundColor2')}
        {:else if currentScheme.dashboardBackgroundType === 'image'}
          <div class="control-col">
            <label class="control-label">Image URL</label>
            <input 
              type="text" class="text-input" 
              value={currentScheme.dashboardBackgroundImageUrl || ''} 
              oninput={(e) => updateField('dashboardBackgroundImageUrl', e.currentTarget.value)}
              placeholder="https://..."
            />
          </div>
          {@render colorInput('Fallback Color', 'dashboardBackgroundColor1')}
          {@render rangeInput('Blur', 'dashboardBackgroundImageBlur', 0, 20, 1, 'px')}
          {@render rangeInput('Brightness', 'dashboardBackgroundImageBrightness', 0, 200, 5, '%')}
        {/if}

        <div class="divider"></div>
        {@render rangeInput('Panel Opacity', 'panelOpacity', 0, 1, 0.05)}
        {@render colorInput('Panel Background', 'bgPanel')}
      </div>

    {:else if activeSection === 'cards'}
      <div class="section-content" transition:slide|local>
        <div class="subsection-title">Appearance</div>
        {@render colorInput('Background (Off)', 'cardBackground')}
        {@render colorInput('Background (On)', 'cardBackgroundOn')}
        {@render rangeInput('Opacity', 'cardOpacity', 0, 1, 0.05)}
        
        <div class="divider"></div>
        <div class="subsection-title">Borders</div>
        {@render rangeInput('Radius', 'cardBorderRadius', 0, 32, 1, 'px')}
        {@render rangeInput('Width', 'cardBorderWidth', 0, 10, 1, 'px')}
        {@render colorInput('Border Color', 'cardBorderColor')}
        {@render colorInput('Border Active', 'cardBorderColorOn')}
        
        <div class="divider"></div>
        <div class="control-col">
           <label class="control-label">Shadow CSS</label>
           <input 
             type="text" class="text-input" 
             value={currentScheme.shadowCard || 'none'} 
             oninput={(e) => updateField('shadowCard', e.currentTarget.value)}
           />
        </div>
      </div>

    {:else if activeSection === 'colors'}
      <div class="section-content" transition:slide|local>
        <div class="subsection-title">Accents</div>
        {@render colorInput('Primary Accent', 'accentPrimary')}
        {@render colorInput('Secondary', 'accentSecondary')}
        {@render colorInput('Info', 'accentInfo')}
        
        <div class="divider"></div>
        <div class="subsection-title">States</div>
        {@render colorInput('State On', 'stateOn')}
        {@render colorInput('State Off', 'stateOff')}
        {@render colorInput('Success', 'accentSuccess')}
        {@render colorInput('Warning', 'accentWarning')}
        {@render colorInput('Error', 'accentError')}
      </div>

    {:else if activeSection === 'text'}
      <div class="section-content" transition:slide|local>
        <div class="subsection-title">General Text</div>
        {@render colorInput('Primary Text', 'textPrimary')}
        {@render colorInput('Secondary Text', 'textSecondary')}
        {@render colorInput('Muted Text', 'textMuted')}
        
        <div class="divider"></div>
        <div class="subsection-title">Card Text</div>
        {@render colorInput('Name', 'nameTextColor')}
        {@render colorInput('State/Value', 'valueTextColor')}
        {@render colorInput('Status/Unit', 'statusTextColor')}
        
        <div class="divider"></div>
        <div class="subsection-title">Active Card Text</div>
        {@render colorInput('Name (Active)', 'nameTextColorOn')}
        {@render colorInput('Value (Active)', 'valueTextColorOn')}
      </div>
    {/if}
  </div>
</div>

<style>
  .theme-editor {
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--border-primary);
    display: flex;
    flex-direction: column;
    height: 600px; /* Fixed height for scrollable area */
    max-height: 70vh;
    overflow: hidden;
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--bg-panel);
    border-bottom: 1px solid var(--border-divider);
  }
  
  .editor-header h3 { margin: 0; font-size: 1rem; color: var(--text-primary); }
  .actions { display: flex; gap: 0.5rem; }

  .main-config {
    padding: 1rem;
    background: var(--bg-panel);
  }

  .mode-tabs {
    display: flex;
    padding: 0.5rem 1rem;
    gap: 0.5rem;
    background: var(--bg-panel);
    border-bottom: 1px solid var(--border-divider);
  }
  
  .mode-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid var(--border-primary);
    background: var(--bg-card);
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
  }
  .mode-tab.active {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);
  }

  .section-tabs {
    display: flex;
    overflow-x: auto;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-divider);
    scrollbar-width: none;
  }
  
  .sec-tab {
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.75rem;
    border-bottom: 2px solid transparent;
    min-width: 80px;
  }
  .sec-tab iconify-icon { font-size: 1.2rem; }
  .sec-tab.active { color: var(--accent-primary); border-bottom-color: var(--accent-primary); background: var(--bg-card-hover); }

  .scroll-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    background: var(--bg-card);
  }

  .section-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .subsection-title {
    font-size: 0.8rem;
    text-transform: uppercase;
    color: var(--text-muted);
    font-weight: 600;
    margin-top: 0.5rem;
  }

  .field-group { margin-bottom: 0.5rem; }
  .field-group label { display: block; font-size: 0.8rem; margin-bottom: 0.25rem; color: var(--text-secondary); }

  /* Controls */
  .control-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .control-col {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .control-label {
    font-size: 0.9rem;
    color: var(--text-primary);
  }

  .text-input, .select-input {
    width: 100%;
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid var(--border-input);
    background: var(--bg-input);
    color: var(--text-primary);
    font-size: 0.9rem;
  }

  .color-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .hex {
    font-family: monospace;
    font-size: 0.85rem;
    color: var(--text-secondary);
    width: 65px;
  }
  
  input[type="color"] {
    -webkit-appearance: none;
    border: none;
    width: 32px;
    height: 32px;
    padding: 0;
    background: none;
    cursor: pointer;
    border-radius: 50%;
    overflow: hidden;
  }
  input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
  input[type="color"]::-webkit-color-swatch { border: 1px solid rgba(0,0,0,0.1); border-radius: 50%; }

  .range-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
  .range-val { font-family: monospace; }
  
  input[type="range"] {
    width: 100%;
    accent-color: var(--accent-primary);
  }

  .divider {
    height: 1px;
    background: var(--border-divider);
    margin: 0.5rem 0;
  }

  .btn {
    padding: 0.4rem 0.8rem; border-radius: 6px; border: none; font-weight: 500; cursor: pointer; font-size: 0.85rem;
  }
  .btn.primary { background: var(--accent-primary); color: white; }
  .btn.text { background: transparent; color: var(--text-secondary); }
  .btn.text:hover { background: var(--bg-chip); color: var(--text-primary); }
</style>
