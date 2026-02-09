<script lang="ts">
    import { t } from "svelte-i18n";
    import "iconify-icon";
</script>

<div class="empty-card-widget">
    <div class="content">
        <iconify-icon icon="mdi:plus-circle-outline" width="32"></iconify-icon>
        <span>{$t("dashboard.selectDevice", { default: "Select Device" })}</span
        >
    </div>
</div>

<style>
    .empty-card-widget {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-card); /* or lighter/transparent? */
        border: 2px dashed var(--border-divider);
        border-radius: var(--radius-lg, 16px);
        box-sizing: border-box;
        opacity: 0.7;
        transition: opacity 0.2s;
    }

    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-secondary);
    }

    span {
        font-size: 0.8rem;
        font-weight: 500;
    }

    .empty-card-widget:hover {
        opacity: 1;
        border-color: var(--accent-primary);
        background: var(--bg-card-hover);
        color: var(--accent-primary);
    }

    .empty-card-widget:hover .content {
        color: var(--accent-primary);
    }
</style>
