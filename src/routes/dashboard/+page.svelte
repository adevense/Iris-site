<script>
	import { userStore } from '$lib/stores.js';
	import { auth, db } from '$lib/firebase.js';
	import { doc, getDoc, collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
	import { onMount } from 'svelte';
	import { signOut } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import Ficha from './Ficha.svelte';
	import Anotacoes from './Anotacoes.svelte';
	import Iniciativa from './Iniciativa.svelte';
	import MensagensMestre from './MensagensMestre.svelte';
	import ResumosSessao from './ResumosSessao.svelte';
	import Administracao from './Administracao.svelte';

	let activeTab = 'ficha';
	let userName = 'Aventureiro';
	let isAdmin = false;

	onMount(async () => {
		let unsubscribeListener = null;
		try {
			const user = $userStore;
			const adminDocRef = doc(db, 'adminUsers', user.uid);
			const adminDoc = await getDoc(adminDocRef);		
			isAdmin = adminDoc.exists();

			const sheetDocRef = doc(db, 'users', user.uid, 'characterSheets', 'mySheet');
			const sheetDoc = await getDoc(sheetDocRef);
			if (sheetDoc.exists() && sheetDoc.data().nomePlayer) {
				userName = sheetDoc.data().nomePlayer;
			} else {
				userName = user.displayName || user.email;
			}

			if(isAdmin){
				const messagesRef = collection(db, 'masterMessages');
				const repliesToMeQuery = query(messagesRef);
				unsubscribeListener = onSnapshot(repliesToMeQuery, (snapshot) => {
					const msg = snapshot.docChanges()[0];
					console.log(msg)
					if(msg && msg.type == "added"){
						const data = msg.doc.data();		
						console.log(data)
						alert(`Você recebeu uma mensagem de ${data.senderName}`);
					}
				});
			}
		} catch (error) {
			console.error(error);
		}


	return () => {
		if(unsubscribeListener) unsubscribeListener();
	}
});

	async function handleLogout() {
		await signOut(auth);
		await goto('/Iris-site');
	}
</script>

<div class="app-container">
	<aside class="sidebar">
		<div class="sidebar-header">
			<h3>Olá, {userName}!</h3>
		</div>
		<nav class="sidebar-nav">
			<ul>
				<li>
					<button
						class="sidebar-link"
						class:active={activeTab === 'ficha'}
						on:click={() => (activeTab = 'ficha')}
					>
						<i class="fas fa-scroll"></i> Ficha de Personagem
					</button>
				</li>
				<li>
					<button
						class="sidebar-link"
						class:active={activeTab === 'anotacoes'}
						on:click={() => (activeTab = 'anotacoes')}
					>
						<i class="fas fa-sticky-note"></i> Minhas Anotações
					</button>
				</li>
				<li>
					<button
						class="sidebar-link"
						class:active={activeTab === 'iniciativa'}
						on:click={() => (activeTab = 'iniciativa')}
					>
						<i class="fas fa-dice-d20"></i> Controle de Iniciativa
					</button>
				</li>
				<li>
					<button
						class="sidebar-link"
						class:active={activeTab === 'mensagens'}
						on:click={() => (activeTab = 'mensagens')}
					>
						<i class="fas fa-envelope-open-text"></i> Mensagem para o Mestre
					</button>
				</li>
				<li>
					<button
						class="sidebar-link"
						class:active={activeTab === 'resumos'}
						on:click={() => (activeTab = 'resumos')}
					>
						<i class="fas fa-book-open"></i> Resumos de Sessão
					</button>
				</li>
				{#if isAdmin}
					<li>
						<button
							class="sidebar-link"
							class:active={activeTab === 'admin'}
							on:click={() => (activeTab = 'admin')}
						>
							<i class="fas fa-shield-alt"></i> Administração
						</button>
					</li>
				{/if}
				<li>
					<button class="sidebar-link" on:click={handleLogout}>
						<i class="fas fa-sign-out-alt"></i> Sair
					</button>
				</li>
			</ul>
		</nav>
	</aside>

	<main class="content">
		{#if activeTab === 'ficha'}
			<Ficha />
		{:else if activeTab === 'anotacoes'}
			<Anotacoes />
		{:else if activeTab === 'iniciativa'}
			<Iniciativa {isAdmin} />
		{:else if activeTab === 'mensagens'}
			<MensagensMestre {isAdmin} />
		{:else if activeTab === 'resumos'}
			<ResumosSessao />
		{:else if activeTab === 'admin' && isAdmin}
			<Administracao />
		{/if}
	</main>
</div>

<style>
    /* Estilos completos para o layout do Dashboard */

    /* Container principal da aplicação */
    .app-container {
        display: flex; /* MUDANÇA CRÍTICA: Removido o 'display: none' */
        width: 100vw;
        height: 100vh;
        background-color: #ffffff;
        overflow: hidden;
    }

    /* Sidebar (Navegação Lateral) */
    .sidebar {
        width: 280px;
        background-color: #2c3e50;
        color: #ecf0f1;
        padding: 25px 0;
        box-shadow: 3px 0 10px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        flex-shrink: 0; /* Impede que a sidebar encolha */
        box-sizing: border-box;
    }

    .sidebar-header {
        text-align: center;
        margin-bottom: 40px;
        padding: 0 20px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sidebar-header h3 {
        margin: 0;
        font-size: 26px;
        color: #ecf0f1;
        font-weight: 700;
    }

    .sidebar-nav ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .sidebar-nav li {
        margin-bottom: 5px;
    }

    /* Estilo para os botões da sidebar, adaptado da tag <a> original */
    .sidebar-link {
        /* Reset de estilos de botão */
        background: none;
        border: none;
        text-align: left;
        width: 100%;
        
        display: flex;
        align-items: center;
        gap: 15px; 
        padding: 15px 25px;
        text-decoration: none;
        color: #ecf0f1;
        transition: background-color 0.3s ease, color 0.3s ease;
        font-size: 1.05em;
        font-weight: 500;
    }

    .sidebar-link:hover,
    .sidebar-link.active {
        background-color: #34495e;
        color: #ffffff;
        border-left: 5px solid #007bff;
        padding-left: 20px; 
    }

    .content {
        flex-grow: 1;
        padding: 30px;
        display: flex;
        flex-direction: column;
        background-color: #f9f9f9;
        overflow-y: auto; 
    }

    @media (max-width: 768px) {
        .app-container {
            flex-direction: column;
            height: auto;
            min-height: 100vh;
        }
        .sidebar {
            width: 100%;
            height: auto;
            min-height: auto;
            border-right: none;
            border-bottom: 1px solid #34495e;
        }
        .content {
            padding: 20px;
        }
    }
</style>