<script lang="ts">
    import { t } from "svelte-i18n";
    import { demoStore } from "../app/demoStore";
    import "iconify-icon";

    function exitDemo() {
        demoStore.disable();
        window.location.reload();
    }
</script>

{#if $demoStore.isActive}
    <div class="demo-badge">
        <iconify-icon icon="mdi:flask-outline" width="16"></iconify-icon>
        <span>{$t("demo.badge")}</span>
        <button class="exit-btn" onclick={exitDemo} title={$t("demo.exit")}>
            <iconify-icon icon="mdi:close" width="14"></iconify-icon>
        </button>
    </div>
{/if}

<style>
    .demo-badge {
        position: fixed;
        bottom: 16px;
        left: 16px;
        z-index: 9000;

        display: flex;
        align-items: center;
        gap: 8px;

        background: linear-gradient(135deg, #ff6b35, #f72585);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;

        font-size: 0.85rem;
        font-weight: 600;

        box-shadow: 0 4px 16px rgba(247, 37, 133, 0.3);
        animation: pulse 2s ease-in-out infinite;
    }

    .exit-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 50%;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white;
        transition: background 0.2s;
        margin-left: 4px;
    }

    .exit-btn:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    @keyframes pulse {
        0%,
        100% {
            box-shadow: 0 4px 16px rgba(247, 37, 133, 0.3);
        }
        50% {
            box-shadow: 0 4px 24px rgba(247, 37, 133, 0.5);
        }
    }

    :global(body.rtl) .demo-badge {
        left: auto;
        right: 16px;
    }
</style>
