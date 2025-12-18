import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/extension.ts'),
      name: 'ContextBridge',
      fileName: () => 'extension.js',
      formats: ['es']
    },
    rollupOptions: {
      external: ['vscode'],
      output: {
        dir: 'dist',
        entryFileNames: 'extension.js',
      }
    },
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    target: 'ES2020'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
