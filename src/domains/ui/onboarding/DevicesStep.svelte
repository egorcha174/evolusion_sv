<script lang="ts">
    import { t } from "svelte-i18n";
    import { onboardingStore } from "../../app/onboardingStore";
    import { haStore } from "../../ha/store";
    import { getIcon } from "$lib/icons";
    import { extractDomain } from "$lib/utils";
    import "iconify-icon";

    let selectedEntities = $state<Set<string>>(new Set());

    // Get popular domains to show first
    const priorityDomains = ["light", "switch", "sensor", "climate", "lock"];

    let sortedEntities = $derived(
        Array.from($haStore.entities.values())
            .filter(
                (e) =>
                    !e.entity_id.startsWith("automation.") &&
                    !e.entity_id.startsWith("script."),
            )
            .sort((a, b) => {
                const domainA = extractDomain(a.entity_id);
                const domainB = extractDomain(b.entity_id);
                const priorityA = priorityDomains.indexOf(domainA);
                const priorityB = priorityDomains.indexOf(domainB);

                if (priorityA !== priorityB) {
                    if (priorityA === -1) return 1;
                    if (priorityB === -1) return -1;
                    return priorityA - priorityB;
                }

                return (
                    a.attributes.friendly_name || a.entity_id
                ).localeCompare(b.attributes.friendly_name || b.entity_id);
            })
            .slice(0, 24),
    );

    function toggleEntity(entityId: string) {
        const newSet = new Set(selectedEntities);
        if (newSet.has(entityId)) {
            newSet.delete(entityId);
        } else {
            newSet.add(entityId);
        }
        selectedEntities = newSet;
    }

    function handleContinue() {
        // TODO: Can save selected entities to initial dashboard config
        onboardingStore.nextStep();
    }

    function handleSkip() {
        onboardingStore.nextStep();
    }

    function handleBack() {
        onboardingStore.prevStep();
    }
</script>

<div class="devices-step">
    <div class="header">
        <iconify-icon icon="mdi:devices" width="36" class="icon"></iconify-icon>
        <h2>{$t("onboarding.devices.title")}</h2>
        <p class="subtitle">{$t("onboarding.devices.subtitle")}</p>
    </div>

    {#if $haStore.isConnected && sortedEntities.length > 0}
        <div class="entities-grid">
            {#each sortedEntities as entity (entity.entity_id)}
                {@const domain = extractDomain(entity.entity_id)}
                {@const icon = getIcon(domain)}
                {@const isSelected = selectedEntities.has(entity.entity_id)}

                <button
                    class="entity-card"
                    class:selected={isSelected}
                    onclick={() => toggleEntity(entity.entity_id)}
                >
                    <div class="entity-icon">
                        <iconify-icon {icon} width="24"></iconify-icon>
                    </div>
                    <span class="entity-name">
                        {entity.attributes.friendly_name || entity.entity_id}
                    </span>
                    {#if isSelected}
                        <div class="check-badge">
                            <iconify-icon icon="mdi:check" width="14"
                            ></iconify-icon>
                        </div>
                    {/if}
                </button>
            {/each}
        </div>

        <p class="selection-count">
            {selectedEntities.size}
            {$t("onboarding.devices.selected")}
        </p>
    {:else if $haStore.isLoading}
        <div class="loading">
            <iconify-icon icon="mdi:loading" width="32" class="spin"
            ></iconify-icon>
            <p>{$t("common.loading")}</p>
        </div>
    {:else}
        <div class="empty-state">
            <iconify-icon icon="mdi:connection" width="48"></iconify-icon>
            <p>{$t("onboarding.devices.noDevices")}</p>
        </div>
    {/if}

    <div class="actions">
        <button class="btn secondary" onclick={handleBack}>
            <iconify-icon icon="mdi:arrow-left" width="18"></iconify-icon>
            {$t("common.cancel")}
        </button>

        <div class="right-actions">
            <button class="btn text" onclick={handleSkip}>
                {$t("onboarding.devices.skip")}
            </button>

            <button class="btn primary" onclick={handleContinue}>
                {$t("onboarding.continue")}
                <iconify-icon icon="mdi:arrow-right" width="18"></iconify-icon>
            </button>
        </div>
    </div>
</div>

<style>
    .devices-step {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 2rem;
        width: 100%;
        max-width: 640px;
        margin: 0 auto;
        height: 100%;
        overflow: hidden;
    }

    .header {
        text-align: center;
        flex-shrink: 0;
    }

    .icon {
        color: var(--accent-primary);
    }

    h2 {
        margin: 0.5rem 0 0 0;
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .subtitle {
        margin: 0.5rem 0 0 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .entities-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 0.75rem;
        overflow-y: auto;
        flex: 1;
        padding: 0.25rem;
    }

    .entity-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 0.75rem;
        background: var(--glass-surface, rgba(255, 255, 255, 0.05));
        border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
    }

    .entity-card:hover {
        background: var(--glass-surface-hover);
        border-color: var(--accent-primary);
    }

    .entity-card.selected {
        background: rgba(var(--accent-rgb, 33, 150, 243), 0.15);
        border-color: var(--accent-primary);
    }

    .entity-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-chip, rgba(0, 0, 0, 0.1));
        border-radius: 10px;
        color: var(--text-secondary);
    }

    .entity-card.selected .entity-icon {
        background: var(--accent-primary);
        color: white;
    }

    .entity-name {
        font-size: 0.8rem;
        color: var(--text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
    }

    .check-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 20px;
        height: 20px;
        background: var(--accent-success);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .selection-count {
        text-align: center;
        color: var(--text-muted);
        font-size: 0.85rem;
        margin: 0;
        flex-shrink: 0;
    }

    .loading,
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 3rem;
        color: var(--text-muted);
        flex: 1;
    }

    .actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-shrink: 0;
        padding-top: 1rem;
        border-top: 1px solid var(--border-divider);
    }

    .right-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        border-radius: 10px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
    }

    .btn.primary {
        background: var(--accent-primary);
        color: white;
    }

    .btn.secondary {
        background: var(--glass-surface);
        color: var(--text-primary);
        border: 1px solid var(--border-primary);
    }

    .btn.text {
        background: transparent;
        color: var(--text-secondary);
        padding: 0.5rem 1rem;
    }

    .spin {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
