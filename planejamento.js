// js/planejamento.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Âncora Temporal: Casamento com Marlon
    function calcularUrgencia() {
        const dataCasamento = new Date('2026-08-29'); 
        const hoje = new Date();
        const diff = dataCasamento - hoje;
        const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
        
        const display = document.getElementById('diasCasamento');
        display.innerText = dias > 0 ? dias : "0";
    }

    // 2. Intenção de Implementação (James Clear)
    // "Quando eu sentir vontade de gastar, eu vou lembrar do financiamento."
    document.getElementById('formCustoOportunidade').onsubmit = (e) => {
        e.preventDefault();
        const valor = parseFloat(document.getElementById('valorExtra').value);

        if (valor > 0) {
            const dados = getData();
            if (!dados.contas) dados.contas = [];

            // Registra a amortização como um investimento na liberdade futura
            dados.contas.push({
                id: Date.now(),
                descricao: "Amortização: Compra de Liberdade",
                valor: valor,
                dataExata: new Date().toISOString().split('T')[0],
                tipo: 'conta'
            });

            saveData(dados);
            
            // Alerta Psicológico de Validação
            alert("Identidade confirmada, Caroline! Você acaba de dar um passo real para o seu futuro na WEG e o seu casamento.");
            
            e.target.reset();
            calcularUrgencia();
        }
    };

    // Inicializa a visão
    calcularUrgencia();
});