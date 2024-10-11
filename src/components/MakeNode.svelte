<script>
  // Import necessary functions and stores from Svelte and other modules
  import { createEventDispatcher } from "svelte";
  import { getNextZIndex } from "../stores/zIndex.js";
  import { darkMode } from "../stores/darkMode.js";
  import { selectedNodes } from "../stores/selectionStore.js";

  // Define component props with default values
  export let x = 0;
  export let y = 0;
  export let id;
  export let isSelected = false;
  export let isFactoryNode = false;
  export let isNonFunctional = false;
  export let label;
  export let height = "";
  export let width = "";
  export let color = "";
  export let isLocked = false;

  // Local state variables
  let inputValue = "";
  const dispatch = createEventDispatcher();
  let isDragging = false;
  let startX, startY;
  let zIndex = getNextZIndex();

  // Reactive statements to update component state
  $: isSelected = $selectedNodes.includes(id);
  $: isDarkMode = $darkMode;

  // Function to handle form submission
  function handleSubmit() {
    if (!isNonFunctional && inputValue.trim()) {
      dispatch("createNode", {
        type: "node",
        label: inputValue.trim(),
        x: x + 200,
        y: y + 50,
      });
      inputValue = "";
    }
  }

  // Function to handle keydown events
  function handleKeydown(event) {
    if (!isNonFunctional && event.key === "Enter") {
      handleSubmit();
    }
  }

  // Function to handle mouse down events
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

  // Function to start dragging the node
  function startDragging(event) {
    isDragging = true;
    startX = event.clientX - x;
    startY = event.clientY - y;
    zIndex = getNextZIndex();
    dispatch("select");
    event.target.setPointerCapture(event.pointerId);
  }

  // Function to handle mouse move events
  function handleMouseMove(event) {
    if (isDragging) {
      const newX = event.clientX - startX;
      const newY = event.clientY - startY;
      x = newX;
      y = newY;
      dispatch("move", { id, x: newX, y: newY });
    }
  }

  // Function to handle mouse up events
  function handleMouseUp(event) {
    if (isDragging) {
      isDragging = false;
      event.target.releasePointerCapture(event.pointerId);
    }
  }

  // Function to handle context menu events
  function handleContextMenu(event) {
    event.preventDefault();
    dispatch("contextmenu", { id, x: event.clientX, y: event.clientY });
  }
</script>

<!-- Main component structure -->
<div
  class="make-node"
  role="group"
  class:dark-mode={isDarkMode}
  class:selected={isSelected}
  class:factory-node={isFactoryNode}
  class:non-functional={isNonFunctional}
  class:locked={isLocked}
  style="left: {isFactoryNode ? 0 : x}px; top: {isFactoryNode
    ? 0
    : y}px; z-index: {zIndex}; background-color: {color}; width:{width}; height:{height}; label:{label};"
  on:pointerdown|stopPropagation={handleMouseDown}
  on:pointermove={handleMouseMove}
  on:pointerup={handleMouseUp}
  on:pointercancel={handleMouseUp}
  on:contextmenu|stopPropagation={handleContextMenu}
>
  <span class="label">make.node</span>
  <div class="make-input-container">
    <input
      bind:value={inputValue}
      on:keydown={handleKeydown}
      placeholder="node.label"
      disabled={isNonFunctional}
    />
    <button class="add-btn" on:click={handleSubmit} disabled={isNonFunctional}>
      <span class="material-icons">add</span>
    </button>
  </div>
</div>

<style>
  /* Main node styling */
  .make-node {
    position: absolute;
    background-color: #2ecc71;
    color: white;
    padding: 12px;
    border-radius: 8px;
    cursor: move;
    user-select: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    touch-action: none;
    transition:
      box-shadow 0.3s ease,
      transform 0.3s ease;
    width: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Dark mode styling */
  .dark-mode {
    background-color: #27ae60;
  }

  /* Selected node styling */
  .selected {
    box-shadow:
      0 0 0 3px #41e0f5,
      0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .selected.dark-mode {
    box-shadow:
      0 0 0 3px #41e0f5,
      0 2px 10px rgba(0, 0, 0, 0.2);
  }

  /* Hover effect */
  .make-node:hover {
    box-shadow:
      0 0 0 3px #41e0f5,
      0 2px 10px rgba(0, 0, 0, 0.2);
  }

  /* Label styling */
  .label {
    margin-bottom: 8px;
  }

  /* Input container styling */
  .make-input-container {
    display: flex;
    width: 100%;
    box-sizing: border-box;
  }

  /* Input styling */
  input {
    flex-grow: 1;
    padding: 4px 8px;
    border: none;
    border-radius: 4px 0 0 4px;
    font-size: 14px;
    min-width: 0;
  }

  /* Add button styling */
  .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 14px;
    min-width: 32px;
    flex-shrink: 0;
  }

  /* Material icons styling */
  .material-icons {
    font-size: 18px;
  }

  /* Disabled input and button styling */
  input:disabled,
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Factory node styling */
  .factory-node {
    position: relative;
  }

  /* Non-functional node styling */
  .non-functional {
    pointer-events: none;
  }
</style>
