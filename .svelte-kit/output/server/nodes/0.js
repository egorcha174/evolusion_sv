

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": true,
  "trailingSlash": "always"
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.mCrlaBCO.js","_app/immutable/chunks/CYiN1Ptg.js","_app/immutable/chunks/DrE23S9z.js","_app/immutable/chunks/d16_jLoQ.js","_app/immutable/chunks/DoxDpSa6.js","_app/immutable/chunks/-3n6O5sP.js","_app/immutable/chunks/Bx8OnE0S.js","_app/immutable/chunks/C1FmrZbK.js","_app/immutable/chunks/DJz4CdqN.js","_app/immutable/chunks/Dx6vUp0w.js","_app/immutable/chunks/onraWh8D.js","_app/immutable/chunks/lSMfcQqK.js","_app/immutable/chunks/BsUdYIhF.js"];
export const stylesheets = ["_app/immutable/assets/0.DPy9Q2Gs.css"];
export const fonts = [];
