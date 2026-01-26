
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
          <div class="row">
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
        <!-- Floating Segmented Control -->
        <div class="preview-toolbar">
           <div class="segmented-control">
              <button 
                class="segment" 
                class:active={previewMode === 'light'} 
                onclick={() => previewMode = 'light'}
              >
                {$t('themeGenerator.previewLight')}
              </button>
              <button 
                class="segment" 
                class:active={previewMode === 'dark'} 
                onclick={() => previewMode = 'dark'}
              >
                {$t('themeGenerator.previewDark')}
              </button>
           </div>
        </div>

        <!-- Live Preview Canvas applied via inline styles -->
        <div 
          class="preview-canvas" 
          style:background={previewScheme.dashboardBackgroundType === 'gradient' 
             ? `linear-gradient(${previewScheme.dashboardGradientAngle}deg, ${previewScheme.dashboardBackgroundColor1}, ${previewScheme.dashboardBackgroundColor2})`
             : previewScheme.dashboardBackgroundColor1}
        >
           <div class="preview-card" style:background-color={previewScheme.cardBackground} style:border-radius="{previewScheme.cardBorderRadius}px" style:border="1px solid {previewScheme.cardBorderColor}">
              <div class="p-header" style:color={previewScheme.nameTextColor}>
                 <iconify-icon icon="mdi:home" style:color={previewScheme.iconBackgroundColorOn}></iconify-icon>
                 <span>Living Room</span>
              </div>
              <div class="p-state" style:color={previewScheme.valueTextColor}>On</div>
           </div>

           <div class="preview-card active" style:background-color={previewScheme.cardBackgroundOn} style:border-radius="{previewScheme.cardBorderRadius}px" style:border="1px solid {previewScheme.cardBorderColorOn}">
              <div class="p-header" style:color={previewScheme.nameTextColorOn}>
                 <iconify-icon icon="mdi:lightbulb" style:color={previewScheme.iconColorOn}></iconify-icon>
                 <span>Ceiling Light</span>
              </div>
              <div class="p-state" style:color={previewScheme.valueTextColorOn}>100%</div>
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
    width: 900px; height: 700px; max-width: 95vw; max-height: 95vh;
    background: var(--bg-panel); border-radius: 16px; border: 1px solid var(--border-primary);
    display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  }
  .gen-header {
    display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-divider);
    flex-shrink: 0;
  }
  .gen-header h2 { margin: 0; font-size: 1.25rem; color: var(--text-primary); }
  .close-btn { background: transparent; border: none; cursor: pointer; color: var(--text-secondary); display: flex; }
  
  .gen-body { flex: 1; display: flex; overflow: hidden; }
  
  /* Sidebar Layout fixed */
  .controls-pane { 
    width: 320px; 
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

  .section h3 { margin: 0 0 1rem 0; font-size: 0.9rem; text-transform: uppercase; color: var(--text-secondary); }
  
  .control-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .control-group label { font-size: 0.9rem; font-weight: 500; color: var(--text-primary); }
  select { width: 100%; padding: 0.6rem; border-radius: 8px; border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); }
  
  .actions { 
    padding: 1.5rem;
    background: var(--bg-panel); /* Contrast against secondary */
    border-top: 1px solid var(--border-divider);
    display: flex; flex-direction: column; gap: 0.75rem; 
    flex-shrink: 0;
  }
  .actions .row { display: flex; gap: 0.5rem; }
  
  .btn { padding: 0.75rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex: 1; white-space: nowrap; font-size: 0.9rem; }
  .btn.primary { background: var(--accent-primary); color: white; }
  .btn.secondary { background: var(--bg-card); border: 1px solid var(--border-primary); color: var(--text-primary); }
  .full { width: 100%; }
  
  .validation-errors { background: rgba(255, 0, 0, 0.1); padding: 0.75rem; border-radius: 8px; }
  .err { color: var(--accent-error); font-size: 0.8rem; }

  /* Preview */
  .preview-pane { 
    flex: 1; 
    display: flex; 
    flex-direction: column; 
    position: relative;
  }
  
  /* Segmented Control Styling */
  .preview-toolbar {
    position: absolute;
    top: 1.5rem;
    left: 0; right: 0;
    display: flex;
    justify-content: center;
    z-index: 10;
    pointer-events: none; /* Let clicks pass through outside the control */
  }
  
  .segmented-control {
    background: rgba(0,0,0,0.1); /* Neutral semi-transparent */
    backdrop-filter: blur(8px);
    padding: 4px;
    border-radius: 10px;
    display: flex;
    pointer-events: auto;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  /* In dark mode generator, make the backing lighter */
  :global([data-theme="dark"]) .segmented-control {
     background: rgba(255,255,255,0.1);
  }

  .segment {
    padding: 6px 20px;
    border: none;
    background: transparent;
    color: var(--text-primary); /* Uses generator's own theme vars for text */
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  }
  
  .segment:hover {
    background: rgba(255,255,255,0.1);
  }
  
  .segment.active {
    background: var(--bg-card);
    color: var(--text-primary);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    font-weight: 600;
  }

  .preview-canvas {
    flex: 1; padding: 2rem; display: flex; gap: 2rem; align-items: center; justify-content: center;
    position: relative;
  }
  
  .preview-card {
    width: 200px; height: 120px; padding: 1.5rem;
    display: flex; flex-direction: column; justify-content: space-between;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }
  .p-header { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.9rem; }
  .p-state { font-size: 1.5rem; font-weight: 500; }
</style>
