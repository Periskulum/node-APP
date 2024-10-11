<!-- Modal.svelte: A reusable modal component with customizable title, message, and buttons -->

<script>
  import { createEventDispatcher } from "svelte";

  // Exported props for customization
  export let title = "Modal Title";
  export let message = "";
  export let placeholder = "";
  export let confirmText = "Confirm";
  export let cancelText = "Cancel";
  export let inputValue = "";

  // Create an event dispatcher for emitting events
  const dispatch = createEventDispatcher();

  // Function to handle confirm button click
  function handleConfirm() {
    dispatch("confirm", inputValue);
  }

  // Function to handle cancel button click
  function handleCancel() {
    dispatch("cancel");
  }
</script>

<!-- Modal backdrop and content -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal-backdrop" on:click={handleCancel}>
  <div class="modal-content" on:click|stopPropagation>
    <!-- Modal title -->
    <h2>{title}</h2>
    <!-- Modal message -->
    <p>{message}</p>
    <!-- Input field for user input -->
    <!-- svelte-ignore a11y-autofocus -->
    <input type="text" bind:value={inputValue} {placeholder} />

    <!-- Modal buttons -->
    <div class="modal-buttons">
      <!-- Confirm button -->
      <button type="button" class="confirm-button" on:click={handleConfirm}>
        {confirmText}
      </button>
      <!-- Cancel button -->
      <button type="button" class="cancel-button" on:click={handleCancel}>
        {cancelText}
      </button>
    </div>
  </div>
</div>

<style>
  /* Modal backdrop styling */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }

  /* Modal content styling */
  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
  }

  /* Modal title styling */
  .modal-content h2 {
    margin-top: 0;
  }

  /* Modal message styling */
  .modal-content p {
    margin-bottom: 16px;
  }

  /* Input field styling */
  .modal-content input {
    width: 100%;
    padding: 8px;
    margin-bottom: 16px;
    box-sizing: border-box;
  }

  /* Modal buttons container styling */
  .modal-buttons {
    display: flex;
    justify-content: flex-end;
  }

  /* Confirm and cancel buttons styling */
  .confirm-button,
  .cancel-button {
    background: none;
    border: none;
    padding: 8px 16px;
    margin-left: 8px;
    cursor: pointer;
    border-radius: 4px;
  }

  /* Confirm button specific styling */
  .confirm-button {
    background-color: #27ae60;
    color: white;
  }

  /* Cancel button specific styling */
  .cancel-button {
    background-color: #c0392b;
    color: white;
  }
</style>
