
<script lang="ts">
  import { t } from 'svelte-i18n';
  import { createDefaultCardTemplate, type CardTemplate, type CardElement, type CardTemplateStyle, type CardElementType } from '$lib/types';
  import { exportTemplate, importTemplate } from './io';
  import { templateEditorState } from './store';
  import CardStylePanel from './components/CardStylePanel.svelte';
  import 'iconify-icon';
  import { onMount } from 'svelte';

  let { mode = 'create', initialTemplate, onSave, onCancel } = $props<{
    mode?: 'create' | 'edit',
    initialTemplate?: CardTemplate,
    onSave: (t: CardTemplate) => void,
    onCancel: () => void
  }>();

  // Helper to safely clone
  function safeClone<T>(obj: T): T {
    try { return JSON.parse(JSON.stringify(obj)); } catch { return structuredClone(obj); }
  }

  // --- STATE ---
  let template = $state<CardTemplate>(
    initialTemplate ? safeClone(initialTemplate) : createDefaultCardTemplate()
  );
  
  let activeTab = $state<'elements' | 'properties' | 'style'>('elements');
  let fileInput: HTMLInputElement;
  let canvasRef: HTMLDivElement;

  // Selected Element Proxy
  let selectedElementId = $derived($templateEditorState.selectedElementId);
  let selectedElement = $derived(template.elements.find(e => e.id === selectedElementId));

  // Switch to properties tab when element selected
  $effect(() => {
    if (selectedElementId) {
      activeTab = 'properties';
    }
  });

  // --- ACTIONS ---

  function addElement(type: CardElementType) {
    const newElement: CardElement = {
      id: crypto.randomUUID(),
      type,
      x: 10,
      y: 10,
      w: type === 'shape' ? 30 : undefined,
      h: type === 'shape' ? 30 : undefined,
      label: type === 'label' ? 'Label' : undefined,
      style: {
        color: '#000000',
        fontSize: 14
      }
    };
    
    template.elements = [...template.elements, newElement];
    templateEditorState.selectElement(newElement.id);
  }

  function deleteElement(id: string) {
    template.elements = template.elements.filter(e => e.id !== id);
    if (selectedElementId === id) {
      templateEditorState.selectElement(null);
      activeTab = 'elements';
    }
  }

  function handleSave() {
    if (!template.name.trim()) {
      alert($t('templates.editor.alertName'));
      return;
    }
    onSave(safeClone(template));
  }
  
  function handleStyleChange(newStyle: CardTemplateStyle) {
    template.style = newStyle;
  }
  
  // --- DRAG LOGIC ---
  
  function handlePointerDown(e: PointerEvent, el: CardElement) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const canvasRect = canvasRef.getBoundingClientRect();
    
    // Start drag logic via store
    templateEditorState.startDrag(
       el.id, 
       e.clientX, 
       e.clientY, 
       el.x, 
       el.y
    );
    
    // Capture pointer
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  
  function handlePointerMove(e: PointerEvent) {
    if (!$templateEditorState.draggingId || !canvasRef) return;
    
    const { draggingId, dragStartX, dragStartY, elementStartX, elementStartY } = $templateEditorState;
    
    // Calculate delta in pixels
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    
    // Convert to % of canvas
    const canvasRect = canvasRef.getBoundingClientRect();
    const dxPercent = (dx / canvasRect.width) * 100;
    const dyPercent = (dy / canvasRect.height) * 100;
    
    // Update Element in Template
    const elIndex = template.elements.findIndex(el => el.id === draggingId);
    if (elIndex !== -1) {
       // Clamp to 0-100 roughly
       const newX = Math.round((elementStartX + dxPercent) * 10) / 10;
       const newY = Math.round((elementStartY + dyPercent) * 10) / 10;
       
       template.elements[elIndex].x = newX;
       template.elements[elIndex].y = newY;
    }
  }
  
  function handlePointerUp(e: PointerEvent) {
    if ($templateEditorState.draggingId) {
      templateEditorState.stopDrag();
      try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    }
  }

  function triggerImport() { fileInput.click(); }
  async function handleImport(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      try {
        const imported = await importTemplate(file);
        if (mode === 'edit') imported.id = template.id;
        template = imported;
      } catch (err) { alert($t('templates.editor.alertImport') + err); }
    }
  }
  function handleExport() { exportTemplate(template); }
  
  // Element Style Helper
  function getElementStyle(el: CardElement): string {
    const s = el.style;
    const parts = [
      `left: ${el.x}%`,
      `top: ${el.y}%`,
      `color: ${s.color || 'inherit'}`,
      `font-size: ${s.fontSize ? s.fontSize + 'px' : 'inherit'}`,
      `opacity: ${s.opacity ?? 1}`,
      `z-index: ${s.zIndex ?? 1}`
    ];
    if (el.w) parts.push(`width: ${el.w}%`);
    if (el.h) parts.push(`height: ${el.h}%`);
    if (s.backgroundColor) parts.push(`background-color: ${s.backgroundColor}`);
    return parts.join(';');
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- No portal used, relies on being mounted at root -->
<div class="template-editor-overlay">
  <div class="editor-window">
    <!-- Header -->
    <header class="editor-header">
      <div class="header-left">
        <h2>{mode === 'create' ? $t('templates.editor.new') : $t('templates.editor.edit')}</h2>
        <input type="text" class="name-input" bind:value={template.name} placeholder={$t('templates.editor.namePlaceholder')} />
      </div>
      <div class="header-right">
        <button class="btn secondary" onclick={triggerImport} type="button"><iconify-icon icon="mdi:upload"></iconify-icon> {$t('templates.editor.importJson')}</button>
        <button class="btn secondary" onclick={handleExport} type="button"><iconify-icon icon="mdi:download"></iconify-icon> {$t('templates.editor.exportJson')}</button>
        <button class="btn primary" onclick={handleSave} type="button">{$t('common.save')}</button>
        <button class="btn text" onclick={onCancel} type="button">{$t('common.close')}</button>
      </div>
    </header>

    <!-- Body -->
    <div class="editor-body">
      <!-- Toolbar (Left) -->
      <div class="toolbar">
        <div class="tool-label">Elements</div>
        <button class="tool-btn" onclick={() => addElement('icon')} type="button">
           <iconify-icon icon="mdi:lightbulb"></iconify-icon> Icon
        </button>
        <button class="tool-btn" onclick={() => addElement('name')} type="button">
           <iconify-icon icon="mdi:format-text"></iconify-icon> Name
        </button>
        <button class="tool-btn" onclick={() => addElement('state')} type="button">
           <iconify-icon icon="mdi:toggle-switch"></iconify-icon> State
        </button>
        <button class="tool-btn" onclick={() => addElement('label')} type="button">
           <iconify-icon icon="mdi:label"></iconify-icon> Label
        </button>
        <button class="tool-btn" onclick={() => addElement('shape')} type="button">
           <iconify-icon icon="mdi:shape-rectangle-plus"></iconify-icon> Shape
        </button>
      </div>

      <!-- Canvas (Center) -->
      <div class="canvas-area">
        <div class="canvas-wrapper">
          <!-- The simulated card -->
          <div 
             class="card-canvas" 
             bind:this={canvasRef}
             style:background-color={template.style.backgroundType === 'color' ? template.style.backgroundColor : 'transparent'}
             onpointermove={handlePointerMove}
             onpointerup={handlePointerUp}
          >
             {#each template.elements as el (el.id)}
               <!-- svelte-ignore a11y_no_static_element_interactions -->
               <div 
                  class="element-renderer type-{el.type}"
                  class:selected={selectedElementId === el.id}
                  style={getElementStyle(el)}
                  onpointerdown={(e) => handlePointerDown(e, el)}
               >
                  {#if el.type === 'icon'}
                     <iconify-icon icon="mdi:lightbulb" width="100%" height="100%"></iconify-icon>
                  {:else if el.type === 'name'}
                     Device Name
                  {:else if el.type === 'state'}
                     On
                  {:else if el.type === 'label'}
                     {el.label || 'Label'}
                  {/if}
                  
                  {#if selectedElementId === el.id}
                    <div class="selection-outline"></div>
                  {/if}
               </div>
             {/each}
          </div>
        </div>
      </div>

      <!-- Properties (Right) -->
      <div class="properties-pane">
        <div class="tabs">
          <button class="tab" class:active={activeTab === 'elements'} onclick={() => activeTab = 'elements'} type="button">Layers</button>
          <button class="tab" class:active={activeTab === 'properties'} onclick={() => activeTab = 'properties'} type="button">Props</button>
          <button class="tab" class:active={activeTab === 'style'} onclick={() => activeTab = 'style'} type="button">{$t('templates.editor.tabStyle')}</button>
        </div>

        <div class="props-content">
          {#if activeTab === 'elements'}
             {#if template.elements.length === 0}
               <p class="hint">No elements. Add one from the toolbar.</p>
             {:else}
               <div class="layers-list">
                 {#each template.elements as el, i}
                   <div 
                      class="layer-item" 
                      class:active={selectedElementId === el.id}
                      onclick={() => templateEditorState.selectElement(el.id)}
                   >
                      <span class="type">{el.type}</span>
                      <button class="del-btn" onclick={(e) => { e.stopPropagation(); deleteElement(el.id); }} type="button">
                        <iconify-icon icon="mdi:close"></iconify-icon>
                      </button>
                   </div>
                 {/each}
               </div>
             {/if}
          {:else if activeTab === 'properties'}
             {#if selectedElement}
                <div class="prop-group">
                   <label>Position (%)</label>
                   <div class="row">
                     <input type="number" bind:value={selectedElement.x} />
                     <input type="number" bind:value={selectedElement.y} />
                   </div>
                </div>
                {#if selectedElement.type === 'shape'}
                  <div class="prop-group">
                     <label>Size (%)</label>
                     <div class="row">
                       <input type="number" bind:value={selectedElement.w} />
                       <input type="number" bind:value={selectedElement.h} />
                     </div>
                  </div>
                  <div class="prop-group">
                     <label>Color</label>
                     <input type="color" bind:value={selectedElement.style.backgroundColor} />
                  </div>
                {/if}
                {#if selectedElement.type === 'label'}
                   <div class="prop-group">
                     <label>Text</label>
                     <input type="text" bind:value={selectedElement.label} />
                   </div>
                {/if}
                <div class="prop-group">
                   <label>Font Size</label>
                   <input type="number" bind:value={selectedElement.style.fontSize} />
                </div>
                <div class="prop-group">
                   <label>Color</label>
                   <input type="color" bind:value={selectedElement.style.color} />
                </div>
             {:else}
                <p class="hint">Select an element to edit properties.</p>
             {/if}
          {:else if activeTab === 'style'}
             <CardStylePanel value={template.style} onChange={handleStyleChange} />
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<input type="file" hidden accept=".json" bind:this={fileInput} onchange={handleImport} />

<style>
  .template-editor-overlay {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(5px);
    z-index: 4000; /* Higher than manager */
    display: flex; align-items: center; justify-content: center;
  }
  .editor-window {
    width: 95vw; height: 90vh;
    background: var(--bg-page);
    border-radius: 12px;
    display: flex; flex-direction: column;
    overflow: hidden;
    pointer-events: auto;
  }
  .editor-header {
    height: 60px;
    background: var(--bg-panel);
    border-bottom: 1px solid var(--border-divider);
    display: flex; justify-content: space-between; align-items: center;
    padding: 0 1.5rem;
  }
  .header-left { display: flex; align-items: center; gap: 1rem; }
  .name-input { background: transparent; border: none; font-size: 1.1rem; color: var(--text-primary); border-bottom: 1px solid transparent; }
  .name-input:focus { outline: none; border-bottom-color: var(--accent-primary); }
  
  .header-right { display: flex; gap: 0.5rem; }
  .btn { padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; display: flex; gap: 0.5rem; }
  .btn :global(iconify-icon) { pointer-events: none; }
  
  .btn.primary { background: var(--accent-primary); color: white; }
  .btn.secondary { background: transparent; border: 1px solid var(--border-primary); color: var(--text-primary); }
  .btn.text { background: transparent; color: var(--text-primary); }

  .editor-body { flex: 1; display: flex; overflow: hidden; }
  
  /* Toolbar */
  .toolbar {
    width: 60px;
    background: var(--bg-panel);
    border-right: 1px solid var(--border-divider);
    display: flex; flex-direction: column; align-items: center; padding: 1rem 0; gap: 1rem;
  }
  .tool-btn {
    width: 40px; height: 40px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: 8px;
    font-size: 0.6rem; gap: 2px; cursor: pointer; color: var(--text-secondary);
  }
  .tool-btn:hover { background: var(--bg-card-hover); color: var(--text-primary); }
  .tool-btn iconify-icon { font-size: 1.2rem; pointer-events: none; }
  
  /* Canvas */
  .canvas-area {
    flex: 1;
    background: #e5e5e5; /* Neutral gray */
    display: flex; align-items: center; justify-content: center;
    background-image: radial-gradient(#ccc 1px, transparent 1px);
    background-size: 20px 20px;
    overflow: hidden;
  }
  .canvas-wrapper {
    /* Fixed simulation size for now */
    width: 320px; height: 180px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  }
  .card-canvas {
    width: 100%; height: 100%;
    position: relative;
    border-radius: 16px;
    background: white; /* Default */
    overflow: hidden;
    user-select: none;
    /* Simulate global theme defaults */
    border: 1px solid rgba(0,0,0,0.1);
  }
  
  .element-renderer {
    position: absolute;
    cursor: grab;
    display: flex; align-items: center;
    white-space: nowrap;
  }
  .element-renderer:active { cursor: grabbing; }
  .selection-outline {
    position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px;
    border: 2px solid var(--accent-primary);
    pointer-events: none;
  }
  
  /* Right Pane */
  .properties-pane {
    width: 300px;
    background: var(--bg-panel);
    border-left: 1px solid var(--border-divider);
    display: flex; flex-direction: column;
  }
  .tabs { display: flex; border-bottom: 1px solid var(--border-divider); }
  .tab { flex: 1; padding: 1rem; background: transparent; border: none; cursor: pointer; color: var(--text-secondary); }
  .tab.active { color: var(--accent-primary); border-bottom: 2px solid var(--accent-primary); }
  
  .props-content { padding: 1rem; flex: 1; overflow-y: auto; }
  .layers-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .layer-item {
    padding: 0.75rem; background: var(--bg-card); border-radius: 6px;
    display: flex; justify-content: space-between; align-items: center; cursor: pointer;
    border: 1px solid transparent;
  }
  .layer-item.active { border-color: var(--accent-primary); background: var(--bg-card-hover); }
  .del-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; display: flex; }
  .del-btn:hover { color: var(--accent-error); }
  .del-btn iconify-icon { pointer-events: none; }
  
  .prop-group { margin-bottom: 1rem; }
  .prop-group label { display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem; }
  .row { display: flex; gap: 0.5rem; }
  input { width: 100%; padding: 0.5rem; border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); border-radius: 4px; }
  .hint { color: var(--text-muted); text-align: center; margin-top: 2rem; }
</style>
