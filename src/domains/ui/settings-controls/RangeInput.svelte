<script lang="ts">
  import LabeledInput from './LabeledInput.svelte';

  const { label, path, value, min, max, step, unit = undefined, onUpdate } = $props<{
    label: string;
    path: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit?: string;
    onUpdate: (path: string, value: any) => void;
  }>();
</script>

<LabeledInput {label}>
  <div class="flex items-center gap-2">
    <input type="range" {min} {max} {step} {value} on:input={(e) => onUpdate(path, parseFloat(e.currentTarget.value))} class="w-full accent-blue-500"/>
    <span class="text-xs font-mono text-gray-500 dark:text-gray-400 w-12 text-right">{value}{unit}</span>
  </div>
</LabeledInput>
