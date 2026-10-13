
"use strict";

// P2 CONECTA - LOGIN

const loginForm = document.getElementById("loginForm");
const mensagem = document.getElementById("mensagem");

const CHAVE_USUARIOS = "p2-usuarios-demo-v1";

// Conta administrativa 
const ADMIN_DEMO = {
    email: "admin@p2conecta.demo",
    senha: "AdminDemo2026!"
};

// Gerar hash para contas de empreendedores
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

// Buscar empreendedores cadastrados
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

// Mensagem após cadastro
const parametros = new URLSearchParams(
    window.location.search
);

if (parametros.get("cadastro") === "sucesso") {
    mensagem.textContent =
        "Cadastro realizado! Entre com sua conta.";
    mensagem.style.color = "green";
}

// Iniciar sessão 
function iniciarSessao(perfil, email, nome = "") {
    sessionStorage.setItem("p2PerfilDemo", perfil);
    sessionStorage.setItem("p2EmailDemo", email);
    sessionStorage.setItem("p2NomeUsuario", nome);  

    window.location.href = "cadastro-eventos.html";
}

// Evento de login
loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const tipo = document.getElementById(
        "tipoUsuario"
    ).value;

    const email = document.getElementById("email")
        .value.trim().toLowerCase();

    const senha = document.getElementById("senha").value;

    mensagem.style.color = "red";

    if (!tipo || !email || !senha) {
        mensagem.textContent =
            "Preencha todos os campos.";
        return;
    }

    // LOGIN DO ADMINISTRADOR
    if (tipo === "admin") {

        if (
            email === ADMIN_DEMO.email &&
            senha === ADMIN_DEMO.senha
        ) {
            iniciarSessao("admin", email, "Administrador");
        } else {
            mensagem.textContent =
                "E-mail ou senha incorretos.";
        }

        return;
    }

    // LOGIN DO EMPREENDEDOR
    if (tipo === "empreendedor") {

        const usuarios = carregarUsuarios();

        const usuario = usuarios.find(
            u => u.email === email &&
                 u.perfil === "empreendedor"
        );

        if (!usuario) {
            mensagem.textContent =
                "E-mail ou senha incorretos.";
            return;
        }

        try {
            const hashDigitado = await gerarHash(
                senha,
                usuario.salt
            );

            if (hashDigitado !== usuario.senhaHash) {
                mensagem.textContent =
                    "E-mail ou senha incorretos.";
                return;
            }

            iniciarSessao(
                "empreendedor", 
                usuario.email, 
                usuario.nome
            );

        } catch {
            mensagem.textContent =
                "Erro ao verificar o login.";
        }

        return;
    }

    mensagem.textContent =
        "Selecione um perfil válido.";
});
