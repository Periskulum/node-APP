// darkMode.js
// This module manages the dark mode state using Svelte's writable store and persists it in localStorage.

import { writable } from "svelte/store";

// Retrieve the stored dark mode preference from localStorage
const storedDarkMode = localStorage.getItem("darkMode");

// Parse the stored value or default to false if not set
const initialDarkMode = storedDarkMode ? JSON.parse(storedDarkMode) : false;

// Create a writable store with the initial dark mode value
export const darkMode = writable(initialDarkMode);

// Subscribe to changes in the dark mode store and update localStorage accordingly
darkMode.subscribe((value) => {
  localStorage.setItem("darkMode", JSON.stringify(value));
});
