<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import type { CameraConfig } from "$lib/types/camera";
    import CameraCardPreview from "./CameraCardPreview.svelte";
    import CameraCardLive from "./CameraCardLive.svelte";

    export let config: CameraConfig;
    export let forceMode: "preview" | "live" | null = null;
    export let isVisible: boolean = true;

    let isLoading = false;
    let isConnected = false;
    let error: string | null = null;

    $: currentMode = forceMode || config.mode;
    $: showSpinner = (config.showLoadingSpinner ?? true) && isLoading;

    onMount(() => {
        if (isVisible) {
            isLoading = true;
            console.log(
                `[CameraCard] Mounting camera "${config.name}" in mode: ${currentMode}`,
            );
        }
    });

    onDestroy(() => {
        console.log(`[CameraCard] Unmounting camera "${config.name}"`);
    });

    function handleError(e: CustomEvent<Error>) {
        error = e.detail.message;
        isLoading = false;
        isConnected = false;
        if (config.onError) config.onError(e.detail);
        console.error(
            `[CameraCard] Error in camera "${config.name}":`,
            e.detail,
        );
    }

    function handleReady() {
        isLoading = false;
        isConnected = true;
        error = null;
        if (config.onReady) config.onReady();
        console.log(`[CameraCard] Camera "${config.name}" is ready`);
    }

    function handleRetry() {
        error = null;
        isLoading = true;
        // Trigger re-mount of child component by briefly toggling mode or key (simplified here by state reset)
        // Ideally child components watch props or we use a key block.
        // For now, let's just clear error and let reactivity handle if possible,
        // or arguably we might need to force re-render.
        // Using a key block in markup is efficient.
    }
</script>

<div class="camera-card" style:--aspect-ratio={config.aspectRatio || "16/9"}>
    {#if !isVisible}
        <div class="placeholder">
            <span>Camera paused</span>
        </div>
    {:else}
        <div class="content">
            {#if showSpinner}
                <div class="spinner-overlay">
                    <div class="spinner"></div>
                    <span>Connecting...</span>
                </div>
            {/if}

            {#if error}
                <div class="error-overlay">
                    <span>{error}</span>
                    <button class="retry-btn" on:click={handleRetry}
                        >Retry</button
                    >
                </div>
            {:else}
                {#key currentMode}
                    <!-- Key block ensures component remounts cleanly on mode switch -->
                    {#if currentMode === "preview"}
                        <CameraCardPreview
                            {config}
                            on:ready={handleReady}
                            on:error={handleError}
                        />
                    {:else if currentMode === "live"}
                        <CameraCardLive
                            {config}
                            on:ready={handleReady}
                            on:error={handleError}
                        />
                    {/if}
                {/key}
            {/if}

            {#if config.showTitle}
                <div class="camera-title">{config.name}</div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .camera-card {
        position: relative;
        width: 100%;
        aspect-ratio: var(--aspect-ratio);
        background: var(--color-surface, #202124);
        border-radius: var(--radius-lg, 12px);
        overflow: hidden;
    }

    .content {
        width: 100%;
        height: 100%;
        position: relative;
    }

    .placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--color-text-secondary, #9aa0a6);
    }

    .spinner-overlay,
    .error-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10;
        color: white;
        gap: 8px;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(var(--color-primary-rgb, 33, 150, 243), 0.2);
        border-top-color: var(--color-primary, #2196f3);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .retry-btn {
        padding: 8px 16px;
        background: var(--color-primary, #2196f3);
        border: none;
        border-radius: 4px;
        color: white;
        cursor: pointer;
    }

    .camera-title {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 8px 12px;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
        color: white;
        font-size: 14px;
        pointer-events: none;
    }
</style>
