<script>
  // Import necessary Svelte functions and components
  import { onMount } from "svelte";
  import Canvas from "./components/Canvas.svelte";
  import Node from "./components/Node.svelte";
  import MakeNode from "./components/MakeNode.svelte";
  import DarkNode from "./components/DarkNode.svelte";
  import TextNode from "./components/TextNode.svelte";
  import ImageNode from "./components/ImageNode.svelte";
  import CalculatorNode from "./components/CalculatorNode.svelte";
  import TodoNode from "./components/TodoNode.svelte";
  import BudgetNode from "./components/BudgetNode.svelte";
  import DebtNode from "./components/DebtNode.svelte";
  import { darkMode } from "./stores/darkMode.js";
  import NodeFactory from "./components/NodeFactory.svelte";
  import { nodes } from "./stores/nodes.js";
  import ContextMenu from "./components/ContextMenu.svelte";
  import { selectedNodes } from "./stores/selectionStore.js";
  import { panX, panY } from "./stores/panStore.js";
  import {
    lockNodes,
    unlockNodes,
    lockAllNodes,
    unlockAllNodes,
  } from "./utils/NodeManager.js";
  import {
    handleNodeMove,
    handleNodeClick,
    handleCreateNode,
    handleContentUpdate,
  } from "./utils/nodeHandlers.js";
  import {
    handleNodeContextMenu,
    handleCanvasContextMenu,
    handleCanvasClick,
  } from "./utils/contextMenuHandlers.js";
 
  import { nodeFactoryWidth } from "./stores/nodeFactoryStore.js";

  // State variables
  let isNodeFactoryOpen = false;
  let isDraggingTab = false;
  let startX;
  let tabElement;
  let dragThreshold = 5; // Pixels to move before considering it a drag
  let dragStartX;

  let lastNodeFactoryWidth = 25; // Default width

  // Function to toggle the node factory panel
  function toggleNodeFactory(event) {
    if (!isDraggingTab) {
      isNodeFactoryOpen = !isNodeFactoryOpen;
      if (isNodeFactoryOpen) {
        nodeFactoryWidth.set(lastNodeFactoryWidth);
      } else {
        lastNodeFactoryWidth = $nodeFactoryWidth;
        nodeFactoryWidth.set(0);
      }
    }
  }

  // Handle mouse down event on the tab
  function handleTabMouseDown(event) {
    if (event.button === 0) {
      // Left mouse button
      dragStartX = event.clientX;
      startX = event.clientX;
      event.preventDefault();
    }
  }

  // Handle mouse move event for dragging the tab
  function handleMouseMove(event) {
    if (event.buttons === 1) {
      // Left mouse button is pressed and over tab element
      const deltaX = event.clientX;
      if (
        !isDraggingTab &&
        Math.abs(deltaX) > dragThreshold &&
        event.target === tabElement
      ) {
        isDraggingTab = true;
      }
      if (isDraggingTab) {
        const newWidth = (event.clientX / window.innerWidth) * 100;
        nodeFactoryWidth.set(Math.max(10, Math.min(50, newWidth)));
      }
    }
  }

  // Handle mouse up event to stop dragging
  function handleMouseUp(event) {
    if (event.button === 0) {
      // Left mouse button
      if (!isDraggingTab && Math.abs(event.clientX - startX) <= dragThreshold) {
        toggleNodeFactory(event);
      }
      isDraggingTab = false;
    }
  }

  // Compute the next node ID
  let nextNodeId;
  $: {
    const nodeIds = $nodes.map((node) => node.id);
    nextNodeId = nodeIds.length > 0 ? Math.max(...nodeIds) + 1 : 1;
  }

  // Create a list of searchable nodes
  $: searchableNodes = $nodes.map((node) => ({
    id: node.id,
    label: node.props.label || node.props.title || `node.${node.id}`,
    x: node.props.x,
    y: node.props.y,
  }));

  // Function to get the appropriate node component
  function getNodeComponent(componentName) {
    switch (componentName) {
      case "Node":
        return Node;
      case "MakeNode":
        return MakeNode;
      case "DarkNode":
        return DarkNode;
      case "TextNode":
        return TextNode;
      case "ImageNode":
        return ImageNode;
      case "CalculatorNode":
        return CalculatorNode;
      case "TodoNode":
        return TodoNode;
      case "BudgetNode":
        return BudgetNode;
      case "DebtNode":
        return DebtNode;
      default:
        return Node;
    }
  }

  // Modal state variables
  let isModalVisible = false;
  let modalTitle = "";
  let modalMessage = "";
  let modalPlaceholder = "";
  let modalConfirmText = "Confirm";
  let modalInputValue = "";
  let modalNodeId = null;
  let modalAction = null;

  // Context menu state variables
  let contextMenuOptions = [];
  let contextMenuPosition = { x: 0, y: 0 };
  let isContextMenuVisible = false;
  let contextMenuNodeId = null;
  let initialColor = "#3498db";
  let showColorPicker = false;
  let colorPickerContext = "";

  // Canvas background colors
  let canvasBackgroundColorLight = "#f0f0f0";
  let canvasBackgroundColorDark = "#1a1a1a";

  // Load saved canvas colors from local storage
  if (typeof window !== "undefined") {
    const savedCanvasColorLight = localStorage.getItem(
      "canvasBackgroundColorLight"
    );
    if (savedCanvasColorLight) {
      canvasBackgroundColorLight = savedCanvasColorLight;
    }
    const savedCanvasColorDark = localStorage.getItem(
      "canvasBackgroundColorDark"
    );
    if (savedCanvasColorDark) {
      canvasBackgroundColorDark = savedCanvasColorDark;
    }
  }

  // Handle color selection from the color picker
  function handleColorSelected(event) {
    const newColor = event.detail;

    if (colorPickerContext === "canvas") {
      if ($darkMode) {
        canvasBackgroundColorDark = newColor;
        localStorage.setItem("canvasBackgroundColorDark", newColor);
      } else {
        canvasBackgroundColorLight = newColor;
        localStorage.setItem("canvasBackgroundColorLight", newColor);
      }
    } else if (colorPickerContext === "multipleNodes") {
      nodes.update((currentNodes) =>
        currentNodes.map((node) =>
          $selectedNodes.includes(node.id)
            ? { ...node, props: { ...node.props, color: newColor } }
            : node
        )
      );
    } else if (contextMenuNodeId !== null) {
      nodes.update((currentNodes) =>
        currentNodes.map((node) =>
          node.id === contextMenuNodeId
            ? { ...node, props: { ...node.props, color: newColor } }
            : node
        )
      );
    }
    isContextMenuVisible = false;
    showColorPicker = false;
  }

  // State variable to track if nodes are locked
  let areNodesLocked = false;

  // Function to duplicate a node
  function duplicateNode(originalId) {
    const originalNode = $nodes.find((node) => node.id === originalId);
    if (originalNode) {
      const id = nextNodeId++;
      const duplicatedNode = {
        ...originalNode,
        id,
        props: {
          ...originalNode.props,
          x: originalNode.props.x + 20,
          y: originalNode.props.y + 20,
          label: originalNode.props.label + ".copy",
        },
      };
      nodes.update((currentNodes) => [...currentNodes, duplicatedNode]);
    }
  }

  // Function to close the context menu
  function handleContextMenuClose() {
    isContextMenuVisible = false;
    showColorPicker = false;
  }

  // Handle update event for the color picker
  function handleUpdateColorPicker(event) {
    showColorPicker = event.detail;
  }

  // Wrapper function for handling node context menu
  function handleNodeContextMenuWrapper(event) {
    console.log("Node context menu triggered:", event.detail);
    const result = handleNodeContextMenu(event);
    console.log("Context menu result:", result);
    contextMenuPosition = result.contextMenuPosition;
    contextMenuOptions = result.contextMenuOptions;
    isContextMenuVisible = result.isContextMenuVisible;
    contextMenuNodeId = result.contextMenuNodeId;
    colorPickerContext = result.colorPickerContext;
    console.log("Context menu state after update:", {
      isContextMenuVisible,
      contextMenuOptions,
      contextMenuPosition,
    });
  }

  // Wrapper function for handling canvas context menu
  function handleCanvasContextMenuWrapper(event) {
    console.log("Canvas context menu triggered:", event.detail);
    const result = handleCanvasContextMenu(event);
    console.log("Canvas context menu result:", result);
    contextMenuPosition = result.contextMenuPosition;
    contextMenuOptions = result.contextMenuOptions;
    isContextMenuVisible = result.isContextMenuVisible;
    contextMenuNodeId = result.contextMenuNodeId;
    colorPickerContext = result.colorPickerContext;
    console.log("Context menu state after update:", {
      isContextMenuVisible,
      contextMenuOptions,
      contextMenuPosition,
    });
  }

  // Wrapper function for handling canvas click
  function handleCanvasClickWrapper() {
    console.log("Canvas click detected");
    handleContextMenuClose();
  }
