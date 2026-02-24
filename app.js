/* ============================================================
   MATH QUIZ CHALLENGE - app.js
   Firebase Realtime DB + Tab Nav + Theme System
   ============================================================ */

// --- Firebase Config ---
const firebaseConfig = {
    apiKey: "AIzaSyCSHoQJob7fQSKGTTbGIZqaWmXNsJZxoD8",
    authDomain: "test-e1c5f.firebaseapp.com",
    databaseURL: "https://test-e1c5f-default-rtdb.firebaseio.com",
    projectId: "test-e1c5f",
    storageBucket: "test-e1c5f.firebasestorage.app",
    messagingSenderId: "",
    appId: ""
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- Questions ---

function generateBasicQ(level = 1) {
    const factor = Math.min(level, 15);

    // Cycle Types: 1=Arith Seq, 2=Arith Series, 0=Geo Seq
    const qType = level % 3;

    if (qType === 1) {
        // --- Arithmetic Sequence ---
        const a1 = Math.floor(Math.random() * (20 + factor * 5)) + 2;
        const d = Math.floor(Math.random() * (10 + factor * 2)) + 2;

        // Difficulty scaling for n: level 1-4 (n=1-4), then increases
        const nLimit = level <= 4 ? 4 : Math.min(6 + Math.floor(factor / 2), 15);
        const n = Math.floor(Math.random() * nLimit) + 1;
        const ans = a1 + (n - 1) * d;

        const seq = [a1, a1 + d, a1 + d * 2, a1 + d * 3];
        const seqText = n <= 4 ?
            seq.map((v, i) => (i === n - 1 ? '?' : v)).join(', ') :
            seq.join(', ');

        // Smart Options: Avoid values already in the visible sequence
        const used = new Set([a1, a1 + d, a1 + d * 2, a1 + d * 3]);
        let opts = [ans];
        const adj = [d, -d, 1, -1, 10, 5];
        for (let a of adj) {
            let candidate = ans + a;
            if (candidate > 0 && candidate !== ans && !used.has(candidate)) {
                opts.push(candidate);
                if (opts.length >= 4) break;
            }
        }
        while (opts.length < 4) {
            let r = ans + Math.floor(Math.random() * 20) - 10;
            if (r > 0 && !opts.includes(r) && !used.has(r)) opts.push(r);
        }
        opts.sort(() => Math.random() - 0.5);

        return {
            q: `จงหาพจน์ที่ ${n} ของลำดับเลขคณิต: ${seqText}, ...`,
            opts: opts.map(String), ans: opts.indexOf(ans), formula: "aₙ = a₁ + (n-1)d"
        };

    } else if (qType === 2) {
        // --- Arithmetic Series ---
        const a1 = Math.floor(Math.random() * 15) + 2;
        const d = Math.floor(Math.random() * 8) + 2;
        const n = level <= 6 ? 3 : (level <= 10 ? 4 : 5);
        const an = a1 + (n - 1) * d;
        const ans = (n / 2) * (a1 + an);

        const opts = [ans, ans + d, ans + 10, Math.abs(ans - d)].sort(() => Math.random() - 0.5);
        return {
            q: `ผลบวก ${n} พจน์แรกของอนุกรม ${a1} + ${a1 + d} + ${a1 + d * 2} + ... คือเท่าใด?`,
            opts: opts.map(String), ans: opts.indexOf(ans), formula: "Sₙ = n/2 (a₁ + aₙ)"
        };

    } else {
        // --- Geometric Sequence ---
        const a1 = Math.floor(Math.random() * 5) + 2; // Small a1
        const r = Math.floor(Math.random() * 2) + 2; // r=2 or 3 (sometimes 4 at high levels)
        const finalR = level > 10 ? r + 1 : r;

        const nLimit = level <= 5 ? 3 : 5;
        const n = Math.floor(Math.random() * nLimit) + 1;
        const ans = a1 * Math.pow(finalR, n - 1);

        const seq = [a1, a1 * finalR, a1 * Math.pow(finalR, 2)];
        const seqText = n <= 3 ?
            seq.map((v, i) => (i === n - 1 ? '?' : v)).join(', ') :
            seq.join(', ');

        const opts = [ans, ans * finalR, Math.floor(ans / finalR), ans + finalR].sort(() => Math.random() - 0.5);
        return {
            q: `จงหาพจน์ที่ ${n} ของลำดับเรขาคณิต: ${seqText}, ...`,
            opts: opts.map(String), ans: opts.indexOf(ans), formula: "aₙ = a₁ · rⁿ⁻¹"
        };
    }
}

const SHAPES = ['▲', '◆', '●', '■'];

const I18N = {
    th: {
        "tab-home": "หน้าหลัก", "tab-create": "สร้างห้อง", "tab-learn": "เรียนรู้", "tab-settings": "ตั้งค่า",
        "settings-title": "ตั้งค่า", "settings-sub": "จัดการแอปพลิเคชันของคุณ", "lang-select": "เลือกภาษา (Language):",
        "app-version": "เวอร์ชันแอป: 1.2.5", "dev-by": "พัฒนาโดย: MathQuiz Team",
        "hero-ready": "🎮 พร้อมลุย!", "hero-sub": "ลำดับเลขคณิต & อนุกรมเลขคณิต",
        "join-title": "เข้าร่วมเกม", "join-btn": "เข้าร่วม!", "nickname-placeholder": "Nickname ของคุณ",
        "create-title": "สร้างห้องเกม", "create-sub": "สร้างห้องใหม่แล้วแชร์ PIN ให้เพื่อนเข้าร่วม",
        "create-q-count": "10 ข้อ ลำดับ & อนุกรมเลขคณิต", "create-time": "30 วินาทีต่อข้อ",
        "create-score": "คะแนนเต็ม 1,500 / ข้อ", "create-players": "ไม่จำกัดจำนวนผู้เล่น",
        "create-mode": "โหมดการเล่น:", "create-btn": "🚀 สร้างห้องเลย!",
        "mode-classic": "Classic", "mode-elim": "Elimination (BR)",
        "mode-desc": "Classic: 30s ต่อข้อ ตอบพร้อมกัน | Elimination: 30s ต่อข้อ สุ่มสลับกันตอบทีละคน (ใครผิดตกรอบ!)",
        "learn-title": "เรียนรู้สูตร", "learn-sub": "ทบทวนสูตรก่อนเล่นเกม",
        "shoutout-placeholder": "ส่งแรงเชียร์...", "shoutout-btn": "ส่ง!",
        "lobby-waiting": "กำลังรอผู้เล่นคนอื่น...", "lobby-players": "ผู้ร่วมเล่น",
        "q-answers": "คำตอบ", "q-formula": "สูตรที่เกี่ยวข้อง",
        "lb-title": "🏆 ตารางคะแนน", "lb-next": "ข้อถัดไป ➜",
        "go-title": "จบเกม", "go-play-again": "🔄 เล่นอีกครั้ง",
        "watch-audience": "คุณเป็นคนดู (ในคิว)"
    },
    en: {
        "tab-home": "Home", "tab-create": "Create", "tab-learn": "Learn", "tab-settings": "Settings",
        "settings-title": "Settings", "settings-sub": "Manage your application", "lang-select": "Select Language:",
        "app-version": "Version: 1.2.5", "dev-by": "By: MathQuiz Team",
        "hero-ready": "🎮 Let's Go!", "hero-sub": "Arithmetic & Geometric Sequences",
        "join-title": "Join Game", "join-btn": "Join!", "nickname-placeholder": "Your Nickname",
        "create-title": "Create Room", "create-sub": "Create a room and share PIN",
        "create-q-count": "10 Questions - Sequences", "create-time": "30s per question",
        "create-score": "Max 1,500 pts / question", "create-players": "Unlimited players",
        "create-mode": "Game Mode:", "create-btn": "🚀 Create Room!",
        "mode-classic": "Classic", "mode-elim": "Elimination (BR)",
        "mode-desc": "Classic: 30s all together | Elimination: 30s random turns (wrong = out!)",
        "learn-title": "Learn Formulas", "learn-sub": "Review before you play",
        "shoutout-placeholder": "Send a shoutout...", "shoutout-btn": "Send!",
        "lobby-waiting": "Waiting for players...", "lobby-players": "Players",
        "q-answers": "Answers", "q-formula": "Relevant Formula",
        "lb-title": "🏆 Leaderboard", "lb-next": "NEXT ➜",
        "go-title": "GAME OVER", "go-play-again": "🔄 Play Again",
        "watch-audience": "You are a spectator (in queue)"
    }
};

let currentLang = localStorage.getItem('mathQuizLang') || 'th';
const COLORS = ["opt-red", "opt-blue", "opt-yellow", "opt-green"];

// --- State ---
let role = null, roomId = null, playerId = null, nickname = null;
let totalScore = 0, hasAnswered = false, timerInterval = null, timeLeft = 30, currentQIndex = -1;
let unsubscribe = null;
let gameMode = "normal"; // 'normal' or 'elimination'
let isEliminated = false;
let turnPlayerId = null;
let roomQuestions = [];

// ========================================================
// TAB NAVIGATION
// ========================================================
window.addEventListener('load', () => {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Language switching
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.getAttribute('data-lang');
            localStorage.setItem('mathQuizLang', currentLang);
            updateLangUI();
            translateApp();
        });
    });

    translateApp();
    updateLangUI();
});

