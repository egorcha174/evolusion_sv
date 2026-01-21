
<script lang="ts">
  let { cols, rows, cellPx, gapPx } = $props<{ cols: number, rows: number, cellPx: number, gapPx: number }>();
  
  let total = $derived(cols * rows);
  let style = $derived(`
    --cols: ${cols};
    --rows: ${rows};
    --cell-size: ${cellPx}px;
    --gap-size: ${gapPx}px;
  `);
</script>

<div class="grid-overlay" style={style}>
  {#each {length: total} as _}
    <div class="cell"></div>
  {/each}
</div>

<style>
  .grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    
    display: grid;
    grid-template-columns: repeat(var(--cols), var(--cell-size));
    grid-template-rows: repeat(var(--rows), var(--cell-size));
    gap: var(--gap-size);
    
    justify-content: center;
    align-content: center;
    
    pointer-events: none;
    z-index: 0;
  }
  
  .cell {
    width: 100%;
    height: 100%;
    background-color: var(--grid-cell-bg);
    border: 1px solid var(--grid-cell-border);
    border-radius: 6px;
    box-sizing: border-box;
  }
</style>