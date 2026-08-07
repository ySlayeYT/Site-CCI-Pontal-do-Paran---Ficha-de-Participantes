const firebaseConfig = {
  apiKey: "AIzaSyDtrs8K4SB96b5VHhj3gW2yLUfegS9DHGs",
  authDomain: "sistema-cci-pontal-do-parana.firebaseapp.com",
  projectId: "sistema-cci-pontal-do-parana",
  storageBucket: "sistema-cci-pontal-do-parana.firebasestorage.app",
  messagingSenderId: "957616639810",
  appId: "1:957616639810:web:7d258a77f17110eed9c2db",
  measurementId: "G-N7RJWLV6P1"
};

// Array para armazenar os participantes em memória local
let participantes = JSON.parse(localStorage.getItem('cci_participantes')) || [];

// Alternar entre abas (Cadastro / Lista)
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`sec-${tabId}`).classList.add('active');
    document.getElementById(`btn-tab-${tabId}`).classList.add('active');

    if(tabId === 'lista') atualizarTabela();
}

// Converter imagem para Base64 (para poder salvar no LocalStorage)
function convertImageToBase64(file, callback) {
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsDataURL(file);
}

// Submissão do Formulário
document.getElementById('form-cadastro').addEventListener('submit', function(e) {
    e.preventDefault();

    const fotoInput = document.getElementById('foto');
    
    const participante = {
        id: Date.now(),
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        data_nasc: document.getElementById('data_nasc').value,
        ano_inscricao: document.getElementById('ano_inscricao').value,
        tel_pessoal: document.getElementById('tel_pessoal').value,
        tel_resp: document.getElementById('tel_resp').value,
        balneario: document.getElementById('balneario').value,
        endereco: document.getElementById('endereco').value,
        profissao: document.getElementById('profissao').value,
        atividade: document.getElementById('atividade').value,
        medicamentos: document.getElementById('medicamentos').value,
        foto: null
    };

    if (fotoInput.files.length > 0) {
        convertImageToBase64(fotoInput.files[0], (base64Img) => {
            participante.foto = base64Img;
            salvarParticipante(participante);
        });
    } else {
        salvarParticipante(participante);
    }
});

function salvarParticipante(participante) {
    participantes.push(participante);
    localStorage.setItem('cci_participantes', JSON.stringify(participantes));
    alert('Ficha cadastrada com sucesso!');
    document.getElementById('form-cadastro').reset();
    switchTab('lista');
}

// Atualizar a tabela de listagem
function atualizarTabela(lista = participantes) {
    const tbody = document.getElementById('tabela-corpo');
    tbody.innerHTML = '';
    
    document.getElementById('total-count').textContent = lista.length;

    lista.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${p.nome}</strong></td>
            <td>${p.cpf}</td>
            <td>${p.balneario}</td>
            <td>${p.atividade}</td>
            <td>
                <button class="btn-print" onclick="imprimirFicha(${p.id})">Imprimir</button>
                <button class="btn-delete" onclick="excluirFicha(${p.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Filtrar lista pela barra de pesquisa
function filtrarLista() {
    const termo = document.getElementById('search-input').value.toLowerCase();
    const listaFiltrada = participantes.filter(p => p.nome.toLowerCase().includes(termo));
    atualizarTabela(listaFiltrada);
}

// Excluir participante
function excluirFicha(id) {
    if(confirm('Tem certeza que deseja excluir este participante?')) {
        participantes = participantes.filter(p => p.id !== id);
        localStorage.setItem('cci_participantes', JSON.stringify(participantes));
        atualizarTabela();
    }
}

// Formatar data (YYYY-MM-DD para DD/MM/YYYY)
function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Preparar Layout e Imprimir Ficha Unitária
function imprimirFicha(id) {
    const p = participantes.find(part => part.id === id);
    if(!p) return;

    const printArea = document.getElementById('print-area');
    
    const fotoHtml = p.foto 
        ? `<img src="${p.foto}" class="ficha-photo" alt="Foto">` 
        : `<div class="ficha-photo-placeholder">Sem Foto</div>`;

    printArea.innerHTML = `
        <div class="ficha-print">
            <div class="ficha-header">
                <h2>CCI Pontal do Paraná - Ficha de Inscrição</h2>
                <p>Ano letivo: ${p.ano_inscricao}</p>
            </div>
            <div class="ficha-content">
                ${fotoHtml}
                <div class="ficha-data">
                    <div class="ficha-row"><strong>Nome:</strong> ${p.nome}</div>
                    <div class="ficha-row"><strong>CPF:</strong> ${p.cpf}</div>
                    <div class="ficha-row"><strong>Data de Nasc:</strong> ${formatarData(p.data_nasc)}</div>
                    <div class="ficha-row"><strong>Telefone Pessoal:</strong> ${p.tel_pessoal}</div>
                    <div class="ficha-row"><strong>Telefone Responsável:</strong> ${p.tel_resp}</div>
                    <div class="ficha-row"><strong>Balneário:</strong> ${p.balneario}</div>
                    <div class="ficha-row"><strong>Endereço:</strong> ${p.endereco}</div>
                    <div class="ficha-row"><strong>Profissão:</strong> ${p.profissao}</div>
                    <div class="ficha-row"><strong>Atividade no CCI:</strong> ${p.atividade}</div>
                    <div class="ficha-row"><strong>Medicamentos:</strong> ${p.medicamentos}</div>
                </div>
            </div>
        </div>
    `;

    // Dispara a janela de impressão nativa do navegador
    window.print();
}

// Iniciar a tabela vazia se não houver registros
window.onload = () => {
    if (document.getElementById('sec-lista').classList.contains('active')) {
        atualizarTabela();
    }
};