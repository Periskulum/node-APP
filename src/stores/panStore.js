// src/stores/panStore.js

import { writable } from "svelte/store";

// Load initial pan positions from localStorage or use defaults
const storedPanX = localStorage.getItem('canvas_pan_x');
const storedPanY = localStorage.getItem('canvas_pan_y');
const initialPanX = storedPanX ? parseFloat(storedPanX) : 0;
const initialPanY = storedPanY ? parseFloat(storedPanY) : 0;

export const panX = writable(initialPanX);
export const panY = writable(initialPanY);

// Subscribe to changes and save to localStorage
panX.subscribe(value => {
  localStorage.setItem('canvas_pan_x', value.toString());
});

panY.subscribe(value => {
  localStorage.setItem('canvas_pan_y', value.toString());
});
