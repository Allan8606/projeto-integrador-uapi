
"use strict";

/*
========================================
P2 CONECTA - GERENCIAMENTO DE EVENTOS

Perfis:
ADMIN - Gerencia todos os eventos
EMPREENDEDOR - Gerencia os próprios

Armazenamento: localStorage
Autenticação: demonstração acadêmica
========================================
*/

// ======================================
// 1. CONFIGURAÇÕES
// ======================================

const CHAVE = "p2-conecta-eventos-v1";

const perfilLogado = sessionStorage.getItem(
    "p2PerfilDemo"
);

const emailLogado = (
    sessionStorage.getItem("p2EmailDemo") || ""
).trim().toLowerCase();

const usuarioAdministrador = perfilLogado === "admin";

const usuarioAutorizado =
    (perfilLogado === "admin" ||
     perfilLogado === "empreendedor") &&
    emailLogado !== "";

// ======================================
// 2. ELEMENTOS DO HTML
// ======================================

const form = document.getElementById("form-evento");

const lista = document.getElementById("lista-eventos");

const idCampo = document.getElementById("id-evento");

const mensagem = document.getElementById("mensagem");

const botaoSalvar = document.getElementById("salvar");

const campoImagem = document.getElementById("imagem");

const preview = document.getElementById("preview-imagem");

const contador = document.getElementById("contador");

const usuarioAtual = document.getElementById(
    "usuarioAtual"
);

const btnSair = document.getElementById("btnSair");

// ======================================
// 3. VARIÁVEIS
// ======================================

let eventos = carregarEventos();

let idEmEdicao = null;

let imagemAtual = "";

let processandoImagem = false;

// ======================================
// 4. CONTROLE DE ACESSO
// ======================================

if (!usuarioAutorizado) {
    window.location.replace("login.html");
} else {
    iniciarGerenciamento();
}

function iniciarGerenciamento() {

    if (usuarioAtual) {
        
       // Recuperar o nome salvo no login 
        const nomeCompleto = (
            sessionStorage.getItem("p2NomeUsuario") || ""
        ).trim();
            
       // Pegar somente o primeiro nome
       const primeiroNome = nomeCompleto
        ? nomeCompleto.split(/\s+/)[0]
        : "Usuario";
        
        // Identificar o perfil
        const nomePerfil = usuarioAdministrador
        ? "Administrador"
        : "Empreendedor";

        // Exibir a Saudação
        usuarioAtual.textContent =
        `Olá, ${primeiroNome}! | ${nomePerfil}`;
    }

    if (btnSair) {
        btnSair.addEventListener("click", sair);
    }

    if (!form || !lista || !idCampo ||
        !mensagem || !botaoSalvar ||
        !contador) {

        console.error(
            "Elementos do cadastro de eventos não encontrados."
        );

        return;
    }

    configurarFormulario();

    configurarImagem();

    limparFormulario();

    renderizar();
}

function sair() {
    sessionStorage.removeItem("p2PerfilDemo");
    sessionStorage.removeItem("p2EmailDemo");
    sessionStorage.removeItem("p2NomeUsuario"); 

    window.location.replace("login.html");
}

// ======================================
// 5. CARREGAR EVENTOS
// ======================================

function carregarEventos() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE) || "[]"
        );

        return Array.isArray(dados) ? dados : [];

    } catch (erro) {
        console.error(
            "Erro ao carregar eventos:",
            erro
        );

        return [];
    }
}

// ======================================
// 6. SALVAR EVENTOS
// ======================================

function salvarDados() {
    try {
        localStorage.setItem(
            CHAVE,
            JSON.stringify(eventos)
        );

        return true;

    } catch (erro) {
        console.error(
            "Erro ao salvar eventos:",
            erro
        );

        mensagem.textContent =
            "Não foi possível salvar. " +
            "Verifique o espaço disponível no navegador.";

        return false;
    }
}

// ======================================
// 7. GERAR PRÓXIMO ID
// ======================================

function proximoId() {
    const ids = eventos.map(
        evento => Number(evento.id) || 0
    );

    return Math.max(0, ...ids) + 1;
}

// ======================================
// 8. VERIFICAR PERMISSÕES
// ======================================

function podeGerenciarEvento(evento) {

    // ADMINISTRADOR:
    // Pode gerenciar todos os eventos.
    if (usuarioAdministrador) {
        return true;
    }

    // EMPREENDEDOR:
    // Pode gerenciar apenas eventos próprios.
    if (perfilLogado !== "empreendedor") {
        return false;
    }

    // Eventos antigos sem responsável
    // ficam sob gerenciamento do ADMIN.
    if (!evento.criadoPor) {
        return false;
    }

    return (
        String(evento.criadoPor)
            .trim()
            .toLowerCase() === emailLogado
    );
}

