<script>
  import { createEventDispatcher } from "svelte";
  import { darkMode } from "../stores/darkMode.js";

  // Exported props for customization
  export let title = "Modal Title";
  export let message = "";
  export let placeholder = "";
  export let confirmText = "Confirm";
  export let cancelText = "Cancel";
  export let inputValue = "";
  export let inputType = "text";

  let errorMessage = "";
  
  // Create an event dispatcher for emitting events
  const dispatch = createEventDispatcher();

  // Function to handle confirm button click
  function handleConfirm() {
    if (inputType === 'number') {
      const numValue = parseFloat(inputValue);
      if (isNaN(numValue) || numValue < 0) {
        errorMessage = "Please enter a valid positive number";
        return;
      }
      errorMessage = "";
      dispatch("confirm", numValue);
    } else {
      dispatch("confirm", inputValue);
    }
  }

  // Function to handle cancel button click
  function handleCancel() {
    dispatch("cancel");
  }

  function handleInput() {
    if (inputType === 'number') {
      const numValue = parseFloat(inputValue);
      if (isNaN(numValue) || numValue < 0) {
        errorMessage = "Please enter a valid positive number";
      } else {
        errorMessage = "";
      }
    }
  }
</script>

<div class="modal-overlay">
  <div class="modal-backdrop" on:click={handleCancel} />
  <div class="modal-content" class:dark-mode={$darkMode} on:click|stopPropagation>
    <h2>{title}</h2>
    <p>{message}</p>
    
    {#if inputType === 'number'}
      <input 
        type="number"
        bind:value={inputValue} 
        {placeholder}
        min="0"
        step="0.01"
        autofocus 
        on:input={handleInput}
        on:keydown={(e) => {
          if (e.key === 'Enter' && !errorMessage) {
            handleConfirm();
          }
        }}
      />
    {:else}
      <input 
        type="text"
        bind:value={inputValue} 
        {placeholder}
        autofocus 
        on:keydown={(e) => {
          if (e.key === 'Enter') {
            handleConfirm();
          }
        }}
      />
    {/if}

    {#if errorMessage}
      <p class="error-message">{errorMessage}</p>
    {/if}

    <div class="modal-buttons">
      <button type="button" class="confirm-button" on:click={handleConfirm} disabled={errorMessage}>
        {confirmText}
      </button>
      <button type="button" class="cancel-button" on:click={handleCancel}>
        {cancelText}
      </button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }

  .modal-backdrop {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }

  .modal-content {
    position: relative;
    background: white;
    color: #2c3e50;
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    min-width: 300px;
    max-width: 400px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .modal-content.dark-mode {
    background: #2c3e50;
    color: white;
  }

  h2 {
    margin-top: 0;
    margin-bottom: 12px;
  }

  p {
    margin-bottom: 16px;
    opacity: 0.9;
  }

  input {
    width: 100%;
    padding: 8px 12px;
    margin-bottom: 8px;
    box-sizing: border-box;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background: white;
    color: #2c3e50;
  }

  .modal-content.dark-mode input {
    background: #34495e;
    color: white;
    border-color: #486581;
  }

  input:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }

  .modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }

  button {
    font-size: 14px;
    font-weight: 500;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button:not(:disabled):hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  button:not(:disabled):active {
    transform: translateY(0);
  }

  .confirm-button {
    background-color: #27ae60;
    color: white;
  }

  .modal-content.dark-mode .confirm-button {
    background-color: #2ecc71;
  }

  .cancel-button {
    background-color: #c0392b;
    color: white;
  }

  .modal-content.dark-mode .cancel-button {
    background-color: #e74c3c;
  }

  .error-message {
    color: #e74c3c;
    font-size: 0.9em;
    margin-top: -4px;
    margin-bottom: 8px;
  }

  .modal-content.dark-mode .error-message {
    color: #ff7675;
  }
</style>
