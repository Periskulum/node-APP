<script>
  import { onMount } from 'svelte';
  import Canvas from './components/Canvas.svelte';
  import Node from './components/Node.svelte';
  import MakeNode from './components/MakeNode.svelte';
  import DarkNode from './components/DarkNode.svelte';
  import TextNode from './components/TextNode.svelte';
  import ImageNode from './components/ImageNode.svelte';
  import CalculatorNode from './components/CalculatorNode.svelte';
  import TodoNode from './components/TodoNode.svelte';
  import { darkMode } from './stores/darkMode.js';
  import NodeFactory from './components/NodeFactory.svelte';
  import { nodes } from './stores/nodes.js';
  import ContextMenu from './components/ContextMenu.svelte';
  import Modal from './components/Modal.svelte';
  import { selectedNodes } from './stores/selectionStore.js';
  import { panX, panY } from './stores/panStore.js';
  import {
    lockNodes,
    unlockNodes,
    lockAllNodes,
    unlockAllNodes,
  } from './utils/NodeManager.js';
  import { handleNodeMove, handleNodeClick, handleCreateNode, handleContentUpdate } from './utils/nodeHandlers.js';
  import { handleNodeContextMenu, handleCanvasContextMenu, handleCanvasClick } from './utils/contextMenuHandlers.js';
  import { openModal, handleModalConfirm, handleModalCancel, editNodeLabel } from './utils/modalHandlers.js';

  let isNodeFactoryOpen = false;
  let nodeFactoryWidth = 0;
  let animationDuration = 300; // ms

  function toggleNodeFactory() {
    isNodeFactoryOpen = !isNodeFactoryOpen;
    nodeFactoryWidth = isNodeFactoryOpen ? 25 : 0;
  }

  // Initialize nextNodeId based on the current highest node ID
  let nextNodeId;
  $: {
    const nodeIds = $nodes.map((node) => node.id);
    nextNodeId = nodeIds.length > 0 ? Math.max(...nodeIds) + 1 : 1;
  }

  $: searchableNodes = $nodes.map((node) => ({
    id: node.id,
    label: node.props.label || node.props.title || `node.${node.id}`,
    x: node.props.x,
    y: node.props.y,
  }));

  function getNodeComponent(componentName) {
    switch (componentName) {
      case 'Node':
        return Node;
      case 'MakeNode':
        return MakeNode;
      case 'DarkNode':
        return DarkNode;
      case 'TextNode':
        return TextNode;
      case 'ImageNode':
        return ImageNode;
      case 'CalculatorNode':
        return CalculatorNode;
      case 'TodoNode':
        return TodoNode;
      default:
        return Node;
    }
  }

  // Modal state
  let isModalVisible = false;
  let modalTitle = '';
  let modalMessage = '';
  let modalPlaceholder = '';
  let modalConfirmText = 'Confirm';
  let modalInputValue = '';
  let modalNodeId = null;
  let modalAction = null;

  // Context menu handling
  let contextMenuOptions = [];
  let contextMenuPosition = { x: 0, y: 0 };
  let isContextMenuVisible = false;
  let contextMenuNodeId = null;
  let initialColor = '#3498db';
  let showColorPicker = false;
  let colorPickerContext = '';

  // Canvas background colors for light and dark modes
  let canvasBackgroundColorLight = '#f0f0f0';
  let canvasBackgroundColorDark = '#1a1a1a';

  // Initialize canvas background colors from localStorage
  if (typeof window !== 'undefined') {
    const savedCanvasColorLight = localStorage.getItem('canvasBackgroundColorLight');
    if (savedCanvasColorLight) {
      canvasBackgroundColorLight = savedCanvasColorLight;
    }
    const savedCanvasColorDark = localStorage.getItem('canvasBackgroundColorDark');
    if (savedCanvasColorDark) {
      canvasBackgroundColorDark = savedCanvasColorDark;
    }
  }

  function handleColorSelected(event) {
    const newColor = event.detail;

    if (colorPickerContext === 'canvas') {
      if ($darkMode) {
        canvasBackgroundColorDark = newColor;
        localStorage.setItem('canvasBackgroundColorDark', newColor);
      } else {
        canvasBackgroundColorLight = newColor;
        localStorage.setItem('canvasBackgroundColorLight', newColor);
      }
    } else if (colorPickerContext === 'multipleNodes') {
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

  let areNodesLocked = false;

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
          label: originalNode.props.label + '.copy',
        },
      };
      nodes.update((currentNodes) => [...currentNodes, duplicatedNode]);
    }
  }

  function handleContextMenuClose() {
    isContextMenuVisible = false;
    showColorPicker = false;
  }

  function handleUpdateColorPicker(event) {
    showColorPicker = event.detail;
  }

  function handleNodeContextMenuWrapper(event) {
    console.log('Node context menu triggered:', event.detail);
    const result = handleNodeContextMenu(event);
    console.log('Context menu result:', result);
    contextMenuPosition = result.contextMenuPosition;
    contextMenuOptions = result.contextMenuOptions;
    isContextMenuVisible = result.isContextMenuVisible;
    contextMenuNodeId = result.contextMenuNodeId;
    colorPickerContext = result.colorPickerContext;
    console.log('Context menu state after update:', { isContextMenuVisible, contextMenuOptions, contextMenuPosition });
  }
  
  function handleCanvasContextMenuWrapper(event) {
    console.log('Canvas context menu triggered:', event.detail);
    const result = handleCanvasContextMenu(event);
    console.log('Canvas context menu result:', result);
    contextMenuPosition = result.contextMenuPosition;
    contextMenuOptions = result.contextMenuOptions;
    isContextMenuVisible = result.isContextMenuVisible;
    contextMenuNodeId = result.contextMenuNodeId;
    colorPickerContext = result.colorPickerContext;
    console.log('Context menu state after update:', { isContextMenuVisible, contextMenuOptions, contextMenuPosition });
  }

  function handleCanvasClickWrapper() {
    console.log('Canvas click detected');
    handleContextMenuClose();
  }
