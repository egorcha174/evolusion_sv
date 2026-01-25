
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
    <div class="label-group">
      <span class="label">{label}</span>
      <span class="hex-value">{currentScheme[key]}</span>
    </div>
    <div class="color-wrapper">
      <input 
        type="color" 
        value={currentScheme[key] as string} 
        oninput={(e) => updateField(key, e.currentTarget.value)}
      />
      <div class="swatch" style:background-color={currentScheme[key] as string}></div>
    </div>
  </div>
{/snippet}

{#snippet sliderRow(label, key, min, max, step, unit = '')}
  <div class="control-stack">
    <div class="header-row">
      <span class="label">{label}</span>
      <span class="value-badge">{currentScheme[key]}{unit}</span>
    </div>
    <div class="slider-container">
      <input 
        type="range" 
        class="slider"
        {min} {max} {step}
        value={currentScheme[key] as number}
        oninput={(e) => updateField(key, parseFloat(e.currentTarget.value))}
        style="background-size: {((currentScheme[key] as number - min) * 100) / (max - min)}% 100%"
      />
    </div>
  </div>
{/snippet}

<div class="theme-editor-container">
  <!-- 1. Header -->
  <header class="editor-header">
    <div class="title-block">
      <h2>Theme Editor</h2>
    </div>
    <div class="header-actions">
      <button class="icon-btn close" onclick={onCancel} title={$t('common.close')}>
        <iconify-icon icon="mdi:close"></iconify-icon>
      </button>
    </div>
  </header>

  <div class="editor-body">
    <!-- 2. Top Controls (Name & Mode) -->
    <div class="top-controls">
      <div class="input-group">
        <input 
          type="text" 
          class="modern-input" 
          bind:value={draft.theme.name} 
          placeholder="Theme Name" 
        />
      </div>

      <!-- Mode Switcher -->
      <div class="mode-switcher">
        <button 
          class="mode-btn" 
          class:active={activeTab === 'light'} 
          onclick={() => activeTab = 'light'}
        >
          <iconify-icon icon="mdi:white-balance-sunny"></iconify-icon>
          Light
        </button>
        <button 
          class="mode-btn" 
          class:active={activeTab === 'dark'} 
          onclick={() => activeTab = 'dark'}
        >
          <iconify-icon icon="mdi:weather-night"></iconify-icon>
          Dark
        </button>
      </div>
    </div>

    <!-- 3. Navigation (Apple Style Segmented Control) -->
    <div class="nav-container">
      <div class="segmented-nav">
        <button class="nav-item" class:active={activeSection === 'background'} onclick={() => activeSection = 'background'}>
          Background
        </button>
        <button class="nav-item" class:active={activeSection === 'cards'} onclick={() => activeSection = 'cards'}>
          Cards
        </button>
        <button class="nav-item" class:active={activeSection === 'colors'} onclick={() => activeSection = 'colors'}>
          Colors
        </button>
        <button class="nav-item" class:active={activeSection === 'text'} onclick={() => activeSection = 'text'}>
          Text
        </button>
        <!-- Animated Background Pill -->
        <div class="active-bg" style:transform="translateX({
          activeSection === 'background' ? '0%' : 
          activeSection === 'cards' ? '100%' : 
          activeSection === 'colors' ? '200%' : '300%'
        })"></div>
      </div>
    </div>

    <!-- 4. Content Area -->
    <div class="content-scroll">
      {#if activeSection === 'background'}
        <div class="section-group" transition:slide|local={{ duration: 200, axis: 'x' }}>
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
              <label class="label">Image URL</label>
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

          <div class="section-divider">Panel & UI</div>
          {@render sliderRow('Panel Opacity', 'panelOpacity', 0, 1, 0.05)}
          {@render colorRow('Panel Background', 'bgPanel')}
        </div>

      {:else if activeSection === 'cards'}
        <div class="section-group" transition:slide|local={{ duration: 200, axis: 'x' }}>
          <div class="section-divider">Appearance</div>
          {@render colorRow('Card Background', 'cardBackground')}
          {@render colorRow('Active Background', 'cardBackgroundOn')}
          {@render sliderRow('Opacity', 'cardOpacity', 0, 1, 0.05)}
          
          <div class="section-divider">Borders</div>
          {@render sliderRow('Corner Radius', 'cardBorderRadius', 0, 32, 1, 'px')}
          {@render sliderRow('Border Width', 'cardBorderWidth', 0, 10, 1, 'px')}
          {@render colorRow('Border Color', 'cardBorderColor')}
          {@render colorRow('Active Border', 'cardBorderColorOn')}
          
          <div class="section-divider">Shadow</div>
          <div class="control-stack">
             <label class="label">Box Shadow CSS</label>
             <input 
               type="text" class="modern-input" 
               value={currentScheme.shadowCard || 'none'} 
               oninput={(e) => updateField('shadowCard', e.currentTarget.value)}
             />
          </div>
        </div>

      {:else if activeSection === 'colors'}
        <div class="section-group" transition:slide|local={{ duration: 200, axis: 'x' }}>
          <div class="section-divider">Brand Colors</div>
          {@render colorRow('Primary Brand', 'accentPrimary')}
          {@render colorRow('Secondary', 'accentSecondary')}
          {@render colorRow('Info Blue', 'accentInfo')}
          
          <div class="section-divider">States</div>
          {@render colorRow('State: On', 'stateOn')}
          {@render colorRow('State: Off', 'stateOff')}
          {@render colorRow('Success', 'accentSuccess')}
          {@render colorRow('Warning', 'accentWarning')}
          {@render colorRow('Error', 'accentError')}
        </div>

      {:else if activeSection === 'text'}
        <div class="section-group" transition:slide|local={{ duration: 200, axis: 'x' }}>
          <div class="section-divider">Global Typography</div>
          {@render colorRow('Primary Text', 'textPrimary')}
          {@render colorRow('Secondary Text', 'textSecondary')}
          {@render colorRow('Muted Text', 'textMuted')}
          
          <div class="section-divider">Card Text (Idle)</div>
          {@render colorRow('Device Name', 'nameTextColor')}
          {@render colorRow('State Value', 'valueTextColor')}
          {@render colorRow('Secondary Info', 'statusTextColor')}
          
          <div class="section-divider">Card Text (Active)</div>
          {@render colorRow('Device Name', 'nameTextColorOn')}
          {@render colorRow('State Value', 'valueTextColorOn')}
        </div>
      {/if}
    </div>
  </div>

  <!-- 5. Footer -->
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
  /* --- Layout --- */
  .theme-editor-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 85vh;
    background: var(--bg-panel, #ffffff);
    color: var(--text-primary, #333);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  /* --- Header --- */
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(0,0,0,0.06);
    background: var(--bg-panel, #ffffff);
  }
  .title-block h2 { margin: 0; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
  
  .icon-btn.close {
    background: rgba(0,0,0,0.05);
    border: none;
    border-radius: 50%;
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--text-secondary);
    transition: all 0.2s;
  }
  .icon-btn.close:hover { background: rgba(0,0,0,0.1); color: var(--text-primary); }

  /* --- Body & Controls --- */
  .editor-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--bg-secondary, #f7f8fa);
  }

  .top-controls {
    padding: 1.5rem;
    background: var(--bg-panel, #ffffff);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  
  .input-group { flex: 1; }
  
  .modern-input {
    width: 100%;
    padding: 0.6rem 0.8rem;
    font-size: 1rem;
    font-weight: 600;
    border: 1px solid transparent;
    border-radius: 8px;
    background-color: transparent;
    color: var(--text-primary);
    transition: all 0.2s;
  }
  .modern-input:hover { background-color: rgba(0,0,0,0.03); }
  .modern-input:focus { background-color: rgba(0,0,0,0.05); outline: none; }
  .modern-input::placeholder { font-weight: 400; opacity: 0.5; }

  /* Mode Switcher (Pill) */
  .mode-switcher {
    display: flex;
    background: rgba(0,0,0,0.05);
    padding: 3px;
    border-radius: 8px;
  }
  .mode-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 12px;
    border: none; background: transparent;
    border-radius: 6px;
    font-size: 0.85rem; font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer; transition: all 0.2s;
  }
  .mode-btn.active {
    background: var(--bg-panel, #ffffff);
    color: var(--text-primary);
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  /* --- Navigation (Segmented) --- */
  .nav-container {
    padding: 0 1.5rem 1rem 1.5rem;
    background: var(--bg-panel, #ffffff);
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }
  
  .segmented-nav {
    display: flex;
    position: relative;
    background: rgba(0,0,0,0.05);
    border-radius: 10px;
    padding: 3px;
  }
  
  .nav-item {
    flex: 1;
    position: relative;
    z-index: 2;
    background: transparent;
    border: none;
    padding: 6px 0;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: color 0.2s;
    text-align: center;
  }
  .nav-item.active { color: var(--text-primary); font-weight: 600; }
  
  .active-bg {
    position: absolute;
    top: 3px; bottom: 3px; left: 3px;
    width: calc(25% - 1.5px); /* 4 items -> 25% */
    background: var(--bg-panel, #ffffff);
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.08);
    transition: transform 0.25s cubic-bezier(0.2, 0, 0.2, 1);
    z-index: 1;
  }

  /* --- Content --- */
  .content-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }
  
  .section-group { display: flex; flex-direction: column; gap: 1rem; }

  .section-divider {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
    color: var(--text-muted);
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }
  .section-divider:first-child { margin-top: 0; }

  /* Control Rows */
  .control-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.25rem 0;
  }
  .label-group { display: flex; flex-direction: column; }
  .label { font-size: 0.9rem; font-weight: 500; color: var(--text-primary); }
  .hex-value { font-size: 0.75rem; font-family: monospace; color: var(--text-muted); margin-top: 2px; }
  
  .control-stack { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.5rem; }
  .header-row { display: flex; justify-content: space-between; align-items: baseline; }
  .value-badge { font-family: monospace; font-size: 0.8rem; background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; color: var(--text-primary); }

  /* Color Picker */
  .color-wrapper {
    position: relative;
    width: 32px; height: 32px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
    cursor: pointer;
  }
  .color-wrapper input {
    position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; opacity: 0; cursor: pointer;
  }
  .color-wrapper .swatch { width: 100%; height: 100%; border: 2px solid #fff; border-radius: 50%; box-sizing: border-box; }

  /* Slider */
  .slider-container {
    width: 100%;
    height: 24px;
    display: flex;
    align-items: center;
  }
  .slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(0,0,0,0.1);
    background-image: linear-gradient(var(--accent-primary), var(--accent-primary));
    background-repeat: no-repeat;
    outline: none;
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: transform 0.1s;
  }
  .slider::-webkit-slider-thumb:hover { transform: scale(1.1); }

  .modern-select {
    width: 100%;
    padding: 0.6rem;
    font-size: 0.9rem;
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 8px;
    background: var(--bg-input);
    color: var(--text-primary);
  }

  /* --- Footer --- */
  .editor-footer {
    padding: 1rem 1.5rem;
    background: var(--bg-panel, #ffffff);
    border-top: 1px solid rgba(0,0,0,0.06);
    display: flex; gap: 1rem;
  }
  
  .btn {
    flex: 1;
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    padding: 0.8rem;
    border: none; border-radius: 10px;
    font-size: 0.95rem; font-weight: 600;
    cursor: pointer; transition: transform 0.1s, opacity 0.2s;
  }
  .btn:active { transform: scale(0.98); }
  
  .btn.primary {
    background: var(--accent-primary, #007bff);
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .btn.secondary {
    background: rgba(0,0,0,0.05);
    color: var(--text-primary, #333);
  }
  .btn.secondary:hover { background: rgba(0,0,0,0.08); }
</style>
