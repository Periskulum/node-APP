<script>
  import { createEventDispatcher, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { darkMode } from '../stores/darkMode.js';

  export let searchableNodes = [];

  let searchTerm = '';
  let filteredNodes = [];
  let selectedIndex = -1;
  let isVisible = false;
  let searchResults;

  const dispatch = createEventDispatcher();

  $: {
    if (searchTerm) {
      filteredNodes = searchableNodes.filter(node =>
        node.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      isVisible = filteredNodes.length > 0;
    } else {
      filteredNodes = [];
      isVisible = false;
    }
    selectedIndex = -1;
  }

  function handleInput() {
    // Remove automatic selection when there's only one result
  }

  async function handleKeydown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectedIndex = (selectedIndex + 1) % filteredNodes.length;
      await tick();
      scrollSelectedIntoView();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      selectedIndex = (selectedIndex - 1 + filteredNodes.length) % filteredNodes.length;
      await tick();
      scrollSelectedIntoView();
    } else if (event.key === 'Enter') {
      if (selectedIndex !== -1) {
        selectNode(filteredNodes[selectedIndex]);
      } else if (filteredNodes.length === 1) {
        selectNode(filteredNodes[0]);
      }
    }
  }

  function scrollSelectedIntoView() {
    if (searchResults && selectedIndex !== -1) {
      const selectedElement = searchResults.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }

  function selectNode(node) {
    dispatch('select', { x: node.x, y: node.y });
    searchTerm = '';
    isVisible = false;
  }

  function getNodeLabel(node) {
    if (node.component && node.component.name) {
      const componentName = node.component.name.toLowerCase();
      if (componentName.includes('textnode')) {
        return `${node.label}.text`;
      } else if (componentName.includes('imagenode')) {
        return `${node.label}.image`;
      }
    }
    return node.label;
  }
</script>

<div class="search-container" class:dark-mode={$darkMode}>
  <input
    type="text"
    bind:value={searchTerm}
    on:input={handleInput}
    on:keydown={handleKeydown}
    placeholder="search.nodes"
  />
  {#if isVisible}
    <ul class="search-results" transition:fade={{ duration: 100 }} bind:this={searchResults}>
      {#each filteredNodes as node, index}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <li
          class:selected={index === selectedIndex}
          on:click={() => selectNode(node)}
        >
          {getNodeLabel(node)}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .search-container {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
  }

  input {
    width: 240px;
    padding: 10px 16px;
    border: none;
    border-radius: 20px;
    font-size: 14px;
    background-color: white;
    color: #333;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  input:focus {
    outline: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }

  .search-results {
    list-style-type: none;
    padding: 0;
    margin: 8px 0 0;
    background-color: white;
    border-radius: 8px;
    max-height: 200px;
    overflow-y: auto;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .search-results li {
    padding: 10px 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .search-results li:hover,
  .search-results li.selected {
    background-color: #f0f0f0;
  }

  .dark-mode input {
    background-color: #333;
    color: #fff;
    box-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
  }

  .dark-mode input:focus {
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.15);
  }

  .dark-mode .search-results {
    background-color: #333;
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
  }

  .dark-mode .search-results li:hover,
  .dark-mode .search-results li.selected {
    background-color: #444;
  }
</style>