// src/utils/NodeManager.js
export function lockNodes(nodesStore, nodeIds) {
    nodesStore.update((currentNodes) =>
      currentNodes.map((node) =>
        nodeIds.includes(node.id)
          ? { ...node, props: { ...node.props, isLocked: true } }
          : node
      )
    );
  }
  
  export function unlockNodes(nodesStore, nodeIds) {
    nodesStore.update((currentNodes) =>
      currentNodes.map((node) =>
        nodeIds.includes(node.id)
          ? { ...node, props: { ...node.props, isLocked: false } }
          : node
      )
    );
  }
  
  export function lockAllNodes(nodesStore) {
    nodesStore.update((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        props: { ...node.props, isLocked: true },
      }))
    );
  }
  
  export function unlockAllNodes(nodesStore) {
    nodesStore.update((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        props: { ...node.props, isLocked: false },
      }))
    );
  }
  