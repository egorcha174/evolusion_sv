<script lang="ts">
    /**
     * Camera Source Configuration Dialog
     *
     * Allows configuring individual camera stream sources:
     * - Go2rtc (go2rtcUrl + streamName)
     * - Direct URL (HLS/MJPEG/WebRTC)
     * - Home Assistant Entity
     */
    import { t } from "svelte-i18n";
    import type { CameraSourceConfig } from "$lib/types";
    import "iconify-icon";

    interface Props {
        currentConfig?: CameraSourceConfig;
        onSave: (config: CameraSourceConfig) => void;
        onClose: () => void;
    }

    let { currentConfig = undefined, onSave, onClose }: Props = $props();

    // Form state initialized from currentConfig prop
    let sourceType = $state<"go2rtc" | "url" | "ha_entity">(
        currentConfig?.sourceType ?? "go2rtc",
    );
    let go2rtcUrl = $state(currentConfig?.go2rtcUrl ?? "");
    let streamName = $state(currentConfig?.streamName ?? "");
    let url = $state(currentConfig?.url ?? "");
    let streamType = $state<"hls" | "mjpeg" | "webrtc">(
        currentConfig?.streamType ?? "hls",
    );
    let entityId = $state(currentConfig?.entityId ?? "");

    // Validate URL - RTSP cannot work in browsers
    const isRtspUrl = $derived(url.toLowerCase().startsWith("rtsp://"));
    const urlError = $derived(
        isRtspUrl
            ? "RTSP не поддерживается браузерами. Используйте go2rtc или MJPEG URL камеры."
            : null,
    );

    function handleSave() {
        const config: CameraSourceConfig = {
            sourceType,
        };

        if (sourceType === "go2rtc") {
            config.go2rtcUrl = go2rtcUrl;
            config.streamName = streamName;
        } else if (sourceType === "url") {
            config.url = url;
            config.streamType = streamType;
        } else if (sourceType === "ha_entity") {
            config.entityId = entityId;
        }

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
            <!-- Source Type Selection -->
            <div class="form-group">
                <label class="label-block">
                    {$t("camera.source_type", { default: "Source Type" })}
                </label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input
                            type="radio"
                            name="sourceType"
                            value="go2rtc"
                            bind:group={sourceType}
                        />
                        <span>Go2rtc</span>
                    </label>
                    <label class="radio-label">
                        <input
                            type="radio"
                            name="sourceType"
                            value="url"
                            bind:group={sourceType}
                        />
                        <span
                            >{$t("camera.direct_url", {
                                default: "Direct URL",
                            })}</span
                        >
                    </label>
                    <label class="radio-label">
                        <input
                            type="radio"
                            name="sourceType"
                            value="ha_entity"
                            bind:group={sourceType}
                        />
                        <span
                            >{$t("camera.ha_entity", {
                                default: "HA Entity",
                            })}</span
                        >
                    </label>
                </div>
            </div>

            <!-- Go2rtc Settings -->
            {#if sourceType === "go2rtc"}
                <div class="form-group">
                    <label for="go2rtc-url" class="label-block">
                        {$t("camera.go2rtc_url", { default: "Go2rtc URL" })}
                    </label>
                    <input
                        id="go2rtc-url"
                        type="text"
                        class="input"
                        bind:value={go2rtcUrl}
                        placeholder="http://192.168.0.98:1984"
                    />
                    <span class="hint">
                        {$t("camera.go2rtc_url_hint", {
                            default: "Example: http://192.168.0.98:1984",
                        })}
                    </span>
                </div>

                <div class="form-group">
                    <label for="stream-name" class="label-block">
                        {$t("camera.stream_name", { default: "Stream Name" })}
                    </label>
                    <input
                        id="stream-name"
                        type="text"
                        class="input"
                        bind:value={streamName}
                        placeholder="camera1"
                    />
                    <span class="hint">
                        {$t("camera.stream_name_hint", {
                            default: "Stream name configured in go2rtc",
                        })}
                    </span>
                </div>
            {/if}

            <!-- Direct URL Settings -->
            {#if sourceType === "url"}
                <div class="form-group">
                    <label for="stream-url" class="label-block">
                        {$t("camera.stream_url", { default: "Stream URL" })}
                    </label>
                    <input
                        id="stream-url"
                        type="text"
                        class="input"
                        class:input-error={isRtspUrl}
                        bind:value={url}
                        placeholder="http://..."
                    />
                    {#if urlError}
                        <span class="error-hint">
                            <iconify-icon icon="mdi:alert" width="16"
                            ></iconify-icon>
                            {urlError}
                        </span>
                    {:else}
                        <span class="hint">
                            Примеры: HLS (.m3u8), MJPEG (http://ip/stream.mjpeg)
                        </span>
                    {/if}
                </div>

                <div class="form-group">
                    <label class="label-block">
                        {$t("camera.stream_type_label", {
                            default: "Stream Type",
                        })}
                    </label>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input
                                type="radio"
                                name="streamType"
                                value="hls"
                                bind:group={streamType}
                            />
                            <span>HLS (.m3u8)</span>
                        </label>
                        <label class="radio-label">
                            <input
                                type="radio"
                                name="streamType"
                                value="mjpeg"
                                bind:group={streamType}
                            />
                            <span>MJPEG</span>
                        </label>
                    </div>
                </div>
            {/if}

            <!-- HA Entity Settings -->
            {#if sourceType === "ha_entity"}
                <div class="form-group">
                    <label for="entity-id" class="label-block">
                        {$t("camera.entity_id", { default: "Entity ID" })}
                    </label>
                    <input
                        id="entity-id"
                        type="text"
                        class="input"
                        bind:value={entityId}
                        placeholder="camera.front_door"
                    />
                    <span class="hint">
                        {$t("camera.entity_id_hint", {
                            default: "Home Assistant camera entity ID",
                        })}
                    </span>
                </div>
            {/if}
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
        gap: 1.25rem;
    }

    .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--border-divider);
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .label-block {
        font-weight: 500;
        font-size: 0.95rem;
        color: var(--text-primary);
    }

    .input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-input);
        border-radius: 8px;
        background: var(--bg-input);
        color: var(--text-primary);
        font-size: 0.95rem;
        transition: border-color 0.2s;
    }

    .input:focus {
        outline: none;
        border-color: var(--accent-primary);
    }

    .hint {
        font-size: 0.8rem;
        color: var(--text-muted);
    }

    .radio-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .radio-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        border: 1px solid var(--border-input);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .radio-label:hover {
        background: var(--bg-card-hover);
    }

    .radio-label input[type="radio"] {
        cursor: pointer;
    }

    .radio-label span {
        color: var(--text-primary);
        font-size: 0.95rem;
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

    .input-error {
        border-color: var(--accent-error, #ef4444);
    }

    .error-hint {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: var(--accent-error, #ef4444);
        padding: 0.5rem;
        background: rgba(239, 68, 68, 0.1);
        border-radius: 6px;
    }
</style>