</script>

<!-- HTML structure for the main application -->

<!-- Main application structure -->

<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

<div class="app-container" class:dark-mode={$darkMode}>
  <!-- Node factory tab for toggling the node factory panel -->
  <div
    bind:this={tabElement}
    role="tab"
    tabindex="0"
    class="node-factory-tab"
    class:open={isNodeFactoryOpen}
    class:dragging={isDraggingTab}
    on:mousedown={handleTabMouseDown}
    style="left: {$nodeFactoryWidth}vw;"
  >
    node.factory
  </div>

  <!-- Main content container -->
  <div class="content-container">
    <!-- Node factory panel -->
    <div class="node-factory" style="width: {$nodeFactoryWidth}vw;">
      <NodeFactory on:createNode={handleCreateNode} />
    </div>

    <!-- Separator between node factory and canvas -->
    <div class="separator" style="left: {$nodeFactoryWidth}vw;"></div>

    <!-- Canvas container for displaying nodes -->
    <div
      class="canvas-container"
      style="width: calc(100vw - {$nodeFactoryWidth}vw); left: {$nodeFactoryWidth}vw;"
    >
      <Canvas
        {searchableNodes}
        {nodes}
        canvasBackgroundColor={$darkMode
          ? canvasBackgroundColorDark
          : canvasBackgroundColorLight}
        on:createNode={handleCreateNode}
        on:canvasClick={handleCanvasClickWrapper}
        on:canvasContextMenu={handleCanvasContextMenuWrapper}
      >
        <!-- Render each node component -->
        {#each $nodes as node (node.id)}
          <svelte:component
            this={getNodeComponent(node.component)}
            {...node.props}
            id={node.id}
            on:move={handleNodeMove}
            on:createNode={handleCreateNode}
            on:contentUpdate={handleContentUpdate}
            on:contextmenu={handleNodeContextMenuWrapper}
            on:nodeClick={handleNodeClick}
          />
        {/each}
      </Canvas>
    </div>
  </div>


  <!-- Context menu for node and canvas interactions -->
  {#if isContextMenuVisible}
    <ContextMenu
      options={contextMenuOptions}
      x={contextMenuPosition.x}
      y={contextMenuPosition.y}
      {initialColor}
      {showColorPicker}
      on:close={handleContextMenuClose}
      on:updateColorPicker={handleUpdateColorPicker}
      on:colorSelected={handleColorSelected}
    />
  {/if}
</div>

<style>
  @import url("https://fonts.googleapis.com/icon?family=Material+Icons");

  /* Main application container */
  .app-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  /* Content container for node factory and canvas */
  .content-container {
    display: flex;
    width: 100vw;
    height: 100vh;
  }

  /* Node factory tab styling */
  .node-factory-tab {
    position: fixed;
    top: 50%;
    background-color: #3498db;
    color: white;
    padding: 10px 5px;
    cursor: pointer;
    border-radius: 0 5px 5px 0;
    z-index: 1000;
    transform-origin: left center;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-size: 14px;
    transition: left 0.1s ease-out;
  }

  /* Styling for open and dragging states of the node factory tab */
  .node-factory-tab.open {
    cursor: col-resize;
  }
  .node-factory-tab.dragging {
    pointer-events: none;
  }

  /* Node factory panel styling */
  .node-factory {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: #f0f0f0;
    overflow: hidden;
    border-right: 2px solid #3498db;
    transition: width 0.1s ease-out;
  }

  /* Separator styling */
  .separator {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #3498db;
    transition: left 0.1s ease-out;
  }

  /* Canvas container styling */
  .canvas-container {
    position: absolute;
    top: 0;
    height: 100%;
    transition:
      width 0.1s ease-out,
      left 0.1s ease-out;
  }

  /* Dark mode styling */
  .dark-mode .node-factory-tab {
    background-color: #2980b9;
  }
  .dark-mode .node-factory {
    background-color: #2c3e50;
    border-right-color: #2980b9;
  }
  .dark-mode .separator {
    background-color: #2980b9;
  }
</style>
