<script lang="ts">
    /**
     * Camera Source Settings Form
     *
     * Reusable form for configuring camera source details.
     * Can be used in dialogs or inline settings.
     */
    import { t } from "svelte-i18n";
    import type { CameraSourceConfig } from "$lib/types";
    import "iconify-icon";
    import { untrack } from "svelte";

    let { config = $bindable(), onChange } = $props<{
        config: CameraSourceConfig;
        onChange?: (config: CameraSourceConfig) => void;
    }>();

    // Local state to avoid direct mutation issues if parent doesn't bind (though we prefer binding)
    // Actually, let's bind directly to the prop object or use a local proxy.
    // Since config is an object, mutating it is fine if we are careful,
    // but better to be reactive.

    // We'll trust the parent passed a valid object. If not, we default it.
    // But we need to handle if config replaces entirely.

    // Let's use local state for fields and sync back to config on change.

    // Initialize state from config (using untrack to prevent loops if we write back)
    // Actually, if we use $bindable config, we can just bind inputs to config properties directly?
    // Svelte 5 nested reactivity: config must be a state object or we need to treat it as plain object and re-assign.
    // The passed 'config' might be a plain object from a store.
    // Let's treat it as a plain object and use a local copy for the form, emitting updates.

    let sourceType = $state<"go2rtc" | "url" | "ha_entity">("go2rtc");
    let go2rtcUrl = $state("");
    let streamName = $state("");
    let url = $state("");
    let streamType = $state<"hls" | "mjpeg" | "webrtc">("hls");
    let entityId = $state("");
    let interactionMode = $state<"modal" | "link" | "none">("modal");
    let interactionUrl = $state("");

    // Initialize from prop
    $effect(() => {
        // Sync FROM prop TO local state ONLY when prop changes meaningfully (e.g. initial load or external reset)
        // We need to be careful not to overwrite user typing.
        // A simple way is to use 'untrack' for initialization?
        // Or just map it once on mount?
        // But if user picks a different camera in parent, we want to update.

        // Let's just update local state if the object reference changes.
        // But we are editing properties.

        // Simpler approach: Bind inputs directly to local fields, and use $effect to push changes UP.
        // And use $effect to pull changes DOWN if the config object itself is swapped?

        const c = config;
        untrack(() => {
            sourceType = c.sourceType ?? "go2rtc";
            go2rtcUrl = c.go2rtcUrl ?? "";
            streamName = c.streamName ?? "";
            url = c.url ?? "";
            streamType = c.streamType ?? "hls";
            entityId = c.entityId ?? "";
            interactionMode = c.interactionMode ?? "modal";
            interactionUrl = c.interactionUrl ?? "";
        });
    });

    // Validate URL - RTSP cannot work in browsers
    const isRtspUrl = $derived(url && url.toLowerCase().startsWith("rtsp://"));
    const urlError = $derived(
        isRtspUrl
            ? $t("camera.rtsp_error", {
                  default: "RTSP is not supported by browsers...",
              })
            : null,
    );

    // Push changes back to parent
    function update() {
        // Construct new config object
        const newConfig: CameraSourceConfig = {
            sourceType,
        };

        if (sourceType === "go2rtc") {
            newConfig.go2rtcUrl = go2rtcUrl;
            newConfig.streamName = streamName;
        } else if (sourceType === "url") {
            newConfig.url = url;
            newConfig.streamType = streamType;
        } else if (sourceType === "ha_entity") {
            newConfig.entityId = entityId;
        }

        newConfig.interactionMode = interactionMode;
        newConfig.interactionUrl = interactionUrl;

        // Update bindable prop
        config = newConfig;

        // Call callback if provided
        if (onChange) onChange(newConfig);
    }

    // Watch for changes in local state and auto-update
    $effect(() => {
        // We only want to trigger this when our local state changes.
        // But we want to avoid triggering immediately on init.
        // Svelte 5 effects run on init too.
        // We can check if values match config?
        // Just calling update() is fine, as long as it doesn't cause a loop with the Downward sync.
        // The Downward sync uses `config` dependency.
        // If we update `config`, the downward sync might run again.
        // We need to break the cycle.
        // Since we are refactoring, let's keep it simple:
        // Use `oninput` / `onchange` handlers to call `update()`.
        // Don't use an auto-effect.
    });
</script>

<div class="camera-settings-form">
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
                    onchange={update}
                />
                <span>Go2rtc</span>
            </label>
            <label class="radio-label">
                <input
                    type="radio"
                    name="sourceType"
                    value="url"
                    bind:group={sourceType}
                    onchange={update}
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
                    onchange={update}
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
                oninput={update}
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
                oninput={update}
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
                oninput={update}
                placeholder="http://..."
            />
            {#if urlError}
                <span class="error-hint">
                    <iconify-icon icon="mdi:alert" width="16"></iconify-icon>
                    {urlError}
                </span>
            {:else}
                <span class="hint">
                    {$t("camera.url_examples", {
                        default:
                            "Examples: HLS (.m3u8), MJPEG (http://ip/stream.mjpeg)",
                    })}
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
                        onchange={update}
                    />
                    <span>HLS (.m3u8)</span>
                </label>
                <label class="radio-label">
                    <input
                        type="radio"
                        name="streamType"
                        value="mjpeg"
                        bind:group={streamType}
                        onchange={update}
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
                oninput={update}
                placeholder="camera.front_door"
            />
            <span class="hint">
                {$t("camera.entity_id_hint", {
                    default: "Home Assistant camera entity ID",
                })}
            </span>
        </div>
    {/if}

    <!-- Interaction Settings -->
    <div class="divider"></div>
    <div class="form-group">
        <label class="label-block">
            {$t("camera.interaction_action", {
                default: "Click Action",
            })}
        </label>
        <div class="radio-group">
            <label class="radio-label">
                <input
                    type="radio"
                    name="interactionMode"
                    value="modal"
                    bind:group={interactionMode}
                    onchange={update}
                />
                <span
                    >{$t("camera.action_modal", {
                        default: "Open Modal",
                    })}</span
                >
            </label>
            <label class="radio-label">
                <input
                    type="radio"
                    name="interactionMode"
                    value="link"
                    bind:group={interactionMode}
                    onchange={update}
                />
                <span>{$t("camera.action_link", { default: "Open Link" })}</span
                >
            </label>
            <label class="radio-label">
                <input
                    type="radio"
                    name="interactionMode"
                    value="none"
                    bind:group={interactionMode}
                    onchange={update}
                />
                <span>{$t("camera.action_none", { default: "No Action" })}</span
                >
            </label>
        </div>
    </div>

    {#if interactionMode === "link"}
        <div class="form-group">
            <label for="interaction-url" class="label-block">
                {$t("camera.interaction_url", { default: "Link URL" })}
            </label>
            <input
                id="interaction-url"
                type="text"
                class="input"
                bind:value={interactionUrl}
                oninput={update}
                placeholder="/frigate"
            />
        </div>
    {/if}
</div>

<style>
    .camera-settings-form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
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
        box-sizing: border-box;
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

    .divider {
        height: 1px;
        background: var(--border-divider);
        margin: 0.5rem 0;
    }
</style>
