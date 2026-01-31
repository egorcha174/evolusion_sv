<script lang="ts">
    /**
     * Cameras Page - Camera dashboard route
     *
     * Displays CameraGrid with all configured cameras.
     */
    import CameraGrid from "../../domains/ui/widgets/CameraGrid.svelte";
    import { _ } from "svelte-i18n";
</script>

<svelte:head>
    <title>{$_("cameras.page_title", { default: "Камеры — Dashboard" })}</title>
</svelte:head>

<div class="cameras-page">
    <CameraGrid go2rtcUrl="http://192.168.0.98:1984" autoConnect={true} />
</div>

<style>
    .cameras-page {
        min-height: 100vh;
        background: var(--dashboard-background, #0a0a0a);
    }
</style>
