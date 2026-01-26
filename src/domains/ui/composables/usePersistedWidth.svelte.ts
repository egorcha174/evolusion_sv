import { browser } from '$app/environment';

// Declare $state rune locally to satisfy TypeScript if global types are missing
declare function $state<T>(value: T): T;

export function usePersistedWidth(storageKey: string, defaultWidth: number, min: number = 300, max: number = 600) {
  let width = $state(defaultWidth);
  let isResizing = $state(false);

  // Load from storage
  if (browser) {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const w = parseInt(stored, 10);
      if (!isNaN(w) && w >= min) {
        width = w;
      }
    }
  }

  function startResize(e: MouseEvent) {
    e.preventDefault();
    isResizing = true;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResize);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isResizing) return;
    
    let newWidth;
    // Check RTL
    if (document.dir === 'rtl') {
       // Assuming right-aligned drawer behavior for RTL usually means dragging left increases width
       // But context matters (sidebar vs drawer). 
       // For a right-side drawer:
       // RTL: Left <--- Right. Mouse X increases to the right.
       newWidth = e.clientX; 
    } else {
       // LTR, Right Drawer: Width = Window - MouseX
       // We need to know if it's a left or right panel. 
       // This helper assumes a Right-Side Drawer logic (like Settings).
       // If used for Left Sidebar, logic differs.
       // Let's make it generic enough or default to Right Drawer behavior as per usage.
       newWidth = window.innerWidth - e.clientX;
    }

    if (newWidth < min) newWidth = min;
    if (newWidth > max) newWidth = max;
    if (newWidth > window.innerWidth - 50) newWidth = window.innerWidth - 50;
    
    width = newWidth;
  }

  function stopResize() {
    if (isResizing) {
      isResizing = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (browser) localStorage.setItem(storageKey, width.toString());
    }
  }

  return {
    get width() { return width },
    get isResizing() { return isResizing },
    startResize
  };
}