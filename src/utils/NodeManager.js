// src/utils/NodeManager.js

/**
 * Utility functions to manage the lock state of nodes in a nodesStore.
 * Includes functions to lock/unlock specific nodes or all nodes.
 */

/**
 * Locks specific nodes by their IDs.
 * @param {Object} nodesStore - The store containing the nodes.
 * @param {Array} nodeIds - The IDs of the nodes to lock.
 */
export function lockNodes(nodesStore, nodeIds) {
  nodesStore.update((currentNodes) =>
    currentNodes.map(
      (node) =>
        nodeIds.includes(node.id)
          ? { ...node, props: { ...node.props, isLocked: true } } // Lock the node if its ID is in the nodeIds array
          : node // Leave the node unchanged if its ID is not in the nodeIds array
    )
  );
}

/**
 * Unlocks specific nodes by their IDs.
 * @param {Object} nodesStore - The store containing the nodes.
 * @param {Array} nodeIds - The IDs of the nodes to unlock.
 */
export function unlockNodes(nodesStore, nodeIds) {
  nodesStore.update((currentNodes) =>
    currentNodes.map(
      (node) =>
        nodeIds.includes(node.id)
          ? { ...node, props: { ...node.props, isLocked: false } } // Unlock the node if its ID is in the nodeIds array
          : node // Leave the node unchanged if its ID is not in the nodeIds array
    )
  );
}

/**
 * Locks all nodes in the nodesStore.
 * @param {Object} nodesStore - The store containing the nodes.
 */
export function lockAllNodes(nodesStore) {
  nodesStore.update((currentNodes) =>
    currentNodes.map((node) => ({
      ...node,
      props: { ...node.props, isLocked: true }, // Lock all nodes
    }))
  );
}

/**
 * Unlocks all nodes in the nodesStore.
 * @param {Object} nodesStore - The store containing the nodes.
 */
export function unlockAllNodes(nodesStore) {
  nodesStore.update((currentNodes) =>
    currentNodes.map((node) => ({
      ...node,
      props: { ...node.props, isLocked: false }, // Unlock all nodes
    }))
  );
}
