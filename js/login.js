// ========================================
// P2 CONECTA
// SISTEMA DE LOGIN
// ADMIN E EMPREENDEDOR
// ========================================


// Captura o formulário

const formulario =
    document.getElementById("loginForm");


// Captura o campo de mensagem

const mensagem =
    document.getElementById("mensagem");


// ========================================
// EVENTO DO FORMULÁRIO
// ========================================

formulario.addEventListener(
    "submit",
    function(event) {

        // Impede o formulário de recarregar
        // a página

        event.preventDefault();


        // ====================================
        // CAPTURA DOS DADOS
        // ====================================

        const tipoUsuario =
            document.getElementById(
                "tipoUsuario"
            ).value;


        const email =
            document.getElementById(
                "email"
            ).value.trim();


        const senha =
            document.getElementById(
                "senha"
            ).value;


        // ====================================
        // VERIFICAÇÃO DO TIPO
        // ====================================

        if (tipoUsuario === "") {

            mensagem.textContent =
                "Selecione o tipo de usuário.";

            mensagem.style.color = "red";

            return;

        }


        // ====================================
        // VERIFICAÇÃO DO E-MAIL E SENHA
        // ====================================

        if (
            email === "" ||
            senha === ""
        ) {

            mensagem.textContent =
                "Preencha todos os campos.";

            mensagem.style.color = "red";

            return;

        }


        // ====================================
        // ADMINISTRADOR
        // ====================================

        if (
            tipoUsuario === "admin"
        ) {

            mensagem.textContent =
                "Acesso de administrador selecionado.";

            mensagem.style.color = "green";


            /*
             * FUTURAMENTE:
             *
             * window.location.href =
             * "admin/dashboard.html";
             */

            return;

        }


        // ====================================
        // EMPREENDEDOR
        // ====================================

        if (
            tipoUsuario === "empreendedor"
        ) {

            mensagem.textContent =
                "Acesso de empreendedor selecionado.";

            mensagem.style.color = "green";


            /*
             * FUTURAMENTE:
             *
             * window.location.href =
             * "empreendedor/dashboard.html";
             */

            return;

        }

    }
);