// Importa as funções necessárias do Firebase SDK (versão modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
// Importa as funções do Firestore
import { 
    getFirestore, 
    doc, 
    setDoc, 
    onSnapshot, 
    collection, 
    query, 
    orderBy, 
    where, 
    deleteDoc, 
    getDocs, 
    writeBatch,
    addDoc,
    getDoc,
    collectionGroup // Importa collectionGroup
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";


// --- Configuração do Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyBxZEZ3pry8tE3r5o1Jyl3kb6lupqI7a4k",
    authDomain: "sistema-de-suporte-ao-mestre.firebaseapp.com",
    projectId: "sistema-de-suporte-ao-mestre",
    storageBucket: "sistema-de-suporte-ao-mestre.firebasestorage.app",
    messagingSenderId: "371640165093",
    appId: "1:371640165093:web:5598d7bd37365882e8aa0c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 

const googleProvider = new GoogleAuthProvider();

/**
 * Exibe uma mensagem de feedback na interface.
 * @param {string} elementId O ID do elemento onde a mensagem será exibida.
 * @param {string} message O texto da mensagem.
 * @param {boolean} [isError=false] Se a mensagem é de erro (afeta a cor).
 */
function showMessage(elementId, message, isError = false) {
    const msgElement = document.getElementById(elementId);
    if (msgElement) {
        msgElement.textContent = message;
        msgElement.style.display = 'block';
        msgElement.style.color = isError ? '#dc3545' : '#28a745'; 
    }
}

/**
 * Oculta uma mensagem de feedback da interface.
 * @param {string} elementId O ID do elemento da mensagem.
 */
function hideMessage(elementId) {
    const msgElement = document.getElementById(elementId);
    if (msgElement) {
        msgElement.style.display = 'none';
    }
}

// --- Lógica de Login/Cadastro (inalterada para brevidade) ---
if (window.location.pathname.includes('login.html')) {
    const loginForm = document.getElementById('loginForm');
    const googleLoginButton = document.getElementById('googleLogin');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessage('errorMessage');

            const email = loginForm['email'].value;
            const password = loginForm['password'].value;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log('Utilizador logado com sucesso:', userCredential.user.email);
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Erro ao fazer login:', error.code, error.message);
                let userFriendlyMessage = 'Ocorreu um erro ao fazer login. Verifique o seu e-mail e palavra-passe.';
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    userFriendlyMessage = 'E-mail ou palavra-passe inválidos.';
                } else if (error.code === 'auth/invalid-email') {
                    userFriendlyMessage = 'O formato do e-mail é inválido.';
                } else if (error.code === 'auth/too-many-requests') {
                    userFriendlyMessage = 'Muitas tentativas de login. Por favor, tente novamente mais tarde.';
                }
                showMessage('errorMessage', userFriendlyMessage, true);
            }
        });
    }

    if (googleLoginButton) {
        googleLoginButton.addEventListener('click', async () => {
            hideMessage('errorMessage');
            try {
                const result = await signInWithPopup(auth, googleProvider);
                console.log('Utilizador logado com Google:', result.user.email);
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Erro ao fazer login com Google:', error.code, error.message);
                if (error.code !== 'auth/popup-closed-by-user') {
                    showMessage('signupErrorMessage', 'Não foi possível fazer login com o Google. Tente novamente.', true);
                }
            }
        });
    }
}

if (window.location.pathname.includes('signup.html')) {
    const signupForm = document.getElementById('signupForm');
    const googleSignupButton = document.getElementById('googleSignup');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessage('signupErrorMessage');

            const email = signupForm['signupEmail'].value;
            const password = signupForm['signupPassword'].value;
            const confirmPassword = signupForm['confirmPassword'].value;

            if (password !== confirmPassword) {
                showMessage('signupErrorMessage', 'As palavras-passe não coincidem.', true);
                return;
            }
            if (password.length < 6) {
                showMessage('signupErrorMessage', 'A palavra-passe deve ter pelo menos 6 caracteres.', true);
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                console.log('Utilizador registado com sucesso:', userCredential.user.email);
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Erro ao registar:', error.code, error.message);
                let userFriendlyMessage = 'Ocorreu um erro ao registar. Tente novamente.';
                if (error.code === 'auth/email-already-in-use') {
                    userFriendlyMessage = 'Este e-mail já está em uso.';
                } else if (error.code === 'auth/invalid-email') {
                    userFriendlyMessage = 'O formato do e-mail é inválido.';
                } else if (error.code === 'auth/weak-password') {
                    userFriendlyMessage = 'A palavra-passe é muito fraca. Escolha uma palavra-passe mais forte.';
                }
                showMessage('signupErrorMessage', userFriendlyMessage, true);
            }
        });
    }

    if (googleSignupButton) {
        googleSignupButton.addEventListener('click', async () => {
            hideMessage('signupErrorMessage');
            try {
                const result = await signInWithPopup(auth, googleProvider);
                console.log('Utilizador registado/logado com Google:', result.user.email);
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Erro ao registar com Google:', error.code, error.message);
                if (error.code !== 'auth/popup-closed-by-user') {
                    showMessage('signupErrorMessage', 'Não foi possível registar com o Google. Tente novamente.', true);
                }
            }
        });
    }
}


