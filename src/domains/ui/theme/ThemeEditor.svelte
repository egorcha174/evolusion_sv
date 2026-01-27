<script lang="ts">
  import { t } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import type { ThemeFile, ColorScheme } from '../../../themes/types';
  import { applyThemeCSS } from '../../../themes/utils';
  import ColorPicker from '../settings/controls/ColorPicker.svelte';
  import 'iconify-icon';

  let { draft = $bindable(), onSave, onCancel } = $props<{ 
    draft: ThemeFile, 
    onSave: (theme: ThemeFile) => void,
    onCancel: () => void 
  }>();

  let activeTab = $state<'light' | 'dark'>('light');
  let activeSection = $state<'main' | 'global_ui' | 'cards' | 'text' | 'widgets'>('main');
  
  let currentScheme = $derived(draft.theme.scheme[activeTab]);

  function updateField(key: keyof ColorScheme, value: any) {
    // @ts-ignore - Dynamic assignment
    draft.theme.scheme[activeTab][key] = value;
    applyThemeCSS(draft.theme.scheme[activeTab]);
  }

  function handleBackgroundTypeChange(type: string) {
    updateField('dashboardBackgroundType', type);
    
    // Ensure secondary color exists if switching to gradient
    if (type === 'gradient' && !draft.theme.scheme[activeTab].dashboardBackgroundColor2) {
       updateField('dashboardBackgroundColor2', draft.theme.scheme[activeTab].dashboardBackgroundColor1);
    }
    // Ensure angle exists
    if (type === 'gradient' && draft.theme.scheme[activeTab].dashboardGradientAngle === undefined) {
       updateField('dashboardGradientAngle', 135);
    }
  }
</script>

