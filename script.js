// ========================================
// P2 CONECTA
// JavaScript principal
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    const links = document.querySelectorAll(".menu a");

    links.forEach(link => {

        link.addEventListener("click", function () {

            // Remove o destaque dos outros links
            links.forEach(item => {
                item.classList.remove("ativo");
            });

            // Adiciona destaque ao link selecionado
            this.classList.add("ativo");

        });

    });


    // Animação simples dos cards
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {

        card.addEventListener("click", () => {

            const destino = card.id;

            if (destino) {
                document
                    .getElementById(destino)
                    .scrollIntoView({
                        behavior: "smooth"
                    });
            }

        });

    });

});