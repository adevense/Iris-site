<script>
	import { onMount } from 'svelte';
	import { db, auth } from '$lib/firebase.js';
	import { doc, onSnapshot, setDoc } from 'firebase/firestore';

	let sheetData = $state({});
	let rituais = $state([{ nome: '', descricao: '' }])
	let saveMessage = $state('');
	let limiteInventario = $derived(sheetData?.forca ? sheetData.forca * 5 : '')

	const userId = auth.currentUser?.uid;

	const periciaIds = [
		'Acrobacia',
		'Adestramento',
		'Artes',
		'Atletismo',
		'Atualidades',
		'Ciencias',
		'Crime',
		'Diplomacia',
		'Enganacao',
		'Fortitude',
		'Furtividade',
		'Iniciativa',
		'Intimidacao',
		'Intuicao',
		'Investigacao',
		'Luta',
		'Medicina',
		'Ocultismo',
		'Percepcao',
		'Pilotagem',
		'Pontaria',
		'Profissao',
		'Reflexos',
		'Religiao',
		'Sobrevivencia',
		'Tatica',
		'Tecnologia',
		'Vontade'
	];

	onMount(() => {
		if (!userId) return;
		const sheetRef = doc(db, `users/${userId}/characterSheets/mySheet`);

		const unsubscribe = onSnapshot(sheetRef, (docSnap) => {
			if (docSnap.exists()) {
				sheetData = docSnap.data();
				rituais =
					sheetData.rituais && sheetData.rituais.length > 0
						? sheetData.rituais
						: [{ nome: '', descricao: '' }];
			}
		});

		return () => unsubscribe();
	});

	async function handleSave() {
		if (!userId) return;
		saveMessage = 'Salvando...';
		const sheetRef = doc(db, `users/${userId}/characterSheets/mySheet`);

		const finalSheetData = {
			...sheetData,
			rituais: rituais.filter((r) => r.nome?.trim() !== '')
		};

		periciaIds.forEach((id) => {
			finalSheetData[id] = Number(finalSheetData[id]) || 0;
		});

		await setDoc(sheetRef, finalSheetData, { merge: true });
		saveMessage = 'Ficha salva com sucesso!';
		setTimeout(() => (saveMessage = ''), 3000);
	}

	function addRitual() {
		rituais = [...rituais, { nome: '', descricao: '' }];
	}

	function removeRitual(index) {
		rituais = rituais.filter((_, i) => i !== index);
	}
</script>

