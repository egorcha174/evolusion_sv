<script lang="ts">
  import { t } from "svelte-i18n";
  import type { HAEntity, CardTemplate, CardElement } from "$lib/types";
  import { toggleEntity } from "../ha/store";
  import { extractDomain } from "$lib/utils";
  import { getIcon } from "$lib/icons";
  import { lazyLoad } from "$lib/actions";
  import { getTemplateCssVariables } from "./editor/templates/style";

  let {
    entity,
    template,
    onAddToTab,
  }: {
    entity: HAEntity;
    template?: CardTemplate;
    onAddToTab?: () => void;
  } = $props();

  let isToggling = $state(false);
  let error = $state<string | null>(null);
  let isLoaded = $state(false);

  async function handleToggle() {
    try {
      isToggling = true;
      error = null;
      await toggleEntity(entity.entity_id);
    } catch (err: any) {
      error = err.message || "Failed to toggle";
    } finally {
      isToggling = false;
    }
  }

  function handleEnter() {
    isLoaded = true;
  }

  let domain = $derived(extractDomain(entity.entity_id));
  let displayName = $derived(
    entity.attributes.friendly_name || entity.entity_id,
  );
  let isOn = $derived(
    entity.state === "on" ||
      entity.state === "open" ||
      entity.state === "unlocked",
  );
  let isToggleable = $derived(
    ["light", "switch", "cover", "lock", "input_boolean", "script"].includes(
      domain,
    ),
  );

  let icon = $derived(getIcon(domain));

  let translatedState = $derived.by(() => {
    if (entity.state === "on") return $t("common.on");
    if (entity.state === "off") return $t("common.off");
    if (entity.state === "unavailable")
      return $t("entities.status.unavailable");
    if (entity.state === "unknown") return $t("entities.status.unknown");
    return entity.state;
  });

  // Calculate overridden styles if template exists
  let customStyle = $derived(
    template ? getTemplateCssVariables(template.style) : "",
  );

  // Detect mode: Visual (Elements) or Legacy (Flex)
  let isVisualMode = $derived(
    template && template.elements && template.elements.length > 0,
  );

  // Helper for elements style
  function getElementStyle(el: CardElement): string {
    const s = el.style;
    const parts = [
      `left: ${el.x}%`,
      `top: ${el.y}%`,
      `color: ${s.color || "inherit"}`,
      `font-size: ${s.fontSize ? s.fontSize + "px" : "inherit"}`,
      `font-weight: ${s.fontWeight || "inherit"}`,
      `text-align: ${s.textAlign || "left"}`,
      `opacity: ${s.opacity ?? 1}`,
      `z-index: ${s.zIndex ?? 1}`,
    ];

    if (el.w) parts.push(`width: ${el.w}%`);
    if (el.h) parts.push(`height: ${el.h}%`);
    if (s.backgroundColor) parts.push(`background-color: ${s.backgroundColor}`);
    if (s.borderRadius) parts.push(`border-radius: ${s.borderRadius}px`);

    return parts.join(";");
  }
</script>

<div
  class="device-card"
  class:active={isOn}
  class:visual-mode={isVisualMode}
  data-domain={domain}
  use:lazyLoad
  onenter={handleEnter}
  role="button"
  tabindex="0"
  onclick={isToggleable ? handleToggle : undefined}
  onkeydown={(e) =>
    isToggleable && (e.key === "Enter" || e.key === " ") && handleToggle()}
  style={customStyle}
