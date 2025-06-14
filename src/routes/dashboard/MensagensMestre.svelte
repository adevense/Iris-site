<script>
	import { onMount } from 'svelte';
	import { db, auth } from '$lib/firebase.js';
	import {
		collection,
		query,
		where,
		orderBy,
		onSnapshot,
		addDoc,
		getDoc,
		doc,
		getDocs,
		writeBatch
	} from 'firebase/firestore';

	export let isAdmin = false;

	let messages = [];
	let newMessage = '';
	let feedback = '';

	// Novo estado para controlar a qual mensagem o mestre está respondendo
	let replyingTo = null; // Vai guardar o objeto da mensagem original

	const userId = auth.currentUser?.uid;

	function formatTimestamp(timestamp) {
		if (!timestamp) return '';
		return new Date(timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
	}

	onMount(() => {
		if (!userId) return;

		const messagesRef = collection(db, 'masterMessages');
		let unsubscribePlayer, unsubscribeMaster;

		if (isAdmin) {
			// O Mestre vê todas as mensagens
			const q = query(messagesRef, orderBy('timestamp', 'desc'));
			unsubscribeMaster = onSnapshot(q, (snapshot) => {
				messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			});
		} else {
			// LÓGICA CORRIGIDA PARA O JOGADOR
			// O jogador precisa de duas queries:
			// 1. Mensagens que ELE enviou.
			// 2. Respostas que o MESTRE enviou PARA ELE.

			let myMessages = new Map();
			let repliesToMe = new Map();

			// Função para juntar e ordenar os resultados das duas queries
			const combineAndSortMessages = () => {
				const combined = new Map([...myMessages, ...repliesToMe]);
				messages = Array.from(combined.values()).sort(
					(a, b) => (b.timestamp || 0) - (a.timestamp || 0)
				);
			};

			// Query 1: Minhas mensagens enviadas
			const myMessagesQuery = query(messagesRef, where('senderId', '==', userId));
			unsubscribePlayer = onSnapshot(myMessagesQuery, (snapshot) => {
				snapshot.docs.forEach((doc) => myMessages.set(doc.id, { id: doc.id, ...doc.data() }));
				combineAndSortMessages();
			});

			// Query 2: Respostas do mestre para mim
			const repliesToMeQuery = query(messagesRef, where('recipientId', '==', userId));
			unsubscribeMaster = onSnapshot(repliesToMeQuery, (snapshot) => {
				snapshot.docs.forEach((doc) => repliesToMe.set(doc.id, { id: doc.id, ...doc.data() }));
				combineAndSortMessages();
			});
		}

		// Retorna a função de limpeza para ambos os listeners
		return () => {
			if (unsubscribePlayer) unsubscribePlayer();
			if (unsubscribeMaster) unsubscribeMaster();
		};
	});

	async function handleSendMessage() {
		if (!userId || !newMessage.trim()) return;

		// Usa o nome do jogador da ficha, se existir
		let senderName = auth.currentUser.displayName || auth.currentUser.email;
		const sheetRef = doc(db, `users/${userId}/characterSheets/mySheet`);
		const sheetSnap = await getDoc(sheetRef);
		if (sheetSnap.exists() && sheetSnap.data().nomePlayer) {
			senderName = sheetSnap.data().nomePlayer;
		}

		// Prepara os dados da nova mensagem
		const messageData = {
			senderId: userId,
			senderName: senderName, // Para o Mestre, será o nome dele
			message: newMessage,
			timestamp: Date.now()
		};

		// Se for uma resposta, adiciona os campos extras
		if (isAdmin && replyingTo) {
			messageData.isReply = true;
			messageData.recipientId = replyingTo.senderId; // O destinatário é quem enviou a msg original
		}

		await addDoc(collection(db, 'masterMessages'), messageData);

		cancelReply();
		newMessage = '';
		feedback = 'Mensagem enviada com sucesso!';
		setTimeout(() => (feedback = ''), 3000);
	}

	// Funções para controlar o estado da resposta
	function startReply(message) {
		replyingTo = message;
	}

	function cancelReply() {
		replyingTo = null;
	}

	async function handleClearMessages() {
        if (!isAdmin || !confirm("Tem certeza que deseja apagar TODAS as mensagens?")) return;
        const messagesRef = collection(db, "masterMessages");
        const snapshot = await getDocs(messagesRef);
        const batch = writeBatch(db);
        snapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        feedback = 'Todas as mensagens foram apagadas!';
        setTimeout(() => feedback = '', 3000);
    }
</script>

<section id="master-message-content" class="content-section active">
	<h2>Mensagem Direta para o Mestre</h2>
	<div class="main-content-area">
		<div class="master-message-input-area">
			{#if isAdmin && replyingTo}
				<div class="reply-context">
					Respondendo a: <span>{replyingTo.senderName}</span>
					<button class="cancel-reply-btn" on:click={cancelReply} title="Cancelar Resposta"
						>&times;</button
					>
				</div>
			{/if}

			<div class="master-message-input-wrapper">
				<textarea bind:value={newMessage} placeholder="Escreva sua mensagem aqui..."></textarea>
				<button on:click={handleSendMessage}
					>{replyingTo ? 'Enviar Resposta' : 'Enviar Mensagem'}</button
				>
			</div>
			{#if feedback}
				<p class="save-message" style="display:block;">{feedback}</p>
			{/if}
		</div>

		<h3>Histórico de Mensagens</h3>
		<div class="master-messages-display-container">
			{#if messages.length === 0}
				<p style="text-align: center; color: #777;">Nenhuma mensagem ainda.</p>
			{:else}
				{#each messages as msg (msg.id)}
					<div
						class="message-item"
						class:user-sent={msg.senderId === userId}
						class:is-reply={msg.isReply}
					>
						<strong
							>{msg.senderName || 'Desconhecido'}
							{#if msg.isReply}(Resposta do Mestre){/if}</strong
						>
						<p>{msg.message}</p>
						<div class="timestamp">{formatTimestamp(msg.timestamp)}</div>

						{#if isAdmin && msg.senderId != userId}
							<button class="reply-button" on:click={() => startReply(msg)}>Responder</button>
						{/if}
					</div>
				{/each}
			{/if}
		</div>

		{#if isAdmin}
			<div class="admin-controls">
				<h3>Controles do Mestre</h3>
            	<button id="clearMasterMessagesButton" on:click={handleClearMessages}>Limpar Todas as Mensagens</button>
			</div>
		{/if}
	</div>
</section>

<style>
	/* ... (todos os seus estilos anteriores) ... */
	.main-content-area,
	.content-section {
		background-color: #fff;
		padding: 20px;
		border-radius: 8px;
	}
	.master-message-input-area {
		margin-bottom: 20px;
	}
	.master-message-input-wrapper {
		display: flex;
		gap: 10px;
	}
	textarea {
		flex-grow: 1;
		padding: 10px;
		border-radius: 8px;
		border: 1px solid #ccc;
		min-height: 50px;
		resize: vertical;
	}
	button {
		padding: 10px 18px;
		border: none;
		border-radius: 8px;
		background-color: #007bff;
		color: white;
	}
	.save-message {
		margin-top: 10px;
		font-weight: bold;
		color: #28a745;
	}
	.master-messages-display-container {
		max-height: 450px;
		overflow-y: auto;
		border: 1px solid #e0e0e0;
		padding: 15px;
		border-radius: 8px;
	}
	.message-item {
		border: 1px solid #e9e9e9;
		padding: 15px;
		margin-bottom: 10px;
		border-radius: 8px;
	}
	.message-item.user-sent {
		background-color: #e6f7ff;
		border-color: #cce9ff;
	}
	.timestamp {
		font-size: 0.75em;
		color: #888;
		text-align: right;
		margin-top: 10px;
	}
	.admin-controls {
		margin-top: 30px;
		padding-top: 20px;
		border-top: 1px solid #e0e0e0;
		text-align: center;
	}

	/* NOVOS ESTILOS */
	.message-item.is-reply {
		background-color: #f8f9fa;
		border-left: 4px solid #6c757d;
	}
	.reply-button {
		background-color: #6c757d;
		font-size: 0.85em;
		padding: 6px 12px;
		margin-top: 10px;
		display: inline-block;
		width: auto;
	}
	.reply-context {
		background-color: #e0f7fa;
		border-left: 5px solid #00bcd4;
		padding: 8px 15px;
		margin-bottom: 10px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.cancel-reply-btn {
		background: none;
		border: none;
		font-size: 1.5em;
		line-height: 1;
		cursor: pointer;
		color: #006064;
	}
</style>
