<script>
  import { createEventDispatcher } from "svelte";

  export let debt;
  
  const dispatch = createEventDispatcher();
  
  let editedDebt = { ...debt };
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
    errors = {};
    let hasErrors = false;

    // Validate all fields
    errors.source = validateField('source', editedDebt.source);
    errors.balance = validateField('balance', editedDebt.balance);
    if (editedDebt.type === 'credit') {
      errors.limit = validateField('limit', editedDebt.limit);
    }
    errors.minPayment = editedDebt.minPayment ? validateField('minPayment', editedDebt.minPayment) : null;
    errors.apr = editedDebt.apr ? validateField('apr', editedDebt.apr) : null;

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

  function handleCancel() {
    dispatch('cancel');
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }
</script>

<div class="debt-editor" on:keydown={handleKeydown}>
  <div class="form-field">
    <input
      type="text"
      bind:value={editedDebt.source}
      placeholder="Source name"
      autofocus
    />
    {#if errors.source}
      <span class="error-message">{errors.source}</span>
    {/if}
  </div>

  <div class="form-field">
    <input
      type="number"
      bind:value={editedDebt.balance}
      placeholder="Current balance"
      min="0"
      step="0.01"
    />
    {#if errors.balance}
      <span class="error-message">{errors.balance}</span>
    {/if}
  </div>

  {#if editedDebt.type === 'credit'}
    <div class="form-field">
      <input
        type="number"
        bind:value={editedDebt.limit}
        placeholder="Credit limit"
        min="0"
        step="0.01"
      />
      {#if errors.limit}
        <span class="error-message">{errors.limit}</span>
      {/if}
    </div>
  {/if}

  <div class="form-field">
    <input
      type="number"
      bind:value={editedDebt.minPayment}
      placeholder="Minimum payment"
      min="0"
      step="0.01"
    />
    {#if errors.minPayment}
      <span class="error-message">{errors.minPayment}</span>
    {/if}
  </div>

  <div class="form-field">
    <input
      type="number"
      bind:value={editedDebt.apr}
      placeholder="APR percentage"
      min="0"
      max="100"
      step="0.1"
    />
    {#if errors.apr}
      <span class="error-message">{errors.apr}</span>
    {/if}
  </div>

  <div class="actions">
    <button class="save-button" on:click={handleSave}>
      <span class="material-icons">check</span>
    </button>
    <button class="cancel-button" on:click={handleCancel}>
      <span class="material-icons">close</span>
    </button>
  </div>
  
  <div class="help-text">Press Ctrl+Enter to save, Esc to cancel</div>
</div>

<style>
  .debt-editor {
    display: grid;
    gap: 8px;
    padding: 8px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .form-field {
    position: relative;
  }

  input {
    width: 100%;
    padding: 6px;
    border: none;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.9);
    color: #2c3e50;
    transition: background-color 0.2s, box-shadow 0.2s;
  }

  input:focus {
    background-color: white;
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.3);
    outline: none;
  }

  .error-message {
    color: #ff7675;
    font-size: 0.8em;
    position: absolute;
    bottom: -18px;
    left: 0;
  }

  .actions {
    display: flex;
    gap: 4px;
    justify-content: flex-end;
    margin-top: 4px;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .save-button {
    background-color: rgba(46, 204, 113, 0.8);
    color: white;
  }

  .cancel-button {
    background-color: rgba(231, 76, 60, 0.8);
    color: white;
  }

  button:hover {
    opacity: 1;
  }

  .material-icons {
    font-size: 16px;
  }

  .help-text {
    font-size: 0.8em;
    opacity: 0.7;
    text-align: right;
    margin-top: 4px;
  }
</style>
