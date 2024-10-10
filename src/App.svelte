<!-- src/App.svelte -->
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

  let isNodeFactoryOpen = false;
  let nodeFactoryWidth = 0;
  let animationDuration = 300; // ms

  function toggleNodeFactory() {
    isNodeFactoryOpen = !isNodeFactoryOpen;
    nodeFactoryWidth = isNodeFactoryOpen ? 25 : 0;
  }

  function handleNodeMove(event) {
    const { id, x, y } = event.detail;
    nodes.update((currentNodes) =>
      currentNodes.map((node) =>
        node.id === id ? { ...node, props: { ...node.props, x, y } } : node
      )
    );
  }

  function handleNodeClick(event) {
    const { id, ctrlKey } = event.detail;
    selectedNodes.update((currentSelection) => {
      if (ctrlKey) {
        if (currentSelection.includes(id)) {
          return currentSelection.filter((nodeId) => nodeId !== id);
        } else {
          return [...currentSelection, id];
        }
      } else {
        return [id];
      }
    });
  }

  // Initialize nextNodeId based on the current highest node ID
  let nextNodeId;
  $: {
    const nodeIds = $nodes.map((node) => node.id);
    nextNodeId = nodeIds.length > 0 ? Math.max(...nodeIds) + 1 : 1;
  }

  function handleCreateNode(event) {
    const { type, x, y, ...props } = event.detail;
    const newNode = createNewNode(type, x, y, props);
    if (newNode) {
      nodes.update((currentNodes) => [...currentNodes, newNode]);
    }
  }

  function createNewNode(type, x, y, props) {
    const id = nextNodeId++;
    const baseProps = {
      x,
      y,
      isLocked: areNodesLocked,
      ...props,
    };
    switch (type.toLowerCase()) {
      case 'node':
        return {
          id,
          component: 'Node',
          props: {
            label: props.label || `node.${id}`,
            color: props.color || '#3498db',
            ...baseProps,
          },
        };
      case 'makenode':
        return {
          id,
          component: 'MakeNode',
          props: {
            label: props.label || 'make.node',
            ...baseProps,
          },
        };
      case 'darknode':
        return {
          id,
          component: 'DarkNode',
          props: {
            label: props.label || 'dark.node',
            color: props.color || '#2c3e50',
            ...baseProps,
          },
        };
      case 'textnode':
        return {
          id,
          component: 'TextNode',
          props: {
            content: props.content || 'hello.world',
            title: props.title || 'text.node',
            color: props.color || '#3498db',
            ...baseProps,
          },
        };
      case 'imagenode':
        return {
          id,
          component: 'ImageNode',
          props: {
            imageUrl: 'https://picsum.photos/300/400',
            title: 'image.node',
            color: props.color || '#3498db',
            ...baseProps,
          },
        };
      case 'calculatornode':
        return {
          id,
          component: 'CalculatorNode',
          props: {
            label: 'calc.node',
            color: props.color || '#3498db',
            ...baseProps,
          },
        };
      case 'todonode':
        return {
          id,
          component: 'TodoNode',
          props: {
            label: 'todo.node',
            color: props.color || '#3498db',
            ...baseProps,
          },
        };
      default:
        console.log('Unknown node type:', type);
        return null;
    }
  }

  function handleContentUpdate(event) {
    const { id, ...updatedProps } = event.detail;
    nodes.update((currentNodes) =>
      currentNodes.map((node) =>
        node.id === id
          ? { ...node, props: { ...node.props, ...updatedProps } }
          : node
      )
    );
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

  function openModal({ title, message, placeholder, confirmText, inputValue, nodeId, action }) {
    modalTitle = title;
    modalMessage = message;
    modalPlaceholder = placeholder;
    modalConfirmText = confirmText || 'Confirm';
    modalInputValue = inputValue || '';
    modalNodeId = nodeId;
    modalAction = action;
    isModalVisible = true;
  }

  function handleModalConfirm(event) {
    const value = event.detail;
    if (modalAction && (modalNodeId !== null || modalNodeId === null)) {
      modalAction(modalNodeId, value);
    }
    isModalVisible = false;
  }

  function handleModalCancel() {
    isModalVisible = false;
  }

  // Context menu handling
  let contextMenuOptions = [];
  let contextMenuPosition = { x: 0, y: 0 };
  let isContextMenuVisible = false;
  let contextMenuNodeId = null;
  let initialColor = '#3498db';
  let showColorPicker = false;
  let colorPickerContext = '';


  function handleNodeContextMenu(event) {
    event.stopPropagation();
    const { id, x, y } = event.detail;
    const isNodeSelected = $selectedNodes.includes(id);

    if (!isNodeSelected) {
      selectedNodes.set([id]);
    }

    contextMenuPosition = { x, y };
    isContextMenuVisible = true;

    if ($selectedNodes.length > 1) {
      contextMenuNodeId = null;
      colorPickerContext = 'multipleNodes';

      contextMenuOptions = [
        {
          label: `change.color.for.${$selectedNodes.length}.nodes`,
          action: () => {
            showColorPicker = true;
          },
        },
        {
          label: `lock.${$selectedNodes.length}.nodes`,
          action: () => {
            lockNodes(nodes, $selectedNodes);
            isContextMenuVisible = false;
          },
        },
        {
          label: `unlock.${$selectedNodes.length}.nodes`,
          action: () => {
            unlockNodes(nodes, $selectedNodes);
            isContextMenuVisible = false;
          },
        },
        {
          label: `delete.${$selectedNodes.length}.nodes`,
          action: () => {
            nodes.update((currentNodes) =>
              currentNodes.filter((node) => !$selectedNodes.includes(node.id))
            );
            isContextMenuVisible = false;
          },
        },
      ];
    } else {
      contextMenuNodeId = id;
      colorPickerContext = 'node';

      const node = $nodes.find((n) => n.id === id);
      initialColor = node.props.color || '#3498db';

      contextMenuOptions = [
        {
          label: 'duplicate.node',
          action: () => {
            duplicateNode(id);
            isContextMenuVisible = false;
          },
        },
        {
          label: 'change.color',
          action: () => {
            showColorPicker = true;
          },
        },
        {
          label: 'edit.node',
          action: () => {
            editNodeLabel(id);
            isContextMenuVisible = false;
          },
        },
        {
          label: 'delete.node',
          action: () => {
            nodes.update((currentNodes) => currentNodes.filter((node) => node.id !== id));
            isContextMenuVisible = false;
          },
        },
        ...(node.props.isLocked
          ? [{
              label: 'unlock.node',
              action: () => {
                unlockNodes(nodes, [id]);
                isContextMenuVisible = false;
              },
            }]
          : [{
              label: 'lock.node',
              action: () => {
                lockNodes(nodes, [id]);
                isContextMenuVisible = false;
              },
            }]
        ),
      ];
    }
  }

  function handleCanvasContextMenu(event) {
    event.stopPropagation();
    const { x, y } = event.detail;
    contextMenuPosition = { x, y };
    isContextMenuVisible = true;
    contextMenuNodeId = null;
    colorPickerContext = 'canvas';

    selectedNodes.set([]); // Clear selection when right-clicking on canvas

    contextMenuOptions = [
      {
        label: 'add.node',
        action: () => {
          createNodeAtPosition(x, y);
          isContextMenuVisible = false;
        },
      },
      {
        label: 'change.canvas.color',
        action: () => {
          showColorPicker = true;
        },
      },
      {
        label: 'lock.all.nodes',
        action: () => {
          lockAllNodes(nodes);
          isContextMenuVisible = false;
        },
      },
      {
        label: 'unlock.all.nodes',
        action: () => {
          unlockAllNodes(nodes);
          isContextMenuVisible = false;
        },
      },
    ];
  }

  function createNodeAtPosition(x, y) {
    const defaultNodeType = 'Node';
    handleCreateNode({ detail: { type: defaultNodeType, x, y } });
    isContextMenuVisible = false;
  }

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

  function editNodeLabel(id) {
    const node = $nodes.find((n) => n.id === id);
    openModal({
      title: 'edit.node',
      message: 'add a new label:',
      placeholder: 'new.label',
      confirmText: '.save',
      inputValue: node.props.label,
      nodeId: id,
      action: updateNodeLabel,
    });
    isContextMenuVisible = false;
  }

  function updateNodeLabel(id, newNodeLabel) {
    nodes.update((currentNodes) =>
      currentNodes.map((n) =>
        n.id === id ? { ...n, props: { ...n.props, label: newNodeLabel } } : n
      )
    );
  }

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

  function handleCanvasClick() {
    isContextMenuVisible = false;
    selectedNodes.set([]); // Clear selection when clicking on canvas
    showColorPicker = false;
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
        on:canvasClick={handleCanvasClick}
        on:canvasContextMenu={handleCanvasContextMenu}
      >
        {#each $nodes as node (node.id)}
          <svelte:component
            this={getNodeComponent(node.component)}
            {...node.props}
            id={node.id}
            on:move={handleNodeMove}
            on:createNode={handleCreateNode}
            on:contentUpdate={handleContentUpdate}
            on:contextmenu={handleNodeContextMenu}
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
      on:confirm={handleModalConfirm}
      on:cancel={handleModalCancel}
    />
  {/if}

  {#if isContextMenuVisible}
    <ContextMenu
      options={contextMenuOptions}
      x={contextMenuPosition.x}
      y={contextMenuPosition.y}
      {initialColor}
      {showColorPicker}
      on:close={handleCanvasClick}
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