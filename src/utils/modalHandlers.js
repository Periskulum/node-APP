// modalHandlers.js
// This module provides utility functions to handle modal operations such as opening, confirming, and canceling modals.
// It also includes a function to edit a node label and update the nodes store.

import { nodes } from "../stores/nodes.js";

/**
 * Opens a modal with the specified parameters.
 * @param {Object} params - The parameters for the modal.
 * @param {string} params.title - The title of the modal.
 * @param {string} params.message - The message of the modal.
 * @param {string} params.placeholder - The placeholder text for the input field.
 * @param {string} params.confirmText - The text for the confirm button.
 * @param {string} params.inputValue - The initial value for the input field.
 * @param {string} params.nodeId - The ID of the node associated with the modal.
 * @param {Function} params.action - The action to perform on confirm.
 * @returns {Object} The modal state.
 */
export function openModal({
  title,
  message,
  placeholder,
  confirmText,
  inputValue,
  nodeId,
  action,
}) {
  return {
    isModalVisible: true,
    modalTitle: title,
    modalMessage: message,
    modalPlaceholder: placeholder,
    modalConfirmText: confirmText || "Confirm",
    modalInputValue: inputValue || "",
    modalNodeId: nodeId,
    modalAction: action,
  };
}

/**
 * Handles the confirm action of the modal.
 * @param {Event} event - The event triggered on confirm.
 * @param {Function} modalAction - The action to perform on confirm.
 * @param {string} modalNodeId - The ID of the node associated with the modal.
 * @returns {Object} The modal state.
 */
export function handleModalConfirm(event, modalAction, modalNodeId) {
  const value = event.detail;
  if (modalAction && (modalNodeId !== null || modalNodeId === null)) {
    modalAction(modalNodeId, value);
  }
  return { isModalVisible: false };
}

/**
 * Handles the cancel action of the modal.
 * @returns {Object} The modal state.
 */
export function handleModalCancel() {
  return { isModalVisible: false };
}

/**
 * Opens a modal to edit the label of a node.
 * @param {string} id - The ID of the node to edit.
 * @returns {Object} The modal state.
 */
export function editNodeLabel(id) {
  const node = get(nodes).find((n) => n.id === id);
  return openModal({
    title: "edit.node",
    message: "add a new label:",
    placeholder: "new.label",
    confirmText: ".save",
    inputValue: node.props.label,
    nodeId: id,
    action: updateNodeLabel,
  });
}

/**
 * Updates the label of a node in the nodes store.
 * @param {string} id - The ID of the node to update.
 * @param {string} newNodeLabel - The new label for the node.
 */
function updateNodeLabel(id, newNodeLabel) {
  nodes.update((currentNodes) =>
    currentNodes.map((n) =>
      n.id === id ? { ...n, props: { ...n.props, label: newNodeLabel } } : n
    )
  );
}
