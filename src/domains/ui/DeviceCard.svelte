
<script lang="ts">
  import { t } from 'svelte-i18n';
  import type { HAEntity, CardTemplate, CardElement } from '$lib/types';
  import { toggleEntity } from '../ha/store';
  import { extractDomain } from '$lib/utils';
  import { getIcon } from '$lib/icons';
  import { lazyLoad } from '$lib/actions';
  import { getTemplateCssVariables } from './editor/templates/style';
  
  let { entity, template }: { entity: HAEntity, template?: CardTemplate } = $props();
  
  let isToggling = $state(false);
  let error = $state<string | null>(null);
  let isLoaded = $state(false);
  
  async function handleToggle() {
    try {
      isToggling = true;
      error = null;
      await toggleEntity(entity.entity_id);
    } catch (err: any) {
      error = err.message || 'Failed to toggle';
    } finally {
      isToggling = false;
    }
  }
  
  function handleEnter() {
    isLoaded = true;
  }
  
  let domain = $derived(extractDomain(entity.entity_id));
  let displayName = $derived(entity.attributes.friendly_name || entity.entity_id);
  let isOn = $derived(entity.state === 'on' || entity.state === 'open' || entity.state === 'unlocked');
  let isToggleable = $derived(['light', 'switch', 'cover', 'lock', 'input_boolean', 'script'].includes(domain));
  
  let icon = $derived(getIcon(domain));
  
  let translatedState = $derived.by(() => {
     if (entity.state === 'on') return $t('common.on');
     if (entity.state === 'off') return $t('common.off');
     if (entity.state === 'unavailable') return $t('entities.status.unavailable');
     if (entity.state === 'unknown') return $t('entities.status.unknown');
     return entity.state;
  });

  // Calculate overridden styles if template exists
  let customStyle = $derived(template ? getTemplateCssVariables(template.style) : '');

  // Detect mode: Visual (Elements) or Legacy (Flex)
  let isVisualMode = $derived(template && template.elements && template.elements.length > 0);
  
  // Helper for elements style
  function getElementStyle(el: CardElement): string {
    const s = el.style;
    const parts = [
      `left: ${el.x}%`,
      `top: ${el.y}%`,
      `color: ${s.color || 'inherit'}`,
      `font-size: ${s.fontSize ? s.fontSize + 'px' : 'inherit'}`,
      `font-weight: ${s.fontWeight || 'inherit'}`,
      `text-align: ${s.textAlign || 'left'}`,
      `opacity: ${s.opacity ?? 1}`,
      `z-index: ${s.zIndex ?? 1}`
    ];
    
    if (el.w) parts.push(`width: ${el.w}%`);
    if (el.h) parts.push(`height: ${el.h}%`);
    if (s.backgroundColor) parts.push(`background-color: ${s.backgroundColor}`);
    if (s.borderRadius) parts.push(`border-radius: ${s.borderRadius}px`);
    
    return parts.join(';');
  }
</script>

<div 
  class="device-card" 
  class:active={isOn}
  class:visual-mode={isVisualMode}
  data-domain={domain}
  use:lazyLoad
  onenter={handleEnter}
  onclick={isToggleable ? handleToggle : undefined}
  style={customStyle}
