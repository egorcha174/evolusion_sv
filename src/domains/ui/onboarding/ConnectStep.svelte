<script lang="ts">
    import { t } from "svelte-i18n";
    import { onboardingStore } from "../../app/onboardingStore";
    import { saveServerConfig } from "../../app/store";
    import { initializeHAConnection } from "../../ha/store";
    import { generateId } from "$lib/types";
    import HelpTooltip from "../HelpTooltip.svelte";
    import "iconify-icon";

    let url = $state("");
    let token = $state("");
    let isConnecting = $state(false);
    let connectionStatus = $state<"idle" | "testing" | "success" | "error">(
        "idle",
    );
    let errorMessage = $state("");

    async function handleTest() {
        if (!url || !token) return;

        isConnecting = true;
        connectionStatus = "testing";
        errorMessage = "";

        try {
            // Simple connection test via WebSocket
            const wsUrl = url.replace(/^http/, "ws") + "/api/websocket";
            const ws = new WebSocket(wsUrl);

            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    ws.close();
                    reject(new Error("Connection timeout"));
                }, 5000);

                ws.onopen = () => {
                    clearTimeout(timeout);
                    ws.close();
                    resolve();
                };
                ws.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error("Connection failed"));
                };
            });

            connectionStatus = "success";
        } catch (e: any) {
            connectionStatus = "error";
            errorMessage = e.message || "Connection failed";
        } finally {
            isConnecting = false;
        }
    }

    async function handleContinue() {
        if (connectionStatus !== "success") {
            await handleTest();
            if (connectionStatus !== "success") return;
        }

        // Save configuration
        await saveServerConfig({
            id: generateId(),
            name: "Default",
            url,
            token,
        });
        initializeHAConnection(url, token);
        onboardingStore.nextStep();
    }

    function handleSkip() {
        onboardingStore.skip();
        onboardingStore.nextStep();
    }

    function handleBack() {
        onboardingStore.prevStep();
    }
</script>

<div class="connect-step">
    <div class="header">
        <iconify-icon icon="mdi:home-assistant" width="40" class="ha-icon"
        ></iconify-icon>
        <h2>{$t("onboarding.connect.title")}</h2>
        <p class="subtitle">{$t("onboarding.connect.subtitle")}</p>
    </div>

    <div class="form">
        <div class="field">
            <label for="server-url">
                {$t("settings.serverUrl")}
                <HelpTooltip text={$t("help.serverUrl")} />
            </label>
            <input
                id="server-url"
                type="url"
                bind:value={url}
                placeholder={$t("onboarding.connect.urlHint")}
                disabled={isConnecting}
            />
        </div>

        <div class="field">
            <label for="token">
                {$t("settings.token")}
                <HelpTooltip
                    text={$t("help.accessToken")}
                    link={$t("help.accessTokenLink")}
                />
            </label>
            <input
                id="token"
                type="password"
                bind:value={token}
                placeholder={$t("settings.tokenPlaceholder")}
                disabled={isConnecting}
            />
            <span class="hint">{$t("onboarding.connect.tokenHint")}</span>
        </div>

        {#if connectionStatus === "error"}
            <div class="error-message">
                <iconify-icon icon="mdi:alert-circle" width="18"></iconify-icon>
                {errorMessage}
            </div>
        {/if}

        {#if connectionStatus === "success"}
            <div class="success-message">
                <iconify-icon icon="mdi:check-circle" width="18"></iconify-icon>
                {$t("onboarding.connect.success")}
            </div>
        {/if}
    </div>

    <div class="actions">
        <button class="btn secondary" onclick={handleBack}>
            <iconify-icon icon="mdi:arrow-left" width="18"></iconify-icon>
            {$t("common.cancel")}
        </button>

        <div class="right-actions">
            <button class="btn text" onclick={handleSkip}>
                {$t("onboarding.connect.skip")}
            </button>

            <button
                class="btn primary"
                onclick={handleContinue}
                disabled={isConnecting || !url || !token}
            >
                {#if isConnecting}
                    <iconify-icon icon="mdi:loading" width="18" class="spin"
                    ></iconify-icon>
                    {$t("onboarding.connect.connecting")}
                {:else}
                    {$t("onboarding.connect.continue")}
                    <iconify-icon icon="mdi:arrow-right" width="18"
                    ></iconify-icon>
                {/if}
            </button>
        </div>
    </div>
</div>

<style>
    .connect-step {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 2rem;
        width: 100%;
        max-width: 480px;
        margin: 0 auto;
    }

    .header {
        text-align: center;
    }

    .ha-icon {
        color: var(--accent-primary);
        margin-bottom: 0.5rem;
    }

    h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .subtitle {
        margin: 0.5rem 0 0 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .field label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text-primary);
    }

    .field input {
        padding: 0.875rem 1rem;
        border: 1px solid var(--border-input, rgba(255, 255, 255, 0.1));
        border-radius: 12px;
        background: var(--bg-input, rgba(0, 0, 0, 0.1));
        color: var(--text-primary);
        font-size: 1rem;
        transition: border-color 0.2s;
    }

    .field input:focus {
        outline: none;
        border-color: var(--accent-primary);
    }

    .field input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .hint {
        font-size: 0.8rem;
        color: var(--text-muted);
    }

    .error-message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: rgba(244, 67, 54, 0.1);
        border-radius: 8px;
        color: var(--accent-error);
        font-size: 0.9rem;
    }

    .success-message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: rgba(48, 209, 88, 0.1);
        border-radius: 8px;
        color: var(--accent-success);
        font-size: 0.9rem;
    }

    .actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
    }

    .right-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        border-radius: 10px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
    }

    .btn.primary {
        background: var(--accent-primary);
        color: white;
    }

    .btn.primary:hover:not(:disabled) {
        filter: brightness(1.1);
    }

    .btn.primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn.secondary {
        background: var(--glass-surface, rgba(255, 255, 255, 0.1));
        color: var(--text-primary);
        border: 1px solid var(--border-primary);
    }

    .btn.secondary:hover {
        background: var(--glass-surface-hover);
    }

    .btn.text {
        background: transparent;
        color: var(--text-secondary);
        padding: 0.5rem 1rem;
    }

    .btn.text:hover {
        color: var(--text-primary);
    }

    .spin {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
