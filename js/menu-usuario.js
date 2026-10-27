"use strict";

const menuUsuario = document.querySelector(".menu");
const grupoPagina = document.body.dataset.grupo || "pages";
const perfilUsuario = localStorage.getItem("p2PerfilDemo");
const emailUsuario = localStorage.getItem("p2EmailDemo");
const usuarioAutenticado = ["admin", "empreendedor"].includes(perfilUsuario) && Boolean(emailUsuario);

// Mostra as opções de gerenciamento para usuários autenticados.
if (menuUsuario && usuarioAutenticado) {
    const caminhos = {
        raiz: {
            inicio: "index.html",
            eventos: "pages/cadastros/cadastro-eventos.html",
            pontos: "pages/cadastros/cadastro-pontos-turisticos.html",
            empreendimentos: "pages/cadastros/cadastro-empreendimentos.html"
        },
        pages: {
            inicio: "../index.html",
            eventos: "cadastros/cadastro-eventos.html",
            pontos: "cadastros/cadastro-pontos-turisticos.html",
            empreendimentos: "cadastros/cadastro-empreendimentos.html"
        },
        cadastros: {
            inicio: "../../index.html",
            eventos: "cadastro-eventos.html",
            pontos: "cadastro-pontos-turisticos.html",
            empreendimentos: "cadastro-empreendimentos.html"
        }
    }[grupoPagina] || {};

    menuUsuario.replaceChildren();
    menuUsuario.appendChild(criarLink(caminhos.inicio, "Início", "ativo"));
    menuUsuario.appendChild(criarLink(caminhos.eventos, "Gerenciar eventos"));

    if (perfilUsuario === "admin") {
        menuUsuario.appendChild(criarLink(caminhos.pontos, "Gerenciar pontos turísticos"));
    }

    menuUsuario.appendChild(criarLink(caminhos.empreendimentos, "Gerenciar empreendimentos"));

    const nomeUsuario = (localStorage.getItem("p2NomeUsuario") || emailUsuario)
        .trim()
        .split(/\s+/)[0];
    const saudacao = document.createElement("span");
    saudacao.className = "usuario-conectado";
    saudacao.textContent = `Olá, ${nomeUsuario}`;
    menuUsuario.appendChild(saudacao);

    const sair = document.createElement("a");
    sair.href = "#";
    sair.textContent = "Sair";
    sair.addEventListener("click", evento => {
        evento.preventDefault();
        ["p2PerfilDemo", "p2EmailDemo", "p2NomeUsuario"].forEach(chave => localStorage.removeItem(chave));
        window.location.href = caminhos.inicio;
    });
    menuUsuario.appendChild(sair);
}

// Cria um link do menu com destino, texto e classe opcionais.
function criarLink(destino, rotulo, classe = "") {
    const link = document.createElement("a");
    link.href = destino;
    link.textContent = rotulo;
    if (classe) link.className = classe;
    return link;
}