>
  {#if !isLoaded}
    <div class="skeleton"></div>
  {:else}
    {#if isVisualMode && template}
       <!-- Visual Mode: Render Elements -->
       {#each template.elements as el (el.id)}
         <div class="card-element type-{el.type}" style={getElementStyle(el)}>
            {#if el.type === 'icon'}
               <iconify-icon icon={icon} width="100%" height="100%"></iconify-icon>
            {:else if el.type === 'name'}
               {displayName}
            {:else if el.type === 'state'}
               {translatedState}
            {:else if el.type === 'label'}
               {el.label || 'Text'}
            {:else if el.type === 'shape'}
               <!-- Shape is just a div with background, handled by style -->
            {/if}
         </div>
       {/each}
    {:else}
       <!-- Legacy Mode: Fixed Flex Layout -->
       <div class="card-header">
        <div class="icon">
          <iconify-icon icon={icon} width="24" height="24"></iconify-icon>
        </div>
        <div class="device-name" title={displayName}>{displayName}</div>
      </div>
      
      <div class="card-body">
        <div class="state-container">
          <span class="device-value">{translatedState}</span>
          {#if entity.attributes.unit_of_measurement}
            <span class="device-unit">{entity.attributes.unit_of_measurement}</span>
          {/if}
        </div>
        
        {#if entity.attributes.brightness !== undefined}
          <div class="attribute">
            {Math.round((entity.attributes.brightness / 255) * 100)}%
          </div>
        {/if}
      </div>
    {/if}

    {#if error}
      <div class="error">{error}</div>
    {/if}
  {/if}
</div>

<style>
  .device-card {
    /* Background */
    background: var(--card-background, rgba(255, 255, 255, 0.8));
    
    /* Border */
    border: var(--card-border-width, 0px) solid var(--card-border-color, transparent);
    border-radius: var(--card-border-radius, 16px);
    
    /* REMOVED: Opacity. Opacity is now handled by RGBA background color */
    /* opacity: var(--card-opacity, 0.85); */
    
    /* Padding override */
    padding: var(--card-padding, 16px);
    
    /* Other Styles */
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
    
    /* Shadow */
    box-shadow: var(--shadow-card, 0 2px 8px rgba(0, 0, 0, 0.1));
    
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    width: 100%;
    
    min-height: 0; 
    position: relative;
    overflow: hidden;
  }
  
  .device-card:hover {
    transform: translateY(-2px);
    /* opacity: 1; */ /* No longer needed */
  }
  
  /* Active State */
  .device-card.active {
    background: var(--card-background-on, rgba(255, 255, 255, 0.95));
    border-color: var(--card-border-color-on, #0A84FF);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  /* --- Visual Mode Styles --- */
  .device-card.visual-mode {
    display: block; /* Remove flex context */
    padding: 0; /* Padding is handled by element positioning or safe area */
  }

  .card-element {
    position: absolute;
    display: flex;
    align-items: center;
    /* Default justification usually left, but can be overridden by style */
    white-space: nowrap;
    overflow: hidden;
    pointer-events: none; /* Let clicks pass through to card */
  }

  .card-element.type-icon {
     /* Icons usually center */
     justify-content: center;
     color: var(--status-text-color);
  }
  
  .device-card.active .card-element.type-icon {
     color: var(--accent-primary);
  }

  .card-element.type-name {
     font-weight: 600;
     color: var(--name-text-color);
  }
  
  .card-element.type-state {
     color: var(--value-text-color);
  }

  /* --- Legacy Mode Styles --- */
  
  .card-header {
    display: flex;
    gap: 12px;
    align-items: center;
    min-width: 0; /* Enable flex item shrinking */
  }
  
  .icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--status-text-color);
    background: rgba(0,0,0,0.05);
    border-radius: 50%;
    transition: all 0.3s;
    flex-shrink: 0;
  }

  .device-card.active .icon {
    background: var(--accent-primary);
    color: #fff;
  }
  
  .device-name {
    color: var(--name-text-color, #1D1D1F);
    font-weight: 600;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  
  .device-card.active .device-name {
    color: var(--name-text-color-on, #1D1D1F);
  }
  
  .card-body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    min-height: 0; /* Allow shrinking */
  }
  
  .state-container {
     display: flex;
     align-items: baseline;
     gap: 2px;
  }
  
  .device-value {
    color: var(--value-text-color, #1D1D1F);
    font-size: 1.1rem;
    font-weight: 500;
    text-transform: capitalize;
  }
  
  .device-card.active .device-value {
    color: var(--value-text-color-on, #1D1D1F);
  }
  
  .device-unit {
    color: var(--unit-text-color, #1D1D1F);
    font-size: 0.85rem;
  }
  
  .device-card.active .device-unit {
    color: var(--unit-text-color-on, #1D1D1F);
  }
  
  .attribute {
    font-size: 0.8rem;
    color: var(--text-muted);
    background: rgba(0,0,0,0.05);
    padding: 2px 6px;
    border-radius: 4px;
  }
  
  .error {
    color: var(--accent-error);
    font-size: 0.75rem;
    margin-top: auto;
  }

  .skeleton {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 12px;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* --- Compact Mode via Container Queries (Legacy Only) --- */
  
  @container (height < 90px) {
    .device-card:not(.visual-mode) {
      flex-direction: row; 
      align-items: center;
      padding-left: 16px; 
      padding-right: 16px;
      gap: 12px;
    }
    
    .device-card:not(.visual-mode) .card-header {
      flex: 1; 
      margin-bottom: 0;
    }
    
    .device-card:not(.visual-mode) .card-body {
      flex: 0 0 auto; 
      justify-content: flex-end;
    }
    
    .device-card:not(.visual-mode) .icon {
      width: 32px;
      height: 32px;
    }
    
    .device-card:not(.visual-mode) .device-value {
      font-size: 1rem;
    }
    
    .device-card:not(.visual-mode) .attribute {
      display: none;
    }
  }
</style>
