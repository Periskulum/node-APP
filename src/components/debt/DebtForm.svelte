<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  // Form state
  let newSource = "";
  let newBalance = "";
  let newLimit = "";
  let newMinPayment = "";
  let newAPR = "";
  let newType = "credit"; // credit or loan
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

  function addDebt() {
    errors = {};
    let hasErrors = false;

    // Validate fields
    errors.source = validateField('source', newSource);
    errors.balance = validateField('balance', newBalance);
    if (newType === 'credit') {
      errors.limit = validateField('limit', newLimit);
    }
    errors.minPayment = newMinPayment ? validateField('minPayment', newMinPayment) : null;
    errors.apr = newAPR ? validateField('apr', newAPR) : null;

    hasErrors = Object.values(errors).some(error => error !== null);

    if (!hasErrors) {
      const debt = {
        source: newSource,
        balance: parseFloat(newBalance),
        limit: newType === 'credit' ? parseFloat(newLimit) : null,
        minPayment: parseFloat(newMinPayment) || 0,
        apr: parseFloat(newAPR) || 0,
        type: newType
      };

      dispatch('addDebt', debt);
      resetForm();
    }
  }

  function resetForm() {
    newSource = "";
    newBalance = "";
    newLimit = "";
    newMinPayment = "";
    newAPR = "";
    newType = "credit";
    errors = {};
  }
</script>

<div class="add-debt-form">
  <select bind:value={newType} class="type-select">
    <option value="credit">Credit Card</option>
    <option value="loan">Loan</option>
  </select>

  <div class="form-field">
    <input
      type="text"
      bind:value={newSource}
      placeholder="Source (e.g. Chase, Student Loan)"
      class="source-input"
    />
    {#if errors.source}
      <span class="error-message">{errors.source}</span>
    {/if}
  </div>

  <div class="form-field">
    <input
      type="number"
      bind:value={newBalance}
      placeholder="Current Balance"
      class="balance-input"
      min="0"
      step="0.01"
    />
    {#if errors.balance}
      <span class="error-message">{errors.balance}</span>
    {/if}
  </div>

  {#if newType === 'credit'}
    <div class="form-field">
      <input
        type="number"
        bind:value={newLimit}
        placeholder="Credit Limit"
        class="limit-input"
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
      bind:value={newMinPayment}
      placeholder="Minimum Payment"
      class="payment-input"
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
      bind:value={newAPR}
      placeholder="APR %"
      class="apr-input"
      min="0"
      max="100"
      step="0.1"
    />
    {#if errors.apr}
      <span class="error-message">{errors.apr}</span>
    {/if}
  </div>

  <button on:click={addDebt} class="add-button">
    Add {newType === 'credit' ? 'Credit Card' : 'Loan'}
  </button>
</div>

<style>
  .add-debt-form {
    display: grid;
    gap: 8px;
    margin-bottom: 24px;
    background-color: rgba(255, 255, 255, 0.1);
    padding: 12px;
    border-radius: 6px;
  }

  .form-field {
    position: relative;
    margin-bottom: 4px;
  }

  .error-message {
    color: #ff7675;
    font-size: 0.8em;
    position: absolute;
    bottom: -18px;
    left: 0;
  }

  input,
  select {
    width: 100%;
    padding: 6px;
    border: none;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.9);
    color: #2c3e50;
    transition: background-color 0.2s, box-shadow 0.2s;
  }

  input:focus,
  select:focus {
    background-color: white;
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.3);
    outline: none;
  }

  .add-button {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 4px;
  }

  .add-button:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
</style>
