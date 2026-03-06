// js/app.js - Funções Globais da Gems Elite

function getData() {
    const data = localStorage.getItem('gemsEliteData');
    return data ? JSON.parse(data) : { transacoes: [], contas: [], metas: [] };
}

function saveData(data) {
    localStorage.setItem('gemsEliteData', JSON.stringify(data));
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
}

// ==========================================
// LÓGICA GLOBAL DA INTERFACE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. CÉREBRO DO MENU HAMBÚRGUER (MOBILE)
    if (window.innerWidth <= 768) {
        const hamburgerBtn = document.createElement('button');
        hamburgerBtn.id = 'hamburgerBtn';
        hamburgerBtn.innerHTML = '☰';
        document.body.appendChild(hamburgerBtn);

        const overlay = document.createElement('div');
        overlay.id = 'mobileOverlay';
        document.body.appendChild(overlay);

        const sidebar = document.querySelector('.sidebar');

        function toggleMenu() {
            if(sidebar) sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }

        hamburgerBtn.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);

        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    }

    // 2. CÉREBRO DO BOTÃO DE RESET (AUTODESTRUIÇÃO)
    const resetBtn = document.getElementById('resetAppBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Impede a página de pular pro topo
            
            // Primeira barreira de segurança
            if(confirm("🚨 ATENÇÃO: Tem certeza que deseja apagar TODOS os dados do Gems Elite? Isso não pode ser desfeito!")) {
                
                // Segunda barreira de segurança (Dupla confirmação)
                if(confirm("Última chance! Apagar tudo mesmo e recomeçar do zero?")) {
                    
                    // O comando que aniquila os dados salvos:
                    localStorage.removeItem('gemsEliteData');
                    
                    alert("✅ App resetado com sucesso. Iniciando limpo!");
                    
                    // Força o navegador a recarregar e voltar para a tela inicial
                    window.location.href = 'index.html'; 
                }
            }
        });
    }
});