function updateLangUI() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
    });
}

function translateApp() {
    const dict = I18N[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            // Handle specific element types if needed, but mostly textContent
            if (el.tagName === 'INPUT') {
                el.placeholder = dict[key];
            } else {
                // If it contains more than just text, we might need to be careful.
                // But for labels, textContent is fine.
                el.textContent = dict[key];
            }
        }
    });

    // Special handling for placeholders that don't have data-i18n yet or need dynamic update
    document.getElementById('input-nickname').placeholder = dict['nickname-placeholder'];
    document.getElementById('shoutout-msg').placeholder = dict['shoutout-placeholder'];
}
// ========================================================
// PARTICLES (SNOW)
// ========================================================
function initParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    container.innerHTML = '';

    const count = 50;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle snow-flake';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.animationDuration = (Math.random() * 3 + 2) + 's';
        p.style.animationDelay = Math.random() * 5 + 's';
        p.style.opacity = Math.random();

        const size = (Math.random() * 5 + 2) + 'px';
        p.style.width = size; p.style.height = size;
        container.appendChild(p);
    }
}
initParticles();

window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const pin = params.get('pin');
    if (pin) document.getElementById('input-pin').value = pin;
});

// ========================================================
// SCREEN MANAGEMENT
// ========================================================
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Toggle Spectator UI
    const spectatorUI = document.getElementById('spectator-ui');
    if (spectatorUI) {
        // Show for spectators OR for players on question/stage screens
        const isSpectatorScreen = ['question', 'watch', 'result', 'leaderboard', 'gameover', 'stage'].includes(id);
        if (role === 'player' && isSpectatorScreen) {
            spectatorUI.classList.remove('hidden');
        } else {
            spectatorUI.classList.add('hidden');
        }
    }
}
function backToMain() { showScreen('main'); }

