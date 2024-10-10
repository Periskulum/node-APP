import { nodes } from '../stores/nodes.js';

export function openModal({ title, message, placeholder, confirmText, inputValue, nodeId, action }) {
  return {
    isModalVisible: true,
    modalTitle: title,
    modalMessage: message,
    modalPlaceholder: placeholder,
    modalConfirmText: confirmText || 'Confirm',
    modalInputValue: inputValue || '',
    modalNodeId: nodeId,
    modalAction: action,
  };
}

export function handleModalConfirm(event, modalAction, modalNodeId) {
  const value = event.detail;
  if (modalAction && (modalNodeId !== null || modalNodeId === null)) {
    modalAction(modalNodeId, value);
  }
  return { isModalVisible: false };
}

export function handleModalCancel() {
  return { isModalVisible: false };
}

export function editNodeLabel(id) {
  const node = get(nodes).find((n) => n.id === id);
  return openModal({
    title: 'edit.node',
    message: 'add a new label:',
    placeholder: 'new.label',
    confirmText: '.save',
    inputValue: node.props.label,
    nodeId: id,
    action: updateNodeLabel,
  });
}

function updateNodeLabel(id, newNodeLabel) {
  nodes.update((currentNodes) =>
    currentNodes.map((n) =>
      n.id === id ? { ...n, props: { ...n.props, label: newNodeLabel } } : n
    )
  );
}