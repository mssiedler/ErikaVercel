// Dados mock de denúncias

    
// Função para obter classe de badge de situação
function getSituacaoBadgeClass(situacao) {
    const classes = {
        'Pendente': 'badge-yellow',
        'Em Análise': 'badge-blue',
        'Em Andamento': 'badge-purple',
        'Resolvida': 'badge-green',
        'Arquivada': 'badge-gray',
        'Inativa': 'badge-gray'
    };
    return classes[situacao] || '';
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Função para renderizar a tabela
function renderTable(data) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const basePath = window.DENUNCIA_BASE_PATH || '/admin';
    const isUser = basePath === '/usuario';

    data.forEach(denuncia => {
        const dataFormatada = new Date(denuncia.data).toLocaleDateString('pt-BR');
        const especieIcon = denuncia.especie === 'Animais'
            ? '<path d="M11.5 9.5c.8-1.6 2.8-1.6 3.6 0 .8 1.6-.3 3.5-1.8 3.5s-2.6-1.9-1.8-3.5Z"></path><circle cx="6.5" cy="8.5" r="1.6"></circle><circle cx="10" cy="5.5" r="1.6"></circle><circle cx="14" cy="5.5" r="1.6"></circle><circle cx="17.5" cy="8.5" r="1.6"></circle>'
            : '<path d="M11 20A7 7 0 0 1 4 13c0-5 7-9 7-9s7 4 7 9a7 7 0 0 1-7 7Z"></path><path d="M11 20c0-4 2-7 5-9"></path>';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="denuncia-number">${denuncia.ndenuncia}</div>
            </td>
            <td>
                <div class="person-name">${denuncia.nomeDenunciante}</div>
                <div class="muted">${denuncia.email}</div>
            </td>
            <td>
                <div class="date-main">${dataFormatada}</div>
                <div class="muted">${denuncia.hora}</div>
            </td>
            <td>
                <span class="badge badge-outline badge-species">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${especieIcon}</svg>
                    ${denuncia.especie}
                </span>
            </td>
            <td>
                <div class="case-status-stack">
                    <span class="badge ${getSituacaoBadgeClass(denuncia.situacao)}">${denuncia.situacao}</span>
                    ${denuncia.descricaoSituacao ? `<span class="case-status-note">${escapeHtml(denuncia.descricaoSituacao)}</span>` : ''}
                </div>
            </td>
            <td>
                <div class="actions">
                    <button class="action-btn view action-details" title="Visualizar" onclick="window.location.href='${basePath}/denuncia/ver/${denuncia.id}'">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span>Ver detalhes</span>
                    </button>
                    <!--
                    <button class="action-btn edit" title="Editar" onclick="editDenuncia('${denuncia.id}')">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                             <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                         </svg>
                     </button>
                    -->
                    ${denuncia.situacao === 'Inativa'
                        ? (isUser ? '' : `
                        <button class="action-btn edit icon-action" title="Reativar" onclick="reativarDenuncia('${denuncia.id}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 12a9 9 0 0 1 15.5-6.36"></path>
                                <polyline points="19 3 19 8 14 8"></polyline>
                                <path d="M21 12a9 9 0 0 1-15.5 6.36"></path>
                                <polyline points="5 21 5 16 10 16"></polyline>
                            </svg>
                        </button>
                        `)
                        : `
                        <button class="action-btn delete icon-action" title="${isUser ? 'Solicitar Inativação' : 'Inativar'}" onclick="${isUser ? `solicitarInativacao('${denuncia.id}')` : `deleteDenuncia('${denuncia.id}')`}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    `}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Atualizar contador
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `Exibindo ${data.length} de ${denuncias.length} denúncias`;
    }
}

// Função para filtrar denúncias
function filterDenuncias() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filterSituacao = document.getElementById('filterSituacao')?.value || 'todas';
    const filterEspecie = document.getElementById('filterEspecie')?.value || 'todas';

    const filtered = denuncias.filter(denuncia => {
        const matchesSearch = 
            String(denuncia.ndenuncia || '').toLowerCase().includes(searchTerm) ||
            String(denuncia.nomeDenunciante || '').toLowerCase().includes(searchTerm) ||
            String(denuncia.nome || '').toLowerCase().includes(searchTerm);
        
        const matchesSituacao = filterSituacao === 'todas' || denuncia.situacao === filterSituacao;
        const matchesEspecie = filterEspecie === 'todas' || denuncia.especie === filterEspecie;

        return matchesSearch && matchesSituacao && matchesEspecie;
    });

    renderTable(filtered);
}

