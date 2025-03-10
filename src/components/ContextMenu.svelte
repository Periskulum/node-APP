<script>
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { darkMode } from "../stores/darkMode.js";

  export let options = [];
  export let x = 0;
  export let y = 0;
  export let initialColor = "#3498db";
  export let showColorPicker = false;

  let menu;
  let selectedColor = initialColor;
  const dispatch = createEventDispatcher();

  import { selectedNodes } from "../stores/selectionStore.js";
  let selectedNodesLength = 0;

  $: selectedNodesLength = $selectedNodes.length;

  function handleOptionClick(event, option) {
    event.stopPropagation();
    console.log("Option clicked:", option.label);
    if (
      option.label.includes("change.color") ||
      option.label === "change.canvas.color"
    ) {
      dispatch("updateColorPicker", true);
    } else {
      dispatch("updateColorPicker", false);
      const result = option.action();
      if (result && result.isContextMenuVisible === false) {
        dispatch("close");
      }
    }
  }

  function handleClickOutside(event) {
    if (menu && !menu.contains(event.target)) {
      console.log("Click outside detected, closing context menu");
      dispatch("updateColorPicker", false);
      dispatch("close");
    }
  }

  onMount(() => {
    document.addEventListener("mousedown", handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener("mousedown", handleClickOutside);
  });

  function confirmColor(event) {
    event.stopPropagation();
    console.log("Color confirmed:", selectedColor);
    dispatch("colorSelected", selectedColor);
    dispatch("close");
  }
</script>

<div
  class="context-menu"
  class:dark-mode={$darkMode}
  bind:this={menu}
  style="left: {x}px; top: {y}px;"
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
  @import url("https://fonts.googleapis.com/icon?family=Material+Icons");

  .context-menu {
    display: flex;
    flex-direction: column;
    position: fixed;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    z-index: 10000;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    font-family: "Roboto", sans-serif;
    min-width: 150px;
    max-height: 200px;
    overflow-y: auto;
  }

  .context-menu.dark-mode {
    background-color: #333;
    border-color: #1a1a1a;
    color: white;
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
  }

  .context-menu-item {
    padding: 10px 16px;
    cursor: pointer;
    text-transform: lowercase;
    background: none;
    border: none;
    text-align: left;
    width: 100%;
    font-size: 14px;
    outline: none;
    overflow: hidden;
    transition: background-color 0.2s ease;
  }

  .dark-mode .context-menu-item {
    color: white;
  }

  .context-menu-item:hover {
    background-color: #f0f0f0;
  }

  .dark-mode .context-menu-item:hover {
    background-color: #444;
  }

  .color-picker-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 150px;
  }

  input[type="color"] {
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
</style>
