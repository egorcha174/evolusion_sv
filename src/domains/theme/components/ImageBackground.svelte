<script lang="ts">
  import type { ImageConfig } from '../../../themes/types';

  let { config }: { config: ImageConfig | undefined } = $props();
</script>

{#if config}
  <div
    class="image-bg"
    style:background-image="url({config.url})"
    style:background-size={config.size}
    style:background-position={config.position}
    style:background-repeat={config.repeat}
    style:opacity={config.opacity ?? 1}
    style:filter={config.blur ? `blur(${config.blur}px)` : 'none'}
  ></div>
{/if}

<style>
  .image-bg {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
