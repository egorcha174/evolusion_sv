
<script lang="ts">
  import type { GradientConfig } from '../../../themes/types';
  
  let { config }: { config: GradientConfig | undefined } = $props();
  
  let gradient = $derived(config
    ? `linear-gradient(${config.angle}deg, ${config.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
    : 'linear-gradient(135deg, #EAEAEB 0%, #DCDCDC 100%)');
</script>

<div class="gradient-bg" style:background-image={gradient}></div>

<style>
  .gradient-bg {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
