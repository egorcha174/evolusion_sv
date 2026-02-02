<script lang="ts">
    import { onMount } from "svelte";

    interface Props {
        title: string;
        message: string;
        confirmLabel?: string;
        cancelLabel?: string;
        isDestructive?: boolean;
        onConfirm: () => void;
        onCancel: () => void;
    }

    let {
        title,
        message,
        confirmLabel = "Confirm",
        cancelLabel = "Cancel",
        isDestructive = false,
        onConfirm,
        onCancel,
    }: Props = $props();

    let confirmBtn: HTMLButtonElement;

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            onCancel();
        }
    }

    onMount(() => {
        // Automatically focus the cancel button for safety on destructive actions
        // or focus the container. Choosing confirm button for now for standard DX,
        // but can switch to cancel if safety is priority.
        confirmBtn?.focus();
    });
</script>

<div class="modal-backdrop" onclick={onCancel} role="presentation">
    <div
        class="modal-container"
        onclick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
    >
        <header>
            <h3>{title}</h3>
            <button class="close-btn" onclick={onCancel} aria-label="Close">
                <iconify-icon icon="mdi:close" width="20"></iconify-icon>
            </button>
        </header>

        <div class="content">
            <p>{message}</p>
        </div>

        <footer>
            <button class="btn-cancel" onclick={onCancel}>{cancelLabel}</button>
            <button
                bind:this={confirmBtn}
                class="btn-confirm"
                class:destructive={isDestructive}
                onclick={onConfirm}
            >
                {confirmLabel}
            </button>
        </footer>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
    }

    .modal-container {
        background: var(--bg-panel, #1e1e1e);
        border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
        border-radius: 12px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid
            var(--border-divider, rgba(255, 255, 255, 0.05));
        background: var(--bg-header, #252525);
    }

    h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary, #fff);
    }

    .close-btn {
        background: transparent;
        border: none;
        color: var(--text-secondary, #aaa);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .close-btn:hover {
        background: var(--bg-chip, rgba(255, 255, 255, 0.1));
        color: var(--text-primary, #fff);
    }

    .content {
        padding: 1.5rem 1.25rem;
    }

    p {
        margin: 0;
        color: var(--text-secondary, #ccc);
        font-size: 1rem;
        line-height: 1.5;
    }

    footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        background: var(--bg-secondary, #222);
        border-top: 1px solid var(--border-divider, rgba(255, 255, 255, 0.05));
    }

    button {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-cancel {
        background: transparent;
        border: 1px solid var(--border-primary, #444);
        color: var(--text-primary, #fff);
    }

    .btn-cancel:hover {
        background: var(--bg-chip, rgba(255, 255, 255, 0.05));
    }

    .btn-confirm {
        background: var(--accent-primary, #0099ff);
        border: none;
        color: white;
    }

    .btn-confirm:hover {
        background: var(--accent-primary-hover, #0077cc);
    }

    .btn-confirm.destructive {
        background: var(--accent-error, #f44336);
    }

    .btn-confirm.destructive:hover {
        background: var(--accent-error-hover, #d32f2f);
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes scaleIn {
        from {
            transform: scale(0.95);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
</style>
