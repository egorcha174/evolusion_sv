import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default defineConfig({
  plugins: [sveltekit()],
  optimizeDeps: {
    include: [], // Remove iconify-svelte from here
  },
  build: {
    rollupOptions: {
      external: ['iconify-svelte'],
      plugins: [nodeResolve()],
    },
  },
  ssr: {
    noExternal: ['@dnd-kit/core', '@dnd-kit/dom', '@dnd-kit-svelte/svelte']
  },
});