// ========================================================
// JOIN & CREATE ROOM
// ========================================================
document.getElementById('btn-join').addEventListener('click', joinRoom);

async function joinRoom() {
    const pin = document.getElementById('input-pin').value.trim();
    nickname = document.getElementById('input-nickname').value.trim();
    if (!pin || !nickname) return alert('กรุณาใส่ Game PIN และ Nickname');

    try {
        const snap = await db.ref('rooms/' + pin).once('value');
        if (!snap.exists()) return alert('ไม่พบห้องนี้!');
        const room = snap.val();
        if (room.state !== 'lobby') return alert('เกมเริ่มไปแล้ว!');

        roomId = pin; role = 'player'; playerId = 'p' + Date.now();

        await db.ref('rooms/' + pin + '/players/' + playerId).set({
            name: nickname, score: 0, answered: false, isEliminated: false
        });

        document.getElementById('lobby-pin').textContent = pin;
        showScreen('lobby');
        listenRoom();
    } catch (e) { console.error(e); alert('Error connecting to Firebase'); }
}

document.querySelectorAll('.mode-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-toggle').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameMode = btn.dataset.mode;
    });
});

document.getElementById('btn-create-room').addEventListener('click', createRoom);

async function createRoom() {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    roomId = pin; role = 'host';

    try {
        await db.ref('rooms/' + pin).set({
            state: 'lobby', qIndex: -1, answersCount: 0, timerStart: 0, players: {},
            gameMode: gameMode, turnPlayerId: null, turnDone: 0
        });
        document.getElementById('lobby-pin').textContent = pin;
        document.getElementById('host-start-area').classList.remove('hidden');
        showScreen('lobby');
        listenRoom();
    } catch (e) { console.error(e); alert('Error creating room'); }
}

