
"use strict";

const CHAVE = "p2-conecta-eventos-v1";

const form = document.getElementById("form-evento");
const lista = document.getElementById("lista-eventos");
const idCampo = document.getElementById("id-evento");
const mensagem = document.getElementById("mensagem");
const botaoSalvar = document.getElementById("salvar");
const campoImagem = document.getElementById("imagem");
const preview = document.getElementById("preview-imagem");

let eventos = carregarEventos();
let idEmEdicao = null;
let imagemAtual = "";

// CARREGAR EVENTOS
function carregarEventos() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE) || "[]"
        );
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

// SALVAR NO NAVEGADOR
function salvarDados() {
    try {
        localStorage.setItem(CHAVE, JSON.stringify(eventos));
        return true;
    } catch {
        mensagem.textContent =
            "Espaço insuficiente para salvar. " +
            "Tente uma imagem menor.";
        return false;
    }
}

// GERAR ID
function proximoId() {
    return Math.max(
        0,
        ...eventos.map(e => Number(e.id) || 0)
    ) + 1;
}

// PRÉVIA DA IMAGEM
function mostrarPreview(imagem) {
    if (imagem) {
        preview.src = imagem;
        preview.hidden = false;
    } else {
        preview.removeAttribute("src");
        preview.hidden = true;
    }
}

// COMPACTAR IMAGEM
function compactarImagem(arquivo) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();

        leitor.onerror = () => {
            reject(new Error("Erro ao ler imagem."));
        };

        leitor.onload = () => {
            const imagem = new Image();

            imagem.onerror = () => {
                reject(new Error("Imagem inválida."));
            };

            imagem.onload = () => {
                const limite = 900;
                const escala = Math.min(
                    1,
                    limite / imagem.width,
                    limite / imagem.height
                );

                const canvas = document.createElement("canvas");

                canvas.width = Math.round(imagem.width * escala);
                canvas.height = Math.round(imagem.height * escala);

                const ctx = canvas.getContext("2d");

                ctx.drawImage(
                    imagem,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                resolve(canvas.toDataURL("image/jpeg", 0.7));
            };

            imagem.src = leitor.result;
        };

        leitor.readAsDataURL(arquivo);
    });
}

// SELECIONAR IMAGEM
campoImagem.addEventListener("change", async () => {
    const arquivo = campoImagem.files[0];

    if (!arquivo) return;

    const tipos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!tipos.includes(arquivo.type)) {
        mensagem.textContent =
            "Selecione uma imagem JPG, PNG ou WebP.";
        campoImagem.value = "";
        return;
    }

    if (arquivo.size > 2 * 1024 * 1024) {
        mensagem.textContent =
            "A imagem deve ter no máximo 2 MB.";
        campoImagem.value = "";
        return;
    }

    try {
        imagemAtual = await compactarImagem(arquivo);
        mostrarPreview(imagemAtual);
        mensagem.textContent = "Imagem carregada.";
    } catch {
        mensagem.textContent = "Erro ao processar imagem.";
        campoImagem.value = "";
    }
});

// LIMPAR FORMULÁRIO
function limparFormulario() {
    form.reset();
    idEmEdicao = null;
    imagemAtual = "";
    mostrarPreview("");
    idCampo.value = proximoId();
    botaoSalvar.textContent = "Cadastrar evento";
}

