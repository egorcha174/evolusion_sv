<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from 'svelte-i18n';
  import { infoPanelWidth, saveUIState, loadUIState } from './store';
  import WeatherWidget from './widgets/WeatherWidget.svelte';

  let width = $state(320);
  let isResizing = $state(false);
  let timeStr = $state('');

  onMount(() => {
    // Initialize state
    loadUIState();

    // Subscribe to store updates
    const unsub = infoPanelWidth.subscribe((w) => (width = w));

    // Clock logic
    const updateTime = () => {
      // Hardcoded 24h format as per spec
      timeStr = new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  });

  function startResize(e: MouseEvent) {
    e.preventDefault();
    isResizing = true;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResize);
    document.body.style.cursor = 'col-resize';
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isResizing) return;

    // Calculate new width: strictly pointer X coordinate
    // since panel is on the left edge.
    let newWidth = e.clientX;

    // Constraints
    if (newWidth < 280) newWidth = 280;
    if (newWidth > 500) newWidth = 500;

    width = newWidth;
  }

  function stopResize() {
    if (isResizing) {
      isResizing = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResize);
      document.body.style.cursor = '';
      saveUIState(width);
    }
  }
</script>

<aside class="info-panel" style="width: {width}px">
  <!-- Resize Handle -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="resize-handle" onmousedown={startResize}></div>

  <div class="panel-content">
    <!-- Clock Zone -->
    <div class="section clock-section">
      <div class="clock">{timeStr}</div>
    </div>

    <!-- Weather Zone -->
    <div class="section weather-section">
      <WeatherWidget />
    </div>

    <!-- Camera Zone -->
    <div class="section camera-section">
      <div class="card camera-card">
        <span class="placeholder-text">{$t('sidebar.cameraPlaceholder')}</span>
      </div>
    </div>
  </div>
</aside>

<style>
  .info-panel {
    position: relative;
    height: 100vh;
    flex-shrink: 0;
    display: none; /* Hidden on mobile */

    /* Glassmorphism Light Mode */
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-right: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.05);

    /* Shape */
    border-top-right-radius: 24px;
    border-bottom-right-radius: 24px;
    z-index: 50;
    transition: width 0.05s linear; /* Smooth resizing but responsive */
  }

  @media (min-width: 1024px) {
    .info-panel {
      display: flex;
      flex-direction: column;
    }
  }

  @media (prefers-color-scheme: dark) {
    .info-panel {
      background: rgba(15, 23, 42, 0.35);
      border-right: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.2);
    }
  }

  .resize-handle {
    position: absolute;
    top: 0;
    right: 0;
    width: 8px;
    height: 100%;
    cursor: col-resize;
    z-index: 60;
    transition: background 0.2s;
  }

  .resize-handle:hover,
  .info-panel:hover .resize-handle {
    background: rgba(128, 128, 128, 0.1);
  }

  .panel-content {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .section {
    width: 100%;
  }

  .clock {
    font-size: 4rem;
    font-weight: 200;
    text-align: center;
    color: inherit;
    line-height: 1.2;
    font-variant-numeric: tabular-nums;
  }

  @media (prefers-color-scheme: dark) {
    .clock {
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .card {
    background: rgba(255, 255, 255, 0.4);
    border-radius: 16px;
    padding: 20px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.3);
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
  }

  @media (prefers-color-scheme: dark) {
    .card {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .camera-card {
    min-height: 240px;
    background: rgba(0, 0, 0, 0.05);
  }

  .placeholder-text {
    font-weight: 500;
    color: inherit;
    opacity: 0.7;
  }
</style>
