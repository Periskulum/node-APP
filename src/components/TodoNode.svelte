<script>
  import { createEventDispatcher } from 'svelte';
  import { getNextZIndex } from '../stores/zIndex.js';
  import { darkMode } from '../stores/darkMode.js';

  export let x = 0;
  export let y = 0;
  export let tasks = [];
  export let title = 'todo.node';
  export let isSelected = false;
  export let id;
  export let isFactoryNode = false;
  export let isNonFunctional = false;
  export let color = '';
  export let isLocked = false;

  const dispatch = createEventDispatcher();

  let isDragging = false;
  let startX, startY;
  let zIndex = getNextZIndex();
  let isEditing = false;
  let newTask = '';
  let newPriority = 'low';
  let newDueDate = '';

  $: isDarkMode = $darkMode;

  function handleMouseDown(event) {
    if (isNonFunctional || isFactoryNode || isLocked) return;
    if (event.button === 0) {
      startDragging(event);
    }
  }

  function startDragging(event) {
    if (!isEditing && event.target.closest('.todo-node')) {
      isDragging = true;
      startX = event.clientX - x;
      startY = event.clientY - y;
      zIndex = getNextZIndex();
      dispatch('select');
      event.target.setPointerCapture(event.pointerId);
    }
  }

  function handleMouseMove(event) {
    if (isDragging) {
      const newX = event.clientX - startX;
      const newY = event.clientY - startY;
      x = newX;
      y = newY;
      dispatch('move', { id, x: newX, y: newY });
    }
  }

  function handleMouseUp(event) {
    if (isDragging) {
      isDragging = false;
      event.target.releasePointerCapture(event.pointerId);
    }
  }

  function toggleEdit() {
    if (isNonFunctional) return;
    isEditing = !isEditing;
    if (!isEditing) {
      dispatchContentUpdate();
    }
  }

  function addTask() {
    if (newTask.trim()) {
      const updatedTasks = [...tasks, { text: newTask, priority: newPriority, dueDate: newDueDate }];
      updateTasks(updatedTasks);
      newTask = '';
      newPriority = 'low';
      newDueDate = '';
    }
  }

  function removeTask(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    updateTasks(updatedTasks);
  }

  function updateTasks(updatedTasks) {
    dispatch('contentUpdate', { id, tasks: updatedTasks });
  }

  // Listen for changes to the tasks prop
  $: if (tasks) {
    // You can add any additional logic here if needed when tasks prop changes
  }

  function handleContextMenu(event) {
    event.preventDefault();
    dispatch('contextmenu', { id, x: event.clientX, y: event.clientY });
  }
</script>

<div
  class="todo-node"
  role="group"
  class:dark-mode={isDarkMode}
  class:selected={isSelected}
  class:factory-node={isFactoryNode}
  class:non-functional={isNonFunctional}
  style="left: {isFactoryNode ? 0 : x}px; top: {isFactoryNode ? 0 : y}px; z-index: {zIndex}; background-color: {color};"
  on:pointerdown={handleMouseDown}
  on:pointermove={handleMouseMove}
  on:pointerup={handleMouseUp}
  on:pointercancel={handleMouseUp}
  on:contextmenu={handleContextMenu}
>
  <div class="header">
    <span>todo.node</span>
    <button on:click={toggleEdit} disabled={isNonFunctional}>
      <span class="material-icons">
        {isEditing ? 'done' : 'edit'}
      </span>
    </button>
  </div>
  <h3>{title}</h3>
  {#if isEditing && !isNonFunctional}
    <!-- svelte-ignore missing-declaration -->
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
      <input
        type="date"
        bind:value={newDueDate}
        class="due-date-input"
      />
      <button on:click={addTask}>Add Task</button>
    </div>
  {/if}
  <ul class="task-list">
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
    transition: box-shadow 0.3s ease, transform 0.3s ease;
    width: 300px;
    min-height: 150px;
  }

  .dark-mode {
    background-color: #2980b9;
  }

  .selected {
    box-shadow: 0 0 0 3px #27ae60, 0 2px 10px rgba(0, 0, 0, 0.2);
    transform: scale(1.05);
  }

  .todo-node:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }

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

  .add-task-form {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .task-input, .due-date-input {
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

  .factory-node {
    position: relative;
  }

  .non-functional {
    pointer-events: none;
  }
</style>