// ========================================================
// ROOM LISTENER
// ========================================================
function listenRoom() {
    if (unsubscribe) unsubscribe();
    const roomRef = db.ref('rooms/' + roomId);
    const handler = roomRef.on('value', snap => {
        const data = snap.val();
        if (!data) return;
        roomQuestions = data.questions || [];

        switch (data.state) {
            case 'lobby': renderLobbyPlayers(data.players); break;
            case 'question':
                if (currentQIndex !== data.qIndex) {
                    currentQIndex = data.qIndex; hasAnswered = false;
                    role === 'host' ? showHostQuestion(data) : showPlayerQuestion(data);
                }
                if (role === 'host') {
                    document.getElementById('host-answers').textContent = data.answersCount || 0;
                    const pc = Object.keys(data.players || {}).length;
                    document.getElementById('host-total-players').textContent = pc;
                    if (pc > 0 && (data.answersCount || 0) >= pc) {
                        clearInterval(timerInterval);
                        setTimeout(() => goLeaderboard(), 500);
                    }
                }
                document.getElementById('ac-count').textContent = data.answersCount || 0;
                break;
            case 'leaderboard': renderLeaderboard(data.players); break;
            case 'gameover': renderGameOver(data.players); break;
            case 'stage':
                if (currentQIndex !== data.qIndex || turnPlayerId !== data.turnPlayerId) {
                    currentQIndex = data.qIndex; turnPlayerId = data.turnPlayerId;
                    hasAnswered = false; handleStageState(data);
                }
                if (role === 'host' && data.turnDone > 0) {
                    db.ref('rooms/' + roomId + '/turnDone').set(0);
                    nextStageTurn(); // Immediate next turn
                }
                break;
        }
    });

    // Shoutout Listener
    const shoutRef = db.ref('rooms/' + roomId + '/shoutouts');
    shoutRef.limitToLast(1).on('child_added', snap => {
        const msg = snap.val();
        // Relaxed check to ensure visibility even with slight clock drift
        if (msg && Date.now() - msg.timestamp < 10000) {
            renderShoutout(msg.text);
        }
    });

    unsubscribe = () => {
        roomRef.off('value', handler);
        shoutRef.off();
    };
}

function handleStageState(data) {
    const q = data.questions ? data.questions[data.qIndex] : null;
    if (!q) return;
    const isMyTurn = (playerId === data.turnPlayerId);
    const activePlayer = data.players[data.turnPlayerId];

    if (role === 'host') { renderHostStage(data, q, activePlayer); }
    else {
        if (isMyTurn) renderPlayerStage(data, q);
        else renderWatchStage(data, q, activePlayer);
    }
}

function renderHostStage(data, q, player) {
    document.getElementById('stage-q-text').textContent = q.q;
    const stagePlayer = document.getElementById('active-player-stage');
    stagePlayer.innerHTML = `
        <div style="font-size: 8rem; margin: 20px 0;">👤</div>
        <div class="player-name-stage" style="font-size: 3rem;">${player.name}</div>
    `;
    const optsArea = document.getElementById('stage-options');
    optsArea.innerHTML = '';
    q.opts.forEach((opt, i) => {
        const btn = document.createElement('div');
        btn.className = 'host-opt-big ' + COLORS[i];
        btn.innerHTML = '<span class="opt-shape">' + SHAPES[i] + '</span><span class="opt-text">' + opt + '</span>';
        optsArea.appendChild(btn);
    });
    renderAudience(data.players);
    showScreen('stage');
    startStageTimer(30);
}

function renderPlayerStage(data, q) {
    document.getElementById('q-text').textContent = q.q;
    document.getElementById('q-progress').textContent = 'ตาของคุณ! (30 วินาที)';

    // Hide answers count in Elimination mode (it's personal turn)
    const ac = document.querySelector('.answers-counter');
    if (ac) ac.style.visibility = 'hidden';

    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    q.opts.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn ' + COLORS[i];
        btn.innerHTML = '<span class="opt-shape">' + SHAPES[i] + '</span><span class="opt-text">' + opt + '</span>';
        btn.addEventListener('click', () => submitStageAnswer(i));
        grid.appendChild(btn);
    });
    showScreen('question');
    startStageTimer(30);
}

function renderWatchStage(data, q, player) {
    document.getElementById('watching-player-name').textContent = player.name;
    document.getElementById('mini-q-text').textContent = q.q;
    showScreen('watch');
    startStageTimer(30, true);
}

