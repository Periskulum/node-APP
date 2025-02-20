<script>
  import { createEventDispatcher } from "svelte";
  import { getNextZIndex } from "../stores/zIndex.js";
  import { darkMode } from "../stores/darkMode.js";
  import { selectedNodes } from "../stores/selectionStore.js";
  import { zoomLevel } from "../stores/zoomStore.js";

  // Props
  export let x = 0;
  export let y = 0;
  export let transactions = [];
  export let budget = {};
  export let label = "";
  export let title = "budget.node";
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
  let newAmount = "";
  let newCategory = "";
  let newDescription = "";
  let newDate = new Date().toISOString().slice(0, 10);
  let transactionType = "expense";

  // Calculated properties
  $: isSelected = $selectedNodes.includes(id);
  $: isDarkMode = $darkMode;
  $: totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  $: totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  $: balance = totalIncome - totalExpenses;

  // Categories
  const categories = {
    income: ["Salary", "Freelance", "Investments", "Other"],
    expense: ["Food", "Transportation", "Housing", "Utilities", "Entertainment", "Other"]
  };

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
    if (!isEditing && event.target.closest(".budget-node")) {
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

  // Transaction management
  function addTransaction() {
    if (newAmount && newCategory && newDescription) {
      const amount = parseFloat(newAmount);
      if (!isNaN(amount)) {
        const updatedTransactions = [
          ...transactions,
          {
            amount,
            category: newCategory,
            description: newDescription,
            date: newDate,
            type: transactionType
          }
        ];
        updateTransactions(updatedTransactions);
        resetForm();
      }
    }
  }

  function removeTransaction(index) {
    const updatedTransactions = transactions.filter((_, i) => i !== index);
    updateTransactions(updatedTransactions);
  }

  function resetForm() {
    newAmount = "";
    newCategory = "";
    newDescription = "";
    newDate = new Date().toISOString().slice(0, 10);
    transactionType = "expense";
  }

  function updateTransactions(updatedTransactions) {
    dispatch("contentUpdate", { id, transactions: updatedTransactions });
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
      currency: 'USD'
    }).format(amount);
  }
</script>

<div
  class="budget-node"
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
    <span>budget.node</span>
    <button on:click={toggleEdit} disabled={isNonFunctional}>
      <span class="material-icons">
        {isEditing ? "done" : "edit"}
      </span>
    </button>
  </div>

  <div class="budget-summary" class:positive={balance >= 0} class:negative={balance < 0}>
    <div class="summary-item">
      <span class="label">Income:</span>
      <span class="amount">{formatCurrency(totalIncome)}</span>
    </div>
    <div class="summary-item">
      <span class="label">Expenses:</span>
      <span class="amount">{formatCurrency(totalExpenses)}</span>
    </div>
    <div class="summary-item balance">
      <span class="label">Balance:</span>
      <span class="amount">{formatCurrency(balance)}</span>
    </div>
  </div>

  {#if isEditing && !isNonFunctional}
    <div class="add-transaction-form">
      <select bind:value={transactionType} class="type-select">
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <input
        type="number"
        bind:value={newAmount}
        placeholder="Amount"
        class="amount-input"
        min="0"
        step="0.01"
      />

      <select bind:value={newCategory} class="category-select">
        <option value="">Select Category</option>
        {#each categories[transactionType] as category}
          <option value={category}>{category}</option>
        {/each}
      </select>

      <input
        type="text"
        bind:value={newDescription}
        placeholder="Description"
        class="description-input"
      />

      <input
        type="date"
        bind:value={newDate}
        class="date-input"
      />

      <button on:click={addTransaction} class="add-button">
        Add Transaction
      </button>
    </div>
  {/if}

  <div class="transactions-list scrollable">
    {#each transactions as transaction, index}
      <div class="transaction-item" class:income={transaction.type === 'income'} class:expense={transaction.type === 'expense'}>
        <div class="transaction-content">
          <div class="transaction-header">
            <span class="transaction-category">{transaction.category}</span>
            <span class="transaction-amount">{formatCurrency(transaction.amount)}</span>
          </div>
          <div class="transaction-details">
            <span class="transaction-description">{transaction.description}</span>
            <span class="transaction-date">{transaction.date}</span>
          </div>
        </div>
        <button on:click={() => removeTransaction(index)} disabled={isNonFunctional}>
          <span class="material-icons">delete</span>
        </button>
      </div>
    {/each}
  </div>
</div>

<style>
  .budget-node {
    position: absolute;
    background-color: #3498db;
    color: white;
    padding: 12px;
    border-radius: 8px;
    cursor: move;
    user-select: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    touch-action: none;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
    width: 350px;
    min-height: 200px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .budget-summary {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 12px;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .balance {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    font-weight: bold;
  }

  .positive .balance .amount {
    color: #2ecc71;
  }

  .negative .balance .amount {
    color: #e74c3c;
  }

  .add-transaction-form {
    display: grid;
    gap: 8px;
    margin-bottom: 12px;
    grid-template-columns: repeat(2, 1fr);
  }

  .type-select,
  .amount-input,
  .category-select,
  .description-input,
  .date-input {
    padding: 6px;
    border: none;
    border-radius: 4px;
    background-color: white;
  }

  .description-input {
    grid-column: span 2;
  }

  .add-button {
    grid-column: span 2;
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
  }

  .add-button:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  .transactions-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .transaction-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 8px;
    margin-bottom: 8px;
  }

  .transaction-item.income {
    border-left: 4px solid #2ecc71;
  }

  .transaction-item.expense {
    border-left: 4px solid #e74c3c;
  }

  .transaction-content {
    flex-grow: 1;
  }

  .transaction-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .transaction-details {
    display: flex;
    justify-content: space-between;
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.8);
  }

  .transaction-category {
    font-weight: bold;
  }

  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 4px;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .material-icons {
    font-size: 18px;
  }

  .selected {
    box-shadow: 0 0 0 3px #41e0f5, 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .budget-node:hover {
    box-shadow: 0 0 0 3px #41e0f5, 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .dark-mode {
    background-color: #2980b9;
  }

  .factory-node {
    position: relative;
  }

  .non-functional {
    pointer-events: none;
  }
</style>
