<script>
	import CharCard from '$lib/components/CharCard.svelte';
	import { db } from '$lib/firebase';
	import { doc, setDoc, onSnapshot } from 'firebase/firestore';
	import { onMount } from 'svelte';
	let { isAdmin } = $props();
    let idEditando = $state(null)
    let nome = $state('')
    let desc = $state('')
    let url = $state('')
    let visibility = $state(true)
    let error = $state("")
	let personagens = $state([])
	onMount(() => {
        const personagensDoc = doc(db, 'personagens/personagens')
        const unsub = onSnapshot(personagensDoc, (snapshot) => {
            if(snapshot.exists()) personagens = snapshot.data().personagens
            else personagens = []
        })
        return () => unsub()
	})

    function editarPersonagem(i){
        idEditando = i
        nome = personagens[i].nome
        desc = personagens[i].descricao
        url = personagens[i].imagem
        visibility = personagens[i].visivel
        window.location.href = "#admContainer"
    }

    function cancelarEdicao(){
        idEditando = null
        nome = ""
        desc = ""
        url = ""
        visibility = true
    }

    function confirmarEdicao(){
        error = ""
        if(nome == "" || desc == "" || url == ""){
            error = "Preencha todos os campos."
            return
        }
        personagens[idEditando] = { nome: nome, descricao: desc, imagem: url, visivel: visibility }
        idEditando = null
        nome = ""
        desc = ""
        url = ""
        visibility = true
        save()
    }

    function adicionarPersonagem(){
        error = ""
        if(nome == "" || desc == "" || url == ""){
            error = "Preencha todos os campos."
            return
        }
        personagens.push({ nome: nome, descricao: desc, imagem: url, visivel: visibility })
        nome = ""
        desc = ""
        url = ""
        visibility = true
        save()
    }

    function removerPersonagem(i){
        if(!confirm(`Você deseja DELETAR o personagem ${personagens[i].nome}?`)) return
        personagens.splice(i, 1)
        save()
    }

    function save(){
        const charDoc = doc(db, `personagens/personagens`)
        setDoc(charDoc, { personagens: personagens })
    }
</script>

<section class="container" style="margin-top:10dvh; margin-bottom:10dvh;">
	<div class="container text-center mt-5">
		<div class="row justify-content-center">
			<div class="col">
				<div class="row">
					{#each personagens as personagem, i}
						{#if personagem.visivel || isAdmin}
                            <CharCard img={personagem.imagem} name={personagem.nome} desc={personagem.descricao} {isAdmin} indice={i} {editarPersonagem} {removerPersonagem} />
                        {/if}
					{/each}
				</div>
			</div>
		</div>
	</div>
	{#if isAdmin}
		<div class="container" id="admContainer">
			<div class="card">
				<div class="card-body p-4">
					<center><h3>Administrar Personagens:</h3></center>
					<div class="mb-3">
						<label for="name" class="form-label fw-bold">Nome:</label>
						<div class="input-group mb-3">
							<input type="text" class="form-control" id="name" bind:value={nome} />
						</div>
						<label for="desc" class="form-label fw-bold">Descrição:</label>
						<div class="input-group mb-3">
							<textarea type="text" class="form-control" id="desc" bind:value={desc}></textarea>
						</div>
                        <label for="url" class="form-label fw-bold">URL da imagem:</label>
						<div class="input-group mb-3">
							<input type="text" class="form-control" id="url" bind:value={url} />
						</div>
                        <div class="input-check mb-3">
                             <label class="form-check-label" for="checkDefault">Visível para os jogadores:</label>
							 <input type="checkbox" class="form-check-input" id="url" bind:checked={visibility} />
						</div>
						<center>
                            <p style="color:red;">{error}</p>
                            {#if idEditando == null}
                                <button class="btn btn-primary" id="addInitiativeButton" onclick={adicionarPersonagem}>Adicionar</button>
                            {:else}
                                <button class="btn btn-warning" id="addInitiativeButton" onclick={confirmarEdicao}>Confirmar Edição</button>
                                <button class="btn btn-primary" id="addInitiativeButton" onclick={cancelarEdicao}>Cancelar Edição</button>
                            {/if}
                        </center>
					</div>
				</div>
			</div>
		</div>
	{/if}
</section>