// ======================================
// 9. EVENTOS VISÍVEIS NA TABELA
// ======================================

function obterEventosVisiveis() {

    if (usuarioAdministrador) {
        return eventos;
    }

    return eventos.filter(podeGerenciarEvento);
}

// ======================================
// 10. FORMATAR DATA
// ======================================

function formatarData(data) {

    if (!data) {
        return "Data não informada";
    }

    const partes = data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    const [ano, mes, dia] = partes;

    return `${dia}/${mes}/${ano}`;
}

// ======================================
// 11. CRIAR CÉLULAS DA TABELA
// ======================================

function criarCelula(linha, valor) {

    const td = document.createElement("td");

    td.textContent = valor ?? "";

    linha.appendChild(td);

    return td;
}

// ======================================
// 12. MOSTRAR PRÉVIA DA IMAGEM
// ======================================

function mostrarPreview(imagem) {

    if (!preview) {
        return;
    }

    if (imagem) {

        preview.src = imagem;

        preview.hidden = false;

    } else {

        preview.removeAttribute("src");

        preview.hidden = true;
    }
}

// ======================================
// 13. COMPACTAR IMAGEM
// ======================================

function compactarImagem(arquivo) {

    return new Promise((resolve, reject) => {

        const leitor = new FileReader();

        leitor.onerror = () => {
            reject(
                new Error("Erro ao ler a imagem.")
            );
        };

        leitor.onload = () => {

            const imagem = new Image();

            imagem.onerror = () => {
                reject(
                    new Error("Imagem inválida.")
                );
            };

            imagem.onload = () => {

                const limite = 900;

                const escala = Math.min(
                    1,
                    limite / imagem.width,
                    limite / imagem.height
                );

                const canvas = document.createElement(
                    "canvas"
                );

                canvas.width = Math.max(
                    1,
                    Math.round(imagem.width * escala)
                );

                canvas.height = Math.max(
                    1,
                    Math.round(imagem.height * escala)
                );

                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    reject(
                        new Error("Erro ao processar imagem.")
                    );
                    return;
                }

                ctx.drawImage(
                    imagem,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                const imagemCompactada =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.7
                    );

                resolve(imagemCompactada);
            };

            imagem.src = leitor.result;
        };

        leitor.readAsDataURL(arquivo);
    });
}

// ======================================
// 14. CONFIGURAR CAMPO DE IMAGEM
// ======================================

