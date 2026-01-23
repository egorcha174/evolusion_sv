
<script lang="ts">
  import type { CardTemplate } from '../types';
  import { buildCardStyle } from '../style';

  let { template } = $props<{ template: CardTemplate }>();

  let css = $derived(buildCardStyle(template.style));
</script>

<div class="card-preview-container">
  <div class="card-preview" style={css}>
    <!-- Placeholder Content -->
    <div class="preview-header">
      <div class="preview-icon"></div>
      <div class="preview-title">Device Name</div>
    </div>
    <div class="preview-state">On</div>
  </div>
</div>

<style>
  .card-preview-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
      linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
      linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    border-radius: 12px;
    overflow: hidden;
    padding: 2rem;
  }

  .card-preview {
    width: 240px;
    height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.2s ease;
  }

  /* Dummy content styles for structure visualization */
  .preview-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .preview-icon {
    width: 32px;
    height: 32px;
    background: rgba(0,0,0,0.1);
    border-radius: 50%;
  }

  .preview-title {
    font-weight: 600;
    opacity: 0.8;
  }

  .preview-state {
    font-size: 1.2rem;
    font-weight: 500;
  }
</style>
