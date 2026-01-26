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
    /* Move handles slightly outside the border so they center on the line */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 100;
  }

  .handle {
    position: absolute;
    width: 14px;
    height: 14px;
    background: var(--accent-primary);
    border: 2px solid #ffffff;
    border-radius: 50%;
    pointer-events: auto;
    z-index: 101;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
    transition: transform 0.1s;
  }

  .handle:hover {
    transform: scale(1.2);
  }

  /* Positioning: centering on the border lines */
  .n {
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    cursor: ns-resize;
  }
  .s {
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 50%);
    cursor: ns-resize;
  }
  .w {
    left: 0;
    top: 50%;
    transform: translate(-50%, -50%);
    cursor: ew-resize;
  }
  .e {
    right: 0;
    top: 50%;
    transform: translate(50%, -50%);
    cursor: ew-resize;
  }

  .nw {
    top: 0;
    left: 0;
    transform: translate(-50%, -50%);
    cursor: nwse-resize;
  }
  .ne {
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
    cursor: nesw-resize;
  }
  .sw {
    bottom: 0;
    left: 0;
    transform: translate(-50%, 50%);
    cursor: nesw-resize;
  }
  .se {
    bottom: 0;
    right: 0;
    transform: translate(50%, 50%);
    cursor: nwse-resize;
  }

  /* Hover overrides for transforms need to include the translate */
  .n:hover {
    transform: translate(-50%, -50%) scale(1.2);
  }
  .s:hover {
    transform: translate(-50%, 50%) scale(1.2);
  }
  .w:hover {
    transform: translate(-50%, -50%) scale(1.2);
  }
  .e:hover {
    transform: translate(50%, -50%) scale(1.2);
  }
  .nw:hover {
    transform: translate(-50%, -50%) scale(1.2);
  }
  .ne:hover {
    transform: translate(50%, -50%) scale(1.2);
  }
  .sw:hover {
    transform: translate(-50%, 50%) scale(1.2);
  }
  .se:hover {
    transform: translate(50%, 50%) scale(1.2);
  }
</style>
