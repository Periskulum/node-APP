// zIndex.js
// This module manages the z-index values for a Svelte application using a writable store.
// It provides a writable store to keep track of the highest z-index and a function to get the next z-index value.

import { writable } from "svelte/store";

// Create a writable store to hold the highest z-index value, initialized to 1.
export const highestZIndex = writable(1);

/**
 * Function to get the next z-index value.
 * It increments the current highest z-index value by 1 and updates the store.
 * @returns {number} The next z-index value.
 */
export function getNextZIndex() {
  let currentHighest;
  // Update the highestZIndex store by incrementing its value by 1.
  highestZIndex.update((n) => {
    currentHighest = n + 1; // Calculate the next z-index value.
    return currentHighest; // Update the store with the new highest z-index value.
  });
  return currentHighest; // Return the new highest z-index value.
}
