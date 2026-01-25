
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
</script>

{#snippet colorInput(label, key)}
  <div class="control-card">
    <div class="control-header">
      <span class="label">{label}</span>
      <span class="value-preview">{currentScheme[key]}</span>
    </div>
    <div class="color-picker-container">
      <input 
        type="color" 
        class="color-input"
        value={currentScheme[key] as string} 
        oninput={(e) => updateField(key, e.currentTarget.value)}
      />
      <!-- Visual Swatch overlaying the input -->
      <div class="color-swatch" style:background-color={currentScheme[key] as string}></div>
    </div>
  </div>
{/snippet}

{#snippet rangeInput(label, key, min, max, step, unit = '')}
  <div class="control-card">
    <div class="control-header">
      <span class="label">{label}</span>
      <span class="value-preview">{currentScheme[key]}{unit}</span>
    </div>
    <div class="range-wrapper">
      <input 
        type="range" 
        class="range-input"
        {min} {max} {step}
        value={currentScheme[key] as number}
        oninput={(e) => updateField(key, parseFloat(e.currentTarget.value))}
      />
    </div>
  </div>
{/snippet}

<div class="theme-editor">
  <!-- Header -->
  <div class="editor-header">
    <h3>{$t('settings.theme')} Editor</h3>
    <button class="icon-btn" onclick={onCancel} title={$t('common.close')}>
      <iconify-icon icon="mdi:close"></iconify-icon>
    </button>
  </div>

  <!-- Name Input -->
  <div class="meta-section">
    <div class="input-group">
      <label>Theme Name</label>
      <input type="text" class="text-input" bind:value={draft.theme.name} placeholder="My Awesome Theme" />
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
      <span>BG</span>
    </button>
    <button class="sec-tab" class:active={activeSection === 'cards'} onclick={() => activeSection = 'cards'}>
      <iconify-icon icon="mdi:card-outline"></iconify-icon>
      <span>Cards</span>
    </button>
    <button class="sec-tab" class:active={activeSection === 'colors'} onclick={() => activeSection = 'colors'}>
      <iconify-icon icon="mdi:palette-outline"></iconify-icon>
      <span>Colors</span>
    </button>
    <button class="sec-tab" class:active={activeSection === 'text'} onclick={() => activeSection = 'text'}>
      <iconify-icon icon="mdi:format-font"></iconify-icon>
      <span>Text</span>
    </button>
  </div>

  <div class="scroll-content">
    {#if activeSection === 'background'}
      <div class="section-content" transition:slide|local>
        <div class="control-card">
          <label class="label">Background Type</label>
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
          <div class="control-card">
            <label class="label">Image URL</label>
            <input 
              type="text" class="text-input" 
              value={currentScheme.dashboardBackgroundImageUrl || ''} 
              oninput={(e) => updateField('dashboardBackgroundImageUrl', e.currentTarget.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          {@render colorInput('Fallback Color', 'dashboardBackgroundColor1')}
          {@render rangeInput('Blur', 'dashboardBackgroundImageBlur', 0, 20, 1, 'px')}
          {@render rangeInput('Brightness', 'dashboardBackgroundImageBrightness', 0, 200, 5, '%')}
        {/if}

        <div class="section-divider">Panel Settings</div>
        {@render rangeInput('Panel Opacity', 'panelOpacity', 0, 1, 0.05)}
        {@render colorInput('Panel Background', 'bgPanel')}
      </div>

    {:else if activeSection === 'cards'}
      <div class="section-content" transition:slide|local>
        <div class="section-divider">Appearance</div>
        {@render colorInput('Background (Idle)', 'cardBackground')}
        {@render colorInput('Background (Active)', 'cardBackgroundOn')}
        {@render rangeInput('Opacity', 'cardOpacity', 0, 1, 0.05)}
        
        <div class="section-divider">Borders</div>
        {@render rangeInput('Radius', 'cardBorderRadius', 0, 32, 1, 'px')}
        {@render rangeInput('Width', 'cardBorderWidth', 0, 10, 1, 'px')}
        {@render colorInput('Border Color', 'cardBorderColor')}
        {@render colorInput('Border Active', 'cardBorderColorOn')}
        
        <div class="section-divider">Shadow</div>
        <div class="control-card">
           <label class="label">Shadow CSS</label>
           <input 
             type="text" class="text-input" 
             value={currentScheme.shadowCard || 'none'} 
             oninput={(e) => updateField('shadowCard', e.currentTarget.value)}
             placeholder="e.g. 0 4px 6px rgba(0,0,0,0.1)"
           />
        </div>
      </div>

    {:else if activeSection === 'colors'}
      <div class="section-content" transition:slide|local>
        <div class="section-divider">Accents</div>
        {@render colorInput('Primary Accent', 'accentPrimary')}
        {@render colorInput('Secondary', 'accentSecondary')}
        {@render colorInput('Info', 'accentInfo')}
        
        <div class="section-divider">States</div>
        {@render colorInput('State On', 'stateOn')}
        {@render colorInput('State Off', 'stateOff')}
        {@render colorInput('Success', 'accentSuccess')}
        {@render colorInput('Warning', 'accentWarning')}
        {@render colorInput('Error', 'accentError')}
      </div>

    {:else if activeSection === 'text'}
      <div class="section-content" transition:slide|local>
        <div class="section-divider">Global Text</div>
        {@render colorInput('Primary Text', 'textPrimary')}
        {@render colorInput('Secondary Text', 'textSecondary')}
        {@render colorInput('Muted Text', 'textMuted')}
        
        <div class="section-divider">Card Text</div>
        {@render colorInput('Name', 'nameTextColor')}
        {@render colorInput('State/Value', 'valueTextColor')}
        {@render colorInput('Status/Unit', 'statusTextColor')}
        
        <div class="section-divider">Active Card Text</div>
        {@render colorInput('Name (Active)', 'nameTextColorOn')}
        {@render colorInput('Value (Active)', 'valueTextColorOn')}
      </div>
    {/if}
  </div>

  <div class="editor-footer">
    <button class="btn secondary" onclick={onCancel}>{$t('common.cancel')}</button>
    <button class="btn primary" onclick={() => onSave(draft)}>
      <iconify-icon icon="mdi:content-save"></iconify-icon>
      {$t('common.save')}
    </button>
  </div>
</div>

<style>
  .theme-editor {
    background: var(--bg-page);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 85vh; /* Keep within viewport */
    overflow: hidden;
    color: var(--text-primary);
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: var(--bg-panel);
    border-bottom: 1px solid var(--border-divider);
    flex-shrink: 0;
  }
  
  .editor-header h3 { margin: 0; font-size: 1.1rem; font-weight: 600; }
  
  .icon-btn {
    background: transparent; border: none; cursor: pointer; color: var(--text-secondary);
    padding: 4px; display: flex;
  }
  .icon-btn:hover { color: var(--text-primary); }

  .meta-section {
    padding: 1rem 1.5rem 0.5rem 1.5rem;
    background: var(--bg-panel);
  }

  .input-group label { display: block; font-size: 0.8rem; margin-bottom: 0.4rem; color: var(--text-secondary); font-weight: 500; }
  .text-input, .select-input {
    width: 100%; padding: 0.6rem; border-radius: 8px;
    border: 1px solid var(--border-input); background: var(--bg-input);
    color: var(--text-primary); font-size: 0.95rem;
    transition: border-color 0.2s;
  }
  .text-input:focus, .select-input:focus { outline: none; border-color: var(--accent-primary); }

  .mode-tabs {
    display: flex; gap: 0.5rem; padding: 0.5rem 1.5rem;
    background: var(--bg-panel); border-bottom: 1px solid var(--border-divider);
  }
  
  .mode-tab {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    padding: 0.6rem; border-radius: 8px; border: 1px solid var(--border-primary);
    background: var(--bg-card); color: var(--text-secondary); cursor: pointer;
    font-size: 0.9rem; font-weight: 500; transition: all 0.2s;
  }
  .mode-tab:hover { background: var(--bg-card-hover); }
  .mode-tab.active { background: var(--accent-primary); color: white; border-color: var(--accent-primary); }

  .section-tabs {
    display: flex; gap: 1rem; padding: 0 1.5rem;
    background: var(--bg-secondary); border-bottom: 1px solid var(--border-divider);
    overflow-x: auto; flex-shrink: 0;
  }
  
  .sec-tab {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 0.8rem 0.5rem; gap: 4px; background: transparent; border: none;
    color: var(--text-secondary); cursor: pointer; font-size: 0.75rem; font-weight: 600;
    border-bottom: 2px solid transparent; min-width: 60px;
  }
  .sec-tab iconify-icon { font-size: 1.2rem; }
  .sec-tab:hover { color: var(--text-primary); }
  .sec-tab.active { color: var(--accent-primary); border-bottom-color: var(--accent-primary); }

  .scroll-content {
    flex: 1; overflow-y: auto; padding: 1.5rem;
    background: var(--bg-secondary);
  }

  .section-content { display: flex; flex-direction: column; gap: 0.75rem; }

  .section-divider {
    font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;
    color: var(--text-muted); font-weight: 700; margin: 1rem 0 0.5rem 0;
  }
  .section-divider:first-child { margin-top: 0; }

  /* New Card Style Controls */
  .control-card {
    background: var(--bg-card);
    border: 1px solid var(--border-primary);
    border-radius: 10px;
    padding: 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .control-header {
    display: flex; justify-content: space-between; align-items: center;
  }
  .control-header .label { font-size: 0.9rem; font-weight: 500; color: var(--text-primary); }
  .value-preview { font-family: monospace; font-size: 0.8rem; color: var(--text-muted); }

  .color-picker-container {
    position: relative; height: 36px; width: 100%;
    border-radius: 6px; overflow: hidden; border: 1px solid var(--border-input);
  }
  .color-input {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    opacity: 0; cursor: pointer; z-index: 2;
  }
  .color-swatch {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    z-index: 1;
  }

  .range-wrapper { width: 100%; padding: 0 2px; }
  .range-input { width: 100%; accent-color: var(--accent-primary); cursor: pointer; }

  /* Footer */
  .editor-footer {
    padding: 1rem 1.5rem;
    background: var(--bg-panel);
    border-top: 1px solid var(--border-divider);
    display: flex; gap: 1rem; flex-shrink: 0;
    box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
  }

  .btn {
    padding: 0.75rem 1.5rem; border-radius: 8px; border: none; font-weight: 600; font-size: 1rem;
    cursor: pointer; flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    transition: opacity 0.2s;
  }
  .btn:hover { opacity: 0.9; }
  .btn.primary { background: var(--accent-primary); color: white; }
  .btn.secondary { background: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border-input); }
</style>
