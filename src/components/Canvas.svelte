<script>
  // Import necessary Svelte functions and stores
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { darkMode } from "../stores/darkMode.js";
  import { panX, panY } from "../stores/panStore.js";
  import { selectedNodes } from "../stores/selectionStore.js";
  import SearchBar from "./SearchBar.svelte";

  // Exported props
  export let searchableNodes = [];
  export let canvasBackgroundColor = "#f0f0f0";
  export let nodes = Array.isArray(nodes) ? nodes : [];

  // Create event dispatcher
  const dispatch = createEventDispatcher();

  // Local variables
  let canvas;
  let ctx;
  let width;
  let height;
  let isPanning = false;
  let startPanX, startPanY;

  // Reactive statements for store values
  $: isDarkMode = $darkMode;
  $: currentPanX = $panX;
  $: currentPanY = $panY;

  // Lifecycle hooks
  onMount(() => {
    ctx = canvas.getContext("2d");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    drawGrid();
  });

  onDestroy(() => {
    window.removeEventListener("resize", resizeCanvas);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  });

  // Reactive statement to redraw grid when background color changes
  $: if (canvasBackgroundColor) {
    drawGrid();
  }

  // Function to resize the canvas
  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    drawGrid();
  }

  // Function to draw the grid on the canvas
  function drawGrid() {
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = canvasBackgroundColor;
    ctx.fillRect(0, 0, width, height);

    const dotSize = 2;
    const spacing = 20;
    const dotColor = isDarkMode
      ? "rgba(255, 255, 255, 0.3)"
      : "rgba(0, 0, 0, 0.3)";

    for (let x = currentPanX % spacing; x < width; x += spacing) {
      for (let y = currentPanY % spacing; y < height; y += spacing) {
        ctx.fillStyle = dotColor;
        ctx.fillRect(x, y, dotSize, dotSize);
      }
    }
  }

  // Event handler for mouse down
  function handleMouseDown(event) {
    if (event.button === 1) {
      isPanning = true;
      startPanX = event.clientX - currentPanX;
      startPanY = event.clientY - currentPanY;
      event.preventDefault();
    }
  }

  // Event handler for mouse move
  function handleMouseMove(event) {
    if (isPanning) {
      panX.set(event.clientX - startPanX);
      panY.set(event.clientY - startPanY);
      drawGrid();
      updateNodesPosition();
    }
  }

  // Event handler for mouse up
  function handleMouseUp(event) {
    if (isPanning) {
      isPanning = false;
    }
  }

  // Function to update the position of nodes
  function updateNodesPosition() {
    const nodesContainer = document.querySelector(".nodes");
    if (nodesContainer) {
      nodesContainer.style.transform = `translate(${currentPanX}px, ${currentPanY}px)`;
    }
  }

  // Event handler for drag over
  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  // Event handler for drop
  function handleDrop(event) {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData("text/plain"));
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - currentPanX;
    const y = event.clientY - rect.top - currentPanY;
    dispatch("createNode", { ...data, x, y });
  }

  // Event handler for context menu on canvas
  function handleCanvasContextMenu(event) {
    event.preventDefault();
    console.log("Canvas context menu triggered");
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    dispatch("canvasContextMenu", { x, y });
  }

  // Event handler for canvas click
  function handleCanvasClick(event) {
    console.log("Canvas clicked");
    // Only deselect if the click is directly on the canvas (not on a node)
    if (event.target === canvas) {
      selectedNodes.set([]);
      dispatch("canvasClick");
    }
  }

  // Event handler for node selection
  function handleNodeSelect(event) {
    const { x, y } = event.detail;
    const nodeFactoryWidth =
      document.querySelector(".node-factory")?.offsetWidth || 0;
    const centerX = (window.innerWidth - nodeFactoryWidth) / 2;
    const centerY = window.innerHeight / 2;
    panX.set(centerX - x);
    panY.set(centerY - y);
    drawGrid();
    updateNodesPosition();
  }
</script>

<!-- Canvas container with event handlers -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div
  class="canvas-container"
  class:dark-mode={isDarkMode}
  role="application"
  on:dragover|preventDefault={handleDragOver}
  on:drop|preventDefault={handleDrop}
  on:click={handleCanvasClick}
>
  <!-- Canvas element with bindings and event handlers -->
  <canvas
    bind:this={canvas}
    on:mousedown={handleMouseDown}
    on:contextmenu={handleCanvasContextMenu}
  ></canvas>
  <!-- Search bar component -->
  <SearchBar {searchableNodes} on:select={handleNodeSelect} />
  <!-- Nodes container with dynamic transform -->
  <div
    class="nodes"
    style="transform: translate({currentPanX}px, {currentPanY}px);"
  >
    <slot></slot>
  </div>
</div>

<style>
  /* Styles for the canvas container */
  .canvas-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  /* Styles for the canvas element */
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
  }

  /* Styles for the nodes container */
  .nodes {
    position: absolute;
    top: 0;
    left: 0;
    will-change: transform;
    z-index: 1;
  }

  /* Styles for dark mode */
  .dark-mode {
    background-color: #1a1a1a;
    color: #fff;
  }
</style>
