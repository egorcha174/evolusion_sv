<script lang="ts">
  let { color }: { color: string | undefined } = $props();
</script>

<div class="solid-bg" style:background-color={color || '#1C1C1E'}></div>

<style>
  .solid-bg {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
