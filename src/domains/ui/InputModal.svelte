<script lang="ts">
    import { onMount, tick } from "svelte";

    interface Props {
        title: string;
        label?: string;
        value?: string;
        placeholder?: string;
        confirmLabel?: string;
        cancelLabel?: string;
        onConfirm: (value: string) => void;
        onCancel: () => void;
    }

    let {
        title,
        label = "",
        value = "",
        placeholder = "",
        confirmLabel = "OK",
        cancelLabel = "Cancel",
        onConfirm,
        onCancel,
    }: Props = $props();

    let inputEl: HTMLInputElement;
    let inputValue = $state(value);

    function handleSubmit() {
        if (inputValue.trim()) {
            onConfirm(inputValue.trim());
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            handleSubmit();
        } else if (e.key === "Escape") {
            onCancel();
        }
    }

    onMount(async () => {
        await tick();
        inputEl?.focus();
        inputEl?.select();
    });
</script>

<div class="modal-backdrop" onclick={onCancel}>
    <div class="modal-container" onclick={(e) => e.stopPropagation()}>
        <header>
            <h3>{title}</h3>
            <button class="close-btn" onclick={onCancel}>
                <iconify-icon icon="mdi:close" width="20"></iconify-icon>
            </button>
        </header>

        <div class="content">
            {#if label}
                <label for="modal-input">{label}</label>
            {/if}
            <input
                bind:this={inputEl}
                id="modal-input"
                type="text"
                bind:value={inputValue}
                {placeholder}
                onkeydown={handleKeydown}
            />
        </div>

        <footer>
            <button class="btn-cancel" onclick={onCancel}>{cancelLabel}</button>
            <button
                class="btn-confirm"
                onclick={handleSubmit}
                disabled={!inputValue.trim()}
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

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: var(--text-secondary, #aaa);
    }

    input {
        width: 100%;
        padding: 0.75rem;
        background: var(--bg-input, #111);
        border: 1px solid var(--border-input, #333);
        border-radius: 6px;
        color: var(--text-primary, #fff);
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s;
    }

    input:focus {
        border-color: var(--accent-primary, #0099ff);
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

    .btn-confirm:hover:not(:disabled) {
        background: var(--accent-primary-hover, #0077cc);
    }

    .btn-confirm:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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
