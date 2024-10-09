<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { darkMode } from '../stores/darkMode.js';
  import Node from './Node.svelte';
  import MakeNode from './MakeNode.svelte';
  import DarkNode from './DarkNode.svelte';
  import TextNode from './TextNode.svelte';
  import CalculatorNode from './CalculatorNode.svelte';
  import ImageNode from './ImageNode.svelte';
  import TodoNode from './TodoNode.svelte';

  const dispatch = createEventDispatcher();

  const TOP_MARGIN = 20; // Top margin for the first row of nodes
  const LEFT_MARGIN = 30; // Left margin for all nodes

  function getInitialNodes() {
    const makeNodeWidth = 180;
    const darkNodeWidth = 120;
    const basicNodeWidth = 80;
    const totalWidth = makeNodeWidth + darkNodeWidth + basicNodeWidth * 2;

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

  let factoryNodes = getInitialNodes();
  let factoryBounds;

  // Panning variables
  let isPanning = false;
  let panY = 0;
  let startPanY = 0;

  // Node dragging variables
  let isDraggingNode = false;
  let draggedNodeId = null;
  let startX = 0;
  let startY = 0;

  function handleCanvasMouseDown(event) {
    if (event.button === 1) { // Middle mouse button
      isPanning = true;
      startPanY = event.clientY - panY;
      event.preventDefault(); // Prevent default middle-click behavior
    }
  }

  function handleNodeMouseDown(event, id) {
    if (event.button === 1) { // Middle mouse button
      isDraggingNode = true;
      draggedNodeId = id;
      const node = factoryNodes.find(n => n.id === id);
      startX = event.clientX - node.props.x;
      startY = event.clientY - node.props.y;
      event.preventDefault();
      event.stopPropagation(); // Prevent event from triggering canvas panning
    }
  }

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

  function handleWindowMouseUp(event) {
    if (event.button === 1) {
      if (isDraggingNode) {
        isDraggingNode = false;
        draggedNodeId = null;
      }
      if (isPanning) {
        isPanning = false;
      }
    }
  }

  onMount(() => {
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  });

  onDestroy(() => {
    window.removeEventListener('mousemove', handleWindowMouseMove);
    window.removeEventListener('mouseup', handleWindowMouseUp);
  });

  function resetNodePositions() {
    factoryNodes = getInitialNodes();
    panY = 0;
  }

  function handleDragStart(event, node) {
    event.dataTransfer.setData('text/plain', JSON.stringify({
      type: node.component.name.toLowerCase().replace('proxy<', '').replace('>', ''),
      ...node.props
    }));
    event.dataTransfer.effectAllowed = 'copy';
  }
</script>

<div class="node-factory-content" bind:this={factoryBounds}>
  <div class="node-factory-header">
    <h2>node.factory</h2>
    <button on:click={resetNodePositions} class="reset-button">
      <span class="material-icons">restart_alt</span>
    </button>
  </div>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
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
  .node-factory-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

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

  .reset-button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

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
    transform: translateY();
  }

  .factory-node {
    position: absolute;
    pointer-events: auto;
  }

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