// FORMATAR DATA
function formatarData(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

// CRIAR CÉLULA
function criarCelula(linha, valor) {
    const td = document.createElement("td");
    td.textContent = valor;
    linha.appendChild(td);
    return td;
}

// EXIBIR TABELA
function renderizar() {
    lista.replaceChildren();

    document.getElementById("contador").textContent =
        `${eventos.length} evento(s)`;

    if (eventos.length === 0) {
        const tr = document.createElement("tr");
        const td = criarCelula(tr, "Nenhum evento cadastrado.");
        td.colSpan = 6;
        td.className = "vazio";
        lista.appendChild(tr);
        return;
    }

    eventos.forEach(evento => {
        const tr = document.createElement("tr");

        criarCelula(tr, evento.id);
        criarCelula(tr, evento.nome);
        criarCelula(tr, formatarData(evento.data));
        criarCelula(tr, evento.local);
        criarCelula(tr, evento.descricao);

        const acoes = document.createElement("td");

        const editar = document.createElement("button");
        editar.type = "button";
        editar.className = "editar";
        editar.textContent = "Editar";

        editar.addEventListener("click", () => {
            idEmEdicao = evento.id;

            idCampo.value = evento.id;
            document.getElementById("nome").value = evento.nome;
            document.getElementById("data").value = evento.data;
            document.getElementById("local").value = evento.local;
            document.getElementById("descricao").value =
                evento.descricao;

            imagemAtual = evento.imagem || "";
            campoImagem.value = "";
            mostrarPreview(imagemAtual);

            botaoSalvar.textContent = "Salvar alterações";
            mensagem.textContent = `Editando evento ${evento.id}`;

            form.scrollIntoView({ behavior: "smooth" });
        });

        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.className = "excluir";
        excluir.textContent = "Excluir";

        excluir.addEventListener("click", () => {
            if (!confirm(`Excluir "${evento.nome}"?`)) return;

            const anteriores = eventos.slice();

            eventos = eventos.filter(
                e => e.id !== evento.id
            );

            if (!salvarDados()) {
                eventos = anteriores;
                return;
            }

            if (idEmEdicao === evento.id) {
                limparFormulario();
            }

            renderizar();
            if (idEmEdicao === null) {
                idCampo.value = proximoId();
            }
            mensagem.textContent = "Evento excluído.";
        });

        acoes.append(editar, excluir);
        tr.appendChild(acoes);
        lista.appendChild(tr);
    });
}

// CADASTRAR OU EDITAR
form.addEventListener("submit", event => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const evento = {
        id: idEmEdicao ?? proximoId(),
        nome: document.getElementById("nome").value.trim(),
        data: document.getElementById("data").value,
        local: document.getElementById("local").value.trim(),
        descricao: document.getElementById("descricao")
            .value.trim(),
        imagem: imagemAtual
    };

    if (
        !evento.nome ||
        !evento.data ||
        !evento.local ||
        !evento.descricao
    ) {
        mensagem.textContent =
            "Preencha os campos obrigatórios.";
        return;
    }

    const anteriores = eventos.slice();
    const editando = idEmEdicao !== null;

    if (editando) {
        eventos = eventos.map(e =>
            e.id === idEmEdicao ? evento : e
        );
    } else {
        eventos.push(evento);
    }

    if (!salvarDados()) {
        eventos = anteriores;
        return;
    }

    limparFormulario();
    renderizar();

    mensagem.textContent = editando
        ? "Evento atualizado com sucesso!"
        : "Evento cadastrado com sucesso!";
});

// BOTÃO LIMPAR
document.getElementById("limpar")
    .addEventListener("click", () => {
        limparFormulario();
        mensagem.textContent = "Campos limpos.";
    });

// INICIAR
limparFormulario();
renderizar();


// LOGIN 

const perfil = localStorage.getItem("p2PerfilDemo");
const email = localStorage.getItem("p2EmailDemo");

if (!["admin", "empreendedor"].includes(perfil) || !email) {
    window.location.replace("login.html");
} else {
    const nomePerfil = perfil === "admin"
        ? "Administrador"
        : "Empreendedor";

    document.getElementById("usuarioAtual").textContent =
        `${nomePerfil} | ${email}`;
}

document.getElementById("btnSair")
    .addEventListener("click", () => {
        localStorage.removeItem("p2PerfilDemo");
        localStorage.removeItem("p2EmailDemo");
        window.location.replace("login.html");
    });
