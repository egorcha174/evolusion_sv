<script lang="ts">
  import LabeledInput from './LabeledInput.svelte';

  const { label, path, value, onUpdate } = $props<{
    label: string;
    path: string;
    value: string;
    onUpdate: (path: string, value: any) => void;
  }>();
</script>

<LabeledInput {label}>
  <div class="flex items-center gap-2">
    <span class="text-xs font-mono text-gray-400 uppercase">{value}</span>
    <input type="color" {value} on:input={(e) => onUpdate(path, e.currentTarget.value)} class="w-8 h-8 p-0 border-none rounded-md cursor-pointer bg-transparent shadow-sm"/>
  </div>
</LabeledInput>
