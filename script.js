// ========================================
// LAVA JATO DO DAN
// SISTEMA SEM BANCO DE DADOS
// OS DADOS FICAM NO NAVEGADOR
// ========================================


let lavagens = JSON.parse(
    localStorage.getItem("lavagensDan")
) || [];


// ========================================
// ELEMENTOS
// ========================================

const form = document.getElementById("formLavagem");

const cliente = document.getElementById("cliente");
const veiculo = document.getElementById("veiculo");
const servico = document.getElementById("servico");
const pagamento = document.getElementById("pagamento");
const lavagemIdEditando = document.getElementById("lavagemIdEditando");
const btnRegistrar = document.getElementById("btnRegistrar");
const btnCancelarEdicao = document.getElementById("cancelarEdicao");
const btnInstalarApp = document.getElementById("instalarApp");
const formNomeLoja = document.getElementById("formNomeLoja");
const campoNomeLoja = document.getElementById("nomeLoja");
const painelNomeLoja = document.getElementById("painelNomeLoja");
const btnAlterarNomeLoja = document.getElementById("alterarNomeLoja");
const nomeLojaRodape = document.getElementById("nomeLojaRodape");
const painelPrecos = document.getElementById("painelPrecos");
const formPrecos = document.getElementById("formPrecos");
const listaServicosConfig = document.getElementById("listaServicosConfig");
const btnAbrirPrecos = document.getElementById("abrirPrecos");
const btnCancelarPrecos = document.getElementById("cancelarPrecos");
const btnAdicionarServico = document.getElementById("adicionarServico");

const listaLavagens = document.getElementById("listaLavagens");

const totalHoje = document.getElementById("totalHoje");
const totalSemana = document.getElementById("totalSemana");
const totalMes = document.getElementById("totalMes");
const totalAno = document.getElementById("totalAno");

const lavagensHoje = document.getElementById("lavagensHoje");


// ========================================
// FORMATAR DINHEIRO
// ========================================

function dinheiro(valor) {

    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}

function escaparHTML(valor) {

    return String(valor).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    })[caractere]);

}

const CHAVE_SERVICOS = "servicosLavaJatoDan";
const SERVICOS_PADRAO = [
    { id: "moto", nome: "Lavagem de Moto", preco: 15 },
    { id: "carro", nome: "Lavagem de Carro", preco: 30 },
    { id: "suv", nome: "Lavagem SUV", preco: 40 },
    { id: "caminhonete", nome: "Lavagem Caminhonete", preco: 50 },
    { id: "premium", nome: "Lavagem Premium", preco: 70 }
];

function carregarServicos() {

    const servicosSalvos = localStorage.getItem(CHAVE_SERVICOS);
    if (servicosSalvos) {
        const catalogo = JSON.parse(servicosSalvos);
        if (!Array.isArray(catalogo)) {
            throw new Error("O catálogo de serviços salvo está inválido.");
        }
        return catalogo;
    }

    const precosAnteriores = JSON.parse(
        localStorage.getItem("precosServicosLavaJatoDan") || "{}"
    );

    return SERVICOS_PADRAO.map(servicoPadrao => ({
        ...servicoPadrao,
        preco: Number(precosAnteriores[servicoPadrao.nome]) || servicoPadrao.preco
    }));

}

let servicos = carregarServicos();
let rascunhoServicos = [];

function atualizarOpcoesServico() {

    const valorSelecionado = servico.value;
    servico.replaceChildren(new Option("Selecione o serviço", ""));

    servicos.forEach(item => {
        const opcao = new Option(`${item.nome} - ${dinheiro(item.preco)}`, item.id);
        opcao.dataset.preco = String(item.preco);
        opcao.dataset.nomeServico = item.nome;
        opcao.dataset.serviceId = item.id;
        servico.appendChild(opcao);
    });

    servico.value = servicos.some(item => item.id === valorSelecionado)
        ? valorSelecionado
        : "";

}

