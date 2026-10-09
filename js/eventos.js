
"use strict";

// Armazenamento local
const CHAVE = "p2-conecta-eventos-v1";

const form = document.querySelector("#form-evento");
const lista = document.querySelector("#lista-eventos");
const idCampo = document.querySelector("#id-evento");
const mensagem = document.querySelector("#mensagem");
const botaoSalvar = document.querySelector("#salvar");

// Carregar os eventos salvos
let eventos = carregar();
let idEmEdicao = null;

function carregar() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE) || "[]"
        );

        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

// Salvar no navegador
function persistir() {
    try {
        localStorage.setItem(
            CHAVE,
            JSON.stringify(eventos)
        );
        return true;
    } catch {
        mensagem.textContent =
            "Não foi possível salvar neste navegador.";
        return false;
    }
}

// Gerar o próximo ID
function proximoId() {
    return Math.max(
        0,
        ...eventos.map(evento => Number(evento.id) || 0)
    ) + 1;
}

// Preparar formulário para novo cadastro
function prepararNovo() {
    form.reset();
    idEmEdicao = null;
    idCampo.value = proximoId();
    botaoSalvar.textContent = "Cadastrar evento";
}

// Formatar data para o padrão brasileiro
function formatarData(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

// Criar células da tabela com segurança
function criarCelula(linha, valor) {
    const td = document.createElement("td");
    td.textContent = valor;
    linha.appendChild(td);
    return td;
}

// Exibir eventos na tabela
function renderizar() {
    lista.replaceChildren();

    document.querySelector("#contador").textContent =
        `${eventos.length} evento(s)`;

    if (eventos.length === 0) {
        const linha = document.createElement("tr");
        const td = criarCelula(
            linha,
            "Nenhum evento cadastrado."
        );

        td.colSpan = 6;
        td.className = "vazio";
        lista.appendChild(linha);
        return;
    }

    eventos.forEach(evento => {
        const linha = document.createElement("tr");

        criarCelula(linha, evento.id);
        criarCelula(linha, evento.nome);
        criarCelula(linha, formatarData(evento.data));
        criarCelula(linha, evento.local);
        criarCelula(linha, evento.descricao);

        const tdAcoes = document.createElement("td");
        const acoes = document.createElement("div");

        acoes.className = "acoes-tabela";

        // Botão editar
        const editar = document.createElement("button");
        editar.type = "button";
        editar.className = "editar";
        editar.textContent = "Editar";

        editar.addEventListener("click", () => {
            idEmEdicao = evento.id;

            idCampo.value = evento.id;
            document.querySelector("#nome").value =
                evento.nome;
            document.querySelector("#data").value =
                evento.data;
            document.querySelector("#local").value =
                evento.local;
            document.querySelector("#descricao").value =
                evento.descricao;

            botaoSalvar.textContent = "Salvar alterações";

            mensagem.textContent =
                `Editando evento ${evento.id}`;

            form.scrollIntoView({
                behavior: "smooth"
            });
        });

        // Botão excluir
        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.className = "excluir";
        excluir.textContent = "Excluir";

        excluir.addEventListener("click", () => {
            const confirmar = confirm(
                `Excluir o evento "${evento.nome}"?`
            );

            if (!confirmar) return;

            const anteriores = eventos.slice();

            eventos = eventos.filter(
                item => item.id !== evento.id
            );

            if (!persistir()) {
                eventos = anteriores;
                return;
            }

            if (idEmEdicao === evento.id) {
                prepararNovo();
            } else if (idEmEdicao === null) {
                idCampo.value = proximoId();
            }

            renderizar();
            mensagem.textContent = "Evento excluído.";
        });

        acoes.append(editar, excluir);
        tdAcoes.appendChild(acoes);
        linha.appendChild(tdAcoes);
        lista.appendChild(linha);
    });
}

// Cadastrar ou atualizar evento
form.addEventListener("submit", function(event) {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const evento = {
        id: idEmEdicao ?? proximoId(),
        nome: document.querySelector("#nome").value.trim(),
        data: document.querySelector("#data").value,
        local: document.querySelector("#local").value.trim(),
        descricao: document.querySelector("#descricao")
            .value.trim()
    };

    if (
        !evento.nome ||
        !evento.data ||
        !evento.local ||
        !evento.descricao
    ) {
        mensagem.textContent =
            "Preencha todos os campos obrigatórios.";
        return;
    }

    const anteriores = eventos.slice();

    if (idEmEdicao !== null) {
        eventos = eventos.map(item =>
            item.id === idEmEdicao ? evento : item
        );
    } else {
        eventos.push(evento);
    }

    if (!persistir()) {
        eventos = anteriores;
        return;
    }

    const texto = idEmEdicao !== null
        ? "Evento atualizado com sucesso!"
        : "Evento cadastrado com sucesso!";

    prepararNovo();
    renderizar();

    mensagem.textContent = texto;
});

// Limpar formulário
document.querySelector("#limpar")
    .addEventListener("click", () => {
        prepararNovo();
        mensagem.textContent = "Campos limpos.";
    });

// Inicialização
prepararNovo();
renderizar();


// IDENTIFICAÇÃO DO LOGIN DE DEMONSTRAÇÃO

const perfilDemo = sessionStorage.getItem(
    "p2PerfilDemo"
);

const emailDemo = sessionStorage.getItem(
    "p2EmailDemo"
);

if (
    !["admin", "empreendedor"].includes(perfilDemo) ||
    !emailDemo
) {
    window.location.replace("login.html");
} else {

    const nomePerfil = perfilDemo === "admin"
        ? "Administrador"
        : "Empreendedor";

    document.getElementById(
        "usuarioAtual"
    ).textContent =
        `${nomePerfil} | ${emailDemo}`;
}

// BOTÃO SAIR

document.getElementById("btnSair")
    .addEventListener("click", function() {

        sessionStorage.removeItem("p2PerfilDemo");
        sessionStorage.removeItem("p2EmailDemo");

        window.location.replace("login.html");
    });
