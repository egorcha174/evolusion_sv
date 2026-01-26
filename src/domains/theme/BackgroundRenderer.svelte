<script lang="ts">
  // Background logic is handled via CSS variables injected by the global theme store.
  // No imports needed here to avoid circular dependencies.
</script>

<div class="background-renderer"></div>

<style>
  .background-renderer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    pointer-events: none;

    /* Background from theme */
    background: var(--dashboard-background);

    /* Apply optional filters if variables are present (defaults to no-op) */
    filter: blur(calc(var(--dashboard-background-image-blur, 0) * 1px))
      brightness(calc(var(--dashboard-background-image-brightness, 100) * 1%));

    background-size: cover;
    background-position: center;
    transition:
      background 0.3s ease,
      filter 0.3s ease;
  }
</style>
