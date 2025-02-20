<script>
  // Import necessary Svelte functions and stores
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { darkMode } from "../stores/darkMode.js";
  import { panX, panY } from "../stores/panStore.js";
  import { selectedNodes } from "../stores/selectionStore.js";
  import { zoomLevel } from "../stores/zoomStore.js";
  import SearchBar from "./SearchBar.svelte";
  import HomeNode from "./HomeNode.svelte";

  // Exported props
  export let searchableNodes = [];
  export let canvasBackgroundColor = "#f0f0f0";
  export let nodes = Array.isArray(nodes) ? nodes : [];

  // Add home node to searchable nodes
  $: searchableNodes = [
    { id: "home-node", label: "home.node", x: 0, y: 0, isLocked: true },
    ...searchableNodes
  ];

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
  $: currentZoom = $zoomLevel;

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

  // Function to navigate to home position
  function navigateToHome() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const nodesContainer = document.querySelector(".nodes");
    nodesContainer.classList.add("searching");
    
    // Reset zoom first
    zoomLevel.set(1);
    
    // Then pan to center
    setTimeout(() => {
      panX.set(centerX);
      panY.set(centerY);
      drawGrid();
      updateNodesPosition();
      
      setTimeout(() => {
        nodesContainer.classList.remove("searching");
      }, 500);
    }, 0);
  }

  // Event handler for wheel events
  function handleWheel(event) {
    // Check if the target is a scrollable element
    if (event.target.closest('.scrollable')) {
      return; // Let default scroll behavior work
    }

    event.preventDefault();

    // Get cursor position relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate cursor position relative to the transformed space
    const pointX = (mouseX - currentPanX) / currentZoom;
    const pointY = (mouseY - currentPanY) / currentZoom;

    // Calculate new zoom level
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(0.1, currentZoom * delta), 3);

    // Calculate new pan position to keep the point under cursor
    const newPanX = mouseX - (pointX * newZoom);
    const newPanY = mouseY - (pointY * newZoom);

    // Update stores
    zoomLevel.set(newZoom);
    panX.set(newPanX);
    panY.set(newPanY);

    drawGrid();
    updateNodesPosition();
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
      nodesContainer.style.transform = `translate(${currentPanX}px, ${currentPanY}px) scale(${currentZoom})`;
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
    
    // Calculate position in the transformed space by dividing by zoom level
    const x = (event.clientX - rect.left - currentPanX) / currentZoom;
    const y = (event.clientY - rect.top - currentPanY) / currentZoom;
    
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
    const nodeFactoryWidth = document.querySelector(".node-factory")?.offsetWidth || 0;
    const centerX = (window.innerWidth - nodeFactoryWidth) / 2;
    const centerY = window.innerHeight / 2;
    
    const nodesContainer = document.querySelector(".nodes");
    nodesContainer.classList.add("searching");
    
    // Animate zoom first
    zoomLevel.set(1);
    
    // Then animate the pan
    setTimeout(() => {
      panX.set(centerX - x);
      panY.set(centerY - y);
      drawGrid();
      updateNodesPosition();
      
      // Remove the transition class after animation completes
      setTimeout(() => {
        nodesContainer.classList.remove("searching");
      }, 500);
    }, 0);
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
  on:wheel={handleWheel}
>
  <!-- Canvas element with bindings and event handlers -->
  <canvas
    bind:this={canvas}
    on:mousedown={handleMouseDown}
    on:contextmenu={handleCanvasContextMenu}
  ></canvas>

  <!-- Search area with search bar and home button -->
  <div class="search-area">
    <SearchBar {searchableNodes} on:select={handleNodeSelect} />
    <button 
      class="home-button" 
      on:click={navigateToHome}
      class:dark-mode={$darkMode}
    >
      <span class="material-icons">home</span>
    </button>
  </div>

  <!-- Nodes container with dynamic transform -->
  <div
    class="nodes"
    style="transform: translate({currentPanX}px, {currentPanY}px) scale({currentZoom});"
  >
    <HomeNode on:homeClick={navigateToHome} />
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

  /* Styles for search area and home button */
  .search-area {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .home-button {
    position: fixed;
    top: 20px;
    right: 140px;
    width: 40px;
    height: 40px;
    border-radius: 20px;
    border: none;
    background: white;
    color: #333;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .home-button:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }

  .home-button.dark-mode {
    background: #333;
    color: white;
    box-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
  }

  .home-button.dark-mode:hover {
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.15);
  }

  /* Styles for the nodes container */
  .nodes {
    position: absolute;
    top: 0;
    left: 0;
    will-change: transform;
    z-index: 1;
    transform-origin: 0 0;
  }

  :global(.nodes.searching) {
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Styles for dark mode */
  .dark-mode {
    background-color: #1a1a1a;
    color: #fff;
  }

  /* Style for scrollable elements within nodes */
  :global(.scrollable) {
    overflow-y: auto;
  }

  /* Material icons */
  .material-icons {
    font-size: 24px;
  }
</style>
