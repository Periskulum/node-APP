<script>
    import { createEventDispatcher } from 'svelte';
  
    export let title = 'Modal Title';
    export let message = '';
    export let placeholder = '';
    export let confirmText = 'Confirm';
    export let cancelText = 'Cancel';
    export let inputValue = '';
  
    const dispatch = createEventDispatcher();
  
    function handleConfirm() {
      dispatch('confirm', inputValue);
    }
  
    function handleCancel() {
      dispatch('cancel');
    }
  </script>
  
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal-backdrop" on:click={handleCancel}>
    <div class="modal-content" on:click|stopPropagation>
      <h2>{title}</h2>
      <p>{message}</p>
      <!-- svelte-ignore a11y-autofocus -->
      <input
        type="text"
        bind:value={inputValue}
        placeholder={placeholder}
      />

      <div class="modal-buttons">
        <button type="button" class="confirm-button" on:click={handleConfirm}>
          {confirmText}
        </button>
        <button type="button" class="cancel-button" on:click={handleCancel}>
          {cancelText}
        </button>
      </div>
    </div>
  </div>
  
  <style>
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
  
    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      width: 90%;
      max-width: 400px;
    }
  
    .modal-content h2 {
      margin-top: 0;
    }
  
    .modal-content p {
      margin-bottom: 16px;
    }
  
    .modal-content input {
      width: 100%;
      padding: 8px;
      margin-bottom: 16px;
      box-sizing: border-box;
    }

  
    .modal-buttons {
      display: flex;
      justify-content: flex-end;
    }
  
    .confirm-button,
    .cancel-button {
      background: none;
      border: none;
      padding: 8px 16px;
      margin-left: 8px;
      cursor: pointer;
      border-radius: 4px;
    }
  
    .confirm-button {
      background-color: #27ae60;
      color: white;
    }
  
    .cancel-button {
      background-color: #c0392b;
      color: white;
    }
  </style>
  