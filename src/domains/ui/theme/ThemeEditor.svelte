
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

{#snippet colorRow(label, key)}
  <div class="control-row">
    <span class="label">{label}</span>
    <div class="color-composite">
      <span class="hex-value">{currentScheme[key]}</span>
      <div class="color-wrapper">
        <input 
          type="color" 
          value={currentScheme[key] as string} 
          oninput={(e) => updateField(key, e.currentTarget.value)}
        />
        <div class="swatch" style:background-color={currentScheme[key] as string}></div>
      </div>
    </div>
  </div>
{/snippet}

{#snippet sliderRow(label, key, min, max, step, unit = '')}
  <div class="control-stack">
    <div class="header-row">
      <span class="label">{label}</span>
      <span class="value-badge">{currentScheme[key]}{unit}</span>
    </div>
    <input 
      type="range" 
      class="slider"
      {min} {max} {step}
      value={currentScheme[key] as number}
      oninput={(e) => updateField(key, parseFloat(e.currentTarget.value))}
    />
  </div>
{/snippet}

<div class="theme-editor-container">
  <!-- 1. Header -->
  <header class="editor-header">
    <div class="title-block">
      <h2>{$t('settings.theme')} Editor</h2>
      <p class="subtitle">Customize the look and feel of your dashboard</p>
    </div>
    <button class="icon-btn close" onclick={onCancel} title={$t('common.close')}>
      <iconify-icon icon="mdi:close"></iconify-icon>
    </button>
  </header>

  <div class="editor-body">
    <!-- 2. Meta & Mode -->
    <div class="top-controls">
      <div class="input-group">
        <label>Theme Name</label>
        <input 
          type="text" 
          class="modern-input" 
          bind:value={draft.theme.name} 
          placeholder="My Awesome Theme" 
        />
      </div>

      <!-- Segmented Control for Mode -->
      <div class="segmented-control">
        <button 
          class="segment" 
          class:active={activeTab === 'light'} 
          onclick={() => activeTab = 'light'}
        >
          <iconify-icon icon="mdi:white-balance-sunny"></iconify-icon>
          <span>Light</span>
        </button>
        <button 
          class="segment" 
          class:active={activeTab === 'dark'} 
          onclick={() => activeTab = 'dark'}
        >
          <iconify-icon icon="mdi:weather-night"></iconify-icon>
          <span>Dark</span>
        </button>
        <div class="segment-indicator" style:left={activeTab === 'light' ? '4px' : '50%'}></div>
      </div>
    </div>

    <!-- 3. Navigation Pills -->
    <div class="nav-pills">
      <button class="pill" class:active={activeSection === 'background'} onclick={() => activeSection = 'background'}>
        Background
      </button>
      <button class="pill" class:active={activeSection === 'cards'} onclick={() => activeSection = 'cards'}>
        Cards
      </button>
      <button class="pill" class:active={activeSection === 'colors'} onclick={() => activeSection = 'colors'}>
        Colors
      </button>
      <button class="pill" class:active={activeSection === 'text'} onclick={() => activeSection = 'text'}>
        Typography
      </button>
    </div>

    <!-- 4. Scrollable Content Area -->
    <div class="content-scroll">
      {#if activeSection === 'background'}
        <div class="section-group" transition:slide|local={{ duration: 200 }}>
          <div class="control-stack">
            <label class="label">Background Type</label>
            <select 
              class="modern-select"
              value={currentScheme.dashboardBackgroundType}
              onchange={(e) => updateField('dashboardBackgroundType', e.currentTarget.value)}
            >
              <option value="color">Solid Color</option>
              <option value="gradient">Gradient</option>
              <option value="image">Image URL</option>
            </select>
          </div>

          {#if currentScheme.dashboardBackgroundType === 'color'}
            {@render colorRow('Background Color', 'dashboardBackgroundColor1')}
          {:else if currentScheme.dashboardBackgroundType === 'gradient'}
            {@render colorRow('Start Color', 'dashboardBackgroundColor1')}
            {@render colorRow('End Color', 'dashboardBackgroundColor2')}
          {:else if currentScheme.dashboardBackgroundType === 'image'}
            <div class="input-group">
              <label>Image URL</label>
              <input 
                type="text" class="modern-input" 
                value={currentScheme.dashboardBackgroundImageUrl || ''} 
                oninput={(e) => updateField('dashboardBackgroundImageUrl', e.currentTarget.value)}
                placeholder="https://..."
              />
            </div>
            {@render sliderRow('Blur', 'dashboardBackgroundImageBlur', 0, 20, 1, 'px')}
            {@render sliderRow('Brightness', 'dashboardBackgroundImageBrightness', 0, 200, 5, '%')}
          {/if}

          <div class="divider">Panel & UI</div>
          {@render sliderRow('Panel Opacity', 'panelOpacity', 0, 1, 0.05)}
          {@render colorRow('Panel Background', 'bgPanel')}
        </div>

      {:else if activeSection === 'cards'}
        <div class="section-group" transition:slide|local={{ duration: 200 }}>
          <div class="divider">Appearance</div>
          {@render colorRow('Card Background', 'cardBackground')}
          {@render colorRow('Active Background', 'cardBackgroundOn')}
          {@render sliderRow('Opacity', 'cardOpacity', 0, 1, 0.05)}
          
          <div class="divider">Borders</div>
          {@render sliderRow('Corner Radius', 'cardBorderRadius', 0, 32, 1, 'px')}
          {@render sliderRow('Border Width', 'cardBorderWidth', 0, 10, 1, 'px')}
          {@render colorRow('Border Color', 'cardBorderColor')}
          {@render colorRow('Active Border', 'cardBorderColorOn')}
          
          <div class="divider">Shadow</div>
          <div class="input-group">
             <label>Box Shadow CSS</label>
             <input 
               type="text" class="modern-input" 
               value={currentScheme.shadowCard || 'none'} 
               oninput={(e) => updateField('shadowCard', e.currentTarget.value)}
             />
          </div>
        </div>

      {:else if activeSection === 'colors'}
        <div class="section-group" transition:slide|local={{ duration: 200 }}>
          <div class="divider">Accents</div>
          {@render colorRow('Primary Brand', 'accentPrimary')}
          {@render colorRow('Secondary', 'accentSecondary')}
          {@render colorRow('Info Blue', 'accentInfo')}
          
          <div class="divider">State Colors</div>
          {@render colorRow('State: On', 'stateOn')}
          {@render colorRow('State: Off', 'stateOff')}
          {@render colorRow('Success / Green', 'accentSuccess')}
          {@render colorRow('Warning / Orange', 'accentWarning')}
          {@render colorRow('Error / Red', 'accentError')}
        </div>

      {:else if activeSection === 'text'}
        <div class="section-group" transition:slide|local={{ duration: 200 }}>
          <div class="divider">Global</div>
          {@render colorRow('Primary Text', 'textPrimary')}
          {@render colorRow('Secondary Text', 'textSecondary')}
          {@render colorRow('Muted Text', 'textMuted')}
          
          <div class="divider">Cards (Idle)</div>
          {@render colorRow('Device Name', 'nameTextColor')}
          {@render colorRow('State Value', 'valueTextColor')}
          {@render colorRow('Secondary Info', 'statusTextColor')}
          
          <div class="divider">Cards (Active)</div>
          {@render colorRow('Device Name', 'nameTextColorOn')}
          {@render colorRow('State Value', 'valueTextColorOn')}
        </div>
      {/if}
    </div>
  </div>

  <!-- 5. Footer Actions -->
  <div class="editor-footer">
    <button class="btn secondary" onclick={onCancel}>
      {$t('common.cancel')}
    </button>
    <button class="btn primary" onclick={() => onSave(draft)}>
      <iconify-icon icon="mdi:content-save"></iconify-icon>
      {$t('common.save')}
    </button>
  </div>
</div>

<style>
  /* --- Layout & Reset --- */
  .theme-editor-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 85vh; /* Keep it contained */
    background: var(--bg-panel, #ffffff);
    color: var(--text-primary, #333);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    /* Force font for editor consistency */
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  /* --- Header --- */
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(0,0,0,0.06);
    background: var(--bg-panel, #ffffff);
  }
  .title-block h2 { margin: 0; font-size: 1.2rem; font-weight: 700; color: var(--text-primary); }
  .title-block .subtitle { margin: 4px 0 0 0; font-size: 0.85rem; color: var(--text-secondary); }
  
  .icon-btn.close {
    background: rgba(0,0,0,0.05);
    border: none;
    border-radius: 50%;
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--text-primary);
    transition: background 0.2s;
  }
  .icon-btn.close:hover { background: rgba(0,0,0,0.1); }

  /* --- Body --- */
  .editor-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* For inner scroll */
    background: var(--bg-secondary, #f7f8fa); /* Content background slightly distinctive */
  }

  .top-controls {
    padding: 1.5rem 1.5rem 0.5rem 1.5rem;
    background: var(--bg-panel, #ffffff);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  /* --- Inputs & Controls --- */
  .input-group label {
    display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-secondary);
  }
  
  /* Modern Input: Solid light grey background to ensure visibility */
  .modern-input, .modern-select {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    border: 1px solid transparent;
    border-radius: 10px;
    background-color: rgba(0,0,0,0.06); /* Always visible grey */
    color: var(--text-primary);
    transition: all 0.2s;
  }
  .modern-input:focus, .modern-select:focus {
    background-color: #ffffff;
    border-color: var(--accent-primary, #007bff);
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.15);
    outline: none;
  }

  /* --- Segmented Control (iOS style) --- */
  .segmented-control {
    position: relative;
    display: flex;
    background: rgba(0,0,0,0.06);
    padding: 4px;
    border-radius: 10px;
    height: 44px;
  }
  .segment {
    flex: 1;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: transparent;
    border: none;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-secondary);
    z-index: 2;
    cursor: pointer;
    transition: color 0.2s;
  }
  .segment.active { color: var(--text-primary); }
  .segment-indicator {
    position: absolute;
    top: 4px; bottom: 4px;
    width: calc(50% - 4px);
    background: #ffffff;
    border-radius: 7px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    z-index: 1;
  }

  /* --- Navigation Pills --- */
  .nav-pills {
    display: flex;
    padding: 0 1.5rem 1rem 1.5rem;
    background: var(--bg-panel, #ffffff);
    border-bottom: 1px solid rgba(0,0,0,0.06);
    gap: 0.5rem;
    overflow-x: auto;
  }
  .pill {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    border: none;
    background: transparent;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-secondary);
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
  }
  .pill:hover { background: rgba(0,0,0,0.03); color: var(--text-primary); }
  .pill.active {
    background: var(--accent-primary, #007bff);
    color: #ffffff;
  }

  /* --- Content Area --- */
  .content-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }
  
  .section-group {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .divider {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
    color: var(--text-muted);
    margin: 1rem 0 0.25rem 0;
    border-bottom: 1px solid rgba(0,0,0,0.06);
    padding-bottom: 0.5rem;
  }
  .divider:first-child { margin-top: 0; }

  /* Control Rows */
  .control-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
  }
  .control-row .label { font-size: 0.95rem; font-weight: 500; color: var(--text-primary); }
  
  .control-stack {
    display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.5rem;
  }
  .header-row { display: flex; justify-content: space-between; }
  .value-badge { 
    font-family: monospace; font-size: 0.8rem; 
    background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; 
  }

  /* Color Picker */
  .color-composite {
    display: flex; align-items: center; gap: 1rem;
  }
  .hex-value { font-family: monospace; font-size: 0.9rem; color: var(--text-secondary); }
  
  .color-wrapper {
    position: relative;
    width: 36px; height: 36px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: inset 0 0 0 2px rgba(0,0,0,0.1);
    cursor: pointer;
  }
  .color-wrapper input {
    position: absolute; top: -10px; left: -10px; width: 60px; height: 60px; opacity: 0; cursor: pointer;
  }
  .color-wrapper .swatch {
    width: 100%; height: 100%;
  }

  /* Slider */
  .slider {
    width: 100%; height: 6px; border-radius: 3px; background: rgba(0,0,0,0.1); outline: none; appearance: none;
  }
  .slider::-webkit-slider-thumb {
    appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--accent-primary, #007bff); cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  /* --- Footer --- */
  .editor-footer {
    padding: 1.25rem 1.5rem;
    background: var(--bg-panel, #ffffff);
    border-top: 1px solid rgba(0,0,0,0.06);
    display: flex; gap: 1rem;
  }
  
  .btn {
    flex: 1;
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    padding: 0.9rem;
    border: none; border-radius: 12px;
    font-size: 1rem; font-weight: 600;
    cursor: pointer; transition: transform 0.1s, opacity 0.2s;
  }
  .btn:active { transform: scale(0.98); }
  
  .btn.primary {
    background: var(--accent-primary, #007bff);
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
  }
  .btn.secondary {
    background: rgba(0,0,0,0.06);
    color: var(--text-primary, #333);
  }
  .btn.secondary:hover { background: rgba(0,0,0,0.1); }
</style>
