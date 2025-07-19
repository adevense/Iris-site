<script>
	import { tab, userStore, chatIdOpen } from '$lib/appData';
	import Ficha from './Ficha.svelte';
	import Anotacoes from './Anotacoes.svelte';
	import Iniciativa from './Iniciativa.svelte';
    import Resumos from './Resumos.svelte';
    import Administracao from './Administracao.svelte';
    import Chat from './Chat.svelte';
    import Personagens from './Personagens.svelte';
	import { auth, db } from '$lib/firebase.js';
	import { doc, getDoc, onSnapshot, query, collectionGroup, getDocs, setDoc } from 'firebase/firestore';
	import { onMount } from 'svelte';
	import { signOut } from 'firebase/auth';
	import { goto } from '$app/navigation';

    tab.subscribe(() => {
        chatIdOpen.update(v => v = null)
    })

	let isAdmin = false;
    let players = [];
	onMount(async () => {
        let unsubListeners = []
		try {
			const user = $userStore;
			const adminDocRef = doc(db, 'adminUsers', user.uid);
			const adminDoc = await getDoc(adminDocRef);
			isAdmin = adminDoc.exists();
            const sheetsQuery = query(collectionGroup(db, 'characterSheets'));
            await getDocs(sheetsQuery).then((snapshot) => {
                players = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    const path = doc.ref.path.split('/');
                    const userId = path[path.indexOf('users') + 1];
                    return { userId, playerName: data.nomePlayer, characterName: data.nome };
                });
            });
            for(const player of players){
                if(player.userId == $userStore.uid) continue;
                const chatDocRef = doc(db, 'users', $userStore.uid, 'chat', player.userId);
                const unsub = onSnapshot(chatDocRef, (docSnapshot) => {
                    if(docSnapshot.exists()){
                        let messages = docSnapshot.data().messages
                        let oneAlert = false
                        for(const message of messages){
                            if(!message.notified && message.recipientId == $userStore.uid){
                                message.notified = true
                                if(!oneAlert && message.senderId != $chatIdOpen) alert(`${message.senderName} te enviou uma mensagem!`)
                                oneAlert = true
                            }
                        }
                        setDoc(chatDocRef, { messages: messages })
                    }
                })
                unsubListeners.push(unsub)
            }
		} catch (error) {
			console.error(error);
		}
		return () => {
            for(const listener of unsubListeners) listener();
            unsubListeners = []
		}
	})
</script>

{#if $tab == 0}
	<Ficha/>
{:else if $tab == 1}
	<Anotacoes/>
{:else if $tab == 2}
	<Iniciativa {isAdmin}/>
{:else if $tab == 3}
    <Chat/>
{:else if $tab == 4}
    <Resumos/>
{:else if $tab == 5 && isAdmin}
    <Administracao/>
{:else if $tab == 6}
    <Personagens {isAdmin}/>
{/if}
