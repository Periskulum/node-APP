/**
 * Node Handlers Module
 *
 * This module contains functions to handle various node-related events such as moving nodes,
 * clicking nodes, creating new nodes, and updating node content. It also includes helper functions
 * for creating new nodes and generating unique node IDs.
 */

import { nodes } from "../stores/nodes.js";
import { selectedNodes } from "../stores/selectionStore.js";

/**
 * Handle node move event
 * @param {Object} event - The event object containing node id and new coordinates
 */
export function handleNodeMove(event) {
  const { id, x, y } = event.detail;
  nodes.update((currentNodes) =>
    currentNodes.map((node) =>
      node.id === id ? { ...node, props: { ...node.props, x, y } } : node
    )
  );
}

/**
 * Handle node click event
 * @param {Object} event - The event object containing node id and control key status
 */
export function handleNodeClick(event) {
  const { id, ctrlKey } = event.detail;
  selectedNodes.update((currentSelection) => {
    if (ctrlKey) {
      // If ctrlKey is pressed, toggle selection of the node
      if (currentSelection.includes(id)) {
        return currentSelection.filter((nodeId) => nodeId !== id);
      } else {
        return [...currentSelection, id];
      }
    } else {
      // If ctrlKey is not pressed, select only the clicked node
      return [id];
    }
  });
}

/**
 * Handle create node event
 * @param {Object} event - The event object containing node type, coordinates, and additional properties
 */
export function handleCreateNode(event) {
  const { type, x, y, ...props } = event.detail;
  const newNode = createNewNode(type, x, y, props);
  if (newNode) {
    nodes.update((currentNodes) => [...currentNodes, newNode]);
  }
}

/**
 * Create a new node
 * @param {string} type - The type of the node
 * @param {number} x - The x-coordinate of the node
 * @param {number} y - The y-coordinate of the node
 * @param {Object} props - Additional properties for the node
 * @returns {Object|null} - The new node object or null if the type is unknown
 */
function createNewNode(type, x, y, props) {
  const id = getNextNodeId();
  const baseProps = {
    x,
    y,
    isLocked: false,
    ...props,
  };
  switch (type.toLowerCase()) {
    case "node":
      return {
        id,
        component: "Node",
        props: {
          label: props.label || `node.${id}`,
          color: props.color || "#3498db",
          ...baseProps,
        },
      };
    case "makenode":
      return {
        id,
        component: "MakeNode",
        props: {
          label: props.label || "make.node",
          ...baseProps,
        },
      };
    case "darknode":
      return {
        id,
        component: "DarkNode",
        props: {
          label: props.label || "dark.node",
          color: props.color || "#2c3e50",
          ...baseProps,
        },
      };
    case "textnode":
      return {
        id,
        component: "TextNode",
        props: {
          content: props.content || "hello.world",
          title: props.title || "text.node",
          color: props.color || "#3498db",
          ...baseProps,
        },
      };
    case "imagenode":
      return {
        id,
        component: "ImageNode",
        props: {
          imageUrl: "https://picsum.photos/300/400",
          title: "image.node",
          color: props.color || "#3498db",
          ...baseProps,
        },
      };
    case "calculatornode":
      return {
        id,
        component: "CalculatorNode",
        props: {
          label: "calc.node",
          color: props.color || "#9b59b6", // Default purple color for CalculatorNode
          ...baseProps,
        },
      };
    case "todonode":
      return {
        id,
        component: "TodoNode",
        props: {
          label: "todo.node",
          color: props.color || "#3498db",
          ...baseProps,
        },
      };
    case "budgetnode":
      return {
        id,
        component: "BudgetNode",
        props: {
          title: "budget.node",
          color: props.color || "#2ecc71", // Default green color for BudgetNode
          transactions: [],
          ...baseProps,
        },
      };
    case "debtnode":
      return {
        id,
        component: "DebtNode",
        props: {
          title: "debt.node",
          color: props.color || "#e74c3c", // Default red color for DebtNode
          debts: [],
          ...baseProps,
        },
      };
    default:
      console.log("Unknown node type:", type);
      return null;
  }
}

/**
 * Generate the next unique node ID
 * @returns {number} - The next node ID
 */
function getNextNodeId() {
  let highestId = 0;
  nodes.update((currentNodes) => {
    highestId = currentNodes.reduce((max, node) => Math.max(max, node.id), 0);
    return currentNodes;
  });
  return highestId + 1;
}

/**
 * Handle content update event
 * @param {Object} event - The event object containing node id and updated properties
 */
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
