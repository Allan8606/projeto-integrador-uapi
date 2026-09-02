// ========================================
// P2 CONECTA - JavaScript Principal
// ========================================

// Aguarda o carregamento completo do HTML
document.addEventListener("DOMContentLoaded", () => {

    // Seleciona todos os links do menu de navegação
    const links = document.querySelectorAll(".menu a");

    // Adiciona um evento de clique para cada link
    links.forEach(link => {

        link.addEventListener("click", function () {

            // Remove a classe "ativo" de todos os links
            links.forEach(item => {
                item.classList.remove("ativo");
            });

            // Adiciona a classe "ativo" apenas no link clicado
            this.classList.add("ativo");

        });

    });

});