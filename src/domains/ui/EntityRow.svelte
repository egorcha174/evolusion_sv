<script lang="ts">
  import { t } from "svelte-i18n";
  import type { HAEntity } from "$lib/types";
  import { extractDomain, isToggleable as checkToggleable } from "$lib/utils";
  import { toggleEntity } from "../ha/store";
  import { getIcon } from "$lib/icons";
  import "iconify-icon";

  let {
    entity,
    onAddToTab,
  }: {
    entity: HAEntity;
    onAddToTab?: () => void;
  } = $props();

  let isToggling = $state(false);
  let error = $state<string | null>(null);

  async function handleToggle(e: MouseEvent) {
    e.stopPropagation();
    try {
      isToggling = true;
      error = null;
      await toggleEntity(entity.entity_id);
    } catch (err: any) {
      console.error("Toggle error:", err);
      error = err.message || "Toggle failed";
    } finally {
      isToggling = false;
    }
  }

  let domain = $derived(extractDomain(entity.entity_id));
  let displayName = $derived(
    entity.attributes.friendly_name || entity.entity_id,
  );
  let isToggleable = $derived(checkToggleable(domain));
  let icon = $derived(getIcon(domain));

  let translatedState = $derived.by(() => {
    if (entity.state === "on") return $t("common.on");
    if (entity.state === "off") return $t("common.off");
    if (entity.state === "unavailable")
      return $t("entities.status.unavailable");
    if (entity.state === "unknown") return $t("entities.status.unknown");
    return entity.state;
  });

  let isOn = $derived(
    entity.state === "on" ||
      entity.state === "open" ||
      entity.state === "unlocked",
  );
</script>

<div class="entity-row" class:active={isOn} data-domain={domain}>
  <div class="entity-main">
    <div class="icon-container" class:active={isOn}>
      <iconify-icon {icon} width="24" height="24"></iconify-icon>
    </div>

    <div class="entity-info">
      <div class="entity-name" title={displayName}>{displayName}</div>
      <div class="entity-id-row">
        <span class="entity-id">{entity.entity_id}</span>
        {#if error}
          <span class="error-text"> • {error}</span>
        {/if}
      </div>
    </div>
  </div>

  <div class="entity-actions">
    <div class="state-badge-container">
      <span class="state-badge" class:on={isOn}>
        {translatedState}
        {#if entity.attributes.unit_of_measurement}
          <span class="unit">{entity.attributes.unit_of_measurement}</span>
        {/if}
      </span>
    </div>

    <div class="actions-group">
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
            width="18"
            height="18"
          ></iconify-icon>
          <span class="btn-text">{$t("common.add", { default: "Add" })}</span>
        </button>
      {/if}

      {#if isToggleable}
        <button
          onclick={handleToggle}
          disabled={isToggling}
          class="toggle-switch"
          class:is-on={isOn}
          aria-label="Toggle"
        >
          <div class="switch-handle">
            {#if isToggling}
              <div class="spinner"></div>
            {/if}
          </div>
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .entity-row {
    display: grid;
    grid-template-columns: 42px 1fr auto auto;
    align-items: center;
    padding: 12px 16px;
    gap: 16px;
    min-height: 72px;
    transition: all 0.2s ease;
    border-bottom: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
    background: transparent;
    width: 100%;
    box-sizing: border-box;
  }

  .entity-row:hover {
    background: var(--glass-surface-hover, rgba(255, 255, 255, 0.05));
    transform: none; /* Scale causes alignment jitters in grid */
    z-index: 2;
    box-shadow: var(--glass-shadow-sm);
  }

  .entity-row:last-child {
    border-bottom: none;
  }

  .entity-main {
    display: contents; /* Grid columns handle placement */
  }

  .icon-container {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--glass-surface, rgba(255, 255, 255, 0.1));
    color: var(--text-primary, #ffffff);
    transition: all 0.3s ease;
    flex-shrink: 0;
    border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  }

  .icon-container.active {
    background: rgba(var(--accent-rgb), 0.15);
    color: var(--accent-primary);
  }

  .entity-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
  }

  .entity-name {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-primary, #ffffff);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .entity-id-row {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .entity-id {
    font-size: 0.8rem;
    color: var(--text-primary); /* Use primary color for better contrast */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0.6; /* Balanced for readability without overcrowding */
  }

  .error-text {
    font-size: 0.75rem;
    color: var(--accent-error);
    margin-left: 4px;
    white-space: nowrap;
  }

  .entity-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
  }

  .actions-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .state-badge {
    padding: 6px 12px;
    background: var(--glass-surface, rgba(255, 255, 255, 0.1));
    border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-primary, #ffffff);
    text-transform: capitalize;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    letter-spacing: 0.02em;
  }

  .state-badge-container {
    display: flex;
    justify-content: center;
    min-width: 80px;
  }

  .state-badge.on {
    color: var(--accent-primary);
    background: rgba(var(--accent-rgb), 0.1);
  }

  .unit {
    font-size: 0.75rem;
    color: var(--text-primary);
    opacity: 0.7;
  }

  /* Add to Dashboard Button */
  .add-to-dashboard-btn {
    background: var(--accent-primary);
    color: #ffffff; /* Keep white text as primary choice */
    padding: 0 14px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    opacity: 0.95;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  /* If theme is light, ensure we don't have white-on-white 
     This is a safety net for themes where accent primary is white/light */
  @media (prefers-color-scheme: light) {
    .add-to-dashboard-btn {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  /* Force dark icons/text if the background is effectively white */
  :global(.theme-light) .add-to-dashboard-btn,
  :global(.theme-purple) .add-to-dashboard-btn {
    /* We can't detect color easily, but we can assume these specific themes might need more contrast */
    border-color: rgba(0, 0, 0, 0.2);
  }

  .add-to-dashboard-btn:hover {
    opacity: 1;
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 6px 16px rgba(var(--accent-rgb, 0, 0, 0), 0.3);
    filter: brightness(1.05);
  }

  .btn-text {
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.01em;
  }

  .add-to-dashboard-btn iconify-icon {
    display: flex;
  }

  /* Modern Switch Styles */
  .toggle-switch {
    width: 44px;
    height: 24px;
    border-radius: 12px;
    background: var(--bg-input, #e0e0e0);
    border: none;
    position: relative;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0;
    flex-shrink: 0;
  }

  .toggle-switch.is-on {
    background: var(--accent-primary);
  }

  .switch-handle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toggle-switch.is-on .switch-handle {
    transform: translateX(20px);
  }

  .toggle-switch:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid var(--accent-primary);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
