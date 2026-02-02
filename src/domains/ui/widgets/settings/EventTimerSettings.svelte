<script lang="ts">
    import { t } from "svelte-i18n";
    import "iconify-icon";

    let { settings = $bindable({}) } = $props<{
        settings: Record<string, any>;
    }>();

    if (!settings.title) settings.title = "Event";
    if (!settings.date) settings.date = new Date().toISOString().split("T")[0];
    if (!settings.time) settings.time = "00:00";
    if (!settings.mode) settings.mode = "countdown"; // or 'countup'
</script>

<div class="settings-group">
    <div class="field">
        <label for="timer-title"
            >{$t("widgets.eventTimer.title", { default: "Title" })}</label
        >
        <input
            id="timer-title"
            type="text"
            bind:value={settings.title}
            placeholder="New Year's Eve"
        />
    </div>

    <div class="row">
        <div class="field">
            <label for="timer-date"
                >{$t("widgets.eventTimer.date", { default: "Date" })}</label
            >
            <input id="timer-date" type="date" bind:value={settings.date} />
        </div>
        <div class="field">
            <label for="timer-time"
                >{$t("widgets.eventTimer.time", { default: "Time" })}</label
            >
            <input id="timer-time" type="time" bind:value={settings.time} />
        </div>
    </div>

    <div class="field">
        <label for="timer-mode"
            >{$t("widgets.eventTimer.mode", { default: "Mode" })}</label
        >
        <select id="timer-mode" bind:value={settings.mode}>
            <option value="countdown"
                >{$t("widgets.eventTimer.countdown", {
                    default: "Countdown",
                })}</option
            >
            <option value="countup"
                >{$t("widgets.eventTimer.countup", {
                    default: "Count Up",
                })}</option
            >
        </select>
    </div>
</div>

<style>
    .settings-group {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .row {
        display: flex;
        gap: 1rem;
    }

    .row .field {
        flex: 1;
    }

    label {
        font-size: 0.9rem;
        color: var(--text-secondary);
        font-weight: 500;
    }

    input,
    select {
        padding: 0.75rem;
        background: var(--bg-input, #f5f5f5);
        border: 1px solid var(--border-input, #e0e0e0);
        border-radius: 8px;
        color: var(--text-primary);
        font-size: 1rem;
    }

    :global(body.dark) input,
    :global(body.dark) select {
        background: rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.1);
    }
</style>