<section class="container" style="margin-top:10dvh; margin-bottom:10dvh;">
	<div class="card">
		<div class="card-body p-4">
			<div class="d-flex justify-content-between align-items-center mb-3">
				<h2 class="card-title h3">Ficha de Personagem</h2>
				<button id="saveSheetButton" class="btn btn-primary" onclick={handleSave}
					>Salvar Ficha</button
				>
			</div>

			{#if saveMessage}
				<div class="alert alert-success" role="alert">
					{saveMessage}
				</div>
			{/if}

			<h3 class="h5 border-bottom pb-2 mb-3">Informações Básicas</h3>
			<div class="row g-3 mb-4">
				<div class="col-md-6 col-lg-4">
					<label for="fichaNome" class="form-label">Nome do Personagem:</label><input
						type="text"
						class="form-control"
						id="fichaNome"
						bind:value={sheetData.nome}
					/>
				</div>
				<div class="col-md-6 col-lg-4">
					<label for="fichaNomePlayer" class="form-label">Nome do Jogador:</label><input
						type="text"
						class="form-control"
						id="fichaNomePlayer"
						bind:value={sheetData.nomePlayer}
					/>
				</div>
				<div class="col-md-6 col-lg-4">
					<label for="fichaClasse" class="form-label">Classe:</label><input
						type="text"
						class="form-control"
						id="fichaClasse"
						bind:value={sheetData.classe}
					/>
				</div>
				<div class="col-md-6 col-lg-4">
					<label for="fichaOrigem" class="form-label">Origem:</label><input
						type="text"
						class="form-control"
						id="fichaOrigem"
						bind:value={sheetData.origem}
					/>
				</div>
				<div class="col-md-6 col-lg-4">
					<label for="fichaIdade" class="form-label">Idade:</label><input
						type="number"
						class="form-control"
						id="fichaIdade"
						bind:value={sheetData.idade}
					/>
				</div>
				<div class="col-md-6 col-lg-4">
					<label for="fichaGenero" class="form-label">Gênero:</label><input
						type="text"
						class="form-control"
						id="fichaGenero"
						bind:value={sheetData.genero}
					/>
				</div>
			</div>

			<h3 class="h5 border-bottom pb-2 mb-3">Atributos</h3>
			<div class="row g-3 mb-4">
				<div class="col-md col-6">
					<label for="fichaForca" class="form-label">Força:</label><input
						type="number"
						class="form-control"
						id="fichaForca"
						bind:value={sheetData.forca}
					/>
				</div>
				<div class="col-md col-6">
					<label for="fichaAgilidade" class="form-label">Agilidade:</label><input
						type="number"
						class="form-control"
						id="fichaAgilidade"
						bind:value={sheetData.agilidade}
					/>
				</div>
				<div class="col-md col-6">
					<label for="fichaVigor" class="form-label">Vigor:</label><input
						type="number"
						class="form-control"
						id="fichaVigor"
						bind:value={sheetData.vigor}
					/>
				</div>
				<div class="col-md col-6">
					<label for="fichaIntelecto" class="form-label">Intelecto:</label><input
						type="number"
						class="form-control"
						id="fichaIntelecto"
						bind:value={sheetData.intelecto}
					/>
				</div>
				<div class="col-md col-12">
					<label for="fichaPresenca" class="form-label">Presença:</label><input
						type="number"
						class="form-control"
						id="fichaPresenca"
						bind:value={sheetData.presenca}
					/>
				</div>
			</div>

			<h3 class="h5 border-bottom pb-2 mb-3">Pontos & NEX</h3>
			<div class="row g-3 mb-4">
				<div class="col-md-4 col-sm-6">
					<label for="fichaPV" class="form-label">Pontos de Vida (PV):</label><input
						type="text"
						class="form-control"
						id="fichaPV"
						bind:value={sheetData.pv}
					/>
				</div>
				<div class="col-md-4 col-sm-6">
					<label for="fichaPS" class="form-label">Pontos de Sanidade (PS):</label><input
						type="text"
						class="form-control"
						id="fichaPS"
						bind:value={sheetData.ps}
					/>
				</div>
				<div class="col-md-4 col-sm-6">
					<label for="fichaPE" class="form-label">Pontos de Esforço (PE):</label><input
						type="text"
						class="form-control"
						id="fichaPE"
						bind:value={sheetData.pe}
					/>
				</div>
				<div class="col-md-4 col-sm-6">
					<label for="fichaNEX" class="form-label">NEX (%):</label>
					<select class="form-select" id="fichaNEX" bind:value={sheetData.nex}>
						{#each Array.from({ length: 21 }, (_, i) => i * 5) as nexValue}
							{#if nexValue < 100}
								<option value={nexValue}>{nexValue}%</option>
							{/if}
						{/each}
						<option value={99}>99%</option>
					</select>
				</div>
				<div class="col-md-8">
					<label for="fichaResistenciasGerais" class="form-label">Resistências:</label><input
						type="text"
						class="form-control"
						id="fichaResistenciasGerais"
						bind:value={sheetData.resistenciasGerais}
					/>
				</div>
			</div>

			<h3 class="h5 border-bottom pb-2 mb-3">Perícias</h3>
			<div class="row g-3 mb-4">
				{#each periciaIds as periciaId}
					<div class="col-sm-6 col-md-4 col-lg-3">
						<div class="input-group">
							<span class="input-group-text" style="width: 140px;">{periciaId}</span>
							<input
								type="number"
								class="form-control"
								id="pericia{periciaId}"
								bind:value={sheetData[periciaId]}
							/>
						</div>
					</div>
				{/each}
			</div>

			<div class="row g-3 mb-4">
				<div class="col-12">
					<h3 class="h5 border-bottom pb-2 mb-3">Habilidades e Rituais/Poderes</h3>
					<label for="fichaHabilidades" class="form-label">Habilidades:</label>
					<textarea
						class="form-control"
						id="fichaHabilidades"
						rows="4"
						bind:value={sheetData.habilidades}
					></textarea>
				</div>
				<div class="col-12">
					<div class="d-flex justify-content-between align-items-center mt-3">
						<h4 class="h6">Rituais/Poderes Conhecidos</h4>
						<button class="btn btn-sm btn-outline-primary" onclick={addRitual}
							>Adicionar Ritual/Poder</button
						>
					</div>
					<div class="border rounded p-2 mt-2" style="max-height: 400px; overflow-y: auto;">
						{#each rituais as ritual, index (index)}
							<div class="border rounded p-3 mb-2 bg-body-tertiary">
								<div class="row g-3">
									<div class="col-12">
										<label for="ritual-name-{index}" class="form-label">Nome do Ritual/Poder:</label
										><input
											type="text"
											class="form-control"
											id="ritual-name-{index}"
											bind:value={ritual.nome}
										/>
									</div>
									<div class="col-12">
										<label for="ritual-desc-{index}" class="form-label">Descrição:</label><textarea
											class="form-control"
											id="ritual-desc-{index}"
											rows="3"
											bind:value={ritual.descricao}
										></textarea>
									</div>
									<div class="col-12 text-end">
										<button class="btn btn-sm btn-danger" onclick={() => removeRitual(index)}
											>Remover</button
										>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<h3 class="h5 border-bottom pb-2 mb-3">Inventário e Equipamentos</h3>
			<div class="row g-3 mb-4">
				<div class="col-12">
					<label for="fichaEquipamentos" class="form-label">Equipamentos:</label><textarea
						class="form-control"
						id="fichaEquipamentos"
						rows="4"
						bind:value={sheetData.equipamentos}
					></textarea>
				</div>
				<div class="col-md-4 col-sm-6">
					<label for="fichaDinheiro" class="form-label">Dinheiro:</label><input
						type="text"
						class="form-control"
						id="fichaDinheiro"
						bind:value={sheetData.dinheiro}
					/>
				</div>
				<div class="col-md-4 col-sm-6">
					<label for="fichaLimiteInventario" class="form-label">Limite de Inventário:</label><input
						type="numeric"
						class="form-control"
						id="fichaLimiteInventario"
						bind:value={limiteInventario}
						disabled
					/>
				</div>
				<div class="col-md-4">
					<label for="fichaClasseItens" class="form-label">Classe de Itens:</label><input
						type="text"
						class="form-control"
						id="fichaClasseItens"
						bind:value={sheetData.classeItens}
					/>
				</div>
			</div>

			<h3 class="h5 border-bottom pb-2 mb-3">Aparência e História</h3>
			<div class="row g-3">
				<div class="col-12">
					<label for="fichaApariencia" class="form-label">Aparência:</label><textarea
						class="form-control"
						id="fichaApariencia"
						rows="4"
						bind:value={sheetData.apariencia}
					></textarea>
				</div>
				<div class="col-12">
					<label for="fichaHistoria" class="form-label">História:</label><textarea
						class="form-control"
						id="fichaHistoria"
						rows="4"
						bind:value={sheetData.historia}
					></textarea>
				</div>
			</div>
		</div>
	</div>
</section>
