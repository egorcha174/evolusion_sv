<script lang="ts">
    import { onboardingStore } from "../../app/onboardingStore";
    import WelcomeStep from "./WelcomeStep.svelte";
    import ConnectStep from "./ConnectStep.svelte";
    import DevicesStep from "./DevicesStep.svelte";
    import ThemeStep from "./ThemeStep.svelte";
    import "iconify-icon";

    const STEPS = [
        { id: "welcome", component: WelcomeStep },
        { id: "connect", component: ConnectStep },
        { id: "devices", component: DevicesStep },
        { id: "theme", component: ThemeStep },
    ];

    let currentStep = $derived($onboardingStore.currentStep);
    let CurrentComponent = $derived(
        STEPS[currentStep]?.component || WelcomeStep,
    );
</script>

<div class="onboarding-wizard">
    <div class="wizard-container">
        <!-- Progress Indicator -->
        {#if currentStep > 0}
            <div class="progress-bar">
                {#each STEPS as step, i}
                    <div
                        class="step-dot"
                        class:active={i === currentStep}
                        class:completed={i < currentStep}
                    >
                        {#if i < currentStep}
                            <iconify-icon icon="mdi:check" width="12"
                            ></iconify-icon>
                        {:else}
                            <span>{i + 1}</span>
                        {/if}
                    </div>
                    {#if i < STEPS.length - 1}
                        <div
                            class="step-line"
                            class:completed={i < currentStep}
                        ></div>
                    {/if}
                {/each}
            </div>
        {/if}

        <!-- Step Content -->
        <div class="step-content">
            <CurrentComponent />
        </div>
    </div>
</div>

<style>
    .onboarding-wizard {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: var(--bg-page, #0a0a14);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    .wizard-container {
        width: 100%;
        height: 100%;
        max-width: 800px;
        display: flex;
        flex-direction: column;
        padding: 2rem;
    }

    .progress-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        padding: 1rem 0 2rem 0;
        flex-shrink: 0;
    }

    .step-dot {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--glass-surface, rgba(255, 255, 255, 0.1));
        border: 2px solid var(--border-primary, rgba(255, 255, 255, 0.2));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
        transition: all 0.3s;
    }

    .step-dot.active {
        background: var(--accent-primary);
        border-color: var(--accent-primary);
        color: white;
        transform: scale(1.1);
        box-shadow: 0 0 16px rgba(var(--accent-rgb, 33, 150, 243), 0.4);
    }

    .step-dot.completed {
        background: var(--accent-success, #30d158);
        border-color: var(--accent-success, #30d158);
        color: white;
    }

    .step-line {
        width: 48px;
        height: 2px;
        background: var(--border-primary, rgba(255, 255, 255, 0.1));
        transition: background 0.3s;
    }

    .step-line.completed {
        background: var(--accent-success, #30d158);
    }

    .step-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    @media (max-width: 600px) {
        .wizard-container {
            padding: 1rem;
        }

        .step-line {
            width: 24px;
        }
    }
</style>