{#snippet sliderRow(label, key, min, max, step, unit = '')}
  <div class="control-row slider-row">
    <div class="slider-header">
      <span class="label">{label}</span>
      <span class="value">{currentScheme[key] ?? min}{unit}</span>
    </div>
    <input 
      type="range" 
      class="slider"
      {min} {max} {step}
      value={(currentScheme[key] as number) ?? min}
      oninput={(e) => updateField(key, parseFloat(e.currentTarget.value))}
      style="background-size: {(((currentScheme[key] as number ?? min) - min) * 100) / (max - min)}% 100%"
    />
  </div>
{/snippet}

{#snippet selectRow(label, key, options, onChange)}
  <div class="control-row select-row">
    <span class="label">{label}</span>
    <div class="select-wrapper">
      <select 
        class="modern-select"
        value={currentScheme[key]}
        onchange={onChange ? onChange : (e) => updateField(key, e.currentTarget.value)}
      >
        {#each options as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
      <div class="select-chevron">
        <iconify-icon icon="mdi:chevron-down"></iconify-icon>
      </div>
    </div>
  </div>
{/snippet}

{#snippet sectionTitle(title)}
  <div class="section-title">{title}</div>
{/snippet}

<div class="theme-editor-container">
  <!-- Header with Name Input -->
  <header class="editor-header">
    <div class="header-left">
      <button class="icon-btn close" onclick={onCancel}>
        <iconify-icon icon="mdi:close"></iconify-icon>
      </button>
      
      <!-- Name Input moved to header -->
      <div class="name-container">
        <span class="name-label">{$t('settings.themeEditor.namePlaceholder')}</span>
        <input 
          type="text" 
          class="header-name-input" 
          bind:value={draft.theme.name} 
          placeholder={$t('settings.themeEditor.namePlaceholder')}
        />
      </div>
    </div>
    <div class="header-right">
      <button class="btn primary small" onclick={() => onSave(draft)}>
        {$t('common.save')}
      </button>
    </div>
  </header>

  <div class="editor-body">
    <!-- Meta (Mode Only) -->
    <div class="meta-section">
      <!-- Name input moved up to header, only mode tabs here -->
      <div class="mode-tabs">
        <button class="mode-tab" class:active={activeTab === 'light'} onclick={() => activeTab = 'light'}>
          {$t('settings.themeModeDay')}
        </button>
        <button class="mode-tab" class:active={activeTab === 'dark'} onclick={() => activeTab = 'dark'}>
          {$t('settings.themeModeNight')}
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <div class="nav-pills">
      <button class="pill" class:active={activeSection === 'main'} onclick={() => activeSection = 'main'}>
        {$t('settings.themeEditor.nav.main')}
      </button>
      <button class="pill" class:active={activeSection === 'global_ui'} onclick={() => activeSection = 'global_ui'}>
        {$t('settings.themeEditor.nav.global_ui')}
      </button>
      <button class="pill" class:active={activeSection === 'cards'} onclick={() => activeSection = 'cards'}>
        {$t('settings.themeEditor.nav.cards')}
      </button>
      <button class="pill" class:active={activeSection === 'text'} onclick={() => activeSection = 'text'}>
        {$t('settings.themeEditor.nav.text')}
      </button>
      <button class="pill" class:active={activeSection === 'widgets'} onclick={() => activeSection = 'widgets'}>
        {$t('settings.themeEditor.nav.widgets')}
      </button>
    </div>

    <!-- Content -->
    <div class="scroll-content">
      {#if activeSection === 'main'}
        <div class="group" transition:slide|local={{ axis: 'x' }}>
          {@render sectionTitle($t('settings.themeEditor.labels.bgType'))}
          {@render selectRow($t('settings.themeEditor.labels.type'), 'dashboardBackgroundType', [
            {value: 'color', label: $t('settings.themeEditor.labels.solid')},
            {value: 'gradient', label: $t('settings.themeEditor.labels.gradient')},
            {value: 'image', label: $t('settings.themeEditor.labels.image')}
          ], (e) => handleBackgroundTypeChange(e.currentTarget.value))}

          {#if currentScheme.dashboardBackgroundType === 'color'}
             <ColorPicker 
               label={$t('settings.themeEditor.labels.color')} 
               value={currentScheme.dashboardBackgroundColor1} 
               onChange={(v) => updateField('dashboardBackgroundColor1', v)} 
             />
          {:else if currentScheme.dashboardBackgroundType === 'gradient'}
             <ColorPicker 
               label={$t('settings.themeEditor.labels.startColor')} 
               value={currentScheme.dashboardBackgroundColor1} 
               onChange={(v) => updateField('dashboardBackgroundColor1', v)} 
             />
             <ColorPicker 
               label={$t('settings.themeEditor.labels.endColor')} 
               value={currentScheme.dashboardBackgroundColor2 || currentScheme.dashboardBackgroundColor1} 
               onChange={(v) => updateField('dashboardBackgroundColor2', v)} 
             />
             {@render sliderRow($t('settings.themeEditor.labels.angle'), 'dashboardGradientAngle', 0, 360, 15, '°')}
          {:else}
             <div class="control-row">
               <input type="text" class="modern-input" placeholder="Image URL" value={currentScheme.dashboardBackgroundImageUrl || ''} oninput={(e) => updateField('dashboardBackgroundImageUrl', e.currentTarget.value)} />
             </div>
             {@render sliderRow($t('settings.themeEditor.labels.blur'), 'dashboardBackgroundImageBlur', 0, 20, 1, 'px')}
             {@render sliderRow($t('settings.themeEditor.labels.brightness'), 'dashboardBackgroundImageBrightness', 0, 200, 5, '%')}
          {/if}

          <div class="divider"></div>
          {@render sectionTitle($t('settings.themeEditor.labels.panelOpacity'))}
          {@render sliderRow($t('settings.themeEditor.labels.opacity'), 'panelOpacity', 0, 1, 0.05)}
          <ColorPicker label={$t('settings.themeEditor.labels.panelBg')} value={currentScheme.bgPanel} onChange={(v) => updateField('bgPanel', v)} />
        </div>

      {:else if activeSection === 'global_ui'}
        <div class="group" transition:slide|local={{ axis: 'x' }}>
          {@render sectionTitle($t('settings.themeEditor.labels.sidebar'))}
          {@render sliderRow($t('settings.themeEditor.labels.opacity'), 'sidebarOpacity', 0, 1, 0.05)}
          <ColorPicker label={$t('templates.style.background')} value={currentScheme.bgSidebar} onChange={(v) => updateField('bgSidebar', v)} />

          <div class="divider"></div>
          
          {@render sectionTitle($t('settings.themeEditor.labels.header'))}
          {@render sliderRow($t('settings.themeEditor.labels.opacity'), 'headerOpacity', 0, 1, 0.05)}
          <ColorPicker label={$t('templates.style.background')} value={currentScheme.bgHeader} onChange={(v) => updateField('bgHeader', v)} />

          <div class="divider"></div>
          
          {@render sectionTitle($t('settings.themeEditor.labels.elements'))}
          <ColorPicker label={$t('settings.themeEditor.labels.chips')} value={currentScheme.bgChip} onChange={(v) => updateField('bgChip', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.dropdowns')} value={currentScheme.bgDropdown} onChange={(v) => updateField('bgDropdown', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.hover')} value={currentScheme.bgCardHover} onChange={(v) => updateField('bgCardHover', v)} />

          <div class="divider"></div>
          {@render sectionTitle($t('settings.themeEditor.labels.inputs'))}
          <ColorPicker label={$t('settings.themeEditor.labels.inputBorder')} value={currentScheme.borderInput} onChange={(v) => updateField('borderInput', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.focusBorder')} value={currentScheme.borderFocus} onChange={(v) => updateField('borderFocus', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.dividers')} value={currentScheme.borderDivider} onChange={(v) => updateField('borderDivider', v)} />

          <div class="divider"></div>
          {@render sectionTitle($t('settings.themeEditor.labels.scrollbars'))}
          <ColorPicker label={$t('settings.themeEditor.labels.thumb')} value={currentScheme.scrollbarThumb} onChange={(v) => updateField('scrollbarThumb', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.track')} value={currentScheme.scrollbarTrack} onChange={(v) => updateField('scrollbarTrack', v)} />
        </div>

      {:else if activeSection === 'cards'}
        <div class="group" transition:slide|local={{ axis: 'x' }}>
          {@render sectionTitle($t('settings.themeEditor.labels.appearance'))}
          {@render sliderRow($t('settings.themeEditor.labels.cardsOpacity'), 'cardOpacity', 0, 1, 0.05)}
          {@render sliderRow($t('settings.themeEditor.labels.radius'), 'cardBorderRadius', 0, 32, 1, 'px')}
          
          <ColorPicker 
            label={$t('settings.themeEditor.labels.bgOff')} 
            value={currentScheme.cardBackground} 
            onChange={(v) => updateField('cardBackground', v)} 
          />
          <ColorPicker 
            label={$t('settings.themeEditor.labels.bgOn')} 
            value={currentScheme.cardBackgroundOn} 
            onChange={(v) => updateField('cardBackgroundOn', v)} 
          />

          <div class="divider"></div>
          {@render sectionTitle($t('settings.themeEditor.labels.borders'))}
          {@render sliderRow($t('settings.themeEditor.labels.width'), 'cardBorderWidth', 0, 10, 1, 'px')}
          <ColorPicker 
            label={$t('settings.themeEditor.labels.color') + ' (' + $t('common.off') + ')'} 
            value={currentScheme.cardBorderColor} 
            onChange={(v) => updateField('cardBorderColor', v)} 
          />
          <ColorPicker 
            label={$t('settings.themeEditor.labels.color') + ' (' + $t('common.on') + ')'} 
            value={currentScheme.cardBorderColorOn} 
            onChange={(v) => updateField('cardBorderColorOn', v)} 
          />

          <div class="divider"></div>
          {@render sectionTitle($t('settings.themeEditor.labels.icons'))}
          {@render selectRow($t('settings.themeEditor.labels.shape'), 'iconBackgroundShape', [
             {value: 'circle', label: 'Circle'},
             {value: 'rounded-square', label: 'Rounded Square'},
             {value: 'square', label: 'Square'}
          ])}
          <ColorPicker 
            label={$t('settings.themeEditor.labels.iconBgOff')} 
            value={currentScheme.iconBackgroundColorOff} 
            onChange={(v) => updateField('iconBackgroundColorOff', v)} 
          />
          <ColorPicker 
            label={$t('settings.themeEditor.labels.iconBgOn')} 
            value={currentScheme.iconBackgroundColorOn} 
            onChange={(v) => updateField('iconBackgroundColorOn', v)} 
          />
          <ColorPicker 
            label={$t('settings.themeEditor.labels.iconSymbol')} 
            value={currentScheme.iconColorOn} 
            onChange={(v) => updateField('iconColorOn', v)} 
          />
        </div>

      {:else if activeSection === 'text'}
        <div class="group" transition:slide|local={{ axis: 'x' }}>
          <!-- TEXT (OFF) -->
          {@render sectionTitle($t('settings.themeEditor.labels.textOff'))}
          <ColorPicker label={$t('settings.themeEditor.labels.deviceName')} value={currentScheme.nameTextColor} onChange={(v) => updateField('nameTextColor', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.secondaryInfo')} value={currentScheme.statusTextColor} onChange={(v) => updateField('statusTextColor', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.stateValue')} value={currentScheme.valueTextColor} onChange={(v) => updateField('valueTextColor', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.unit')} value={currentScheme.unitTextColor} onChange={(v) => updateField('unitTextColor', v)} />

          <!-- TEXT (ON) -->
          <div class="divider"></div>
          {@render sectionTitle($t('settings.themeEditor.labels.textOn'))}
          <ColorPicker label={$t('settings.themeEditor.labels.deviceName')} value={currentScheme.nameTextColorOn} onChange={(v) => updateField('nameTextColorOn', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.secondaryInfo')} value={currentScheme.statusTextColorOn} onChange={(v) => updateField('statusTextColorOn', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.stateValue')} value={currentScheme.valueTextColorOn} onChange={(v) => updateField('valueTextColorOn', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.unit')} value={currentScheme.unitTextColorOn} onChange={(v) => updateField('unitTextColorOn', v)} />

          <!-- UI Elements -->
          <div class="divider"></div>
          {@render sectionTitle($t('settings.themeEditor.labels.uiElements'))}
          <ColorPicker label={$t('settings.themeEditor.labels.tabTextInactive')} value={currentScheme.tabTextColor} onChange={(v) => updateField('tabTextColor', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.tabTextActive')} value={currentScheme.activeTabTextColor} onChange={(v) => updateField('activeTabTextColor', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.tabIndicator')} value={currentScheme.tabIndicatorColor} onChange={(v) => updateField('tabIndicatorColor', v)} />
        </div>

      {:else if activeSection === 'widgets'}
        <div class="group" transition:slide|local={{ axis: 'x' }}>
          <!-- Clock -->
          {@render sectionTitle($t('settings.widgets.clock'))}
          <ColorPicker label={$t('settings.themeEditor.labels.clockText')} value={currentScheme.clockTextColor} onChange={(v) => updateField('clockTextColor', v)} />

          <div class="divider"></div>

          <!-- Weather -->
          {@render sectionTitle($t('settings.weather'))}
          <ColorPicker label={$t('settings.themeEditor.labels.weatherPrimary')} value={currentScheme.weatherPrimaryColor} onChange={(v) => updateField('weatherPrimaryColor', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.weatherSecondary')} value={currentScheme.weatherSecondaryColor} onChange={(v) => updateField('weatherSecondaryColor', v)} />

          <div class="divider"></div>

          <!-- Thermostat -->
          {@render sectionTitle($t('settings.themeEditor.labels.thermostat'))}
          <ColorPicker label={$t('settings.themeEditor.labels.knob')} value={currentScheme.thermostatHandleColor} onChange={(v) => updateField('thermostatHandleColor', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.targetText')} value={currentScheme.thermostatDialTextColor} onChange={(v) => updateField('thermostatDialTextColor', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.label')} value={currentScheme.thermostatDialLabelColor} onChange={(v) => updateField('thermostatDialLabelColor', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.heating')} value={currentScheme.thermostatHeatingColor} onChange={(v) => updateField('thermostatHeatingColor', v)} />
          <ColorPicker label={$t('settings.themeEditor.labels.cooling')} value={currentScheme.thermostatCoolingColor} onChange={(v) => updateField('thermostatCoolingColor', v)} />
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .theme-editor-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-panel, #ffffff);
    color: var(--text-primary, #333);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  /* HEADER */
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }
  .header-left { display: flex; align-items: center; gap: 1rem; width: 60%; }
  
  /* Name Input in Header */
  .name-container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  
  .name-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 600;
    margin-bottom: 2px;
  }
  
  .header-name-input {
    background: transparent;
    border: none;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    width: 100%;
    padding: 2px 0;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
  }
  .header-name-input:focus {
    outline: none;
    border-bottom-color: var(--accent-primary, #007bff);
  }

  .icon-btn {
    background: transparent; border: none; cursor: pointer; color: var(--text-secondary);
    display: flex; align-items: center; justify-content: center;
    padding: 4px; border-radius: 50%;
  }
  .icon-btn:hover { background: rgba(0,0,0,0.05); color: var(--text-primary); }

  .btn {
    padding: 0.5rem 1rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;
    font-size: 0.9rem; transition: all 0.2s;
  }
  .btn.primary { background: var(--accent-primary, #007bff); color: #fff; }
  .btn.primary:hover { filter: brightness(1.1); box-shadow: 0 2px 8px rgba(0,0,0,0.15); }

  /* BODY */
  .editor-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary, #f9f9fb);
  }

  .meta-section {
    padding: 1rem 1.5rem 0.5rem 1.5rem;
    background: var(--bg-panel);
    display: flex;
    justify-content: flex-end; /* Align tabs to right or center */
    align-items: center;
  }

  /* Modern Input - Used inside content now if needed */
  .modern-input {
    width: 100%; padding: 0.6rem; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1);
    background: var(--bg-input, #f5f5f7); color: var(--text-primary); font-size: 1rem;
  }
  .modern-input:focus { outline: none; border-color: var(--accent-primary); background: var(--bg-panel); }

  .mode-tabs {
    display: flex;
    background: rgba(0,0,0,0.05);
    padding: 3px;
    border-radius: 10px;
  }
  .mode-tab {
    padding: 6px 16px; border: none; background: transparent; cursor: pointer;
    border-radius: 7px; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);
    transition: all 0.2s;
  }
  .mode-tab.active { background: var(--bg-panel); color: var(--text-primary); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

  /* NAV PILLS */
  .nav-pills {
    display: flex;
    gap: 0.5rem;
    padding: 0 1.5rem 1rem 1.5rem;
    background: var(--bg-panel);
    border-bottom: 1px solid rgba(0,0,0,0.06);
    overflow-x: auto;
  }
  .pill {
    padding: 6px 14px; border-radius: 20px; border: 1px solid transparent; background: transparent;
    cursor: pointer; font-size: 0.9rem; color: var(--text-secondary); font-weight: 500; white-space: nowrap;
  }
  .pill:hover { background: rgba(0,0,0,0.03); }
  .pill.active { background: var(--bg-primary); border-color: rgba(0,0,0,0.1); color: var(--text-primary); font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.03); }

  /* SCROLL CONTENT */
  .scroll-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 1.5rem 0 0.75rem 0;
  }
  .section-title:first-child { margin-top: 0; }

  .divider { height: 1px; background: rgba(0,0,0,0.06); margin: 1.5rem 0; width: 100%; }

  /* ROWS */
  .control-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0;
  }
  .slider-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .slider-header { display: flex; justify-content: space-between; }
  .label { font-size: 0.9rem; font-weight: 500; color: var(--text-primary); }
  .value { font-family: monospace; font-size: 0.85rem; color: var(--text-muted); }

  /* MODERN SELECT WITH WRAPPER */
  .select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .modern-select {
    appearance: none;
    -webkit-appearance: none;
    padding: 0.4rem 2rem 0.4rem 0.8rem;
    border-radius: 6px;
    border: 1px solid rgba(0,0,0,0.1);
    background: var(--bg-panel);
    color: var(--text-primary);
    font-size: 0.9rem;
    text-align: left;
    cursor: pointer;
    min-width: 120px;
  }
  
  .modern-select:focus {
    outline: none;
    border-color: var(--accent-primary);
  }

  .select-chevron {
    position: absolute;
    right: 0.5rem;
    pointer-events: none;
    display: flex;
    align-items: center;
    color: var(--text-secondary);
    font-size: 1rem;
  }

  .slider {
    -webkit-appearance: none;
    width: 100%; height: 6px; border-radius: 3px;
    background: rgba(0,0,0,0.1);
    background-image: linear-gradient(var(--accent-primary), var(--accent-primary));
    background-repeat: no-repeat;
    outline: none; cursor: pointer;
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
    background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    cursor: pointer; transition: transform 0.1s;
  }
  .slider::-webkit-slider-thumb:hover { transform: scale(1.1); }
</style>