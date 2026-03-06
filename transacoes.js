// js/transacoes.js
document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // SISTEMA DE FILTRO POR MÊS
    // ==========================================
    const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    let dataFiltro = new Date(); 
    dataFiltro.setDate(1);
    dataFiltro.setHours(12, 0, 0, 0);

    const btnPrevMonth = document.getElementById('btnPrevMonthTrans');
    const btnNextMonth = document.getElementById('btnNextMonthTrans');

    btnPrevMonth.addEventListener('click', () => {
        dataFiltro.setMonth(dataFiltro.getMonth() - 1);
        renderizarTabela();
    });

    btnNextMonth.addEventListener('click', () => {
        dataFiltro.setMonth(dataFiltro.getMonth() + 1);
        renderizarTabela();
    });


    // ==========================================
    // LEITURA DA IA (Print)
    // ==========================================
    const inputExtrato = document.getElementById('inputExtrato');
    const statusIA = document.getElementById('statusIA');

    if (inputExtrato) {
        inputExtrato.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            statusIA.innerText = "⏳ A IA está decifrando a data das compras... aguarde.";
            statusIA.style.color = "var(--primary-cyan)";

            try {
                const { data: { text } } = await Tesseract.recognize(file, 'por');
                const transacoesExtraidas = processarTextoMiope(text);

                if (transacoesExtraidas.length > 0) {
                    const qtdSalvas = salvarNoSistema(transacoesExtraidas);
                    if (qtdSalvas > 0) {
                        statusIA.innerText = `✅ ${qtdSalvas} transações agendadas para o vencimento (Dia 11)!`;
                        
                        // Pula a tela automaticamente para o mês da fatura lida
                        const dataPrimeiraFatura = new Date(transacoesExtraidas[0].dataExata);
                        dataFiltro = new Date(dataPrimeiraFatura.getFullYear(), dataPrimeiraFatura.getMonth(), 1, 12, 0, 0);
                        
                    } else {
                        statusIA.innerText = "⚠️ Nenhuma transação nova (todas repetidas).";
                        statusIA.style.color = "var(--text-muted)";
                    }
                    renderizarTabela(); 
                } else {
                    statusIA.innerText = "⚠️ O texto extraído estava confuso.";
                    statusIA.style.color = "var(--danger-red)";
                }
            } catch (error) {
                console.error("Erro OCR:", error);
                statusIA.innerText = "❌ Erro ao ler a imagem.";
            }
            e.target.value = '';
        });
    }

    // ==========================================
    // O RADAR INTELIGENTE (Calcula Dia 11 baseado na Compra)
    // ==========================================
    function processarTextoMiope(textoBruto) {
        const linhas = textoBruto.split('\n');
        const resultados = [];
        
        const regexMoeda = /(?:R\$|RS|R\s\$)?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i;
        const regexData = /Data:\s*(\d{2}\/\d{2})/i;

        let anoAtual = new Date().getFullYear();

        linhas.forEach(linha => {
            let mesDaCompra = new Date().getMonth(); // Padrão é o mês atual
            let anoDaCompra = anoAtual;

            // Caça a data escrita na linha (Ex: 31/01 ou 15/02)
            const matchData = linha.match(regexData);
            if(matchData) {
                const partes = matchData[1].split('/'); // partes[0] = DD, partes[1] = MM
                mesDaCompra = parseInt(partes[1], 10) - 1; // O Javascript conta os meses de 0 a 11
                
                // Proteção para virada de ano (comprou em dezembro, fatura em janeiro)
                if (mesDaCompra === 11 && new Date().getMonth() === 0) {
                    anoDaCompra = anoAtual - 1;
                }
            }

            // A MÁGICA: Joga a fatura SEMPRE para o mês seguinte ao da compra
            let mesFatura = mesDaCompra + 1;
            let anoFatura = anoDaCompra;

            if (mesFatura > 11) { 
                mesFatura = 0; // Janeiro
                anoFatura++; 
            }

            // Crava a data pro dia 11 do mês seguinte: YYYY-MM-11
            const dataFaturaDia11 = `${anoFatura}-${String(mesFatura + 1).padStart(2, '0')}-11`;

            const match = linha.match(regexMoeda);
            
            if (match && linha.length > 5) {
                const valorSujo = match[0];
                const apenasNumerosStr = match[1]; 
                
                let descricao = linha
                    .replace(valorSujo, '')
                    .replace(regexData, '') 
                    .replace(/R\$/g, '').replace(/RS/g, '').replace(/Parcelado.*/i, '') 
                    .trim();
                
                descricao = descricao.replace(/^[^\w]+|[^\w]+$/g, '').trim();

                let valorNumerico = 0;
                if (apenasNumerosStr.includes(',') && apenasNumerosStr.includes('.')) {
                    valorNumerico = parseFloat(apenasNumerosStr.replace(/\./g, '').replace(',', '.'));
                } else if (apenasNumerosStr.includes(',')) {
                    valorNumerico = parseFloat(apenasNumerosStr.replace(',', '.'));
                } else {
                    valorNumerico = parseFloat(apenasNumerosStr); 
                }

                if (valorNumerico > 0 && descricao.length > 2 && !descricao.toLowerCase().includes('fatura')) {
                    resultados.push({
                        descricao: descricao.substring(0, 35), 
                        valor: valorNumerico,
                        dataExata: dataFaturaDia11, // Usa a data calculada aqui
                        categoria: "💳 Cartão de Crédito"
                    });
                }
            }
        });
        return resultados;
    }

    // ==========================================
    // SISTEMA ANTI-DUPLICIDADE DE SALVAMENTO
    // ==========================================
    function salvarNoSistema(novasTransacoes) {
        const dados = getData();
        if (!dados.contas) dados.contas = [];

        let contador = 0;
        novasTransacoes.forEach(t => {
            const ehRepetido = dados.contas.some(c => c.valor === t.valor && c.dataExata === t.dataExata && c.descricao.toLowerCase() === t.descricao.toLowerCase());
            let desejaSalvar = true;

            if (ehRepetido) {
                desejaSalvar = confirm(`⚠️ Achei algo repetido: "${t.descricao}" de R$ ${t.valor}.\n\nSalvar duplicado?`);
            }

            if (desejaSalvar) {
                dados.contas.push({
                    id: Date.now() + Math.random(),
                    descricao: t.descricao,
                    valor: t.valor,
                    dataExata: t.dataExata,
                    categoria: t.categoria,
                    tipo: "conta" 
                });
                contador++;
            }
        });
        saveData(dados);
        return contador;
    }

    // ==========================================
    // LÓGICA DO FORMULÁRIO MANUAL E EDIÇÃO
    // ==========================================
    const formManual = document.getElementById('formManual');
    const btnSalvarManual = document.getElementById('btnSalvarManual');
    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    let idEmEdicao = null;

    if (formManual) {
        formManual.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = document.getElementById('dataManual').value;
            const desc = document.getElementById('descManual').value;
            const valor = parseFloat(document.getElementById('valorManual').value);
            const cat = document.getElementById('catManual').value;

            const dados = getData();
            if (!dados.contas) dados.contas = [];

            if (idEmEdicao) {
                // MODO EDIÇÃO: Atualiza a transação existente
                const index = dados.contas.findIndex(c => c.id === idEmEdicao);
                if (index !== -1) {
                    dados.contas[index].dataExata = data;
                    dados.contas[index].descricao = desc;
                    dados.contas[index].valor = valor;
                    dados.contas[index].categoria = cat;
                }
                idEmEdicao = null;
                btnSalvarManual.innerText = "Adicionar";
                btnSalvarManual.style.background = "var(--primary-purple)";
                btnSalvarManual.style.color = "white";
                btnCancelarEdicao.style.display = "none";
                document.getElementById('tituloManual').innerText = "✍️ Adicionar Manualmente";
            } else {
                // MODO NOVO
                salvarNoSistema([{ descricao: desc, valor: valor, dataExata: data, categoria: cat }]);
            }

            saveData(dados);
            formManual.reset();
            renderizarTabela();
        });

        // Cancela a edição e limpa os campos
        btnCancelarEdicao.addEventListener('click', () => {
            idEmEdicao = null;
            formManual.reset();
            btnSalvarManual.innerText = "Adicionar";
            btnSalvarManual.style.background = "var(--primary-purple)";
            btnSalvarManual.style.color = "white";
            btnCancelarEdicao.style.display = "none";
            document.getElementById('tituloManual').innerText = "✍️ Adicionar Manualmente";
        });
    }

    // Ação do Botão Editar na Tabela
    window.editarTransacao = function(id) {
        const dados = getData();
        const transacao = dados.contas.find(c => c.id === id);
        
        if (transacao) {
            document.getElementById('dataManual').value = transacao.dataExata;
            document.getElementById('descManual').value = transacao.descricao;
            document.getElementById('valorManual').value = transacao.valor;
            
            const catSelect = document.getElementById('catManual');
            const opcaoExiste = Array.from(catSelect.options).some(opt => opt.value === transacao.categoria);
            catSelect.value = opcaoExiste ? transacao.categoria : "💰 Conta";

            idEmEdicao = id;
            btnSalvarManual.innerText = "💾 Salvar Alteração";
            btnSalvarManual.style.background = "var(--primary-cyan)";
            btnSalvarManual.style.color = "var(--bg-dark)";
            btnCancelarEdicao.style.display = "block";
            document.getElementById('tituloManual').innerText = "✏️ Editando Transação";

            document.getElementById('painelManual').scrollIntoView({ behavior: 'smooth' });
        }
    }

    window.apagarTransacao = function(id) {
        if(confirm("Deseja realmente excluir esta transação?")) {
            const dados = getData();
            if(dados.contas) {
                dados.contas = dados.contas.filter(c => c.id !== id);
                saveData(dados);
                renderizarTabela(); 
            }
        }
    }

    // ==========================================
    // DESENHAR TABELA (Com Filtro de Mês)
    // ==========================================
    function renderizarTabela() {
        const corpoTabela = document.getElementById('corpoTabela');
        const tituloMes = document.getElementById('mesAtualTituloTrans');
        
        const anoFiltro = dataFiltro.getFullYear();
        const mesFiltro = dataFiltro.getMonth();
        tituloMes.innerText = `${mesesNomes[mesFiltro]} ${anoFiltro}`;

        const dados = getData();
        const contas = dados.contas || [];

        const prefixoData = `${anoFiltro}-${String(mesFiltro + 1).padStart(2, '0')}`;
        const contasFiltradas = contas.filter(c => c.dataExata && c.dataExata.startsWith(prefixoData));

        if (contasFiltradas.length === 0) {
            corpoTabela.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 30px; color: var(--text-muted); font-style: italic;">Nenhuma movimentação neste mês.</td></tr>`;
            return;
        }

        contasFiltradas.sort((a, b) => new Date(b.dataExata) - new Date(a.dataExata));

        corpoTabela.innerHTML = contasFiltradas.map(item => {
            const valorFormatado = `- ${formatCurrency(item.valor)}`;
            const categoria = item.categoria || '💰 Conta';

            const partesData = item.dataExata ? item.dataExata.split('-') : ['00', '00', '0000'];
            const dataBonita = partesData.length === 3 ? `${partesData[2]}/${partesData[1]}/${partesData[0]}` : item.dataExata;

            return `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: 0.3s;">
                    <td style="padding: 15px; color: var(--text-muted);">${dataBonita}</td>
                    <td style="padding: 15px; font-weight: bold; color: #fff;">${item.descricao}</td>
                    <td style="padding: 15px;">
                        <span style="background: rgba(0,245,212,0.1); color: var(--primary-cyan); padding: 5px 10px; border-radius: 5px; font-size: 0.85rem;">
                            ${categoria}
                        </span>
                    </td>
                    <td style="padding: 15px; color: var(--danger-red); font-weight: bold;">${valorFormatado}</td>
                    <td style="padding: 15px; display: flex; gap: 10px;">
                        <button onclick="editarTransacao(${item.id})" style="background: none; border: none; color: var(--primary-cyan); text-decoration: underline; cursor: pointer; font-size: 0.85rem;">Editar</button>
                        <button onclick="apagarTransacao(${item.id})" style="background: none; border: none; color: var(--danger-red); text-decoration: underline; cursor: pointer; font-size: 0.85rem;">Excluir</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderizarTabela();
});