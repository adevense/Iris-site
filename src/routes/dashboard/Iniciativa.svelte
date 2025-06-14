<script>
	import { onMount } from 'svelte';
	import { db, auth } from '$lib/firebase.js';
	import {
		collection,
		doc,
		getDoc,
		setDoc,
		onSnapshot,
		writeBatch,
		getDocs
	} from 'firebase/firestore';

	export let isAdmin = false;
	let initiativeValue = null;
	let initiatives = [];
	let message = '';
	const userId = auth.currentUser?.uid;

	onMount(() => {
		if (!userId) return;

		const initiativesRef = collection(db, 'initiatives');
		const unsubscribe = onSnapshot(initiativesRef, (snapshot) => {
			let fetchedInitiatives = snapshot.docs.map((doc) => doc.data());
			initiatives = fetchedInitiatives.sort((a, b) => (b.value || 0) - (a.value || 0));
		});

		return () => unsubscribe();
	});

	async function handleAddInitiative() {
		if (!userId || initiativeValue === null || isNaN(initiativeValue)) {
			message = 'Por favor, insira um valor numérico.';
			return;
		}

		let characterName = auth.currentUser.displayName || auth.currentUser.email;
		const sheetRef = doc(db, `users/${userId}/characterSheets/mySheet`);
		const sheetSnap = await getDoc(sheetRef);
		if (sheetSnap.exists() && sheetSnap.data().nome) {
			characterName = sheetSnap.data().nome;
		}

		const initiativeRef = doc(db, 'initiatives', userId);
		await setDoc(initiativeRef, {
			userId: userId,
			characterName: characterName,
			value: Number(initiativeValue),
			timestamp: Date.now()
		});
		message = `Sua iniciativa (${initiativeValue}) foi atualizada!`;
		setTimeout(() => (message = ''), 3000);
	}

	async function handleClearInitiatives() {
		if (!isAdmin || !confirm('Tem certeza que deseja limpar TODAS as iniciativas?')) return;

		const initiativesRef = collection(db, 'initiatives');
		const snapshot = await getDocs(initiativesRef);
		const batch = writeBatch(db);
		snapshot.forEach((doc) => batch.delete(doc.ref));
		await batch.commit();

		message = 'Todas as iniciativas foram limpas!';
		setTimeout(() => (message = ''), 3000);
	}
</script>

<section id="initiative-content" class="content-section active">
	<h2>Controle de Iniciativa</h2>
	<div class="main-content-area">
		<p>Adicione seu valor de iniciativa e acompanhe a ordem.</p>
		<div class="initiative-controls">
			<div class="input-group">
				<label for="initiativeValue">Meu Valor de Iniciativa:</label>
				<input
					type="number"
					id="initiativeValue"
					bind:value={initiativeValue}
					placeholder="Ex: 15"
				/>
			</div>
			<button id="addInitiativeButton" on:click={handleAddInitiative}>Adicionar/Atualizar</button>
		</div>
		{#if message}
			<p class="feedback-message">{message}</p>
		{/if}

		<h3>Ordem da Iniciativa</h3>
		<div class="initiative-list-container">
			{#if initiatives.length === 0}
				<p style="text-align: center; color: #777;">Nenhuma iniciativa adicionada.</p>
			{:else}
				{#each initiatives as item (item.userId)}
					<div class="initiative-item">
						<strong>{item.characterName || 'Desconhecido'}</strong>
						<span>{item.value}</span>
					</div>
				{/each}
			{/if}
		</div>

		{#if isAdmin}
			<div class="admin-controls">
				<h3>Controles do Mestre</h3>
				<button id="clearInitiativeButton" on:click={handleClearInitiatives}
					>Limpar Todas as Iniciativas</button
				>
			</div>
		{/if}
	</div>
</section>

<style>
	.main-content-area {
		background-color: #ffffff;
		padding: 30px;
		border-radius: 10px;
	}
	.initiative-controls {
		display: flex;
		gap: 15px;
		margin-bottom: 25px;
		align-items: center;
		flex-wrap: wrap;
	}
	.initiative-controls .input-group {
		flex-grow: 1;
		margin-bottom: 0;
	}
	.input-group input {
		width: 100%;
		box-sizing: border-box;
		padding: 12px;
		border: 1px solid #ccc;
		border-radius: 8px;
	}
	#addInitiativeButton {
		width: auto;
		flex-shrink: 0;
		padding: 12px 20px;
		border: none;
		border-radius: 8px;
		background-color: #007bff;
		color: white;
	}
	.feedback-message {
		margin-top: 10px;
		color: #28a745;
		font-weight: bold;
	}
	.initiative-list-container {
		max-height: 400px;
		overflow-y: auto;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		padding: 15px;
	}
	.initiative-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 15px;
		border-bottom: 1px solid #eee;
	}
	.initiative-item:last-child {
		border-bottom: none;
	}
	.initiative-item strong {
		color: #2c3e50;
	}
	.initiative-item span {
		font-weight: bold;
		color: #007bff;
	}
	.admin-controls {
		margin-top: 30px;
		padding-top: 20px;
		border-top: 1px solid #e0e0e0;
		text-align: center;
	}
	#clearInitiativeButton {
		background-color: #dc3545;
		color: white;
		width: auto;
		padding: 12px 25px;
		border: none;
		border-radius: 8px;
	}
</style>