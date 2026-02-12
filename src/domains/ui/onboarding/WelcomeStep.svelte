<script lang="ts">
    import { t } from "svelte-i18n";
    import { onboardingStore } from "../../app/onboardingStore";
    import { demoStore } from "../../app/demoStore";
    import "iconify-icon";

    function startSetup() {
        onboardingStore.nextStep();
    }

    function startDemo() {
        demoStore.enable();
        onboardingStore.complete();
    }
</script>

<div class="welcome-step">
    <div class="hero">
        <div class="logo-container">
            <iconify-icon icon="mdi:home-assistant" width="64" class="logo-icon"
            ></iconify-icon>
        </div>

        <h1>{$t("onboarding.welcome.title")}</h1>
        <p class="subtitle">{$t("onboarding.welcome.subtitle")}</p>
    </div>

    <div class="features">
        <div class="feature">
            <iconify-icon icon="mdi:lightning-bolt" width="24"></iconify-icon>
            <span>{$t("onboarding.welcome.feature1")}</span>
        </div>
        <div class="feature">
            <iconify-icon icon="mdi:palette" width="24"></iconify-icon>
            <span>{$t("onboarding.welcome.feature2")}</span>
        </div>
        <div class="feature">
            <iconify-icon icon="mdi:drag" width="24"></iconify-icon>
            <span>{$t("onboarding.welcome.feature3")}</span>
        </div>
    </div>

    <div class="actions">
        <button class="btn primary" onclick={startSetup}>
            <iconify-icon icon="mdi:arrow-right" width="20"></iconify-icon>
            {$t("onboarding.welcome.continue")}
        </button>

        <button class="btn secondary" onclick={startDemo}>
            <iconify-icon icon="mdi:play-circle-outline" width="20"
            ></iconify-icon>
            {$t("onboarding.welcome.tryDemo")}
        </button>
    </div>
</div>

<style>
    .welcome-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2.5rem;
        padding: 2rem;
        text-align: center;
        min-height: 100%;
    }

    .hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .logo-container {
        width: 100px;
        height: 100px;
        border-radius: 24px;
        background: linear-gradient(
            135deg,
            var(--accent-primary),
            var(--accent-info, #3b82f6)
        );
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        animation: float 3s ease-in-out infinite;
    }

    .logo-icon {
        color: white;
    }

    h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0;
        color: var(--text-primary);
        background: linear-gradient(
            135deg,
            var(--accent-primary),
            var(--accent-info, #3b82f6)
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .subtitle {
        font-size: 1.1rem;
        color: var(--text-secondary);
        margin: 0;
        max-width: 400px;
    }

    .features {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1.5rem;
        background: var(--glass-surface, rgba(255, 255, 255, 0.05));
        border-radius: 16px;
        border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
    }

    .feature {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--text-primary);
        font-size: 0.95rem;
    }

    .feature iconify-icon {
        color: var(--accent-primary);
    }

    .actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        width: 100%;
        max-width: 280px;
    }

    .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
    }

    .btn.primary {
        background: var(--accent-primary);
        color: white;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }

    .btn.primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    }

    .btn.secondary {
        background: var(--glass-surface, rgba(255, 255, 255, 0.1));
        color: var(--text-primary);
        border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    }

    .btn.secondary:hover {
        background: var(--glass-surface-hover, rgba(255, 255, 255, 0.15));
    }

    @keyframes float {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-8px);
        }
    }

    @media (max-width: 480px) {
        h1 {
            font-size: 2rem;
        }

        .features {
            width: 100%;
        }
    }
</style>
