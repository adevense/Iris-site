<script>
    import { auth } from "$lib/firebase";
    import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
    let email = $state('')
    let senha = $state('')
    let errorMsg = $state('')

    async function handleLogin() {
        if(senha == "" || email == ""){
            errorMsg = "Preencha o campo de e-mail e senha."
            return;
        }
        errorMsg = ''; 
        try {
            await setPersistence(auth, browserLocalPersistence);
            await signInWithEmailAndPassword(auth, email, senha);
            goto('/Iris-site/dashboard'); 
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMsg = 'E-mail ou senha inválidos.';
            } else {
                errorMsg = 'Ocorreu um erro ao fazer login.';
            }
        }
    }
</script>

<div class="row">
    <center>
        <div class="col-12 col-md-6 col-lg-4" style="position:relative; top:25dvh;">
            <div class="border border-2 rounded p-3 position-relative">
                <center><h3>Bem-vindo! Faça seu login:</h3></center>
                <div class="input-group mt-3 mb-3">
                    <span class="input-group-text" id="inputGroup-sizing-default">E-mail</span>
                    <input type="email" class="form-control" bind:value={email}>
                </div>
                <div class="input-group mb-3">
                    <span class="input-group-text" id="inputGroup-sizing-default">Senha</span>
                    <input type="password" class="form-control" bind:value={senha}>
                </div>
                <center>
                    <button class="btn btn-primary mb-3" style="width:98%;" onclick={handleLogin}>Entrar</button>
                    <p style="color:red;">{errorMsg}</p>
                    <p>Não tem uma conta? <a href="/Iris-site/registrar">Cadastre-se aqui</a></p>
                </center>
            </div>
        </div>
    </center>
</div>