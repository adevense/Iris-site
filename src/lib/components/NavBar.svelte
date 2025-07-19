<script>
    import { tab, userStore } from '$lib/appData';
    import { signOut } from 'firebase/auth';
    import { goto } from '$app/navigation';
    import { doc, getDoc } from 'firebase/firestore';
    import { auth, db } from '$lib/firebase';
	import ThemeToggle from './ThemeToggle.svelte';
	import { onMount } from 'svelte';

    let isAdmin = false;
	onMount(async () => {
		let unsubscribeListener = null;
		try {
			const user = $userStore;
			const adminDocRef = doc(db, 'adminUsers', user.uid);
			const adminDoc = await getDoc(adminDocRef);
			isAdmin = adminDoc.exists();
		} catch (error) {
			console.error(error);
		}
		return () => {
			if (unsubscribeListener) unsubscribeListener();
		}
	})

    async function handleLogout() {
		await signOut(auth);
		await goto('/');
	}
</script>

<nav class="navbar fixed-top bg-body-tertiary">
	<button
		class="navbar-toggler border-0"
		data-bs-toggle="offcanvas"
		data-bs-target="#mySideBar"
		aria-label="toggleSidebar"
		style="box-shadow:none;"
	>
		<i class="bi bi-list"></i>
	</button>
	<div class="btn-group">
		<ThemeToggle />
	</div>
</nav>

<div class="offcanvas offcanvas-start" tabindex="-1" id="mySideBar" style="max-width: 80%;">
	<div class="offcanvas-header">
		<h5 class="offcanvas-title">Ordem Paranormal</h5>
		<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
	</div>
	<div class="offcanvas-body">
		<ul class="navbar-nav justify-content-end flex-grow-1 pe-3 text-center">
			<li class="nav-item border border-3 rounded p-2 mb-3"><button class="w-100" type="button" data-bs-dismiss="offcanvas" onclick={() => tab.update(v => v = 0)}>Ficha</button></li>
			<li class="nav-item border border-3 rounded p-2 mb-3"><button class="w-100" type="button" data-bs-dismiss="offcanvas" onclick={() => tab.update(v => v = 1)}>Minhas anotações</button></li>
			<li class="nav-item border border-3 rounded p-2 mb-3"><button class="w-100" type="button" data-bs-dismiss="offcanvas" onclick={() => tab.update(v => v = 2)}>Iniciativa</button></li>
			<li class="nav-item border border-3 rounded p-2 mb-3"><button class="w-100" type="button" data-bs-dismiss="offcanvas" onclick={() => tab.update(v => v = 3)}>Chat</button></li>
			<li class="nav-item border border-3 rounded p-2 mb-3"><button class="w-100" type="button" data-bs-dismiss="offcanvas" onclick={() => tab.update(v => v = 4)}>Resumos de sessão</button></li>
			<li class="nav-item border border-3 rounded p-2 mb-3"><button class="w-100" type="button" data-bs-dismiss="offcanvas" onclick={() => tab.update(v => v = 6)}>Personagens</button></li>
			{#if isAdmin}
                <li class="nav-item border border-3 rounded p-2 mb-3"><button class="w-100" type="button" data-bs-dismiss="offcanvas" onclick={() => tab.update(v => v = 5)}>Administração</button></li>
            {/if}
            <li class="nav-item border border-3 rounded p-2 mb-3"><button class="w-100" type="button" data-bs-dismiss="offcanvas" onclick={handleLogout}>Sair</button></li>
		</ul>
	</div>
</div>

<style>
    button {
        background: none;
        outline: none;
        border: none;
    }
</style>
