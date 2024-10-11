<script>
  // Import necessary functions and stores from Svelte and other modules
  import { createEventDispatcher } from 'svelte';
  import { getNextZIndex } from '../stores/zIndex.js';
  import { darkMode } from '../stores/darkMode.js';
  import { selectedNodes } from '../stores/selectionStore.js';

  // Define component props
  export let x = 0;
  export let y = 0;
  export let imageUrl = '';
  export let title = 'image.node';
  export let isSelected = false;
  export let id;
  export let isFactoryNode = false;
  export let isNonFunctional = false;
  export let color = "";
  export let isLocked = false;

  // Create event dispatcher
  const dispatch = createEventDispatcher();

  // Local state variables
  let isDragging = false;
  let startX, startY;
  let zIndex = getNextZIndex();
  let isEditing = false;
  let isLoading = false;

  // Reactive statements
  $: isSelected = $selectedNodes.includes(id);
  $: isDarkMode = $darkMode;

  // Handle mouse down event for dragging
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
    if (!isEditing && event.target.closest('.image-node')) {
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
      dispatch('move', { id, x: newX, y: newY, imageUrl });
    }
  }

  // Handle mouse up event to stop dragging
  function handleMouseUp(event) {
    if (isDragging) {
      isDragging = false;
      event.target.releasePointerCapture(event.pointerId);
    }
  }

  // Toggle edit mode
  function toggleEdit() {
    if (isNonFunctional) return;
    isEditing = !isEditing;
    if (!isEditing) {
      dispatch('contentUpdate', { id, imageUrl, title });
    }
  }

  // Handle image load event
  function handleImageLoad() {
    isLoading = false;
  }

  // Handle image error event
  function handleImageError() {
    isLoading = false;
    // You might want to add error handling here, e.g., setting a default image
  }

  // Prevent default image drag behavior
  function preventImageDrag(event) {
    event.preventDefault();
  }

  // Reactive statement to set loading state when imageUrl changes
  $: {
    if (imageUrl) {
      isLoading = true;
    }
  }

  // Handle context menu event
  function handleContextMenu(event) {
    event.preventDefault();
    dispatch('contextmenu', { id, x: event.clientX, y: event.clientY });
  }
</script>

<!-- Main component structure -->
<div
  class="image-node"
  role="group"
  class:dark-mode={isDarkMode}
  class:selected={isSelected}
  class:factory-node={isFactoryNode}
  class:non-functional={isNonFunctional}
  style="left: {isFactoryNode ? 0 : x}px; top: {isFactoryNode ? 0 : y}px; z-index: {zIndex}; background-color: {color};"
  on:pointerdown|stopPropagation={handleMouseDown}
  on:pointermove={handleMouseMove}
  on:pointerup={handleMouseUp}
  on:pointercancel={handleMouseUp}
  on:contextmenu|stopPropagation={handleContextMenu}
>
  <!-- Header section with title and edit button -->
  <div class="header">
    <span>image.node</span>
    <button on:click={toggleEdit} disabled={isNonFunctional}>
      <span class="material-icons">
        {isEditing ? 'done' : 'edit'}
      </span>
    </button>
  </div>
  <!-- Title display -->
  <div class="title">{title}</div>
  <!-- Editable inputs for title and image URL -->
  {#if isEditing && !isNonFunctional}
    <input
      bind:value={title}
      placeholder="enter.title"
      class="title-input"
    />
    <input
      bind:value={imageUrl}
      placeholder="enter.image.url"
      class="url-input"
    />
  {/if}
  <!-- Image container with loading spinner and image element -->
  <div class="image-container">
    {#if isLoading}
      <div class="loading-spinner"></div>
    {/if}
    <img
      src={imageUrl}
      alt={title}
      on:load={handleImageLoad}
      on:error={handleImageError}
      style="display: {isLoading ? 'none' : 'block'};"
      on:dragstart={preventImageDrag}
    />
  </div>
</div>

<style>
  /* Main styles for the image node component */
  .image-node {
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
    transition: box-shadow 0.3s ease, transform 0.3s ease;
    width: 300px;
    height: 300px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* Dark mode styles */
  .dark-mode {
    background-color: #2980b9;
  }

  /* Selected state styles */
  .selected {
    box-shadow: 0 0 0 3px #41e0f5, 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .selected:hover {
    box-shadow: 0 0 0 3px #41e0f5, 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .image-node:hover {
    box-shadow: 0 0 0 3px #41e0f5, 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  /* Header styles */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  /* Title styles */
  .title {
    text-align: center;
    font-weight: bold;
  }

  /* Input styles */
  .title-input, .url-input {
    width: calc(100% - 16px);
    background-color: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 4px;
    color: white;
    padding: 4px 8px;
    font-size: 14px;
    margin-bottom: 8px;
  }

  /* Button styles */
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

  /* Image container styles */
  .image-container {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  /* Image styles */
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    padding: 8px;
    box-sizing: border-box;
    user-select: none;
    -webkit-user-drag: none;
  }

  /* Loading spinner styles */
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 4px solid #ffffff;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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