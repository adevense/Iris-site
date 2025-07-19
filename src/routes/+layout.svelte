<script>
    import 'bootstrap/dist/js/bootstrap.js'
    import 'bootstrap/dist/css/bootstrap.css';
    import 'bootstrap-icons/font/bootstrap-icons.css'
    import '../routes/styles/theme.css' 
	import NavBar from '$lib/components/NavBar.svelte'
    import ThemeToggle from '$lib/components/ThemeToggle.svelte';
    import { auth } from '$lib/firebase';
    import { theme, userStore } from '$lib/appData';
	import { browser } from '$app/environment';
    import { page } from '$app/state';
	import { onMount } from 'svelte';
    import { onAuthStateChanged } from 'firebase/auth';
	import { goto } from '$app/navigation';
    let { children } = $props()
    const publicRoutes = ['/', '/registrar']

    if(browser){
        theme.subscribe(value => {
            document.documentElement.setAttribute('data-bs-theme', value)
        })
    }

    onMount(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                $userStore = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                }
            } else {
                $userStore = null
            }
        })
        return () => unsubscribe()
    })

    $effect(() => {
        if(!$userStore && !publicRoutes.includes(page.url.pathname)){
            goto('/Iris-site')
        } else if($userStore && publicRoutes.includes(page.url.pathname)){
            goto('/Iris-site/dashboard')
        }
    })
</script>   

<svelte:head>
    <title>Iris OP</title>
</svelte:head>

<div class="container-fluid">
    {#if $userStore || publicRoutes.includes(page.url.pathname)}
        {#if !publicRoutes.includes(page.url.pathname)}
            <NavBar/>
        {:else}
            <div style="position: absolute; right: 0px;">
                <ThemeToggle/>
            </div>
        {/if}
        {@render children()}
    {/if}
</div>