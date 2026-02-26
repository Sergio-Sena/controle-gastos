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
    
    const dados = await api.carregarDados();
    lancamentos = dados.lancamentos;
    reservaEmergencia = dados.reservaEmergencia;
    
    setupEventListeners();
    updateDashboard();
    renderLancamentos();
    setupFiltroMes();
    setDataAtual();
    setupGestaDividas();
    
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
        
        // Categorias de despesas
        document.getElementById('categoria').innerHTML = `
            <option value="alimentacao">🍽️ Alimentação</option>
            <option value="transporte">🚗 Transporte</option>
            <option value="casa">🏠 Casa</option>
            <option value="saude">💊 Saúde</option>
            <option value="lazer">🎮 Lazer</option>
            <option value="roupas">👕 Roupas</option>
            <option value="internet">🌐 Internet/Fibra</option>
            <option value="telefone">📱 Telefone Móvel</option>
            <option value="cartao">💳 Cartão de Crédito</option>
            <option value="estudos">📚 Estudos</option>
            <option value="outros">📦 Outros</option>
        `;
    } else if (tipo === 'receita') {
        categoriaGroup.style.display = 'block';
        recorrenteGroup.style.display = 'block';
        document.getElementById('categoria').required = true;
        
        // Categorias de receitas
        document.getElementById('categoria').innerHTML = `
            <option value="salario">💼 Salário</option>
            <option value="freelance">💻 Freelance</option>
            <option value="bonus">🎁 Bônus/13º</option>
            <option value="investimentos">📈 Investimentos</option>
            <option value="aluguel">🏠 Aluguel Recebido</option>
            <option value="vendas">🛒 Vendas</option>
            <option value="pensao">👨‍👩‍👧‍👦 Pensão/Aposentadoria</option>
            <option value="emprestimo">💰 Empréstimo Recebido</option>
            <option value="outros">📦 Outras Receitas</option>
        `;
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
    const categoria = document.getElementById('categoria').value || null;
    const recorrente = document.getElementById('recorrente').checked;
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
            // Categorias de despesas
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
            // Categorias de receitas
            'salario': '💼 Salário',
            'freelance': '💻 Freelance',
            'bonus': '🎁 Bônus/13º',
            'investimentos': '📈 Investimentos',
            'aluguel': '🏠 Aluguel Recebido',
            'vendas': '🛒 Vendas',
            'pensao': '👨👩👧👦 Pensão/Aposentadoria',
            'emprestimo': '💰 Empréstimo Recebido',
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

// ===== TRADER BOT FUNCTIONS =====
let trades = JSON.parse(localStorage.getItem('trades')) || [];

// Inicializar Trader Bot
document.addEventListener('DOMContentLoaded', function() {
    setupTraderBot();
});

function setupTraderBot() {
    const formTrade = document.getElementById('form-trade');
    if (formTrade) {
        formTrade.addEventListener('submit', adicionarTrade);
        setDataTradeAtual();
        updateResumoTrader();
        renderTrades();
        setupFiltrosTrade();
        
        // Adicionar botão de importação
        adicionarBotaoImportacao();
    }
}

function updateHistoricoDepositos() {
    const container = document.getElementById('historico-depositos');
    const depositos = trades.filter(t => t.tipo === 'deposito')
        .sort((a, b) => new Date(b.data) - new Date(a.data));
    
    if (depositos.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum depósito encontrado</p>';
        return;
    }
    
    let saldoAcumulado = 0;
    
    container.innerHTML = depositos.map(d => {
        saldoAcumulado += d.valorUsd;
        const dataFormatada = new Date(d.data).toLocaleDateString('pt-BR');
        
        return `
            <div class="lancamento-item positive">
                <div class="lancamento-info">
                    <h4>💰 Depósito</h4>
                    <small>${dataFormatada}</small>
                </div>
                <div class="lancamento-valor positive">
                    +$${d.valorUsd.toFixed(2)}<br>
                    <small>R$ ${d.valorBrl.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</small><br>
                    <small style="color: #00d4ff;">Saldo: $${saldoAcumulado.toFixed(2)}</small>
                </div>
            </div>
        `;
    }).join('');
}

function adicionarBotaoImportacao() {
    const formSection = document.querySelector('#traderbot .form-section');
    if (formSection && !document.getElementById('btn-importar')) {
        const botaoImportar = document.createElement('button');
        botaoImportar.id = 'btn-importar';
        botaoImportar.type = 'button';
        botaoImportar.className = 'btn-secondary';
        botaoImportar.style.marginTop = '10px';
        botaoImportar.textContent = '📥 Importar Extrato Completo';
        botaoImportar.onclick = importarExtrato;
        
        const botaoDebug = document.createElement('button');
        botaoDebug.type = 'button';
        botaoDebug.className = 'btn-secondary';
        botaoDebug.style.marginTop = '10px';
        botaoDebug.style.marginLeft = '10px';
        botaoDebug.textContent = '🔍 Debug Dados';
        botaoDebug.onclick = debugTrades;
        
        const botaoLimpar = document.createElement('button');
        botaoLimpar.type = 'button';
        botaoLimpar.className = 'btn-secondary';
        botaoLimpar.style.marginTop = '10px';
        botaoLimpar.style.marginLeft = '10px';
        botaoLimpar.style.backgroundColor = '#dc2626';
        botaoLimpar.textContent = '🗑️ Limpar e Reimportar';
        botaoLimpar.onclick = limparEReimortar;
        
        formSection.appendChild(botaoImportar);
        formSection.appendChild(botaoDebug);
        formSection.appendChild(botaoLimpar);
    }
}

function debugTrades() {
    console.log('=== DEBUG TRADER BOT ===');
    console.log('Total de trades:', trades.length);
    
    const depositos = trades.filter(t => t.tipo === 'deposito');
    const tradesOp = trades.filter(t => t.tipo === 'trade');
    
    console.log('\n=== DEPÓSITOS ===');
    console.log('Quantidade:', depositos.length);
    depositos.forEach((d, i) => {
        console.log(`${i+1}. $${d.valorUsd} em ${d.data} (ID: ${d.id})`);
    });
    
    console.log('\n=== TRADES ===');
    console.log('Quantidade:', tradesOp.length);
    const won = tradesOp.filter(t => t.resultado === 'WON');
    const lost = tradesOp.filter(t => t.resultado === 'LOST');
    
    console.log('WON:', won.length);
    won.forEach(t => console.log(`  ${t.ativo} ${t.operacao} WON: $${t.valorUsd}`));
    
    console.log('LOST:', lost.length);
    lost.forEach(t => console.log(`  ${t.ativo} ${t.operacao} LOST: $${t.valorUsd}`));
    
    const totalDep = depositos.reduce((sum, t) => sum + t.valorUsd, 0);
    const totalWon = won.reduce((sum, t) => sum + t.valorUsd, 0);
    const totalLost = lost.reduce((sum, t) => sum + t.valorUsd, 0);
    
    console.log('\n=== TOTAIS ===');
    console.log(`Depósitos: $${totalDep}`);
    console.log(`Ganhos: $${totalWon}`);
    console.log(`Perdas: $${totalLost}`);
    console.log(`Saldo Final: $${totalDep + totalWon - totalLost}`);
    
    alert(`Problema encontrado!\n\nDepósitos: ${depositos.length} (deveria ser 2)\nTotal: $${totalDep} (deveria ser $58.68)\n\nVerifique o console para detalhes.`);
}

// ===== GESTÃO DE DÍVIDAS =====
let dividas = JSON.parse(localStorage.getItem('dividas')) || [];

// Inicializar Gestão de Dívidas
document.addEventListener('DOMContentLoaded', function() {
    setupGestaDividas();
});

function setupGestaDividas() {
    const formDivida = document.getElementById('form-divida');
    const formParcelamento = document.getElementById('form-parcelamento-inteligente');
    
    if (formDivida) {
        formDivida.addEventListener('submit', adicionarDivida);
        updateResumoDividas();
        renderTabelaDividas();
        setupFiltrosDividas();
    }
    
    if (formParcelamento) {
        formParcelamento.addEventListener('submit', processarParcelamentoInteligente);
        
        // Preview em tempo real
        const inputs = ['item-parcelado', 'data-compra', 'valor-total-parcelado', 'total-parcelas-inteligente', 'dia-vencimento'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', mostrarPreviewParcelamento);
            }
        });
    }
}

