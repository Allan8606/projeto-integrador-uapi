"use strict";

const tipo = document.body.dataset.tipo;
const chave = `p2-conecta-${tipo}-v1`;
const singular = tipo === "empreendimentos" ? "empreendimento" : "ponto turístico";
const plural = tipo === "empreendimentos" ? "empreendimentos" : "pontos turísticos";
const perfil = localStorage.getItem("p2PerfilDemo");
const email = (localStorage.getItem("p2EmailDemo") || "").trim().toLowerCase();
const admin = perfil === "admin";
const autorizado = (admin || perfil === "empreendedor") && email;
const form = document.getElementById("form-conteudo");
const lista = document.getElementById("lista-conteudos");
const campoId = document.getElementById("id-conteudo");
const mensagem = document.getElementById("mensagem");
const botaoSalvar = document.getElementById("salvar");
const campoImagem = document.getElementById("imagem");
const preview = document.getElementById("preview-imagem");
const contador = document.getElementById("contador");
let itens = carregar();
let editandoId = null;
let imagemAtual = "";

if (!autorizado) {
    window.location.replace("../../pages/login.html");
} else if (tipo === "pontos-turisticos" && !admin) {
    const aviso = document.getElementById("aviso-permissao");
    aviso.textContent = "Você não tem permissão para cadastrar ou gerenciar pontos turísticos. Essa área é exclusiva para administradores.";
    aviso.hidden = false;
    document.getElementById("intro-pontos").hidden = true;
    document.getElementById("painel-cadastro").hidden = true;
    document.getElementById("painel-lista").hidden = true;
} else {
    iniciar();
}

function carregar() {
    try {
        const dados = JSON.parse(localStorage.getItem(chave) || "[]");
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function iniciar() {
    form.addEventListener("submit", salvar);
    document.getElementById("limpar").addEventListener("click", () => {
        limpar();
        mensagem.textContent = "Campos limpos.";
    });
    campoImagem.addEventListener("change", selecionarImagem);
    limpar();
    renderizar();
}

function podeGerenciar(item) {
    return admin || (perfil === "empreendedor" && item.criadoPor &&
        String(item.criadoPor).trim().toLowerCase() === email);
}

function salvarDados() {
    try {
        localStorage.setItem(chave, JSON.stringify(itens));
        return true;
    } catch {
        mensagem.textContent = "Não foi possível salvar. Verifique o espaço disponível no navegador.";
        return false;
    }
}

function proximoId() {
    return Math.max(0, ...itens.map(item => Number(item.id) || 0)) + 1;
}

function limpar() {
    form.reset();
    editandoId = null;
    imagemAtual = "";
    campoImagem.required = tipo === "pontos-turisticos";
    preview.removeAttribute("src");
    preview.hidden = true;
    campoId.value = proximoId();
    botaoSalvar.textContent = `Cadastrar ${singular}`;
}

function celula(linha, valor) {
    const td = document.createElement("td");
    td.textContent = valor || "—";
    linha.appendChild(td);
    return td;
}

function renderizar() {
    lista.replaceChildren();
    const visiveis = admin ? itens : itens.filter(podeGerenciar);
    contador.textContent = `${visiveis.length} ${plural}`;
    if (!visiveis.length) {
        const linha = document.createElement("tr");
        const td = celula(linha, `Nenhum ${singular} disponível para esta conta.`);
        td.colSpan = tipo === "empreendimentos" ? 7 : 6;
        td.className = "vazio";
        lista.appendChild(linha);
        return;
    }

    visiveis.forEach(item => {
        const linha = document.createElement("tr");
        celula(linha, item.id);
        celula(linha, item.nome);
        if (tipo === "empreendimentos") celula(linha, item.tipoProdutoServico || item.categoria);
        celula(linha, tipo === "empreendimentos" ? (item.endereco || item.local) : item.local);
        if (tipo === "empreendimentos") celula(linha, item.contato);
        celula(linha, item.descricao);
        if (tipo === "pontos-turisticos") celula(linha, item.observacoes);
        const acoes = document.createElement("td");
        acoes.className = "acoes-tabela";
        const editar = document.createElement("button");
        editar.type = "button";
        editar.className = "editar";
        editar.textContent = "Editar";
        editar.addEventListener("click", () => editarItem(item.id));
        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.className = "excluir";
        excluir.textContent = "Excluir";
        excluir.addEventListener("click", () => excluirItem(item.id));
        acoes.append(editar, excluir);
        lista.appendChild(linha);
    });
}

function editarItem(id) {
    const item = itens.find(registro => String(registro.id) === String(id));
    if (!item || !podeGerenciar(item)) return;
    editandoId = item.id;
    campoId.value = item.id;
    const campos = tipo === "empreendimentos"
        ? { nome: item.nome, tipoProdutoServico: item.tipoProdutoServico || item.categoria, endereco: item.endereco || item.local, contato: item.contato, descricao: item.descricao }
        : { nome: item.nome, local: item.local, descricao: item.descricao, observacoes: item.observacoes };
    Object.entries(campos).forEach(([campo, valor]) => {
        const elemento = document.getElementById(campo);
        if (elemento) elemento.value = valor || "";
    });
    imagemAtual = item.imagem || "";
    campoImagem.required = tipo === "pontos-turisticos" && !imagemAtual;
    if (imagemAtual) {
        preview.src = imagemAtual;
        preview.hidden = false;
    } else {
        preview.removeAttribute("src");
        preview.hidden = true;
    }
    botaoSalvar.textContent = "Salvar alterações";
    mensagem.textContent = `Editando ${singular} ${id}.`;
    form.scrollIntoView({ behavior: "smooth" });
}

function excluirItem(id) {
    const item = itens.find(registro => String(registro.id) === String(id));
    if (!item || !podeGerenciar(item)) return;
    if (!window.confirm(`Deseja realmente excluir "${item.nome}"?`)) return;
    const anteriores = itens.slice();
    itens = itens.filter(registro => String(registro.id) !== String(id));
    if (!salvarDados()) {
        itens = anteriores;
        return;
    }
    if (String(editandoId) === String(id)) limpar();
    renderizar();
    mensagem.textContent = `${singular[0].toUpperCase()}${singular.slice(1)} excluído com sucesso.`;
}

async function selecionarImagem() {
    const arquivo = campoImagem.files[0];
    if (!arquivo) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type) || arquivo.size > 2 * 1024 * 1024) {
        mensagem.textContent = "Selecione uma imagem JPG, PNG ou WebP de até 2 MB.";
        campoImagem.value = "";
        return;
    }
    try {
        imagemAtual = await new Promise((resolve, reject) => {
            const leitor = new FileReader();
            leitor.onerror = () => reject(new Error("Falha ao ler imagem"));
            leitor.onload = () => {
                const imagem = new Image();
                imagem.onerror = () => reject(new Error("Imagem inválida"));
                imagem.onload = () => {
                    const escala = Math.min(1, 900 / imagem.width, 900 / imagem.height);
                    const canvas = document.createElement("canvas");
                    canvas.width = Math.max(1, Math.round(imagem.width * escala));
                    canvas.height = Math.max(1, Math.round(imagem.height * escala));
                    const contexto = canvas.getContext("2d");
                    if (!contexto) return reject(new Error("Falha ao processar imagem"));
                    contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL("image/jpeg", 0.7));
                };
                imagem.src = leitor.result;
            };
            leitor.readAsDataURL(arquivo);
        });
        preview.src = imagemAtual;
        preview.hidden = false;
        mensagem.textContent = "Imagem carregada com sucesso.";
    } catch {
        campoImagem.value = "";
        mensagem.textContent = "Não foi possível processar a imagem.";
    }
}

