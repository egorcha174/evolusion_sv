

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.ONqVEzfD.js","_app/immutable/chunks/DYWGbwQD.js","_app/immutable/chunks/BWA2oz35.js","_app/immutable/chunks/pQbN8BSX.js"];
export const stylesheets = [];
export const fonts = [];
