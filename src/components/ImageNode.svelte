<script>
  import { createEventDispatcher } from 'svelte';
  import { getNextZIndex } from '../stores/zIndex.js';
  import { darkMode } from '../stores/darkMode.js';

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

  const dispatch = createEventDispatcher();

  let isDragging = false;
  let startX, startY;
  let zIndex = getNextZIndex();
  let isEditing = false;
  let isLoading = false;

  $: isDarkMode = $darkMode;

  function handleMouseDown(event) {
    if (isNonFunctional || isFactoryNode || isLocked) return;
    if (event.button === 0) { // Left mouse button for regular nodes
      startDragging(event);
    }
  }

  function startDragging(event) {
    if (!isEditing && event.target.closest('.image-node')) {
      isDragging = true;
      startX = event.clientX - x;
      startY = event.clientY - y;
      zIndex = getNextZIndex();
      dispatch('select');
      event.target.setPointerCapture(event.pointerId);
    }
  }

  function handleMouseMove(event) {
  if (isDragging) {
    const newX = event.clientX - startX;
    const newY = event.clientY - startY;
    x = newX;
    y = newY;
    dispatch('move', { id, x: newX, y: newY, imageUrl });
  }
}


  function handleMouseUp(event) {
    if (isDragging) {
      isDragging = false;
      event.target.releasePointerCapture(event.pointerId);
    }
  }

  function toggleEdit() {
    if (isNonFunctional) return;
    isEditing = !isEditing;
    if (!isEditing) {
      dispatch('contentUpdate', { id, imageUrl, title });
    }
  }

  function handleImageLoad() {
    isLoading = false;
  }

  function handleImageError() {
    isLoading = false;
    // You might want to add error handling here, e.g., setting a default image
  }

  function preventImageDrag(event) {
    event.preventDefault();
  }

  $: {
    if (imageUrl) {
      isLoading = true;
    }
  }

  function handleContextMenu(event) {
    event.preventDefault();
    dispatch('contextmenu', { id, x: event.clientX, y: event.clientY });
  }
</script>

<div
  class="image-node"
  role="group"
  class:dark-mode={isDarkMode}
  class:selected={isSelected}
  class:factory-node={isFactoryNode}
  class:non-functional={isNonFunctional}
  style="left: {isFactoryNode ? 0 : x}px; top: {isFactoryNode ? 0 : y}px; z-index: {zIndex}; background-color: {color};"
  on:pointerdown={handleMouseDown}
  on:pointermove={handleMouseMove}
  on:pointerup={handleMouseUp}
  on:pointercancel={handleMouseUp}
  on:contextmenu={handleContextMenu}
>
  <div class="header">
    <span>image.node</span>
    <button on:click={toggleEdit} disabled={isNonFunctional}>
      <span class="material-icons">
        {isEditing ? 'done' : 'edit'}
      </span>
    </button>
  </div>
  <div class="title">{title}</div>
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


  .dark-mode {
    background-color: #2980b9;
  }

  .selected {
    box-shadow: 0 0 0 3px #27ae60, 0 2px 10px rgba(0, 0, 0, 0.2);
    transform: scale(1.05);
  }

  .image-node:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .title {
    text-align: center;
    font-weight: bold;
  }

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

  .image-container {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    padding: 8px;
    box-sizing: border-box;
    user-select: none;
    -webkit-user-drag: none;
  }

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

  .factory-node {
    position: relative;
  }

  .non-functional {
    pointer-events: none;
  }
</style>