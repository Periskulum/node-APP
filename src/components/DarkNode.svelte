<script>
  import { createEventDispatcher } from "svelte";
  import { darkMode } from "../stores/darkMode.js";
  import { getNextZIndex } from "../stores/zIndex.js";
  import { selectedNodes } from "../stores/selectionStore.js";
  import { zoomLevel } from "../stores/zoomStore.js";

  export let x = 0;
  export let y = 0;
  export let id;
  export let isSelected = false;
  export let isFactoryNode = false;
  export let isNonFunctional = false;
  export let label;
  export let height = "";
  export let width = "";
  export let color = "#2c3e50";
  export let isLocked = false;

  const dispatch = createEventDispatcher();

  let isDragging = false;
  let startX, startY;
  let zIndex = getNextZIndex();

  $: isSelected = $selectedNodes.includes(id);

  function toggleDarkMode() {
    if (!isNonFunctional) {
      darkMode.update((mode) => !mode);
    }
  }

  function handleMouseDown(event) {
    if (isNonFunctional || isFactoryNode) return;
    if (event.button === 0) {
      dispatch("nodeClick", { id, ctrlKey: event.ctrlKey || event.metaKey });
      if (!isLocked) {
        startDragging(event);
      }
      event.stopPropagation();
    }
  }

  function startDragging(event) {
    isDragging = true;
    startX = event.clientX - (x * $zoomLevel);
    startY = event.clientY - (y * $zoomLevel);
    zIndex = getNextZIndex();
    event.target.setPointerCapture(event.pointerId);
  }

  function handleMouseMove(event) {
    if (isDragging) {
      const newX = (event.clientX - startX) / $zoomLevel;
      const newY = (event.clientY - startY) / $zoomLevel;
      x = newX;
      y = newY;
      dispatch("move", { id, x: newX, y: newY });
    }
  }

  function handleMouseUp(event) {
    if (isDragging) {
      isDragging = false;
      event.target.releasePointerCapture(event.pointerId);
    }
  }

  function handleContextMenu(event) {
    event.preventDefault();
    dispatch("contextmenu", { id, x: event.clientX, y: event.clientY });
  }
</script>

<div
  class="dark-node"
  role="group"
  {label}
  class:selected={isSelected}
  class:factory-node={isFactoryNode}
  class:non-functional={isNonFunctional}
  style="left: {isFactoryNode ? 0 : x}px; top: {isFactoryNode
    ? 0
    : y}px; z-index: {zIndex}; background-color: {color}; width:{width}; height:{height};"
  on:pointerdown|stopPropagation={handleMouseDown}
  on:pointermove={handleMouseMove}
  on:pointerup={handleMouseUp}
  on:pointercancel={handleMouseUp}
  on:contextmenu|stopPropagation={handleContextMenu}
>
  <button on:click={toggleDarkMode} disabled={isNonFunctional}>
    <span class="material-icons">
      {$darkMode ? "light_mode" : "dark_mode"}
    </span>
  </button>
</div>

<style>
  .dark-node {
    position: absolute;
    background-color: #34495e;
    color: white;
    padding: 12px 12px;
    border-radius: 50px;
    cursor: move;
    user-select: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    touch-action: none;
    transition:
      box-shadow 0.3s ease,
      transform 0.3s ease;
    width: 60px;
    height: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .selected {
    box-shadow:
      0 0 0 3px #41e0f5,
      0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .dark-node:hover {
    box-shadow:
      0 0 0 3px #41e0f5,
      0 2px 10px rgba(0, 0, 0, 0.2);
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 50px;
    padding: 4px;
    cursor: pointer;
    width: 60px;
    height: 60px;
  }

  .material-icons {
    font-size: 18px;
  }

  .factory-node {
    position: relative;
  }

  .non-functional {
    pointer-events: none;
  }
</style>
