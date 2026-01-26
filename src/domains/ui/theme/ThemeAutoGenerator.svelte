
<script lang="ts">
  import { t } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import { themeStore } from './store';
  import { importTheme, exportTheme } from './io';
  import { generateThemePreset } from '../../../lib/themes/auto/generator';
  import { validateBaseThemeSettings } from '../../../lib/themes/auto/validate';
  import type { BaseThemeSettings, HarmonyRule, RadiusPreset } from '../../../lib/themes/auto/types';
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
        // Note: Importing a raw theme file doesn't map back to "settings" easily 
        // without complex reverse engineering. 
        // We just save it to the store as a standard custom theme.
        themeStore.saveTheme(theme);
        themeStore.setActiveTheme(theme.theme.id);
        alert('Theme imported successfully!');
        onClose();
      } catch (err: any) {
        alert('Import failed: ' + err.message);
      }
    }
  }

  function copyJson() {
    const preset = generateThemePreset(settings);
    navigator.clipboard.writeText(JSON.stringify(preset, null, 2));
    alert('JSON copied to clipboard');
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="auto-gen-overlay" onclick={(e) => e.target === e.currentTarget && onClose()}>
  <div class="gen-window">
    <header class="gen-header">
      <h2>Auto Theme Generator</h2>
      <button class="close-btn" onclick={onClose}>
        <iconify-icon icon="mdi:close"></iconify-icon>
      </button>
    </header>

    <div class="gen-body">
      <!-- Controls -->
      <div class="controls-pane">
        <div class="section">
          <h3>Identity</h3>
          <LabeledInput label="Theme ID" bind:value={settings.themeId} placeholder="unique_id" />
          <LabeledInput label="Theme Name" bind:value={settings.themeName} placeholder="Display Name" />
        </div>

        <div class="section">
          <h3>Core</h3>
          <ColorPicker label="Primary Color" bind:value={settings.primary} />
          
          <div class="control-group">
            <label>Harmony</label>
            <select bind:value={settings.harmony}>
              <option value="monochromatic">Monochromatic</option>
              <option value="analogous">Analogous</option>
              <option value="complementary">Complementary</option>
              <option value="splitComplementary">Split Comp.</option>
              <option value="triadic">Triadic</option>
            </select>
          </div>

          <div class="control-group">
            <label>Corner Radius</label>
            <select bind:value={settings.radius}>
              <option value="sharp">Sharp (4px)</option>
              <option value="standard">Standard (12px)</option>
              <option value="soft">Soft (24px)</option>
            </select>
          </div>
        </div>

        <div class="section">
          <h3>Surfaces</h3>
          <RangeInput label="Card Opacity" bind:value={settings.cardOpacity} min={0} max={1} step={0.05} />
          <RangeInput label="Panel Opacity" bind:value={settings.panelOpacity} min={0} max={1} step={0.05} />
        </div>

        <div class="actions">
          <input type="file" hidden id="import-file" accept=".json" onchange={handleImport} />
          <div class="row">
             <button class="btn secondary" onclick={() => document.getElementById('import-file')?.click()}>
               <iconify-icon icon="mdi:upload"></iconify-icon> Import
             </button>
             <button class="btn secondary" onclick={handleExport}>
               <iconify-icon icon="mdi:download"></iconify-icon> Export
             </button>
             <button class="btn secondary" onclick={copyJson}>
               <iconify-icon icon="mdi:code-json"></iconify-icon> Copy
             </button>
          </div>
          <button class="btn primary full" disabled={!validation.ok} onclick={handleSave}>
            Generate & Save
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
        <div class="preview-tabs">
          <button class="tab" class:active={previewMode === 'light'} onclick={() => previewMode = 'light'}>Light</button>
          <button class="tab" class:active={previewMode === 'dark'} onclick={() => previewMode = 'dark'}>Dark</button>
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
  }
  .gen-header h2 { margin: 0; font-size: 1.25rem; color: var(--text-primary); }
  .close-btn { background: transparent; border: none; cursor: pointer; color: var(--text-secondary); }
  .gen-body { flex: 1; display: flex; overflow: hidden; }
  
  .controls-pane { width: 320px; padding: 1.5rem; overflow-y: auto; background: var(--bg-secondary); display: flex; flex-direction: column; gap: 2rem; border-right: 1px solid var(--border-divider); }
  .section h3 { margin: 0 0 1rem 0; font-size: 0.9rem; text-transform: uppercase; color: var(--text-secondary); }
  
  .control-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .control-group label { font-size: 0.9rem; font-weight: 500; color: var(--text-primary); }
  select { width: 100%; padding: 0.6rem; border-radius: 8px; border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); }
  
  .actions { margin-top: auto; display: flex; flex-direction: column; gap: 0.75rem; }
  .actions .row { display: flex; gap: 0.5rem; }
  
  .btn { padding: 0.75rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex: 1; }
  .btn.primary { background: var(--accent-primary); color: white; }
  .btn.secondary { background: var(--bg-card); border: 1px solid var(--border-primary); color: var(--text-primary); }
  .full { width: 100%; }
  
  .validation-errors { background: rgba(255, 0, 0, 0.1); padding: 0.75rem; border-radius: 8px; }
  .err { color: var(--accent-error); font-size: 0.8rem; }

  /* Preview */
  .preview-pane { flex: 1; display: flex; flex-direction: column; }
  .preview-tabs { display: flex; border-bottom: 1px solid var(--border-divider); }
  .tab { flex: 1; padding: 1rem; background: var(--bg-panel); border: none; cursor: pointer; color: var(--text-secondary); }
  .tab.active { background: var(--bg-card); color: var(--accent-primary); font-weight: bold; border-bottom: 2px solid var(--accent-primary); }
  
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
