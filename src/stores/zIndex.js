import { writable } from 'svelte/store';

export const highestZIndex = writable(1);

export function getNextZIndex() {
  let currentHighest;
  highestZIndex.update(n => {
    currentHighest = n + 1;
    return currentHighest;
  });
  return currentHighest;
}