
"use strict";

const lista = document.getElementById("lista-eventos");
const CHAVE_EVENTOS = "p2-conecta-eventos-v1";

function carregarEventos() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE_EVENTOS) || "[]"
        );

        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function formatarData(data) {
    const partes = data.split("-");

    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function adicionarTexto(elemento, tag, texto) {
    const filho = document.createElement(tag);
    filho.textContent = texto;
    elemento.appendChild(filho);
    return filho;
}

function mostrarEventos() {
    const eventos = carregarEventos();

    lista.replaceChildren();

    if (eventos.length === 0) {
        adicionarTexto(
            lista,
            "p",
            "Nenhum evento cadastrado no momento."
        );
        return;
    }

    eventos.sort((a, b) =>
        a.data.localeCompare(b.data)
    );

    const selecionado = new URLSearchParams(
        window.location.search
    ).get("id");

    eventos.forEach(evento => {
        const card = document.createElement("article");
        card.className = "card-evento";
        card.id = `evento-${evento.id}`;

        adicionarTexto(card, "h3", evento.nome);

        adicionarTexto(
            card,
            "p",
            `Data: ${formatarData(evento.data)}`
        );

        adicionarTexto(
            card,
            "p",
            `Local: ${evento.local}`
        );

        adicionarTexto(
            card,
            "p",
            evento.descricao
        );

        lista.appendChild(card);

        if (String(evento.id) === selecionado) {
            card.classList.add("selecionado");
        }
    });

    if (selecionado) {
        const destino = document.getElementById(
            `evento-${selecionado}`
        );

        if (destino) {
            destino.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }
}

mostrarEventos();

window.addEventListener("storage", function(evento) {
    if (evento.key === CHAVE_EVENTOS) {
        mostrarEventos();
    }
});
