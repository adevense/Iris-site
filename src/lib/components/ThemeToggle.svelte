<script>
	import { browser } from "$app/environment";
	import { setTheme, theme } from "$lib/appData";
    import { setContext } from "svelte"
    import { writable } from "svelte/store"
    import sora from '$lib/icons/SoraIcon.png';
    let currentTheme = $state(theme)

    if(browser){
        theme.subscribe(value => {
            currentTheme = value
        })
    }
</script>

<button onclick={() => setTheme(currentTheme == 'light' ? 'dark' : 'light')}>
    {#if currentTheme == 'light'}
        <i class="bi bi-sun-fill" style="color:yellow;"></i>
    {:else}
        <i class="bi bi-moon-fill" style="color:blue;"></i>
    {/if}
</button>

<style>
    button {
        border: none;
        background: none;
        outline: none;
        font-size: 30px;
    }
</style>