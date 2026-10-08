import { resolve } from 'node:path'

import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: {
        studioAuthLifecycle: resolve(import.meta.dirname, 'studioAuthLifecycle.test.ts'),
        studioModel: resolve(import.meta.dirname, 'studioModel.test.ts'),
        studioNewInvitation: resolve(import.meta.dirname, 'studioNewInvitation.test.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.test.mjs`,
    },
    outDir: resolve(import.meta.dirname, '../node_modules/.tmp/studio-tests'),
  },
})
