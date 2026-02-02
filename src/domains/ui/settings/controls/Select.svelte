<script lang="ts">
    let {
        label,
        value = $bindable(),
        options = [],
        disabled = false,
        onchange,
    } = $props<{
        label: string;
        value: any;
        options: { label: string; value: any }[];
        disabled?: boolean;
        onchange?: (value: any) => void;
    }>();

    const id = "select-" + Math.random().toString(36).substr(2, 9);

    function handleChange(e: Event) {
        const target = e.target as HTMLSelectElement;
        // Attempt to preserve type if original value validation allows
        // Simple for string/number.
        // For more complex, might need mapping back.
        // Assuming string/number for now based on usage.
        value = target.value;
        if (onchange) onchange(value);
    }
</script>

<div class="control-group">
    <label class="label" for={id}>
        {label}
    </label>
    <select {id} class="select" bind:value {disabled} onchange={handleChange}>
        {#each options as option}
            <option value={option.value}>{option.label}</option>
        {/each}
    </select>
</div>

<style>
    .control-group {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .label {
        font-size: 0.95rem;
        font-weight: 500;
        color: var(--text-primary);
        cursor: pointer;
    }

    .select {
        padding: 0.4rem 0.8rem;
        border-radius: 6px;
        border: 1px solid var(--border-input);
        background: var(--bg-input);
        color: var(--text-primary);
        min-width: 140px;
        font-size: 0.9rem;
        max-width: 60%;
        cursor: pointer;
    }

    .select:focus {
        outline: none;
        border-color: var(--accent-primary);
    }

    .select:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
