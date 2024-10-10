import { nodes } from '../stores/nodes.js';
import { selectedNodes } from '../stores/selectionStore.js';

export function handleNodeMove(event) {
  const { id, x, y } = event.detail;
  nodes.update((currentNodes) =>
    currentNodes.map((node) =>
      node.id === id ? { ...node, props: { ...node.props, x, y } } : node
    )
  );
}

export function handleNodeClick(event) {
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

export function handleCreateNode(event) {
  const { type, x, y, ...props } = event.detail;
  const newNode = createNewNode(type, x, y, props);
  if (newNode) {
    nodes.update((currentNodes) => [...currentNodes, newNode]);
  }
}

function createNewNode(type, x, y, props) {
  const id = getNextNodeId();
  const baseProps = {
    x,
    y,
    isLocked: false,
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

function getNextNodeId() {
  let highestId = 0;
  nodes.update((currentNodes) => {
    highestId = currentNodes.reduce((max, node) => Math.max(max, node.id), 0);
    return currentNodes;
  });
  return highestId + 1;
}

export function handleContentUpdate(event) {
  const { id, ...updatedProps } = event.detail;
  nodes.update((currentNodes) =>
    currentNodes.map((node) =>
      node.id === id
        ? { ...node, props: { ...node.props, ...updatedProps } }
        : node
    )
  );
}