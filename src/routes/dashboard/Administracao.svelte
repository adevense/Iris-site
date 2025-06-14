<script>
	import { onMount } from 'svelte';
	import { db, auth } from '$lib/firebase.js';
	import {
		doc,
		onSnapshot,
		setDoc,
		collection,
		addDoc,
		collectionGroup,
		getDocs,
		query
	} from 'firebase/firestore';

	let campaignDateInput = '';
	let campaignTimeInput = '';
	let displayCampaignDate = 'Não definida';
	let displayCampaignTime = 'Não definida';
	let summaryTitle = '';
	let summaryContent = '';
	let players = [];
	let message = '';

	onMount(() => {
		const timeRef = doc(db, 'campaignTimeDate/current');
		const unsubTime = onSnapshot(timeRef, (docSnap) => {
			if (docSnap.exists()) {
				const data = docSnap.data();
				displayCampaignDate = data.campaignDate || 'Não definida';
				displayCampaignTime = data.campaignTime || 'Não definida';
			}
		});

		const sheetsQuery = query(collectionGroup(db, 'characterSheets'));
		getDocs(sheetsQuery)
			.then((snapshot) => {
				players = snapshot.docs.map((doc) => {
					const data = doc.data();
					const path = doc.ref.path.split('/');
					const userId = path[path.indexOf('users') + 1];
					return { userId, playerName: data.nomePlayer, characterName: data.nome };
				});
			})
			.catch((err) => {
				message = 'Erro ao carregar jogadores. Verifique o índice do Firestore.';
			});

		return () => unsubTime();
	});

	async function handleSaveTimeDate() {
		const timeRef = doc(db, 'campaignTimeDate/current');
		await setDoc(
			timeRef,
			{ campaignDate: campaignDateInput, campaignTime: campaignTimeInput },
			{ merge: true }
		);
		message = 'Hora/Data da campanha atualizada!';
		setTimeout(() => (message = ''), 3000);
	}

	async function handleSaveSummary() {
		const summariesRef = collection(db, 'sessionSummaries');
		await addDoc(summariesRef, {
			title: summaryTitle,
			content: summaryContent,
			timestamp: Date.now(),
			createdBy: auth.currentUser.displayName || auth.currentUser.email
		});
		summaryTitle = '';
		summaryContent = '';
		message = 'Resumo da sessão publicado!';
		setTimeout(() => (message = ''), 3000);
	}
</script>

<section id="admin-content" class="content-section active">
	<h2>Área de Administração</h2>
	{#if message}<p class="save-message" style="display:block;">{message}</p>{/if}

	<div class="admin-section-item">
		<h3>Hora e Data da Campanha</h3>
		<div class="current-time-display">
			<p>Data Atual: <strong>{displayCampaignDate}</strong></p>
			<p>Hora Atual: <strong>{displayCampaignTime}</strong></p>
		</div>
		<div class="time-date-controls">
			<div class="input-group">
				<label for="campaignDateInput">Definir Data:</label><input
					type="date"
					id="campaignDateInput"
					bind:value={campaignDateInput}
				/>
			</div>
			<div class="input-group">
				<label for="campaignTimeInput">Definir Hora:</label><input
					type="time"
					id="campaignTimeInput"
					bind:value={campaignTimeInput}
				/>
			</div>
		</div>
		<button on:click={handleSaveTimeDate}>Salvar Hora/Data</button>
	</div>

	<div class="admin-section-item">
		<h3>Publicar Resumo de Sessão</h3>
		<div class="input-group">
			<label for="sessionSummaryTitle">Título:</label><input
				type="text"
				id="sessionSummaryTitle"
				bind:value={summaryTitle}
			/>
		</div>
		<div class="input-group">
			<label for="sessionSummaryContent">Conteúdo:</label><textarea
				id="sessionSummaryContent"
				bind:value={summaryContent}
			></textarea>
		</div>
		<button on:click={handleSaveSummary}>Publicar Resumo</button>
	</div>

	<div class="admin-section-item">
		<h3>Jogadores e Personagens</h3>
		<div id="playersCharactersList">
			{#each players as player (player.userId)}
				<div class="player-character-item">
					<div>
						<strong>Jogador:</strong>
						{player.playerName || 'N/A'}<br /><strong>Personagem:</strong>
						{player.characterName || 'N/A'}
					</div>
					<span>UID: {player.userId}</span>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.admin-section-item {
		background-color: #fdfdfd;
		border: 1px solid #e9e9e9;
		border-radius: 10px;
		padding: 20px;
		margin-bottom: 20px;
	}
	h3 {
		color: #2c3e50;
		margin-top: 0;
		border-bottom: 1px solid #f0f0f0;
		padding-bottom: 10px;
	}
	.input-group {
		margin-bottom: 15px;
	}
	label {
		display: block;
		margin-bottom: 5px;
		font-weight: 600;
	}
	input,
	textarea {
		width: 100%;
		padding: 10px;
		border: 1px solid #ccc;
		border-radius: 5px;
		box-sizing: border-box;
	}
	textarea {
		min-height: 120px;
	}
	button {
		padding: 10px 20px;
		border: none;
		border-radius: 5px;
		background-color: #007bff;
		color: white;
	}
	.save-message {
		margin: 10px 0;
		font-weight: bold;
		color: #28a745;
	}
	.current-time-display {
		background-color: #f0f8ff;
		text-align: center;
		padding: 20px;
		border-radius: 8px;
		margin-bottom: 20px;
	}
	.time-date-controls {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		margin-bottom: 15px;
	}
	#playersCharactersList {
		max-height: 400px;
		overflow-y: auto;
	}
	.player-character-item {
		display: flex;
		justify-content: space-between;
		padding: 10px 0;
		border-bottom: 1px solid #eee;
	}
</style>
