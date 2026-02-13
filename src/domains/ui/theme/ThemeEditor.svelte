<script lang="ts">
  import { t } from "svelte-i18n";
  import { slide } from "svelte/transition";
  import type {
    ThemeFile,
    ColorScheme,
    ThemeLayout,
  } from "../../../themes/types";
  import { applyThemeCSS } from "../../../themes/utils";
  import ColorPicker from "../settings/controls/ColorPicker.svelte";
  import "iconify-icon";

  import { themeEditorStore } from "./editorStore";

  // Derived from store
  let draft = $state($themeEditorStore.draft!);

  // Ensure we close if draft is missing (safety)
  $effect(() => {
    if (!draft && $themeEditorStore.isOpen) {
      themeEditorStore.close();
    }
  });

  function doSave() {
    if (draft) {
      // Update the draft in store just in case
      themeEditorStore.save();
    }
  }

  let activeTab = $state<"light" | "dark">("light");
  let activeSection = $state<
    "main" | "global_ui" | "cards" | "text" | "widgets"
  >("main");

  let currentScheme = $derived(draft.theme.scheme[activeTab]);
  let currentLayout = $derived(draft.theme.layout);

  function updateField(key: keyof ColorScheme, value: any) {
    // @ts-ignore - Dynamic assignment
    draft.theme.scheme[activeTab][key] = value;
    applyThemeCSS(draft.theme.scheme[activeTab], draft.theme.layout);
  }

  function updateLayout(key: keyof ThemeLayout, value: any) {
    // @ts-ignore
    draft.theme.layout[key] = value;
    applyThemeCSS(draft.theme.scheme[activeTab], draft.theme.layout);
  }

  function handleBackgroundTypeChange(type: string) {
    updateField("dashboardBackgroundType", type);

    // Ensure secondary color exists if switching to gradient
    if (
      type === "gradient" &&
      !draft.theme.scheme[activeTab].dashboardBackgroundColor2
    ) {
      updateField(
        "dashboardBackgroundColor2",
        draft.theme.scheme[activeTab].dashboardBackgroundColor1,
      );
    }
    // Ensure angle exists
    if (
      type === "gradient" &&
      draft.theme.scheme[activeTab].dashboardGradientAngle === undefined
    ) {
      updateField("dashboardGradientAngle", 135);
    }
  }

  // Resizing Logic
  let width = $state(360);
  let isResizing = $state(false);

  function startResize(e: MouseEvent) {
    e.preventDefault();
    isResizing = true;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResize);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isResizing) return;
    // Right panel: Width = (Window - 20px offset) - MouseX
    // e.g. Window 1000, Offset 20 -> Right Edge at 980. Mouse at 600 -> Width 380.
    let newWidth = window.innerWidth - 20 - e.clientX;

    // Constraints
    if (newWidth < 360) newWidth = 360;
    if (newWidth > 800) newWidth = 800; // sensible max
    if (newWidth > window.innerWidth - 40) newWidth = window.innerWidth - 40;

    width = newWidth;
  }

  function stopResize() {
    isResizing = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", stopResize);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }
</script>

{#snippet sliderRow(
  label: string,
  key: keyof ColorScheme | keyof ThemeLayout,
  min: number,
  max: number,
  step: number,
  unit: string = "",
  isLayout: boolean = false,
)}
  <div class="control-row slider-row">
    <div class="slider-header">
      <span class="label">{label}</span>
      <span class="value"
        >{(isLayout
          ? currentLayout[key as keyof ThemeLayout]
          : currentScheme[key as keyof ColorScheme]) ?? min}{unit}</span
      >
    </div>
    <input
      type="range"
      class="slider"
      {min}
      {max}
      {step}
      value={((isLayout
        ? currentLayout[key as keyof ThemeLayout]
        : currentScheme[key as keyof ColorScheme]) as number) ?? min}
      oninput={(e) =>
        isLayout
          ? updateLayout(
              key as keyof ThemeLayout,
              parseFloat(e.currentTarget.value),
            )
          : updateField(
              key as keyof ColorScheme,
              parseFloat(e.currentTarget.value),
            )}
      style="background-size: {(((((isLayout
        ? currentLayout[key as keyof ThemeLayout]
        : currentScheme[key as keyof ColorScheme]) as number) ?? min) -
        min) *
        100) /
        (max - min)}% 100%"
    />
  </div>
{/snippet}

