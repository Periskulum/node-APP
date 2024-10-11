<script>
  // Import necessary functions and stores from Svelte and local files
  import { createEventDispatcher } from "svelte";
  import { getNextZIndex } from "../stores/zIndex.js";
  import { darkMode } from "../stores/darkMode.js";
  import { selectedNodes } from "../stores/selectionStore.js";

  // Exported props for the component
  export let x = 0;
  export let y = 0;
  export let content = "hello.world";
  export let title = "text.node";
  export let isSelected = false;
  export let id;
  export let isFactoryNode = false;
  export let isNonFunctional = false;
  export let height = "";
  export let width = "";
  export let color = "";
  export let isLocked = false;

  // Create an event dispatcher
  const dispatch = createEventDispatcher();

  // Local state variables
  let isDragging = false;
  let startX, startY;
  let zIndex = getNextZIndex();
  let isEditing = false;

  // Reactive statements
  $: isSelected = $selectedNodes.includes(id);
  $: isDarkMode = $darkMode;

  // Handle mouse down event for dragging and selection
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

  // Start dragging the node
  function startDragging(event) {
    if (!isEditing && event.target.closest(".text-node")) {
      isDragging = true;
      startX = event.clientX - x;
      startY = event.clientY - y;
      zIndex = getNextZIndex();
      event.target.setPointerCapture(event.pointerId);
    }
  }

  // Handle mouse move event for dragging
  function handleMouseMove(event) {
    if (isDragging) {
      const newX = event.clientX - startX;
      const newY = event.clientY - startY;
      x = newX;
      y = newY;
      dispatch("move", { id, x: newX, y: newY });
    }
  }

  // Handle mouse up event to stop dragging
  function handleMouseUp(event) {
    if (isDragging) {
      isDragging = false;
      event.target.releasePointerCapture(event.pointerId);
    }
  }

  // Toggle editing mode
  function toggleEdit() {
    if (isNonFunctional) return;
    isEditing = !isEditing;
    if (!isEditing) {
      dispatch("contentUpdate", { id, content, title });
    }
  }

  // Handle context menu event
  function handleContextMenu(event) {
    event.preventDefault();
    dispatch("contextmenu", { id, x: event.clientX, y: event.clientY });
  }
</script>

<!-- Main container for the text node -->
<div
  class="text-node"
  role="group"
  class:dark-mode={isDarkMode}
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
  <!-- Header section with title and edit button -->
  <div class="header">
    <span>text.node</span>
    <button on:click={toggleEdit} disabled={isNonFunctional}>
      <span class="material-icons">
        {isEditing ? "done" : "edit"}
      </span>
    </button>
  </div>

  <!-- Conditional rendering for editing mode -->
  {#if isEditing && !isNonFunctional}
    <input bind:value={title} placeholder="enter.title" class="title-input" />
    <textarea bind:value={content} placeholder="hello.world"></textarea>
  {:else}
    <h3>{title}</h3>
    <div class="content">{content}</div>
  {/if}
</div>

<style>
  /* Styles for the text node */
  .text-node {
    position: absolute;
    background-color: #3498db;
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
    width: 300px;
    min-height: 100px;
    max-height: none;
    overflow: visible;
  }

  /* Dark mode styles */
  .dark-mode {
    background-color: #2980b9;
  }

  /* Styles for selected state */
  .selected {
    box-shadow:
      0 0 0 3px #41e0f5,
      0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .selected:hover {
    box-shadow:
      0 0 0 3px #41e0f5,
      0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .text-node:hover {
    box-shadow:
      0 0 0 3px #41e0f5,
      0 2px 10px rgba(0, 0, 0, 0.2);
  }

  /* Header styles */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  h3 {
    margin: 0;
    text-align: center;
    margin-bottom: 8px;
  }

  /* Input styles */
  .title-input {
    width: calc(100% - 16px);
    background-color: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 4px;
    color: white;
    padding: 4px 8px;
    font-size: 16px;
    text-align: center;
    margin-bottom: 8px;
  }

  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .material-icons {
    font-size: 18px;
  }

  /* Textarea and content styles */
  textarea,
  .content {
    width: calc(100% - 16px);
    min-height: 100px;
    background-color: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 4px;
    color: white;
    padding: 8px;
    font-size: 14px;
    resize: vertical;
    margin: 0;
  }

  textarea {
    outline: none;
  }

  .content {
    white-space: pre-wrap;
    word-break: break-word;
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