function lerRascunhoServicos() {

    return Array.from(listaServicosConfig.querySelectorAll(".linha-servico-config"))
        .map(linha => ({
            id: linha.dataset.serviceId,
            nome: linha.querySelector("[data-field='name']").value.trim(),
            preco: Number(linha.querySelector("[data-field='price']").value)
        }));

}

function desenharFormularioServicos() {

    listaServicosConfig.replaceChildren();

    rascunhoServicos.forEach(item => {
        const linha = document.createElement("div");
        linha.className = "linha-servico-config";
        linha.dataset.serviceId = item.id;

        const nomeCampo = document.createElement("div");
        nomeCampo.className = "campo";
        const nomeLabel = document.createElement("label");
        nomeLabel.textContent = "Nome do serviço";
        const nomeId = `nome-servico-${item.id}`;
        nomeLabel.htmlFor = nomeId;
        const nomeInput = document.createElement("input");
        nomeInput.type = "text";
        nomeInput.id = nomeId;
        nomeInput.maxLength = 60;
        nomeInput.required = true;
        nomeInput.value = item.nome;
        nomeInput.dataset.field = "name";
        nomeCampo.append(nomeLabel, nomeInput);

        const precoCampo = document.createElement("div");
        precoCampo.className = "campo";
        const precoLabel = document.createElement("label");
        precoLabel.textContent = "Preço (R$)";
        const precoId = `preco-servico-${item.id}`;
        precoLabel.htmlFor = precoId;
        const precoInput = document.createElement("input");
        precoInput.type = "number";
        precoInput.id = precoId;
        precoInput.min = "0.01";
        precoInput.step = "0.01";
        precoInput.required = true;
        precoInput.value = String(item.preco);
        precoInput.dataset.field = "price";
        precoCampo.append(precoLabel, precoInput);

        const remover = document.createElement("button");
        remover.type = "button";
        remover.className = "btn-remover-servico";
        remover.textContent = "Remover";
        remover.dataset.removeService = item.id;
        remover.setAttribute("aria-label", `Remover serviço ${item.nome}`);

        linha.append(nomeCampo, precoCampo, remover);
        listaServicosConfig.appendChild(linha);
    });

}

