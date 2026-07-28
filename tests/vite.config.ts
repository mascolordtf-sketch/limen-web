import { resolve } from 'node:path'

import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, 'studioModel.test.ts'),
      formats: ['es'],
      fileName: () => 'studioModel.test.mjs',
    },
    outDir: resolve(import.meta.dirname, '../node_modules/.tmp/studio-tests'),
  },
})
