<script>
    import { onMount } from 'svelte';
    import { db, auth } from '$lib/firebase.js';
    import { doc, onSnapshot, setDoc } from 'firebase/firestore';

    let sheetData = {};
    let rituais = [{ nome: '', descricao: '' }];
    let saveMessage = '';
    
    const userId = auth.currentUser?.uid;

    const periciaIds = [
        "Acrobacia", "Adestramento", "Artes", "Atletismo", "Atualidades", "Ciencias", "Crime", "Diplomacia",
        "Enganacao", "Fortitude", "Furtividade", "Iniciativa", "Intimidacao", "Intuicao", "Investigacao",
        "Luta", "Medicina", "Ocultismo", "Percepcao", "Pilotagem", "Pontaria", "Profissao", "Reflexos",
        "Religiao", "Sobrevivencia", "Tatica", "Tecnologia", "Vontade"
    ];

    onMount(() => {
        if (!userId) return;
        const sheetRef = doc(db, `users/${userId}/characterSheets/mySheet`);

        const unsubscribe = onSnapshot(sheetRef, (docSnap) => {
            if (docSnap.exists()) {
                sheetData = docSnap.data();
                rituais = sheetData.rituais && sheetData.rituais.length > 0 ? sheetData.rituais : [{ nome: '', descricao: '' }];
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
            rituais: rituais.filter(r => r.nome?.trim() !== '')
        };

        // Assegura que todas as perícias sejam números
        periciaIds.forEach(id => {
            finalSheetData[id] = Number(finalSheetData[id]) || 0;
        });

        await setDoc(sheetRef, finalSheetData, { merge: true });
        saveMessage = 'Ficha salva com sucesso!';
        setTimeout(() => saveMessage = '', 3000);
    }
    
    function addRitual() {
        rituais = [...rituais, { nome: '', descricao: '' }];
    }

    function removeRitual(index) {
        rituais = rituais.filter((_, i) => i !== index);
    }
</script>

<section id="ficha-content" class="content-section active">
    <h2>Ficha de Personagem</h2>
    <button id="saveSheetButton" on:click={handleSave}>Salvar Ficha</button>
    {#if saveMessage}
        <p class="sheet-save-message" style="display: block;">{saveMessage}</p>
    {/if}

    <div class="character-sheet-section">
        <h3>Informações Básicas</h3>
        <div class="input-group"><label for="fichaNome">Nome do Personagem:</label><input type="text" id="fichaNome" bind:value={sheetData.nome}></div>
        <div class="input-group"><label for="fichaNomePlayer">Nome do Jogador:</label><input type="text" id="fichaNomePlayer" bind:value={sheetData.nomePlayer}></div>
        <div class="input-group"><label for="fichaClasse">Classe:</label><input type="text" id="fichaClasse" bind:value={sheetData.classe}></div>
        <div class="input-group"><label for="fichaOrigem">Origem:</label><input type="text" id="fichaOrigem" bind:value={sheetData.origem}></div>
        <div class="input-group"><label for="fichaIdade">Idade:</label><input type="number" id="fichaIdade" bind:value={sheetData.idade}></div>
        <div class="input-group"><label for="fichaGenero">Gênero:</label><input type="text" id="fichaGenero" bind:value={sheetData.genero}></div>
    </div>

    <div class="character-sheet-section">
        <h3>Atributos</h3>
        <div class="input-group"><label for="fichaForca">Força:</label><input type="number" id="fichaForca" bind:value={sheetData.forca}></div>
        <div class="input-group"><label for="fichaAgilidade">Agilidade:</label><input type="number" id="fichaAgilidade" bind:value={sheetData.agilidade}></div>
        <div class="input-group"><label for="fichaVigor">Vigor:</label><input type="number" id="fichaVigor" bind:value={sheetData.vigor}></div>
        <div class="input-group"><label for="fichaIntelecto">Intelecto:</label><input type="number" id="fichaIntelecto" bind:value={sheetData.intelecto}></div>
        <div class="input-group"><label for="fichaPresenca">Presença:</label><input type="number" id="fichaPresenca" bind:value={sheetData.presenca}></div>
    </div>
    
    <div class="character-sheet-section">
        <h3>Pontos & NEX</h3>
        <div class="input-group"><label for="fichaPV">Pontos de Vida (PV):</label><input type="text" id="fichaPV" bind:value={sheetData.pv}></div>
        <div class="input-group"><label for="fichaPS">Pontos de Sanidade (PS):</label><input type="text" id="fichaPS" bind:value={sheetData.ps}></div>
        <div class="input-group"><label for="fichaPE">Pontos de Esforço (PE):</label><input type="text" id="fichaPE" bind:value={sheetData.pe}></div>
        <div class="input-group">
            <label for="fichaNEX">NEX (%):</label>
            <select id="fichaNEX" bind:value={sheetData.nex}>
                {#each Array.from({ length: 21 }, (_, i) => i * 5) as nexValue}
                    {#if nexValue < 100}
                        <option value={nexValue}>{nexValue}%</option>
                    {/if}
                {/each}
                <option value={99}>99%</option>
            </select>
        </div>
        <div class="input-group"><label for="fichaResistenciasGerais">Resistências:</label><input type="text" id="fichaResistenciasGerais" bind:value={sheetData.resistenciasGerais}></div>
    </div>
    
    <div class="character-sheet-section">
        <h3>Perícias</h3>
        <div class="pericias-grid">
            {#each periciaIds as periciaId}
            <div class="input-group">
                <label for="pericia{periciaId}">{periciaId}:</label>
                <input type="number" id="pericia{periciaId}" bind:value={sheetData[periciaId]}>
            </div>
            {/each}
        </div>
    </div>

    <div class="character-sheet-section full-width">
        <h3>Habilidades e Rituais/Poderes</h3>
        <div class="input-group"><label for="fichaHabilidades">Habilidades:</label><textarea id="fichaHabilidades" bind:value={sheetData.habilidades}></textarea></div>
        <h4>Rituais/Poderes Conhecidos</h4>
        <div class="scrollable-content">
            {#each rituais as ritual, index (index)}
            <div class="ritual-item">
                <div class="input-group"><label for="ritual-name-{index}">Nome do Ritual/Poder:</label><input type="text" id="ritual-name-{index}" bind:value={ritual.nome}></div>
                <div class="input-group"><label for="ritual-desc-{index}">Descrição:</label><textarea id="ritual-desc-{index}" bind:value={ritual.descricao}></textarea></div>
                <button class="remove-ritual-btn" on:click={() => removeRitual(index)}>Remover</button>
            </div>
            {/each}
        </div>
        <button id="addRitualButton" on:click={addRitual}>Adicionar Ritual/Poder</button>
    </div>
    
    <div class="character-sheet-section full-width">
        <h3>Inventário e Equipamentos</h3>
        <div class="input-group"><label for="fichaEquipamentos">Equipamentos:</label><textarea id="fichaEquipamentos" bind:value={sheetData.equipamentos}></textarea></div>
        <div class="input-group"><label for="fichaDinheiro">Dinheiro:</label><input type="text" id="fichaDinheiro" bind:value={sheetData.dinheiro}></div>
        <div class="input-group"><label for="fichaLimiteInventario">Limite de Inventário:</label><input type="text" id="fichaLimiteInventario" bind:value={sheetData.limiteInventario}></div>
        <div class="input-group"><label for="fichaClasseItens">Classe de Itens:</label><input type="text" id="fichaClasseItens" bind:value={sheetData.classeItens}></div>
    </div>

    <div class="character-sheet-section full-width">
        <h3>Aparência e História</h3>
        <div class="input-group"><label for="fichaApariencia">Aparência:</label><textarea id="fichaApariencia" bind:value={sheetData.apariencia}></textarea></div>
        <div class="input-group"><label for="fichaHistoria">História:</label><textarea id="fichaHistoria" bind:value={sheetData.historia}></textarea></div>
    </div>
</section>

<style>
/* Estilos gerais para todas as seções de conteúdo */
.content-section {
    padding: 20px;
    background-color: #fcfcfc;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Estilos para a Ficha de Personagem */
.character-sheet-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}
.character-sheet-section h3 {
    grid-column: 1 / -1;
    margin-top: 0;
    margin-bottom: 15px;
    color: #2c3e50;
    border-bottom: 2px solid #007bff;
    padding-bottom: 5px;
    font-size: 1.3em;
}
.character-sheet-section.full-width {
    grid-template-columns: 1fr;
}
.input-group {
    margin-bottom: 0;
}
input, textarea, select {
    width: 100%;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    box-sizing: border-box;
}
textarea {
    resize: vertical;
    min-height: 100px;
}
.full-width textarea {
    min-height: 150px;
}

#saveSheetButton {
    background-color: #007bff;
    color: white;
    padding: 14px;
    border: none;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 1.1em;
}
.sheet-save-message {
    margin-top: -10px;
    margin-bottom: 10px;
    color: #007bff;
    font-weight: bold;
}

/* ESTILOS PARA A GRADE DE PERÍCIAS */
.pericias-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
    gap: 10px 20px;
}
.pericias-grid .input-group {
    display: flex;
    align-items: center;
}
.pericias-grid label {
    flex-shrink: 0;
    margin-right: 10px;
    width: 110px;
    text-align: right;
}
.pericias-grid input {
    width: 70px;
    text-align: center;
}

/* ESTILOS PARA RITUAIS/PODERES */
.scrollable-content {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 10px;
    margin: 15px 0;
}
.ritual-item {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
}
.ritual-item .input-group {
    margin-bottom: 10px;
}
.remove-ritual-btn {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 5px;
    margin-top: 10px;
    width: auto;
    float: right;
}
#addRitualButton {
    display: block;
    width: fit-content;
    margin: 15px 0 15px auto;
    background-color: #007bff;
    color: white;
    padding: 10px 18px;
    border: none;
    border-radius: 8px;
}
</style>