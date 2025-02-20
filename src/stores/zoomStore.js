// src/stores/zoomStore.js

import { writable } from 'svelte/store';

// Load initial zoom from localStorage or use default of 1
const storedZoom = localStorage.getItem('canvas_zoom');
const initialZoom = storedZoom ? parseFloat(storedZoom) : 1;

export const zoomLevel = writable(initialZoom);

// Subscribe to changes and save to localStorage
zoomLevel.subscribe(value => {
  localStorage.setItem('canvas_zoom', value.toString());
});
