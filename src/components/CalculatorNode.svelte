<script>
  // Import necessary functions and stores from Svelte and other modules
  import { createEventDispatcher } from "svelte";
  import { getNextZIndex } from "../stores/zIndex.js";
  import { darkMode } from "../stores/darkMode.js";
  import { selectedNodes } from "../stores/selectionStore.js";

  // Define component props with default values
  export let x = 0,
    y = 0,
    id,
    isSelected = false,
    isFactoryNode = false,
    isNonFunctional = false,
    color = "#9b59b6",
    label = "",
    isLocked = false;

  // Create an event dispatcher for custom events
  const dispatch = createEventDispatcher();
  let isDragging = false,
    startX,
    startY,
    zIndex = getNextZIndex(),
    result = 0,
    input = "";

  // Reactive statements to update component state based on store values
  $: isSelected = $selectedNodes.includes(id);
  $: isDarkMode = $darkMode;

  // Handle mouse down event to start dragging or dispatch node click event
  function handleMouseDown(event) {
    if (isNonFunctional || isFactoryNode || event.button !== 0) return;
    dispatch("nodeClick", { id, ctrlKey: event.ctrlKey || event.metaKey });
    if (!isLocked) startDragging(event);
    event.stopPropagation();
  }

  // Start dragging the node and set initial positions
  function startDragging(event) {
    isDragging = true;
    startX = event.clientX - x;
    startY = event.clientY - y;
    zIndex = getNextZIndex();
    dispatch("select");
    event.target.setPointerCapture(event.pointerId);
  }

  // Handle mouse move event to update node position
  function handleMouseMove(event) {
    if (isDragging) {
      x = event.clientX - startX;
      y = event.clientY - startY;
      dispatch("move", { id, x, y });
    }
  }

  // Handle mouse up event to stop dragging
  function handleMouseUp(event) {
    if (isDragging) {
      isDragging = false;
      event.target.releasePointerCapture(event.pointerId);
    }
  }

  // Calculate the result from the input expression
  function calculate() {
    try {
      result = eval(input);
    } catch {
      result = "Error";
    }
  }

  // Handle context menu event to dispatch custom context menu event
  function handleContextMenu(event) {
    event.preventDefault();
    dispatch("contextmenu", { id, x: event.clientX, y: event.clientY });
  }
</script>

<!-- Main component structure and bindings -->
<div
  class="calculator-node"
  role="group"
  class:dark-mode={isDarkMode}
  class:selected={isSelected}
  class:factory-node={isFactoryNode}
  class:non-functional={isNonFunctional}
  style="left: {isFactoryNode ? 0 : x}px; top: {isFactoryNode
    ? 0
    : y}px; z-index: {zIndex}; background-color: {color}; label:{label}"
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
  /* Styles for the calculator node component */
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
    transition:
      box-shadow 0.3s ease,
      transform 0.3s ease;
    width: 200px;
    word-wrap: break-word;
    font-size: large;
    background-color: #9b59b6;
  }

  /* Dark mode styles */
  .dark-mode {
    color: #eee;
  }

  /* Styles for selected state */
  .selected {
    box-shadow:
      0 0 0 3px #41e0f5,
      0 2px 10px rgba(0, 0, 0, 0.2);
  }

  /* Header styles */
  .header {
    font-weight: bold;
    margin-bottom: 8px;
  }

  /* Input and button styles */
  input,
  button {
    width: 100%;
    margin-bottom: 8px;
    border-radius: 5px;
    padding: 4px;
    border: none;
    box-sizing: border-box;
  }

  /* Button specific styles */
  button {
    background-color: #8e44ad;
    color: white;
    cursor: pointer;
  }

  /* Result display styles */
  .result {
    font-weight: bold;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    padding: 8px;
  }

  /* Styles for factory node */
  .factory-node {
    position: relative;
  }

  /* Styles for non-functional state */
  .non-functional {
    pointer-events: none;
  }

  /* Disabled input and button styles */
  input:disabled,
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
