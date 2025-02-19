<script>
  // Keep the entire script section unchanged
  import { createEventDispatcher } from "svelte";
  import { getNextZIndex } from "../stores/zIndex.js";
  import { darkMode } from "../stores/darkMode.js";
  import { selectedNodes } from "../stores/selectionStore.js";

  // Props and all other script content stays exactly the same...
  export let x = 0;
  export let y = 0;
  export let debts = [];
  export let label = "";
  export let title = "debt.node";
  export let isSelected = false;
  export let id;
  export let isFactoryNode = false;
  export let isNonFunctional = false;
  export let color = "";
  export let isLocked = false;

  import Modal from "./Modal.svelte";
  import EditDebtModal from "./EditDebtModal.svelte";

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Local state
  let showBalanceModal = false;
  let showEditModal = false;
  let selectedDebtIndex = -1;
  let balanceOperation = '';
  let balanceAdjustment = '';
  let editedDebt = null;
  let isDragging = false;
  let startX, startY;
  let zIndex = getNextZIndex();
  let isEditing = false;
  
  // New debt form state
  let newSource = "";
  let newBalance = "";
  let newLimit = "";
  let newMinPayment = "";
  let newAPR = "";
  let newType = "credit"; // credit or loan

  // Calculated properties
  $: isSelected = $selectedNodes.includes(id);
  $: isDarkMode = $darkMode;
  $: creditBalance = debts
    .filter(debt => debt.type === 'credit')
    .reduce((sum, debt) => sum + parseFloat(debt.balance), 0);
  $: loanBalance = debts
    .filter(debt => debt.type === 'loan')
    .reduce((sum, debt) => sum + parseFloat(debt.balance), 0);
  $: totalBalance = creditBalance + loanBalance;
  $: totalLimit = debts
    .filter(debt => debt.type === 'credit' && debt.limit)
    .reduce((sum, debt) => sum + parseFloat(debt.limit), 0);
  $: totalMinPayment = debts
    .filter(debt => debt.minPayment)
    .reduce((sum, debt) => sum + parseFloat(debt.minPayment), 0);
  $: utilizationRate = totalLimit > 0 ? (creditBalance / totalLimit) * 100 : 0;

  // Handle mouse events
  function handleMouseDown(event) {
    if (isNonFunctional || isFactoryNode) return;
    if (event.button === 0) {
      dispatch("nodeClick", { id, ctrlKey: event.ctrlKey || event.metaKey });
      if (!isLocked) {
        startDragging(event);
      }
      event.stopPropagation();
    }
  }

  function startDragging(event) {
    if (!isEditing && event.target.closest(".debt-node")) {
      isDragging = true;
      startX = event.clientX - x;
      startY = event.clientY - y;
      zIndex = getNextZIndex();
      dispatch("select");
      event.target.setPointerCapture(event.pointerId);
    }
  }

  function handleMouseMove(event) {
    if (isDragging) {
      const newX = event.clientX - startX;
      const newY = event.clientY - startY;
      x = newX;
      y = newY;
      dispatch("move", { id, x: newX, y: newY });
    }
  }

  function handleMouseUp(event) {
    if (isDragging) {
      isDragging = false;
      event.target.releasePointerCapture(event.pointerId);
    }
  }

  // Debt management
  function addDebt() {
    if (newSource && newBalance && (newType === 'loan' || newLimit)) {
      const balance = parseFloat(newBalance);
      const limit = newType === 'credit' ? parseFloat(newLimit) : null;
      const minPayment = parseFloat(newMinPayment) || 0;
      const apr = parseFloat(newAPR) || 0;

      if (!isNaN(balance) && (newType === 'loan' || !isNaN(limit))) {
        const updatedDebts = [
          ...debts,
          {
            source: newSource,
            balance,
            limit,
            minPayment,
            apr,
            type: newType
          }
        ];
        updateDebts(updatedDebts);
        resetForm();
      }
    }
  }

  function removeDebt(index) {
    const updatedDebts = debts.filter((_, i) => i !== index);
    updateDebts(updatedDebts);
  }

  function resetForm() {
    newSource = "";
    newBalance = "";
    newLimit = "";
    newMinPayment = "";
    newAPR = "";
    newType = "credit";
  }

  function updateDebts(updatedDebts) {
    dispatch("contentUpdate", { id, debts: updatedDebts });
  }

  function toggleEdit() {
    if (isNonFunctional) return;
    isEditing = !isEditing;
  }

  function handleContextMenu(event) {
    event.preventDefault();
    dispatch("contextmenu", { id, x: event.clientX, y: event.clientY });
  }

  // Format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Format percentage
  function formatPercent(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }

  // Balance adjustment modal handlers
  function openBalanceModal(index, operation) {
    selectedDebtIndex = index;
    balanceOperation = operation;
    showBalanceModal = true;
    balanceAdjustment = '';
  }

  function handleBalanceAdjustment(event) {
    const amount = parseFloat(event.detail);
    if (!isNaN(amount) && amount > 0) {
      const updatedDebts = [...debts];
      const debt = updatedDebts[selectedDebtIndex];
      if (balanceOperation === 'add') {
        debt.balance = parseFloat(debt.balance) + amount;
      } else {
        debt.balance = Math.max(0, parseFloat(debt.balance) - amount);
      }
      updateDebts(updatedDebts);
    }
    showBalanceModal = false;
    balanceAdjustment = '';
  }

  // Edit modal handlers
  function openEditModal(index) {
    selectedDebtIndex = index;
    editedDebt = { ...debts[index] };
    showEditModal = true;
  }

  function handleEditConfirm(event) {
    const updatedDebts = [...debts];
    updatedDebts[selectedDebtIndex] = event.detail;
    updateDebts(updatedDebts);
    showEditModal = false;
    editedDebt = null;
  }