// Função para editar denúncia
function editDenuncia(id) {
    const denuncia = denuncias.find(d => d.id === id);
    if (denuncia) {
        // Preencher o formulário
        document.getElementById('ndenuncia').value = denuncia.ndenuncia;
        document.getElementById('fonte').value = denuncia.fonte;
        document.getElementById('data').value = denuncia.data;
        document.getElementById('hora').value = denuncia.hora;
        document.getElementById('nomeDenunciante').value = denuncia.nomeDenunciante;
        document.getElementById('cpf').value = denuncia.cpf;
        document.getElementById('email').value = denuncia.email;
        document.getElementById('endereco').value = denuncia.endereco;
        document.getElementById('especie').value = denuncia.especie;
        document.getElementById('quantidade').value = denuncia.quantidade;
        document.getElementById('situacao').value = denuncia.situacao;
        document.getElementById('nome').value = denuncia.nome;
        document.getElementById('enderecoDenunciado').value = denuncia.enderecoProprietario;
        document.getElementById('providencia').value = denuncia.providencia;
        
        // Mudar para página de formulário
        showPage('form');
        
        // Alterar título
        document.querySelector('#formPage .page-header h2').textContent = 'Editar Denúncia';
        document.querySelector('#formPage .btn-primary').textContent = 'Atualizar Denúncia';
    }
}

// Função para deletar denúncia
// function deleteDenuncia(id) {
//     if (confirm('Tem certeza que deseja excluir esta denúncia?')) {
//         const index = denuncias.findIndex(d => d.id === id);
//         if (index > -1) {
//             denuncias.splice(index, 1);
//             renderTable(denuncias);
//             alert('Denúncia excluída com sucesso!');
//         }
//     }
// }

function deleteDenuncia(id) {
    if (confirm('Tem certeza que deseja inativar esta denúncia?')) {
        window.location.href = `/admin/denuncia/del/${id}`;
    }
}

function solicitarInativacao(id) {
    if (confirm('Deseja solicitar a inativação desta denúncia?')) {
        window.location.href = `/usuario/denuncia/solicitar-inativacao/${id}`;
    }
}

function reativarDenuncia(id) {
    if (confirm('Deseja reativar esta denúncia?')) {
        window.location.href = `/admin/denuncia/reativar/${id}`;
    }
}
// Função para trocar de página
function showPage(pageName) {
    // Esconder todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Remover active dos nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Mostrar a página selecionada
    if (pageName === 'list') {
        document.getElementById('listPage')?.classList.add('active');
        renderTable(denuncias);
    } else if (pageName === 'form') {
        document.getElementById('formPage')?.classList.add('active');
        // Resetar o formulário se for nova denúncia
        if (document.querySelector('#formPage .page-header h2')?.textContent === 'Nova Denúncia') {
            document.getElementById('denunciaForm')?.reset();
            // Setar data e hora atual
            const now = new Date();
            const inputData = document.getElementById('data');
            const inputHora = document.getElementById('hora');
            if (inputData) inputData.value = now.toISOString().split('T')[0];
            if (inputHora) inputHora.value = now.toTimeString().slice(0, 5);
        }
    } else if (pageName === 'reports') {
        document.getElementById('reportsPage')?.classList.add('active');
    }

    // Fechar sidebar no mobile
    closeSidebar();
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Fechar sidebar
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// Submit do formulário
document.getElementById('denunciaForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        id: denuncias.length + 1,
        ndenuncia: document.getElementById('ndenuncia').value,
        fonte: document.getElementById('fonte').value,
        data: document.getElementById('data').value,
        hora: document.getElementById('hora').value,
        nomeDenunciante: document.getElementById('nomeDenunciante').value,
        cpf: document.getElementById('cpf').value,
        email: document.getElementById('email').value,
        endereco: document.getElementById('endereco').value,
        especie: document.getElementById('especie').value,
        quantidade: parseInt(document.getElementById('quantidade').value),
        situacao: document.getElementById('situacao').value,
        nomeDenunciado: document.getElementById('nomeDenunciado').value,
        enderecoProprietario: document.getElementById('enderecoProprietario').value,
        providencias: document.getElementById('providencia').value
    };

    denuncias.push(formData);
    alert('Denúncia cadastrada com sucesso!');
    showPage('list');
    
    // Resetar para "Nova Denúncia"
    document.querySelector('#formPage .page-header h2').textContent = 'Nova Denúncia';
    document.querySelector('#formPage .btn-primary').textContent = 'Cadastrar Denúncia';
});

// Event listeners
document.getElementById('menuBtn')?.addEventListener('click', toggleSidebar);
document.getElementById('overlay')?.addEventListener('click', closeSidebar);
document.getElementById('searchInput')?.addEventListener('input', filterDenuncias);
document.getElementById('filterSituacao')?.addEventListener('change', filterDenuncias);
document.getElementById('filterEspecie')?.addEventListener('change', filterDenuncias);

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    renderTable(denuncias);
    
    // Setar data e hora atual no formulário
    const now = new Date();
    const inputData = document.getElementById('data');
    const inputHora = document.getElementById('hora');
    if (inputData) inputData.value = now.toISOString().split('T')[0];
    if (inputHora) inputHora.value = now.toTimeString().slice(0, 5);
});
