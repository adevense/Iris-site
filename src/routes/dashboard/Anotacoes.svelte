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

		const notesRef = doc(db, `users/${userId}/notes/myNotes`);
		getDoc(notesRef).then((docSnap) => {
			if (docSnap.exists()) {
				notes = docSnap.data().content || '';
			}
		});

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


<div class="container" style="margin-top:10dvh; margin-bottom:10dvh;">
    <h2>Minhas Anotações</h2>
    <div class="border border-3 rounded p-3 mt-4">
        <p>Use este espaço para suas anotações pessoais da campanha.</p>
        <div class="border border-1 rounded p-2 text-center mb-3">
            <p>Data Atual na Campanha: <font style="font-size:25px;"><br><strong>{campaignDate}</strong></font></p>
			<p>Hora Atual na Campanha: <font style="font-size:25px;"><br><strong>{campaignTime}</strong></font></p>
        </div>
        <textarea class="form-control" bind:value={notes} placeholder="Comece a escrever suas anotações aqui..." style="height:30dvh;"></textarea>
        <button class="btn btn-primary my-4" onclick={handleSaveNotes}>Salvar Anotações</button>
        {#if saveMessage}
			<div class="alert alert-success" role="alert">
				{saveMessage}
			</div>
		{/if}
    </div>
</div>
