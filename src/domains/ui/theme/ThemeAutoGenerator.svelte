<script lang="ts">
  import { t } from "svelte-i18n";
  import { themeStore } from "./store";
  import { importTheme, exportTheme } from "./io";
  import { generateThemePreset } from "../../../lib/themes/auto/generator";
  import { validateBaseThemeSettings } from "../../../lib/themes/auto/validate";
  import type { BaseThemeSettings } from "../../../lib/themes/auto/types";
  import ColorPicker from "../settings/controls/ColorPicker.svelte";
  import RangeInput from "../settings/controls/RangeInput.svelte";
  import LabeledInput from "../settings/controls/LabeledInput.svelte";
  import "iconify-icon";

  let { onClose } = $props<{ onClose: () => void }>();

  // Presets Data
  const presets: {
    name: string;
    primary: string;
    harmony: string;
    radius: string;
    role: "accent" | "background";
    themeId: string;
  }[] = [
    {
      name: "Evolusion",
      primary: "#6366f1",
      harmony: "analogous",
      radius: "standard",
      role: "accent",
      themeId: "evolusion_std",
    },
    {
      name: "Cyberpunk",
      primary: "#00ff9d",
      harmony: "splitComplementary",
      radius: "sharp",
      role: "background",
      themeId: "cyber_neon",
    },
    {
      name: "Cozy",
      primary: "#eabe92",
      harmony: "analogous",
      radius: "soft",
      role: "background",
      themeId: "warm_cozy",
    },
    {
      name: "Deep Sea",
      primary: "#0ea5e9",
      harmony: "monochromatic",
      radius: "standard",
      role: "accent",
      themeId: "ocean_depths",
    },
    {
      name: "Forest",
      primary: "#10b981",
      harmony: "analogous",
      radius: "soft",
      role: "accent",
      themeId: "natural_forest",
    },
  ];

  // State
  let settings = $state<BaseThemeSettings>({
    themeId: "my_auto_theme",
    themeName: "My Auto Theme",
    primary: "#6366f1",
    colorRole: "accent", // Default
    harmony: "analogous",
    radius: "standard",
    cardOpacity: 0.5,
    panelOpacity: 0.5,
  });

  function applyPreset(p: any) {
    settings.primary = p.primary;
    settings.harmony = p.harmony;
    settings.radius = p.radius;
    settings.colorRole = p.role;
    settings.themeName = p.name + " Remix";
    settings.themeId = p.themeId + "_" + Math.floor(Math.random() * 1000);
  }

  let previewMode = $state<"light" | "dark">("dark");
  let validation = $derived(validateBaseThemeSettings(settings));

  // Live Preview Data
  let previewTheme = $derived(generateThemePreset(settings));
  let previewScheme = $derived(
    previewMode === "dark"
      ? previewTheme.theme.scheme.dark
      : previewTheme.theme.scheme.light,
  );

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
        alert($t("settings.messages.importSuccess"));
        onClose();
      } catch (err: any) {
        alert($t("settings.messages.importError") + ": " + err.message);
      }
    }
  }

  function copyJson() {
    const preset = generateThemePreset(settings);
    navigator.clipboard.writeText(JSON.stringify(preset, null, 2));
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="auto-gen-overlay"
  onclick={(e) => e.target === e.currentTarget && onClose()}
>
  <div class="gen-window">
    <header class="gen-header">
      <h2>{$t("themeGenerator.title")}</h2>
      <button
        class="close-btn"
        onclick={onClose}
        aria-label={$t("common.close")}
      >
        <iconify-icon icon="mdi:close"></iconify-icon>
      </button>
    </header>

    <div class="gen-body">
      <!-- Controls -->
      <div class="controls-pane">
        <div class="inputs-scroll">
          <!-- Presets Gallery -->
          <div class="section">
            <h3>{$t("themeGenerator.sectionPresets") || "Quick Vibes"}</h3>
            <div class="preset-grid">
              {#each presets as p}
                <button
                  class="preset-card"
                  onclick={() => applyPreset(p)}
                  style:--p-color={p.primary}
                >
                  <div class="p-preview" style:background={p.primary}></div>
                  <span class="p-name">{p.name}</span>
                </button>
              {/each}
            </div>
          </div>

          <div class="section">
            <h3>{$t("themeGenerator.sectionIdentity")}</h3>
            <LabeledInput
              label={$t("themeGenerator.lblThemeId")}
              bind:value={settings.themeId}
              placeholder="unique_id"
            />
            <LabeledInput
              label={$t("themeGenerator.lblThemeName")}
              bind:value={settings.themeName}
              placeholder="Display Name"
            />
          </div>

          <div class="section">
            <h3>{$t("themeGenerator.sectionCore")}</h3>
            <ColorPicker
              label={$t("themeGenerator.lblPrimaryColor")}
              bind:value={settings.primary}
            />

            <!-- Color Role Switch -->
            <div class="control-group">
              <label>{$t("themeGenerator.lblColorRole")}</label>
              <div class="segmented-control">
                <button
                  class="segment"
                  class:active={settings.colorRole === "accent"}
                  onclick={() => (settings.colorRole = "accent")}
                >
                  {$t("themeGenerator.roleAccent")} (10%)
                </button>
                <button
                  class="segment"
                  class:active={settings.colorRole === "background"}
                  onclick={() => (settings.colorRole = "background")}
                >
                  {$t("themeGenerator.roleBg")} (60%)
                </button>
              </div>
            </div>

            <div class="control-group">
              <label>{$t("themeGenerator.lblHarmony")}</label>
              <select bind:value={settings.harmony}>
                <option value="monochromatic"
                  >{$t("themeGenerator.harmony.monochromatic")}</option
                >
                <option value="analogous"
                  >{$t("themeGenerator.harmony.analogous")}</option
                >
                <option value="complementary"
                  >{$t("themeGenerator.harmony.complementary")}</option
                >
                <option value="splitComplementary"
                  >{$t("themeGenerator.harmony.splitComplementary")}</option
                >
                <option value="triadic"
                  >{$t("themeGenerator.harmony.triadic")}</option
                >
              </select>
            </div>

            <div class="control-group">
              <label>{$t("themeGenerator.lblRadius")}</label>
              <select bind:value={settings.radius}>
                <option value="sharp"
                  >{$t("themeGenerator.radius.sharp")}</option
                >
                <option value="standard"
                  >{$t("themeGenerator.radius.standard")}</option
                >
                <option value="soft">{$t("themeGenerator.radius.soft")}</option>
              </select>
            </div>
          </div>

          <div class="section">
            <h3>{$t("themeGenerator.sectionSurfaces")}</h3>
            <RangeInput
              label={$t("themeGenerator.lblCardOpacity")}
              bind:value={settings.cardOpacity}
              min={0}
              max={1}
              step={0.05}
            />
            <RangeInput
              label={$t("themeGenerator.lblPanelOpacity")}
              bind:value={settings.panelOpacity}
              min={0}
              max={1}
              step={0.05}
            />
          </div>
        </div>

        <!-- Pinned Actions -->
        <div class="actions">
          <input
            type="file"
            hidden
            id="import-file"
            accept=".json"
            onchange={handleImport}
          />
          <div class="row-grid">
            <button
              class="btn secondary"
              onclick={() => document.getElementById("import-file")?.click()}
            >
              <iconify-icon icon="mdi:upload"></iconify-icon>
              {$t("themeGenerator.btnImport")}
            </button>
            <button class="btn secondary" onclick={handleExport}>
              <iconify-icon icon="mdi:download"></iconify-icon>
              {$t("themeGenerator.btnExport")}
            </button>
            <button class="btn secondary" onclick={copyJson}>
              <iconify-icon icon="mdi:code-json"></iconify-icon>
              {$t("themeGenerator.btnCopy")}
            </button>
          </div>
          <button
            class="btn primary full"
            disabled={!validation.ok}
            onclick={handleSave}
          >
            {$t("themeGenerator.btnGenerate")}
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
              class:active={previewMode === "light"}
              onclick={() => (previewMode = "light")}
            >
              <iconify-icon icon="mdi:white-balance-sunny" width="16"
              ></iconify-icon>
              {$t("themeGenerator.previewLight")}
            </button>
            <button
              class="segment"
              class:active={previewMode === "dark"}
              onclick={() => (previewMode = "dark")}
            >
              <iconify-icon icon="mdi:weather-night" width="16"></iconify-icon>
              {$t("themeGenerator.previewDark")}
            </button>
          </div>
        </div>

        <!-- Live Preview Canvas -->
        <div
          class="preview-canvas"
          style:background={previewScheme.dashboardBackgroundType === "gradient"
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
              <div
                class="p-icon"
                style:color={previewScheme.statusTextColor}
                style:background-color={previewScheme.iconBackgroundColorOff}
              >
                <iconify-icon icon="mdi:sofa" width="24"></iconify-icon>
              </div>
              <div class="p-name" style:color={previewScheme.nameTextColor}>
                Living Room
              </div>
            </div>
            <div class="p-body">
              <div class="p-state" style:color={previewScheme.valueTextColor}>
                Off
              </div>
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
              <div
                class="p-icon active"
                style:color={previewScheme.iconColorOn}
                style:background-color={previewScheme.iconBackgroundColorOn}
              >
                <iconify-icon icon="mdi:lightbulb" width="24"></iconify-icon>
              </div>
              <div class="p-name" style:color={previewScheme.nameTextColorOn}>
                Ceiling Light
              </div>
            </div>
            <div class="p-body">
              <div class="p-state" style:color={previewScheme.valueTextColorOn}>
                100%
              </div>
              <div class="p-sub" style:color={previewScheme.unitTextColorOn}>
                Brightness
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .auto-gen-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    z-index: 4000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gen-window {
    width: 900px;
    height: 650px;
    max-width: 95vw;
    max-height: 90vh;

    /* Layout */
    display: flex;
    flex-direction: column;
    overflow: hidden;

    /* Glass Effect */
    background: var(--bg-panel, rgba(30, 30, 30, 0.9));
    border-radius: 24px;
    border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

    animation: scaleIn 0.3s var(--ease-smooth);
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .gen-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 2rem;
    border-bottom: 1px solid var(--border-divider, rgba(255, 255, 255, 0.05));
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.02);
  }

  .gen-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-primary);
    font-weight: 700;
  }

  .close-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    display: flex;
    padding: 6px;
    border-radius: 50%;
    transition: 0.2s;
  }
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }

  .gen-body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  /* Sidebar Layout */
  .controls-pane {
    width: 380px;
    background: var(--bg-secondary, rgba(0, 0, 0, 0.2));
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border-divider, rgba(255, 255, 255, 0.05));
    flex-shrink: 0;
  }

  .inputs-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .section h3 {
    margin: 0 0 1rem 0;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-secondary);
    letter-spacing: 1px;
  }

  .control-group {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .control-group label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
  }
  select {
    width: 100%;
    padding: 0.6rem;
    border-radius: 8px;
    border: 1px solid var(--border-input, rgba(255, 255, 255, 0.1));
    background: var(--bg-input, rgba(255, 255, 255, 0.05));
    color: var(--text-primary);
    cursor: pointer;
  }

  .actions {
    padding: 1.5rem;
    background: var(--bg-panel, rgba(30, 30, 30, 0.5));
    border-top: 1px solid var(--border-divider, rgba(255, 255, 255, 0.05));
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex-shrink: 0;
  }
  .row-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
  }

  .btn {
    padding: 0.75rem;
    border-radius: 12px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    white-space: nowrap;
    font-size: 0.9rem;
    transition: all 0.2s;
  }
  .btn.primary {
    background: var(--accent-primary);
    color: white;
    box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3);
  }
  .btn.primary:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .btn.secondary {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-secondary);
    font-size: 0.8rem;
    flex-direction: column;
    padding: 0.6rem;
    gap: 4px;
  }
  .btn.secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }

  .full {
    width: 100%;
  }

  .validation-errors {
    background: rgba(255, 60, 60, 0.1);
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 60, 60, 0.2);
  }
  .err {
    color: var(--accent-error, #ff4d4d);
    font-size: 0.8rem;
  }

  /* Preset Gallery */
  .preset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 12px;
  }

  .preset-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 10px;
    background: var(--bg-input, rgba(0, 0, 0, 0.2));
    border: 1px solid var(--border-input, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .preset-card:hover {
    background: var(--bg-card, rgba(255, 255, 255, 0.05));
    border-color: var(--p-color, var(--accent-primary));
    transform: translateY(-2px);
  }

  .p-preview {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .p-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

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
    background: rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    flex-shrink: 0;
  }

  .segmented-control {
    background: rgba(0, 0, 0, 0.2);
    padding: 4px;
    border-radius: 12px;
    display: flex;
  }

  .segment {
    padding: 6px 16px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .segment:hover {
    color: var(--text-primary);
  }

  .segment.active {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    font-weight: 600;
    backdrop-filter: blur(4px);
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
    height: 160px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: all 0.3s ease;
  }

  .p-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .p-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }

  .p-name {
    font-weight: 600;
    font-size: 0.9rem;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .p-body {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .p-state {
    font-size: 1.1rem;
    font-weight: 500;
  }
  .p-sub {
    font-size: 0.8rem;
    margin-top: 2px;
    opacity: 0.7;
  }
</style>
