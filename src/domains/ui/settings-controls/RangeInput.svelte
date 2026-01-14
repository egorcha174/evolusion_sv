<script lang="ts">
  import LabeledInput from './LabeledInput.svelte';

  let { label, path, value, min, max, step, unit, onUpdate }: { label: string; path: string; value: number; min: number; max: number; step: number; unit?: string; onUpdate: (path: string, value: any) => void } = $props();

  const inputId = $derived(`range-input-${path.replace(/[^a-zA-Z0-9]/g, '-')}`);
</script>

<LabeledInput {label} id={inputId}>
  <div class="flex items-center gap-2">
    <input id={inputId} type="range" {min} {max} {step} {value} oninput={(e) => onUpdate(path, parseFloat(e.currentTarget.value))} class="w-full accent-blue-500"/>
    <span class="text-xs font-mono text-gray-500 dark:text-gray-400 w-12 text-right">{value}{unit}</span>
  </div>
</LabeledInput>