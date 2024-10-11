<script>
  // Import necessary Svelte functions and components
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { darkMode } from '../stores/darkMode.js';
  import { nodes } from '../stores/nodes.js';
  import Node from './Node.svelte';
  import MakeNode from './MakeNode.svelte';
  import DarkNode from './DarkNode.svelte';
  import TextNode from './TextNode.svelte';
  import CalculatorNode from './CalculatorNode.svelte';
  import ImageNode from './ImageNode.svelte';
  import TodoNode from './TodoNode.svelte';
  import { nodeFactoryWidth } from '../stores/nodeFactoryStore.js';

  // Create an event dispatcher
  const dispatch = createEventDispatcher();

  // Constants for initial node positions
  const TOP_MARGIN = 20;
  const LEFT_MARGIN = 30;

  // Function to get initial nodes
  function getInitialNodes() {
    return [
      { id: 'factory-2', component: MakeNode, props: { x: LEFT_MARGIN + 100, y: TOP_MARGIN, label: 'make.node', width: 180, height: 80 } },
      { id: 'factory-3', component: DarkNode, props: { x: LEFT_MARGIN, y: TOP_MARGIN, label: 'dark.node', width: 80, height: 80 } },
      { id: 'factory-1', component: Node, props: { x: LEFT_MARGIN + 320, y: TOP_MARGIN, label: 'basic.node', width: 80, height: 40 } },
      { id: 'factory-4', component: TextNode, props: { x: LEFT_MARGIN, y: TOP_MARGIN + 100, content: 'hello.world', title: 'text.node', width: 300, height: 150 } },
      { id: 'factory-5', component: ImageNode, props: { x: LEFT_MARGIN, y: TOP_MARGIN + 315, imageUrl: 'https://picsum.photos/200', title: 'image.node' } },
      { id: 'factory-6', component: CalculatorNode, props: { x: LEFT_MARGIN, y: TOP_MARGIN + 655 } },
      { id: 'factory-7', component: TodoNode, props: { x: LEFT_MARGIN, y: TOP_MARGIN + 820, title: 'todo.node', tasks: [] } }
    ];
  }

  // Initialize state variables
  let factoryNodes = getInitialNodes();
  let factoryBounds;
  let isPanning = false;
  let panY = 0;
  let startPanY = 0;
  let isDraggingNode = false;
  let draggedNodeId = null;
  let startX = 0;
  let startY = 0;

  // Handle canvas mouse down event for panning
  function handleCanvasMouseDown(event) {
    if (event.button === 1) {
      isPanning = true;
      startPanY = event.clientY - panY;
      event.preventDefault();
    }
  }

  // Handle node mouse down event for dragging
  function handleNodeMouseDown(event, id) {
    if (event.button === 1) {
      isDraggingNode = true;
      draggedNodeId = id;
      const node = factoryNodes.find(n => n.id === id);
      startX = event.clientX - node.props.x;
      startY = event.clientY - node.props.y;
      event.preventDefault();
      event.stopPropagation();
    }
  }

  // Handle window mouse move event for dragging and panning
  function handleWindowMouseMove(event) {
    if (isDraggingNode && draggedNodeId) {
      const newX = event.clientX - startX;
      const newY = event.clientY - startY;
      factoryNodes = factoryNodes.map(node =>
        node.id === draggedNodeId ? { ...node, props: { ...node.props, x: newX, y: newY } } : node
      );
    } else if (isPanning) {
      panY = event.clientY - startPanY;
    }
  }

  // Handle window mouse up event to stop dragging and panning
  function handleWindowMouseUp(event) {
    if (event.button === 1) {
      isDraggingNode = false;
      draggedNodeId = null;
      isPanning = false;
    }
  }

  // Add event listeners on mount
  onMount(() => {
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  });

  // Remove event listeners on destroy
  onDestroy(() => {
    window.removeEventListener('mousemove', handleWindowMouseMove);
    window.removeEventListener('mouseup', handleWindowMouseUp);
  });

  // Reset node positions to initial state
  function resetNodePositions() {
    factoryNodes = getInitialNodes();
    panY = 0;
  }

  // Handle drag start event for nodes
  function handleDragStart(event, node) {
    event.dataTransfer.setData('text/plain', JSON.stringify({
      type: node.component.name.toLowerCase().replace('proxy<', '').replace('>', ''),
      ...node.props
    }));
    event.dataTransfer.effectAllowed = 'copy';

    // Create a custom drag image
    const dragImage = event.target.cloneNode(true);
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.opacity = '1'; // Make it fully opaque
    document.body.appendChild(dragImage);

    // Set the custom drag image
    event.dataTransfer.setDragImage(dragImage, 0, 0);

    // Remove the custom drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  }

  // Clear local storage and reset states
  function clearLocalStorage() {
    localStorage.clear();
    nodes.set([]);
    darkMode.set(false);
    alert('Local storage cleared. Refresh the page to see the changes.');
  }
</script>

<!-- Main container for the node factory -->
<div class="node-factory-content" bind:this={factoryBounds}>
  <!-- Header section with title and buttons -->
  <div class="node-factory-header">
    <h2>node.factory</h2>
    <div class="header-buttons">
      <button on:click={clearLocalStorage} class="clear-storage-button" title="Clear local storage">
        <span class="material-icons">delete_sweep</span>
      </button>
      <button on:click={resetNodePositions} class="reset-button" title="Reset node positions">
        <span class="material-icons">restart_alt</span>
      </button>
    </div>
  </div>
  <!-- Canvas area for nodes -->
  <div class="factory-canvas"
       on:mousedown={handleCanvasMouseDown}
       on:mouseleave={handleWindowMouseUp}>
    <div class="nodes-container" style="transform: translateY({panY}px);">
      {#each factoryNodes as node (node.id)}
        <div class="factory-node"
             style="left: {node.props.x}px; top: {node.props.y}px;"
             on:mousedown={(e) => handleNodeMouseDown(e, node.id)}
             draggable="true"
             on:dragstart={(e) => handleDragStart(e, node)}>
          <svelte:component
            this={node.component}
            {...node.props}
            id={node.id}
            isFactoryNode={true}
            isNonFunctional={true}
          />
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  /* Styles for the main container */
  .node-factory-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* Styles for the header section */
  .node-factory-header {
    background-color: #3498db;
    color: white;
    margin: 0;
    padding: 10px;
    font-size: 18px;
    font-weight: normal;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.3s ease;
  }

  .header-buttons {
    display: flex;
    gap: 10px;
  }

  .reset-button,
  .clear-storage-button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Styles for the canvas area */
  .factory-canvas {
    flex-grow: 1;
    position: relative;
    overflow: hidden;
    background-color: #f0f0f0;
    transition: background-color 0.3s ease;
  }

  .nodes-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }

  .factory-node {
    position: absolute;
    pointer-events: auto;
  }

  /* Dark mode styles */
  :global(.dark-mode) .node-factory-header {
    background-color: #2980b9;
  }

  :global(.dark-mode) .factory-canvas {
    background-color: #1a1a1a;
  }

  :global(.factory-node *) {
    pointer-events: none;
  }
</style>