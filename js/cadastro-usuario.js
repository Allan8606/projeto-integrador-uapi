
"use strict";

const CHAVE_USUARIOS = "p2-usuarios-demo-v1";

const formulario = document.getElementById("formCadastro");
const mensagem = document.getElementById("mensagemCadastro");

// Recupera as contas já salvas no navegador.
function carregarUsuarios() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE_USUARIOS) || "[]"
        );
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

// Protege a senha usando um resumo criptográfico e um salt.
async function gerarHash(senha, salt) {
    const texto = new TextEncoder().encode(salt + senha);

    const hash = await crypto.subtle.digest(
        "SHA-256",
        texto
    );

    return Array.from(new Uint8Array(hash))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

// Valida os dados e cria uma nova conta de empreendedor.
formulario.addEventListener("submit", async function(event) {
    event.preventDefault();

    const nome = document.getElementById("nome")
        .value.trim();

    const email = document.getElementById("emailCadastro")
        .value.trim().toLowerCase();

    const senha = document.getElementById("senhaCadastro")
        .value;

    const confirmar = document.getElementById("confirmarSenha")
        .value;

    mensagem.style.color = "#b42318";

    if (!nome || !email || senha.length < 8) {
        mensagem.textContent =
            "Preencha corretamente todos os campos.";
        return;
    }

    if (senha !== confirmar) {
        mensagem.textContent = "As senhas não coincidem.";
        return;
    }

    const usuarios = carregarUsuarios();

    if (usuarios.some(usuario => usuario.email === email)) {
        mensagem.textContent = "Este e-mail já foi cadastrado.";
        return;
    }

    try {
        const salt = Array.from(
            crypto.getRandomValues(new Uint8Array(16))
        ).map(n => n.toString(16).padStart(2, "0")).join("");

        const senhaHash = await gerarHash(senha, salt);

        const novoUsuario = {
            id: crypto.randomUUID(),
            nome,
            email,
            perfil: "empreendedor",
            salt,
            senhaHash
        };

        usuarios.push(novoUsuario);

        localStorage.setItem(
            CHAVE_USUARIOS,
            JSON.stringify(usuarios)
        );

        formulario.reset();

        mensagem.style.color = "#2e9b4d";
        mensagem.textContent =
            "Conta criada! Redirecionando para o login...";

        window.location.href = "../../pages/login.html?cadastro=sucesso";

    } catch (erro) {
        mensagem.textContent =
            "Não foi possível cadastrar. Use o Live Server.";
        console.error(erro);
    }
});
