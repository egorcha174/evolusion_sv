<!--
  This component renders the visual background grid for the dashboard editor.
  It uses CSS gradients for performance and inherits its geometry from CSS variables.
-->
<div class="grid-overlay-visual"></div>

<style>
  .grid-overlay-visual {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    
    background-size: 
      calc(var(--cell-size) + var(--gap-x)) 
      calc(var(--cell-size) + var(--gap-y));
    
    background-image: 
      repeating-linear-gradient(
        to right,
        var(--grid-cell-bg, rgba(128, 128, 128, 0.05)),
        var(--grid-cell-bg, rgba(128, 128, 128, 0.05)) var(--cell-size),
        transparent var(--cell-size),
        transparent calc(var(--cell-size) + var(--gap-x))
      ),
      repeating-linear-gradient(
        to bottom,
        var(--grid-cell-bg, rgba(128, 128, 128, 0.05)),
        var(--grid-cell-bg, rgba(128, 128, 128, 0.05)) var(--cell-size),
        transparent var(--cell-size),
        transparent calc(var(--cell-size) + var(--gap-y))
      );

    border-radius: 6px;
    pointer-events: none;
    z-index: 0;
  }
</style>
