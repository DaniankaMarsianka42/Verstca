/* script.js - ФИНАЛЬНАЯ ВЕРСИЯ С ОЧИСТКОЙ РЕКОРДОВ */

const STATE = {
    username: '',
    level: 1,
    score: 0,
    timeRemaining: 0,
    timerInterval: null,
    jugs: [],
    targetAmount: 0,
    selectedJugIndex: null,
    isGameActive: false
};

const DB_KEY = 'water_pouring_leaderboard';

// === BFS-РЕШАТЕЛЬ ===
function solveWaterJug(capacities, target) {
    const queue = [];
    const visited = new Set();
    const startState = capacities.map((cap, i) => i === 0 ? cap : 0);
    queue.push({ state: startState, steps: 0 });
    visited.add(startState.join(','));

    while (queue.length > 0) {
        const { state, steps } = queue.shift();
        if (state.some(amount => amount === target)) return true;

        for (let from = 0; from < capacities.length; from++) {
            for (let to = 0; to < capacities.length; to++) {
                if (from === to || state[from] === 0 || state[to] === capacities[to]) continue;
                const newState = [...state];
                const pour = Math.min(newState[from], capacities[to] - newState[to]);
                newState[from] -= pour;
                newState[to] += pour;
                const stateKey = newState.join(',');
                if (!visited.has(stateKey)) {
                    visited.add(stateKey);
                    queue.push({ state: newState, steps: steps + 1 });
                }
            }
        }
    }
    return false;
}

// === ГЕНЕРАТОР РЕШАЕМЫХ УРОВНЕЙ ===
function generateLevel(levelNum) {
    const minCap = 3 + Math.floor(levelNum / 2);
    const maxCap = 7 + levelNum;
    const jugCount = Math.min(2 + Math.floor(levelNum / 2), 4);
    
    let attempts = 0;
    let jugsConfig, target;
    
    while (attempts < 100) {
        attempts++;
        const capacities = [];
        for(let i = 0; i < jugCount; i++) {
            capacities.push(Math.floor(Math.random() * (maxCap - minCap + 1)) + minCap);
        }
        target = Math.floor(Math.random() * Math.max(...capacities)) + 1;
        
        if (solveWaterJug(capacities, target)) {
            jugsConfig = capacities.map((cap, i) => ({ 
                capacity: cap, 
                current: i === 0 ? cap : 0,
                id: i 
            }));
            console.log(`✅ Уровень ${levelNum} (попытка ${attempts}):`, 
                       jugsConfig.map(j=>`${j.current}/${j.capacity}`).join(', '), 
                       `→ ${target}л`);
            break;
        }
    }
    
    if (attempts >= 100) {
        console.error('❌ Fallback на классику 5-3→4');
        jugsConfig = [{capacity: 5, current: 5, id: 0}, {capacity: 3, current: 0, id: 1}];
        target = 4;
    }
    
    const timeLimit = Math.max(30, 120 - (levelNum * 8));
    return { jugs: jugsConfig, target, timeLimit };
}

// === UI ===
const screens = {
    login: document.getElementById('page-login'),
    game: document.getElementById('page-game'),
    results: document.getElementById('page-results')
};

function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
}

function renderJugs() {
    const container = document.getElementById('game-area');
    container.innerHTML = '';
    STATE.jugs.forEach((jug, index) => {
        const el = document.createElement('div');
        el.className = 'jug-container';
        const heightPx = 120 + (jug.capacity * 12);
        const waterPercent = (jug.current / jug.capacity) * 100;

        el.innerHTML = `
            <div class="jug" id="jug-${index}" style="height: ${heightPx}px;" 
                 draggable="${STATE.level > 1 ? 'true' : 'false'}" 
                 data-index="${index}">
                <div class="water" style="height: ${waterPercent}%;"></div>
            </div>
            <div class="jug-info">${jug.current}/${jug.capacity}</div>
        `;
        bindJugEvents(el.querySelector('.jug'), index);
        container.appendChild(el);
    });
}

