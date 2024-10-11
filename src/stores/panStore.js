// src/stores/panStore.js

// Import the writable function from Svelte's store module
import { writable } from "svelte/store";

// Create a writable store for the X coordinate of the pan
export const panX = writable(0);

// Create a writable store for the Y coordinate of the pan
export const panY = writable(0);
