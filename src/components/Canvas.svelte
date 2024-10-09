<!-- src/components/Canvas.svelte -->
<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { darkMode } from '../stores/darkMode.js';
  import { panX, panY } from '../stores/panStore.js';
  import SearchBar from './SearchBar.svelte';

  export let searchableNodes = [];
  export let canvasBackgroundColor = '#f0f0f0';
  export let nodes = [];

  const dispatch = createEventDispatcher();

  let canvas;
  let ctx;
  let width;
  let height;
  let isPanning = false;
  let startPanX, startPanY;
  let isSelecting = false;
  let selectionStart = null;
  let selectionBox = null;

  $: isDarkMode = $darkMode;
  $: currentPanX = $panX;
  $: currentPanY = $panY;

  onMount(() => {
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    drawGrid();
  });

  onDestroy(() => {
    window.removeEventListener('resize', resizeCanvas);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  });

  $: if (canvasBackgroundColor) {
    drawGrid();
  }

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    drawGrid();
  }

  function drawGrid() {
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = canvasBackgroundColor;
    ctx.fillRect(0, 0, width, height);

    const dotSize = 2;
    const spacing = 20;
    const dotColor = isDarkMode
      ? 'rgba(255, 255, 255, 0.3)'
      : 'rgba(0, 0, 0, 0.3)';

    for (let x = currentPanX % spacing; x < width; x += spacing) {
      for (let y = currentPanY % spacing; y < height; y += spacing) {
        ctx.fillStyle = dotColor;
        ctx.fillRect(x, y, dotSize, dotSize);
      }
    }

    if (selectionBox) {
      drawSelectionBox();
    }
  }

  function drawSelectionBox() {
    const rect = canvas.getBoundingClientRect();
    const x1 = selectionBox.x1 - rect.left;
    const y1 = selectionBox.y1 - rect.top;
    const x2 = selectionBox.x2 - rect.left;
    const y2 = selectionBox.y2 - rect.top;

    ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      x1,
      y1,
      x2 - x1,
      y2 - y1
    );
    ctx.setLineDash([]);
  }

  function handleMouseDown(event) {
    if (event.button === 0) {
      isSelecting = true;
      selectionStart = { x: event.clientX, y: event.clientY };
      selectionBox = null;
      event.preventDefault();
    } else if (event.button === 1) {
      isPanning = true;
      startPanX = event.clientX - currentPanX;
      startPanY = event.clientY - currentPanY;
      event.preventDefault();
    }
  }

  function handleMouseMove(event) {
    if (isPanning) {
      panX.set(event.clientX - startPanX);
      panY.set(event.clientY - startPanY);
      drawGrid();
      updateNodesPosition();
    } else if (isSelecting) {
      const x = event.clientX;
      const y = event.clientY;

      selectionBox = {
        x1: Math.min(selectionStart.x, x),
        y1: Math.min(selectionStart.y, y),
        x2: Math.max(selectionStart.x, x),
        y2: Math.max(selectionStart.y, y),
      };

      drawGrid();
    }
  }

  function handleMouseUp(event) {
    if (isSelecting) {
      isSelecting = false;
      selectNodesInBox();
      selectionBox = null;
      drawGrid();
    }
    if (isPanning) {
      isPanning = false;
    }
  }

  function selectNodesInBox() {
    const rect = canvas.getBoundingClientRect();
    const boxX1 = selectionBox.x1 - rect.left - currentPanX;
    const boxY1 = selectionBox.y1 - rect.top - currentPanY;
    const boxX2 = selectionBox.x2 - rect.left - currentPanX;
    const boxY2 = selectionBox.y2 - rect.top - currentPanY;

    const selectedNodeIds = nodes
      .filter((node) => {
        const nodeX = node.props.x;
        const nodeY = node.props.y;
        const nodeWidth = parseInt(node.props.width) || 80;
        const nodeHeight = parseInt(node.props.height) || 50;

        return (
          nodeX + nodeWidth > boxX1 &&
          nodeX < boxX2 &&
          nodeY + nodeHeight > boxY1 &&
          nodeY < boxY2
        );
      })
      .map((node) => node.id);

    dispatch('boxSelect', { selectedNodeIds });
  }

  function updateNodesPosition() {
    const nodesContainer = document.querySelector('.nodes');
    if (nodesContainer) {
      nodesContainer.style.transform = `translate(${currentPanX}px, ${currentPanY}px)`;
    }
  }


  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }

  function handleDrop(event) {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData('text/plain'));
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - currentPanX;
    const y = event.clientY - rect.top - currentPanY;
    dispatch('createNode', { ...data, x, y });
  }

  function handleCanvasContextMenu(event) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - currentPanX;
    const y = event.clientY - rect.top - currentPanY;
    dispatch('canvasContextMenu', { x, y });
  }

  function handleCanvasClick() {
    dispatch('canvasClick');
  }

  function handleNodeSelect(event) {
    const { x, y } = event.detail;
    panX = width / 2 - x;
    panY = height / 2 - y;
    drawGrid();
    updateNodesPosition();
  }
  
</script>

<div
  class="canvas-container"
  class:dark-mode={isDarkMode}
  on:dragover|preventDefault={handleDragOver}
  on:drop|preventDefault={handleDrop}
>
  <canvas
    bind:this={canvas}
    on:mousedown={handleMouseDown}
    on:contextmenu={handleCanvasContextMenu}
  ></canvas>
  <SearchBar {searchableNodes} on:select={handleNodeSelect} />
  <div class="nodes" style="transform: translate({currentPanX}px, {currentPanY}px);">
    <slot></slot>
  </div>
</div>

<style>
  .canvas-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
  }

  .nodes {
    position: absolute;
    top: 0;
    left: 0;
    will-change: transform;
    z-index: 1;
  }

  .dark-mode {
    background-color: #1a1a1a;
    color: #fff;
  }
</style>
