// js/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quickTransactionForm');
    const userSwitch = document.getElementById('userSwitch');
    
    const data = getData();
    
    // 1. ESCUDO DE CONFIGURAÇÃO (Previne erros se o usuário for novo)
    if (!data.config) {
        data.config = { currentUser: 'ambos' };
        saveData(data);
    }

    // 2. O ESCUDO DAS METAS (AQUI ESTÁ A CORREÇÃO DO ERRO DA FOTO!)
    if (!data.metas) data.metas = [];
    
    if (data.metas.length === 0) {
        // Se não tiver nenhuma meta cadastrada, cria uma genérica para não bugar o visual
        data.metas.push({
            id: Date.now(),
            nome: "Minha Primeira Meta",
            prazo: "2026-12-31",
            meta: 10000,
            metaMensal: 1000,
            guardado: 0,
            guardadoMes: 0
        });
        saveData(data);
    } else if (data.metas[0] && data.metas[0].guardadoMes === undefined) {
        // Se for um dado antigo, atualiza a estrutura
        data.metas[0].guardadoMes = 0;
        data.metas[0].metaMensal = 1000;
        saveData(data);
    }

    if (userSwitch) {
        userSwitch.value = data.config.currentUser;
    }
    
    updateDashboard();
    
    if (document.getElementById('balanceChart')) {
        renderChart();
    }

    // DASHBOARD SWIPER (TELA CHEIA)
    let swiper;
    if (document.querySelector(".dashboardSwiper")) {
        swiper = new Swiper(".dashboardSwiper", {
            slidesPerView: 1,
            spaceBetween: 30,
            grabCursor: true,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            }
        });
    }

    if (userSwitch) {
        userSwitch.addEventListener('change', (e) => {
            const currentData = getData();
            currentData.config.currentUser = e.target.value;
            saveData(currentData);
            updateDashboard();
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const currentData = getData();
            const userToSave = currentData.config.currentUser;

            const novaTransacao = {
                id: Date.now(),
                descricao: document.getElementById('desc').value,
                valor: parseFloat(document.getElementById('valor').value),
                categoria: document.getElementById('categoria').value,
                tipo: document.getElementById('tipo').value,
                data: new Date().toISOString(),
                usuario: userToSave
            };

            if(!currentData.transacoes) currentData.transacoes = [];
            currentData.transacoes.push(novaTransacao);
            saveData(currentData);
            form.reset();
            updateDashboard();
            
            if (swiper) swiper.slideTo(0);
        });
    }
});

// FUNÇÃO EDITAR METAS (Isolada e Segura)
window.editarMeta = function() {
    const data = getData();
    if(!data.metas || data.metas.length === 0) return;
    const meta = data.metas[0];
    
    const novoNome = prompt("Qual o nome da meta?", meta.nome) || meta.nome;
    const novoValorTotal = parseFloat(prompt(`Valor total final?`, meta.meta)) || meta.meta;
    const novaMetaMensal = parseFloat(prompt(`Quanto quer guardar por mês?`, meta.metaMensal)) || meta.metaMensal;
    const novoGuardadoTotal = parseFloat(prompt(`Total já guardado (Geral)?`, meta.guardado)) || meta.guardado;
    const novoGuardadoMes = parseFloat(prompt(`Quanto já guardou NESTE mês?`, meta.guardadoMes)) || meta.guardadoMes;

    data.metas[0] = {
        ...meta,
        nome: novoNome,
        meta: novoValorTotal,
        metaMensal: novaMetaMensal,
        guardado: novoGuardadoTotal,
        guardadoMes: novoGuardadoMes
    };
    
    saveData(data);
    updateDashboard();
};

