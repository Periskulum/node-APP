<!-- src/components/Node.svelte -->
<!-- 
  Node Component
  - Imports necessary modules and stores
  - Defines props and reactive variables
  - Handles mouse events for dragging and context menu
  - Renders the node with dynamic styles and classes
-->

<script>
  import { createEventDispatcher } from 'svelte';
  import { darkMode } from '../stores/darkMode.js';
  import { getNextZIndex } from '../stores/zIndex.js';
  import { selectedNodes } from '../stores/selectionStore.js';

  // Props
  export let x = 0;
  export let y = 0;
  export let label = '';
  export let id;
  export let isSelected = false;
  export let isFactoryNode = false;
  export let isNonFunctional = false;
  export let height = '';
  export let width = '';
  export let color = '#3498db';
  export let isLocked = false;

  // Local state
  let isDragging = false;
  let startX, startY;
  let zIndex = getNextZIndex();

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Reactive statements
  $: isSelected = $selectedNodes.includes(id);
  $: isDarkMode = $darkMode;

  // Handle mouse down event
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

  // Start dragging the node
  function startDragging(event) {
    isDragging = true;
    startX = event.clientX - x;
    startY = event.clientY - y;
    zIndex = getNextZIndex();
    event.target.setPointerCapture(event.pointerId);
  }

  // Handle mouse move event
  function handleMouseMove(event) {
    if (isDragging) {
      const newX = event.clientX - startX;
      const newY = event.clientY - startY;
      x = newX;
      y = newY;
      dispatch('move', { id, x: newX, y: newY });
    }
  }

  // Handle mouse up event
  function handleMouseUp(event) {
    if (isDragging) {
      isDragging = false;
      event.target.releasePointerCapture(event.pointerId);
    }
  }

  // Handle context menu event
  function handleContextMenu(event) {
    event.preventDefault();
    dispatch('contextmenu', { id, x: event.clientX, y: event.clientY });
  }
</script>

<!-- Node element with dynamic styles and classes -->
<div
  class="node"
  role="group"
  class:dark-mode={isDarkMode}
  class:selected={isSelected}
  class:factory-node={isFactoryNode}
  class:non-functional={isNonFunctional}
  style="left: {isFactoryNode ? 0 : x}px; top: {isFactoryNode ? 0 : y}px; z-index: {zIndex}; background-color: {color}; width:{width}; height:{height};"
  on:pointerdown|stopPropagation={handleMouseDown}
  on:pointermove={handleMouseMove}
  on:pointerup={handleMouseUp}
  on:pointercancel={handleMouseUp}
  on:contextmenu|stopPropagation={handleContextMenu}
>
  {label}
</div>

<style>
  /* Node styles */
  .node {
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
    width: 80px;
    word-wrap: break-word;
    font-size: large;
  }

  /* Dark mode styles */
  .dark-mode {
    color: #eee;
  }

  /* Selected node styles */
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

  /* Hover styles */
  .node:hover {
    box-shadow: 0 0 0 3px #41e0f5, 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  /* Factory node styles */
  .factory-node {
    position: relative;
  }

  /* Non-functional node styles */
  .non-functional {
    pointer-events: none;
  }
</style>
