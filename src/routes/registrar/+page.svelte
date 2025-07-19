<script>
    import { auth } from '$lib/firebase.js';
    import { browserLocalPersistence, createUserWithEmailAndPassword, setPersistence } from 'firebase/auth';
    import { goto } from '$app/navigation';

    let email = $state('');
    let senha = $state('');
    let confirmarSenha = $state('');
    let errorMsg = $state('');

	async function handleRegister() {
        errorMsg = ''; 
        if (senha !== confirmarSenha) {
            errorMsg = 'As senhas não coincidem.';
            return;
        }
        if (senha.length < 6) {
            errorMsg = 'A senha deve ter pelo menos 6 caracteres.';
            return;
        }
        try {
            await setPersistence(auth, browserLocalPersistence);
            await createUserWithEmailAndPassword(auth, email, senha);
            await goto('/Iris-site/dashboard');
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                errorMsg = 'Este e-mail já está em uso.';
            } else if (error.code === 'auth/invalid-email') {
                errorMsg = 'O formato do e-mail é inválido.';
            } else if (error.code === 'auth/weak-password') {
                errorMsg = 'A senha é muito fraca.';
            } else {
                errorMsg = 'Ocorreu um erro ao tentar registrar. Tente novamente.';
            }
        }
    }
</script>

<div class="row">
    <center>
        <div class="col-12 col-md-6 col-lg-4" style="position:relative; top:25dvh;">
            <div class="border border-2 rounded p-3 position-relative">
                <center><h3>Crie sua conta:</h3></center>
                <div class="input-group mt-3 mb-3">
                    <span class="input-group-text" id="inputGroup-sizing-default">E-mail</span>
                    <input type="email" class="form-control" bind:value={email}>
                </div>
                <div class="input-group mb-3">
                    <span class="input-group-text" id="inputGroup-sizing-default">Senha</span>
                    <input type="password" class="form-control" bind:value={senha}>
                </div>
                <div class="input-group mb-3">
                    <span class="input-group-text" id="inputGroup-sizing-default">Confirme a senha</span>
                    <input type="password" class="form-control" bind:value={confirmarSenha}>
                </div>
                <center>
                    <button class="btn btn-primary mb-3" style="width:98%;" onclick={handleRegister}>Registrar</button>
                    <p style="color:red;">{errorMsg}</p>
                    <p>Já tem uma conta? <a href="/Iris-site">Faça login aqui</a></p>
                </center>
            </div>
        </div>
    </center>
</div>