// --- Lógica para a Página Principal (index.html) ---
if (window.location.pathname.includes('index.html')) {
    // Elementos da UI
    const userEmailElement = document.getElementById('userEmail'); // Pode ser nulo se não houver no HTML
    const sidebarUserName = document.getElementById('sidebarUserName');
    const logoutButton = document.getElementById('logoutButton');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const contentSections = document.querySelectorAll('.content-section');

    // Elementos da Ficha de Personagem
    const saveSheetButton = document.getElementById('saveSheetButton');
    const sheetSaveMessage = document.getElementById('sheetSaveMessage');
    const rituaisListContainer = document.getElementById('rituaisListContainer');
    const addRitualButton = document.getElementById('addRitualButton');

    // Elementos de Anotações
    const notesTextArea = document.getElementById('notesTextArea');
    const saveNoteButton = document.getElementById('saveNoteButton');
    const saveMessage = document.getElementById('saveMessage');

    // Elementos de Iniciativa
    const initiativeValueInput = document.getElementById('initiativeValue');
    const addInitiativeButton = document.getElementById('addInitiativeButton');
    const initiativeListContainer = document.getElementById('initiativeListContainer');
    const adminControls = document.getElementById('adminControls'); // Controles de admin para iniciativa
    const clearInitiativeButton = document.getElementById('clearInitiativeButton');
    const adminMessage = document.getElementById('adminMessage'); // Mensagens para iniciativa

    // Elementos de Hora/Data da Campanha
    const displayCampaignDate = document.getElementById('displayCampaignDate');
    const displayCampaignTime = document.getElementById('displayCampaignTime');
    const timeDateAdminSection = document.getElementById('timeDateAdminSection'); // Seção de admin para hora/data
    const campaignDateInput = document.getElementById('campaignDateInput');
    const campaignTimeInput = document.getElementById('campaignTimeInput');
    const saveTimeDateButton = document.getElementById('saveTimeDateButton'); 
    const timeDateMessage = document.getElementById('timeDateMessage');

    // Elementos de Mensagem Direta para o Mestre
    const masterMessageInput = document.getElementById('masterMessageInput');
    const sendMasterMessageButton = document.getElementById('sendMasterMessageButton');
    const masterMessageFeedback = document.getElementById('masterMessageFeedback');
    const masterMessagesDisplay = document.getElementById('masterMessagesDisplay');
    const masterMessageAdminControls = document.getElementById('masterMessageAdminControls'); // Controles de admin para mensagens
    const clearMasterMessagesButton = document.getElementById('clearMasterMessagesButton');
    const replyingToMessageDiv = document.getElementById('replyingToMessage');
    const replyToSenderNameSpan = document.getElementById('replyToSenderName');
    const cancelReplyButton = document.getElementById('cancelReplyButton');

    // Elementos para o novo controle de status da sessão
    const sessionStatusDisplay = document.getElementById('sessionStatusDisplay');
    const sessionIndicator = document.getElementById('sessionIndicator');
    const sessionStatusText = document.getElementById('sessionStatusText');

    // Elementos para a nova aba de Administração
    const adminSidebarLink = document.getElementById('adminSidebarLink');
    const adminContentSection = document.getElementById('admin-content');
    const sessionToggleButton = document.getElementById('sessionToggleButton');
    const adminSessionStatusText = document.getElementById('adminSessionStatusText'); // Texto do status na aba admin
    const sessionSummaryTitleInput = document.getElementById('sessionSummaryTitle');
    const sessionSummaryContentInput = document.getElementById('sessionSummaryContent');
    const saveSessionSummaryButton = document.getElementById('saveSessionSummaryButton');
    const sessionSummaryMessage = document.getElementById('sessionSummaryMessage');
    const playersCharactersList = document.getElementById('playersCharactersList'); // Lista de jogadores/personagens

    // Elemento para a nova aba de Resumo das Sessões
    const sessionSummariesList = document.getElementById('sessionSummariesList');


    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    // Adiciona um console.log para verificar o appId que o JavaScript está a usar
    console.log("App ID sendo usado no JavaScript:", appId); 

    let adminUIDs = [];
    let replyingToMessageId = null; // Variável para armazenar o ID da mensagem a ser respondida

    /**
     * Busca os UIDs dos utilizadores administradores do Firestore.
     * @returns {Promise<void>}
     */
    async function fetchAdminUIDs() {
        const adminCollectionRef = collection(db, "artifacts", appId, "public", "data", "adminUsers");
        try {
            const querySnapshot = await getDocs(adminCollectionRef); 
            adminUIDs = [];
            querySnapshot.forEach(doc => {
                adminUIDs.push(doc.id);
            });
            console.log("UIDs de administradores carregados:", adminUIDs);
        } catch (error) {
            console.error("Erro ao carregar UIDs de administradores:", error);
            adminUIDs = []; 
        }
    }

    /**
     * Cria e adiciona um item de ritual/poder à lista da ficha de personagem.
     * @param {object} [ritualData={ nome: '', descricao: '' }] Dados iniciais do ritual.
     */
    function createRitualItem(ritualData = { nome: '', descricao: '' }) {
        const ritualItemDiv = document.createElement('div');
        ritualItemDiv.classList.add('ritual-item');
        const uniqueId = `ritual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; 
        ritualItemDiv.innerHTML = `
            <div class="input-group">
                <label for="${uniqueId}-name">Nome do Ritual/Poder:</label>
                <input type="text" id="${uniqueId}-name" class="ritual-name" value="${ritualData.nome}" placeholder="Ex: Oscilação">
            </div>
            <div class="input-group">
                <label for="${uniqueId}-description">Descrição:</label>
                <textarea id="${uniqueId}-description" class="ritual-description" placeholder="Detalhes do ritual...">${ritualData.descricao}</textarea>
            </div>
            <button class="remove-ritual-btn">Remover Ritual</button>
        `;
        rituaisListContainer.appendChild(ritualItemDiv);
        ritualItemDiv.querySelector('.remove-ritual-btn').addEventListener('click', () => {
            ritualItemDiv.remove();
        });
    }

    /**
     * Renderiza a lista de iniciativas na interface.
     * @param {Array<object>} initiatives A lista de objetos de iniciativa.
     */
    function renderInitiativeList(initiatives) {
        initiativeListContainer.innerHTML = '';
        if (initiatives.length === 0) {
            initiativeListContainer.innerHTML = '<p style="text-align: center; color: #777;">Nenhuma iniciativa adicionada ainda.</p>';
            return;
        }
        const sortedInitiatives = initiatives.sort((a, b) => {
            if (b.value === a.value) {
                return b.timestamp - a.timestamp; // Se valores iguais, o mais recente primeiro
            }
            return b.value - a.value; // Maior valor primeiro
        });
        sortedInitiatives.forEach(item => {
            const initiativeItemDiv = document.createElement('div');
            initiativeItemDiv.classList.add('initiative-item');
            initiativeItemDiv.innerHTML = `
                <strong>${item.characterName || item.playerName || 'Personagem Desconhecido'}</strong>
                <span>${item.value}</span>
            `;
            initiativeListContainer.appendChild(initiativeItemDiv);
        });
    }

    /**
     * Formata um timestamp de milissegundos para uma string de data/hora legível.
     * @param {number} timestamp O timestamp em milissegundos.
     * @returns {string} A string de data/hora formatada.
     */
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const options = {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        };
        return date.toLocaleDateString('pt-BR', options);
    }

    /**
     * Renderiza as mensagens diretas do mestre na interface.
     * @param {Array<object>} messages A lista de objetos de mensagem.
     * @param {string} currentUserId O UID do utilizador atual.
     * @param {boolean} isAdmin Indica se o utilizador atual é um administrador.
     */
    function renderMasterMessages(messages, currentUserId, isAdmin) {
        masterMessagesDisplay.innerHTML = ''; 

        if (messages.length === 0) {
            masterMessagesDisplay.innerHTML = '<p style="text-align: center; color: #777;">Nenhuma mensagem ainda.</p>';
            return;
        }

        const sortedMessages = messages.sort((a, b) => b.timestamp - a.timestamp); // Mais recente primeiro

        // Filtra mensagens para exibir apenas as do utilizador ou de admins
        const filteredMessagesForDisplay = sortedMessages.filter(msg => {
            const isSenderAdmin = adminUIDs.includes(msg.senderId);
            const isOwnMessage = msg.senderId === currentUserId;

            // Se for admin, vê todas as mensagens
            if (isAdmin) {
                return true;
            } 
            // Se não for admin, vê as próprias mensagens e as mensagens dos admins
            else {
                return isOwnMessage || isSenderAdmin;
            }
        });

        if (filteredMessagesForDisplay.length === 0) {
            masterMessagesDisplay.innerHTML = '<p style="text-align: center; color: #777;">Nenhuma mensagem visível para você.</p>';
            return;
        }

        filteredMessagesForDisplay.forEach(msg => {
            const messageItemDiv = document.createElement('div');
            messageItemDiv.classList.add('message-item');
            if (msg.senderId === currentUserId) {
                messageItemDiv.classList.add('user-sent');
            }
            if (msg.parentId) {
                messageItemDiv.classList.add('is-reply');
            }

            messageItemDiv.innerHTML = `
                <strong>${msg.senderName || 'Desconhecido'}</strong>
                <p>${msg.message}</p>
                <div class="timestamp">${formatTimestamp(msg.timestamp)}</div>
            `;
            
            if (isAdmin) {
                const replyButton = document.createElement('button');
                replyButton.textContent = 'Responder';
                replyButton.classList.add('reply-button');
                replyButton.dataset.messageId = msg.id;
                replyButton.dataset.senderName = msg.senderName || 'Mensagem';
                
                replyButton.addEventListener('click', () => {
                    replyingToMessageId = msg.id;
                    replyToSenderNameSpan.textContent = msg.senderName || 'Mensagem';
                    replyingToMessageDiv.style.display = 'flex';
                    masterMessageInput.focus();
                    sendMasterMessageButton.textContent = 'Enviar Resposta';
                });
                messageItemDiv.appendChild(replyButton);
            }

            masterMessagesDisplay.appendChild(messageItemDiv);
        });
    }

    /**
     * Renderiza a lista de resumos de sessão.
     * @param {Array<object>} summaries A lista de objetos de resumo de sessão.
     */
    function renderSessionSummaries(summaries) {
        sessionSummariesList.innerHTML = '';
        if (summaries.length === 0) {
            sessionSummariesList.innerHTML = '<p style="text-align: center; color: #777;">Nenhum resumo de sessão disponível ainda.</p>';
            return;
        }

        const sortedSummaries = summaries.sort((a, b) => b.timestamp - a.timestamp); // Mais recente primeiro

        sortedSummaries.forEach(summary => {
            const summaryItemDiv = document.createElement('div');
            summaryItemDiv.classList.add('session-summary-item');
            summaryItemDiv.innerHTML = `
                <h4>${summary.title || 'Sem Título'}</h4>
                <p>${summary.content || 'Sem conteúdo.'}</p>
                <div class="meta-info">
                    Publicado por: ${summary.createdBy || 'Desconhecido'} em ${formatTimestamp(summary.timestamp)}
                </div>
            `;
            sessionSummariesList.appendChild(summaryItemDiv);
        });
    }

    /**
     * Renderiza a lista de jogadores e seus personagens na aba de administração.
     * @param {Array<object>} playersData A lista de objetos de jogador/personagem.
     */
    function renderPlayersAndCharacters(playersData) {
        playersCharactersList.innerHTML = '';
        if (playersData.length === 0) {
            playersCharactersList.innerHTML = '<p style="text-align: center; color: #777;">Nenhum jogador/personagem encontrado.</p>';
            return;
        }

        // Ordena por nome do jogador ou personagem para melhor visualização
        const sortedPlayers = playersData.sort((a, b) => {
            const nameA = (a.nomePlayer || a.playerName || '').toLowerCase();
            const nameB = (b.nomePlayer || b.playerName || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });

        sortedPlayers.forEach(player => {
            const playerItemDiv = document.createElement('div');
            playerItemDiv.classList.add('player-character-item');
            playerItemDiv.innerHTML = `
                <div>
                    <strong>Jogador:</strong> ${player.nomePlayer || player.playerName || 'Desconhecido'} <br>
                    <strong>Personagem:</strong> ${player.nome || 'N/A'}
                </div>
                <span>UID: ${player.userId}</span>
            `;
            playersCharactersList.appendChild(playerItemDiv);
        });
    }


    // --- Lógica de Autenticação e Carregamento de Dados ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('Utilizador logado:', user.email, 'UID:', user.uid);
            
            const userId = user.uid;

            await fetchAdminUIDs(); 
            const isAdmin = adminUIDs.includes(userId);
            console.log("É administrador?", isAdmin, "UID:", userId);

            // Carrega o nome do player da ficha ou usa o nome de exibição/e-mail
            const userSheetDocRef = doc(db, "artifacts", appId, "users", userId, "characterSheets", "mySheet");
            let userNameToDisplay = user.displayName || user.email; // Fallback padrão
            try {
                const sheetSnap = await getDoc(userSheetDocRef);
                if (sheetSnap.exists()) {
                    const sheetData = sheetSnap.data();
                    if (sheetData.nomePlayer) {
                        userNameToDisplay = sheetData.nomePlayer;
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar nome do player para barra lateral:", error);
            }

            if (sidebarUserName) {
                sidebarUserName.textContent = userNameToDisplay; // Usa o nome do player ou fallback
            }

            // Exibir/ocultar link da sidebar e seção de administração
            if (adminSidebarLink) {
                if (isAdmin) {
                    adminSidebarLink.style.display = 'block';
                } else {
                    adminSidebarLink.style.display = 'none';
                }
            }

            // Lógica para Ficha de Personagem
            const periciaIds = [
                "Acrobacia", "Adestramento", "Artes", "Atletismo", "Atualidades", 
                "Ciencias", "Crime", "Diplomacia", "Enganacao", "Fortitude",
                "Furtividade", "Iniciativa", "Intimidacao", "Intuicao", "Investigacao",
                "Luta", "Medicina", "Ocultismo", "Percepcao", "Pilotagem",
                "Pontaria", "Profissao", "Reflexos", "Religiao", "Sobrevivencia",
                "Tatica", "Tecnologia", "Vontade"
            ];

            if (document.getElementById('fichaNome')) { // Verifica se a seção de ficha existe
                onSnapshot(userSheetDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        document.getElementById('fichaNome').value = data.nome || '';
                        document.getElementById('fichaNomePlayer').value = data.nomePlayer || '';
                        document.getElementById('fichaClasse').value = data.classe || '';
                        document.getElementById('fichaOrigem').value = data.origem || '';
                        document.getElementById('fichaIdade').value = data.idade || '';
                        document.getElementById('fichaGenero').value = data.genero || '';

                        document.getElementById('fichaForca').value = data.forca || 0;
                        document.getElementById('fichaAgilidade').value = data.agilidade || 0;
                        document.getElementById('fichaVigor').value = data.vigor || 0;
                        document.getElementById('fichaIntelecto').value = data.intelecto || 0;
                        document.getElementById('fichaPresenca').value = data.presenca || 0;

                        document.getElementById('fichaPV').value = data.pv || '';
                        document.getElementById('fichaPS').value = data.ps || '';
                        document.getElementById('fichaPE').value = data.pe || '';
                        document.getElementById('fichaNEX').value = data.nex || 0; 
                        document.getElementById('fichaResistenciasGerais').value = data.resistenciasGerais || ''; 
                        
                        periciaIds.forEach(p => {
                            const input = document.getElementById(`pericia${p}`);
                            if (input) {
                                input.value = data[p] !== undefined ? data[p] : 0;
                            }
                        });

                        document.getElementById('fichaHabilidades').value = data.habilidades || '';
                        
                        rituaisListContainer.innerHTML = '';
                        if (data.rituais && Array.isArray(data.rituais)) {
                            data.rituais.forEach(ritual => createRitualItem(ritual));
                        }
                        if (!data.rituais || data.rituais.length === 0) {
                            createRitualItem(); // Garante pelo menos um campo vazio se não houver rituais
                        }
                        
                        document.getElementById('fichaEquipamentos').value = data.equipamentos || '';
                        document.getElementById('fichaDinheiro').value = data.dinheiro || '';
                        document.getElementById('fichaLimiteInventario').value = data.limiteInventario || ''; 
                        document.getElementById('fichaClasseItens').value = data.classeItens || ''; 

                        document.getElementById('fichaApariencia').value = data.apariencia || '';
                        document.getElementById('fichaHistoria').value = data.historia || '';

                        console.log("Ficha de personagem carregada com sucesso.");
                    } else {
                        console.log("Nenhuma ficha encontrada para este utilizador. Inicializando campos.");
                        // Limpa/inicializa todos os campos se a ficha não existir
                        document.getElementById('fichaNome').value = '';
                        document.getElementById('fichaNomePlayer').value = '';
                        document.getElementById('fichaClasse').value = '';
                        document.getElementById('fichaOrigem').value = '';
                        document.getElementById('fichaIdade').value = '';
                        document.getElementById('fichaGenero').value = '';
                        document.getElementById('fichaForca').value = 0;
                        document.getElementById('fichaAgilidade').value = 0;
                        document.getElementById('fichaVigor').value = 0;
                        document.getElementById('fichaIntelecto').value = 0;
                        document.getElementById('fichaPresenca').value = 0;
                        document.getElementById('fichaPV').value = '';
                        document.getElementById('fichaPS').value = '';
                        document.getElementById('fichaPE').value = '';
                        document.getElementById('fichaNEX').value = 0;
                        document.getElementById('fichaResistenciasGerais').value = '';
                        
                        periciaIds.forEach(p => {
                            const input = document.getElementById(`pericia${p}`);
                            if (input) input.value = 0;
                        });

                        document.getElementById('fichaHabilidades').value = '';
                        rituaisListContainer.innerHTML = '';
                        createRitualItem(); // Garante um campo inicial para rituais
                        document.getElementById('fichaEquipamentos').value = '';
                        document.getElementById('fichaDinheiro').value = '';
                        document.getElementById('fichaLimiteInventario').value = '';
                        document.getElementById('fichaClasseItens').value = '';
                        document.getElementById('fichaApariencia').value = '';
                        document.getElementById('fichaHistoria').value = '';
                    }
                }, (error) => {
                    console.error("Erro ao carregar ficha:", error);
                    showMessage('sheetSaveMessage', 'Erro ao carregar ficha. Verifique as suas regras de segurança.', true);
                });
            }

            if (addRitualButton) {
                addRitualButton.addEventListener('click', () => createRitualItem());
            }

            if (saveSheetButton) {
                saveSheetButton.addEventListener('click', async () => {
                    const sheetData = {
                        nome: document.getElementById('fichaNome').value,
                        nomePlayer: document.getElementById('fichaNomePlayer').value,
                        classe: document.getElementById('fichaClasse').value,
                        origem: document.getElementById('fichaOrigem').value,
                        idade: parseInt(document.getElementById('fichaIdade').value) || 0,
                        genero: document.getElementById('fichaGenero').value,
                        forca: parseInt(document.getElementById('fichaForca').value) || 0,
                        agilidade: parseInt(document.getElementById('fichaAgilidade').value) || 0,
                        vigor: parseInt(document.getElementById('fichaVigor').value) || 0,
                        intelecto: parseInt(document.getElementById('fichaIntelecto').value) || 0,
                        presenca: parseInt(document.getElementById('fichaPresenca').value) || 0,
                        pv: document.getElementById('fichaPV').value,
                        ps: document.getElementById('fichaPS').value,
                        pe: document.getElementById('fichaPE').value,
                        nex: parseInt(document.getElementById('fichaNEX').value) || 0,
                        resistenciasGerais: document.getElementById('fichaResistenciasGerais').value,
                        habilidades: document.getElementById('fichaHabilidades').value,
                        rituais: [],
                        equipamentos: document.getElementById('fichaEquipamentos').value,
                        dinheiro: document.getElementById('fichaDinheiro').value,
                        limiteInventario: document.getElementById('fichaLimiteInventario').value,
                        classeItens: document.getElementById('fichaClasseItens').value,
                        apariencia: document.getElementById('fichaApariencia').value,
                        historia: document.getElementById('fichaHistoria').value,
                    };

                    periciaIds.forEach(p => {
                        const input = document.getElementById(`pericia${p}`);
                        if (input) {
                            sheetData[p] = parseInt(input.value) || 0;
                        }
                    });

                    document.querySelectorAll('.ritual-item').forEach(item => {
                        const nome = item.querySelector('.ritual-name').value;
                        const descricao = item.querySelector('.ritual-description').value;
                        sheetData.rituais.push({ nome, descricao });
                    });

                    try {
                        await setDoc(userSheetDocRef, sheetData, { merge: true });
                        console.log("Ficha salva com sucesso!");
                        showMessage('sheetSaveMessage', 'Ficha salva com sucesso!');
                        setTimeout(() => hideMessage('sheetSaveMessage'), 3000);
                    } catch (error) {
                        console.error("Erro ao salvar ficha:", error);
                        showMessage('sheetSaveMessage', `Erro ao salvar ficha: ${error.message}. Verifique as suas regras de segurança.`, true);
                    }
                });
            }

            // Lógica para Iniciativa
            const initiativesCollectionRef = collection(db, "artifacts", appId, "public", "data", "initiatives");
            const currentUserInitiativeDocRef = doc(initiativesCollectionRef, userId); 

            if (addInitiativeButton) {
                addInitiativeButton.addEventListener('click', async () => {
                    const initiativeValue = parseInt(initiativeValueInput.value);
                    if (isNaN(initiativeValue)) {
                        showMessage('adminMessage', 'Por favor, insira um valor numérico para a iniciativa.', true); 
                        setTimeout(() => hideMessage('adminMessage'), 3000);
                        return;
                    }

                    let characterName = user.displayName || user.email;

                    try {
                        const sheetSnap = await getDoc(userSheetDocRef); 
                        if (sheetSnap.exists()) {
                            const sheetData = sheetSnap.data();
                            if (sheetData.nome) { 
                                characterName = sheetData.nome;
                            }
                        }
                    } catch (error) {
                        console.error("Erro ao obter nome do personagem para iniciativa:", error);
                    }

                    try {
                        await setDoc(currentUserInitiativeDocRef, {
                            userId: userId,
                            characterName: characterName,
                            value: initiativeValue,
                            timestamp: Date.now() 
                        });
                        console.log("Iniciativa adicionada/atualizada com sucesso!");
                        showMessage('adminMessage', `A sua iniciativa (${initiativeValue}) foi atualizada!`); 
                        setTimeout(() => hideMessage('adminMessage'), 3000);
                    }
                    catch (error) {
                        console.error("Erro ao adicionar/atualizar iniciativa:", error);
                        showMessage('adminMessage', `Erro ao adicionar iniciativa: ${error.message}.`, true); 
                    }
                });
            }

            if (initiativeListContainer) {
                const q = query(initiativesCollectionRef);

                onSnapshot(q, (snapshot) => {
                    const initiatives = [];
                    snapshot.forEach(doc => {
                        initiatives.push(doc.data());
                    });
                    renderInitiativeList(initiatives);
                    console.log("Lista de iniciativas atualizada.");
                }, (error) => {
                    console.error("Erro ao ouvir iniciativas:", error);
                    initiativeListContainer.innerHTML = `<p style="text-align: center; color: #dc3545;">Erro ao carregar iniciativas: ${error.message}</p>`;
                });
            }

            if (isAdmin && adminControls) { // Controles de admin para iniciativa
                adminControls.style.display = 'block';

                if (clearInitiativeButton) {
                    clearInitiativeButton.addEventListener('click', async () => {
                        const confirmClear = confirm("Tem a certeza que deseja limpar TODAS as iniciativas? Esta ação é irreversível!");
                        if (!confirmClear) return;

                        showMessage('adminMessage', 'A limpar iniciativas...', false);

                        const batch = writeBatch(db);
                        try {
                            const snapshot = await getDocs(initiativesCollectionRef);
                            snapshot.forEach(doc => {
                                batch.delete(doc.ref);
                            });
                            await batch.commit();
                            console.log("Todas as iniciativas foram limpas com sucesso!");
                            showMessage('adminMessage', 'Todas as iniciativas foram limpas com sucesso!', false);
                            setTimeout(() => hideMessage('adminMessage'), 3000);
                        } catch (error) {
                            console.error("Erro ao limpar iniciativas:", error);
                            showMessage('adminMessage', `Erro ao limpar iniciativas: ${error.message}.`, true);
                        }
                    });
                }
            } else if (adminControls) {
                adminControls.style.display = 'none'; 
            }

            // Lógica para Hora/Data da Campanha
            const campaignTimeDateDocRef = doc(db, "artifacts", appId, "public", "data", "campaignTimeDate", "current");

            if (displayCampaignDate && displayCampaignTime) {
                onSnapshot(campaignTimeDateDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        displayCampaignDate.textContent = data.campaignDate || 'Não definida';
                        displayCampaignTime.textContent = data.campaignTime || 'Não definida';
                        if (isAdmin) { // Apenas admin pode ver/preencher os inputs
                            campaignDateInput.value = data.campaignDate || '';
                            campaignTimeInput.value = data.campaignTime || '';
                        }
                        console.log("Hora/Data da campanha carregada:", data.campaignDate, data.campaignTime);
                    } else {
                        displayCampaignDate.textContent = 'Não definida';
                        displayCampaignTime.textContent = 'Não definida';
                        if (isAdmin) { // Apenas admin pode ver/preencher os inputs
                            campaignDateInput.value = '';
                            campaignTimeInput.value = '';
                        }
                        console.log("Hora/Data da campanha não definida.");
                    }
                }, (error) => {
                    console.error("Erro ao carregar Hora/Data da campanha:", error);
                    showMessage('timeDateMessage', 'Erro ao carregar Hora/Data. Verifique as suas regras de segurança.', true);
                });
            }

            if (isAdmin && timeDateAdminSection) { // Seção de admin para hora/data
                timeDateAdminSection.style.display = 'block'; 
                campaignDateInput.disabled = false;
                campaignTimeInput.disabled = false;
                saveTimeDateButton.disabled = false;

                if (saveTimeDateButton) {
                    saveTimeDateButton.addEventListener('click', async () => {
                        const campaignDate = campaignDateInput.value;
                        const campaignTime = campaignTimeInput.value;

                        if (!campaignDate || !campaignTime) {
                            showMessage('timeDateMessage', 'Por favor, preencha a data e a hora.', true);
                            setTimeout(() => hideMessage('timeDateMessage'), 3000);
                            return;
                        }

                        try {
                            await setDoc(campaignTimeDateDocRef, {
                                campaignDate: campaignDate,
                                campaignTime: campaignTime,
                                lastUpdated: Date.now(),
                                updatedBy: user.email || user.uid 
                            }, { merge: true });
                            console.log("Hora/Data da campanha salva com sucesso!");
                            showMessage('timeDateMessage', 'Hora/Data salva com sucesso!');
                            setTimeout(() => hideMessage('timeDateMessage'), 3000);
                        } catch (error) {
                            console.error("Erro ao salvar Hora/Data da campanha:", error);
                            showMessage('timeDateMessage', `Erro ao salvar Hora/Data: ${error.message}.`, true);
                        }
                    });
                }
            } else if (timeDateAdminSection) {
                timeDateAdminSection.style.display = 'none'; 
                campaignDateInput.disabled = true;
                campaignTimeInput.disabled = true;
                saveTimeDateButton.disabled = true;
            }

            // Lógica para Mensagem Direta para o Mestre
            const masterMessagesCollectionRef = collection(db, "artifacts", appId, "public", "data", "masterMessages");

            if (cancelReplyButton) {
                cancelReplyButton.addEventListener('click', () => {
                    replyingToMessageId = null;
                    replyToSenderNameSpan.textContent = '';
                    replyingToMessageDiv.style.display = 'none';
                    sendMasterMessageButton.textContent = 'Enviar Mensagem';
                    masterMessageInput.value = ''; 
                });
            }

            if (sendMasterMessageButton) {
                sendMasterMessageButton.addEventListener('click', async () => {
                    const messageText = masterMessageInput.value.trim();
                    if (!messageText) {
                        showMessage('masterMessageFeedback', 'Por favor, escreva uma mensagem antes de enviar.', true);
                        setTimeout(() => hideMessage('masterMessageFeedback'), 3000);
                        return;
                    }

                    let senderName = user.displayName || user.email;
                    try {
                        const sheetSnap = await getDoc(userSheetDocRef); 
                        if (sheetSnap.exists()) {
                            const sheetData = sheetSnap.data();
                            if (sheetData.nome) { 
                                senderName = sheetData.nome;
                            }
                        }
                    } catch (error) {
                        console.error("Erro ao obter nome do personagem para mensagem:", error);
                    }

                    const messageData = {
                        senderId: userId,
                        senderName: senderName,
                        message: messageText,
                        timestamp: Date.now()
                    };

                    if (replyingToMessageId) {
                        messageData.parentId = replyingToMessageId;
                    }

                    try {
                        await addDoc(masterMessagesCollectionRef, messageData);
                        masterMessageInput.value = ''; 
                        replyingToMessageId = null;
                        replyToSenderNameSpan.textContent = '';
                        replyingToMessageDiv.style.display = 'none';
                        sendMasterMessageButton.textContent = 'Enviar Mensagem';

                        console.log("Mensagem enviada com sucesso!");
                        showMessage('masterMessageFeedback', 'Mensagem enviada com sucesso!');
                        setTimeout(() => hideMessage('masterMessageFeedback'), 3000);
                    } catch (error) {
                        console.error("Erro ao enviar mensagem:", error);
                        showMessage('masterMessageFeedback', `Erro ao enviar mensagem: ${error.message}.`, true);
                    }
                });
            }

            if (masterMessagesDisplay) {
                if (isAdmin) {
                    const qMessagesAdmin = query(masterMessagesCollectionRef, orderBy("timestamp", "desc"));
                    onSnapshot(qMessagesAdmin, (snapshot) => {
                        const messages = [];
                        snapshot.forEach(doc => {
                            messages.push({ id: doc.id, ...doc.data() }); 
                        });
                        console.log("[Admin] Mensagens recebidas do Firestore (bruto):", messages);
                        renderMasterMessages(messages, userId, isAdmin);
                        console.log("[Admin] Histórico de mensagens atualizado e renderizado.");
                    }, (error) => {
                        console.error("[Admin] Erro ao ouvir mensagens:", error);
                        masterMessagesDisplay.innerHTML = `<p style="text-align: center; color: #dc3545;">Erro ao carregar mensagens: ${error.message}</p>`;
                    });

                } else {
                    let allUserMessages = new Map(); 
                    let adminUserMessages = new Map(); 

                    const updateCombinedMessages = () => {
                        const combinedMessagesArray = [...allUserMessages.values(), ...adminUserMessages.values()];
                        renderMasterMessages(combinedMessagesArray, userId, isAdmin);
                    };

                    const qOwnMessages = query(
                        masterMessagesCollectionRef,
                        where("senderId", "==", userId),
                        orderBy("timestamp", "desc")
                    );
                    onSnapshot(qOwnMessages, (snapshot) => {
                        allUserMessages.clear(); 
                        snapshot.forEach(doc => {
                            allUserMessages.set(doc.id, { id: doc.id, ...doc.data() }); 
                        });
                        console.log("[User] Mensagens próprias recebidas (bruto):", Array.from(allUserMessages.values()));
                        updateCombinedMessages();
                    }, (error) => {
                        console.error("[User] Erro ao ouvir as próprias mensagens:", error);
                    });

                    if (adminUIDs.length > 0 && adminUIDs.length <= 10) { 
                        const qAdminMessages = query(
                            masterMessagesCollectionRef,
                            where("senderId", "in", adminUIDs),
                            orderBy("timestamp", "desc")
                        );
                        onSnapshot(qAdminMessages, (snapshot) => {
                            adminUserMessages.clear(); 
                            snapshot.forEach(doc => {
                                adminUserMessages.set(doc.id, { id: doc.id, ...doc.data() }); 
                            });
                            console.log("[User] Mensagens de administradores recebidas (bruto):", Array.from(adminUserMessages.values()));
                            updateCombinedMessages();
                        }, (error) => {
                            console.error("[User] Erro ao ouvir mensagens de administradores:", error);
                        });
                    } else if (adminUIDs.length > 10) {
                        console.warn("[User] Muitos administradores para usar 'where(\"senderId\", \"in\", adminUIDs)'. Mensagens do Mestre podem não aparecer. Considere um modelo de dados diferente.");
                    }
                }
            }


            if (isAdmin && masterMessageAdminControls) {
                masterMessageAdminControls.style.display = 'block';

                if (clearMasterMessagesButton) {
                    clearMasterMessagesButton.addEventListener('click', async () => {
                        const confirmClear = confirm("Tem a certeza que deseja limpar TODAS as iniciativas? Esta ação é irreversível!");
                        if (!confirmClear) return;

                        showMessage('masterMessageFeedback', 'A limpar mensagens...', false);

                        const batch = writeBatch(db);
                        try {
                            const snapshot = await getDocs(masterMessagesCollectionRef);
                            snapshot.forEach(doc => {
                                batch.delete(doc.ref);
                            });
                            await batch.commit();
                            console.log("Todas as mensagens foram limpas com sucesso!");
                            showMessage('masterMessageFeedback', 'Todas as mensagens foram limpas com sucesso!', false);
                            setTimeout(() => hideMessage('masterMessageFeedback'), 3000);
                        } catch (error) {
                            console.error("Erro ao limpar mensagens:", error);
                            showMessage('masterMessageFeedback', `Erro ao limpar mensagens: ${error.message}.`, true);
                        }
                    });
                }
            } else if (masterMessageAdminControls) {
                masterMessageAdminControls.style.display = 'none';
            }

            // --- Lógica para o status da sessão (Nova Funcionalidade) ---
            const campaignSessionRef = doc(db, "artifacts", appId, "public", "data", "campaignSession", "status");

            // Listener para atualizar o status da sessão na UI
            if (sessionStatusDisplay) {
                onSnapshot(campaignSessionRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const isActive = data.isSessionActive;
                        sessionIndicator.classList.remove('active', 'inactive');
                        sessionStatusText.textContent = isActive ? 'Sessão Ativa' : 'Sessão Inativa';
                        if (isAdmin && adminSessionStatusText) { // Atualiza texto na aba admin
                            adminSessionStatusText.textContent = isActive ? 'Sessão Ativa' : 'Sessão Inativa';
                        }
                        if (isActive) {
                            sessionIndicator.classList.add('active');
                            sessionIndicator.style.backgroundColor = '#28a745'; // Verde
                        } else {
                            sessionIndicator.classList.add('inactive');
                            sessionIndicator.style.backgroundColor = '#dc3545'; // Vermelho
                        }
                        // Atualiza o estado do toggle apenas se for admin
                        if (isAdmin && sessionToggleButton) {
                            sessionToggleButton.checked = isActive;
                        }
                    } else {
                        // Define um status padrão se o documento não existir
                        sessionIndicator.classList.remove('active', 'inactive');
                        sessionIndicator.classList.add('inactive');
                        sessionIndicator.style.backgroundColor = '#dc3545'; // Vermelho
                        sessionStatusText.textContent = 'Sessão Inativa';
                        if (isAdmin && sessionToggleButton) {
                            sessionToggleButton.checked = false;
                        }
                        if (isAdmin && adminSessionStatusText) {
                            adminSessionStatusText.textContent = 'Sessão Inativa';
                        }
                    }
                }, (error) => {
                    console.error("Erro ao carregar status da sessão:", error);
                    if (sessionStatusText) {
                        sessionStatusText.textContent = 'Erro ao carregar status';
                        sessionIndicator.style.backgroundColor = '#ffc107'; // Amarelo para erro
                    }
                    if (isAdmin && adminSessionStatusText) {
                        adminSessionStatusText.textContent = 'Erro ao carregar status';
                    }
                });
            }

            // Event listener para o toggle de sessão (apenas para admins)
            if (isAdmin && sessionToggleButton) {
                sessionToggleButton.addEventListener('change', async (e) => {
                    const newStatus = e.target.checked;
                    try {
                        await setDoc(campaignSessionRef, {
                            isSessionActive: newStatus,
                            lastUpdated: Date.now(),
                            updatedBy: user.email || user.uid
                        }, { merge: true });
                        console.log(`Status da sessão atualizado para: ${newStatus}`);
                    } catch (error) {
                        console.error("Erro ao atualizar status da sessão:", error);
                        // showMessage('adminSessionMessage', `Erro ao atualizar status: ${error.message}`, true); // Pode adicionar uma mensagem de feedback aqui
                        alert(`Erro ao atualizar status da sessão: ${error.message}`); 
                    }
                });
            }

            // --- Lógica para Resumos de Sessão (Nova Funcionalidade) ---
            const sessionSummariesCollectionRef = collection(db, "artifacts", appId, "public", "data", "sessionSummaries");

            // Listener para carregar e exibir resumos de sessão (para todos)
            if (sessionSummariesList) {
                const qSummaries = query(sessionSummariesCollectionRef, orderBy("timestamp", "desc"));
                onSnapshot(qSummaries, (snapshot) => {
                    const summaries = [];
                    snapshot.forEach(doc => {
                        summaries.push({ id: doc.id, ...doc.data() });
                    });
                    renderSessionSummaries(summaries);
                    console.log("Resumos de sessão carregados e renderizados.");
                }, (error) => {
                    console.error("Erro ao carregar resumos de sessão:", error);
                    sessionSummariesList.innerHTML = `<p style="text-align: center; color: #dc3545;">Erro ao carregar resumos: ${error.message}</p>`;
                });
            }

            // Salvar Resumo de Sessão (apenas para admins)
            if (isAdmin && saveSessionSummaryButton) {
                saveSessionSummaryButton.addEventListener('click', async () => {
                    const title = sessionSummaryTitleInput.value.trim();
                    const content = sessionSummaryContentInput.value.trim();

                    if (!title || !content) {
                        showMessage('sessionSummaryMessage', 'Por favor, preencha o título e o conteúdo do resumo.', true);
                        setTimeout(() => hideMessage('sessionSummaryMessage'), 3000);
                        return;
                    }

                    try {
                        await addDoc(sessionSummariesCollectionRef, {
                            title: title,
                            content: content,
                            timestamp: Date.now(),
                            createdBy: user.displayName || user.email // Ou nome do player admin se preferir
                        });
                        sessionSummaryTitleInput.value = '';
                        sessionSummaryContentInput.value = '';
                        showMessage('sessionSummaryMessage', 'Resumo da sessão salvo com sucesso!');
                        setTimeout(() => hideMessage('sessionSummaryMessage'), 3000);
                    } catch (error) {
                        console.error("Erro ao salvar resumo da sessão:", error);
                        showMessage('sessionSummaryMessage', `Erro ao salvar resumo: ${error.message}. Verifique as suas regras de segurança.`, true);
                    }
                });
            }

            // --- Lógica para Listar Jogadores e Personagens (apenas para admins) ---
            if (isAdmin && playersCharactersList) {
                // Obtém todas as coleções 'characterSheets' de todos os utilizadores
                const allCharacterSheetsQuery = query(collectionGroup(db, 'characterSheets'));
                
                onSnapshot(allCharacterSheetsQuery, (snapshot) => {
                    const playersData = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        // Certifica-se de que é um documento de ficha de personagem principal (mySheet)
                        // A estrutura esperada é users/{userId}/characterSheets/mySheet
                        // O path do doc será algo como artifacts/appId/users/UID_DO_USER/characterSheets/mySheet
                        const pathSegments = doc.ref.path.split('/');
                        const userIdFromPath = pathSegments[pathSegments.indexOf('users') + 1];

                        // Adiciona dados relevantes se o documento for uma ficha válida
                        playersData.push({
                            userId: userIdFromPath,
                            nomePlayer: data.nomePlayer || 'N/A',
                            nome: data.nome || 'N/A'
                        });
                    });
                    renderPlayersAndCharacters(playersData);
                    console.log("Lista de jogadores e personagens atualizada.");
                }, (error) => {
                    console.error("Erro ao carregar lista de jogadores/personagens:", error);
                    playersCharactersList.innerHTML = `<p style="text-align: center; color: #dc3545;">Erro ao carregar lista: ${error.message}</p>`;
                });
            }


            // --- Lógica de Navegação da Sidebar ---
            sidebarLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();

                    // Remove 'active' de todos os links e seções
                    sidebarLinks.forEach(item => item.classList.remove('active'));
                    contentSections.forEach(section => section.classList.remove('active'));

                    // Adiciona 'active' ao link clicado
                    e.target.classList.add('active');

                    // Mostra a seção de conteúdo correspondente
                    const targetId = e.target.dataset.target;
                    const targetSection = document.getElementById(targetId);

                    if (targetSection) {
                        targetSection.classList.add('active');
                    }
                });
            });

            // Ativa a primeira aba visível ao carregar a página
            if (sidebarLinks.length > 0) {
                // Se for admin, tenta ativar a aba de administração primeiro
                if (isAdmin) {
                    const adminLink = document.querySelector('.sidebar-link[data-target="admin-content"]');
                    if (adminLink) {
                        adminLink.click();
                    } else { // Fallback para a ficha se o link admin não for encontrado (embora não deva acontecer)
                        const fichaLink = document.querySelector('.sidebar-link[data-target="ficha-content"]');
                        if (fichaLink) fichaLink.click();
                    }
                } else {
                    // Se não for admin, tenta ativar a aba de ficha por padrão
                    const fichaLink = document.querySelector('.sidebar-link[data-target="ficha-content"]');
                    if (fichaLink) {
                        fichaLink.click();
                    } else {
                        // Se a ficha não existir ou não for a primeira, ative a primeira visível
                        const firstVisibleLink = Array.from(sidebarLinks).find(link => link.style.display !== 'none');
                        if (firstVisibleLink) {
                            firstVisibleLink.click();
                        }
                    }
                }
            }


        } else {
            console.log('Nenhum utilizador logado. Redirecionando para login.');
            window.location.href = 'login.html';
        }
    });

    // --- Lógica de Logout ---
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                console.log('Utilizador deslogado com sucesso.');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
                alert('Ocorreu um erro ao fazer logout. Tente novamente.'); 
            }
        });
    }
}