function salvar(evento) {
    evento.preventDefault();
    if (!form.reportValidity()) return;
    const anterior = editandoId === null ? null : itens.find(item => String(item.id) === String(editandoId));
    if (editandoId !== null && (!anterior || !podeGerenciar(anterior))) {
        mensagem.textContent = `Não foi possível localizar ou alterar este ${singular}.`;
        return;
    }
    const campos = {};
    form.querySelectorAll("[name]").forEach(input => campos[input.name] = input.value.trim());
    const camposObrigatorios = tipo === "empreendimentos"
        ? ["nome", "tipoProdutoServico", "endereco", "contato", "descricao"]
        : ["nome", "local", "descricao"];
    if (camposObrigatorios.some(campo => !campos[campo])) {
        mensagem.textContent = "Preencha todos os campos obrigatórios.";
        return;
    }
    if (tipo === "pontos-turisticos" && !imagemAtual) {
        mensagem.textContent = "Selecione uma imagem para o ponto turístico.";
        return;
    }
    const registro = {
        id: anterior ? anterior.id : proximoId(),
        ...campos,
        imagem: imagemAtual,
        criadoPor: anterior ? (anterior.criadoPor || null) : email
    };
    const anteriores = itens.slice();
    itens = anterior
        ? itens.map(item => String(item.id) === String(anterior.id) ? registro : item)
        : [...itens, registro];
    if (!salvarDados()) {
        itens = anteriores;
        return;
    }
    const estavaEditando = Boolean(anterior);
    limpar();
    renderizar();
    mensagem.textContent = estavaEditando
        ? `${singular[0].toUpperCase()}${singular.slice(1)} atualizado com sucesso!`
        : `${singular[0].toUpperCase()}${singular.slice(1)} cadastrado com sucesso!`;
}