function updateHUD() {
    document.getElementById('level-display').textContent = STATE.level;
    document.getElementById('score-display').textContent = STATE.score;
    document.getElementById('time-display').textContent = STATE.timeRemaining;
    document.getElementById('target-display').textContent = STATE.targetAmount;
}

// === ИГРА ===
function startGame(name) {
    STATE.username = name;
    STATE.score = 0;
    STATE.level = 1;
    startLevel();
    showScreen('game');
}

function startLevel() {
    const levelData = generateLevel(STATE.level);
    STATE.jugs = levelData.jugs;
    STATE.targetAmount = levelData.target;
    STATE.timeRemaining = levelData.timeLimit;
    STATE.selectedJugIndex = null;
    STATE.isGameActive = true;

    let instruction = "🎯 Уровень 1: Кликните сосуд → кликните другой (перелить)";
    if(STATE.level === 2) instruction = "🖱️ Уровень 2: Перетаскивайте сосуды (Drag & Drop)";
    if(STATE.level >= 3) instruction = "⌨️ Уровень 3+: 1-4 клавиши, ПКМ=меню";
    
    document.getElementById('level-instruction').textContent = instruction;
    renderJugs();
    updateHUD();
    startTimer();
}

function startTimer() {
    clearInterval(STATE.timerInterval);
    const interval = STATE.level > 3 ? 800 : 1000;
    STATE.timerInterval = setInterval(() => {
        if(!STATE.isGameActive) return;
        STATE.timeRemaining--;
        updateHUD();
        if(STATE.timeRemaining <= 0) endGame(false, "⏰ Время вышло!");
    }, interval);
}

function pourWater(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    const fromJug = STATE.jugs[fromIndex];
    const toJug = STATE.jugs[toIndex];
    if (fromJug.current === 0 || toJug.current === toJug.capacity) return;

    const availableSpace = toJug.capacity - toJug.current;
    const amountToPour = Math.min(fromJug.current, availableSpace);
    fromJug.current -= amountToPour;
    toJug.current += amountToPour;
    renderJugs();
    checkWinCondition();
}

function emptyJug(index) {
    if(STATE.jugs[index].current > 0) {
        STATE.jugs[index].current = 0;
        STATE.score = Math.max(0, STATE.score - 50);
        renderJugs();
        updateHUD();
    }
}

function checkWinCondition() {
    if (STATE.jugs.some(j => j.current === STATE.targetAmount)) {
        clearInterval(STATE.timerInterval);
        const bonus = STATE.timeRemaining * 10;
        STATE.score += 100 + bonus;
        setTimeout(() => {
            alert(`🎉 Уровень ${STATE.level} пройден!\nБонус за время: +${bonus}\nВсего: ${STATE.score}`);
            STATE.level++;
            startLevel();
        }, 300);
    }
}

function endGame(saved, reason) {
    STATE.isGameActive = false;
    clearInterval(STATE.timerInterval);
    if(!saved) alert(reason);
    saveResult(STATE.username, STATE.score);
    showLeaderboard();
    showScreen('results');
}

// === СОБЫТИЯ ===
function bindJugEvents(element, index) {
    // Клик
    element.onclick = (e) => {
        if (STATE.level === 2) return;
        if (STATE.selectedJugIndex === null) {
            STATE.selectedJugIndex = index;
            element.classList.add('selected');
        } else {
            pourWater(STATE.selectedJugIndex, index);
            document.getElementById(`jug-${STATE.selectedJugIndex}`)?.classList.remove('selected');
            STATE.selectedJugIndex = null;
        }
    };

    // Drag & Drop (уровень 2)
    if (STATE.level === 2) {
        element.ondragstart = (e) => {
            e.dataTransfer.setData("text/plain", index);
            element.classList.add('dragging');
        };
        element.ondragover = (e) => {
            e.preventDefault();
            element.classList.add('drag-over');
        };
        element.ondragleave = (e) => element.classList.remove('drag-over');
        element.ondrop = (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
            const fromIdx = parseInt(e.dataTransfer.getData("text/plain"));
            document.getElementById(`jug-${fromIdx}`)?.classList.remove('dragging');
            pourWater(fromIdx, index);
        };
    }

    // Контекстное меню (уровень 3+)
    if (STATE.level >= 3) {
        element.oncontextmenu = (e) => {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, index);
        };
    }
}

