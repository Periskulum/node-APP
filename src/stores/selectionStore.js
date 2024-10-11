// src/stores/selectionStore.js

// Import the writable function from Svelte's store module
import { writable } from "svelte/store";

// Create a writable store to hold the selected nodes
// Initialize it with an empty array
export const selectedNodes = writable([]);
