<script>
  import { createEventDispatcher } from "svelte";
  import { darkMode } from "../stores/darkMode.js";

  export let debt = null;

  const dispatch = createEventDispatcher();
  
  let editedDebt = debt ? { ...debt } : null;
  let errors = {};

  function validateField(field, value) {
    if (field === 'source' && !value.trim()) {
      return 'Source is required';
    }
    if (['balance', 'limit', 'minPayment', 'apr'].includes(field)) {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        return 'Please enter a valid positive number';
      }
    }
    return null;
  }

  function handleSave() {
    if (editedDebt) {
      errors = {};
      let hasErrors = false;

      // Validate all fields
      errors.source = validateField('source', editedDebt.source);
      errors.balance = validateField('balance', editedDebt.balance);
      if (editedDebt.type === 'credit') {
        errors.limit = validateField('limit', editedDebt.limit);
      }
      errors.minPayment = validateField('minPayment', editedDebt.minPayment);
      errors.apr = validateField('apr', editedDebt.apr);

      // Check for any errors
      hasErrors = Object.values(errors).some(error => error !== null);

      if (!hasErrors) {
        const updatedDebt = {
          ...editedDebt,
          balance: parseFloat(editedDebt.balance),
          limit: editedDebt.type === 'credit' ? parseFloat(editedDebt.limit) : null,
          minPayment: parseFloat(editedDebt.minPayment) || 0,
          apr: parseFloat(editedDebt.apr) || 0
        };
        dispatch('save', updatedDebt);
      }
    }
  }

  function handleCancel() {
    dispatch('cancel');
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  }
</script>

<div class="modal-overlay">
  <div class="modal-backdrop" on:click={handleCancel} />
  <div class="modal-content" class:dark-mode={$darkMode} on:click|stopPropagation>
    <h2>Edit Debt</h2>
    
    <div class="edit-form">
      <label>
        Source:
        <input 
          type="text"
          bind:value={editedDebt.source}
          placeholder="Source name"
          autofocus
          on:keydown={handleKeydown}
        />
        {#if errors.source}
          <span class="error-message">{errors.source}</span>
        {/if}
      </label>

      <label>
        Balance:
        <input 
          type="number"
          bind:value={editedDebt.balance}
          placeholder="Current balance"
          min="0"
          step="0.01"
          on:keydown={handleKeydown}
        />
        {#if errors.balance}
          <span class="error-message">{errors.balance}</span>
        {/if}
      </label>

      {#if editedDebt.type === 'credit'}
        <label>
          Credit Limit:
          <input 
            type="number"
            bind:value={editedDebt.limit}
            placeholder="Credit limit"
            min="0"
            step="0.01"
            on:keydown={handleKeydown}
          />
          {#if errors.limit}
            <span class="error-message">{errors.limit}</span>
          {/if}
        </label>
      {/if}

      <label>
        Minimum Payment:
        <input 
          type="number"
          bind:value={editedDebt.minPayment}
          placeholder="Minimum payment"
          min="0"
          step="0.01"
          on:keydown={handleKeydown}
        />
        {#if errors.minPayment}
          <span class="error-message">{errors.minPayment}</span>
        {/if}
      </label>

      <label>
        APR (%):
        <input 
          type="number"
          bind:value={editedDebt.apr}
          placeholder="APR percentage"
          min="0"
          max="100"
          step="0.1"
          on:keydown={handleKeydown}
        />
        {#if errors.apr}
          <span class="error-message">{errors.apr}</span>
        {/if}
      </label>

      <div class="help-text">Press Ctrl+Enter to save</div>
    </div>

    <div class="modal-buttons">
      <button type="button" class="confirm-button" on:click={handleSave}>
        Save
      </button>
      <button type="button" class="cancel-button" on:click={handleCancel}>
        Cancel
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
    margin-bottom: 20px;
  }

  .edit-form {
    display: grid;
    gap: 16px;
  }

  label {
    display: block;
    font-size: 14px;
  }

  input {
    width: 100%;
    padding: 8px 12px;
    margin-top: 4px;
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
    margin-top: 20px;
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

  button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  button:active {
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
    margin-top: 4px;
    display: block;
  }

  .modal-content.dark-mode .error-message {
    color: #ff7675;
  }

  .help-text {
    font-size: 0.9em;
    opacity: 0.7;
    text-align: center;
    margin-top: 8px;
  }
</style>
