<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import type { CameraConfig } from "$lib/types/camera";

    export let config: CameraConfig;

    const dispatch = createEventDispatcher();
    let imgElement: HTMLImageElement;
    let intervalId: any;
    let src = "";

    const refreshInterval = config.previewRefreshInterval ?? 1000;
    const protocol = config.go2rtcProtocol ?? "http";
    const baseUrl = `${protocol}://${config.go2rtcHost}/api/stream.mjpeg?src=${config.source}`;

    function updateSrc() {
        src = `${baseUrl}&t=${Date.now()}`;
    }

    onMount(() => {
        console.log(
            `[CameraCardPreview] Initializing MJPEG preview for ${config.name}`,
        );
        updateSrc();

        intervalId = setInterval(() => {
            updateSrc();
        }, refreshInterval);

        return () => {
            if (intervalId) clearInterval(intervalId);
            console.log(`[CameraCardPreview] Cleanup ${config.name}`);
        };
    });

    function handleLoad() {
        dispatch("ready");
    }

    function handleError() {
        dispatch(
            "error",
            new Error(`Failed to load MJPEG stream for ${config.name}`),
        );
    }
</script>

<img
    {src}
    alt={config.name}
    class="preview-image"
    style:object-fit={config.previewObjectFit || "cover"}
    on:load={handleLoad}
    on:error={handleError}
/>

<style>
    .preview-image {
        width: 100%;
        height: 100%;
        display: block;
    }
</style>
