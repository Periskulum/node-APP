<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { darkMode } from '../stores/darkMode.js';

  export let options = [];
  export let x = 0;
  export let y = 0;
  export let initialColor = '#3498db';
  export let showColorPicker = false;

  let menu;
  let selectedColor = initialColor;
  const dispatch = createEventDispatcher();

  import { selectedNodes } from '../stores/selectionStore.js';
  let selectedNodesLength = 0;

  $: selectedNodesLength = $selectedNodes.length;

  function handleOptionClick(event, option) {
    event.stopPropagation(); // Prevent event from bubbling up
    console.log('Option clicked:', option.label); // Debug log
    if (option.label === 'change.color' || option.label === 'change.canvas.color') {
      showColorPicker = true;
    } else {
      showColorPicker = false;
      option.action();
      if (selectedNodesLength <= 1) {
        dispatch('close');
        showColorPicker = false;
      }
    }
  }

  function handleClickOutside(event) {
    if (menu && !menu.contains(event.target)) {
      console.log('Click outside detected, closing context menu'); // Debug log
      showColorPicker = false; // Hide the color picker if it was open
      dispatch('close');
    }
  }

  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener('mousedown', handleClickOutside);
  });

  function confirmColor(event) {
    event.stopPropagation(); // Prevent event from bubbling up
    console.log('Color confirmed:', selectedColor); // Debug log
    dispatch('colorSelected', selectedColor);
    dispatch('close');
  }
</script>

<div
  class="context-menu"
  class:dark-mode={$darkMode}
  bind:this={menu}
  style="left: {x}px; top: {y}px;"
  on:click|stopPropagation
  role="menu"
  tabindex="0"
>
  {#if !showColorPicker}
    {#each options as option}
      <button
        type="button"
        class="context-menu-item"
        on:click={(event) => handleOptionClick(event, option)}
      >
        {option.label}
      </button>
    {/each}
  {:else}
    <div class="context-menu-item color-picker-container" role="group">
      <input type="color" bind:value={selectedColor} />
      <button
        type="button"
        class="confirm-button"
        on:click={(event) => confirmColor(event)}
      >
        <span class="material-icons">check_circle</span>
      </button>
    </div>
  {/if}
</div>

<style>
  /* Import Material Icons */
  @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

  .context-menu {
    display: flex;
    flex-direction: column;
    position: absolute;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    z-index: 10000;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    font-family: 'Roboto', sans-serif;
    min-width: 150px;
  }

  .context-menu.dark-mode {
    background-color: #2c3e50;
    border-color: #1a1a1a;
    color: white;
  }

  .context-menu-item {
    padding: 8px 10px;
    cursor: pointer;
    text-transform: lowercase;
    background: none;
    border: none;
    text-align: left;
    width: 100%;
    font-size: 16px;
    outline: none;
    overflow: hidden;
  }

  .dark-mode .context-menu-item {
    color: white;
  }

  .context-menu-item:hover {
    background-color: #f0f0f0;
  }

  .dark-mode .context-menu-item:hover {
    background-color: #34495e;
  }

  .color-picker-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 150px;
  }

  input[type='color'] {
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
    width: 100%;
    height: 36px;
  }

  .confirm-button {
    background: none;
    border: none;
    cursor: pointer;
    color: #27ae60;
    padding: 0 8px;
    display: flex;
    align-items: center;
  }

  .material-icons {
    font-size: 24px;
  }

  /* Ensure the context menu doesn't overflow the viewport */
  .context-menu {
    max-width: calc(100vw - 20px);
    max-height: calc(100vh - 20px);
    overflow: auto;
  }
</style>