function adicionarDivida(e) {
    e.preventDefault();
    
    const credor = document.getElementById('credor').value;
    const valorTotal = parseFloat(document.getElementById('valor-total').value);
    const parcelaAtual = parseInt(document.getElementById('parcela-atual').value);
    const totalParcelas = parseInt(document.getElementById('total-parcelas').value);
    const valorParcela = parseFloat(document.getElementById('valor-parcela').value);
    const taxaJuros = parseFloat(document.getElementById('taxa-juros').value) || 0;
    const vencimento = document.getElementById('vencimento').value;
    const status = document.getElementById('status-divida').value;
    
    const divida = {
        id: Date.now(),
        credor,
        valorTotal,
        parcelaAtual,
        totalParcelas,
        valorParcela,
        taxaJuros,
        vencimento,
        status,
        prioridade: calcularPrioridade(taxaJuros, status),
        timestamp: new Date().toISOString()
    };
    
    dividas.push(divida);
    salvarDividas();
    
    document.getElementById('form-divida').reset();
    updateResumoDividas();
    renderTabelaDividas();
    updateEstrategiaQuitacao();
    showNotification('Dívida adicionada com sucesso!');
}

function calcularPrioridade(taxaJuros, status) {
    if (taxaJuros > 5 || status === 'atrasado') return 'maxima';
    if (taxaJuros === 0 && status === 'em-dia') return 'estrategica';
    return 'negociacao';
}

function salvarDividas() {
    localStorage.setItem('dividas', JSON.stringify(dividas));
}

function updateResumoDividas() {
    const totalDividas = dividas.reduce((sum, d) => sum + d.valorTotal, 0);
    const totalParcelasMes = dividas.reduce((sum, d) => sum + d.valorParcela, 0);
    const dividasAtrasadas = dividas.filter(d => d.status === 'atrasado').length;
    const proximosVencimentos = dividas.filter(d => {
        const hoje = new Date();
        const venc = new Date(d.vencimento);
        const diffDias = (venc - hoje) / (1000 * 60 * 60 * 24);
        return diffDias <= 7 && diffDias >= 0;
    }).length;
    
    document.getElementById('total-dividas').textContent = formatarMoeda(totalDividas);
    document.getElementById('total-parcelas-mes').textContent = formatarMoeda(totalParcelasMes);
    document.getElementById('dividas-atrasadas').textContent = dividasAtrasadas;
    document.getElementById('proximos-vencimentos').textContent = proximosVencimentos;
}

