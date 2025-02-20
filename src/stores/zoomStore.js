// src/stores/zoomStore.js

import { writable } from 'svelte/store';

// Create a writable store for the zoom level, starting at 1 (100% zoom)
export const zoomLevel = writable(1);