</script>

<div
  class="debt-node"
  role="group"
  {label}
  class:dark-mode={isDarkMode}
  class:selected={isSelected}
  class:factory-node={isFactoryNode}
  class:non-functional={isNonFunctional}
  style="left: {isFactoryNode ? 0 : x}px; top: {isFactoryNode ? 0 : y}px; z-index: {zIndex}; background-color: {color};"
  on:pointerdown|stopPropagation={handleMouseDown}
  on:pointermove={handleMouseMove}
  on:pointerup={handleMouseUp}
  on:pointercancel={handleMouseUp}
  on:contextmenu|stopPropagation={handleContextMenu}
>
  <div class="header">
    <span>debt.node</span>
    <button on:click={toggleEdit} disabled={isNonFunctional}>
      <span class="material-icons">
        {isEditing ? "done" : "edit"}
      </span>
    </button>
  </div>

  {#if isEditing && !isNonFunctional}
    <div class="add-debt-form">
      <select bind:value={newType} class="type-select">
        <option value="credit">Credit Card</option>
        <option value="loan">Loan</option>
      </select>

      <input
        type="text"
        bind:value={newSource}
        placeholder="Source (e.g. Chase, Student Loan)"
        class="source-input"
      />

      <input
        type="number"
        bind:value={newBalance}
        placeholder="Current Balance"
        class="balance-input"
        min="0"
        step="0.01"
      />

      {#if newType === 'credit'}
        <input
          type="number"
          bind:value={newLimit}
          placeholder="Credit Limit"
          class="limit-input"
          min="0"
          step="0.01"
        />
      {/if}

      <input
        type="number"
        bind:value={newMinPayment}
        placeholder="Minimum Payment"
        class="payment-input"
        min="0"
        step="0.01"
      />

      <input
        type="number"
        bind:value={newAPR}
        placeholder="APR %"
        class="apr-input"
        min="0"
        max="100"
        step="0.1"
      />

      <button on:click={addDebt} class="add-button">
        Add {newType === 'credit' ? 'Credit Card' : 'Loan'}
      </button>
    </div>
  {/if}

  <div class="main-content">
    <div class="left-panel">
      <div class="debts-list">
        {#each debts as debt, index}
          <div class="debt-item" class:credit={debt.type === 'credit'} class:loan={debt.type === 'loan'}>
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
          on:click={() => openEditModal(index)} 
          disabled={isNonFunctional}
          title="Edit debt"
        >
          <span class="material-icons">edit</span>
        </button>
        <button 
          on:click={() => removeDebt(index)} 
          disabled={isNonFunctional}
          title="Delete debt"
        >
          <span class="material-icons">delete</span>
        </button>
        <button 
          on:click={() => openBalanceModal(index, 'subtract')} 
          disabled={isNonFunctional}
          title="Subtract from balance"
          class="balance-btn subtract"
        >
          <span class="material-icons">remove_circle</span>
        </button>
        <button 
          on:click={() => openBalanceModal(index, 'add')} 
          disabled={isNonFunctional}
          title="Add to balance"
          class="balance-btn add"
        >
          <span class="material-icons">add_circle</span>
        </button>
      </div>
    </div>
        {/each}
      </div>
    </div>

    <div class="right-panel">
      <div class="debt-summary">
        {#if creditBalance > 0}
          <div class="credit-section">
            <div class="section-title">Credit Card Summary</div>
            <div class="summary-item">
              <span class="label">Total Credit Balance:</span>
              <span class="amount negative">{formatCurrency(creditBalance)}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Credit Limit:</span>
              <span class="amount">{formatCurrency(totalLimit)}</span>
            </div>
            <div class="summary-item">
              <span class="label">Utilization Rate:</span>
              <span class="amount" class:high-utilization={utilizationRate > 30}>
                {formatPercent(utilizationRate)}
              </span>
            </div>
          </div>
        {/if}

        {#if loanBalance > 0}
          <div class="loan-section">
            <div class="section-title">Loan Summary</div>
            <div class="summary-item">
              <span class="label">Total Loan Balance:</span>
              <span class="amount negative">{formatCurrency(loanBalance)}</span>
            </div>
          </div>
        {/if}

        <div class="balance-section">
          <div class="summary-item total-balance">
            <span class="label">Total Overall Balance:</span>
            <span class="amount negative">{formatCurrency(totalBalance)}</span>
          </div>
        </div>

        <div class="payment-section">
          <div class="summary-item">
            <span class="label">Total Min Payment:</span>
            <span class="amount">{formatCurrency(totalMinPayment)}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{#if showBalanceModal}
  <Modal
    title="{balanceOperation === 'add' ? 'Add to' : 'Subtract from'} Balance"
    message="Enter amount to {balanceOperation} for {debts[selectedDebtIndex].source}:"
    bind:inputValue={balanceAdjustment}
    placeholder="Enter amount"
    inputType="number"
    confirmText="Confirm"
    on:confirm={handleBalanceAdjustment}
    on:cancel={() => {
      showBalanceModal = false;
      balanceAdjustment = '';
    }}
  />
{/if}

{#if showEditModal && editedDebt}
  <EditDebtModal
    debt={editedDebt}
    on:save={handleEditConfirm}
    on:cancel={() => {
      showEditModal = false;
      editedDebt = null;
    }}
  />
{/if}

<style>
  .debt-node {
    position: absolute;
    background-color: #e74c3c;
    color: white;
    padding: 12px;
    border-radius: 8px;
    cursor: move;
    user-select: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    touch-action: none;
    width: var(--node-width);
    height: var(--node-height);
    overflow: hidden;
  }

  /* Dynamic sizing */
  .debt-node {
    --node-width: 400px;
    --node-height: 350px;
    --content-offset: 60px;
  }

  .debt-node:has(.add-debt-form) {
    --content-offset: 350px;
    --node-height: 650px;
  }

  .debt-node:has(.debts-list:not(:empty)) {
    --node-width: 800px;
    transition: width 0.3s ease;
  }

  .main-content {
    display: flex;
    gap: 16px;
    margin-top: 12px;
    height: calc(100% - var(--content-offset));
  }

  /* Panel layout */
  .left-panel {
    flex: 0 1 0;
    overflow: hidden;
    position: relative;
    max-height: 100%;
    opacity: 0;
    width: 0;
  }

  .debt-node:has(.debts-list:not(:empty)) .left-panel {
    flex: 1;
    opacity: 1;
    width: auto;
    transition: opacity 0.3s ease;
  }

  .right-panel {
    flex: 1;
    overflow: hidden;
    position: relative;
    max-height: 100%;
  }

  /* Scrollable containers */
  .debts-list,
  .debt-summary {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    padding: 0 12px;
  }

  /* Keep remaining styles unchanged */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .add-debt-form {
    display: grid;
    gap: 8px;
    margin-bottom: 24px;
    background-color: rgba(255, 255, 255, 0.1);
    padding: 12px;
    border-radius: 6px;
  }

  /* Form input styling */
  .add-debt-form input,
  .add-debt-form select {
    padding: 6px;
    border: none;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.9);
    color: #2c3e50;
    transition: background-color 0.2s, box-shadow 0.2s;
  }

  .add-debt-form input:focus,
  .add-debt-form select:focus {
    background-color: white;
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.3);
    outline: none;
  }

  .dark-mode .add-debt-form input,
  .dark-mode .add-debt-form select {
    background-color: rgba(255, 255, 255, 0.8);
  }

  /* Section styling */
  .balance-section,
  .credit-section,
  .loan-section,
  .payment-section {
    padding: 8px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .credit-section {
    border-left: 4px solid #fdcb6e;
  }

  .loan-section {
    border-left: 4px solid #74b9ff;
  }

  .balance-section {
    border-left: 4px solid #ff7675;
  }

  .payment-section {
    border-left: 4px solid #a8e6cf;
    margin-bottom: 0;
  }

  .section-title {
    font-size: 0.9em;
    margin-bottom: 6px;
    opacity: 0.9;
  }

  /* Add button styling */
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

  /* Item styling */
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

  /* Text and data styling */
  .debt-content {
    flex-grow: 1;
    margin-right: 8px;
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

  .summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .total-balance {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-weight: bold;
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

  /* Button styling */
  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 4px;
    transition: opacity 0.2s;
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

  /* Selection and hover effects */
  .selected {
    box-shadow: 0 0 0 3px #41e0f5, 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .debt-node:hover {
    box-shadow: 0 0 0 3px #41e0f5, 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  /* Theme variations */
  .dark-mode {
    background-color: #c0392b;
  }

  .factory-node {
    position: relative;
  }

  .non-functional {
    pointer-events: none;
  }

  /* Modal container styling */
  .edit-modal-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }

  :global(.edit-modal-container .modal-content) {
    min-width: 300px;
    width: 90%;
    max-width: 400px;
  }

  :global(.edit-modal-container input) {
    width: 100%;
    padding: 8px;
    margin: 8px 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }

  :global(.edit-modal-container .modal-buttons) {
    margin-top: 16px;
  }
</style>