{#snippet selectRow(
  label: string,
  key: keyof ColorScheme | keyof ThemeLayout,
  options: { value: any; label: string }[],
  onChange?: (e: any) => void,
)}
  <div class="control-row select-row">
    <span class="label">{label}</span>
    <div class="select-wrapper">
      <select
        class="modern-select"
        value={currentScheme[key as keyof ColorScheme] ??
          currentLayout[key as keyof ThemeLayout]}
        onchange={onChange
          ? onChange
          : (e) => updateField(key as keyof ColorScheme, e.currentTarget.value)}
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

{#snippet sectionTitle(title: string)}
  <div class="section-title">{title}</div>
{/snippet}

<div class="theme-editor-container" style="width: {width}px">
  <!-- Resize Handle (Left) -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="resize-handle" onmousedown={startResize}></div>

  <!-- Header with Name Input -->
  <header class="editor-header">
    <div class="header-left">
      <button
        class="icon-btn close"
        onclick={themeEditorStore.close}
        aria-label={$t("common.close")}
      >
        <iconify-icon icon="mdi:close"></iconify-icon>
      </button>

      <!-- Name Input moved to header -->
      <div class="name-container">
        <span class="name-label"
          >{$t("settings.themeEditor.namePlaceholder")}</span
        >
        <input
          type="text"
          class="header-name-input"
          bind:value={draft.theme.name}
          placeholder={$t("settings.themeEditor.namePlaceholder")}
        />
      </div>
    </div>
    <div class="header-right">
      <button class="btn primary small" onclick={doSave}>
        {$t("common.save")}
      </button>
    </div>
  </header>

  <div class="editor-body">
    <!-- Meta (Mode Only) -->
    <div class="meta-section">
      <div class="segmented-control">
        <button
          class="segment"
          class:active={activeTab === "light"}
          onclick={() => (activeTab = "light")}
        >
          <iconify-icon icon="mdi:white-balance-sunny" width="18"
          ></iconify-icon>
          {$t("settings.themeModeDay")}
        </button>
        <button
          class="segment"
          class:active={activeTab === "dark"}
          onclick={() => (activeTab = "dark")}
        >
          <iconify-icon icon="mdi:weather-night" width="18"></iconify-icon>
          {$t("settings.themeModeNight")}
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <div class="nav-pills">
      <button
        class="pill"
        class:active={activeSection === "main"}
        onclick={() => (activeSection = "main")}
      >
        {$t("settings.themeEditor.nav.main")}
      </button>
      <button
        class="pill"
        class:active={activeSection === "global_ui"}
        onclick={() => (activeSection = "global_ui")}
      >
        {$t("settings.themeEditor.nav.global_ui")}
      </button>
      <button
        class="pill"
        class:active={activeSection === "cards"}
        onclick={() => (activeSection = "cards")}
      >
        {$t("settings.themeEditor.nav.cards")}
      </button>
      <button
        class="pill"
        class:active={activeSection === "text"}
        onclick={() => (activeSection = "text")}
      >
        {$t("settings.themeEditor.nav.text")}
      </button>
      <button
        class="pill"
        class:active={activeSection === "widgets"}
        onclick={() => (activeSection = "widgets")}
      >
        {$t("settings.themeEditor.nav.widgets")}
      </button>
    </div>

    <!-- Content -->
    <div class="scroll-content">
      {#if activeSection === "main"}
        <div class="group" transition:slide|local={{ axis: "x" }}>
          {@render sectionTitle($t("settings.themeEditor.labels.bgType"))}
          {@render selectRow(
            $t("settings.themeEditor.labels.type"),
            "dashboardBackgroundType",
            [
              {
                value: "color",
                label: $t("settings.themeEditor.labels.solid"),
              },
              {
                value: "gradient",
                label: $t("settings.themeEditor.labels.gradient"),
              },
              {
                value: "image",
                label: $t("settings.themeEditor.labels.image"),
              },
            ],
            (e) => handleBackgroundTypeChange(e.currentTarget.value),
          )}

          {#if currentScheme.dashboardBackgroundType === "color"}
            <ColorPicker
              label={$t("settings.themeEditor.labels.color")}
              value={currentScheme.dashboardBackgroundColor1}
              onChange={(v) => updateField("dashboardBackgroundColor1", v)}
            />
          {:else if currentScheme.dashboardBackgroundType === "gradient"}
            <ColorPicker
              label={$t("settings.themeEditor.labels.startColor")}
              value={currentScheme.dashboardBackgroundColor1}
              onChange={(v) => updateField("dashboardBackgroundColor1", v)}
            />
            <ColorPicker
              label={$t("settings.themeEditor.labels.endColor")}
              value={currentScheme.dashboardBackgroundColor2 ||
                currentScheme.dashboardBackgroundColor1}
              onChange={(v) => updateField("dashboardBackgroundColor2", v)}
            />
            {@render sliderRow(
              $t("settings.themeEditor.labels.angle"),
              "dashboardGradientAngle",
              0,
              360,
              15,
              "°",
            )}
          {:else}
            <div class="control-row">
              <input
                type="text"
                class="modern-input"
                placeholder="Image URL"
                value={currentScheme.dashboardBackgroundImageUrl || ""}
                oninput={(e) =>
                  updateField(
                    "dashboardBackgroundImageUrl",
                    e.currentTarget.value,
                  )}
              />
            </div>
            {@render sliderRow(
              $t("settings.themeEditor.labels.blur"),
              "dashboardBackgroundImageBlur",
              0,
              20,
              1,
              "px",
            )}
            {@render sliderRow(
              $t("settings.themeEditor.labels.brightness"),
              "dashboardBackgroundImageBrightness",
              0,
              200,
              5,
              "%",
            )}
          {/if}

          <div class="divider"></div>
          {@render sectionTitle($t("settings.themeEditor.labels.panelOpacity"))}
          {@render sliderRow(
            $t("settings.themeEditor.labels.opacity"),
            "panelOpacity",
            0,
            1,
            0.05,
          )}
          <ColorPicker
            label={$t("settings.themeEditor.labels.panelBg")}
            value={currentScheme.bgPanel ?? "#000000"}
            onChange={(v) => updateField("bgPanel", v)}
          />
        </div>
      {:else if activeSection === "global_ui"}
        <div class="group" transition:slide|local={{ axis: "x" }}>
          {@render sectionTitle($t("settings.themeEditor.labels.sidebar"))}
          {@render sliderRow(
            $t("settings.themeEditor.labels.opacity"),
            "sidebarOpacity",
            0,
            1,
            0.05,
          )}
          <ColorPicker
            label={$t("templates.style.background")}
            value={currentScheme.bgSidebar}
            onChange={(v) => updateField("bgSidebar", v)}
          />

          <div class="divider"></div>

          {@render sectionTitle($t("settings.themeEditor.labels.header"))}
          {@render sliderRow(
            $t("settings.themeEditor.labels.opacity"),
            "headerOpacity",
            0,
            1,
            0.05,
          )}
          <ColorPicker
            label={$t("templates.style.background")}
            value={currentScheme.bgHeader ?? "#000000"}
            onChange={(v) => updateField("bgHeader", v)}
          />

          <div class="divider"></div>

          {@render sectionTitle($t("settings.themeEditor.labels.elements"))}
          <ColorPicker
            label={$t("settings.themeEditor.labels.chips")}
            value={currentScheme.bgChip}
            onChange={(v) => updateField("bgChip", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.dropdowns")}
            value={currentScheme.bgDropdown ?? "#000000"}
            onChange={(v) => updateField("bgDropdown", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.hover")}
            value={currentScheme.bgCardHover}
            onChange={(v) => updateField("bgCardHover", v)}
          />

          <div class="divider"></div>
          {@render sectionTitle($t("settings.themeEditor.labels.inputs"))}
          <ColorPicker
            label={$t("settings.themeEditor.labels.inputBorder")}
            value={currentScheme.borderInput}
            onChange={(v) => updateField("borderInput", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.focusBorder")}
            value={currentScheme.borderFocus}
            onChange={(v) => updateField("borderFocus", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.dividers")}
            value={currentScheme.borderDivider}
            onChange={(v) => updateField("borderDivider", v)}
          />

          <div class="divider"></div>
          {@render sectionTitle($t("settings.themeEditor.labels.scrollbars"))}
          <ColorPicker
            label={$t("settings.themeEditor.labels.thumb")}
            value={currentScheme.scrollbarThumb}
            onChange={(v) => updateField("scrollbarThumb", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.track")}
            value={currentScheme.scrollbarTrack}
            onChange={(v) => updateField("scrollbarTrack", v)}
          />
        </div>
      {:else if activeSection === "cards"}
        <div class="group" transition:slide|local={{ axis: "x" }}>
          {@render sectionTitle($t("settings.themeEditor.labels.appearance"))}
          {@render sliderRow(
            $t("settings.themeEditor.labels.cardsOpacity"),
            "cardOpacity",
            0,
            1,
            0.05,
          )}
          {@render sliderRow(
            $t("settings.themeEditor.labels.radius"),
            "cardBorderRadius",
            0,
            32,
            1,
            "px",
            true,
          )}

          <ColorPicker
            label={$t("settings.themeEditor.labels.bgOff")}
            value={currentScheme.cardBackground}
            onChange={(v) => updateField("cardBackground", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.bgOn")}
            value={currentScheme.cardBackgroundOn}
            onChange={(v) => updateField("cardBackgroundOn", v)}
          />

          <div class="divider"></div>
          {@render sectionTitle($t("settings.themeEditor.labels.borders"))}
          {@render sliderRow(
            $t("settings.themeEditor.labels.width"),
            "cardBorderWidth",
            0,
            10,
            1,
            "px",
            true,
          )}
          <ColorPicker
            label={$t("settings.themeEditor.labels.color") +
              " (" +
              $t("common.off") +
              ")"}
            value={currentScheme.cardBorderColor}
            onChange={(v) => updateField("cardBorderColor", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.color") +
              " (" +
              $t("common.on") +
              ")"}
            value={currentScheme.cardBorderColorOn}
            onChange={(v) => updateField("cardBorderColorOn", v)}
          />

          <div class="divider"></div>
          {@render sectionTitle($t("settings.themeEditor.labels.icons"))}
          {@render selectRow(
            $t("settings.themeEditor.labels.shape"),
            "iconBackgroundShape",
            [
              { value: "circle", label: "Circle" },
              { value: "rounded-square", label: "Rounded Square" },
              { value: "square", label: "Square" },
            ],
            (e) => updateLayout("iconBackgroundShape", e.currentTarget.value),
          )}
          <ColorPicker
            label={$t("settings.themeEditor.labels.iconBgOff")}
            value={currentScheme.iconBackgroundColorOff}
            onChange={(v) => updateField("iconBackgroundColorOff", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.iconBgOn")}
            value={currentScheme.iconBackgroundColorOn}
            onChange={(v) => updateField("iconBackgroundColorOn", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.iconSymbol")}
            value={currentScheme.iconColorOn ?? "#ffffff"}
            onChange={(v) => updateField("iconColorOn", v)}
          />
        </div>
      {:else if activeSection === "text"}
        <div class="group" transition:slide|local={{ axis: "x" }}>
          <!-- TEXT (OFF) -->
          {@render sectionTitle($t("settings.themeEditor.labels.textOff"))}
          <ColorPicker
            label={$t("settings.themeEditor.labels.deviceName")}
            value={currentScheme.nameTextColor}
            onChange={(v) => updateField("nameTextColor", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.secondaryInfo")}
            value={currentScheme.statusTextColor}
            onChange={(v) => updateField("statusTextColor", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.stateValue")}
            value={currentScheme.valueTextColor}
            onChange={(v) => updateField("valueTextColor", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.unit")}
            value={currentScheme.unitTextColor}
            onChange={(v) => updateField("unitTextColor", v)}
          />

          <!-- TEXT (ON) -->
          <div class="divider"></div>
          {@render sectionTitle($t("settings.themeEditor.labels.textOn"))}
          <ColorPicker
            label={$t("settings.themeEditor.labels.deviceName")}
            value={currentScheme.nameTextColorOn}
            onChange={(v) => updateField("nameTextColorOn", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.secondaryInfo")}
            value={currentScheme.statusTextColorOn}
            onChange={(v) => updateField("statusTextColorOn", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.stateValue")}
            value={currentScheme.valueTextColorOn}
            onChange={(v) => updateField("valueTextColorOn", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.unit")}
            value={currentScheme.unitTextColorOn}
            onChange={(v) => updateField("unitTextColorOn", v)}
          />

          <!-- UI Elements -->
          <div class="divider"></div>
          {@render sectionTitle($t("settings.themeEditor.labels.uiElements"))}
          <ColorPicker
            label={$t("settings.themeEditor.labels.tabTextInactive")}
            value={currentScheme.tabTextColor}
            onChange={(v) => updateField("tabTextColor", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.tabTextActive")}
            value={currentScheme.activeTabTextColor}
            onChange={(v) => updateField("activeTabTextColor", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.tabIndicator")}
            value={currentScheme.tabIndicatorColor}
            onChange={(v) => updateField("tabIndicatorColor", v)}
          />
        </div>
      {:else if activeSection === "widgets"}
        <div class="group" transition:slide|local={{ axis: "x" }}>
          <!-- Clock -->
          {@render sectionTitle($t("settings.widgets.clock"))}
          <ColorPicker
            label={$t("settings.themeEditor.labels.clockText")}
            value={currentScheme.clockTextColor}
            onChange={(v) => updateField("clockTextColor", v)}
          />

          <div class="divider"></div>

          <!-- Weather -->
          {@render sectionTitle($t("settings.weather"))}
          <ColorPicker
            label={$t("settings.themeEditor.labels.weatherPrimary")}
            value={currentScheme.weatherPrimaryColor}
            onChange={(v) => updateField("weatherPrimaryColor", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.weatherSecondary")}
            value={currentScheme.weatherSecondaryColor}
            onChange={(v) => updateField("weatherSecondaryColor", v)}
          />

          <div class="divider"></div>

          <!-- Thermostat -->
          {@render sectionTitle($t("settings.themeEditor.labels.thermostat"))}
          <ColorPicker
            label={$t("settings.themeEditor.labels.knob")}
            value={currentScheme.thermostatHandleColor}
            onChange={(v) => updateField("thermostatHandleColor", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.targetText")}
            value={currentScheme.thermostatDialTextColor}
            onChange={(v) => updateField("thermostatDialTextColor", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.label")}
            value={currentScheme.thermostatDialLabelColor}
            onChange={(v) => updateField("thermostatDialLabelColor", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.heating")}
            value={currentScheme.thermostatHeatingColor}
            onChange={(v) => updateField("thermostatHeatingColor", v)}
          />
          <ColorPicker
            label={$t("settings.themeEditor.labels.cooling")}
            value={currentScheme.thermostatCoolingColor}
            onChange={(v) => updateField("thermostatCoolingColor", v)}
          />
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .theme-editor-container {
    /* Floating Panel Logic */
    position: fixed;
    top: 80px;
    right: 20px;
    /* width handled in template via JS */
    bottom: 20px; /* Stretch to bottom */
    /* max-height removed to force fill */

    /* Solid Background - No Glass */
    background: #333333; /* Neutral Gray */

    border-radius: 16px;
    box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
    border: 1px solid var(--border-divider, rgba(255, 255, 255, 0.1));

    z-index: 3000; /* Above most things, below modals */

    display: flex;
    flex-direction: column;
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      sans-serif;

    animation: slideInRight 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .resize-handle {
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    z-index: 10;
    background: transparent;
  }
  .resize-handle:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  @keyframes slideInRight {
    from {
      transform: translateX(20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* HEADER */
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-divider, rgba(255, 255, 255, 0.05));
    flex-shrink: 0;
    cursor: grab; /* Suggest dragging (TODO: Implement drag logic) */
    direction: ltr; /* Reset text direction */
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  .name-container {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .name-label {
    font-size: 0.7rem;
    color: var(--text-muted);
    font-weight: 600;
    margin-bottom: 2px;
    text-transform: uppercase;
  }

  .header-name-input {
    background: transparent;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    width: 100%;
    padding: 0;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
  }
  .header-name-input:focus {
    outline: none;
    border-bottom-color: var(--accent-primary);
  }

  .icon-btn {
    background: rgba(255, 255, 255, 0.05);
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .icon-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }

  .btn {
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .btn.primary {
    background: var(--accent-primary);
    color: #fff;
    box-shadow: 0 2px 8px rgba(var(--accent-rgb), 0.3);
  }
  .btn.primary:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  /* BODY */
  .editor-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: transparent; /* Let glass from container show */
    direction: ltr; /* Reset text direction */
  }

  .meta-section {
    padding: 0.75rem 1.25rem;
    background: rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center; /* Centered */
    align-items: center;
    border-bottom: 1px solid var(--border-divider, rgba(255, 255, 255, 0.05));
  }

  /* Segmented Control for Modes */
  .segmented-control {
    background: rgba(0, 0, 0, 0.2);
    padding: 3px;
    border-radius: 10px;
    display: flex;
    gap: 2px;
    width: 100%;
  }

  .segment {
    flex: 1;
    padding: 6px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-secondary);
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .segment:hover {
    color: var(--text-primary);
  }

  .segment.active {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    font-weight: 600;
  }

  /* NAV PILLS */
  .nav-pills {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: transparent;
    border-bottom: 1px solid var(--border-divider, rgba(255, 255, 255, 0.05));
    overflow-x: auto;

    /* Hide scrollbar */
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .nav-pills::-webkit-scrollbar {
    display: none;
  }

  .pill {
    padding: 8px 16px;
    border-radius: 12px; /* Slightly squarer than round pills */
    border: none;
    background: rgba(255, 255, 255, 0.05);
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 600;
    white-space: nowrap;
    transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    flex-shrink: 0;
  }
  .pill:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    transform: translateY(-1px);
  }
  .pill.active {
    background: var(--accent-primary);
    color: #ffffff; /* Always white on accent */
    box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3);
  }

  /* SCROLL CONTENT */
  .scroll-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.25rem;
  }

  .group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .section-title {
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    margin: 1.25rem 0 0.75rem 0;
  }
  .section-title:first-child {
    margin-top: 0;
  }

  .divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.05);
    margin: 1.25rem 0;
    width: 100%;
  }

  /* ROWS */
  .control-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
  }
  .slider-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
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
    font-size: 0.8rem;
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
    padding: 0.3rem 1.8rem 0.3rem 0.6rem;
    border-radius: 6px;
    border: 1px solid var(--border-input, rgba(255, 255, 255, 0.1));
    background: var(--bg-input, rgba(0, 0, 0, 0.2));
    color: var(--text-primary);
    font-size: 0.85rem;
    text-align: left;
    cursor: pointer;
    min-width: 100px;
  }

  .modern-select:focus {
    outline: none;
    border-color: var(--accent-primary);
  }

  .select-chevron {
    position: absolute;
    right: 0.4rem;
    pointer-events: none;
    display: flex;
    align-items: center;
    color: var(--text-secondary);
    font-size: 1rem;
  }

  .slider {
    appearance: none;
    -webkit-appearance: none;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.1);
    background-image: linear-gradient(
      var(--accent-primary),
      var(--accent-primary)
    );
    background-repeat: no-repeat;
    outline: none;
    cursor: pointer;
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transition: transform 0.1s;
  }
  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  /* Color Picker override within this container */
  :global(.color-picker-trigger) {
    height: 28px !important;
    width: 48px !important;
  }
</style>
