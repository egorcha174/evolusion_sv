
<script lang="ts">
  import { onHandlePointerDown } from '../pointer';
  import type { ResizeHandle } from '../types';

  let { cardId } = $props<{ cardId: string }>();

  const handles: ResizeHandle[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
</script>

<div class="handles-container">
  {#each handles as h}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
      class="handle {h}" 
      data-handle={h}
      onpointerdown={(e) => onHandlePointerDown(e, cardId, h)}
    ></div>
  {/each}
</div>

<style>
  .handles-container {
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    pointer-events: none; /* Let clicks pass through except handles */
    z-index: 100;
  }

  .handle {
    position: absolute;
    width: 12px;
    height: 12px;
    background: var(--accent-primary);
    border: 1px solid #fff;
    border-radius: 50%;
    pointer-events: auto;
    z-index: 101;
    /* Hit area boost could be done with pseudo elements if needed */
  }

  .n { top: 0; left: 50%; transform: translate(-50%, -50%); cursor: ns-resize; }
  .s { bottom: 0; left: 50%; transform: translate(-50%, 50%); cursor: ns-resize; }
  .w { left: 0; top: 50%; transform: translate(-50%, -50%); cursor: ew-resize; }
  .e { right: 0; top: 50%; transform: translate(50%, -50%); cursor: ew-resize; }
  
  .nw { top: 0; left: 0; transform: translate(-50%, -50%); cursor: nwse-resize; }
  .ne { top: 0; right: 0; transform: translate(50%, -50%); cursor: nesw-resize; }
  .sw { bottom: 0; left: 0; transform: translate(-50%, 50%); cursor: nesw-resize; }
  .se { bottom: 0; right: 0; transform: translate(50%, 50%); cursor: nwse-resize; }
</style>
