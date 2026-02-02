<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import "iconify-icon";

    interface Props {
        settings?: any;
    }

    let { settings = {} }: Props = $props();

    let timeLeft = $state("");
    let isPast = $state(false);
    let timer: number; // ReturnType<typeof setInterval> in browser is number

    function updateTimer() {
        if (!settings.date) {
            timeLeft = "--:--";
            return;
        }

        const targetTime = settings.time || "00:00";
        const targetDate = new Date(`${settings.date}T${targetTime}:00`);
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();

        const absDiff = Math.abs(diff);
        const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((absDiff / (1000 * 60)) % 60);
        const seconds = Math.floor((absDiff / 1000) % 60);

        // Format
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0 || days > 0)
            parts.push(`${hours.toString().padStart(2, "0")}h`);
        parts.push(`${minutes.toString().padStart(2, "0")}m`);
        parts.push(`${seconds.toString().padStart(2, "0")}s`);

        timeLeft = parts.join(" ");

        if (settings.mode === "countup") {
            // Count UP mode (e.g. days since)
            isPast = diff > 0; // If target is in future, we haven't reached it yet
        } else {
            // Count DOWN mode (default)
            isPast = diff < 0; // If target is in past, we passed it
        }
    }

    onMount(() => {
        updateTimer();
        timer = window.setInterval(updateTimer, 1000);
    });

    onDestroy(() => {
        if (timer) clearInterval(timer);
    });

    // React to settings changes
    $effect(() => {
        // Trigger update if settings change
        settings.date;
        settings.time;
        settings.mode;
        updateTimer();
    });
</script>

<div class="event-timer-widget" class:past={isPast}>
    <div class="title">{settings.title || "Event"}</div>
    <div class="time">{timeLeft}</div>
    <div class="target">
        {settings.date || ""}
        {settings.time || ""}
    </div>
    {#if isPast && settings.mode !== "countup"}
        <iconify-icon icon="mdi:check-circle" class="status-icon"
        ></iconify-icon>
    {/if}
</div>

<style>
    .event-timer-widget {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--bg-card);
        border-radius: var(--radius-lg, 16px);
        padding: 1rem;
        box-shadow: var(--shadow-sm);
        position: relative;
        overflow: hidden;
        border: 1px solid var(--border-primary, rgba(0, 0, 0, 0.05));
    }

    .title {
        font-size: 1rem;
        font-weight: 500;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
        text-align: center;
    }

    .time {
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--text-primary);
        font-variant-numeric: tabular-nums;
        text-align: center;
        line-height: 1.2;
    }

    .target {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 0.5rem;
    }

    /* Status for completed countdown */
    .past {
        background: var(--bg-success-soft, rgba(34, 197, 94, 0.1));
        border-color: var(--color-success, #22c55e);
    }

    .past .time {
        color: var(--color-success, #22c55e);
    }

    .status-icon {
        position: absolute;
        top: 8px;
        right: 8px;
        color: var(--color-success, #22c55e);
        font-size: 1.2rem;
    }
</style>