function renderTabelaDividas() {
    const container = document.getElementById('tabela-dividas');
    const filtroPrioridade = document.getElementById('filtro-prioridade')?.value || '';
    const filtroStatus = document.getElementById('filtro-status')?.value || '';
    
    let dividasFiltradas = [...dividas];
    
    if (filtroPrioridade) {
        dividasFiltradas = dividasFiltradas.filter(d => d.prioridade === filtroPrioridade);
    }
    
    if (filtroStatus) {
        dividasFiltradas = dividasFiltradas.filter(d => d.status === filtroStatus);
    }
    
    // Ordenar por prioridade
    const ordemPrioridade = { 'maxima': 1, 'negociacao': 2, 'estrategica': 3 };
    dividasFiltradas.sort((a, b) => ordemPrioridade[a.prioridade] - ordemPrioridade[b.prioridade]);
    
    if (dividasFiltradas.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma dívida encontrada</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="dividas-table-content">
            <thead>
                <tr>
                    <th>Credor</th>
                    <th>Valor Total</th>
                    <th>Parcelas</th>
                    <th>Valor/Mês</th>
                    <th>Juros</th>
                    <th>Status</th>
                    <th>Prioridade</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${dividasFiltradas.map(d => {
                    const statusIcon = {
                        'em-dia': '✅',
                        'proximo-vencimento': '⚠️',
                        'atrasado': '🔴'
                    };
                    
                    const prioridadeClass = {
                        'maxima': 'prioridade-maxima',
                        'negociacao': 'prioridade-negociacao',
                        'estrategica': 'prioridade-estrategica'
                    };
                    
                    const prioridadeText = {
                        'maxima': '🔥 Máxima',
                        'negociacao': '💬 Negociação',
                        'estrategica': '📊 Estratégica'
                    };
                    
                    return `
                        <tr class="${prioridadeClass[d.prioridade]}">
                            <td><strong>${d.credor}</strong></td>
                            <td>${formatarMoeda(d.valorTotal)}</td>
                            <td>${d.parcelaAtual}/${d.totalParcelas}</td>
                            <td>${formatarMoeda(d.valorParcela)}</td>
                            <td>${d.taxaJuros}%</td>
                            <td>${statusIcon[d.status]} ${d.status.replace('-', ' ')}</td>
                            <td>${prioridadeText[d.prioridade]}</td>
                            <td>
                                <button class="btn-primary btn-small" onclick="pagarParcela(${d.id})">💰 Pagar</button>
                                <button class="btn-primary btn-small btn-delete" onclick="excluirDivida(${d.id})">🗑️</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function updateEstrategiaQuitacao() {
    const container = document.getElementById('estrategia-quitacao');
    
    if (dividas.length === 0) {
        container.innerHTML = '<p class="empty-state">Adicione dívidas para ver sugestões de quitação</p>';
        return;
    }
    
    const dividasMaxima = dividas.filter(d => d.prioridade === 'maxima');
    const dividasAtrasadas = dividas.filter(d => d.status === 'atrasado');
    
    let estrategia = '<div class="estrategia-list">';
    
    if (dividasAtrasadas.length > 0) {
        estrategia += `
            <div class="estrategia-item urgente">
                <h4>🚨 URGENTE - Dívidas Atrasadas</h4>
                <p>Você tem ${dividasAtrasadas.length} dívida(s) atrasada(s). Priorize o pagamento imediatamente para evitar juros e negativação.</p>
                <ul>
                    ${dividasAtrasadas.map(d => `<li>${d.credor}: ${formatarMoeda(d.valorParcela)}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (dividasMaxima.length > 0) {
        estrategia += `
            <div class="estrategia-item prioridade">
                <h4>🔥 Prioridade Máxima</h4>
                <p>Foque nestas dívidas com juros altos primeiro:</p>
                <ul>
                    ${dividasMaxima.map(d => `<li>${d.credor}: ${d.taxaJuros}% a.m. - ${formatarMoeda(d.valorParcela)}/mês</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    const totalMensal = dividas.reduce((sum, d) => sum + d.valorParcela, 0);
    estrategia += `
        <div class="estrategia-item info">
            <h4>💡 Dica de Gestão</h4>
            <p>Comprometimento mensal: ${formatarMoeda(totalMensal)}</p>
            <p>Se tiver dinheiro extra, aplique primeiro nas dívidas com juros mais altos para economizar no longo prazo.</p>
        </div>
    `;
    
    estrategia += '</div>';
    container.innerHTML = estrategia;
}

function setupFiltrosDividas() {
    const filtroPrioridade = document.getElementById('filtro-prioridade');
    const filtroStatus = document.getElementById('filtro-status');
    
    if (filtroPrioridade) {
        filtroPrioridade.addEventListener('change', renderTabelaDividas);
    }
    
    if (filtroStatus) {
        filtroStatus.addEventListener('change', renderTabelaDividas);
    }
}

function pagarParcela(id) {
    const divida = dividas.find(d => d.id === id);
    if (!divida) return;
    
    if (confirm(`Confirmar pagamento de ${formatarMoeda(divida.valorParcela)} para ${divida.credor}?`)) {
        divida.parcelaAtual++;
        
        if (divida.parcelaAtual > divida.totalParcelas) {
            // Dívida quitada
            dividas = dividas.filter(d => d.id !== id);
            showNotification(`🎉 Parabéns! Dívida ${divida.credor} quitada!`);
        } else {
            // Atualizar próximo vencimento (assumindo mensal)
            const proximoVenc = new Date(divida.vencimento);
            proximoVenc.setMonth(proximoVenc.getMonth() + 1);
            divida.vencimento = proximoVenc.toISOString().split('T')[0];
            divida.status = 'em-dia';
            showNotification(`Parcela paga! Restam ${divida.totalParcelas - divida.parcelaAtual + 1} parcelas.`);
        }
        
        salvarDividas();
        updateResumoDividas();
        renderTabelaDividas();
        updateEstrategiaQuitacao();
    }
}

function excluirDivida(id) {
    if (confirm('Tem certeza que deseja excluir esta dívida?')) {
        dividas = dividas.filter(d => d.id !== id);
        salvarDividas();
        updateResumoDividas();
        renderTabelaDividas();
        updateEstrategiaQuitacao();
        showNotification('Dívida excluída com sucesso!');
    }
}

// ===== PARCELAMENTO INTELIGENTE =====

function mostrarPreviewParcelamento() {
    const item = document.getElementById('item-parcelado').value;
    const dataCompra = document.getElementById('data-compra').value;
    const valorTotal = parseFloat(document.getElementById('valor-total-parcelado').value);
    const totalParcelas = parseInt(document.getElementById('total-parcelas-inteligente').value);
    const diaVencimento = parseInt(document.getElementById('dia-vencimento').value);
    
    if (!item || !dataCompra || !valorTotal || !totalParcelas || !diaVencimento) {
        document.getElementById('preview-parcelamento').style.display = 'none';
        return;
    }
    
    const resultado = calcularParcelamentoInteligente(dataCompra, totalParcelas, valorTotal, diaVencimento);
    
    document.getElementById('info-parcelamento').innerHTML = `
        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
            <p><strong>📅 Parcelas Pagas:</strong> ${resultado.parcelasPagas} de ${totalParcelas}</p>
            <p><strong>💰 Valor por Parcela:</strong> ${formatarMoeda(resultado.valorParcela)}</p>
            <p><strong>✅ Já Pago:</strong> ${formatarMoeda(resultado.valorPago)}</p>
            <p><strong>⏳ Restante:</strong> ${formatarMoeda(resultado.valorRestante)}</p>
            <p><strong>📋 Próximo Vencimento:</strong> ${formatarData(resultado.proximoVencimento)}</p>
            <hr style="margin: 10px 0; border-color: rgba(255,255,255,0.3);">
            <p style="font-size: 12px; opacity: 0.8;">
                🤖 <strong>O que será criado:</strong><br>
                • ${resultado.parcelasPagas} lançamentos no histórico (parcelas pagas)<br>
                • 1 dívida ativa com ${resultado.parcelasRestantes} parcelas restantes
            </p>
        </div>
    `;
    
    document.getElementById('preview-parcelamento').style.display = 'block';
}

function calcularParcelamentoInteligente(dataCompra, totalParcelas, valorTotal, diaVencimento) {
    const hoje = new Date();
    const compra = new Date(dataCompra);
    const valorParcela = valorTotal / totalParcelas;
    
    // Calcular primeira parcela (mês seguinte à compra)
    const primeiraParcela = new Date(compra.getFullYear(), compra.getMonth() + 1, diaVencimento);
    
    // Calcular quantas parcelas já venceram
    let parcelasPagas = 0;
    let dataVencimento = new Date(primeiraParcela);
    
    while (dataVencimento <= hoje && parcelasPagas < totalParcelas) {
        parcelasPagas++;
        dataVencimento.setMonth(dataVencimento.getMonth() + 1);
    }
    
    // Próximo vencimento
    const proximoVencimento = new Date(primeiraParcela);
    proximoVencimento.setMonth(proximoVencimento.getMonth() + parcelasPagas);
    
    return {
        parcelasPagas: parcelasPagas,
        parcelasRestantes: totalParcelas - parcelasPagas,
        valorParcela: valorParcela,
        valorPago: parcelasPagas * valorParcela,
        valorRestante: (totalParcelas - parcelasPagas) * valorParcela,
        proximoVencimento: proximoVencimento.toISOString().split('T')[0],
        primeiraParcela: primeiraParcela
    };
}

async function processarParcelamentoInteligente(e) {
    e.preventDefault();
    
    const item = document.getElementById('item-parcelado').value;
    const dataCompra = document.getElementById('data-compra').value;
    const valorTotal = parseFloat(document.getElementById('valor-total-parcelado').value);
    const totalParcelas = parseInt(document.getElementById('total-parcelas-inteligente').value);
    const diaVencimento = parseInt(document.getElementById('dia-vencimento').value);
    const categoria = document.getElementById('categoria-parcelado').value;
    
    const resultado = calcularParcelamentoInteligente(dataCompra, totalParcelas, valorTotal, diaVencimento);
    
    if (!confirm(`🤖 Confirmar Processamento Inteligente?\n\n📦 Item: ${item}\n💰 Total: ${formatarMoeda(valorTotal)}\n📅 Parcelas: ${totalParcelas}x de ${formatarMoeda(resultado.valorParcela)}\n\n✅ Serão criados ${resultado.parcelasPagas} lançamentos no histórico\n⏳ Restam ${resultado.parcelasRestantes} parcelas para pagar\n\nContinuar?`)) {
        return;
    }
    
    // 1. Criar lançamentos históricos das parcelas pagas
    const primeiraParcela = resultado.primeiraParcela;
    
    for (let i = 0; i < resultado.parcelasPagas; i++) {
        const dataVencimento = new Date(primeiraParcela);
        dataVencimento.setMonth(dataVencimento.getMonth() + i);
        
        const lancamento = {
            id: Date.now() + i,
            descricao: `${item} - Parcela ${i + 1}/${totalParcelas}`,
            valor: resultado.valorParcela,
            tipo: 'despesa',
            categoria: categoria,
            data: dataVencimento.toISOString().split('T')[0],
            pago: true, // Marcar como pago
            timestamp: new Date().toISOString(),
            parcelamentoInteligente: true
        };
        
        lancamentos.push(lancamento);
    }
    
    // 2. Criar dívida para parcelas restantes (se houver)
    if (resultado.parcelasRestantes > 0) {
        const divida = {
            id: Date.now() + 1000,
            credor: item,
            valorTotal: resultado.valorRestante,
            parcelaAtual: resultado.parcelasPagas + 1,
            totalParcelas: totalParcelas,
            valorParcela: resultado.valorParcela,
            taxaJuros: 0,
            vencimento: resultado.proximoVencimento,
            status: 'em-dia',
            prioridade: 'estrategica',
            timestamp: new Date().toISOString(),
            parcelamentoInteligente: true
        };
        
        dividas.push(divida);
        salvarDividas();
    }
    
    // 3. Salvar e atualizar interface
    await salvarDados();
    updateDashboard();
    renderLancamentos();
    setupFiltroMes();
    updateResumoDividas();
    renderTabelaDividas();
    updateEstrategiaQuitacao();
    
    // 4. Limpar formulário
    document.getElementById('form-parcelamento-inteligente').reset();
    document.getElementById('preview-parcelamento').style.display = 'none';
    
    showNotification(`🤖 Processamento concluído! ${resultado.parcelasPagas} parcelas adicionadas ao histórico e ${resultado.parcelasRestantes} parcelas na gestão de dívidas.`);
}

// ===== CONSULTOR FINANCEIRO IA =====

function mostrarLancamentoManual() {
    console.log('🔍 Tentando mostrar lançamento manual...');
    
    // Aguardar um pouco para garantir que o DOM está carregado
    setTimeout(() => {
        const lancamentoManual = document.getElementById('lancamento-manual');
        const resultadoConsultoria = document.getElementById('resultado-consultoria');
        
        console.log('Elementos encontrados:', {
            lancamentoManual: !!lancamentoManual,
            resultadoConsultoria: !!resultadoConsultoria
        });
        
        if (lancamentoManual) {
            lancamentoManual.style.display = 'block';
            console.log('✅ Formulário manual exibido');
        } else {
            console.error('❌ Elemento lancamento-manual não encontrado');
            // Tentar criar o elemento se não existir
            criarFormularioManual();
        }
        
        if (resultadoConsultoria) {
            resultadoConsultoria.style.display = 'none';
        }
        
        // Setup do formulário
        const form = document.getElementById('form-consultoria');
        if (form && !form.hasEventListener) {
            form.addEventListener('submit', processarConsultoriaManual);
            form.hasEventListener = true;
            console.log('📝 Event listener adicionado ao formulário');
        }
    }, 100);
}

function criarFormularioManual() {
    console.log('🔧 Criando formulário manual...');
    const consultorTab = document.getElementById('consultor');
    if (!consultorTab) {
        console.error('❌ Tab consultor não encontrada');
        return;
    }
    
    // Verificar se já existe
    if (document.getElementById('lancamento-manual')) {
        return;
    }
    
    const formularioHTML = `
        <div id="lancamento-manual" class="card" style="display: none;">
            <h3>📝 Informe seus Dados Financeiros</h3>
            <form id="form-consultoria">
                <div class="form-group">
                    <label for="renda-mensal">Renda Mensal Total:</label>
                    <input type="number" id="renda-mensal" step="0.01" placeholder="Ex: 4500.00" required>
                </div>
                
                <div class="form-group">
                    <label>Dívidas (uma por linha - você pode lançar várias de uma vez):</label>
                    <textarea id="dividas-texto" rows="4" placeholder="Exemplo (cada dívida em uma linha):\nCartão Nubank - R$ 2500\nEmpréstimo Banco - R$ 15000\nFinanciamento Carro - R$ 25000" style="width: 100%; padding: 10px; border-radius: 5px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white;"></textarea>
                </div>
                
                <div class="form-group">
                    <label>Despesas Fixas (uma por linha):</label>
                    <textarea id="despesas-fixas" rows="3" placeholder="Exemplo:\nAluguel - R$ 800\nInternet - R$ 100\nPlano Celular - R$ 50" style="width: 100%; padding: 10px; border-radius: 5px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white;"></textarea>
                </div>
                
                <div class="form-group">
                    <label>Despesas Variáveis (uma por linha):</label>
                    <textarea id="despesas-variaveis" rows="3" placeholder="Exemplo:\nAlimentação - R$ 600\nTransporte - R$ 200\nLazer - R$ 300" style="width: 100%; padding: 10px; border-radius: 5px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white;"></textarea>
                </div>
                
                <button type="submit" class="btn-primary" style="width: 100%; margin-top: 15px;">🎯 Gerar Plano de Ação</button>
            </form>
        </div>
        
        <div id="resultado-consultoria" class="card" style="display: none;">
            <h3>🎯 Seu Plano de Ação Personalizado</h3>
            <div id="plano-acao"></div>
            <button onclick="mostrarLancamentoManual()" class="btn-secondary" style="margin-top: 15px;">📝 Editar Dados</button>
        </div>
    `;
    
    // Inserir após o primeiro card
    const primeiroCard = consultorTab.querySelector('.card');
    if (primeiroCard) {
        primeiroCard.insertAdjacentHTML('afterend', formularioHTML);
        console.log('✅ Formulário manual criado');
    }
}

function gerarConsultoriaAutomatica() {
    console.log('🤖 Gerando consultoria automática...');
    
    const lancamentoManual = document.getElementById('lancamento-manual');
    if (lancamentoManual) {
        lancamentoManual.style.display = 'none';
    }
    
    try {
        const dadosAutomaticos = coletarDadosDoSistema();
        console.log('📊 Dados coletados:', dadosAutomaticos);
        
        if (dadosAutomaticos.rendaMensal === 0 && dadosAutomaticos.dividas.length === 0) {
            showNotification('⚠️ Nenhum dado encontrado! Adicione lançamentos ou use o formulário manual.');
            return;
        }
        
        const plano = gerarPlanoDeAcao(dadosAutomaticos);
        
        const planoElement = document.getElementById('plano-acao');
        const resultadoElement = document.getElementById('resultado-consultoria');
        
        if (planoElement && resultadoElement) {
            planoElement.innerHTML = plano;
            resultadoElement.style.display = 'block';
            showNotification('🤖 Consultoria gerada com base nos seus dados!');
        } else {
            console.error('❌ Elementos de resultado não encontrados');
            showNotification('⚠️ Erro na interface. Tente recarregar a página.');
        }
    } catch (error) {
        console.error('Erro na consultoria automática:', error);
        showNotification('⚠️ Erro: Adicione alguns lançamentos primeiro!');
    }
}

function processarConsultoriaManual(e) {
    e.preventDefault();
    
    try {
        const rendaMensal = parseFloat(document.getElementById('renda-mensal').value);
        const dividasTexto = document.getElementById('dividas-texto').value;
        const despesasFixas = document.getElementById('despesas-fixas').value;
        const despesasVariaveis = document.getElementById('despesas-variaveis').value;
        
        if (!rendaMensal || rendaMensal <= 0) {
            showNotification('⚠️ Por favor, informe uma renda mensal válida!');
            return;
        }
        
        const dados = {
            rendaMensal: rendaMensal,
            dividas: parsearTextoFinanceiro(dividasTexto),
            despesasFixas: parsearTextoFinanceiro(despesasFixas),
            despesasVariaveis: parsearTextoFinanceiro(despesasVariaveis)
        };
        
        const plano = gerarPlanoDeAcao(dados);
        
        document.getElementById('plano-acao').innerHTML = plano;
        document.getElementById('resultado-consultoria').style.display = 'block';
        document.getElementById('lancamento-manual').style.display = 'none';
        
        showNotification('🎯 Plano de ação gerado com sucesso!');
    } catch (error) {
        console.error('Erro no processamento manual:', error);
        showNotification('⚠️ Erro ao processar dados. Verifique o formato!');
    }
}

function parsearTextoFinanceiro(texto) {
    const linhas = texto.split('\n').filter(linha => linha.trim());
    const itens = [];
    
    linhas.forEach(linha => {
        const match = linha.match(/(.+?)\s*-\s*R\$\s*([\d.,]+)/i);
        if (match) {
            const nome = match[1].trim();
            const valor = parseFloat(match[2].replace(',', '.'));
            itens.push({ nome, valor });
        }
    });
    
    return itens;
}

function coletarDadosDoSistema() {
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    
    // Receitas do mês
    const receitas = lancamentos
        .filter(l => {
            const dataLancamento = new Date(l.data + 'T00:00:00');
            return l.tipo === 'receita' && 
                   dataLancamento.getMonth() === mesAtual && 
                   dataLancamento.getFullYear() === anoAtual;
        })
        .reduce((sum, l) => sum + l.valor, 0);
    
    // Despesas por categoria
    const despesasPorCategoria = {};
    lancamentos
        .filter(l => {
            const dataLancamento = new Date(l.data + 'T00:00:00');
            return l.tipo === 'despesa' && 
                   dataLancamento.getMonth() === mesAtual && 
                   dataLancamento.getFullYear() === anoAtual;
        })
        .forEach(l => {
            const categoria = l.categoria || 'outros';
            despesasPorCategoria[categoria] = (despesasPorCategoria[categoria] || 0) + l.valor;
        });
    
    // Dívidas
    const dividasAtivas = dividas.map(d => ({
        nome: d.credor,
        valor: d.valorTotal,
        parcela: d.valorParcela,
        juros: d.taxaJuros,
        status: d.status
    }));
    
    return {
        rendaMensal: receitas,
        dividas: dividasAtivas,
        despesasFixas: Object.entries(despesasPorCategoria)
            .filter(([cat]) => ['casa', 'transporte', 'internet', 'telefone'].includes(cat))
            .map(([cat, valor]) => ({ nome: cat, valor })),
        despesasVariaveis: Object.entries(despesasPorCategoria)
            .filter(([cat]) => ['lazer', 'roupas', 'outros'].includes(cat))
            .map(([cat, valor]) => ({ nome: cat, valor }))
    };
}

function gerarPlanoDeAcao(dados) {
    const totalDividas = dados.dividas.reduce((sum, d) => sum + d.valor, 0);
    const totalDespesasFixas = dados.despesasFixas.reduce((sum, d) => sum + d.valor, 0);
    const totalDespesasVariaveis = dados.despesasVariaveis.reduce((sum, d) => sum + d.valor, 0);
    const totalGastos = totalDespesasFixas + totalDespesasVariaveis;
    const saldoMensal = dados.rendaMensal - totalGastos;
    const comprometimento = ((totalGastos / dados.rendaMensal) * 100).toFixed(1);
    
    let plano = `
        <div class="diagnostico" style="background: rgba(239, 68, 68, 0.2); padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
            <h4>🚨 DIAGNÓSTICO FINANCEIRO</h4>
            <p><strong>Renda Mensal:</strong> ${formatarMoeda(dados.rendaMensal)}</p>
            <p><strong>Gastos Totais:</strong> ${formatarMoeda(totalGastos)}</p>
            <p><strong>Saldo Mensal:</strong> <span class="${saldoMensal >= 0 ? 'positive' : 'negative'}">${formatarMoeda(saldoMensal)}</span></p>
            <p><strong>Comprometimento:</strong> ${comprometimento}% da renda</p>
            <p><strong>Total de Dívidas:</strong> ${formatarMoeda(totalDividas)}</p>
        </div>
    `;
    
    // Situação
    if (saldoMensal < 0) {
        plano += `
            <div class="situacao" style="background: rgba(239, 68, 68, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4>🚨 SITUAÇÃO CRÍTICA</h4>
                <p>Você está gastando <strong>${formatarMoeda(Math.abs(saldoMensal))}</strong> a mais do que ganha por mês!</p>
            </div>
        `;
    }
    
    // Cortes sugeridos
    plano += `
        <div class="cortes" style="background: rgba(251, 191, 36, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4>✂️ CORTES IMEDIATOS</h4>
    `;
    
    dados.despesasVariaveis.forEach(despesa => {
        const corte = despesa.valor * 0.5; // 50% de corte
        const novo = despesa.valor - corte;
        plano += `<p>• <strong>${despesa.nome}:</strong> Cortar 50% (${formatarMoeda(despesa.valor)} → ${formatarMoeda(novo)})</p>`;
    });
    
    plano += `</div>`;
    
    // Renegociação
    if (dados.dividas.length > 0) {
        plano += `
            <div class="renegociacao" style="background: rgba(59, 130, 246, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4>🤝 RENEGOCIAR URGENTE</h4>
        `;
        
        dados.dividas.forEach(divida => {
            if (divida.juros > 3 || divida.status === 'atrasado') {
                plano += `<p>• <strong>${divida.nome}:</strong> Renegociar juros e parcelamento</p>`;
            }
        });
        
        plano += `</div>`;
    }
    
    // Plano 3 meses
    plano += `
        <div class="plano-mensal" style="background: rgba(34, 197, 94, 0.2); padding: 15px; border-radius: 8px;">
            <h4>📅 PLANO 3 MESES</h4>
            
            <div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">
                <h5>📅 MÊS 1 - ESTABILIZAR</h5>
                <p>• Aplicar todos os cortes sugeridos</p>
                <p>• Renegociar dívidas com juros altos</p>
                <p>• Parar de usar cartão de crédito</p>
            </div>
            
            <div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">
                <h5>📅 MÊS 2 - ORGANIZAR</h5>
                <p>• Quitar dívidas menores primeiro</p>
                <p>• Manter os cortes do mês 1</p>
                <p>• Buscar renda extra se possível</p>
            </div>
            
            <div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">
                <h5>📅 MÊS 3 - SAIR DO VERMELHO</h5>
                <p>• Focar na maior dívida restante</p>
                <p>• Começar a formar reserva de emergência</p>
                <p>• Manter disciplina nos gastos</p>
            </div>
        </div>
    `;
    
    return plano;
}

function setDataTradeAtual() {
    const agora = new Date();
    const dataLocal = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000);
    document.getElementById('data-trade').value = dataLocal.toISOString().slice(0, 16);
}

function toggleTradeFields() {
    const tipo = document.getElementById('tipo-trade').value;
    const tradeFields = document.getElementById('trade-fields');
    
    if (tipo === 'trade') {
        tradeFields.style.display = 'block';
        document.getElementById('ativo-trade').required = true;
    } else {
        tradeFields.style.display = 'none';
        document.getElementById('ativo-trade').required = false;
    }
}

function adicionarTrade(e) {
    e.preventDefault();
    
    const tipo = document.getElementById('tipo-trade').value;
    const valorUsd = parseFloat(document.getElementById('valor-usd').value);
    const cotacao = parseFloat(document.getElementById('cotacao-dolar').value);
    const data = document.getElementById('data-trade').value;
    
    const trade = {
        id: Date.now(),
        tipo: tipo,
        valorUsd: valorUsd,
        valorBrl: valorUsd * cotacao,
        cotacao: cotacao,
        data: data,
        timestamp: new Date().toISOString()
    };
    
    if (tipo === 'trade') {
        trade.ativo = document.getElementById('ativo-trade').value;
        trade.operacao = document.getElementById('tipo-operacao').value;
        trade.resultado = document.getElementById('resultado-trade').value;
    }
    
    trades.push(trade);
    salvarTrades();
    
    document.getElementById('form-trade').reset();
    document.getElementById('trade-fields').style.display = 'none';
    setDataTradeAtual();
    
    updateResumoTrader();
    renderTrades();
    showNotification('Trade adicionado com sucesso!');
}

async function salvarTrades() {
    localStorage.setItem('trades', JSON.stringify(trades));
    
    // Sincronizar com a nuvem se estiver configurada
    if (api.autoSync && api.token) {
        const dadosCompletos = {
            lancamentos: lancamentos,
            reservaEmergencia: reservaEmergencia,
            trades: trades,
            timestamp: new Date().toISOString()
        };
        
        try {
            await api.salvarNaNuvem(dadosCompletos);
            showNotification('🌍 Trades sincronizados na nuvem!');
        } catch (error) {
            showNotification('⚠️ Erro na sincronização: ' + error.message);
        }
    }
}

function updateResumoTrader() {
    const depositos = trades.filter(t => t.tipo === 'deposito');
    const tradesOperacoes = trades.filter(t => t.tipo === 'trade');
    const saques = trades.filter(t => t.tipo === 'saque');
    
    // Debug: verificar se há trades
    console.log('Trades carregados:', trades.length);
    console.log('Depósitos:', depositos.length);
    console.log('Trades operações:', tradesOperacoes.length);
    
    const totalDepositado = depositos.reduce((sum, t) => sum + t.valorUsd, 0);
    const totalDepositadoBrl = depositos.reduce((sum, t) => sum + t.valorBrl, 0);
    
    const lucrosBrutos = tradesOperacoes
        .filter(t => t.resultado === 'WON')
        .reduce((sum, t) => sum + t.valorUsd, 0);
    
    const perdas = tradesOperacoes
        .filter(t => t.resultado === 'LOST')
        .reduce((sum, t) => sum + t.valorUsd, 0);
    
    const totalSacado = saques.reduce((sum, t) => sum + t.valorUsd, 0);
    
    // Debug: mostrar valores calculados
    console.log('Total depositado:', totalDepositado);
    console.log('Lucros brutos:', lucrosBrutos);
    console.log('Perdas:', perdas);
    
    // Saldo bruto = depósitos + lucros - perdas - saques
    const lucroLiquido = lucrosBrutos - perdas;
    const saldoBruto = totalDepositado + lucroLiquido - totalSacado;
    
    // Taxas calculadas apenas sobre valores positivos
    const taxaOperador = lucroLiquido > 0 ? lucroLiquido * 0.08 : 0;
    const taxaSaque = totalSacado > 0 ? totalSacado * 0.05 : 0;
    
    // Saldo líquido = saldo bruto - taxas
    const saldoLiquido = saldoBruto - taxaOperador - taxaSaque;
    
    const cotacaoMedia = trades.length > 0 ? 
        trades.reduce((sum, t) => sum + t.cotacao, 0) / trades.length : 5.50;
    
    // Atualizar interface
    document.getElementById('total-depositado').textContent = 
        `$${totalDepositado.toFixed(2)} (R$ ${totalDepositadoBrl.toLocaleString('pt-BR', {minimumFractionDigits: 2})})`;
    
    document.getElementById('lucro-bruto').textContent = 
        `$${lucroLiquido.toFixed(2)} (R$ ${(lucroLiquido * cotacaoMedia).toLocaleString('pt-BR', {minimumFractionDigits: 2})})`;
    
    document.getElementById('saldo-bruto').textContent = 
        `$${saldoBruto.toFixed(2)} (R$ ${(saldoBruto * cotacaoMedia).toLocaleString('pt-BR', {minimumFractionDigits: 2})})`;
    
    document.getElementById('taxa-operador').textContent = 
        `-$${taxaOperador.toFixed(2)} (R$ ${(taxaOperador * cotacaoMedia).toLocaleString('pt-BR', {minimumFractionDigits: 2})})`;
    
    document.getElementById('taxa-saque').textContent = 
        `-$${taxaSaque.toFixed(2)} (R$ ${(taxaSaque * cotacaoMedia).toLocaleString('pt-BR', {minimumFractionDigits: 2})})`;
    
    document.getElementById('saldo-liquido').textContent = 
        `$${saldoLiquido.toFixed(2)} (R$ ${(saldoLiquido * cotacaoMedia).toLocaleString('pt-BR', {minimumFractionDigits: 2})})`;
    
    // Colorir valores
    document.getElementById('lucro-bruto').className = lucroLiquido >= 0 ? 'value positive' : 'value negative';
    document.getElementById('saldo-bruto').className = saldoBruto >= 0 ? 'value positive' : 'value negative';
    document.getElementById('saldo-liquido').className = saldoLiquido >= 0 ? 'value positive' : 'value negative';
    
    // Atualizar histórico de depósitos
    updateHistoricoDepositos();
}

function renderTrades() {
    const container = document.getElementById('lista-trades');
    const filtroTipo = document.getElementById('filtro-tipo-trade')?.value || '';
    const filtroResultado = document.getElementById('filtro-resultado')?.value || '';
    const filtroData = document.getElementById('filtro-data')?.value || '';
    
    let tradesFiltrados = [...trades];
    
    if (filtroTipo) {
        tradesFiltrados = tradesFiltrados.filter(t => t.tipo === filtroTipo);
    }
    
    if (filtroResultado && filtroTipo === 'trade') {
        tradesFiltrados = tradesFiltrados.filter(t => t.resultado === filtroResultado);
    }
    
    if (filtroData) {
        tradesFiltrados = tradesFiltrados.filter(t => {
            const dataOperacao = new Date(t.data).toISOString().split('T')[0];
            return dataOperacao === filtroData;
        });
    }
    
    tradesFiltrados.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    if (tradesFiltrados.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma operação encontrada</p>';
        return;
    }
    
    // Calcular saldo após cada operação
    let saldoAcumulado = 0;
    const tradesComSaldo = [];
    
    // Ordenar por data para calcular saldo corretamente
    const tradesOrdenados = [...trades].sort((a, b) => new Date(a.data) - new Date(b.data));
    
    tradesOrdenados.forEach(t => {
        if (t.tipo === 'deposito') {
            saldoAcumulado += t.valorUsd;
        } else if (t.tipo === 'trade') {
            if (t.resultado === 'WON') {
                saldoAcumulado += t.valorUsd;
            } else {
                saldoAcumulado -= t.valorUsd;
            }
        } else if (t.tipo === 'saque') {
            saldoAcumulado -= t.valorUsd;
        }
        
        tradesComSaldo.push({...t, saldoApos: saldoAcumulado});
    });
    
    // Filtrar e renderizar
    const tradesFiltradosComSaldo = tradesComSaldo.filter(t => {
        let incluir = true;
        
        if (filtroTipo && t.tipo !== filtroTipo) incluir = false;
        if (filtroResultado && filtroTipo === 'trade' && t.resultado !== filtroResultado) incluir = false;
        if (filtroData) {
            const dataOperacao = new Date(t.data).toISOString().split('T')[0];
            if (dataOperacao !== filtroData) incluir = false;
        }
        
        return incluir;
    }).sort((a, b) => new Date(b.data) - new Date(a.data));
    
    container.innerHTML = tradesFiltradosComSaldo.map(t => {
        const dataFormatada = new Date(t.data).toLocaleDateString('pt-BR');
        const horaFormatada = new Date(t.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
        let icone = '';
        let classe = '';
        let sinal = '';
        
        if (t.tipo === 'deposito') {
            icone = '💰';
            classe = 'positive';
            sinal = '+';
        } else if (t.tipo === 'saque') {
            icone = '💸';
            classe = 'negative';
            sinal = '-';
        } else if (t.tipo === 'trade') {
            if (t.resultado === 'WON') {
                icone = '✅';
                classe = 'positive';
                sinal = '+';
            } else {
                icone = '❌';
                classe = 'negative';
                sinal = '-';
            }
        }
        
        return `
            <div class="lancamento-item ${classe}">
                <div class="lancamento-info">
                    <h4>${icone} ${t.tipo.toUpperCase()}${t.ativo ? ` - ${t.ativo}` : ''}</h4>
                    <small>${dataFormatada} ${horaFormatada}${t.operacao ? ` | ${t.operacao}` : ''}</small>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="lancamento-valor ${classe}">
                        ${sinal}$${t.valorUsd.toFixed(2)}<br>
                        <small>R$ ${t.valorBrl.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</small><br>
                        <small style="color: #00d4ff;">Saldo: $${t.saldoApos.toFixed(2)}</small>
                    </div>
                    <button class="btn-primary btn-small btn-delete" onclick="excluirTrade(${t.id})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function setupFiltrosTrade() {
    const filtroTipo = document.getElementById('filtro-tipo-trade');
    const filtroResultado = document.getElementById('filtro-resultado');
    const filtroData = document.getElementById('filtro-data');
    
    if (filtroTipo) {
        filtroTipo.addEventListener('change', renderTrades);
    }
    
    if (filtroResultado) {
        filtroResultado.addEventListener('change', renderTrades);
    }
    
    if (filtroData) {
        // Preencher opções de data
        const datasUnicas = [...new Set(trades.map(t => {
            return new Date(t.data).toISOString().split('T')[0];
        }))].sort().reverse();
        
        const optionsHtml = '<option value="">Todas as datas</option>' + 
            datasUnicas.map(data => {
                const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
                return `<option value="${data}">${dataFormatada}</option>`;
            }).join('');
        
        filtroData.innerHTML = optionsHtml;
        filtroData.addEventListener('change', renderTrades);
    }
}

function excluirTrade(id) {
    if (confirm('Tem certeza que deseja excluir este trade?')) {
        trades = trades.filter(t => t.id !== id);
        salvarTrades();
        updateResumoTrader();
        renderTrades();
        showNotification('Trade excluído com sucesso!');
    }
}

// Importar dados completos do extrato (sem duplicatas)
function importarExtrato() {
    const dadosExtrato = [
        // Depósitos (apenas 2)
        { tipo: 'deposito', valorUsd: 28.14, data: '2025-10-02T16:44:36', cotacao: 5.50 },
        { tipo: 'deposito', valorUsd: 30.54, data: '2025-10-07T18:36:55', cotacao: 5.50 },
        
        // Trades 02/10/2025 (APPLE.OTC)
        { tipo: 'trade', ativo: 'APPLE.OTC', operacao: 'BUY', resultado: 'WON', valorUsd: 6.40, data: '2025-10-02T21:31:09', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'APPLE.OTC', operacao: 'SELL', resultado: 'LOST', valorUsd: 8.00, data: '2025-10-02T21:29:09', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'APPLE.OTC', operacao: 'BUY', resultado: 'WON', valorUsd: 6.40, data: '2025-10-02T21:21:06', cotacao: 5.50 },
        
        // Trades 03/10/2025 (APPLE.OTC - todas perdidas)
        { tipo: 'trade', ativo: 'APPLE.OTC', operacao: 'SELL', resultado: 'LOST', valorUsd: 2.00, data: '2025-10-03T15:33:01', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'APPLE.OTC', operacao: 'BUY', resultado: 'LOST', valorUsd: 2.00, data: '2025-10-03T15:26:06', cotacao: 5.50 },
        
        // Trades 06/10/2025 (FACEBOOK.OTC - todas perdidas)
        { tipo: 'trade', ativo: 'FACEBOOK.OTC', operacao: 'BUY', resultado: 'LOST', valorUsd: 4.00, data: '2025-10-06T10:47:22', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'FACEBOOK.OTC', operacao: 'SELL', resultado: 'LOST', valorUsd: 2.00, data: '2025-10-06T10:45:05', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'FACEBOOK.OTC', operacao: 'BUY', resultado: 'LOST', valorUsd: 2.00, data: '2025-10-06T10:27:04', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'FACEBOOK.OTC', operacao: 'SELL', resultado: 'LOST', valorUsd: 2.00, data: '2025-10-06T10:19:02', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'FACEBOOK.OTC', operacao: 'BUY', resultado: 'LOST', valorUsd: 2.00, data: '2025-10-06T10:13:00', cotacao: 5.50 },
        
        // Trades 06/10/2025 (XRPUSDT.OTC)
        { tipo: 'trade', ativo: 'XRPUSDT.OTC', operacao: 'SELL', resultado: 'WON', valorUsd: 1.60, data: '2025-10-06T21:45:06', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'XRPUSDT.OTC', operacao: 'BUY', resultado: 'WON', valorUsd: 1.60, data: '2025-10-06T21:39:02', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'XRPUSDT.OTC', operacao: 'BUY', resultado: 'WON', valorUsd: 1.60, data: '2025-10-06T21:34:13', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'XRPUSDT.OTC', operacao: 'SELL', resultado: 'LOST', valorUsd: 2.00, data: '2025-10-06T21:34:02', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'XRPUSDT.OTC', operacao: 'SELL', resultado: 'LOST', valorUsd: 2.00, data: '2025-10-06T21:30:07', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'XRPUSDT.OTC', operacao: 'BUY', resultado: 'WON', valorUsd: 1.60, data: '2025-10-06T21:27:08', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'XRPUSDT.OTC', operacao: 'SELL', resultado: 'WON', valorUsd: 1.60, data: '2025-10-06T21:21:12', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'XRPUSDT.OTC', operacao: 'BUY', resultado: 'LOST', valorUsd: 2.00, data: '2025-10-06T21:19:02', cotacao: 5.50 },
        
        // Trades 07/10/2025 (UKOIL.OTC)
        { tipo: 'trade', ativo: 'UKOIL.OTC', operacao: 'BUY', resultado: 'WON', valorUsd: 1.60, data: '2025-10-07T10:30:15', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'UKOIL.OTC', operacao: 'BUY', resultado: 'WON', valorUsd: 1.60, data: '2025-10-07T10:30:11', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'UKOIL.OTC', operacao: 'BUY', resultado: 'WON', valorUsd: 1.60, data: '2025-10-07T10:26:09', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'UKOIL.OTC', operacao: 'SELL', resultado: 'WON', valorUsd: 3.20, data: '2025-10-07T10:22:11', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'UKOIL.OTC', operacao: 'BUY', resultado: 'LOST', valorUsd: 2.00, data: '2025-10-07T10:17:01', cotacao: 5.50 },
        
        // Trades 07/10/2025 (APPLE.OTC)
        { tipo: 'trade', ativo: 'APPLE.OTC', operacao: 'SELL', resultado: 'WON', valorUsd: 1.60, data: '2025-10-07T15:19:04', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'APPLE.OTC', operacao: 'BUY', resultado: 'WON', valorUsd: 1.60, data: '2025-10-07T15:14:04', cotacao: 5.50 },
        
        // Trades 07/10/2025 (BTCUSDT.OTC - NOVOS)
        { tipo: 'trade', ativo: 'BTCUSDT.OTC', operacao: 'BUY', resultado: 'WON', valorUsd: 2.46, data: '2025-10-07T21:27:03', cotacao: 5.50 },
        { tipo: 'trade', ativo: 'BTCUSDT.OTC', operacao: 'SELL', resultado: 'WON', valorUsd: 1.64, data: '2025-10-07T21:24:06', cotacao: 5.50 }
    ];
    
    // Limpar trades existentes
    trades = [];
    
    dadosExtrato.forEach(item => {
        const trade = {
            id: Date.now() + Math.random(),
            tipo: item.tipo,
            valorUsd: item.valorUsd,
            valorBrl: item.valorUsd * item.cotacao,
            cotacao: item.cotacao,
            data: item.data,
            timestamp: new Date().toISOString()
        };
        
        if (item.tipo === 'trade') {
            trade.ativo = item.ativo;
            trade.operacao = item.operacao;
            trade.resultado = item.resultado;
        }
        
        trades.push(trade);
    });
    
    salvarTrades();
    updateResumoTrader();
    renderTrades();
    showNotification(`✅ ${dadosExtrato.length} lançamentos importados (sem duplicatas)!`);
}