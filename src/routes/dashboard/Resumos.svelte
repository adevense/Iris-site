<script>
    import { onMount } from 'svelte';
    import { db } from '$lib/firebase.js';
    import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

    let summaries = [];

    function formatTimestamp(timestamp) {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' });
    }

    onMount(() => {
        const summariesRef = collection(db, "sessionSummaries");
        const q = query(summariesRef, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let fetchedSummaries = [];
            snapshot.forEach(doc => {
                fetchedSummaries.push({ id: doc.id, ...doc.data() });
            });
            summaries = fetchedSummaries;
        });

        return () => unsubscribe();
    });
</script>

<section class="container" style="margin-top:10dvh; margin-bottom:10dvh;">
    <div class="card">
        <div class="card-body p-4">
            <h2 class="card-title h3">Resumos de Sessão</h2>
            <p class="card-subtitle mb-4 text-muted">
                Aqui você pode ver os resumos das sessões anteriores publicados pelo Mestre.
            </p>

            <div class="border rounded p-3" style="max-height: 70vh; overflow-y: auto;">
                {#if summaries.length === 0}
                    <p class="text-center text-muted p-5">Nenhum resumo de sessão disponível.</p>
                {:else}
                    {#each summaries as summary, i (summary.id)}
                        <div class:border-bottom={i < summaries.length - 1} class:pb-3={i < summaries.length - 1} class="mb-3">
                            <h4 class="h5 text-primary">{summary.title || 'Sem Título'}</h4>
                            
                            <p class="mb-2">{@html summary.content?.replace(/\n/g, '<br>') || 'Sem conteúdo.'}</p>
                            
                            <div class="text-end">
                                <small class="text-muted">
                                    Publicado por: {summary.createdBy || 'Mestre'} em {formatTimestamp(summary.timestamp)}
                                </small>
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
</section>