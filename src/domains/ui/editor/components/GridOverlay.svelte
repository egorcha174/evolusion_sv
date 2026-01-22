
<script lang="ts">
  let { cols, rows, cellW, cellH, gapX, gapY } = $props<{ 
    cols: number, 
    rows: number, 
    cellW: number, 
    cellH: number, 
    gapX: number, 
    gapY: number 
  }>();
  
  let total = $derived(cols * rows);
  let style = $derived(`
    --cols: ${cols};
    --rows: ${rows};
    --cell-w: ${cellW}px;
    --cell-h: ${cellH}px;
    --gap-x: ${gapX}px;
    --gap-y: ${gapY}px;
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
    grid-template-columns: repeat(var(--cols), var(--cell-w));
    grid-template-rows: repeat(var(--rows), var(--cell-h));
    column-gap: var(--gap-x);
    row-gap: var(--gap-y);
    
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
