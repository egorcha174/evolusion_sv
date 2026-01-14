<script lang="ts">
  import LabeledInput from './LabeledInput.svelte';

  let { label, path, value, onUpdate }: { label: string; path: string; value: string; onUpdate: (path: string, value: any) => void } = $props();

  const inputId = $derived(`color-input-${path.replace(/[^a-zA-Z0-9]/g, '-')}`);
</script>

<LabeledInput {label} id={inputId}>
  <div class="flex items-center gap-2">
    <span class="text-xs font-mono text-gray-400 uppercase">{value}</span>
    <input id={inputId} type="color" {value} oninput={(e) => onUpdate(path, e.currentTarget.value)} class="w-8 h-8 p-0 border-none rounded-md cursor-pointer bg-transparent shadow-sm"/>
  </div>
</LabeledInput>