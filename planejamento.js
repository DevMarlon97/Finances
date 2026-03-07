<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gems Elite - Planejamento</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="app-container">
        <nav class="sidebar">
            <div class="logo">GEMSELITE</div>
            <ul class="nav-links" style="margin-top: 2rem;">
                <li><a href="index.html">Dashboard</a></li>
                <li><a href="transacoes.html">Transações</a></li>
                <li class="active"><a href="planejamento.html">Planejamento</a></li>
                <li><a href="calendario-financeiro.html">Calendário</a></li>
                <li><a href="metas.html">Metas</a></li>
            </ul>
        </nav>

        <main class="main-content">
            <header style="margin-bottom: 30px;">
                <h1>Planejamento Mensal</h1>
                <p style="color: var(--text-muted);">Defina seus limites de gastos e acompanhe o orçamento.</p>
            </header>

            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 15px; border: 1px solid var(--glass-border); max-width: 300px; margin-bottom: 30px;">
                <button id="btnPrevMonthPlan" style="background: none; border: none; color: var(--primary-purple); font-size: 1.5rem; cursor: pointer;">❮</button>
                <span id="mesAtualTituloPlan" style="font-weight: bold; color: #fff; font-size: 1.1rem; min-width: 130px; text-align: center;">...</span>
                <button id="btnNextMonthPlan" style="background: none; border: none; color: var(--primary-purple); font-size: 1.5rem; cursor: pointer;">❯</button>
            </div>

            <div class="dashboard-grid">
                <div class="glass-panel" style="border-color: var(--primary-cyan);">
                    <h3>💵 Definir Orçamento</h3>
                    <form id="formOrcamento" style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
                        
                        <label style="color: var(--text-muted); font-size: 0.9rem;">Renda Total do Mês (Salários, Extras)</label>
                        <input type="number" id="rendaMensal" placeholder="R$ 0,00" step="0.01" style="margin-top: 0; margin-bottom: 10px;">

                        <h4 style="color: var(--primary-purple); margin-top: 10px; border-bottom: 1px solid var(--glass-border); padding-bottom: 5px;">Limites de Gastos</h4>
                        
                        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 5px;">
                            <span style="flex: 1; font-size: 0.9rem;">🏠 Moradia/Contas:</span>
                            <input type="number" id="limiteMoradia" placeholder="R$ Limite" step="0.01" style="flex: 1; margin-top: 0;">
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 5px;">
                            <span style="flex: 1; font-size: 0.9rem;">🛒 Supermercado:</span>
                            <input type="number" id="limiteMercado" placeholder="R$ Limite" step="0.01" style="flex: 1; margin-top: 0;">
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 5px;">
                            <span style="flex: 1; font-size: 0.9rem;">🍔 Lanches/Delivery:</span>
                            <input type="number" id="limiteLanches" placeholder="R$ Limite" step="0.01" style="flex: 1; margin-top: 0;">
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 5px;">
                            <span style="flex: 1; font-size: 0.9rem;">⛽ Combustível:</span>
                            <input type="number" id="limiteCombustivel" placeholder="R$ Limite" step="0.01" style="flex: 1; margin-top: 0;">
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 5px;">
                            <span style="flex: 1; font-size: 0.9rem;">🚗 Uber/Transporte:</span>
                            <input type="number" id="limiteTransporte" placeholder="R$ Limite" step="0.01" style="flex: 1; margin-top: 0;">
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 5px;">
                            <span style="flex: 1; font-size: 0.9rem;">💊 Saúde/Farmácia:</span>
                            <input type="number" id="limiteSaude" placeholder="R$ Limite" step="0.01" style="flex: 1; margin-top: 0;">
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 5px;">
                            <span style="flex: 1; font-size: 0.9rem;">🛍️ Compras Pessoais:</span>
                            <input type="number" id="limiteCompras" placeholder="R$ Limite" step="0.01" style="flex: 1; margin-top: 0;">
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 5px;">
                            <span style="flex: 1; font-size: 0.9rem;">📚 Educação:</span>
                            <input type="number" id="limiteEducacao" placeholder="R$ Limite" step="0.01" style="flex: 1; margin-top: 0;">
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 5px;">
                            <span style="flex: 1; font-size: 0.9rem;">💍 Casamento:</span>
                            <input type="number" id="limiteCasamento" placeholder="R$ Limite" step="0.01" style="flex: 1; margin-top: 0;">
                        </div>

                        <button type="submit" class="btn-primary" style="margin-top: 20px;">Salvar Orçamento</button>
                    </form>
                </div>

                <div class="glass-panel">
                    <h3>📊 Termômetro de Gastos</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">Veja quanto você já consumiu do seu limite neste mês.</p>
                    
                    <div id="areaTermometros" style="display: flex; flex-direction: column; gap: 20px;">
                        </div>
                </div>
            </div>
        </main>
    </div>

 <script src="js/app.js"></script>
    <script src="js/calendario.js"></script>
    <script src="js/mobile.js"></script> </body>

</body>
</html>
