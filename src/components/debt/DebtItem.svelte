<script>
  import { createEventDispatcher } from "svelte";
  import DebtItemEditor from "./DebtItemEditor.svelte";
  import DebtBalanceAdjuster from "./DebtBalanceAdjuster.svelte";

  export let debt;
  export let disabled = false;

  const dispatch = createEventDispatcher();

  let isEditing = false;
  let isAdjustingBalance = false;
  let balanceOperation = 'subtract';

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  function formatPercent(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }

  function handleEdit() {
    isEditing = true;
  }

  function handleEditSave(event) {
    dispatch('edit', event.detail);
    isEditing = false;
  }

  function handleEditCancel() {
    isEditing = false;
  }

  function handleDelete() {
    dispatch('delete');
  }

  function startBalanceAdjustment(operation) {
    balanceOperation = operation;
    isAdjustingBalance = true;
  }

  function handleBalanceAdjust(event) {
    const { amount, operation } = event.detail;
    if (operation === 'add') {
      dispatch('update', { ...debt, balance: parseFloat(debt.balance) + amount });
    } else {
      dispatch('update', { ...debt, balance: Math.max(0, parseFloat(debt.balance) - amount) });
    }
    isAdjustingBalance = false;
  }

  function handleBalanceAdjustCancel() {
    isAdjustingBalance = false;
  }
</script>

<div class="debt-item" class:credit={debt.type === 'credit'} class:loan={debt.type === 'loan'}>
  {#if isEditing}
    <DebtItemEditor 
      {debt}
      on:save={handleEditSave}
      on:cancel={handleEditCancel}
    />
  {:else if isAdjustingBalance}
    <DebtBalanceAdjuster
      operation={balanceOperation}
      on:adjust={handleBalanceAdjust}
      on:cancel={handleBalanceAdjustCancel}
    />
  {:else}
    <div class="debt-content">
      <div class="debt-header">
        <span class="debt-source">{debt.source}</span>
        <span class="debt-type">{debt.type === 'credit' ? 'Credit Card' : 'Loan'}</span>
      </div>
      <div class="debt-details">
        <div class="debt-row">
          <span class="detail-label">Balance:</span>
          <span class="detail-value negative">{formatCurrency(debt.balance)}</span>
        </div>
        {#if debt.type === 'credit'}
          <div class="debt-row">
            <span class="detail-label">Limit:</span>
            <span class="detail-value">{formatCurrency(debt.limit)}</span>
          </div>
          <div class="debt-row">
            <span class="detail-label">Utilization:</span>
            <span class="detail-value" class:high-utilization={debt.balance / debt.limit > 0.3}>
              {formatPercent((debt.balance / debt.limit) * 100)}
            </span>
          </div>
        {/if}
        {#if debt.minPayment}
          <div class="debt-row">
            <span class="detail-label">Min Payment:</span>
            <span class="detail-value">{formatCurrency(debt.minPayment)}</span>
          </div>
        {/if}
        {#if debt.apr}
          <div class="debt-row">
            <span class="detail-label">APR:</span>
            <span class="detail-value">{formatPercent(debt.apr)}</span>
          </div>
        {/if}
      </div>
    </div>

    <div class="debt-actions">
      <button 
        on:click={handleEdit} 
        disabled={disabled}
        title="Edit debt"
      >
        <span class="material-icons">edit</span>
      </button>
      <button 
        on:click={handleDelete} 
        disabled={disabled}
        title="Delete debt"
      >
        <span class="material-icons">delete</span>
      </button>
      <button 
        on:click={() => startBalanceAdjustment('subtract')} 
        disabled={disabled}
        title="Subtract from balance"
        class="balance-btn subtract"
      >
        <span class="material-icons">remove_circle</span>
      </button>
      <button 
        on:click={() => startBalanceAdjustment('add')} 
        disabled={disabled}
        title="Add to balance"
        class="balance-btn add"
      >
        <span class="material-icons">add_circle</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .debt-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 8px;
    margin-bottom: 8px;
  }

  .debt-item.credit {
    border-left: 4px solid #fdcb6e;
  }

  .debt-item.loan {
    border-left: 4px solid #74b9ff;
  }

  .debt-content {
    flex-grow: 1;
    margin-right: 8px;
  }

  .debt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .debt-source {
    font-weight: bold;
  }

  .debt-type {
    font-size: 0.9em;
    opacity: 0.8;
  }

  .debt-details {
    font-size: 0.9em;
  }

  .debt-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
  }

  .detail-label {
    color: rgba(255, 255, 255, 0.8);
  }

  .negative {
    color: #ff7675;
  }

  .high-utilization {
    color: #ff7675;
  }

  .debt-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 4px;
    transition: opacity 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .balance-btn {
    opacity: 0.8;
  }

  .balance-btn:hover {
    opacity: 1;
  }

  .balance-btn.subtract {
    color: #a8e6cf;
  }

  .balance-btn.add {
    color: #ff7675;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .material-icons {
    font-size: 18px;
  }
</style>