>
  {#if !isLoaded}
    <div class="skeleton"></div>
  {:else}
    {#if isVisualMode && template}
      <!-- Visual Mode: Render Elements -->
      {#each template.elements as el (el.id)}
        <div class="card-element type-{el.type}" style={getElementStyle(el)}>
          {#if el.type === "icon"}
            <iconify-icon {icon} width="100%" height="100%"></iconify-icon>
          {:else if el.type === "name"}
            {displayName}
          {:else if el.type === "state"}
            {translatedState}
          {:else if el.type === "label"}
            {el.label || "Text"}
          {:else if el.type === "shape"}
            <!-- Shape is just a div with background, handled by style -->
          {/if}
        </div>
      {/each}
    {:else}
      <!-- Legacy Mode: Fixed Flex Layout -->
      <div class="card-header">
        <div class="icon">
          <iconify-icon {icon} width="24" height="24"></iconify-icon>
        </div>
        <div class="device-name" title={displayName}>{displayName}</div>
      </div>

      <div class="card-body">
        <div class="state-container">
          <span class="device-value">{translatedState}</span>
          {#if entity.attributes.unit_of_measurement}
            <span class="device-unit"
              >{entity.attributes.unit_of_measurement}</span
            >
          {/if}
        </div>

        {#if entity.attributes.brightness !== undefined}
          <div class="attribute">
            {Math.round((entity.attributes.brightness / 255) * 100)}%
          </div>
        {/if}
      </div>
    {/if}

    {#if error}
      <div class="error">{error}</div>
    {/if}

    {#if onAddToTab}
      <button
        class="add-to-dashboard-btn"
        onclick={(e) => {
          e.stopPropagation();
          onAddToTab?.();
        }}
        title={$t("entities.addToTab.button", { default: "Add to Dashboard" })}
      >
        <iconify-icon
          icon="mdi:view-dashboard-plus-outline"
          width="16"
          height="16"
        ></iconify-icon>
        <span class="btn-text">{$t("common.add", { default: "Add" })}</span>
      </button>
    {/if}
  {/if}
</div>

<style>
  .device-card {
    /* --- Glassmorphism Base (Phase 1) --- */
    background: var(
      --card-background,
      var(--glass-surface, rgba(255, 255, 255, 0.6))
    );
    backdrop-filter: var(--glass-blur, blur(12px));
    -webkit-backdrop-filter: var(--glass-blur, blur(12px));
    border: 1px solid
      var(--card-border-color, var(--glass-border, rgba(255, 255, 255, 0.2)));
    box-shadow: var(--shadow-card, 0 4px 12px rgba(0, 0, 0, 0.05));

    border-radius: var(--card-border-radius, 20px);
    padding: var(--card-padding, 16px);

    /* Layout */
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    width: 100%;
    min-height: 0;
    position: relative;
    overflow: hidden;

    /* Interaction */
    cursor: pointer;
    transition: all 0.4s var(--spring-bounce, cubic-bezier(0.34, 1.56, 0.64, 1));
    z-index: var(--z-card, 1);
  }

  /* Hover Effect: Lift & Brighten */
  .device-card:hover {
    transform: translateY(-6px) scale(1.03);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    background: var(--glass-surface-hover, rgba(255, 255, 255, 0.8));
    border-color: var(--accent-primary, #007aff);
    z-index: 10;
  }

  /* Active State (ON) */
  .device-card.active {
    background: var(--card-background-on, rgba(255, 255, 255, 0.9));
    border-color: var(--card-border-color-on, var(--accent-primary, #007aff));
    box-shadow: 0 8px 24px -6px rgba(var(--accent-rgb, 0, 122, 255), 0.4);
  }

  /* Reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .device-card {
      transition: none;
    }
    .device-card:hover {
      transform: none;
    }
  }

  /* --- Visual Mode Styles --- */
  .device-card.visual-mode {
    display: block; /* Remove flex context */
    padding: 0; /* Padding is handled by element positioning or safe area */
  }

  .card-element {
    position: absolute;
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    pointer-events: none; /* Let clicks pass through to card */
  }

  .card-element.type-icon {
    justify-content: center;
    color: var(--status-text-color);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  .device-card.active .card-element.type-icon {
    color: var(--accent-primary);
  }

  .card-element.type-name {
    font-weight: 600;
    color: var(--name-text-color);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .card-element.type-state {
    color: var(--value-text-color);
  }

  /* --- Legacy Mode Styles --- */

  .card-header {
    display: flex;
    gap: 12px;
    align-items: center;
    min-width: 0; /* Enable flex item shrinking */
  }

  .icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--status-text-color);

    /* THEME HOOKS */
    background: var(--icon-background-color-off, rgba(0, 0, 0, 0.05));
    border-radius: var(--icon-border-radius, 50%);

    transition: all 0.4s var(--spring-bounce);
    flex-shrink: 0;
  }

  .device-card.active .icon {
    background: var(--icon-background-color-on, var(--accent-primary));
    color: var(--icon-color-on, #ffffff);
    box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3);
    transform: scale(1.1);
  }

  .device-name {
    color: var(--name-text-color, #1d1d1f);
    font-weight: 600;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    opacity: 0.9;
  }

  .device-card.active .device-name {
    color: var(--name-text-color-on, #1d1d1f);
    opacity: 1;
  }

  .card-body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    min-height: 0; /* Allow shrinking */
  }

  /* Add to Dashboard Button */
  .add-to-dashboard-btn {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: var(--accent-primary);
    color: #ffffff;
    padding: 0 10px;
    height: 30px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 5;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(0, 0, 0, 0.1);
    opacity: 0; /* Hidden by default */
    transform: translateY(10px);
    pointer-events: none;
  }

  .device-card:hover .add-to-dashboard-btn {
    opacity: 0.95;
    transform: translateY(0);
    pointer-events: auto;
  }

  .add-to-dashboard-btn:hover {
    background: var(--accent-primary) !important;
    color: #ffffff !important;
    transform: scale(1.08) !important;
    box-shadow: 0 8px 20px rgba(var(--accent-rgb, 0, 0, 0), 0.4);
    filter: brightness(1.1);
  }

  .btn-text {
    font-size: 0.75rem;
    font-weight: 700;
  }

  .add-to-dashboard-btn iconify-icon {
    display: flex;
    pointer-events: none;
  }

  .state-container {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .device-value {
    color: var(--value-text-color, #1d1d1f);
    font-size: 1.1rem;
    font-weight: 500;
    text-transform: capitalize;
  }

  .device-card.active .device-value {
    color: var(--value-text-color-on, #1d1d1f);
  }

  .device-unit {
    color: var(--unit-text-color, #1d1d1f);
    font-size: 0.85rem;
    opacity: 0.7;
  }

  .device-card.active .device-unit {
    color: var(--unit-text-color-on, #1d1d1f);
  }

  .attribute {
    font-size: 0.75rem;
    color: var(--text-muted);
    background: rgba(0, 0, 0, 0.05); /* TODO: Glass this? */
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 500;
  }

  .error {
    color: var(--accent-error);
    font-size: 0.75rem;
    margin-top: auto;
  }

  .skeleton {
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 25%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 12px;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* --- Compact Mode via Container Queries --- */

  @container (height < 90px) {
    .device-card:not(.visual-mode) {
      flex-direction: row;
      align-items: center;
      padding-left: 16px;
      padding-right: 16px;
      gap: 12px;
    }

    .device-card:not(.visual-mode) .card-header {
      flex: 1;
      margin-bottom: 0;
    }

    .device-card:not(.visual-mode) .card-body {
      flex: 0 0 auto;
      justify-content: flex-end;
    }

    .device-card:not(.visual-mode) .icon {
      width: 36px;
      height: 36px;
    }

    .device-card:not(.visual-mode) .device-value {
      font-size: 1rem;
    }

    .device-card:not(.visual-mode) .attribute {
      display: none;
    }
  }
</style>
