import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': JSON.stringify({}),
  },
  build: {
    emptyOutDir: process.env.CLEAN_DIST === 'true',
    lib: {
      entry: resolve(__dirname, process.env.ENTRY || 'src/main.jsx'),
      name: process.env.LIB_NAME || 'DocsComponents',
      fileName: process.env.FILE_NAME || 'docs-components',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: false,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return (process.env.FILE_NAME || 'docs-components') + '.css'
          }
          return assetInfo.name
        },
      },
    },
    cssCodeSplit: false,
    minify: true,
  },
})
