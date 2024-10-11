/**
 * Main entry point for the Svelte application.
 * 
 * - Import CSS styles
 * - Import the main Svelte component
 * - Initialize the Svelte application
 * - Export the app instance
 */

// Import CSS styles
import './app.css';

// Import the main Svelte component
import App from './App.svelte';

// Initialize the Svelte application
const app = new App({
  target: document.body, // Mount the app to the body element
});

// Export the app instance
export default app;