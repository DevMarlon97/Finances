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
    const mesAtualTituloTrans = document.getElementById('mesAtualTituloTrans');
    const textoDestinoFatura = document.getElementById('textoDestinoFatura');

    btnPrevMonth.addEventListener('click', () => {
        dataFiltro.setMonth(dataFiltro.getMonth() - 1);
        renderizarTabela();
    });

    btnNextMonth.addEventListener('click', () => {
        dataFiltro.setMonth(dataFiltro.getMonth() + 1);
        renderizarTabela();
    });

    // ==========================================
    // LEITURA DA IA (PRINT) - OBEDECE A TELA
    // ==========================================
    const inputExtrato = document.getElementById('inputExtrato');
    const statusIA = document.getElementById('statusIA');

    if (inputExtrato) {
        inputExtrato.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            statusIA.innerText = "⏳ Extraindo valores do print...";
            statusIA.style.color = "var(--primary-cyan)";

            try {
                const { data: { text } } = await Tesseract.recognize(file, 'por');
                const transacoesExtraidas = processarTextoMiope(text);

                if (transacoesExtraidas.length > 0) {
                    const qtdSalvas = salvarNoSistema(transacoesExtraidas);
                    if (qtdSalvas > 0) {
                        statusIA.innerText = `✅ ${qtdSalvas} itens agendados com sucesso!`;
                    } else {
                        statusIA.innerText = "⚠️ Itens já existentes no sistema.";
                        statusIA.style.color = "var(--text-muted)";
                    }
                    renderizarTabela(); 
                } else {
                    statusIA.innerText = "⚠️ Não encontrei valores válidos na imagem.";
                    statusIA.style.color = "var(--danger-red)";
                }
            } catch (error) {
                console.error("Erro OCR:", error);
                statusIA.innerText = "❌ Erro ao processar imagem.";
                statusIA.style.color = "var(--danger-red)";
            }
            e.target.value = '';
        });
    }

    // O RADAR BLINDADO: Não procura data, foca só em dinheiro e texto
    function processarTextoMiope(textoBruto) {
        const linhas = textoBruto.split('\n');
        const resultados = [];
        const regexMoeda = /(?:R\$|RS|R\s\$)?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i;

        // A MÁGICA: Usa o mês e ano que você selecionou na tela!
        const anoVencimento = dataFiltro.getFullYear();
        const mesVencimento = String(dataFiltro.getMonth() + 1).padStart(2, '0');
        const dataVencimentoFinal = `${anoVencimento}-${mesVencimento}-11`;

        linhas.forEach(linha => {
            const matchMoeda = linha.match(regexMoeda);
            
            if (matchMoeda && linha.length > 5) {
                const valorSujo = matchMoeda[0];
                const apenasNumerosStr = matchMoeda[1];
                
                let descricao = linha
                    .replace(valorSujo, '')
                    .replace(/Data:\s*\d{2}\/\d{2}/i, '') // Limpa a data se a IA ler
                    .replace(/\d{2}[\/\.]\d{2}/, '') // Limpa datas perdidas
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
                        descricao: descricao.substring(0, 30).toUpperCase(),
                        valor: valorNumerico,
                        dataExata: dataVencimentoFinal,
                        categoria: "💳 Cartão de Crédito"
                    });
                }
            }
        });
        return resultados;
    }

    // ==========================================
    // SISTEMA ANTI-DUPLICIDADE E SALVAMENTO
    // ==========================================
    function salvarNoSistema(novasTransacoes) {
        const dados = getData();
        if (!dados.contas) dados.contas = [];

        let contador = 0;
        novasTransacoes.forEach(t => {
            const ehRepetido = dados.contas.some(c => 
                c.valor === t.valor && 
                c.dataExata === t.dataExata && 
                c.descricao === t.descricao
            );

            let desejaSalvar = true;
            if (ehRepetido) {
                desejaSalvar = confirm(`⚠️ Duplicidade detectada: "${t.descricao}" de R$ ${t.valor}.\n\nDeseja salvar mesmo assim?`);
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
    // FORMULÁRIO MANUAL E EDIÇÃO
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
                const index = dados.contas.findIndex(c => c.id === idEmEdicao);
                if (index !== -1) {
                    dados.contas[index] = { ...dados.contas[index], dataExata: data, descricao: desc, valor: valor, categoria: cat };
                }
                idEmEdicao = null;
                btnSalvarManual.innerText = "Adicionar";
                btnCancelarEdicao.style.display = "none";
                document.getElementById('tituloManual').innerText = "✍️ Adicionar Manualmente";
            } else {
                salvarNoSistema([{ descricao: desc, valor: valor, dataExata: data, categoria: cat }]);
            }

            saveData(dados);
            formManual.reset();
            renderizarTabela();
        });

        btnCancelarEdicao.addEventListener('click', () => {
            idEmEdicao = null;
            formManual.reset();
            btnSalvarManual.innerText = "Adicionar";
            btnCancelarEdicao.style.display = "none";
            document.getElementById('tituloManual').innerText = "✍️ Adicionar Manualmente";
        });
    }

    window.editarTransacao = function(id) {
        const dados = getData();
        const t = (dados.contas || []).find(c => c.id === id);
        if (t) {
            document.getElementById('dataManual').value = t.dataExata;
            document.getElementById('descManual').value = t.descricao;
            document.getElementById('valorManual').value = t.valor;
            document.getElementById('catManual').value = t.categoria || "💰 Conta";
            idEmEdicao = id;
            btnSalvarManual.innerText = "💾 Salvar Alteração";
            btnCancelarEdicao.style.display = "block";
            document.getElementById('tituloManual').innerText = "✏️ Editando Transação";
            document.getElementById('painelManual').scrollIntoView({ behavior: 'smooth' });
        }
    }

    window.apagarTransacao = function(id) {
        if(confirm("Excluir esta transação?")) {
            const dados = getData();
            dados.contas = (dados.contas || []).filter(c => c.id !== id);
            saveData(dados);
            renderizarTabela();
        }
    }

    // ==========================================
    // RENDERIZAR TABELA E TEXTO EXPLICATIVO
    // ==========================================
    function renderizarTabela() {
        const corpoTabela = document.getElementById('corpoTabela');
        const anoFiltro = dataFiltro.getFullYear();
        const mesFiltro = dataFiltro.getMonth();
        
        // Atualiza título da tabela
        mesAtualTituloTrans.innerText = `${mesesNomes[mesFiltro]} ${anoFiltro}`;

        // ATUALIZA O AVISO EXPLICATIVO DA IA NA TELA
        if (textoDestinoFatura) {
            textoDestinoFatura.innerText = `Fatura de ${mesesNomes[mesFiltro]} (Vencimento 11/${String(mesFiltro + 1).padStart(2, '0')}/${anoFiltro})`;
        }

        const dados = getData();
        const prefixo = `${anoFiltro}-${String(mesFiltro + 1).padStart(2, '0')}`;
        const filtradas = (dados.contas || []).filter(c => c.dataExata && c.dataExata.startsWith(prefixo));

        if (filtradas.length === 0) {
            corpoTabela.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">Nenhuma conta para este mês.</td></tr>`;
            return;
        }

        filtradas.sort((a, b) => new Date(b.dataExata) - new Date(a.dataExata));

        corpoTabela.innerHTML = filtradas.map(item => {
            const dataBr = item.dataExata.split('-').reverse().join('/');
            return `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 15px;">${dataBr}</td>
                    <td style="padding: 15px; font-weight: bold; color: #fff;">${item.descricao}</td>
                    <td style="padding: 15px;"><span style="background: rgba(0,245,212,0.1); color: var(--primary-cyan); padding: 5px 10px; border-radius: 5px; font-size: 0.85rem;">${item.categoria || '💰 Conta'}</span></td>
                    <td style="padding: 15px; color: var(--danger-red); font-weight: bold;">- ${formatCurrency(item.valor)}</td>
                    <td style="padding: 15px;">
                        <button onclick="editarTransacao(${item.id})" style="background:none; border:none; color:var(--primary-cyan); cursor:pointer; margin-right:10px; text-decoration: underline;">Editar</button>
                        <button onclick="apagarTransacao(${item.id})" style="background:none; border:none; color:var(--danger-red); cursor:pointer; text-decoration: underline;">Excluir</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderizarTabela();
});