function renderAudience(players) {
    const list = document.getElementById('audience-list');
    list.innerHTML = '';
    Object.values(players).forEach(p => {
        const chip = document.createElement('div');
        chip.className = 'audience-chip' + (p.isEliminated ? ' eliminated' : '');
        chip.textContent = p.name;
        list.appendChild(chip);
    });
}

async function sendShoutout() {
    const input = document.getElementById('shoutout-msg');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    await db.ref('rooms/' + roomId + '/shoutouts').push({
        text: msg, timestamp: Date.now()
    });
}

function renderShoutout(text) {
    const containers = [
        document.getElementById('stage-shoutouts'),
        document.getElementById('host-shoutouts'),
        document.getElementById('question-shoutouts'),
        document.getElementById('watch-shoutouts')
    ].filter(el => el !== null);

    if (containers.length === 0) return;

    containers.forEach(container => {
        const bubble = document.createElement('div');
        bubble.className = 'shoutout-bubble';
        bubble.textContent = text;
        bubble.style.left = (Math.random() * 60 + 20) + '%';
        container.appendChild(bubble);
        setTimeout(() => bubble.remove(), 4000);
    });
}

function startStageTimer(duration, displayOnly = false) {
    if (timerInterval) clearInterval(timerInterval);
    let time = duration;
    const updateUI = (val) => {
        ['stage-timer-text', 'mini-timer', 'timer-text'].forEach(id => {
            const el = document.getElementById(id); if (el) el.textContent = val;
        });
    };
    updateUI(time);
    timerInterval = setInterval(async () => {
        time--; updateUI(time);
        if (time <= 0) {
            clearInterval(timerInterval);
            if (!displayOnly && role === 'player' && turnPlayerId === playerId && !hasAnswered) {
                isEliminated = true;
                await db.ref('rooms/' + roomId + '/players/' + playerId).update({ isEliminated: true });
                showPlayerResult(false, 0);
            }
            if (!displayOnly && role === 'host') nextStageTurn(); // No delay on host timeout
        }
    }, 1000);
}

async function submitStageAnswer(idx) {
    if (hasAnswered) return; hasAnswered = true;
    const roomSnap = await db.ref('rooms/' + roomId).once('value');
    const roomData = roomSnap.val();
    const q = roomData.questions[currentQIndex];
    const correct = (Number(idx) === Number(q.ans));
    if (!correct) {
        isEliminated = true;
        await db.ref('rooms/' + roomId + '/players/' + playerId).update({ isEliminated: true });
    }
    showPlayerResult(correct, correct ? 1000 : 0, q.opts[q.ans]);
    await db.ref('rooms/' + roomId).update({ turnDone: Date.now() });
}

async function nextStageTurn() {
    if (role !== 'host') return; clearInterval(timerInterval);
    const snap = await db.ref('rooms/' + roomId).once('value');
    const room = snap.val();
    const survivors = Object.entries(room.players || {}).filter(([id, p]) => !p.isEliminated).map(([id]) => id);
    if (survivors.length <= 1) { await db.ref('rooms/' + roomId).update({ state: 'gameover' }); return; }

    let nextId = survivors[Math.floor(Math.random() * survivors.length)];
    if (nextId === room.turnPlayerId && survivors.length > 1) {
        nextId = survivors.find(id => id !== room.turnPlayerId);
    }
    const nextLevel = room.qIndex + 2; // Next question level
    const nextQ = generateBasicQ(nextLevel);
    await db.ref('rooms/' + roomId).update({
        qIndex: room.qIndex + 1,
        turnPlayerId: nextId,
        timerStart: Date.now(),
        turnDone: 0,
        [`questions/${room.qIndex + 1}`]: nextQ
    });
}

function renderLobbyPlayers(players) {
    const container = document.getElementById('lobby-players');
    container.innerHTML = '';
    const arr = Object.values(players || {});
    document.getElementById('lobby-player-count').textContent = arr.length;
    arr.forEach(p => {
        const chip = document.createElement('div');
        chip.className = 'player-chip'; chip.textContent = p.name;
        container.appendChild(chip);
    });
}

