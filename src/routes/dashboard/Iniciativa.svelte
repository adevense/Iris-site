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
    let aglValue = 1;
    let critico = false;
	let initiatives = [];
	let message = '';
	const userId = auth.currentUser?.uid;

	onMount(() => {
		if (!userId) return;

		const initiativesRef = collection(db, 'initiatives');
		const unsubscribe = onSnapshot(initiativesRef, (snapshot) => {
			let fetchedInitiatives = snapshot.docs.map((doc) => doc.data());
			initiatives = fetchedInitiatives.sort((a, b) => {
                let diff = (b.value || 0) - (a.value || 0)
                if(diff != 0) {
                    return diff
                } else if(a.critico && !b.critico){
                    return -1
                } else if(!a.critico && b.critico){
                    return 1
                } else {
                    return a.aglValue > b.aglValue ? -1 : 1
                }
            });
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
            critico: critico,
            aglValue: Number(aglValue),
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

<section class="container" style="margin-top:10dvh; margin-bottom:10dvh;">
    <div class="card">
        <div class="card-body p-4">
            <h2 class="card-title h3">Controle de Iniciativa</h2>
            <p class="card-subtitle mb-3 text-muted">Adicione seu valor de iniciativa e acompanhe a ordem.</p>

            <div class="mb-3">
                <label for="initiativeValue" class="form-label fw-bold">Meu Valor de Iniciativa:</label>
                <div class="input-group mb-3">
                    <input
                        type="number"
                        class="form-control"
                        id="initiativeValue"
                        bind:value={initiativeValue}
                        placeholder="Ex: 15"
                    />
                </div>
                <label for="initiativeValue" class="form-label fw-bold">Meu Valor de Agilidade:</label>
                <div class="input-group mb-3">
                    <input
                        type="number"
                        class="form-control"
                        id="initiativeValue"
                        bind:value={aglValue}
                    />
                </div>
                <div class="form-check">
                    <label class="form-check-label" for="checkChecked">Crítico</label>
                    <input class="form-check-input" type="checkbox" bind:checked={critico} id="checkChecked">
                </div>
                <center><button class="btn btn-primary" id="addInitiativeButton" onclick={handleAddInitiative}>Adicionar/Atualizar</button></center>
            </div>

            {#if message}
            <div class="alert alert-success mt-3" role="alert">
                {message}
            </div>
            {/if}

            <h3 class="h5 mt-4 mb-3">Ordem da Iniciativa</h3>
            <div class="list-group">
                {#if initiatives.length === 0}
                    <div class="list-group-item text-center text-muted">Nenhuma iniciativa adicionada.</div>
                {:else}
                    {#each initiatives as item (item.userId)}
                        <div class="list-group-item d-flex justify-content-between">
                            <span class="fw-bold">{item.characterName || 'Desconhecido'}</span>
                            <span>
                                Valor: {item.value} 
                                <br>Agilidade: {item.aglValue}
                                <br>Crítico: {item.critico ? "Sim" : "Não"}
                            </span>
                        </div>
                    {/each}
                {/if}
            </div>

            {#if isAdmin}
            <div class="text-center border-top pt-4 mt-4">
                <h3 class="h6 text-uppercase text-muted">Controles do Mestre</h3>
                <button class="btn btn-danger" id="clearInitiativeButton" onclick={handleClearInitiatives}>
                    Limpar Todas as Iniciativas
                </button>
            </div>
            {/if}

        </div>
    </div>
</section>