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
		const parts = campaignDateInput.split('-') 
		if(campaignDateInput != "") campaignDateInput = `${parts[2]}-${parts[1]}-${parts[0]}`
		await setDoc(
			timeRef,
			{ campaignDate: campaignDateInput != "" ? campaignDateInput : displayCampaignDate, campaignTime: campaignTimeInput != "" ? campaignTimeInput : displayCampaignTime },
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

<section class="container" style="margin-top:10dvh; margin-bottom:10dvh;">
	<h2 class="mb-4">Área de Administração</h2>

	{#if message}
		<div class="alert alert-success" role="alert">
			{message}
		</div>
	{/if}

	<div class="card mb-4">
		<div class="card-body">
			<h3 class="card-title h5">Hora e Data da Campanha</h3>
			<div class="p-3 my-3 text-center bg-body-tertiary rounded">
				<p class="mb-1">Data Atual: <strong class="text-primary">{displayCampaignDate}</strong></p>
				<p class="mb-0">Hora Atual: <strong class="text-primary">{displayCampaignTime}</strong></p>
			</div>
			<div class="row g-3 mb-3">
				<div class="col-md-6">
					<label for="campaignDateInput" class="form-label">Definir Data:</label>
					<input type="date" class="form-control" id="campaignDateInput" bind:value={campaignDateInput} />
				</div>
				<div class="col-md-6">
					<label for="campaignTimeInput" class="form-label">Definir Hora:</label>
					<input type="time" class="form-control" id="campaignTimeInput" bind:value={campaignTimeInput} />
				</div>
			</div>
			<button class="btn btn-primary" on:click={handleSaveTimeDate}>Salvar Hora/Data</button>
		</div>
	</div>

	<div class="card mb-4">
		<div class="card-body">
			<h3 class="card-title h5">Publicar Resumo de Sessão</h3>
			<div class="mb-3">
				<label for="sessionSummaryTitle" class="form-label">Título:</label>
				<input type="text" class="form-control" id="sessionSummaryTitle" bind:value={summaryTitle} />
			</div>
			<div class="mb-3">
				<label for="sessionSummaryContent" class="form-label">Conteúdo:</label>
				<textarea class="form-control" id="sessionSummaryContent" rows="5" bind:value={summaryContent}></textarea>
			</div>
			<button class="btn btn-primary" on:click={handleSaveSummary}>Publicar Resumo</button>
		</div>
	</div>

	<div class="card">
		<div class="card-body">
			<h3 class="card-title h5">Jogadores e Personagens</h3>
			<div class="list-group" style="max-height: 400px; overflow-y: auto;">
				{#each players as player (player.userId)}
					<div class="list-group-item d-flex justify-content-between align-items-center">
						<div>
							<span class="fw-bold">{player.characterName || 'N/A'}</span>
							<small class="d-block text-muted">Jogador: {player.playerName || 'N/A'}</small>
						</div>
						<span class="badge bg-secondary rounded-pill">UID: {player.userId}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>