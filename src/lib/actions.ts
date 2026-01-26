/**
 * Action to handle lazy loading of elements.
 * Dispatches 'enter' event when element enters viewport.
 */
export function lazyLoad(node: HTMLElement) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        node.dispatchEvent(new CustomEvent('enter'));
        observer.disconnect(); // Only load once
      }
    },
    {
      rootMargin: '100px', // Start loading slightly before it enters viewport
      threshold: 0,
    }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    },
  };
}
