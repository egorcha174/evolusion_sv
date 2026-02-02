<script lang="ts">
    /**
     * CameraFullscreenModal - Full-screen camera video overlay
     *
     * Displays camera stream in full-screen modal with close functionality.
     */
    import { onMount, onDestroy } from "svelte";
    import CameraCard from "./CameraCard.svelte";
    import { cameraStore } from "$lib/stores/camera.store.svelte";
    import { _ } from "svelte-i18n";

    interface Props {
        cameraId: string;
        go2rtcUrl?: string;
        onClose: () => void;
    }

    let {
        cameraId,
        go2rtcUrl = "http://192.168.0.98:1984",
        onClose,
    }: Props = $props();

    // Get camera from store
    let camera = $derived(cameraStore.getCameraById(cameraId));

    // Handle escape key
    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            onClose();
        }
    }

    // Handle backdrop click
    function handleBackdropClick(e: MouseEvent) {
        if ((e.target as HTMLElement).classList.contains("modal-backdrop")) {
            onClose();
        }
    }

    onMount(() => {
        document.addEventListener("keydown", handleKeydown);
        // Prevent body scroll
        document.body.style.overflow = "hidden";
    });

    onDestroy(() => {
        document.removeEventListener("keydown", handleKeydown);
        document.body.style.overflow = "";
    });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-backdrop" onclick={handleBackdropClick}>
    <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
            <h2 class="camera-title">
                <iconify-icon icon="mdi:video" width="24"></iconify-icon>
                {camera?.name ||
                    $_("camera.fullscreen.title", { default: "Camera" })}
            </h2>
            <button
                class="close-btn"
                onclick={onClose}
                title={$_("common.close", { default: "Close" })}
            >
                <iconify-icon icon="mdi:close" width="24"></iconify-icon>
            </button>
        </div>

        <!-- Video Container -->
        <div class="video-wrapper">
            {#if camera}
                <CameraCard
                    {camera}
                    {go2rtcUrl}
                    autoConnect={true}
                    showControls={true}
                />
            {:else}
                <div class="no-camera">
                    <iconify-icon icon="mdi:camera-off" width="48"
                    ></iconify-icon>
                    <span
                        >{$_("camera.notFound", {
                            default: "Camera not found",
                        })}</span
                    >
                </div>
            {/if}
        </div>

        <!-- Footer hint -->
        <div class="modal-footer">
            <span class="hint"
                >{$_("camera.fullscreen.hint", {
                    default: "Press Escape to close",
                })}</span
            >
        </div>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .modal-container {
        width: 90vw;
        max-width: 1200px;
        height: 85vh;
        display: flex;
        flex-direction: column;
        background: var(--bg-panel, #1a1a1a);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
        animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background: var(--bg-toolbar, rgba(0, 0, 0, 0.4));
        border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    }

    .camera-title {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary, #fff);
    }

    .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 10px;
        color: var(--text-secondary, #aaa);
        cursor: pointer;
        transition: all 0.2s;
    }

    .close-btn:hover {
        background: var(--color-error, #ef4444);
        color: white;
    }

    .video-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #000;
        overflow: hidden;
    }

    .video-wrapper :global(.camera-card) {
        width: 100%;
        height: 100%;
        border-radius: 0;
        background: transparent;
        border: none;
    }

    .video-wrapper :global(.video-container) {
        height: 100%;
        aspect-ratio: auto;
    }

    .video-wrapper :global(.video-stream) {
        object-fit: contain;
    }

    .video-wrapper :global(.info-bar) {
        display: none;
    }

    .no-camera {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        color: var(--text-muted, #666);
        font-size: 16px;
    }

    .modal-footer {
        padding: 12px 20px;
        text-align: center;
        background: var(--bg-toolbar, rgba(0, 0, 0, 0.4));
        border-top: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    }

    .hint {
        font-size: 13px;
        color: var(--text-muted, #666);
    }

    @media (max-width: 768px) {
        .modal-container {
            width: 100vw;
            height: 100vh;
            max-width: none;
            border-radius: 0;
        }
    }
</style>
