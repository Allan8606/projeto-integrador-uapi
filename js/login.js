
"use strict";

// P2 CONECTA - LOGIN DE DEMONSTRAÇÃO

const formulario = document.getElementById("loginForm");
const mensagem = document.getElementById("mensagem");

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    // Capturar os campos
    const tipoUsuario = document.getElementById(
        "tipoUsuario"
    ).value;

    const email = document.getElementById(
        "email"
    ).value.trim();

    const senha = document.getElementById(
        "senha"
    ).value;

    // Verificar o perfil selecionado
    if (
        tipoUsuario !== "admin" &&
        tipoUsuario !== "empreendedor"
    ) {
        mensagem.textContent =
            "Selecione um tipo de usuário válido.";

        mensagem.style.color = "red";
        return;
    }

    // Verificar preenchimento
    if (!email || !senha) {
        mensagem.textContent =
            "Preencha o e-mail e a senha.";

        mensagem.style.color = "red";
        return;
    }

    
    sessionStorage.setItem(
        "p2PerfilDemo",
        tipoUsuario
    );

    sessionStorage.setItem(
        "p2EmailDemo",
        email
    );

    mensagem.textContent =
        "Redirecionando para o cadastro de eventos...";

    mensagem.style.color = "green";

    // Ambos os perfis vão para a mesma tela
    window.location.href = "cadastro-eventos.html";

});