const ctxMenu = document.getElementById('context-menu');
let ctxTargetIndex = null;

function showContextMenu(x, y, index) {
    ctxMenu.style.display = 'block';
    ctxMenu.style.left = `${x}px`;
    ctxMenu.style.top = `${y}px`;
    ctxTargetIndex = index;
}

document.addEventListener('click', () => ctxMenu.style.display = 'none');
document.getElementById('ctx-empty').onclick = () => {
    if(ctxTargetIndex !== null) emptyJug(ctxTargetIndex);
    ctxMenu.style.display = 'none';
};

// Клавиатура
document.addEventListener('keydown', (e) => {
    if(!STATE.isGameActive || STATE.level < 3) return;
    const key = parseInt(e.key);
    if (key > 0 && key <= STATE.jugs.length) {
        const idx = key - 1;
        document.getElementById(`jug-${idx}`)?.click();
    }
});

// === РЕЙТИНГ БЕЗ ВРЕМЕНИ + ОЧИСТКА ===
function saveResult(name, score) {
    let data = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const existingIndex = data.findIndex(item => item.name.toLowerCase() === name.toLowerCase());
    
    if (existingIndex !== -1) {
        if (score > data[existingIndex].score) {
            data[existingIndex] = { name, score }; // Без времени
            console.log(`✅ ${name}: ${data[existingIndex].score} → ${score}`);
        }
    } else {
        data.push({ name, score }); // Без времени
    }
    
    data.sort((a, b) => b.score - a.score);
    data = data.slice(0, 10);
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function showLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    const data = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    
    document.getElementById('result-name').textContent = STATE.username;
    document.getElementById('result-score').textContent = STATE.score.toLocaleString();

    if (data.length === 0) {
        list.innerHTML = '<li style="justify-content: center;">📭 Пока нет рекордов</li>';
        return;
    }

    data.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>#${index + 1} ${item.name}</span> 
            <span>${item.score.toLocaleString()}</span>
        `;
        list.appendChild(li);
    });
}

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-form').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('username').value.trim();
        if(name) startGame(name);
    };

    document.getElementById('show-leaderboard-btn').onclick = () => {
        showLeaderboard();
        document.getElementById('result-title').textContent = '🏆 Таблица рекордов';
        document.getElementById('go-home-btn').textContent = '🏠 Главная';
        document.getElementById('play-again-btn').textContent = '🚀 Новая игра';
        showScreen('results');
    };

    document.getElementById('go-home-btn').onclick = () => showScreen('login');
    
    document.getElementById('play-again-btn').onclick = () => {
        STATE.level = 1;
        STATE.score = 0;
        startGame(STATE.username);
    };

    // ✅ НОВАЯ КНОПКА ОЧИСТКИ
    document.getElementById('clear-leaderboard-btn').onclick = () => {
        if(confirm('🗑️ Очистить все рекорды?\nЭто действие нельзя отменить!')) {
            localStorage.removeItem(DB_KEY);
            showLeaderboard();
            alert('✅ Рекорды очищены!');
        }
    };

    document.getElementById('abort-game-btn').onclick = () => {
        if(confirm('Завершить игру и сохранить результат?')) {
            endGame(true, null);
        }
    };

    document.getElementById('restart-level-btn').onclick = () => {
        STATE.score = Math.max(0, STATE.score - 20);
        startLevel();
    };
});