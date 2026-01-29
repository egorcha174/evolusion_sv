<script lang="ts">
    import { t } from "svelte-i18n";
    import { tabs } from "../app/tabsStore";
    import { dashboardStore } from "../app/dashboardStore";
    import { fade, scale } from "svelte/transition";
    import "iconify-icon";

    let {
        entityId,
        entityName,
        onclose,
    }: {
        entityId: string;
        entityName: string;
        onclose: () => void;
    } = $props();

    function addToTab(tabId: string) {
        dashboardStore.addCard(tabId, entityId);
        onclose();
    }
</script>

<div
    class="dialog-overlay"
    in:fade={{ duration: 200 }}
    onclick={onclose}
    onkeydown={(e) => (e.key === "Escape" || e.key === " ") && onclose()}
    role="presentation"
>
    <div
        class="dialog-content"
        in:scale={{ duration: 300, start: 0.95 }}
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
    >
        <div class="dialog-header">
            <h3>
                {$t("entities.addToTab.title", { default: "Add to Dashboard" })}
            </h3>
            <button
                class="close-btn"
                onclick={onclose}
                aria-label="Close dialog"
            >
                <iconify-icon icon="mdi:close" width="24" height="24"
                ></iconify-icon>
            </button>
        </div>

        <div class="entity-preview">
            <span class="label"
                >{$t("entities.addToTab.entity", { default: "Entity:" })}</span
            >
            <span class="name">{entityName}</span>
        </div>

        <div class="tabs-list">
            <p class="instruction">
                {$t("entities.addToTab.selectTab", {
                    default: "Select a tab to add this entity to:",
                })}
            </p>
            {#each $tabs as tab}
                <button class="tab-item" onclick={() => addToTab(tab.id)}>
                    <iconify-icon
                        icon={tab.icon || "mdi:view-dashboard"}
                        width="20"
                        height="20"
                    ></iconify-icon>
                    <span>{tab.title}</span>
                </button>
            {/each}
        </div>
    </div>
</div>

<style>
    .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    }

    .dialog-content {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 20px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        color: #1d1d1f; /* Force dark text on light glass */
    }

    :global(.theme-dark) .dialog-content {
        background: rgba(0, 0, 0, 0.7);
        border-color: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    /* Glass effect if supported by theme */
    :global(.theme-glass) .dialog-content {
        background: var(--glass-surface, rgba(255, 255, 255, 0.1));
        backdrop-filter: var(--glass-blur, blur(20px));
    }

    .dialog-header {
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--border-light, rgba(0, 0, 0, 0.05));
    }

    .dialog-header h3 {
        margin: 0;
        font-size: 1.25rem;
        color: inherit;
    }

    .close-btn {
        background: transparent;
        border: none;
        color: inherit;
        opacity: 0.6;
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;
        display: flex;
        transition: all 0.2s ease;
    }

    .close-btn:hover {
        background: var(--glass-surface-hover);
        color: var(--text-primary);
    }

    .entity-preview {
        padding: 16px 20px;
        background: var(--glass-surface);
        display: flex;
        gap: 8px;
        font-size: 0.9rem;
    }

    .entity-preview .label {
        color: var(--text-muted);
    }

    .entity-preview .name {
        color: var(--accent-primary);
        font-weight: 600;
    }

    .tabs-list {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 400px;
        overflow-y: auto;
    }

    .instruction {
        margin: 0 0 10px 0;
        font-size: 0.9rem;
        color: var(--text-muted);
    }

    .tab-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        background: var(--bg-input, rgba(0, 0, 0, 0.05));
        border: 1px solid var(--border-primary, rgba(0, 0, 0, 0.05));
        border-radius: 12px;
        color: inherit;
        font-weight: 600;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .tab-item:hover {
        background: var(--accent-primary);
        color: white !important;
        transform: translateY(-2px);
        border-color: var(--accent-primary);
        box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.2);
    }

    .tab-item iconify-icon {
        color: var(--accent-primary);
        transition: color 0.2s ease;
    }

    .tab-item:hover iconify-icon {
        color: white;
    }
</style>
