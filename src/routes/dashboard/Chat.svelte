<script>
	import { onMount } from 'svelte';
	import { db } from '$lib/firebase';
	import { query, collectionGroup, getDocs, collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
	import { userStore, chatIdOpen } from '$lib/appData';
	let players = $state([]);
	let playerSelectedId = $state(null);
	let playerSelected = $derived(players.find(({ userId }) => userId == playerSelectedId))
	let userName = $derived(players.find(({ userId }) => userId == $userStore.uid))
	let messages = $state([]);
    let messageContent = $state('')
    let listener = null;

	onMount(() => {
		const sheetsQuery = query(collectionGroup(db, 'characterSheets'));
		getDocs(sheetsQuery).then((snapshot) => {
			players = snapshot.docs.map((doc) => {
				const data = doc.data();
				const path = doc.ref.path.split('/');
				const userId = path[path.indexOf('users') + 1];
				return { userId, playerName: data.nomePlayer, characterName: data.nome };
			});
		});
	});

    function sendMessage(){
        if(messageContent == '') return
        const data = new Date()
        messages.push({ content: messageContent, senderId: $userStore.uid, senderName: userName.playerName, recipientId: playerSelectedId, recipientName: playerSelected.playerName, date: `${data.toLocaleDateString('pt-BR')} - ${data.toLocaleTimeString('pt-BR')}`, notified: false })
        messageContent = ''
        save()
    }

    async function save(){
        const messageDoc1 = doc(db, `users/${$userStore.uid}/chat/${playerSelectedId}`)
        const messageDoc2 = doc(db, `users/${playerSelectedId}/chat/${$userStore.uid}`)
        setDoc(messageDoc1, { messages: messages })
        setDoc(messageDoc2, { messages: messages })
    }

    async function getMessages(){
        if(listener) listener()
		chatIdOpen.update(v => v = playerSelectedId)
        const messageDoc = doc(db, `users/${$userStore.uid}/chat/${playerSelectedId}`)
        listener = onSnapshot(messageDoc, (snapshot) => {
            if(snapshot.exists()) messages = snapshot.data().messages
            else messages = []
        })
    }
</script>

<section class="container" style="margin-top:10dvh; margin-bottom:10dvh;">
	<center>
		<h2 class="mb-4">Chat</h2>
		<p>Jogador:</p>
		<select class="form-select" aria-label="Default select example" bind:value={playerSelectedId} onchange={getMessages}>
			{#each players as player}
				{#if player.userId != $userStore.uid}
					<option value={player.userId}>{`${player.playerName} (${player.characterName})`}</option>
				{/if}
			{/each}
		</select>
		{#if playerSelectedId}
			<div class="container py-5">
				<div class="row d-flex justify-content-center">
					<div class="col-md-8 col-lg-6 col-xl-5">
						<div class="card">
							<div class="card-header p-3">
								<p class="mb-0 fw-bold">{`${playerSelected?.playerName} (${playerSelected?.characterName})`}</p>
							</div>

							<div class="card-body" style="position: relative; height: 400px; overflow-y: auto;">
								{#each messages as msg}
									<div class="d-flex justify-content-{msg.senderId == $userStore.uid ? 'end' : 'start'} mb-4">
										<div
											class="card w-75
                                {msg.senderId == $userStore.uid
												? 'bg-primary text-white'
												: 'bg-body-secondary'}"
										>
											<div class="card-body p-3">
												<p class="mb-0">
													{msg.content}
												</p>
												<p
													class="small mb-0 text-end {msg.senderId == $userStore.uid
														? 'text-white-50'
														: 'text-muted'}"
												>
													{msg.date}
												</p>
											</div>
										</div>
									</div>
								{/each}
							</div>

							<div
								class="card-footer text-muted d-flex justify-content-start align-items-center p-3"
							>
								<form onsubmit={sendMessage}>
                                    <div class="input-group">
                                        <input
                                            type="text"
                                            class="form-control"
                                            placeholder="Digite sua mensagem..."
                                            aria-label="Digite sua mensagem"
                                            aria-describedby="button-send"
                                            bind:value={messageContent}
                                        />
                                        <button class="btn btn-primary" type="button" id="button-send" onclick={sendMessage}>
                                            <i class="bi bi-send-fill"></i>
                                        </button>
								    </div>
                                </form>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</center>
</section>
