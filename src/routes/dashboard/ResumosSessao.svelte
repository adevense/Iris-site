<script>
	import { onMount } from 'svelte';
	import { db } from '$lib/firebase.js';
	import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

	let summaries = [];

	function formatTimestamp(timestamp) {
		if (!timestamp) return '';
		return new Date(timestamp).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' });
	}
</script>

<section id="session-summaries-content" class="content-section active">
	<h2>Resumos de Sessão</h2>
	<div class="main-content-area">
		<p>Aqui você pode ver os resumos das sessões anteriores publicados pelo Mestre.</p>
		<div id="sessionSummariesList" class="session-summaries-list">
			{#if summaries.length === 0}
				<p style="text-align: center; color: #777;">Nenhum resumo de sessão disponível.</p>
			{:else}
				{#each summaries as summary (summary.id)}
					<div class="session-summary-item">
						<h4>{summary.title || 'Sem Título'}</h4>
						<p>{@html summary.content?.replace(/\n/g, '<br>') || 'Sem conteúdo.'}</p>
						<div class="meta-info">
							Publicado por: {summary.createdBy || 'Mestre'} em {formatTimestamp(summary.timestamp)}
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</section>

<style>
	.content-section,
	.main-content-area {
		padding: 20px;
		background: #fff;
		border-radius: 8px;
	}
	.session-summaries-list {
		max-height: 70vh;
		overflow-y: auto;
	}
	.session-summary-item {
		border-bottom: 1px solid #eee;
		padding-bottom: 1rem;
		margin-bottom: 1rem;
	}
	.session-summary-item:last-child {
		border-bottom: none;
	}
	h4 {
		margin-top: 0;
		margin-bottom: 10px;
		color: #007bff;
		font-size: 1.2em;
	}
	p {
		margin: 0 0 10px 0;
		color: #555;
		white-space: pre-wrap;
	}
	.meta-info {
		font-size: 0.8em;
		color: #888;
		text-align: right;
	}
</style>
