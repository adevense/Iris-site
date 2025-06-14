<script>
    import { auth } from '$lib/firebase.js';
    import { browserLocalPersistence, createUserWithEmailAndPassword, setPersistence } from 'firebase/auth';
    import { goto } from '$app/navigation';

    let email = '';
    let password = '';
    let confirmPassword = '';
    let errorMessage = '';

	async function handleRegister() {
        errorMessage = ''; 

        if (password !== confirmPassword) {
            errorMessage = 'As palavras-passe não coincidem.';
            return;
        }
        if (password.length < 6) {
            errorMessage = 'A palavra-passe deve ter pelo menos 6 caracteres.';
            return;
        }

        try {
            await setPersistence(auth, browserLocalPersistence);
            await createUserWithEmailAndPassword(auth, email, password);
            await goto('/Ordem-site/dashboard');

        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este e-mail já está em uso.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'O formato do e-mail é inválido.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'A palavra-passe é muito fraca.';
            } else {
                errorMessage = 'Ocorreu um erro ao tentar registrar. Tente novamente.';
            }
        }
    }
</script>

<div class="auth-container">
	<h2>Crie sua Conta</h2>
	<form id="signupForm" on:submit={handleRegister}>
		<div class="input-group">
			<label for="signupEmail">E-mail:</label>
			<input
				type="email"
				id="signupEmail"
				placeholder="seuemail@exemplo.com"
				required
				autocomplete="email"
                bind:value={email}
			/>
		</div>
		<div class="input-group">
			<label for="signupPassword">Senha:</label>
			<input
				type="password"
				id="signupPassword"
				placeholder="********"
				required
				autocomplete="new-password"
                bind:value={password}
			/>
		</div>
		<div class="input-group">
			<label for="confirmPassword">Confirme a Senha:</label>
			<input
				type="password"
				id="confirmPassword"
				placeholder="********"
				required
				autocomplete="new-password"
                bind:value={confirmPassword}
			/>
		</div>
		<button type="submit">Registrar</button>
		<p class="error-message" id="signupErrorMessage">{errorMessage}</p>
	</form>
	<p class="redirect-link">Já tem uma conta? <a href="/Ordem-site">Faça login aqui</a></p>
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