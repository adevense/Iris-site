<script>
    import { auth } from '$lib/firebase.js';
    import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
    import { goto } from '$app/navigation';

    let email = '';
    let password = '';
    let errorMessage = '';

    async function handleLogin() {
        errorMessage = ''; 
        try {
            await setPersistence(auth, browserLocalPersistence);
            await signInWithEmailAndPassword(auth, email, password);
            goto('/Iris-site/dashboard'); 
        } catch (error) {
            console.error('Erro de login:', error.code);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'E-mail ou palavra-passe inválidos.';
            } else {
                errorMessage = 'Ocorreu um erro ao fazer login.';
            }
        }
    }
</script>

<div class="auth-container">
    <h2>Bem-vindo! Faça seu Login</h2>
    <form id="loginForm" on:submit={handleLogin}>
        <div class="input-group">
            <label for="email">E-mail:</label>
            <input type="email" id="email" placeholder="seuemail@exemplo.com" required autocomplete="username" bind:value={email}>
        </div>
        <div class="input-group">
            <label for="password">Senha:</label>
            <input type="password" id="password" placeholder="********" required autocomplete="current-password" bind:value={password}>
        </div>
        <button type="submit">Entrar</button>
        <p class="error-message" id="errorMessage">{errorMessage}</p>
    </form>
    <p class="redirect-link">Não tem uma conta? <a href="/Iris-site/registro">Cadastre-se aqui</a></p>
</div>

<style>
    :global(body) {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
    }

    .auth-container {
        background-color: #ffffff;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 420px;
        text-align: center;
    }
    
    h2 {
        margin-bottom: 30px;
        color: #2c3e50;
        font-size: 2em;
    }

    .input-group {
        margin-bottom: 20px;
        text-align: left;
    }
    
    label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
    }

    input {
        width: 100%;
        box-sizing: border-box;
        padding: 12px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 16px;
    }

    button {
        width: 100%;
        padding: 14px;
        border: none;
        border-radius: 8px;
        background-color: #007bff;
        color: #fff;
        font-size: 1.1em;
        font-weight: bold;
    }

    .error-message {
        color: #dc3545;
        margin-top: 15px;
    }

    .redirect-link {
        margin-top: 30px;
    }

    .redirect-link a {
        color: #007bff;
        text-decoration: none;
        font-weight: bold;
    }
</style>