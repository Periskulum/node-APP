// nodeFactoryStore.js
// This file contains the Svelte store for managing the width of the node factory.

/**
 * Import the writable function from Svelte's store module.
 * The writable function is used to create a writable store.
 */
import { writable } from "svelte/store";

/**
 * Create a writable store named nodeFactoryWidth.
 * Initialize the store with a default value of 0.
 */
export const nodeFactoryWidth = writable(0);
