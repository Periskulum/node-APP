// vite.config.js
// Configuration file for Vite with Svelte plugin

// Import the defineConfig function from Vite
import { defineConfig } from 'vite'

// Import the Svelte plugin for Vite
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Export the configuration object
export default defineConfig({
  // Register the Svelte plugin
  plugins: [svelte()],
})