document.getElementById('btn-start-game').addEventListener('click', async () => {
    if (role !== 'host') return;
    const snap = await db.ref('rooms/' + roomId).once('value');
    const room = snap.val();
    const newQuestions = Array.from({ length: 13 }, (_, i) => generateBasicQ(i + 1));

    if (room.gameMode === 'elimination') {
        const players = Object.keys(room.players || {});
        if (players.length === 0) return alert('No players?');
        const first = players[Math.floor(Math.random() * players.length)];
        await db.ref('rooms/' + roomId).update({
            state: 'stage',
            qIndex: 0,
            turnPlayerId: first,
            questions: [newQuestions[0]] // Start with first, BR generates one by one
        });
    } else {
        await db.ref('rooms/' + roomId).update({
            state: 'question',
            qIndex: 0,
            answersCount: 0,
            timerStart: Date.now(),
            questions: newQuestions
        });
        const psnap = await db.ref('rooms/' + roomId + '/players').once('value');
        const updates = {}; psnap.forEach(c => { updates[c.key + '/answered'] = false; });
        await db.ref('rooms/' + roomId + '/players').update(updates);
    }
});

function showHostQuestion(data) {
    const q = data.questions[data.qIndex];
    document.getElementById('host-q-text').textContent = q.q;
    document.getElementById('host-q-num').textContent = 'ข้อ ' + (data.qIndex + 1) + '/' + data.questions.length;
    document.getElementById('host-formula-text').textContent = q.formula;
    const optsArea = document.getElementById('host-options-display');
    optsArea.innerHTML = '';
    q.opts.forEach((opt, i) => {
        const btn = document.createElement('div');
        btn.className = 'host-opt-big ' + COLORS[i];
        btn.innerHTML = '<span class="opt-shape">' + SHAPES[i] + '</span><span class="opt-text">' + opt + '</span>';
        optsArea.appendChild(btn);
    });
    document.getElementById('host-answers').textContent = data.answersCount || 0;
    document.getElementById('host-total-players').textContent = Object.keys(data.players || {}).length;
    showScreen('host-wait'); startCountdown('host-timer-text', 'host-timer-ring');
}

function showPlayerQuestion(data) {
    const q = data.questions[data.qIndex];
    document.getElementById('q-text').textContent = q.q;
    document.getElementById('q-progress').textContent = 'ข้อ ' + (data.qIndex + 1) + '/' + data.questions.length;
    document.getElementById('formula-text').textContent = q.formula;

    // Show answers count in Classic mode
    const ac = document.querySelector('.answers-counter');
    if (ac) ac.style.visibility = 'visible';

    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    q.opts.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn ' + COLORS[i];
        btn.innerHTML = '<span class="opt-shape">' + SHAPES[i] + '</span><span class="opt-text">' + opt + '</span>';
        btn.addEventListener('click', () => submitAnswer(i));
        grid.appendChild(btn);
    });
    showScreen('question'); startCountdown('timer-text', 'timer-ring');
}

function startCountdown(textId, ringId) {
    if (timerInterval) clearInterval(timerInterval);
    const circumference = 2 * Math.PI * 45;
    const updateTimer = () => {
        db.ref('rooms/' + roomId + '/timerStart').once('value', snap => {
            const start = snap.val() || Date.now();
            const elapsed = Math.floor((Date.now() - start) / 1000);
            timeLeft = Math.max(30 - elapsed, 0);
            document.getElementById(textId).textContent = timeLeft;
            document.getElementById(ringId).style.strokeDashoffset = ((30 - timeLeft) / 30) * circumference;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                if (role === 'host') goLeaderboard();
                else if (!hasAnswered) showPlayerResult(false, 0);
            }
        });
    };
    updateTimer(); timerInterval = setInterval(updateTimer, 1000);
}

async function submitAnswer(idx) {
    if (hasAnswered || role !== 'player') return; hasAnswered = true;
    const q = roomQuestions[currentQIndex];
    const correct = (Number(idx) === Number(q.ans));
    let pts = correct ? 1000 + Math.floor((timeLeft / 30) * 500) : 0;
    totalScore += pts;
    await db.ref('rooms/' + roomId + '/players/' + playerId).update({ score: totalScore, answered: true });
    await db.ref('rooms/' + roomId + '/answersCount').transaction(c => (c || 0) + 1);
    showPlayerResult(correct, pts, q.opts[q.ans]);
}

