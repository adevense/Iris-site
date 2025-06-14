<script>
	import { onMount } from 'svelte';
	import { db, auth } from '$lib/firebase.js';
	import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

	let notes = '';
	let saveMessage = '';
	let campaignDate = 'Não definida';
	let campaignTime = 'Não definida';
	const userId = auth.currentUser?.uid;

	onMount(() => {
		if (!userId) return;

		// Caminho simplificado, igual ao da Ficha
		const notesRef = doc(db, `users/${userId}/notes/myNotes`);
		getDoc(notesRef).then((docSnap) => {
			if (docSnap.exists()) {
				notes = docSnap.data().content || '';
			}
		});

		// Caminho simplificado para os dados públicos
		const campaignTimeRef = doc(db, 'campaignTimeDate/current');
		const unsubscribe = onSnapshot(campaignTimeRef, (docSnap) => {
			if (docSnap.exists()) {
				const data = docSnap.data();
				campaignDate = data.campaignDate || 'Não definida';
				campaignTime = data.campaignTime || 'Não definida';
			}
		});

		return () => unsubscribe();
	});

	async function handleSaveNotes() {
		if (!userId) return;
		saveMessage = 'Salvando...';
		const notesRef = doc(db, `users/${userId}/notes/myNotes`);
		await setDoc(notesRef, { content: notes });
		saveMessage = 'Anotações salvas com sucesso!';
		setTimeout(() => (saveMessage = ''), 3000);
	}
</script>

<section id="notes-content" class="content-section active">
	<h2>Minhas Anotações</h2>
	<div class="main-content-area">
		<p>Use este espaço para suas anotações pessoais da campanha.</p>

		<div class="current-time-display">
			<p>Data Atual na Campanha: <strong>{campaignDate}</strong></p>
			<p>Hora Atual na Campanha: <strong>{campaignTime}</strong></p>
		</div>

		<textarea
			id="notesTextArea"
			bind:value={notes}
			placeholder="Comece a escrever suas anotações aqui..."
		></textarea>
		<button id="saveNoteButton" on:click={handleSaveNotes}>Salvar Anotações</button>

		{#if saveMessage}
			<p class="save-message" style="display: block;">{saveMessage}</p>
		{/if}
	</div>
</section>

<style>
	/* Estilos extraídos do seu CSS original para esta seção */
	.content-section {
		padding: 20px;
		background-color: #fcfcfc;
		border-radius: 8px;
	}
	.main-content-area {
		background-color: #ffffff;
		padding: 30px;
		border-radius: 10px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
	}
	.current-time-display {
		background-color: #f0f8ff;
		border: 1px solid #add8e6;
		border-radius: 8px;
		padding: 20px;
		text-align: center;
		margin-bottom: 20px;
	}
	.current-time-display p {
		margin: 0;
		font-size: 1.1em;
	}
	.current-time-display strong {
		display: block;
		font-size: 1.6em;
		color: #007bff;
		margin-top: 8px;
	}
	#notesTextArea {
		width: 100%;
		padding: 15px;
		margin-bottom: 15px;
		border: 1px solid #ccc;
		border-radius: 8px;
		box-sizing: border-box;
		font-size: 1em;
		resize: vertical;
		min-height: 300px;
	}
	#saveNoteButton {
		background-color: #28a745;
		color: white;
		font-size: 1em;
		padding: 14px;
		border: none;
		border-radius: 8px;
	}
	.save-message {
		margin-top: 10px;
		font-size: 0.9em;
		color: #28a745;
		font-weight: bold;
	}
</style>
