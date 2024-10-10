import { nodes } from '../stores/nodes.js';
import { selectedNodes } from '../stores/selectionStore.js';
import { get } from 'svelte/store';
import { lockNodes, unlockNodes, lockAllNodes, unlockAllNodes } from './NodeManager.js';
import { handleCreateNode } from './nodeHandlers.js';
import { panX, panY } from '../stores/panStore.js';

export function handleNodeContextMenu(event) {
  console.log('handleNodeContextMenu called with event:', event);
  const { id, x, y } = event.detail;
  const isNodeSelected = get(selectedNodes).includes(id);

  if (!isNodeSelected) {
    selectedNodes.set([id]);
  }

  const contextMenuPosition = { x, y };
  const isContextMenuVisible = true;

  if (get(selectedNodes).length > 1) {
    console.log('Multiple nodes selected');
    const contextMenuNodeId = null;
    const colorPickerContext = 'multipleNodes';

    const contextMenuOptions = [
      {
        label: `change.color.for.${get(selectedNodes).length}.nodes`,
        action: () => {
          console.log('Change color for multiple nodes action');
          return { showColorPicker: true };
        },
      },
      {
        label: `lock.${get(selectedNodes).length}.nodes`,
        action: () => {
          lockNodes(nodes, get(selectedNodes));
          selectedNodes.set([]);
          return { isContextMenuVisible: false };
        },
      },
      {
        label: `unlock.${get(selectedNodes).length}.nodes`,
        action: () => {
          unlockNodes(nodes, get(selectedNodes));
          selectedNodes.set([]);
          return { isContextMenuVisible: false };
        },
      },
      {
        label: `delete.${get(selectedNodes).length}.nodes`,
        action: () => {
          console.log('Delete nodes action');
          nodes.update((currentNodes) =>
            currentNodes.filter((n) => !get(selectedNodes).includes(n.id))
          );
          selectedNodes.set([]);
          return { isContextMenuVisible: false };
        },
      }
    ];

    return { contextMenuOptions, contextMenuPosition, isContextMenuVisible, contextMenuNodeId, colorPickerContext };
  } else {
    console.log('Single node selected');
    const contextMenuNodeId = id;
    const colorPickerContext = 'node';

    const node = get(nodes).find((n) => n.id === id);
    const initialColor = node.props.color || '#3498db';

    const contextMenuOptions = [
      {
        label: 'duplicate.node',
        action: () => {
          console.log('Duplicate node action');
          duplicateNode(id);
          selectedNodes.set([]);
          return { isContextMenuVisible: false };
        },
      },
      {
        label: 'change.color',
        action: () => {
          console.log('Change color action');
          return { showColorPicker: true };
        },
      },
      {
        label: node.props.isLocked ? 'unlock.node' : 'lock.node',
        action: () => {
          if (node.props.isLocked) {
            unlockNodes(nodes, [id]);
          } else {
            lockNodes(nodes, [id]);
          }
          selectedNodes.set([]);
          return { isContextMenuVisible: false };
        },
      },
      {
        label: 'delete.node',
        action: () => {
          console.log('Delete node action');
          nodes.update((currentNodes) => currentNodes.filter((n) => n.id !== id));
          selectedNodes.set([]);
          return { isContextMenuVisible: false };
        },
      }
    ];

    return { contextMenuOptions, contextMenuPosition, isContextMenuVisible, contextMenuNodeId, colorPickerContext, initialColor };
  }
}

export function handleCanvasContextMenu(event) {
  console.log('handleCanvasContextMenu called with event:', event);
  const { x, y } = event.detail;
  const contextMenuPosition = { x, y };
  const isContextMenuVisible = true;
  const contextMenuNodeId = null;
  const colorPickerContext = 'canvas';

  selectedNodes.set([]); // Clear selection when right-clicking on canvas

  const contextMenuOptions = [
    {
      label: 'add.node',
      action: () => {
        console.log('Add node action');
        createNodeAtPosition(x, y);
        return { isContextMenuVisible: false };
      },
    },
    {
      label: 'change.canvas.color',
      action: () => {
        console.log('Change canvas color action');
        return { showColorPicker: true };
      },
    },
    {
      label: 'lock.all.nodes',
      action: () => {
        lockAllNodes(nodes);
        selectedNodes.set([]);
        return { isContextMenuVisible: false };
      },
    },
    {
      label: 'unlock.all.nodes',
      action: () => {
        unlockAllNodes(nodes);
        selectedNodes.set([]);
        return { isContextMenuVisible: false };
      },
    },
  ];

  return { contextMenuOptions, contextMenuPosition, isContextMenuVisible, contextMenuNodeId, colorPickerContext };
}

function createNodeAtPosition(x, y) {
  console.log('Creating node at position:', { x, y });
  const currentPanX = get(panX);
  const currentPanY = get(panY);
  const adjustedX = x - currentPanX;
  const adjustedY = y - currentPanY;
  console.log('Adjusted position:', { adjustedX, adjustedY });
  const defaultNodeType = 'Node';
  handleCreateNode({ detail: { type: defaultNodeType, x: adjustedX, y: adjustedY } });
}

export function handleCanvasClick() {
  console.log('handleCanvasClick called');
  selectedNodes.set([]);
  return { isContextMenuVisible: false, showColorPicker: false };
}

function duplicateNode(originalId) {
  const originalNode = get(nodes).find((node) => node.id === originalId);
  if (originalNode) {
    const newId = Math.max(...get(nodes).map((n) => n.id)) + 1;
    const duplicatedNode = {
      ...originalNode,
      id: newId,
      props: {
        ...originalNode.props,
        x: originalNode.props.x + 20,
        y: originalNode.props.y + 20,
        label: `${originalNode.props.label}.copy`,
      },
    };
    nodes.update((currentNodes) => [...currentNodes, duplicatedNode]);
  }
}