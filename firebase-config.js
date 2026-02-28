<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Gems Elite Pro 💎</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap" rel="stylesheet">
    
    <meta name="theme-color" content="#020617">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
    <script src="firebase-config.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>

    <style>
        :root { 
            --bg: #020617; 
            --primary: #a78bfa; 
            --primary-glow: rgba(167, 139, 250, 0.3);
            --secondary: #10b981; 
            --danger: #f43f5e; 
            --glass: rgba(255, 255, 255, 0.03);
            --glass-border: rgba(255, 255, 255, 0.08);
            --nav-bg: rgba(15, 23, 42, 0.9);
        }

        /* --- RESET MOBILE --- */
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        
        body, html { 
            margin: 0; padding: 0; width: 100%; height: 100dvh; 
            background: var(--bg); color: white;
            font-family: 'Plus Jakarta Sans', sans-serif;
            overflow: hidden; /* Trava o scroll do body */
        }

        /* --- CARROSSEL (CORE) --- */
        #app-viewport {
            display: flex;
            width: 100%;
            height: 100%;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
        }
        #app-viewport::-webkit-scrollbar { display: none; }

        .page {
            flex: 0 0 100%; /* Cada página ocupa exatamente 100% da largura */
            width: 100%;
            height: 100%;
            scroll-snap-align: start;
            overflow-y: auto;
            padding: 85px 0 130px 0; /* Padding para header e nav */
            position: relative;
        }

        /* --- HEADER --- */
        .app-header {
            position: fixed; top: 0; left: 0; width: 100%; height: 70px;
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 20px; z-index: 2000;
            background: rgba(2, 6, 23, 0.8); backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--glass-border);
        }
        .logo-text {
            font-weight: 800; font-size: 1rem; letter-spacing: 1px;
            background: linear-gradient(to right, #fff, var(--primary));
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        /* --- UI COMPONENTS (GLASS) --- */
        .balance-card {
            background: linear-gradient(135deg, #6366f1, #a855f7);
            margin: 0 15px 20px; padding: 30px 20px; border-radius: 28px;
            box-shadow: 0 15px 30px rgba(99, 102, 241, 0.3);
            text-align: center;
        }

        .glass-box {
            background: var(--glass); backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border); border-radius: 25px;
            padding: 20px; margin: 0 15px;
        }

        input {
            width: 100%; padding: 15px; border-radius: 15px; border: 1px solid var(--glass-border);
            background: rgba(0,0,0,0.2); color: white; font-size: 1rem; margin-bottom: 12px;
            outline: none;
        }

        .btn-main { 
            width: 100%; padding: 16px; border-radius: 15px; border: none; 
            background: linear-gradient(135deg, var(--primary), #7c3aed);
            color: white; font-weight: 800; cursor: pointer;
        }

        /* --- EXTRATO DINÂMICO --- */
        .transaction-item {
            display: flex; justify-content: space-between; align-items: center;
            background: var(--glass); padding: 15px; border-radius: 20px;
            margin: 0 15px 10px; border: 1px solid var(--glass-border);
        }
        .item-icon {
            width: 42px; height: 42px; border-radius: 12px; 
            display: flex; align-items: center; justify-content: center;
            font-size: 1.2rem; margin-right: 12px;
            background: rgba(255,255,255,0.05);
        }

        /* --- NAV INFERIOR --- */
        .bottom-nav {
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            width: 90%; height: 75px; background: var(--nav-bg);
            backdrop-filter: blur(25px); border-radius: 25px; display: flex;
            align-items: center; justify-content: space-around;
            border: 1px solid var(--glass-border); z-index: 2000;
        }
        .nav-item { font-size: 1.2rem; opacity: 0.3; transition: 0.3s; text-align: center; }
        .nav-item.active { opacity: 1; color: var(--primary); transform: translateY(-5px); }
        .nav-item small { display: block; font-size: 0.55rem; font-weight: 800; margin-top: 3px; }

        /* --- SIDEBAR --- */
        .sidebar {
            position: fixed; top: 0; left: -280px; width: 280px; height: 100%;
            background: #0f172a; z-index: 3000; transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 40px 20px; border-right: 1px solid var(--glass-border);
        }
        .sidebar.open { left: 0; }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: none; z-index: 2500; backdrop-filter: blur(4px); }
        .overlay.active { display: block; }

        .account-switcher {
            display: flex; background: rgba(0,0,0,0.3); padding: 5px; border-radius: 100px; margin: 10px 15px 20px;
        }
        .switch-btn {
            flex: 1; padding: 10px; border-radius: 100px; text-align: center; font-size: 0.7rem; font-weight: 800; color: rgba(255,255,255,0.4);
        }
        .switch-btn.active { background: var(--primary); color: white; }

        .hidden { display: none !important; }
        #login-screen, #onboarding-screen { position: fixed; inset: 0; background: var(--bg); z-index: 4000; display: flex; align-items: center; justify-content: center; }
    </style>
</head>
<body>

    <div class="overlay" id="mainOverlay" onclick="toggleSidebar()"></div>

    <div class="app-header">
        <div onclick="toggleSidebar()" style="font-size: 1.4rem;">☰</div>
        <div class="logo-text">GEMS ELITE PRO 💎</div>
        <div onclick="toggleNotifs()">🔔</div>
    </div>

    <div class="sidebar" id="sidebar">
        <h2 style="color: var(--primary);">Conta</h2>
        <p id="side-user-name" style="font-weight:800; margin:0;"></p>
        <p id="side-user-email" style="font-size:0.7rem; opacity:0.5; margin-bottom:30px;"></p>
        <div style="display: flex; flex-direction: column; gap: 20px; font-weight:600;">
            <div onclick="scrollToPage(0); toggleSidebar()">🏠 Dashboard</div>
            <div onclick="scrollToPage(1); toggleSidebar()">📜 Extrato</div>
            <div onclick="scrollToPage(2); toggleSidebar()">👥 Grupo</div>
        </div>
        <button onclick="logout()" style="position:absolute; bottom:30px; width:80%; background:none; border:1px solid var(--danger); color:var(--danger); padding:12px; border-radius:12px;">Sair</button>
    </div>

    <div id="login-screen" class="hidden">
        <div class="glass-box" style="width: 85%;">
            <h2 style="text-align:center">Elite Login</h2>
            <input type="email" id="email" placeholder="E-mail">
            <input type="password" id="pass" placeholder="Senha">
            <button class="btn-main" onclick="login()">Acessar 💎</button>
        </div>
    </div>

    <main id="app-viewport">
        <section class="page">
            <div class="account-switcher">
                <div id="btn-pessoal" class="switch-btn active" onclick="changeMode('pessoal')">PESSOAL</div>
                <div id="btn-grupo" class="switch-btn" onclick="changeMode('grupo')">GRUPO</div>
            </div>
            <div class="balance-card">
                <small id="label-conta" style="opacity:0.8; font-weight:800; letter-spacing:1px;">CONTA PESSOAL</small>
                <h1 id="saldoDisplay" style="font-size: 3rem; margin:10px 0;">R$ 0,00</h1>
            </div>
            <div class="glass-box">
                <input type="text" id="desc" placeholder="Descrição" oninput="detectType(this)">
                <input type="number" id="valor" placeholder="Valor R$">
                <div id="tag-tipo" style="height:15px; font-size:0.65rem; margin-bottom:10px; text-align:center;"></div>
                <button class="btn-main" onclick="addTransaction()">Lançar Agora 🚀</button>
            </div>
            <p style="padding:25px 20px 10px; font-size:0.6rem; font-weight:800; opacity:0.4;">RECENTES</p>
            <div id="listaHome"></div>
        </section>

        <section class="page">
            <h2 style="padding:0 20px; margin-bottom:20px;">Extrato</h2>
            <div id="listaExtrato"></div>
        </section>

        <section class="page">
            <div style="padding:0 20px;">
                <h2>Membros</h2>
                <div class="glass-box" id="members-list" style="margin:0 0 20px 0;"></div>
                <div class="glass-box" style="margin:0; text-align:center;">
                    <button class="btn-main" onclick="createInviteCode()" style="background:none; border:1px solid var(--primary); margin-bottom:15px;">Gerar Convite</button>
                    <div id="invite-display" style="font-size:2rem; font-weight:900; color:var(--primary);"></div>
                    <input type="text" id="code-input" placeholder="Código aqui" style="margin-top:20px;">
                    <button class="btn-main" onclick="joinByCode()">Entrar no Grupo</button>
                </div>
            </div>
        </section>
    </main>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="scrollToPage(0)">🏠<small>Início</small></div>
        <div class="nav-item" onclick="scrollToPage(1)">📜<small>Extrato</small></div>
        <div class="nav-item" onclick="scrollToPage(2)">👥<small>Grupo</small></div>
    </nav>

    <script>
        // LÓGICA DE NAVEGAÇÃO
        const viewport = document.getElementById('app-viewport');
        const navItems = document.querySelectorAll('.nav-item');

        function scrollToPage(idx) {
            viewport.scrollTo({ left: idx * window.innerWidth, behavior: 'smooth' });
        }

        viewport.addEventListener('scroll', () => {
            const idx = Math.round(viewport.scrollLeft / window.innerWidth);
            navItems.forEach((item, i) => item.classList.toggle('active', i === idx));
        });

        // CATEGORIZAÇÃO (UPGRADE UI)
        function getCat(desc) {
            const d = desc.toLowerCase();
            if(d.includes('salario') || d.includes('pix')) return { i: '💰', c: '#10b981' };
            if(d.includes('comida') || d.includes('burger')) return { i: '🍔', c: '#f59e0b' };
            if(d.includes('uber') || d.includes('carro')) return { i: '🚗', c: '#3b82f6' };
            return { i: '💸', c: '#a78bfa' };
        }

        // --- MANTENHA SUAS FUNÇÕES FIREBASE IGUAIS ---
        let userData = {}; let currentMode = 'pessoal'; let transUnsubscribe = null;

        auth.onAuthStateChanged(user => {
            if (user) checkUser(user);
            else document.getElementById('login-screen').classList.remove('hidden');
        });

        async function checkUser(user) {
            const doc = await db.collection("usuarios").doc(user.uid).get();
            if (!doc.exists) { 
                document.getElementById('login-screen').classList.add('hidden');
                document.getElementById('onboarding-screen').classList.remove('hidden');
            } else {
                userData = doc.data(); userData.uid = user.uid;
                startApp();
            }
        }

        function startApp() {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('side-user-name').innerText = userData.apelido;
            document.getElementById('side-user-email').innerText = userData.email;
            listenData();
        }

        function listenData() {
            if(transUnsubscribe) transUnsubscribe();
            let query = db.collection("transacoes");
            if(currentMode === 'pessoal') query = query.where("pessoalUID", "==", userData.uid);
            else query = query.where("grupoID", "==", userData.grupoID);

            transUnsubscribe = query.onSnapshot(s => {
                let total = 0; let lista = [];
                s.forEach(doc => {
                    const t = doc.data(); lista.push(t);
                    t.tipo === 'entrada' ? total += t.valor : total -= t.valor;
                });
                renderUI(lista.sort((a,b) => b.data - a.data), total);
            });
            // Snapshot membros (mesma lógica sua)
            db.collection("usuarios").where("grupoID", "==", userData.grupoID).onSnapshot(s => {
                let h = ""; s.forEach(doc => { h += `<div style="padding:10px 0; border-bottom:1px solid #ffffff11">${doc.data().apelido}</div>`; });
                document.getElementById('members-list').innerHTML = h;
            });
        }

        function renderUI(lista, total) {
            const html = lista.map(i => {
                const cat = getCat(i.descricao);
                return `
                <div class="transaction-item">
                    <div style="display:flex; align-items:center;">
                        <div class="item-icon" style="color:${cat.c}">${cat.i}</div>
                        <div><b>${i.descricao}</b><br><small style="opacity:0.4; font-size:0.6rem">Por ${i.autor}</small></div>
                    </div>
                    <div style="text-align:right; font-weight:900; color:${i.tipo==='entrada'?'var(--secondary)':'var(--danger)'}">
                        ${i.tipo==='entrada'?'+':'-'} R$ ${i.valor.toFixed(2)}
                    </div>
                </div>`;
            }).join('');
            document.getElementById('listaHome').innerHTML = html.slice(0, 500);
            document.getElementById('listaExtrato').innerHTML = html;
            document.getElementById('saldoDisplay').innerText = `R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        }

        // Funções auxiliares (Sidebar, ChangeMode, AddTransaction) - Mantenha as que você já tem.
        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('open');
            document.getElementById('mainOverlay').classList.toggle('active');
        }

        function changeMode(m) {
            currentMode = m;
            document.querySelectorAll('.switch-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('btn-'+m).classList.add('active');
            listenData();
        }

        async function addTransaction() {
            const d = document.getElementById('desc').value;
            const v = parseFloat(document.getElementById('valor').value);
            if(!d || !v) return;
            await db.collection("transacoes").add({
                descricao: d, valor: v,
                tipo: document.getElementById('tag-tipo').innerText.includes('ENTRADA') ? 'entrada' : 'saida',
                autor: userData.apelido, data: Date.now(),
                [currentMode === 'pessoal' ? 'pessoalUID' : 'grupoID']: currentMode === 'pessoal' ? userData.uid : userData.grupoID
            });
            document.getElementById('desc').value = ""; document.getElementById('valor').value = "";
            confetti({ particleCount: 50, spread: 60 });
        }

        function detectType(el) {
            const isE = ['salario','pix','recebi'].some(p => el.value.toLowerCase().includes(p));
            document.getElementById('tag-tipo').innerText = isE ? "✨ ENTRADA DETECTADA" : "💸 SAÍDA DETECTADA";
            document.getElementById('tag-tipo').style.color = isE ? "var(--secondary)" : "var(--danger)";
        }
    </script>
</body>
</html>
