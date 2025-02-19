<script>
  import { onMount } from 'svelte';

  let target;
  
  onMount(() => {
    target = document.createElement('div');
    document.body.appendChild(target);
    return () => {
      document.body.removeChild(target);
    };
  });
</script>

{#if target}
  <svelte:portal target={target}>
    <slot />
  </svelte:portal>
{/if}
