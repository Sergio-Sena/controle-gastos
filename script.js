// Estado da aplicação
let lancamentos = [];
let reservaEmergencia = 0;
let graficoComparativo = null;
let graficoCategorias = null;
let editandoId = null;
let api = new FinancasAPI();

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    await initializeApp();
});

async function initializeApp() {
    showNotification('Carregando dados...');
    
    // Verificar se já tem dados no localStorage
    const dadosExistentes = {
        lancamentos: JSON.parse(localStorage.getItem('lancamentos')) || [],
        reservaEmergencia: parseFloat(localStorage.getItem('reservaEmergencia')) || 0
    };
    
    const dados = await api.carregarDados();
    lancamentos = dados.lancamentos;
    reservaEmergencia = dados.reservaEmergencia;
    
    setupEventListeners();
    updateDashboard();
    renderLancamentos();
    setupFiltroMes();
    setDataAtual();
    
    if (lancamentos.length > 0 || reservaEmergencia > 0) {
        showNotification('🚀 Dados carregados!');
    } else {
        showNotification('🎆 Bem-vindo! Comece adicionando seus lançamentos.');
    }
    
    // Adicionar controles de backup/importação
    adicionarControlesBackup();
}

function setupEventListeners() {
    document.getElementById('form-lancamento').addEventListener('submit', adicionarLancamento);
    document.addEventListener('keydown', handleKeyboardInput);
}

function setDataAtual() {
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('data').value = hoje;
}

// Navegação entre abas
function showTab(tabName) {
    // Esconder todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover classe active de todos os botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar aba selecionada
    document.getElementById(tabName).classList.add('active');
    
    // Adicionar classe active ao botão clicado
    event.target.classList.add('active');
    
    // Atualizar gráfico se for dashboard
    if (tabName === 'dashboard') {
        setTimeout(updateGrafico, 100);
    }
}

// Adicionar lançamento
function toggleCategoria() {
    const tipo = document.getElementById('tipo').value;
    const categoriaGroup = document.getElementById('categoria-group');
    const recorrenteGroup = document.getElementById('recorrente-group');
    
    if (tipo === 'despesa') {
        categoriaGroup.style.display = 'block';
        recorrenteGroup.style.display = 'block';
        document.getElementById('categoria').required = true;
    } else {
        categoriaGroup.style.display = 'none';
        recorrenteGroup.style.display = 'none';
        document.getElementById('categoria').required = false;
        document.getElementById('recorrente').checked = false;
    }
}

async function adicionarLancamento(e) {
    e.preventDefault();
    
    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const tipo = document.getElementById('tipo').value;
    const categoria = tipo === 'despesa' ? document.getElementById('categoria').value : null;
    const recorrente = tipo === 'despesa' ? document.getElementById('recorrente').checked : false;
    const data = document.getElementById('data').value;
    
    // Verificar duplicatas apenas para novos lançamentos
    if (!editandoId && verificarDuplicata(descricao, valor, tipo, data)) {
        if (!confirm('⚠️ Possível lançamento duplicado detectado!\n\nJá existe um lançamento similar com a mesma descrição, valor e data.\n\nDeseja adicionar mesmo assim?')) {
            return;
        }
    }
    
    if (editandoId) {
        // Editando lançamento existente
        const index = lancamentos.findIndex(l => l.id === editandoId);
        if (index !== -1) {
            lancamentos[index] = {
                ...lancamentos[index],
                descricao,
                valor,
                tipo,
                categoria,
                data
            };
            showNotification('Lançamento atualizado com sucesso!');
        }
        editandoId = null;
        document.querySelector('#form-lancamento button[type="submit"]').textContent = 'Adicionar Lançamento';
        document.getElementById('btn-cancelar').style.display = 'none';
        await salvarDados();
    } else {
        // Novo lançamento
        const lancamento = {
            id: Date.now(),
            descricao,
            valor,
            tipo,
            categoria,
            data,
            pago: false,
            timestamp: new Date().toISOString()
        };
        lancamentos.push(lancamento);
        showNotification('Lançamento adicionado com sucesso!');
    }
    
    await salvarDados();
    
    // Limpar formulário
    document.getElementById('form-lancamento').reset();
    document.getElementById('categoria-group').style.display = 'none';
    setDataAtual();
    
    // Atualizar interface
    updateDashboard();
    renderLancamentos();
    setupFiltroMes();
}

