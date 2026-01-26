<script lang="ts">
  import { t } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import type { ThemeFile, ColorScheme } from '../../../themes/types';
  import { applyThemeCSS } from '../../../themes/utils';
  import ColorPicker from '../settings/controls/ColorPicker.svelte';
  import 'iconify-icon';

  let {
    draft = $bindable(),
    onSave,
    onCancel,
  } = $props<{
    draft: ThemeFile;
    onSave: (theme: ThemeFile) => void;
    onCancel: () => void;
  }>();

  let activeTab = $state<'light' | 'dark'>('light');
  // Updated navigation sections to match logical grouping of screenshots
  let activeSection = $state<'main' | 'cards' | 'text' | 'widgets'>('main');

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
      // Default to a slight variation or same color
      updateField(
        'dashboardBackgroundColor2',
        draft.theme.scheme[activeTab].dashboardBackgroundColor1
      );
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
      {min}
      {max}
      {step}
      value={(currentScheme[key] as number) ?? min}
      oninput={(e) => updateField(key, parseFloat(e.currentTarget.value))}
      style="background-size: {((((currentScheme[key] as number) ?? min) - min) * 100) /
        (max - min)}% 100%"
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
  <!-- Header -->
  <header class="editor-header">
    <div class="header-left">
      <button class="icon-btn close" onclick={onCancel}>
        <iconify-icon icon="mdi:close"></iconify-icon>
      </button>
      <h2>{$t('settings.themeEditor.title')}</h2>
    </div>
    <div class="header-right">
      <button class="btn primary small" onclick={() => onSave(draft)}>
        {$t('common.save')}
      </button>
    </div>
  </header>

  <div class="editor-body">
    <!-- Meta & Mode -->
    <div class="meta-section">
      <div class="input-group">
        <label>{$t('settings.themeEditor.namePlaceholder')}</label>
        <input type="text" class="modern-input" bind:value={draft.theme.name} />
      </div>

      <div class="mode-tabs">
        <button
          class="mode-tab"
          class:active={activeTab === 'light'}
          onclick={() => (activeTab = 'light')}
        >
          {$t('settings.themeModeDay')}
        </button>
        <button
          class="mode-tab"
          class:active={activeTab === 'dark'}
          onclick={() => (activeTab = 'dark')}
        >
          {$t('settings.themeModeNight')}
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <div class="nav-pills">
      <button
        class="pill"
        class:active={activeSection === 'main'}
        onclick={() => (activeSection = 'main')}
      >
        Main
      </button>
      <button
        class="pill"
        class:active={activeSection === 'cards'}
        onclick={() => (activeSection = 'cards')}
      >
        Cards
      </button>
      <button
        class="pill"
        class:active={activeSection === 'text'}
        onclick={() => (activeSection = 'text')}
      >
        Text & UI
      </button>
      <button
        class="pill"
        class:active={activeSection === 'widgets'}
        onclick={() => (activeSection = 'widgets')}
      >
        Widgets
      </button>
    </div>

    <!-- Content -->
    <div class="scroll-content">
      {#if activeSection === 'main'}
        <div class="group" transition:slide|local={{ axis: 'x' }}>
          {@render sectionTitle($t('settings.themeEditor.labels.bgType'))}
          {@render selectRow(
            'Type',
            'dashboardBackgroundType',
            [
              { value: 'color', label: $t('settings.themeEditor.labels.solid') },
              { value: 'gradient', label: $t('settings.themeEditor.labels.gradient') },
              { value: 'image', label: $t('settings.themeEditor.labels.image') },
            ],
            (e) => handleBackgroundTypeChange(e.currentTarget.value)
          )}

          {#if currentScheme.dashboardBackgroundType === 'color'}
            <ColorPicker
              label="Color"
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
              value={currentScheme.dashboardBackgroundColor2 ||
                currentScheme.dashboardBackgroundColor1}
              onChange={(v) => updateField('dashboardBackgroundColor2', v)}
            />
            {@render sliderRow('Angle', 'dashboardGradientAngle', 0, 360, 15, '°')}
          {:else}
            <div class="control-row">
              <input
                type="text"
                class="modern-input"
                placeholder="Image URL"
                value={currentScheme.dashboardBackgroundImageUrl || ''}
                oninput={(e) => updateField('dashboardBackgroundImageUrl', e.currentTarget.value)}
              />
            </div>
            {@render sliderRow(
              $t('settings.themeEditor.labels.blur'),
              'dashboardBackgroundImageBlur',
              0,
              20,
              1,
              'px'
            )}
            {@render sliderRow(
              $t('settings.themeEditor.labels.brightness'),
              'dashboardBackgroundImageBrightness',
              0,
              200,
              5,
              '%'
            )}
          {/if}

          <div class="divider"></div>
          {@render sectionTitle($t('settings.themeEditor.labels.panelOpacity'))}
          {@render sliderRow('Transparency', 'panelOpacity', 0, 1, 0.05)}
        </div>
      {:else if activeSection === 'cards'}
        <div class="group" transition:slide|local={{ axis: 'x' }}>
          {@render sectionTitle($t('settings.themeEditor.labels.appearance'))}
          {@render sliderRow('Cards Opacity', 'cardOpacity', 0, 1, 0.05)}
          {@render sliderRow(
            $t('settings.themeEditor.labels.radius'),
            'cardBorderRadius',
            0,
            32,
            1,
            'px'
          )}

          <ColorPicker
            label="Background (Off)"
            value={currentScheme.cardBackground}
            onChange={(v) => updateField('cardBackground', v)}
          />
          <ColorPicker
            label="Background (On)"
            value={currentScheme.cardBackgroundOn}
            onChange={(v) => updateField('cardBackgroundOn', v)}
          />

          <div class="divider"></div>
          {@render sectionTitle($t('settings.themeEditor.labels.borders'))}
          {@render sliderRow(
            $t('settings.themeEditor.labels.width'),
            'cardBorderWidth',
            0,
            10,
            1,
            'px'
          )}
          <ColorPicker
            label={$t('settings.themeEditor.labels.color') + ' (Off)'}
            value={currentScheme.cardBorderColor}
            onChange={(v) => updateField('cardBorderColor', v)}
          />
          <ColorPicker
            label={$t('settings.themeEditor.labels.color') + ' (On)'}
            value={currentScheme.cardBorderColorOn}
            onChange={(v) => updateField('cardBorderColorOn', v)}
          />

          <div class="divider"></div>
          {@render sectionTitle('Icons')}
          {@render selectRow('Shape', 'iconBackgroundShape', [
            { value: 'circle', label: 'Circle' },
            { value: 'rounded-square', label: 'Rounded Square' },
            { value: 'square', label: 'Square' },
          ])}
          <ColorPicker
            label="Icon Bg (Off)"
            value={currentScheme.iconBackgroundColorOff}
            onChange={(v) => updateField('iconBackgroundColorOff', v)}
          />
          <ColorPicker
            label="Icon Bg (On)"
            value={currentScheme.iconBackgroundColorOn}
            onChange={(v) => updateField('iconBackgroundColorOn', v)}
          />
        </div>
      {:else if activeSection === 'text'}
        <div class="group" transition:slide|local={{ axis: 'x' }}>
          <!-- TEXT (OFF) -->
          {@render sectionTitle('TEXT (OFF)')}
          <ColorPicker
            label={$t('settings.themeEditor.labels.deviceName')}
            value={currentScheme.nameTextColor}
            onChange={(v) => updateField('nameTextColor', v)}
          />
          <ColorPicker
            label={$t('settings.themeEditor.labels.secondaryInfo')}
            value={currentScheme.statusTextColor}
            onChange={(v) => updateField('statusTextColor', v)}
          />
          <ColorPicker
            label={$t('settings.themeEditor.labels.stateValue')}
            value={currentScheme.valueTextColor}
            onChange={(v) => updateField('valueTextColor', v)}
          />
          <ColorPicker
            label="Unit"
            value={currentScheme.unitTextColor}
            onChange={(v) => updateField('unitTextColor', v)}
          />

          <!-- TEXT (ON) -->
          <div class="divider"></div>
          {@render sectionTitle('TEXT (ON)')}
          <ColorPicker
            label={$t('settings.themeEditor.labels.deviceName')}
            value={currentScheme.nameTextColorOn}
            onChange={(v) => updateField('nameTextColorOn', v)}
          />
          <ColorPicker
            label={$t('settings.themeEditor.labels.secondaryInfo')}
            value={currentScheme.statusTextColorOn}
            onChange={(v) => updateField('statusTextColorOn', v)}
          />
          <ColorPicker
            label={$t('settings.themeEditor.labels.stateValue')}
            value={currentScheme.valueTextColorOn}
            onChange={(v) => updateField('valueTextColorOn', v)}
          />
          <ColorPicker
            label="Unit"
            value={currentScheme.unitTextColorOn}
            onChange={(v) => updateField('unitTextColorOn', v)}
          />

          <!-- UI Elements -->
          <div class="divider"></div>
          {@render sectionTitle('UI Elements')}
          <ColorPicker
            label="Tab Text"
            value={currentScheme.tabTextColor}
            onChange={(v) => updateField('tabTextColor', v)}
          />
          <ColorPicker
            label="Active Tab"
            value={currentScheme.activeTabTextColor}
            onChange={(v) => updateField('activeTabTextColor', v)}
          />
          <ColorPicker
            label="Tab Indicator"
            value={currentScheme.tabIndicatorColor}
            onChange={(v) => updateField('tabIndicatorColor', v)}
          />
          <ColorPicker
            label="Clock Color"
            value={currentScheme.clockTextColor}
            onChange={(v) => updateField('clockTextColor', v)}
          />
        </div>
      {:else if activeSection === 'widgets'}
        <div class="group" transition:slide|local={{ axis: 'x' }}>
          <!-- Thermostat -->
          {@render sectionTitle('Thermostat')}
          <ColorPicker
            label="Knob"
            value={currentScheme.thermostatHandleColor}
            onChange={(v) => updateField('thermostatHandleColor', v)}
          />
          <ColorPicker
            label="Target Text"
            value={currentScheme.thermostatDialTextColor}
            onChange={(v) => updateField('thermostatDialTextColor', v)}
          />
          <ColorPicker
            label="Label"
            value={currentScheme.thermostatDialLabelColor}
            onChange={(v) => updateField('thermostatDialLabelColor', v)}
          />
          <ColorPicker
            label="Heating"
            value={currentScheme.thermostatHeatingColor}
            onChange={(v) => updateField('thermostatHeatingColor', v)}
          />
          <ColorPicker
            label="Cooling"
            value={currentScheme.thermostatCoolingColor}
            onChange={(v) => updateField('thermostatCoolingColor', v)}
          />
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  /* HEADER */
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .editor-header h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .icon-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 50%;
  }
  .icon-btn:hover {
    background: rgba(0, 0, 0, 0.05);
    color: var(--text-primary);
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }
  .btn.primary {
    background: var(--accent-primary, #007bff);
    color: #fff;
  }
  .btn.primary:hover {
    filter: brightness(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  /* BODY */
  .editor-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary, #f9f9fb);
  }

  .meta-section {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    background: var(--bg-panel);
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1.5rem;
  }

  .input-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .input-group label {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-secondary);
  }
  .modern-input {
    width: 100%;
    padding: 0.6rem;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: var(--bg-input, #f5f5f7);
    color: var(--text-primary);
    font-size: 1rem;
  }
  .modern-input:focus {
    outline: none;
    border-color: var(--accent-primary);
    background: var(--bg-panel);
  }

  .mode-tabs {
    display: flex;
    background: rgba(0, 0, 0, 0.05);
    padding: 3px;
    border-radius: 10px;
  }
  .mode-tab {
    padding: 6px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 7px;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    transition: all 0.2s;
  }
  .mode-tab.active {
    background: var(--bg-panel);
    color: var(--text-primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  /* NAV PILLS */
  .nav-pills {
    display: flex;
    gap: 0.5rem;
    padding: 0 1.5rem 1rem 1.5rem;
    background: var(--bg-panel);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    overflow-x: auto;
  }
  .pill {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
    white-space: nowrap;
  }
  .pill:hover {
    background: rgba(0, 0, 0, 0.03);
  }
  .pill.active {
    background: var(--bg-primary);
    border-color: rgba(0, 0, 0, 0.1);
    color: var(--text-primary);
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  }

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
  .section-title:first-child {
    margin-top: 0;
  }

  .divider {
    height: 1px;
    background: rgba(0, 0, 0, 0.06);
    margin: 1.5rem 0;
    width: 100%;
  }

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

  .slider-header {
    display: flex;
    justify-content: space-between;
  }
  .label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
  }
  .value {
    font-family: monospace;
    font-size: 0.85rem;
    color: var(--text-muted);
  }

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
    border: 1px solid rgba(0, 0, 0, 0.1);
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
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.1);
    background-image: linear-gradient(var(--accent-primary), var(--accent-primary));
    background-repeat: no-repeat;
    outline: none;
    cursor: pointer;
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transition: transform 0.1s;
  }
  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
</style>
