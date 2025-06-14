<script>
    import '$lib/style.css';
	import { onMount } from 'svelte';
    import { auth } from '$lib/firebase.js'; 
    import { userStore } from '$lib/stores.js';
    import { onAuthStateChanged } from 'firebase/auth';
    import { tick } from 'svelte';
	import { goto } from '$app/navigation';
    import { page } from '$app/state';
    const publicRoutes = ['/', '/registro']

	onMount(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                $userStore = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                };
            } else {
                $userStore = null;
            }
        });
        return () => unsubscribe();
    });

    $: {
        if ($userStore === null){
            goto('/Ordem-site');
        }
    }
</script>

{#if $userStore || publicRoutes.includes(page.route.id)}
    <slot />
{/if}