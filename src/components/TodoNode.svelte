<script>
  // Import necessary functions and stores from Svelte and other modules
  import { createEventDispatcher } from "svelte";
  import { getNextZIndex } from "../stores/zIndex.js";
  import { darkMode } from "../stores/darkMode.js";
  import { selectedNodes } from "../stores/selectionStore.js";
  import { zoomLevel } from "../stores/zoomStore.js";

  // Define component props
  export let x = 0;
  export let y = 0;
  export let tasks = [];
  export let label = "";
  export let title = "todo.node";
  export let isSelected = false;
  export let id;
  export let isFactoryNode = false;
  export let isNonFunctional = false;
  export let color = "";
  export let isLocked = false;

  // Create event dispatcher
  const dispatch = createEventDispatcher();

  // Local state variables
  let isDragging = false;
  let startX, startY;
  let zIndex = getNextZIndex();
  let isEditing = false;
  let newTask = "";
  let newPriority = "low";
  let newDueDate = "";

  // Reactive statements
  $: isSelected = $selectedNodes.includes(id);
  $: isDarkMode = $darkMode;

  // Handle mouse down event for dragging and selecting nodes
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

  // Start dragging the node
  function startDragging(event) {
    if (!isEditing && event.target.closest(".todo-node")) {
      isDragging = true;
      startX = event.clientX - (x * $zoomLevel);
      startY = event.clientY - (y * $zoomLevel);
      zIndex = getNextZIndex();
      dispatch("select");
      event.target.setPointerCapture(event.pointerId);
    }
  }

  // Handle mouse move event to update node position
  function handleMouseMove(event) {
    if (isDragging) {
      const newX = (event.clientX - startX) / $zoomLevel;
      const newY = (event.clientY - startY) / $zoomLevel;
      x = newX;
      y = newY;
      dispatch("move", { id, x: newX, y: newY });
    }
  }

  // Handle mouse up event to stop dragging
  function handleMouseUp(event) {
    if (isDragging) {
      isDragging = false;
      event.target.releasePointerCapture(event.pointerId);
    }
  }

  // Toggle edit mode
  function toggleEdit() {
    if (isNonFunctional) return;
    isEditing = !isEditing;
    if (!isEditing) {
      dispatchContentUpdate();
    }
  }

  // Add a new task to the list
  function addTask() {
    if (newTask.trim()) {
      const updatedTasks = [
        ...tasks,
        { text: newTask, priority: newPriority, dueDate: newDueDate },
      ];
      updateTasks(updatedTasks);
      newTask = "";
      newPriority = "low";
      newDueDate = "";
    }
  }

  // Remove a task from the list
  function removeTask(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    updateTasks(updatedTasks);
  }

  // Update tasks and dispatch content update event
  function updateTasks(updatedTasks) {
    dispatch("contentUpdate", { id, tasks: updatedTasks });
  }

  // Dispatch content update event
  function dispatchContentUpdate() {
    dispatch("contentUpdate", { id, title, tasks });
  }

  // Handle context menu event
  function handleContextMenu(event) {
    event.preventDefault();
    dispatch("contextmenu", { id, x: event.clientX, y: event.clientY });
  }
</script>

<!-- Main container for the todo node -->
<div
  class="todo-node"
  role="group"
  {label}
  class:dark-mode={isDarkMode}
  class:selected={isSelected}
  class:factory-node={isFactoryNode}
  class:non-functional={isNonFunctional}
  style="left: {isFactoryNode ? 0 : x}px; top: {isFactoryNode
    ? 0
    : y}px; z-index: {zIndex}; background-color: {color};"
  on:pointerdown|stopPropagation={handleMouseDown}
  on:pointermove={handleMouseMove}
  on:pointerup={handleMouseUp}
  on:pointercancel={handleMouseUp}
  on:contextmenu|stopPropagation={handleContextMenu}
>
  <!-- Header section with title and edit button -->
  <div class="header">
    <span>todo.node</span>
    <button on:click={toggleEdit} disabled={isNonFunctional}>
      <span class="material-icons">
        {isEditing ? "done" : "edit"}
      </span>
    </button>
  </div>
  <h3>{title}</h3>

  <!-- Edit mode input fields -->
  {#if isEditing && !isNonFunctional}
    <input
      bind:value={title}
      placeholder="enter.title"
      class="title-input"
      on:input={() => dispatchContentUpdate()}
    />
    <div class="add-task-form">
      <input
        bind:value={newTask}
        placeholder="New task description"
        class="task-input"
      />
      <select bind:value={newPriority}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <input type="date" bind:value={newDueDate} class="due-date-input" />
      <button on:click={addTask}>Add Task</button>
    </div>
  {/if}

  <!-- Task list -->
  <ul class="task-list scrollable">
    {#each tasks as task, index}
      <li class="task-item {task.priority}">
        <div class="task-content">
          <span>{task.text}</span>
          {#if task.dueDate}
            <span class="due-date">(Due: {task.dueDate})</span>
          {/if}
        </div>
        <button on:click={() => removeTask(index)} disabled={isNonFunctional}>
          <span class="material-icons">delete</span>
        </button>
      </li>
    {/each}
  </ul>
</div>

<style>
  /* Styles for the todo node component */
  .todo-node {
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
    transition:
      box-shadow 0.3s ease,
      transform 0.3s ease;
    width: 300px;
    min-height: 150px;
  }

  /* Dark mode styles */
  .dark-mode {
    background-color: #2980b9;
  }

  /* Selected node styles */
  .selected {
    box-shadow:
      0 0 0 3px #41e0f5,
      0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .selected.dark-mode {
    box-shadow:
      0 0 0 3px #41e0f5,
      0 2px 10px rgba(0, 0, 0, 0.2);
  }

  /* Hover styles */
  .todo-node:hover {
    box-shadow:
      0 0 0 3px #41e0f5,
      0 2px 10px rgba(0, 0, 0, 0.2);
  }

  /* Header styles */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  h3 {
    margin: 0;
    text-align: center;
    margin-bottom: 8px;
  }

  /* Title input styles */
  .title-input {
    width: calc(100% - 16px);
    background-color: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 4px;
    color: white;
    padding: 4px 8px;
    font-size: 16px;
    text-align: center;
    margin-bottom: 8px;
  }

  /* Add task form styles */
  .add-task-form {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .task-input,
  .due-date-input {
    flex-grow: 1;
    padding: 4px;
    border-radius: 4px;
    border: none;
  }

  select {
    padding: 4px;
    border-radius: 4px;
  }

  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .material-icons {
    font-size: 18px;
  }

  /* Task list styles */
  .task-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  .task-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 8px;
    margin-bottom: 8px;
  }

  .task-item.low {
    border-left: 4px solid #2ecc71;
  }

  .task-item.medium {
    border-left: 4px solid #f1c40f;
  }

  .task-item.high {
    border-left: 4px solid #e74c3c;
  }

  .due-date {
    margin-left: 8px;
    font-size: 12px;
    color: #ecf0f1;
  }

  /* Factory node styles */
  .factory-node {
    position: relative;
  }

  /* Non-functional node styles */
  .non-functional {
    pointer-events: none;
  }
</style>
