<script>
  import { createEventDispatcher } from "svelte";
  import { darkMode } from "../stores/darkMode.js";
  
  export let label = "home";
  export let id = "home-node";
  
  const dispatch = createEventDispatcher();
  
  function handleClick() {
    dispatch("homeClick");
  }
</script>

<div class="home-node" class:dark-mode={$darkMode}>
  <button on:click={handleClick}>
    <span class="material-icons">home</span>
  </button>
</div>

<style>
  .home-node {
    position: absolute;
    left: 0;
    top: 0;
    width: 60px;
    height: 60px;
    border-radius: 12px;
    pointer-events: auto;
  }

  button {
    width: 100%;
    height: 100%;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;
  }

  button:hover {
    box-shadow: 0 0 0 3px #41e0f5, 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .dark-mode button {
    background-color: #2c3e50;
  }

  .material-icons {
    font-size: 24px;
  }
</style>
