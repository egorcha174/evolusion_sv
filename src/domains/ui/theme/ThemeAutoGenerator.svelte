
<script lang="ts">
  import { t } from 'svelte-i18n';
  import { themeStore } from './store';
  import { importTheme, exportTheme } from './io';
  import { generateThemePreset } from '../../../lib/themes/auto/generator';
  import { validateBaseThemeSettings } from '../../../lib/themes/auto/validate';
  import type { BaseThemeSettings } from '../../../lib/themes/auto/types';
  import ColorPicker from '../settings/controls/ColorPicker.svelte';
  import RangeInput from '../settings/controls/RangeInput.svelte';
  import LabeledInput from '../settings/controls/LabeledInput.svelte';
  import 'iconify-icon';

  let { onClose } = $props<{ onClose: () => void }>();

  // State
  let settings = $state<BaseThemeSettings>({
    themeId: 'my_auto_theme',
    themeName: 'My Auto Theme',
    primary: '#6366f1',
    harmony: 'analogous',
    radius: 'standard',
    cardOpacity: 0.5,
    panelOpacity: 0.5
  });

  let previewMode = $state<'light' | 'dark'>('dark');
  let validation = $derived(validateBaseThemeSettings(settings));
  
  // Live Preview Data
  let previewTheme = $derived(generateThemePreset(settings));
  let previewScheme = $derived(previewMode === 'dark' ? previewTheme.theme.scheme.dark : previewTheme.theme.scheme.light);

  function handleSave() {
    if (!validation.ok) return;
    const preset = generateThemePreset(settings);
    themeStore.saveTheme(preset);
    themeStore.setActiveTheme(preset.theme.id);
    onClose();
  }

  function handleExport() {
    const preset = generateThemePreset(settings);
    exportTheme(preset);
  }

  async function handleImport(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      try {
        const theme = await importTheme(file);
        themeStore.saveTheme(theme);
        themeStore.setActiveTheme(theme.theme.id);
        alert($t('settings.messages.importSuccess'));
        onClose();
      } catch (err: any) {
        alert($t('settings.messages.importError') + ': ' + err.message);
      }
    }
  }

  function copyJson() {
    const preset = generateThemePreset(settings);
    navigator.clipboard.writeText(JSON.stringify(preset, null, 2));
    // Optional: Toast feedback
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="auto-gen-overlay" onclick={(e) => e.target === e.currentTarget && onClose()}>
  <div class="gen-window">
    <header class="gen-header">
      <h2>{$t('themeGenerator.title')}</h2>
      <button class="close-btn" onclick={onClose} aria-label={$t('common.close')}>
        <iconify-icon icon="mdi:close"></iconify-icon>
      </button>
    </header>

    <div class="gen-body">
      <!-- Controls -->
      <div class="controls-pane">
        <div class="inputs-scroll">
          <div class="section">
            <h3>{$t('themeGenerator.sectionIdentity')}</h3>
            <LabeledInput label={$t('themeGenerator.lblThemeId')} bind:value={settings.themeId} placeholder="unique_id" />
            <LabeledInput label={$t('themeGenerator.lblThemeName')} bind:value={settings.themeName} placeholder="Display Name" />
          </div>

          <div class="section">
            <h3>{$t('themeGenerator.sectionCore')}</h3>
            <ColorPicker label={$t('themeGenerator.lblPrimaryColor')} bind:value={settings.primary} />
            
            <div class="control-group">
              <label>{$t('themeGenerator.lblHarmony')}</label>
              <select bind:value={settings.harmony}>
                <option value="monochromatic">{$t('themeGenerator.harmony.monochromatic')}</option>
                <option value="analogous">{$t('themeGenerator.harmony.analogous')}</option>
                <option value="complementary">{$t('themeGenerator.harmony.complementary')}</option>
                <option value="splitComplementary">{$t('themeGenerator.harmony.splitComplementary')}</option>
                <option value="triadic">{$t('themeGenerator.harmony.triadic')}</option>
              </select>
            </div>

            <div class="control-group">
              <label>{$t('themeGenerator.lblRadius')}</label>
              <select bind:value={settings.radius}>
                <option value="sharp">{$t('themeGenerator.radius.sharp')}</option>
                <option value="standard">{$t('themeGenerator.radius.standard')}</option>
                <option value="soft">{$t('themeGenerator.radius.soft')}</option>
              </select>
            </div>
          </div>

          <div class="section">
            <h3>{$t('themeGenerator.sectionSurfaces')}</h3>
            <RangeInput label={$t('themeGenerator.lblCardOpacity')} bind:value={settings.cardOpacity} min={0} max={1} step={0.05} />
            <RangeInput label={$t('themeGenerator.lblPanelOpacity')} bind:value={settings.panelOpacity} min={0} max={1} step={0.05} />
          </div>
        </div>

        <!-- Pinned Actions -->
        <div class="actions">
          <input type="file" hidden id="import-file" accept=".json" onchange={handleImport} />
          <div class="row-grid">
             <button class="btn secondary" onclick={() => document.getElementById('import-file')?.click()}>
               <iconify-icon icon="mdi:upload"></iconify-icon> {$t('themeGenerator.btnImport')}
             </button>
             <button class="btn secondary" onclick={handleExport}>
               <iconify-icon icon="mdi:download"></iconify-icon> {$t('themeGenerator.btnExport')}
             </button>
             <button class="btn secondary" onclick={copyJson}>
               <iconify-icon icon="mdi:code-json"></iconify-icon> {$t('themeGenerator.btnCopy')}
             </button>
          </div>
          <button class="btn primary full" disabled={!validation.ok} onclick={handleSave}>
            {$t('themeGenerator.btnGenerate')}
          </button>
          
          {#if validation.errors.length > 0}
            <div class="validation-errors">
              {#each validation.errors as err}
                <div class="err">{err}</div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- Preview -->
      <div class="preview-pane">
        <!-- Toolbar moved out of canvas for guaranteed contrast -->
        <div class="preview-toolbar">
           <div class="segmented-control">
              <button 
                class="segment" 
                class:active={previewMode === 'light'} 
                onclick={() => previewMode = 'light'}
              >
                <iconify-icon icon="mdi:white-balance-sunny" width="16"></iconify-icon>
                {$t('themeGenerator.previewLight')}
              </button>
              <button 
                class="segment" 
                class:active={previewMode === 'dark'} 
                onclick={() => previewMode = 'dark'}
              >
                <iconify-icon icon="mdi:weather-night" width="16"></iconify-icon>
                {$t('themeGenerator.previewDark')}
              </button>
           </div>
        </div>

        <!-- Live Preview Canvas -->
        <div 
          class="preview-canvas" 
          style:background={previewScheme.dashboardBackgroundType === 'gradient' 
             ? `linear-gradient(${previewScheme.dashboardGradientAngle}deg, ${previewScheme.dashboardBackgroundColor1}, ${previewScheme.dashboardBackgroundColor2})`
             : previewScheme.dashboardBackgroundColor1}
        >
           <!-- Card 1: Idle -->
           <div 
             class="preview-card" 
             style:background-color={previewScheme.cardBackground} 
             style:border-radius="{previewScheme.cardBorderRadius}px" 
             style:border="{previewScheme.cardBorderWidth}px solid {previewScheme.cardBorderColor}"
             style:box-shadow={previewScheme.shadowCard}
           >
              <div class="p-header">
                 <div class="p-icon" style:color={previewScheme.statusTextColor} style:background-color={previewScheme.iconBackgroundColorOff}>
                    <iconify-icon icon="mdi:sofa" width="24"></iconify-icon>
                 </div>
                 <div class="p-name" style:color={previewScheme.nameTextColor}>Living Room</div>
              </div>
              <div class="p-body">
                 <div class="p-state" style:color={previewScheme.valueTextColor}>Off</div>
              </div>
           </div>

           <!-- Card 2: Active -->
           <div 
             class="preview-card active" 
             style:background-color={previewScheme.cardBackgroundOn} 
             style:border-radius="{previewScheme.cardBorderRadius}px" 
             style:border="{previewScheme.cardBorderWidth}px solid {previewScheme.cardBorderColorOn}"
             style:box-shadow={previewScheme.shadowCard}
           >
              <div class="p-header">
                 <div class="p-icon active" style:color={previewScheme.iconColorOn} style:background-color={previewScheme.iconBackgroundColorOn}>
                    <iconify-icon icon="mdi:lightbulb" width="24"></iconify-icon>
                 </div>
                 <div class="p-name" style:color={previewScheme.nameTextColorOn}>Ceiling Light</div>
              </div>
              <div class="p-body">
                 <div class="p-state" style:color={previewScheme.valueTextColorOn}>100%</div>
                 <div class="p-sub" style:color={previewScheme.unitTextColorOn}>Brightness</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .auto-gen-overlay {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
    z-index: 4000; display: flex; align-items: center; justify-content: center;
  }
  .gen-window {
    width: 960px; /* Increased overall width */
    height: 700px; max-width: 95vw; max-height: 95vh;
    background: var(--bg-panel); border-radius: 16px; border: 1px solid var(--border-primary);
    display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  }
  .gen-header {
    display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-divider);
    flex-shrink: 0;
  }
  .gen-header h2 { margin: 0; font-size: 1.25rem; color: var(--text-primary); }
  .close-btn { background: transparent; border: none; cursor: pointer; color: var(--text-secondary); display: flex; padding: 4px; border-radius: 50%; }
  .close-btn:hover { background: var(--bg-card-hover); color: var(--text-primary); }
  
  .gen-body { flex: 1; display: flex; overflow: hidden; }
  
  /* Sidebar Layout */
  .controls-pane { 
    width: 400px; /* WIDENED for buttons */
    background: var(--bg-secondary); 
    display: flex; 
    flex-direction: column; 
    border-right: 1px solid var(--border-divider); 
    flex-shrink: 0;
  }
  
  .inputs-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .section h3 { margin: 0 0 1rem 0; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.5px; }
  
  .control-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .control-group label { font-size: 0.9rem; font-weight: 500; color: var(--text-primary); }
  select { width: 100%; padding: 0.6rem; border-radius: 8px; border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); cursor: pointer; }
  
  .actions { 
    padding: 1.5rem;
    background: var(--bg-panel);
    border-top: 1px solid var(--border-divider);
    display: flex; flex-direction: column; gap: 1rem; 
    flex-shrink: 0;
  }
  .row-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  
  .btn { padding: 0.75rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; white-space: nowrap; font-size: 0.9rem; transition: all 0.2s; }
  .btn.primary { background: var(--accent-primary); color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  .btn.primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
  
  .btn.secondary { background: var(--bg-input); border: 1px solid var(--border-input); color: var(--text-secondary); font-size: 0.85rem; flex-direction: column; padding: 0.6rem; gap: 4px; }
  .btn.secondary:hover { background: var(--bg-card-hover); border-color: var(--border-focus); color: var(--text-primary); }
  
  .full { width: 100%; }
  
  .validation-errors { background: rgba(255, 0, 0, 0.1); padding: 0.75rem; border-radius: 8px; }
  .err { color: var(--accent-error); font-size: 0.8rem; }

  /* Preview Pane */
  .preview-pane { 
    flex: 1; 
    display: flex; 
    flex-direction: column; 
    position: relative;
    background: var(--bg-page); /* Fallback */
  }
  
  /* Toolbar - Now distinct at top */
  .preview-toolbar {
    padding: 1rem;
    display: flex;
    justify-content: center;
    background: var(--bg-panel);
    border-bottom: 1px solid var(--border-divider);
    flex-shrink: 0;
  }
  
  .segmented-control {
    background: var(--bg-input);
    padding: 4px;
    border-radius: 10px;
    display: flex;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
  }
  
  .segment {
    padding: 6px 16px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    border-radius: 7px;
    transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
    display: flex; align-items: center; gap: 6px;
  }
  
  .segment:hover { color: var(--text-primary); }
  
  .segment.active {
    background: var(--bg-card);
    color: var(--text-primary);
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    font-weight: 600;
  }

  .preview-canvas {
    flex: 1; 
    padding: 2rem; 
    display: flex; 
    gap: 2rem; 
    align-items: center; 
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  
  /* Preview Cards - Polished */
  .preview-card {
    width: 160px; 
    height: 150px; /* Increased Height */
    padding: 1.25rem;
    display: flex; 
    flex-direction: column; 
    gap: 0.5rem;
    transition: all 0.3s ease;
  }
  
  .p-header { display: flex; align-items: center; gap: 0.75rem; }
  
  .p-icon {
    width: 36px; height: 36px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem;
  }
  
  .p-name { 
    font-weight: 600; 
    font-size: 0.9rem; 
    line-height: 1.2;
    overflow: hidden; text-overflow: ellipsis; 
  }
  
  .p-body { 
    margin-top: auto; 
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .p-state { font-size: 1.1rem; font-weight: 500; }
  .p-sub { font-size: 0.8rem; margin-top: 2px; opacity: 0.8; }
</style>
