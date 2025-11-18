import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tailwindcss from '@tailwindcss/postcss'

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
})