function configurarImagem() {

    if (!campoImagem) {
        return;
    }

    campoImagem.addEventListener(
        "change",
        async function() {

            const arquivo = campoImagem.files[0];

            if (!arquivo) {
                return;
            }

            const tiposPermitidos = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (!tiposPermitidos.includes(arquivo.type)) {

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

            processandoImagem = true;
            botaoSalvar.disabled = true;

            try {

                imagemAtual = await compactarImagem(
                    arquivo
                );

                mostrarPreview(imagemAtual);

                mensagem.textContent =
                    "Imagem carregada com sucesso!";

            } catch (erro) {

                console.error(erro);

                mensagem.textContent =
                    "Não foi possível processar a imagem.";

                campoImagem.value = "";

            } finally {

                processandoImagem = false;
                botaoSalvar.disabled = false;
            }
        }
    );
}

// ======================================
// 15. LIMPAR FORMULÁRIO
// ======================================

function limparFormulario() {

    form.reset();

    idEmEdicao = null;

    imagemAtual = "";

    processandoImagem = false;

    mostrarPreview("");

    idCampo.value = proximoId();

    botaoSalvar.textContent = "Cadastrar evento";
}

// ======================================
// 16. RENDERIZAR TABELA
// ======================================

function renderizar() {

    lista.replaceChildren();

    const eventosVisiveis = obterEventosVisiveis();

    contador.textContent =
        `${eventosVisiveis.length} evento(s)`;

    if (eventosVisiveis.length === 0) {

        const tr = document.createElement("tr");

        const td = criarCelula(
            tr,
            "Nenhum evento disponível para esta conta."
        );

        td.colSpan = 6;

        td.className = "vazio";

        lista.appendChild(tr);

        return;
    }

    eventosVisiveis.forEach(evento => {

        const tr = document.createElement("tr");

        criarCelula(tr, evento.id);

        criarCelula(tr, evento.nome);

        criarCelula(
            tr,
            formatarData(evento.data)
        );

        criarCelula(tr, evento.local);

        criarCelula(tr, evento.descricao);

        const acoes = document.createElement("td");

        // BOTÃO EDITAR

        const editar = document.createElement("button");

        editar.type = "button";

        editar.className = "editar";

        editar.textContent = "Editar";

        editar.addEventListener("click", () => {

            editarEvento(evento.id);

        });

        // BOTÃO EXCLUIR

        const excluir = document.createElement("button");

        excluir.type = "button";

        excluir.className = "excluir";

        excluir.textContent = "Excluir";

        excluir.addEventListener("click", () => {

            excluirEvento(evento.id);

        });

        acoes.appendChild(editar);

        acoes.appendChild(excluir);

        tr.appendChild(acoes);

        lista.appendChild(tr);
    });
}

// ======================================
// 17. EDITAR EVENTO
// ======================================

function editarEvento(id) {

    const evento = eventos.find(
        e => String(e.id) === String(id)
    );

    if (!evento) {
        mensagem.textContent =
            "Evento não encontrado.";
        return;
    }

    if (!podeGerenciarEvento(evento)) {

        mensagem.textContent =
            "Você não tem permissão para editar este evento.";

        return;
    }

    idEmEdicao = evento.id;

    idCampo.value = evento.id;

    document.getElementById("nome").value =
        evento.nome;

    document.getElementById("data").value =
        evento.data;

    document.getElementById("local").value =
        evento.local;

    document.getElementById("descricao").value =
        evento.descricao;

    imagemAtual = evento.imagem || "";

    if (campoImagem) {
        campoImagem.value = "";
    }

    mostrarPreview(imagemAtual);

    botaoSalvar.textContent =
        "Salvar alterações";

    mensagem.textContent =
        `Editando evento ${evento.id}`;

    form.scrollIntoView({
        behavior: "smooth"
    });
}

// ======================================
// 18. EXCLUIR EVENTO
// ======================================

function excluirEvento(id) {

    const evento = eventos.find(
        e => String(e.id) === String(id)
    );

    if (!evento) {

        mensagem.textContent =
            "Evento não encontrado.";

        return;
    }

    if (!podeGerenciarEvento(evento)) {

        mensagem.textContent =
            "Você não tem permissão para excluir este evento.";

        return;
    }

    const confirmar = window.confirm(
        `Deseja realmente excluir "${evento.nome}"?`
    );

    if (!confirmar) {
        return;
    }

    const anteriores = eventos.slice();

    eventos = eventos.filter(
        e => String(e.id) !== String(id)
    );

    if (!salvarDados()) {

        eventos = anteriores;

        return;
    }

    if (String(idEmEdicao) === String(id)) {
        limparFormulario();
    }

    renderizar();

    idCampo.value = proximoId();

    mensagem.textContent =
        "Evento excluído com sucesso!";
}

// ======================================
// 19. CONFIGURAR FORMULÁRIO
// ======================================

function configurarFormulario() {

    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            salvarEvento();
        }
    );

    const botaoLimpar = document.getElementById(
        "limpar"
    );

    if (botaoLimpar) {

        botaoLimpar.addEventListener(
            "click",
            function() {

                limparFormulario();

                mensagem.textContent =
                    "Campos limpos.";
            }
        );
    }
}

// ======================================
// 20. CADASTRAR OU ATUALIZAR EVENTO
// ======================================

function salvarEvento() {

    if (!usuarioAutorizado) {

        mensagem.textContent =
            "Faça login para cadastrar eventos.";

        return;
    }

    if (processandoImagem) {

        mensagem.textContent =
            "Aguarde o processamento da imagem.";

        return;
    }

    if (!form.reportValidity()) {
        return;
    }

    const eventoAnterior = idEmEdicao !== null
        ? eventos.find(
            e => String(e.id) === String(idEmEdicao)
        )
        : null;

    if (idEmEdicao !== null && !eventoAnterior) {

        mensagem.textContent =
            "O evento que você está editando não foi encontrado.";

        return;
    }

    if (
        eventoAnterior &&
        !podeGerenciarEvento(eventoAnterior)
    ) {

        mensagem.textContent =
            "Você não tem permissão para alterar este evento.";

        return;
    }

    const nome = document.getElementById("nome")
        .value.trim();

    const data = document.getElementById("data")
        .value;

    const local = document.getElementById("local")
        .value.trim();

    const descricao = document.getElementById(
        "descricao"
    ).value.trim();

    if (!nome || !data || !local || !descricao) {

        mensagem.textContent =
            "Preencha todos os campos obrigatórios.";

        return;
    }

    const editando = eventoAnterior !== null;

    const evento = {

        id: editando
            ? eventoAnterior.id
            : proximoId(),

        nome: nome,

        data: data,

        local: local,

        descricao: descricao,

        imagem: imagemAtual,

        // Mantém o responsável original
        criadoPor: editando
            ? (eventoAnterior.criadoPor || null)
            : emailLogado
    };

    const anteriores = eventos.slice();

    if (editando) {

        eventos = eventos.map(e => {

            if (
                String(e.id) ===
                String(eventoAnterior.id)
            ) {
                return evento;
            }

            return e;
        });

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
}
