import { writable } from 'svelte/store';

const storedDarkMode = localStorage.getItem('darkMode');
const initialDarkMode = storedDarkMode ? JSON.parse(storedDarkMode) : false;

export const darkMode = writable(initialDarkMode);

darkMode.subscribe(value => {
  localStorage.setItem('darkMode', JSON.stringify(value));
});