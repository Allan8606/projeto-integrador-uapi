
"use strict";

// Local onde os eventos serão exibidos
const containerEventos = document.getElementById(
    "eventos-dinamicos"
);

// Buscar eventos cadastrados
function buscarEventos() {
    try {
        const dados = JSON.parse(
            localStorage.getItem("p2-conecta-eventos-v1")
            || "[]"
        );

        return Array.isArray(dados) ? dados : [];
    } catch (erro) {
        console.error("Erro ao carregar eventos:", erro);
        return [];
    }
}

// Formatar data
function formatarDataEvento(data) {
    const partes = data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Criar elementos com segurança
function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) {
        elemento.className = classe;
    }

    if (texto !== undefined) {
        elemento.textContent = texto;
    }

    return elemento;
}

// Exibir eventos na página inicial
function exibirEventos() {

    if (!containerEventos) return;

    const eventos = buscarEventos();

    containerEventos.replaceChildren();

    if (eventos.length === 0) {
        containerEventos.appendChild(
            criarElemento(
                "p",
                "sem-eventos",
                "Nenhum novo evento cadastrado."
            )
        );
        return;
    }

    eventos.forEach(evento => {

        const card = criarElemento(
            "article",
            "card-evento"
        );

        const titulo = criarElemento(
            "h3",
            "",
            evento.nome
        );

        const data = criarElemento(
            "p",
            "",
            `Data: ${formatarDataEvento(evento.data)}`
        );

        const local = criarElemento(
            "p",
            "",
            `Local: ${evento.local}`
        );

        const descricao = criarElemento(
            "p",
            "descricao-evento",
            evento.descricao
        );

        card.append(
            titulo,
            data,
            local,
            descricao
        );

        containerEventos.appendChild(card);
    });
}

// Carregar ao abrir a página
exibirEventos();

// Atualizar quando os dados mudarem
// em outra aba do mesmo navegador
window.addEventListener("storage", function(evento) {
    if (evento.key === "p2-conecta-eventos-v1") {
        exibirEventos();
    }
});
