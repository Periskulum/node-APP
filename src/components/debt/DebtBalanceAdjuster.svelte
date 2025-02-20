<script>
  import { createEventDispatcher } from "svelte";

  export let operation = 'subtract'; // 'add' or 'subtract'
  
  const dispatch = createEventDispatcher();
  
  let amount = '';
  let error = null;

  function validateAmount(value) {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      return 'Please enter a valid positive number';
    }
    return null;
  }

  function handleSubmit() {
    error = validateAmount(amount);
    
    if (!error) {
      dispatch('adjust', { 
        amount: parseFloat(amount),
        operation
      });
      amount = '';
    }
  }

  function handleCancel() {
    amount = '';
    error = null;
    dispatch('cancel');
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !error) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="balance-adjuster" on:keydown={handleKeydown}>
  <div class="input-group">
    <span class="operation-icon">
      <span class="material-icons">
        {operation === 'add' ? 'add' : 'remove'}
      </span>
    </span>
    <!-- svelte-ignore a11y-autofocus -->
    <input
      type="number"
      bind:value={amount}
      placeholder="Enter amount"
      min="0"
      step="0.01"
      autofocus
    />
  </div>

  {#if error}
    <span class="error-message">{error}</span>
  {/if}

  <div class="actions">
    <button class="submit-button" on:click={handleSubmit} disabled={!amount || error}>
      <span class="material-icons">check</span>
    </button>
    <button class="cancel-button" on:click={handleCancel}>
      <span class="material-icons">close</span>
    </button>
  </div>
</div>

<style>
  .balance-adjuster {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    background-color: rgba(255, 255, 255, 0.1);
    padding: 8px;
    border-radius: 4px;
    position: relative;
  }

  .input-group {
    display: flex;
    align-items: center;
    flex-grow: 1;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    overflow: hidden;
  }

  .operation-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    color: #2c3e50;
  }

  input {
    flex-grow: 1;
    padding: 6px;
    border: none;
    background: transparent;
    color: #2c3e50;
  }

  input:focus {
    outline: none;
  }

  .input-group:focus-within {
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.3);
  }

  .actions {
    display: flex;
    gap: 4px;
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

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .submit-button {
    background-color: rgba(46, 204, 113, 0.8);
    color: white;
  }

  .cancel-button {
    background-color: rgba(231, 76, 60, 0.8);
    color: white;
  }

  button:not(:disabled):hover {
    opacity: 1;
  }

  .material-icons {
    font-size: 16px;
  }

  .error-message {
    color: #ff7675;
    font-size: 0.8em;
    position: absolute;
    bottom: -18px;
    left: 8px;
  }
</style>
