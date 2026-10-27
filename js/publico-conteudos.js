"use strict";

const tipoConteudo = document.body.dataset.tipo;
const armazenamentoConteudo = `p2-conecta-${tipoConteudo}-v1`;
const listaConteudo = document.getElementById("lista-conteudos");
const termoConteudo = tipoConteudo === "empreendimentos" ? "empreendimento" : "ponto turístico";

// Exibe na página os conteúdos salvos no navegador.
function mostrarConteudos() {
    let itens = [];
    try {
        const dados = JSON.parse(localStorage.getItem(armazenamentoConteudo) || "[]");
        itens = Array.isArray(dados) ? dados : [];
    } catch {
        itens = [];
    }
    listaConteudo.replaceChildren();
    if (!itens.length) {
        const vazio = document.createElement("p");
        vazio.textContent = `Nenhum ${termoConteudo} cadastrado no momento.`;
        listaConteudo.appendChild(vazio);
        return;
    }
    itens.forEach(item => {
        const cartao = document.createElement("article");
        cartao.className = "card-evento";
        if (item.imagem) {
            const imagem = document.createElement("img");
            imagem.className = "imagem-evento";
            imagem.src = item.imagem;
            imagem.alt = `Imagem de ${item.nome}`;
            imagem.loading = "lazy";
            cartao.appendChild(imagem);
        }
        const titulo = document.createElement("h2");
        titulo.textContent = item.nome;
        cartao.appendChild(titulo);
        const tipoProdutoServico = item.tipoProdutoServico || item.categoria;
        const endereco = item.endereco || item.local;
        if (tipoProdutoServico) adicionarParagrafo(cartao, `Tipo de produto ou serviço: ${tipoProdutoServico}`);
        if (endereco) adicionarParagrafo(cartao, `Endereço: ${endereco}`);
        if (item.contato) adicionarParagrafo(cartao, `Contato: ${item.contato}`);
        if (item.descricao) adicionarParagrafo(cartao, item.descricao);
        if (item.observacoes) adicionarParagrafo(cartao, `Observações: ${item.observacoes}`);
        listaConteudo.appendChild(cartao);
    });
}

// Adiciona um parágrafo ao cartão de conteúdo.
function adicionarParagrafo(cartao, texto) {
    const paragrafo = document.createElement("p");
    paragrafo.textContent = texto;
    cartao.appendChild(paragrafo);
}

// Carrega os conteúdos na abertura da página.
mostrarConteudos();
// Atualiza a lista quando outra aba altera os dados.
window.addEventListener("storage", evento => {
    if (evento.key === armazenamentoConteudo) mostrarConteudos();
});
