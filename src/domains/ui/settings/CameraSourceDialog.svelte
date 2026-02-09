<script lang="ts">
    /**
     * Camera Source Configuration Dialog
     *
     * Wrapper for CameraSourceSettings in a modal dialog.
     */
    import { t } from "svelte-i18n";
    import type { CameraSourceConfig } from "$lib/types";
    import "iconify-icon";
    import CameraSourceSettings from "./CameraSourceSettings.svelte";

    let {
        currentConfig = undefined,
        onSave,
        onClose,
    } = $props<{
        currentConfig?: CameraSourceConfig;
        onSave: (config: CameraSourceConfig) => void;
        onClose: () => void;
    }>();

    // Initialize config state
    let config = $state<CameraSourceConfig>(
        currentConfig ? { ...currentConfig } : { sourceType: "go2rtc" },
    );

    function handleSave() {
        onSave(config);
    }

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }
</script>

<div class="backdrop" onclick={handleBackdropClick} role="presentation">
    <div class="dialog" role="dialog" aria-labelledby="dialog-title">
        <header class="dialog-header">
            <h2 id="dialog-title">
                {$t("camera.configure_source", {
                    default: "Configure Camera Source",
                })}
            </h2>
            <button
                class="close-btn"
                onclick={onClose}
                aria-label="Close dialog"
            >
                <iconify-icon icon="mdi:close" width="24"></iconify-icon>
            </button>
        </header>

        <div class="dialog-content">
            <CameraSourceSettings bind:config />
        </div>

        <footer class="dialog-footer">
            <button class="btn btn-secondary" onclick={onClose}>
                {$t("common.cancel", { default: "Cancel" })}
            </button>
            <button class="btn btn-primary" onclick={handleSave}>
                {$t("common.save", { default: "Save" })}
            </button>
        </footer>
    </div>
</div>

<style>
    .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        backdrop-filter: blur(4px);
    }

    .dialog {
        background: var(--bg-panel, #fff);
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-divider);
    }

    .dialog-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .close-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--text-secondary);
        padding: 4px;
        border-radius: 50%;
        transition: all 0.2s;
    }

    .close-btn:hover {
        background: var(--bg-card-hover);
        color: var(--text-primary);
    }

    .dialog-content {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
    }

    .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--border-divider);
    }

    .btn {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 500;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
    }

    .btn-primary {
        background: var(--accent-primary);
        color: white;
    }

    .btn-primary:hover {
        background: var(--accent-primary-hover, #2563eb);
    }

    .btn-secondary {
        background: var(--bg-chip);
        color: var(--text-primary);
        border: 1px solid var(--border-primary);
    }

    .btn-secondary:hover {
        background: var(--bg-chip-active);
    }
</style>
