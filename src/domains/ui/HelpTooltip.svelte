<script lang="ts">
    let { text, link }: { text: string; link?: string } = $props();

    let showTooltip = $state(false);
</script>

<div
    class="help-tooltip-container"
    onmouseenter={() => (showTooltip = true)}
    onmouseleave={() => (showTooltip = false)}
    onfocus={() => (showTooltip = true)}
    onblur={() => (showTooltip = false)}
    role="tooltip"
>
    <button
        class="help-btn"
        type="button"
        aria-label="Help"
        onclick={(e) => e.preventDefault()}
    >
        <iconify-icon icon="mdi:help-circle-outline" width="16"></iconify-icon>
    </button>

    {#if showTooltip}
        <div class="tooltip">
            <p>{text}</p>
            {#if link}
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="docs-link"
                >
                    <iconify-icon icon="mdi:open-in-new" width="12"
                    ></iconify-icon>
                    Learn more
                </a>
            {/if}
        </div>
    {/if}
</div>

<style>
    .help-tooltip-container {
        position: relative;
        display: inline-flex;
    }

    .help-btn {
        background: none;
        border: none;
        padding: 0;
        cursor: help;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
    }

    .help-btn:hover {
        color: var(--accent-primary);
    }

    .tooltip {
        position: absolute;
        bottom: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);

        background: var(--bg-panel, rgba(30, 30, 40, 0.95));
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);

        border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
        border-radius: 10px;
        padding: 0.75rem 1rem;

        min-width: 200px;
        max-width: 280px;

        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
        z-index: 1000;

        animation: fadeIn 0.15s ease-out;
    }

    .tooltip::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: var(--bg-panel, rgba(30, 30, 40, 0.95));
    }

    .tooltip p {
        margin: 0;
        font-size: 0.85rem;
        line-height: 1.4;
        color: var(--text-primary);
    }

    .docs-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-top: 0.5rem;
        font-size: 0.8rem;
        color: var(--accent-primary);
        text-decoration: none;
        font-weight: 500;
    }

    .docs-link:hover {
        text-decoration: underline;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
</style>