</script>

<div class="app-container" class:dark-mode={$darkMode}>
  <div
    role="tab"
    tabindex="0"
    class="node-factory-tab"
    on:click={toggleNodeFactory}
    on:keydown={(e) => e.key === 'Enter' && toggleNodeFactory()} 
    style="transform: translateX({nodeFactoryWidth}vw); transition: transform {animationDuration}ms ease;"
  >
    node.factory
  </div>
  <div class="content-container">
    <div
      class="node-factory"
      style="width: {nodeFactoryWidth}vw; transition: width {animationDuration}ms ease;"
    >
      <NodeFactory on:createNode={handleCreateNode} />
    </div>
    <div
      class="separator"
      style="left: {nodeFactoryWidth}vw; transition: left {animationDuration}ms ease;"
    ></div>
    <div
      class="canvas-container"
      style="width: calc(100vw - {nodeFactoryWidth}vw); transition: width {animationDuration}ms ease;"
    >
      <Canvas
        {searchableNodes}
        {nodes}
        canvasBackgroundColor={$darkMode ? canvasBackgroundColorDark : canvasBackgroundColorLight}
        on:createNode={handleCreateNode}
        on:canvasClick={handleCanvasClickWrapper}
        on:canvasContextMenu={handleCanvasContextMenuWrapper}
      >
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

  {#if isModalVisible}
    <Modal
      title={modalTitle}
      message={modalMessage}
      placeholder={modalPlaceholder}
      confirmText={modalConfirmText}
      bind:inputValue={modalInputValue}
      on:confirm={(event) => Object.assign(this, handleModalConfirm(event, modalAction, modalNodeId))}
      on:cancel={() => Object.assign(this, handleModalCancel())}
    />
  {/if}

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
  /* Import Material Icons */
  @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

  .app-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .content-container {
    display: flex;
    width: 100vw;
    height: 100vh;
  }

  .node-factory-tab {
    position: fixed;
    top: 50%;
    left: 0;
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
    transition: background-color 0.3s ease, transform 0.3s ease;
  }

  .node-factory {
    background-color: #f0f0f0;
    overflow: hidden;
    border-right: 2px solid #3498db;
    transition: width 0.3s ease, background-color 0.3s ease;
    height: 100%;
  }

  .separator {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #3498db;
    transition: left 0.3s ease, background-color 0.3s ease;
  }

  .canvas-container {
    flex-grow: 1;
    height: 100%;
  }

  /* Dark mode styles */
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