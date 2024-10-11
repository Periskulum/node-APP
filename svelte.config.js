// svelte.config.js
// Configuration file for Svelte with Vite preprocessor

import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

// Export the configuration object
export default {
  // Preprocess configuration
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess(), // Using Vite preprocessor for Svelte
};