function updateDashboard() {
    const data = getData();
    const user = data.config ? data.config.currentUser : 'ambos';
    let transacoesView = data.transacoes || [];
    
    if (user !== 'ambos') {
        transacoesView = transacoesView.filter(t => t.usuario === user || t.usuario === 'ambos');
    }

    let saldo = transacoesView.reduce((acc, curr) => curr.tipo === 'receita' ? acc + curr.valor : acc - curr.valor, 0);
    const totalBalanceEl = document.getElementById('totalBalance');
    if (totalBalanceEl) totalBalanceEl.innerText = formatCurrency(saldo);

    // SISTEMA INTELIGENTE DE ALERTAS (Vinculado ao Calendário)
    const contasFuturas = data.contas || [];
    const alertasDiv = document.getElementById('calendarAlerts');
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    
    let htmlAlertas = '';
    let temAlertaPesado = false;

    if (alertasDiv) {
        contasFuturas.forEach(conta => {
            if (!conta.dataExata) return; // Escudo antimorte do split

            const [ano, mes, dia] = conta.dataExata.split('-');
            const dataConta = new Date(ano, mes - 1, dia);
            
            const diffTempo = dataConta.getTime() - hoje.getTime();
            const diffDias = Math.ceil(diffTempo / (1000 * 3600 * 24));

            const descUpper = conta.descricao ? conta.descricao.toUpperCase() : '';
            if (diffDias > 0 && diffDias <= 90) {
                if (conta.valor > 500 || descUpper.includes("IPVA") || descUpper.includes("IPTU") || descUpper.includes("SEGURO")) {
                    temAlertaPesado = true;
                    let avisoTempo = diffDias <= 30 ? `em ${diffDias} dias` : `daqui a ${Math.floor(diffDias/30)} meses`;
                    
                    htmlAlertas += `
                        <div style="margin-bottom: 8px;">
                            <strong>Atenção:</strong> Fatura pesada de <strong>${conta.descricao}</strong> (${formatCurrency(conta.valor)}) prevista para vencer ${avisoTempo}.
                        </div>
                    `;
                }
            }
        });

        if (temAlertaPesado) {
            alertasDiv.innerHTML = htmlAlertas;
            alertasDiv.style.borderLeftColor = "var(--danger-red)";
            alertasDiv.style.background = "rgba(241, 91, 181, 0.1)";
        } else {
            alertasDiv.innerHTML = "Tudo tranquilo! Nenhuma conta pesada chegando nos próximos meses.";
            alertasDiv.style.borderLeftColor = "var(--primary-cyan)";
            alertasDiv.style.background = "rgba(0, 245, 212, 0.1)";
        }
    }

    // ATUALIZAÇÃO DA ÁREA DE METAS
    const mainGoalEl = document.getElementById('mainGoal');
    if (mainGoalEl && data.metas && data.metas.length > 0) {
        const meta = data.metas[0];
        const porcTotal = meta.meta > 0 ? (meta.guardado / meta.meta) * 100 : 0;
        const porcMes = meta.metaMensal > 0 ? (meta.guardadoMes / meta.metaMensal) * 100 : 0;
        
        mainGoalEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: var(--primary-cyan); margin: 0;">${meta.nome}</h2>
                <button onclick="editarMeta()" class="btn-primary" style="padding: 8px 15px; margin: 0; font-size: 0.8rem; width: auto;">Editar Valores</button>
            </div>
            
            <div style="margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold;">
                    <span>Progresso Total da Meta</span>
                    <span style="color: var(--primary-purple)">${porcTotal.toFixed(1)}%</span>
                </div>
                <div class="progress-bar" style="height: 12px; background: rgba(255,255,255,0.05);">
                    <div class="progress-fill" style="width: ${porcTotal > 100 ? 100 : porcTotal}%; background: var(--primary-purple); box-shadow: 0 0 10px var(--primary-purple);"></div>
                </div>
                <small style="color: var(--text-muted)">${formatCurrency(meta.guardado)} de ${formatCurrency(meta.meta)} guardados.</small>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold;">
                    <span>Meta Deste Mês</span>
                    <span style="color: var(--primary-cyan)">${porcMes.toFixed(1)}%</span>
                </div>
                <div class="progress-bar" style="height: 12px; background: rgba(255,255,255,0.05);">
                    <div class="progress-fill" style="width: ${porcMes > 100 ? 100 : porcMes}%; background: var(--primary-cyan); box-shadow: 0 0 10px var(--primary-cyan);"></div>
                </div>
                <small style="color: var(--text-muted)">Você já guardou ${formatCurrency(meta.guardadoMes)} de ${formatCurrency(meta.metaMensal)} neste mês.</small>
            </div>
        `;
    }
}

// Renderização do Gráfico
function renderChart() {
    const ctx = document.getElementById('balanceChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(157, 78, 221, 0.5)'); 
    gradient.addColorStop(1, 'rgba(157, 78, 221, 0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [{
                label: 'Patrimônio',
                data: [1500, 2200, 1800, 3000, 3500, 4000],
                borderColor: '#9d4edd',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#00f5d4',
                pointBorderColor: '#fff',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false, min: 0 } },
            layout: { padding: 10 }
        }
    });
}