function showPlayerResult(correct, pts, correctAnsText = '') {
    clearInterval(timerInterval);
    const box = document.getElementById('result-box');
    if (correct) {
        box.innerHTML = `
            <div class="result-emoji">✅</div>
            <div class="result-title" style="color:#5efc5e;">ถูกต้อง!</div>
            <div class="result-points">+${pts.toLocaleString()} คะแนน</div>
        `;
    } else {
        box.innerHTML = `
            <div class="result-emoji">❌</div>
            <div class="result-title" style="color:#ff6b6b;">ยังไม่ถูกนะ</div>
            <div class="result-correct-card">
                <div class="correct-label">คำตอบที่ถูกต้องคือ</div>
                <div class="correct-ans-text">${correctAnsText}</div>
            </div>
        `;
    }
    box.innerHTML += `
        <div class="result-total" style="margin-top:30px; opacity:0.6;">
            คะแนนสะสม: ${totalScore.toLocaleString()}
        </div>
    `;
    showScreen('result');
}

async function goLeaderboard() {
    if (role !== 'host') return; clearInterval(timerInterval);
    await db.ref('rooms/' + roomId).update({ state: 'leaderboard' });
}

function renderLeaderboard(players) {
    clearInterval(timerInterval);
    const list = document.getElementById('lb-list'); list.innerHTML = '';
    const sorted = Object.values(players || {}).sort((a, b) => b.score - a.score);
    sorted.forEach((p, i) => {
        const row = document.createElement('div');
        row.className = 'lb-row';
        row.innerHTML = '<div class="lb-left"><span>' + (i + 1) + '</span><span>' + p.name + '</span></div><span>' + (p.score || 0).toLocaleString() + '</span>';
        list.appendChild(row);
    });
    document.getElementById('lb-host-controls').classList[role === 'host' ? 'remove' : 'add']('hidden');
    showScreen('leaderboard');
}

document.getElementById('btn-next-q').addEventListener('click', async () => {
    if (role !== 'host') return;
    const nextIdx = currentQIndex + 1;
    if (nextIdx >= roomQuestions.length) { await db.ref('rooms/' + roomId).update({ state: 'gameover' }); return; }
    const psnap = await db.ref('rooms/' + roomId + '/players').once('value');
    const updates = {}; psnap.forEach(c => { updates[c.key + '/answered'] = false; });
    await db.ref('rooms/' + roomId + '/players').update(updates);
    await db.ref('rooms/' + roomId).update({ state: 'question', qIndex: nextIdx, answersCount: 0, timerStart: Date.now() });
});

function renderGameOver(players) {
    clearInterval(timerInterval);
    db.ref('rooms/' + roomId + '/gameMode').once('value', msnap => {
        const mode = msnap.val();
        const sorted = Object.values(players || {}).sort((a, b) => b.score - a.score);
        const podium = document.getElementById('podium'); podium.innerHTML = '';
        document.querySelector('.gameover-title').textContent = (mode === 'elimination') ? 'VICTORY ROYALE' : 'GAME OVER';

        const order = [];
        if (sorted[1]) order.push({ ...sorted[1], rank: 2 });
        if (sorted[0]) order.push({ ...sorted[0], rank: 1 });
        if (sorted[2]) order.push({ ...sorted[2], rank: 3 });

        const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
        order.forEach(p => {
            const col = document.createElement('div'); col.className = 'podium-col podium-' + p.rank;
            col.innerHTML = `<div class="podium-medal">${medals[p.rank]}</div><div style="font-size:3rem;margin:10px 0;">👤</div><div class="podium-name">${p.name}</div><div class="podium-score">${(mode === 'elimination' && p.isEliminated) ? 'Eliminated' : (p.score || 0).toLocaleString()}</div>`;
            podium.appendChild(col);
        });
        spawnConfetti(); showScreen('gameover');
    });
}

function spawnConfetti() {
    const area = document.getElementById('confetti-area'); area.innerHTML = '';
    for (let i = 0; i < 60; i++) {
        const c = document.createElement('div');
        c.style.cssText = 'position:fixed;width:10px;height:10px;background:hsl(' + (Math.random() * 360) + ',70%,50%);top:-10px;left:' + Math.random() * 100 + 'vw;animation:confettiFall ' + (2 + Math.random() * 3) + 's linear forwards;';
        area.appendChild(c);
    }
}

document.getElementById('btn-shoutout')?.addEventListener('click', sendShoutout);
document.getElementById('shoutout-msg')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendShoutout();
});

console.log('✅ Math Quiz Challenge loaded!');