async function salvarDados() {
    const sucesso = await api.salvarDados(lancamentos, reservaEmergencia);
    if (api.autoSync && api.token) {
        showNotification('🌍 Sincronizado na nuvem!');
    } else {
        showNotification('💾 Dados salvos localmente!');
    }
}

function updateDashboard() {
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    
    const lancamentosMesAtual = lancamentos.filter(l => {
        const dataLancamento = new Date(l.data + 'T00:00:00');
        return dataLancamento.getMonth() === mesAtual && dataLancamento.getFullYear() === anoAtual;
    });
    
    const receitas = lancamentosMesAtual
        .filter(l => l.tipo === 'receita')
        .reduce((sum, l) => sum + l.valor, 0);
    
    const despesas = lancamentosMesAtual
        .filter(l => l.tipo === 'despesa')
        .reduce((sum, l) => sum + l.valor, 0);
    
    const saldo = receitas - despesas;
    
    // Atualizar elementos
    document.getElementById('receitas-mes').textContent = formatarMoeda(receitas);
    document.getElementById('despesas-mes').textContent = formatarMoeda(despesas);
    document.getElementById('saldo-mes').textContent = formatarMoeda(saldo);
    document.getElementById('saldo').textContent = formatarMoeda(saldo);
    
    // Colorir saldo
    const saldoElement = document.getElementById('saldo-mes');
    saldoElement.className = saldo >= 0 ? 'value positive' : 'value negative';
    
    // Atualizar últimos lançamentos
    updateUltimosLancamentos();
    
    // Atualizar gráficos
    updateGrafico();
    updateGraficoCategorias();
    updateReservaEmergencia();
}

function updateUltimosLancamentos() {
    const container = document.getElementById('ultimos-lancamentos');
    const ultimosLancamentos = lancamentos
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
    
    if (ultimosLancamentos.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum lançamento ainda</p>';
        return;
    }
    
    container.innerHTML = ultimosLancamentos.map(l => `
        <div class="lancamento-item ${l.tipo} ${l.pago ? 'pago' : ''}">
            <div class="lancamento-info">
                <h4>${l.descricao}</h4>
                <small>${formatarData(l.data)}</small>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="lancamento-valor ${l.tipo === 'receita' ? 'positive' : 'negative'}">
                    ${l.tipo === 'receita' ? '+' : '-'}${formatarMoeda(l.valor)}
                </div>
                <button class="btn-primary btn-small btn-edit" onclick="editarLancamento(${l.id})">✏️</button>
                <button class="btn-primary btn-small btn-delete" onclick="excluirLancamento(${l.id})">🗑️</button>
                <div class="custom-checkbox ${l.pago ? 'checked' : ''}" onclick="togglePago(${l.id})"></div>
            </div>
        </div>
    `).join('');
}

