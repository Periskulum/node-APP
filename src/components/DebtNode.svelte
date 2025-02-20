<script>
  import { createEventDispatcher } from "svelte";
  import { getNextZIndex } from "../stores/zIndex.js";
  import { darkMode } from "../stores/darkMode.js";
  import { selectedNodes } from "../stores/selectionStore.js";
  import { zoomLevel } from "../stores/zoomStore.js";
  import DebtForm from "./debt/DebtForm.svelte";
  import DebtItem from "./debt/DebtItem.svelte";

  // Props
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

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Local state
  let isDragging = false;
  let startX, startY;
  let zIndex = getNextZIndex();
  let isEditing = false;

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
      startX = event.clientX - (x * $zoomLevel);
      startY = event.clientY - (y * $zoomLevel);
      zIndex = getNextZIndex();
      dispatch("select");
      event.target.setPointerCapture(event.pointerId);
    }
  }

  function handleMouseMove(event) {
    if (isDragging) {
      const newX = (event.clientX - startX) / $zoomLevel;
      const newY = (event.clientY - startY) / $zoomLevel;
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
  function handleAddDebt(event) {
    const updatedDebts = [...debts, event.detail];
    updateDebts(updatedDebts);
  }

  function handleEditDebt(index, event) {
    const updatedDebts = [...debts];
    updatedDebts[index] = event.detail;
    updateDebts(updatedDebts);
  }

  function handleUpdateDebt(index, event) {
    const updatedDebts = [...debts];
    updatedDebts[index] = event.detail;
    updateDebts(updatedDebts);
  }

  function handleDeleteDebt(index) {
    const updatedDebts = debts.filter((_, i) => i !== index);
    updateDebts(updatedDebts);
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
    <DebtForm on:addDebt={handleAddDebt} />
  {/if}

  <div class="main-content">
    <div class="left-panel">
      <div class="debts-list scrollable">
        {#each debts as debt, index}
          <DebtItem
            {debt}
            disabled={isNonFunctional}
            on:edit={(e) => handleEditDebt(index, e)}
            on:update={(e) => handleUpdateDebt(index, e)}
            on:delete={() => handleDeleteDebt(index)}
          />
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

  /* Header styling */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 4px;
    transition: opacity 0.2s;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .material-icons {
    font-size: 18px;
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

  /* Summary item styling */
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
</style>
