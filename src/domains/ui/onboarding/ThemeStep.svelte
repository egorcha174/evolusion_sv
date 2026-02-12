<script lang="ts">
    import { t } from "svelte-i18n";
    import { onboardingStore } from "../../app/onboardingStore";
    import { themeStore } from "../theme/store";
    import { builtInThemes } from "../../../themes";
    import "iconify-icon";

    // Map theme files to theme objects
    let themes = builtInThemes.map((f) => f.theme);
    let selectedThemeId = $state($themeStore.activeThemeId || "fusion");

    function selectTheme(id: string) {
        selectedThemeId = id;
        themeStore.setActiveTheme(id);
    }

    function handleComplete() {
        themeStore.setActiveTheme(selectedThemeId);
        onboardingStore.complete();
    }

    function handleBack() {
        onboardingStore.prevStep();
    }
</script>

<div class="theme-step">
    <div class="header">
        <iconify-icon icon="mdi:palette" width="36" class="icon"></iconify-icon>
        <h2>{$t("onboarding.theme.title")}</h2>
        <p class="subtitle">{$t("onboarding.theme.subtitle")}</p>
    </div>

    <div class="themes-grid">
        {#each themes as theme (theme.id)}
            {@const scheme = theme.scheme?.dark || theme.scheme?.light}
            {@const bgColor1 = scheme?.dashboardBackgroundColor1 || "#1a1a2e"}
            {@const bgColor2 = scheme?.dashboardBackgroundColor2 || bgColor1}
            {@const isGradient = scheme?.dashboardBackgroundType === "gradient"}
            {@const angle = scheme?.dashboardGradientAngle || 135}

            <button
                class="theme-card"
                class:selected={selectedThemeId === theme.id}
                onclick={() => selectTheme(theme.id)}
                style="--preview-bg: {isGradient
                    ? `linear-gradient(${angle}deg, ${bgColor1}, ${bgColor2})`
                    : bgColor1}"
            >
                <div class="preview">
                    <div class="preview-cards">
                        <div class="mini-card"></div>
                        <div class="mini-card"></div>
                        <div class="mini-card active"></div>
                        <div class="mini-card"></div>
                    </div>
                </div>
                <span class="theme-name">{theme.name}</span>
                {#if selectedThemeId === theme.id}
                    <div class="check-badge">
                        <iconify-icon icon="mdi:check" width="12"
                        ></iconify-icon>
                    </div>
                {/if}
            </button>
        {/each}
    </div>

    <div class="actions">
        <button class="btn secondary" onclick={handleBack}>
            <iconify-icon icon="mdi:arrow-left" width="18"></iconify-icon>
            {$t("common.cancel")}
        </button>

        <button class="btn primary" onclick={handleComplete}>
            <iconify-icon icon="mdi:check" width="18"></iconify-icon>
            {$t("onboarding.complete")}
        </button>
    </div>
</div>

<style>
    .theme-step {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 2rem;
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        height: 100%;
        overflow: hidden;
    }

    .header {
        text-align: center;
        flex-shrink: 0;
    }

    .icon {
        color: var(--accent-primary);
    }

    h2 {
        margin: 0.5rem 0 0 0;
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .subtitle {
        margin: 0.5rem 0 0 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .themes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 0.75rem;
        overflow-y: auto;
        flex: 1;
        padding: 0.25rem;
    }

    .theme-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: var(--glass-surface, rgba(255, 255, 255, 0.05));
        border: 2px solid var(--border-primary, rgba(255, 255, 255, 0.1));
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .theme-card:hover {
        border-color: var(--text-muted);
    }

    .theme-card.selected {
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 2px rgba(var(--accent-rgb, 33, 150, 243), 0.2);
    }

    .preview {
        width: 100%;
        aspect-ratio: 16/10;
        border-radius: 8px;
        background: var(--preview-bg);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
    }

    .preview-cards {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 4px;
        width: 100%;
        height: 100%;
    }

    .mini-card {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .mini-card.active {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.3);
    }

    .theme-name {
        font-size: 0.8rem;
        color: var(--text-primary);
        font-weight: 500;
    }

    .check-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        width: 20px;
        height: 20px;
        background: var(--accent-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-shrink: 0;
        padding-top: 1rem;
        border-top: 1px solid var(--border-divider);
    }

    .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.875rem 1.5rem;
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

    .btn.primary:hover {
        filter: brightness(1.1);
    }

    .btn.secondary {
        background: var(--glass-surface);
        color: var(--text-primary);
        border: 1px solid var(--border-primary);
    }
</style>
