import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    minify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@pkmn/dex/build/learnsets')) {
            return '@pkmn/dex/build/learnsets.min.js';
          }
          if (id.includes('node_modules/@pkmn/dex')) {
            return '@pkmn/dex';
          }
          if (id.includes('node_modules/@pkmn/sim')) {
            return '@pkmn/sim';
          }
          if (id.includes('node_modules/@pkmn/img')) {
            return '@pkmn/img';
          }
        },
      },
    },
  },

  base: "./",
})
