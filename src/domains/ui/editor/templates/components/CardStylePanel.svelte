
<script lang="ts">
  import type { CardTemplateStyle } from '$lib/types';

  let { value, onChange } = $props<{ 
    value: CardTemplateStyle, 
    onChange: (s: CardTemplateStyle) => void 
  }>();

  // Helper to update a single field
  function update(field: keyof CardTemplateStyle, val: any) {
    onChange({
      ...value,
      [field]: val
    });
  }
</script>

<div class="style-panel">
  <!-- Background -->
  <div class="section">
    <h3>Background</h3>
    
    <div class="control-row">
      <label>Type</label>
      <select 
        value={value.backgroundType} 
        onchange={(e) => update('backgroundType', e.currentTarget.value)}
      >
        <option value="color">Solid Color</option>
        <option value="transparent">Transparent</option>
      </select>
    </div>

    {#if value.backgroundType === 'color'}
      <div class="control-row">
        <label>Color</label>
        <div class="color-input-wrapper">
          <input 
            type="color" 
            value={value.backgroundColor} 
            oninput={(e) => update('backgroundColor', e.currentTarget.value)}
          />
          <span class="color-value">{value.backgroundColor}</span>
        </div>
      </div>
    {/if}

    <div class="control-row">
      <label>Opacity ({value.opacity})</label>
      <input 
        type="range" 
        min="0" max="1" step="0.05" 
        value={value.opacity}
        oninput={(e) => update('opacity', parseFloat(e.currentTarget.value))}
      />
    </div>
  </div>

  <div class="divider"></div>

  <!-- Spacing & Effects -->
  <div class="section">
    <h3>Effects & Spacing</h3>
    
    <div class="control-row">
      <label>Shadow</label>
      <select 
        value={value.shadow} 
        onchange={(e) => update('shadow', e.currentTarget.value)}
      >
        <option value="none">None</option>
        <option value="sm">Small</option>
        <option value="md">Medium</option>
        <option value="lg">Large</option>
      </select>
    </div>

    <div class="control-row">
      <label>Padding ({value.padding}px)</label>
      <input 
        type="range" 
        min="0" max="40" step="4" 
        value={value.padding}
        oninput={(e) => update('padding', parseInt(e.currentTarget.value))}
      />
    </div>
  </div>
  
  <div class="info-note">
    <iconify-icon icon="mdi:information-outline"></iconify-icon>
    <p>Borders and active states are managed by the global theme.</p>
  </div>
</div>

<style>
  .style-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1rem 0;
  }

  h3 {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    text-transform: uppercase;
    color: var(--text-secondary);
    letter-spacing: 0.05em;
  }

  .control-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    gap: 1rem;
  }

  label {
    font-size: 0.9rem;
    color: var(--text-primary);
  }

  input[type="range"] {
    flex: 1;
    max-width: 120px;
  }

  select {
    padding: 0.25rem;
    border-radius: 4px;
    border: 1px solid var(--border-primary);
    background: var(--bg-input);
    color: var(--text-primary);
  }

  .color-input-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  input[type="color"] {
    border: none;
    width: 24px;
    height: 24px;
    padding: 0;
    background: none;
    cursor: pointer;
  }

  .color-value {
    font-family: monospace;
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .divider {
    height: 1px;
    background: var(--border-divider);
    width: 100%;
  }
  
  .info-note {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--bg-chip);
    border-radius: 8px;
    font-size: 0.8rem;
    color: var(--text-secondary);
    align-items: flex-start;
  }
  
  .info-note p {
    margin: 0;
  }
</style>