function updateGrafico() {
    const ctx = document.getElementById('graficoComparativo');
    if (!ctx) return;
    
    const dadosGrafico = getDadosComparativos();
    
    if (graficoComparativo) {
        graficoComparativo.destroy();
    }
    
    graficoComparativo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dadosGrafico.labels,
            datasets: [{
                label: 'Gastos',
                data: dadosGrafico.gastos,
                backgroundColor: 'rgba(248, 113, 113, 0.8)',
                borderColor: 'rgba(248, 113, 113, 1)',
                borderWidth: 1
            }, {
                label: 'Receitas',
                data: dadosGrafico.receitas,
                backgroundColor: 'rgba(74, 222, 128, 0.8)',
                borderColor: 'rgba(74, 222, 128, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function getDadosComparativos() {
    const hoje = new Date();
    const meses = [];
    const gastos = [];
    const receitas = [];
    
    for (let i = 5; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mes = data.getMonth();
        const ano = data.getFullYear();
        
        const lancamentosMes = lancamentos.filter(l => {
            const dataLancamento = new Date(l.data + 'T00:00:00');
            return dataLancamento.getMonth() === mes && dataLancamento.getFullYear() === ano;
        });
        
        const gastosMes = lancamentosMes
            .filter(l => l.tipo === 'despesa')
            .reduce((sum, l) => sum + l.valor, 0);
        
        const receitasMes = lancamentosMes
            .filter(l => l.tipo === 'receita')
            .reduce((sum, l) => sum + l.valor, 0);
        
        meses.push(data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
        gastos.push(gastosMes);
        receitas.push(receitasMes);
    }
    
    return { labels: meses, gastos, receitas };
}

function renderLancamentos() {
    const container = document.getElementById('lista-lancamentos');
    const filtroMes = document.getElementById('filtro-mes').value;
    const filtroCategoria = document.getElementById('filtro-categoria')?.value || '';
    const ordenarPor = document.getElementById('ordenar-por')?.value || 'data-desc';
    
    let lancamentosFiltrados = [...lancamentos];
    
    if (filtroMes) {
        const [ano, mes] = filtroMes.split('-');
        lancamentosFiltrados = lancamentosFiltrados.filter(l => {
            const data = new Date(l.data + 'T00:00:00');
            return data.getFullYear() == ano && data.getMonth() == (mes - 1);
        });
    }
    
    if (filtroCategoria) {
        lancamentosFiltrados = lancamentosFiltrados.filter(l => l.categoria === filtroCategoria);
    }
    
    // Ordenar conforme seleção
    if (ordenarPor === 'data-asc') {
        lancamentosFiltrados.sort((a, b) => new Date(a.data) - new Date(b.data));
    } else {
        lancamentosFiltrados.sort((a, b) => new Date(b.data) - new Date(a.data));
    }
    
    if (lancamentosFiltrados.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum lançamento encontrado</p>';
        return;
    }
    
    container.innerHTML = lancamentosFiltrados.map(l => `
        <div class="lancamento-item ${l.tipo} ${l.pago ? 'pago' : ''}">
            <div class="lancamento-info">
                <h4>${l.descricao}</h4>
                <small>${formatarData(l.data)}</small>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="lancamento-valor ${l.tipo === 'receita' ? 'positive' : 'negative'}">
                    ${l.tipo === 'receita' ? '+' : '-'}${formatarMoeda(l.valor)}
                </div>
                <button class="btn-primary btn-small btn-edit" onclick="editarLancamento(${l.id})">✏️</button>
                <button class="btn-primary btn-small btn-delete" onclick="excluirLancamento(${l.id})">🗑️</button>
                <div class="custom-checkbox ${l.pago ? 'checked' : ''}" onclick="togglePago(${l.id})"></div>
            </div>
        </div>
    `).join('');
}

function setupFiltroMes() {
    // Filtro de mês
    const selectMes = document.getElementById('filtro-mes');
    const mesesUnicos = [...new Set(lancamentos.map(l => {
        const data = new Date(l.data + 'T00:00:00');
        return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
    }))].sort().reverse();
    
    const optionsHtml = '<option value="">Todos os meses</option>' + 
        mesesUnicos.map(mes => {
            const [ano, mesNum] = mes.split('-');
            const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            return `<option value="${mes}">${nomesMeses[mesNum - 1]} ${ano}</option>`;
        }).join('');
    
    selectMes.innerHTML = optionsHtml;
    selectMes.addEventListener('change', renderLancamentos);
    
    // Filtro de categoria
    const selectCategoria = document.getElementById('filtro-categoria');
    if (selectCategoria) {
        const categorias = {
            'alimentacao': '🍽️ Alimentação',
            'transporte': '🚗 Transporte',
            'casa': '🏠 Casa',
            'saude': '💊 Saúde',
            'lazer': '🎮 Lazer',
            'roupas': '👕 Roupas',
            'internet': '🌐 Internet/Fibra',
            'telefone': '📱 Telefone Móvel',
            'cartao': '💳 Cartão de Crédito',
            'estudos': '📚 Estudos',
            'outros': '📦 Outros'
        };
        
        const categoriasUsadas = [...new Set(lancamentos
            .filter(l => l.categoria)
            .map(l => l.categoria)
        )].sort();
        
        const categoriaOptions = '<option value="">Todas as categorias</option>' +
            categoriasUsadas.map(cat => 
                `<option value="${cat}">${categorias[cat] || cat}</option>`
            ).join('');
        
        selectCategoria.innerHTML = categoriaOptions;
        selectCategoria.addEventListener('change', renderLancamentos);
    }
    
    // Listener para ordenação
    const ordenarSelect = document.getElementById('ordenar-por');
    if (ordenarSelect) {
        ordenarSelect.addEventListener('change', renderLancamentos);
    }
}

// Calculadora
let calcDisplay = '';

function appendToCalc(value) {
    calcDisplay += value;
    document.getElementById('calc-display').value = calcDisplay;
}

function clearCalc() {
    calcDisplay = '';
    document.getElementById('calc-display').value = '';
}

function deleteLast() {
    calcDisplay = calcDisplay.slice(0, -1);
    document.getElementById('calc-display').value = calcDisplay;
}

function calculate() {
    try {
        const result = eval(calcDisplay.replace('×', '*').replace('÷', '/'));
        document.getElementById('calc-display').value = result;
        calcDisplay = result.toString();
    } catch (error) {
        document.getElementById('calc-display').value = 'Erro';
        calcDisplay = '';
    }
}

// Utilitários
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function formatarData(data) {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
}

// Suporte ao teclado numérico
function handleKeyboardInput(e) {
    // Só funciona se a aba calculadora estiver ativa
    if (!document.getElementById('calculadora').classList.contains('active')) return;
    
    const key = e.key;
    
    // Números
    if (/[0-9]/.test(key)) {
        appendToCalc(key);
        e.preventDefault();
    }
    // Operadores
    else if (key === '+') {
        appendToCalc('+');
        e.preventDefault();
    }
    else if (key === '-') {
        appendToCalc('-');
        e.preventDefault();
    }
    else if (key === '*') {
        appendToCalc('*');
        e.preventDefault();
    }
    else if (key === '/') {
        appendToCalc('/');
        e.preventDefault();
    }
    // Ponto decimal
    else if (key === '.' || key === ',') {
        appendToCalc('.');
        e.preventDefault();
    }
    // Enter ou = para calcular
    else if (key === 'Enter' || key === '=') {
        calculate();
        e.preventDefault();
    }
    // Backspace para deletar
    else if (key === 'Backspace') {
        deleteLast();
        e.preventDefault();
    }
    // Escape ou C para limpar
    else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearCalc();
        e.preventDefault();
    }
}

async function adicionarReserva() {
    const valor = parseFloat(document.getElementById('valor-reserva').value);
    if (valor && valor > 0) {
        reservaEmergencia += valor;
        await salvarDados();
        document.getElementById('valor-reserva').value = '';
        updateReservaEmergencia();
        showNotification(`R$ ${valor.toFixed(2)} adicionado à reserva!`);
    }
}

function updateReservaEmergencia() {
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    
    const despesasMesAtual = lancamentos
        .filter(l => {
            const dataLancamento = new Date(l.data + 'T00:00:00');
            return l.tipo === 'despesa' && dataLancamento.getMonth() === mesAtual && dataLancamento.getFullYear() === anoAtual;
        })
        .reduce((sum, l) => sum + l.valor, 0);
    
    const metaReserva = despesasMesAtual * 6;
    const progresso = metaReserva > 0 ? Math.min((reservaEmergencia / metaReserva) * 100, 100) : 0;
    
    document.getElementById('total-reserva').textContent = formatarMoeda(reservaEmergencia);
    document.getElementById('meta-reserva').textContent = formatarMoeda(metaReserva);
    document.getElementById('progress-reserva').style.width = progresso + '%';
}

function updateGraficoCategorias() {
    const ctx = document.getElementById('graficoCategorias');
    if (!ctx) return;
    
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    
    const despesasPorCategoria = {};
    const categorias = {
        'alimentacao': '🍽️ Alimentação',
        'transporte': '🚗 Transporte',
        'casa': '🏠 Casa',
        'saude': '💊 Saúde',
        'lazer': '🎮 Lazer',
        'roupas': '👕 Roupas',
        'internet': '🌐 Internet/Fibra',
        'telefone': '📱 Telefone Móvel',
        'cartao': '💳 Cartão de Crédito',
        'estudos': '📚 Estudos',
        'outros': '📦 Outros'
    };
    
    lancamentos
        .filter(l => {
            const dataLancamento = new Date(l.data + 'T00:00:00');
            return l.tipo === 'despesa' && l.categoria && 
                   dataLancamento.getMonth() === mesAtual && 
                   dataLancamento.getFullYear() === anoAtual;
        })
        .forEach(l => {
            despesasPorCategoria[l.categoria] = (despesasPorCategoria[l.categoria] || 0) + l.valor;
        });
    
    const labels = Object.keys(despesasPorCategoria).map(key => categorias[key] || key);
    const valores = Object.values(despesasPorCategoria);
    
    if (graficoCategorias) {
        graficoCategorias.destroy();
    }
    
    if (valores.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    graficoCategorias = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: [
                    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
                    '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff',
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

function editarLancamento(id) {
    const lancamento = lancamentos.find(l => l.id === id);
    if (!lancamento) return;
    
    // Preencher formulário
    document.getElementById('descricao').value = lancamento.descricao;
    document.getElementById('valor').value = lancamento.valor;
    document.getElementById('tipo').value = lancamento.tipo;
    document.getElementById('data').value = lancamento.data;
    
    // Mostrar categoria se for despesa
    if (lancamento.tipo === 'despesa') {
        document.getElementById('categoria-group').style.display = 'block';
        document.getElementById('categoria').value = lancamento.categoria || 'outros';
        document.getElementById('categoria').required = true;
    }
    
    // Alterar estado para edição
    editandoId = id;
    document.querySelector('#form-lancamento button[type="submit"]').textContent = 'Atualizar Lançamento';
    document.getElementById('btn-cancelar').style.display = 'inline-block';
    
    // Ir para aba de lançamentos
    showTab('lancamentos');
    document.querySelector('.tab-btn[onclick="showTab(\'lancamentos\')"]').classList.add('active');
}

async function excluirLancamento(id) {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
        lancamentos = lancamentos.filter(l => l.id !== id);
        await salvarDados();
        updateDashboard();
        renderLancamentos();
        setupFiltroMes();
        showNotification('Lançamento excluído com sucesso!');
    }
}

function cancelarEdicao() {
    editandoId = null;
    document.getElementById('form-lancamento').reset();
    document.getElementById('categoria-group').style.display = 'none';
    setDataAtual();
    document.querySelector('#form-lancamento button[type="submit"]').textContent = 'Adicionar Lançamento';
    document.getElementById('btn-cancelar').style.display = 'none';
}

function verificarDuplicata(descricao, valor, tipo, data) {
    return lancamentos.some(l => 
        l.descricao.toLowerCase() === descricao.toLowerCase() &&
        l.valor === valor &&
        l.tipo === tipo &&
        l.data === data
    );
}

function togglePago(id) {
    const lancamento = lancamentos.find(l => l.id === id);
    if (lancamento) {
        lancamento.pago = !lancamento.pago;
        salvarDados();
        updateDashboard();
        renderLancamentos();
        showNotification(lancamento.pago ? '✅ Conta marcada como paga!' : '⏳ Conta desmarcada');
    }
}

function adicionarControlesBackup() {
    const header = document.querySelector('header');
    const backupDiv = document.createElement('div');
    backupDiv.innerHTML = `
        <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button onclick="configurarNuvem()" class="btn-primary btn-small" id="btn-nuvem">
                ${api.autoSync ? '🌍 Nuvem Ativa' : '☁️ Configurar Nuvem'}
            </button>

        </div>
    `;
    header.appendChild(backupDiv);
}

function configurarNuvem() {
    if (api.autoSync) {
        if (confirm('Desabilitar sincronização automática?')) {
            api.desabilitarSincronizacao();
            document.getElementById('btn-nuvem').innerHTML = '☁️ Configurar Nuvem';
            showNotification('🚫 Sincronização desabilitada');
        }
    } else {
        const token = prompt('Cole seu GitHub Personal Access Token:\n\n1. Acesse: github.com/settings/tokens\n2. Gere um token com permissão "gist"\n3. Cole aqui:');
        if (token) {
            api.configurarSincronizacao(token);
            document.getElementById('btn-nuvem').innerHTML = '🌍 Nuvem Ativa';
            showNotification('✨ Sincronização ativada!');
            // Fazer primeira sincronização
            salvarDados();
        }
    }
}



function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #00d4ff, #5a67d8);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}