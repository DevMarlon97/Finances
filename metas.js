// js/metas.js
document.addEventListener('DOMContentLoaded', () => {
    const formMeta = document.getElementById('formMeta');
    const containerMetas = document.getElementById('containerMetas');
    
    // Configurações do Casamento (Caroline & Marlon)
    const dataCasamento = new Date('2026-08-29T00:00:00');

    function atualizarCountdown() {
        const hoje = new Date();
        const diff = dataCasamento - hoje;
        
        if (diff <= 0) {
            document.getElementById('countDays').innerText = "000";
            document.getElementById('countMonths').innerText = "00";
            return;
        }

        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        const meses = Math.floor(dias / 30.44);

        document.getElementById('countDays').innerText = dias.toString().padStart(3, '0');
        document.getElementById('countMonths').innerText = meses.toString().padStart(2, '0');
    }

    window.excluirMeta = function(id) {
        if(confirm("Deseja remover esta meta do seu plano de destino?")) {
            const data = getData();
            data.metas = (data.metas || []).filter(m => m.id !== id);
            saveData(data);
            renderizarMetas();
        }
    };

    // FUNÇÃO PARA ATUALIZAR PROGRESSO RAPIDAMENTE
    window.atualizarProgresso = function(id) {
        const data = getData();
        const meta = data.metas.find(m => m.id === id);
        if(!meta) return;

        const novoValor = prompt(`Atualizar progresso para "${meta.nome}":`, meta.atual);
        if (novoValor !== null) {
            meta.atual = parseFloat(novoValor);
            saveData(data);
            renderizarMetas();
        }
    }

    function renderizarMetas() {
        const data = getData();
        const metas = data.metas || [];
        containerMetas.innerHTML = '';

        if(metas.length === 0) {
            containerMetas.innerHTML = `
                <div class="glass-panel" style="grid-column: 1/-1; text-align: center; padding: 40px; border: 1px dashed var(--glass-border);">
                    <p style="color: var(--text-muted); font-style: italic;">Sua jornada rumo ao dia 29/08 começa aqui. Defina seu primeiro marco ao lado.</p>
                </div>`;
            return;
        }

        metas.forEach(meta => {
            // PROTEÇÃO ANTIBUG: Garante que o tipo existe antes de tentar o toUpperCase()
            const tipoSeguro = (meta.tipo || 'financeira'); 
            const perc = Math.min((meta.atual / meta.objetivo) * 100, 100);
            const isFinanceira = tipoSeguro === 'financeira';
            const cor = isFinanceira ? 'var(--primary-cyan)' : 'var(--danger-red)';
            const sufixo = isFinanceira ? 'R$' : 'Kg';
            
            containerMetas.innerHTML += `
                <div class="glass-panel goal-card" style="border-top: 4px solid ${cor}; background: rgba(13, 2, 33, 0.4);">
                    <div style="display:flex; justify-content:space-between; align-items: center; margin-bottom: 1rem;">
                        <span style="font-size: 0.7rem; background: ${cor}; color: #000; padding: 2px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase;">
                            ${tipoSeguro}
                        </span>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="atualizarProgresso(${meta.id})" style="background:none; border:none; color:var(--primary-cyan); cursor:pointer; font-size: 0.8rem;">✏️ Editar</button>
                            <button onclick="excluirMeta(${meta.id})" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">✕</button>
                        </div>
                    </div>
                    
                    <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 5px;">${meta.nome}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">
                        ${isFinanceira ? 'Capital acumulado para o sonho.' : 'Evolução da sua melhor versão.'}
                    </p>
                    
                    <div style="text-align: center; margin-bottom: 1rem;">
                        <span style="font-size: 2.2rem; font-weight: bold; color: #fff; line-height: 1;">${perc.toFixed(1)}%</span>
                    </div>

                    <div class="progress-bar" style="height: 8px; background: rgba(0,0,0,0.5); border-radius: 4px;">
                        <div class="progress-fill" style="width: ${perc}%; background: ${cor}; box-shadow: 0 0 10px ${cor}; border-radius: 4px;"></div>
                    </div>

                    <div style="display: flex; justify-content: space-between; margin-top: 1.2rem; font-size: 0.85rem;">
                        <div style="display: flex; flex-direction: column;">
                            <span style="color: var(--text-muted); font-size: 0.7rem; text-transform: uppercase;">Atual</span>
                            <strong style="color: #fff; font-size: 1rem;">${isFinanceira ? formatCurrency(meta.atual) : meta.atual + ' ' + sufixo}</strong>
                        </div>
                        <div style="display: flex; flex-direction: column; text-align: right;">
                            <span style="color: var(--text-muted); font-size: 0.7rem; text-transform: uppercase;">Alvo</span>
                            <strong style="color: #fff; font-size: 1rem;">${isFinanceira ? formatCurrency(meta.objetivo) : meta.objetivo + ' ' + sufixo}</strong>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    formMeta.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = getData();
        if(!data.metas) data.metas = [];

        const novaMeta = {
            id: Date.now(),
            tipo: document.getElementById('tipoMeta').value,
            nome: document.getElementById('nomeMeta').value,
            objetivo: parseFloat(document.getElementById('valorObjetivo').value),
            atual: parseFloat(document.getElementById('valorAtual').value)
        };

        data.metas.push(novaMeta);
        saveData(data);
        renderizarMetas();
        formMeta.reset();
    });

    atualizarCountdown();
    renderizarMetas();
});