function abrirConfiguracaoPrecos() {

    rascunhoServicos = servicos.map(item => ({ ...item }));
    desenharFormularioServicos();
    painelPrecos.classList.remove("hidden");
    painelPrecos.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

atualizarOpcoesServico();

formPrecos.addEventListener("click", event => {
    const remover = event.target.closest("[data-remove-service]");
    if (!remover) {
        return;
    }

    rascunhoServicos = lerRascunhoServicos()
        .filter(item => item.id !== remover.dataset.removeService);
    desenharFormularioServicos();
});

btnAdicionarServico.addEventListener("click", () => {
    rascunhoServicos = lerRascunhoServicos();
    rascunhoServicos.push({
        id: `servico-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        nome: "",
        preco: ""
    });
    desenharFormularioServicos();
    listaServicosConfig.lastElementChild
        .querySelector("[data-field='name']")
        .focus();
});


// ========================================
// PEGAR DATA ATUAL
// ========================================

function dataAtual() {

    return new Date();

}


// ========================================
// VERIFICAR SE É HOJE
// ========================================

function ehHoje(data) {

    const hoje = new Date();

    return (
        data.getDate() === hoje.getDate() &&
        data.getMonth() === hoje.getMonth() &&
        data.getFullYear() === hoje.getFullYear()
    );

}


// ========================================
// VERIFICAR SEMANA
// ========================================

function ehEstaSemana(data) {

    const hoje = new Date();

    const primeiroDia = new Date(hoje);

    primeiroDia.setDate(
        hoje.getDate() - hoje.getDay()
    );

    primeiroDia.setHours(0, 0, 0, 0);

    const ultimoDia = new Date(primeiroDia);

    ultimoDia.setDate(
        primeiroDia.getDate() + 6
    );

    ultimoDia.setHours(23, 59, 59, 999);

    return (
        data >= primeiroDia &&
        data <= ultimoDia
    );

}


// ========================================
// VERIFICAR MÊS
// ========================================

function ehEsteMes(data) {

    const hoje = new Date();

    return (
        data.getMonth() === hoje.getMonth() &&
        data.getFullYear() === hoje.getFullYear()
    );

}


// ========================================
// VERIFICAR ANO
// ========================================

function ehEsteAno(data) {

    const hoje = new Date();

    return (
        data.getFullYear() === hoje.getFullYear()
    );

}


// ========================================
// CALCULAR RESUMOS
// ========================================

function atualizarResumo() {

    let hoje = 0;
    let semana = 0;
    let mes = 0;
    let ano = 0;

    let quantidadeHoje = 0;


    lavagens.forEach(lavagem => {

        const data = new Date(lavagem.data);

        const valor = Number(lavagem.valor);


        if (ehHoje(data)) {

            hoje += valor;
            quantidadeHoje++;

        }


        if (ehEstaSemana(data)) {

            semana += valor;

        }


        if (ehEsteMes(data)) {

            mes += valor;

        }


        if (ehEsteAno(data)) {

            ano += valor;

        }

    });


    totalHoje.textContent = dinheiro(hoje);

    totalSemana.textContent = dinheiro(semana);

    totalMes.textContent = dinheiro(mes);

    totalAno.textContent = dinheiro(ano);

    lavagensHoje.textContent =
        `${quantidadeHoje} ${quantidadeHoje === 1 ? "lavagem" : "lavagens"}`;

}


// ========================================
// MOSTRAR HISTÓRICO
// ========================================

function mostrarLavagens() {

    listaLavagens.innerHTML = "";


    if (lavagens.length === 0) {

        listaLavagens.innerHTML = `
            <div class="sem-registros">
                Nenhuma lavagem registrada.
            </div>
        `;

        return;

    }


    const lista = [...lavagens].reverse();


    lista.forEach(lavagem => {

        const data = new Date(lavagem.data);


        const dataFormatada =
            data.toLocaleDateString("pt-BR");

        const horaFormatada =
            data.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            });


        const div = document.createElement("div");

        div.className = "lavagem";

        div.innerHTML = `

            <div>
                <div class="cliente-nome">
                    ${escaparHTML(lavagem.cliente)}
                </div>

                <div class="detalhe">
                    ${escaparHTML(lavagem.veiculo)}
                </div>
            </div>


            <div>
                <div class="detalhe">
                    ${escaparHTML(lavagem.servico)}
                </div>

                <div class="detalhe">
                    ${dataFormatada} às ${horaFormatada}
                </div>
            </div>


            <div>
                <div class="valor">
                    ${dinheiro(lavagem.valor)}
                </div>

                <div class="detalhe">
                    ${escaparHTML(lavagem.pagamento)}
                </div>
            </div>


            <div class="acoes-lavagem">
                <button
                    class="btn-editar"
                    type="button"
                    onclick="editarLavagem(${lavagem.id})"
                >
                    Editar
                </button>

                <button
                    class="btn-excluir"
                    type="button"
                    onclick="excluirLavagem(${lavagem.id})"
                >
                    Excluir
                </button>
            </div>

        `;


        listaLavagens.appendChild(div);

    });

}


// ========================================
// VALIDAÇÃO E RESET DO FORMULÁRIO
// ========================================

function resetarFormulario() {

    form.reset();
    atualizarOpcoesServico();
    lavagemIdEditando.value = "";
    btnRegistrar.textContent = "Registrar lavagem";
    btnCancelarEdicao.classList.add("hidden");

}

function prepararEdicao(id) {

    const lavagem = lavagens.find(item => item.id === id);

    if (!lavagem) {
        return;
    }

    cliente.value = lavagem.cliente;
    veiculo.value = lavagem.veiculo;
    let opcaoServico = servicos.find(item =>
        item.id === lavagem.servicoId || item.nome === lavagem.servico
    );

    if (!opcaoServico) {
        const opcaoAntiga = new Option(
            `${lavagem.servico} - ${dinheiro(Number(lavagem.valor))}`,
            `historico-${lavagem.id}`
        );
        opcaoAntiga.dataset.preco = String(lavagem.valor);
        opcaoAntiga.dataset.nomeServico = lavagem.servico;
        servico.appendChild(opcaoAntiga);
        servico.value = opcaoAntiga.value;
    } else {
        servico.value = opcaoServico.id;
    }

    pagamento.value = lavagem.pagamento;
    lavagemIdEditando.value = String(id);

    btnRegistrar.textContent = "Salvar alterações";
    btnCancelarEdicao.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

function validarFormulario() {

    if (!cliente.value.trim()) {
        alert("Informe o nome do cliente.");
        cliente.focus();
        return false;
    }

    if (!veiculo.value) {
        alert("Selecione o veículo.");
        veiculo.focus();
        return false;
    }

    if (!servico.value) {
        alert("Selecione o serviço.");
        servico.focus();
        return false;
    }

    if (!pagamento.value) {
        alert("Selecione a forma de pagamento.");
        pagamento.focus();
        return false;
    }

    const opcao = servico.options[servico.selectedIndex];
    const valor = Number(opcao.dataset.preco || 0);

    if (!Number.isFinite(valor) || valor <= 0) {
        alert("Valor do serviço inválido.");
        servico.focus();
        return false;
    }

    return true;

}

form.addEventListener("submit", function(event) {

    event.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    const opcao = servico.options[servico.selectedIndex];
    const valor = Number(opcao.dataset.preco);
    const idEditando = lavagemIdEditando.value ? Number(lavagemIdEditando.value) : null;

    if (idEditando !== null) {

        const item = lavagens.find(lavagem => lavagem.id === idEditando);

        if (!item) {
            alert("Registro não encontrado para edição.");
            return;
        }

        item.cliente = cliente.value.trim();
        item.veiculo = veiculo.value;
        item.servicoId = opcao.dataset.serviceId || null;
        item.servico = opcao.dataset.nomeServico;
        item.valor = valor;
        item.pagamento = pagamento.value;

        alert("Lavagem atualizada com sucesso!");

    } else {

        const novaLavagem = {
            id: Date.now(),
            cliente: cliente.value.trim(),
            veiculo: veiculo.value,
            servicoId: opcao.dataset.serviceId,
            servico: opcao.dataset.nomeServico,
            valor: valor,
            pagamento: pagamento.value,
            data: new Date().toISOString()
        };

        lavagens.push(novaLavagem);

        alert("Lavagem registrada com sucesso!");

    }


    salvar();
    resetarFormulario();

});

// ========================================
// EDITAR LAVAGEM
// ========================================

function editarLavagem(id) {

    prepararEdicao(id);

}

btnCancelarEdicao.addEventListener("click", function() {

    resetarFormulario();

});

// ========================================
// EXCLUIR LAVAGEM
// ========================================

function excluirLavagem(id) {

    const confirmar =
        confirm("Deseja realmente excluir esta lavagem?");


    if (!confirmar) {

        return;

    }


    lavagens =
        lavagens.filter(lavagem => lavagem.id !== id);


    if (lavagemIdEditando.value && Number(lavagemIdEditando.value) === id) {
        resetarFormulario();
    }


    salvar();

}


// ========================================
// SALVAR NO NAVEGADOR
// ========================================

function salvar() {

    localStorage.setItem(
        "lavagensDan",
        JSON.stringify(lavagens)
    );


    mostrarLavagens();

    atualizarResumo();

}


// ========================================
// LIMPAR TUDO
// ========================================

document
    .getElementById("limparTudo")
    .addEventListener("click", function() {

        if (lavagens.length === 0) {

            alert("Não existem registros para apagar.");

            return;

        }


        const confirmar =
            confirm(
                "ATENÇÃO!\n\nDeseja apagar todo o histórico?"
            );


        if (!confirmar) {

            return;

        }


        lavagens = [];


        salvar();

        alert("Histórico apagado.");

    });


// ========================================
// INICIAR SISTEMA
// ========================================

function atualizarNomeLoja(nome) {

    const nomeExibido = nome || "Lava Jato";
    document.title = nome || "Configurar lava-jato";
    document.querySelector(".topo h1").textContent = nomeExibido;
    nomeLojaRodape.textContent = nomeExibido;

}

function abrirConfiguracaoNome() {

    painelNomeLoja.classList.remove("hidden");
    campoNomeLoja.value = localStorage.getItem("nomeLavaJatoDan") || "";
    campoNomeLoja.focus();
    painelNomeLoja.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

const nomeLojaSalvo = localStorage.getItem("nomeLavaJatoDan");
atualizarNomeLoja(nomeLojaSalvo);

if (!nomeLojaSalvo) {
    abrirConfiguracaoNome();
}

formNomeLoja.addEventListener("submit", event => {
    event.preventDefault();

    const nome = campoNomeLoja.value.trim();
    if (!nome) {
        campoNomeLoja.focus();
        return;
    }

    localStorage.setItem("nomeLavaJatoDan", nome);
    atualizarNomeLoja(nome);
    painelNomeLoja.classList.add("hidden");
});

btnAlterarNomeLoja.addEventListener("click", abrirConfiguracaoNome);

btnAbrirPrecos.addEventListener("click", abrirConfiguracaoPrecos);

btnCancelarPrecos.addEventListener("click", () => {
    painelPrecos.classList.add("hidden");
});

formPrecos.addEventListener("submit", event => {
    event.preventDefault();

    const novosServicos = lerRascunhoServicos();

    if (novosServicos.length === 0) {
        alert("Mantenha pelo menos um serviço cadastrado.");
        return;
    }

    const nomesNormalizados = new Set();
    for (const item of novosServicos) {
        if (!item.nome || item.nome.length > 60) {
            alert("Preencha o nome de todos os serviços (até 60 caracteres).");
            return;
        }

        if (!Number.isFinite(item.preco) || item.preco <= 0) {
            alert(`Informe um preço válido para “${item.nome}”.`);
            return;
        }

        const nomeNormalizado = item.nome.toLocaleLowerCase("pt-BR");
        if (nomesNormalizados.has(nomeNormalizado)) {
            alert("Cada serviço precisa ter um nome diferente.");
            return;
        }
        nomesNormalizados.add(nomeNormalizado);
    }

    servicos = novosServicos;
    localStorage.setItem(CHAVE_SERVICOS, JSON.stringify(servicos));
    atualizarOpcoesServico();
    painelPrecos.classList.add("hidden");
    alert("Serviços e preços salvos com sucesso!");
});

mostrarLavagens();

atualizarResumo();

let eventoInstalacaoPendente;

window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    eventoInstalacaoPendente = event;
    btnInstalarApp.classList.remove("hidden");
});

btnInstalarApp.addEventListener("click", async () => {
    if (!eventoInstalacaoPendente) {
        alert(
            "Para instalar, abra o menu do navegador e escolha “Instalar aplicativo” " +
            "ou “Adicionar à tela inicial”. A instalação exige localhost ou um site HTTPS."
        );
        return;
    }

    eventoInstalacaoPendente.prompt();
    await eventoInstalacaoPendente.userChoice;
    eventoInstalacaoPendente = null;
    btnInstalarApp.classList.add("hidden");
});

window.addEventListener("appinstalled", () => {
    eventoInstalacaoPendente = null;
    btnInstalarApp.classList.add("hidden");
});

if (window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true) {
    btnInstalarApp.classList.add("hidden");
}

if ("serviceWorker" in navigator && window.isSecureContext) {
    navigator.serviceWorker.register("./service-worker.js")
        .catch(error => {
            console.error("Não foi possível registrar o service worker:", error);
        });
}
