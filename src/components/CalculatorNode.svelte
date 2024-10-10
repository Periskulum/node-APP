<script>
  import { createEventDispatcher } from 'svelte';
  import { getNextZIndex } from '../stores/zIndex.js';
  import { darkMode } from '../stores/darkMode.js';
  import { selectedNodes } from '../stores/selectionStore.js';

  export let x = 0;
  export let y = 0;
  export let id;
  export let isSelected = false;
  export let isFactoryNode = false;
  export let isNonFunctional = false;
  export let color = "";
  export let label = "";
  export let isLocked = false;

  const dispatch = createEventDispatcher();

  let isDragging = false;
  let startX, startY;
  let zIndex = getNextZIndex();
  let result = 0;
  let input = '';

  $: isSelected = $selectedNodes.includes(id);
  $: isDarkMode = $darkMode;

  function handleMouseDown(event) {
    if (isNonFunctional || isFactoryNode) return;
    if (event.button === 0) {
      dispatch('nodeClick', { id, ctrlKey: event.ctrlKey || event.metaKey });
      if (!isLocked) {
        startDragging(event);
      }
      event.stopPropagation();
    }
  }

  function startDragging(event) {
    isDragging = true;
    startX = event.clientX - x;
    startY = event.clientY - y;
    zIndex = getNextZIndex();
    dispatch('select');
    event.target.setPointerCapture(event.pointerId);
  }

  function handleMouseMove(event) {
    if (isDragging) {
      const newX = event.clientX - startX;
      const newY = event.clientY - startY;
      x = newX;
      y = newY;
      dispatch('move', { id, x: newX, y: newY });
    }
  }

  function handleMouseUp(event) {
    if (isDragging) {
      isDragging = false;
      event.target.releasePointerCapture(event.pointerId);
    }
  }

  function calculate() {
    try {
      result = eval(input);
    } catch (error) {
      result = 'Error';
    }
  }

  function handleContextMenu(event) {
    event.preventDefault();
    dispatch('contextmenu', { id, x: event.clientX, y: event.clientY });
  }
</script>

<div
  class="calculator-node"
  role="group"
  class:dark-mode={isDarkMode}
  class:selected={isSelected}
  class:factory-node={isFactoryNode}
  class:non-functional={isNonFunctional}
  style="left: {isFactoryNode ? 0 : x}px; top: {isFactoryNode ? 0 : y}px; z-index: {zIndex}; background-color: {color}; label:{label}"
  on:pointerdown|stopPropagation={handleMouseDown}
  on:pointermove={handleMouseMove}
  on:pointerup={handleMouseUp}
  on:pointercancel={handleMouseUp}
  on:contextmenu|stopPropagation={handleContextMenu}
>
  <div class="header">calc.node</div>
  <input
    type="text"
    bind:value={input}
    placeholder="enter.calculation"
    disabled={isNonFunctional}
  />
  <button on:click={calculate} disabled={isNonFunctional}>Calculate</button>
  <div class="result">{result}</div>
</div>

<style>
  .calculator-node {
    position: absolute;
    color: white;
    padding: 12px;
    border-radius: 8px;
    cursor: move;
    user-select: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    touch-action: none;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
    width: 200px;
    word-wrap: break-word;
    font-size: large;
  }

  .dark-mode {
    color: #eee;
  }

  .selected.dark-mode {
    box-shadow: 0 0 0 3px #41e0f5, 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .selected.dark-mode:hover {
    box-shadow: 0 0 0 3px #41e0f5, 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .selected {
    box-shadow: 0 0 0 3px #41e0f5, 0 2px 10px rgba(0, 0, 0, 0.2);
    box-shadow: inset;
  }

  .calculator-node:hover {
    box-shadow: 0 0 0 3px #41e0f5, 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .header {
    font-weight: bold;
    margin-bottom: 8px;
  }

  input {
    width: 100%;
    margin-bottom: 8px;
    border-radius: 5px;
    padding: 4px;
    border-style: solid;
    border-width: 3px;
    box-sizing: border-box;
  }

  button {
    width: 100%;
    padding: 4px;
    margin-bottom: 8px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .result {
    font-weight: bold;
    background-color: black;
    border-radius: 6px;
    padding: 8px;
  }

  .factory-node {
    position: relative;
  }

  .non-functional {
    pointer-events: none;
  }

  input:disabled, button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>