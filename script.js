const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- 0. Аудиосистема и Синтезатор Музыки ---
let audioCtx = null;
let musicEnabled = true;
let isMusicPlaying = false;
let musicInterval = null;
let noteIndex = 0;

const melody = [
    261.63, 329.63, 392.00, 523.25, 392.00, 329.63,
    293.66, 349.23, 440.00, 587.33, 440.00, 349.23,
    261.63, 329.63, 392.00, 523.25, 440.00, 392.00, 349.23, 293.66
];

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function startBackgroundMusic() {
    if (!musicEnabled || isMusicPlaying) return;
    initAudio();
    isMusicPlaying = true;
    noteIndex = 0;

    musicInterval = setInterval(() => {
        if (!musicEnabled || gameState !== 'PLAYING') return;

        try {
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();

            osc.type = 'square';
            let freq = melody[noteIndex % melody.length];
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.12);

            noteIndex++;
        } catch (e) {}
    }, 150);
}

function stopBackgroundMusic() {
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
    isMusicPlaying = false;
}

function playHoverSound() {
    try {
        initAudio();
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {}
}

function playClickSound() {
    try {
        initAudio();
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}
}

function playShootSound() {
    try {
        initAudio();
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {}
}

function playExplosionSound() {
    try {
        initAudio();
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(120, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
}

function playCoinSound() {
    try {
        initAudio();
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {}
}

function playPowerUpSound() {
    try {
        initAudio();
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {}
}

// --- 1. Профиль игрока ---
let playerProfile = {
    totalXp: 0,
    coins: 0,
    maxWave: 1,
    unlockedLevel: 1, // Максимальный открытый уровень в режиме кампании
    completedLevels: [], // Массив пройденных уровней
    destroyedBlocksTotal: 0,
    bossesDefeated: 0,
    coinsCollectedTotal: 0,
    ownedSkins: ['default'],
    ownedBulletSkins: ['default'],
    ownedTankEffects: ['none'],
    ownedExplosionEffects: ['default'],
    ownedPerks: [],
    activeTankSkin: 'default',
    activeBulletSkin: 'default',
    activeTankEffect: 'none',
    activeExplosionEffect: 'default',
    achievementsClaimed: []
};

function loadProfile() {
    const saved = localStorage.getItem('tankGameProfile');
    if (saved) playerProfile = { ...playerProfile, ...JSON.parse(saved) };
}

function saveProfile() {
    localStorage.setItem('tankGameProfile', JSON.stringify(playerProfile));
}

loadProfile();

const ACHIEVEMENTS = [
    { id: 'blocks_50', title: 'Разрушитель I', desc: 'Уничтожить 50 блоков всего', target: 50, reward: 30, type: 'destroyedBlocksTotal' },
    { id: 'blocks_200', title: 'Разрушитель II', desc: 'Уничтожить 200 блоков всего', target: 200, reward: 100, type: 'destroyedBlocksTotal' },
    { id: 'blocks_500', title: 'Легион Блоков', desc: 'Уничтожить 500 блоков всего', target: 500, reward: 250, type: 'destroyedBlocksTotal' },
    { id: 'boss_1', title: 'Гроза Боссов', desc: 'Победить 1 босса', target: 1, reward: 50, type: 'bossesDefeated' },
    { id: 'boss_5', title: 'Ликвидатор Боссов', desc: 'Победить 5 боссов', target: 5, reward: 150, type: 'bossesDefeated' },
    { id: 'coins_50', title: 'Коллекционер', desc: 'Собрать 50 монет всего', target: 50, reward: 60, type: 'coinsCollectedTotal' },
    { id: 'wave_5', title: 'Ветеран', desc: 'Дойти до 5 волны', target: 5, reward: 75, type: 'maxWave' }
];

const SHOP_ITEMS = {
    tankSkins: [
        { id: 'default', name: 'Классик', price: 0, color: '#4CAF50' },
        { id: 'cyber', name: 'Киберпанк', price: 50, color: '#00E5FF' },
        { id: 'lava', name: 'Огненный', price: 100, color: '#FF3D00' },
        { id: 'gold', name: 'Золотой', price: 250, color: '#FFD700' },
        { id: 'matrix', name: 'Матрица', price: 400, color: '#00FF66' }
    ],
    bulletSkins: [
        { id: 'default', name: 'Лазер (Голубой)', price: 0, color: '#00BCD4' },
        { id: 'plasma', name: 'Плазма (Фиолетовый)', price: 30, color: '#E040FB' },
        { id: 'fire', name: 'Пламя (Оранжевый)', price: 75, color: '#FF6D00' },
        { id: 'rainbow', name: 'Радуга', price: 200, color: '#FF00AA' }
    ],
    tankEffects: [
        { id: 'none', name: 'Без эффекта', price: 0 },
        { id: 'trail', name: 'Дымный след', price: 60 },
        { id: 'aura', name: 'Неоновая Аура', price: 150 }
    ],
    perks: [
        { id: 'extra_hp', name: '+100 Стартового HP', price: 120, desc: 'Начинать игру с большими HP' },
        { id: 'crit_chance', name: 'Шанс Крита (15%)', price: 250, desc: 'Шанс нанести двойной урон' },
        { id: 'coin_magnet', name: 'Магнит Монет', price: 300, desc: 'Ускоренный сбор монет' }
    ]
};

// --- 2. Состояния Игры ---
// Добавлено состояние 'LEVEL_SELECT'
let gameState = 'MENU';
let gameMode = 'ENDLESS'; // 'ENDLESS' или 'LEVELS'

let score = 0;
let wave = 1;
let currentStage = 1;
let destroyedCount = 0;

let doubleXpActive = false;
let doubleXpTimer = null;

let doubleSpeedActive = false;
let doubleSpeedTimer = null;

let shieldActive = false;
let shieldTimer = null;

let laserActiveAnimation = null;

let isAutoFiring = true;
let lastShootTime = 0;
let baseShootInterval = 250;

let blocksToSpawn = 0;
let totalWaveBlocks = 0;
let lastSpawnTime = 0;
const spawnInterval = 750;
let isBossWave = false;

let hoveredButtonId = null;
let mouseX = canvas.width / 2;

const tank = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 40,
    height: 40,
    speed: 0.15,
    hp: 500,
    maxHp: 500,
    bulletDamage: 1,
    bulletCount: 1
};

const bullets = [];
const bossBullets = [];
const blocks = [];
const powerUps = [];
const coinsList = [];
const particles = [];
let upgradeOptions = [];

const menuButtons = [
    { id: 'endless', text: '1. Бесконечный режим', x: 250, y: 220, w: 300, h: 45 },
    { id: 'levels', text: '2. Прохождение уровней', x: 250, y: 280, w: 300, h: 45 },
    { id: 'shop', text: '🛒 Магазин и Улучшения', x: 250, y: 340, w: 300, h: 45 },
    { id: 'achievements', text: '🏆 Достижения и Квесты', x: 250, y: 400, w: 300, h: 45 },
    { id: 'reset', text: 'Сбросить профиль', x: 300, y: 535, w: 200, h: 35 }
];

let shopCategory = 'tankSkins';

// --- 3. Спавн Уровней ---
function startWaveSpawning() {
    blocks.length = 0;
    bossBullets.length = 0;
    let currentWaveNum = gameMode === 'ENDLESS' ? wave : currentStage;

    isBossWave = (currentWaveNum % 5 === 0);

    if (isBossWave) {
        totalWaveBlocks = 1;
        blocksToSpawn = 1;
    } else {
        totalWaveBlocks = 10 + currentWaveNum * 5;
        blocksToSpawn = totalWaveBlocks;
    }
    lastSpawnTime = 0;
}

function spawnSingleBlock() {
    let currentWaveNum = gameMode === 'ENDLESS' ? wave : currentStage;
    
    if (isBossWave) {
        let bossHp = 50 + currentWaveNum * 20;
        let bossType = 'shooter';
        let bossColor = '#9C27B0';
        let bossName = '👑 БОСС-СТРЕЛОК';

        if (currentWaveNum === 10 || currentWaveNum === 20) {
            bossType = 'shield';
            bossColor = '#00BCD4';
            bossName = '🛡️ БОСС-ЩИТОНОСЕЦ';
        } else if (currentWaveNum >= 15) {
            bossType = 'summoner';
            bossColor = '#FF5722';
            bossName = '⚡ БОСС-ПРИЗЫВАТЕЛЬ';
        }

        blocks.push({
            isBoss: true,
            bossType: bossType,
            name: bossName,
            x: canvas.width / 2 - 120,
            y: -100,
            width: 240,
            height: 80,
            hp: bossHp,
            maxHp: bossHp,
            color: bossColor,
            xpValue: bossHp * 15,
            speed: 0.18,
            lastAbilityTime: Date.now()
        });
        blocksToSpawn = 0;
        return;
    }

    const blockWidth = 70;
    const blockHeight = 28;
    const cols = 9;
    const padding = 12;
    const startX = (canvas.width - (cols * (blockWidth + padding) - padding)) / 2;

    let col = Math.floor(Math.random() * cols);
    let posX = startX + col * (blockWidth + padding);
    
    let rand = Math.random();
    let type = 'normal';
    let baseColor = '#FFEB3B';
    let hp = Math.floor(1 + Math.random() * 3) + (currentWaveNum - 1);

    if (rand < 0.18) {
        type = 'explosive';
        baseColor = '#FF3D00';
    } else if (rand < 0.35) {
        type = 'armored';
        baseColor = '#607D8B';
        hp = Math.floor(hp * 1.5) + 2;
    } else {
        baseColor = hp <= 2 ? '#FFEB3B' : hp <= 4 ? '#FF9800' : '#E91E63';
    }

    let descentSpeed = 0.6 + (currentWaveNum - 1) * 0.08;

    blocks.push({
        x: posX,
        y: -blockHeight,
        width: blockWidth,
        height: blockHeight,
        hp: hp,
        maxHp: hp,
        color: baseColor,
        xpValue: hp * 10,
        speed: descentSpeed,
        type: type
    });

    blocksToSpawn--;
}

function updateSpawning() {
    if (blocksToSpawn > 0) {
        let now = Date.now();
        if (now - lastSpawnTime >= spawnInterval) {
            spawnSingleBlock();
            lastSpawnTime = now;
        }
    }
}

function updateBossAbilities() {
    let now = Date.now();
    for (let blk of blocks) {
        if (!blk.isBoss) continue;

        if (now - blk.lastAbilityTime >= 3000) {
            blk.lastAbilityTime = now;

            if (blk.bossType === 'shooter') {
                bossBullets.push({
                    x: blk.x + blk.width / 2,
                    y: blk.y + blk.height,
                    vx: (tank.x - (blk.x + blk.width / 2)) * 0.015,
                    vy: 4.5,
                    width: 10,
                    height: 14
                });
                playShootSound();
            } else if (blk.bossType === 'shield') {
                blk.hp = Math.min(blk.maxHp, blk.hp + Math.floor(blk.maxHp * 0.15));
            } else if (blk.bossType === 'summoner') {
                blocks.push({
                    x: tank.x + (Math.random() > 0.5 ? 100 : -100),
                    y: 50,
                    width: 70,
                    height: 25,
                    hp: 5,
                    maxHp: 5,
                    color: '#E91E63',
                    xpValue: 50,
                    speed: 0.9,
                    type: 'normal'
                });
            }
        }
    }
}

function triggerExplosiveBlock(destroyedBlock) {
    let radius = 130;
    for (let i = blocks.length - 1; i >= 0; i--) {
        let b = blocks[i];
        if (b === destroyedBlock) continue;

        let dist = Math.hypot((b.x + b.width / 2) - (destroyedBlock.x + destroyedBlock.width / 2), (b.y + b.height / 2) - (destroyedBlock.y + destroyedBlock.height / 2));
        if (dist <= radius) {
            b.hp -= 5;
            createExplosion(b.x + b.width / 2, b.y + b.height / 2, '#FF5722');
            if (b.hp <= 0) {
                let earnedXp = b.xpValue * (doubleXpActive ? 2 : 1);
                score += earnedXp;
                playerProfile.totalXp += earnedXp;
                destroyedCount++;
                playerProfile.destroyedBlocksTotal++;
                coinsList.push({ x: b.x + b.width / 2, y: b.y + b.height / 2, radius: 8, speed: 1.8 });
                blocks.splice(i, 1);
            }
        }
    }
}

// --- 4. Суперсилы ---
function spawnPowerUp(x, y) {
    const types = ['bomb', 'shield', 'speed', 'xp'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    powerUps.push({ x: x, y: y, width: 30, height: 30, speed: 2, type: chosenType });
}

function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        let p = powerUps[i];
        p.y += p.speed;

        if (
            p.x < tank.x + tank.width / 2 &&
            p.x + p.width > tank.x - tank.width / 2 &&
            p.y < tank.y + tank.height / 2 &&
            p.y + p.height > tank.y - tank.height / 2
        ) {
            playPowerUpSound();
            powerUps.splice(i, 1);
            applyPowerUpEffect(p.type);
            continue;
        }

        if (p.y > canvas.height) powerUps.splice(i, 1);
    }
}

function applyPowerUpEffect(type) {
    if (type === 'bomb') {
        laserActiveAnimation = 30;
        for (let j = blocks.length - 1; j >= 0; j--) {
            let b = blocks[j];
            let earnedXp = b.xpValue * (doubleXpActive ? 2 : 1);
            score += earnedXp;
            playerProfile.totalXp += earnedXp;
            destroyedCount++;
            playerProfile.destroyedBlocksTotal++;
            if (b.isBoss) playerProfile.bossesDefeated++;

            createExplosion(b.x + b.width / 2, b.y + b.height / 2, b.color);
            coinsList.push({ x: b.x + b.width / 2, y: b.y + b.height / 2, radius: 8, speed: 1.8 });
            blocks.splice(j, 1);
        }
    } else if (type === 'shield') {
        shieldActive = true;
        if (shieldTimer) clearTimeout(shieldTimer);
        shieldTimer = setTimeout(() => { shieldActive = false; }, 8000);
    } else if (type === 'speed') {
        doubleSpeedActive = true;
        if (doubleSpeedTimer) clearTimeout(doubleSpeedTimer);
        doubleSpeedTimer = setTimeout(() => { doubleSpeedActive = false; }, 10000);
    } else if (type === 'xp') {
        doubleXpActive = true;
        if (doubleXpTimer) clearTimeout(doubleXpTimer);
        doubleXpTimer = setTimeout(() => { doubleXpActive = false; }, 10000);
    }
}

// --- 5. Частицы ---
function createExplosion(x, y, color) {
    playExplosionSound();
    const isFirework = playerProfile.activeExplosionEffect === 'firework';
    const count = isFirework ? 25 : 12;

    for (let i = 0; i < count; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = Math.random() * (isFirework ? 6 : 4) + 1;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 4 + 2,
            color: isFirework ? `hsl(${Math.random() * 360}, 100%, 50%)` : color,
            alpha: 1,
            decay: Math.random() * 0.03 + 0.02
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    for (let p of particles) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// --- 6. Управление и Выбор Уровней ---
window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyM') {
        musicEnabled = !musicEnabled;
        if (musicEnabled && gameState === 'PLAYING') startBackgroundMusic();
        else stopBackgroundMusic();
        return;
    }

    if (gameState === 'MENU') {
        if (e.code === 'Digit1') startMode('ENDLESS');
        if (e.code === 'Digit2') gameState = 'LEVEL_SELECT';
        if (e.code === 'Digit3') gameState = 'SHOP';
        if (e.code === 'Digit4') gameState = 'ACHIEVEMENTS';
        return;
    }

    if (gameState === 'SHOP' || gameState === 'ACHIEVEMENTS' || gameState === 'LEVEL_SELECT') {
        if (e.code === 'Escape' || e.code === 'KeyB') gameState = 'MENU';
        return;
    }

    if (e.code === 'Escape' || e.code === 'KeyP') {
        if (gameState === 'PLAYING') {
            gameState = 'PAUSED';
            stopBackgroundMusic();
            playClickSound();
        } else if (gameState === 'PAUSED') {
            gameState = 'PLAYING';
            startBackgroundMusic();
            playClickSound();
        }
        return;
    }

    if (gameState === 'GAME_OVER' || gameState === 'VICTORY_ALL') {
        if (e.code === 'Space' || e.code === 'KeyR') {
            gameState = gameMode === 'LEVELS' ? 'LEVEL_SELECT' : 'MENU';
        }
        return;
    }

    if (gameState === 'UPGRADE') {
        if (e.code === 'Digit1') selectUpgrade(0);
        if (e.code === 'Digit2') selectUpgrade(1);
        if (e.code === 'Digit3') selectUpgrade(2);
        return;
    }

    if (gameState === 'PLAYING') {
        if (e.code === 'Space') { isAutoFiring = !isAutoFiring; e.preventDefault(); }
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (gameState === 'PLAYING') {
        mouseX = Math.max(tank.width / 2, Math.min(canvas.width - tank.width / 2, currentX));
    }

    let currentHover = null;
    if (gameState === 'MENU') {
        menuButtons.forEach(btn => {
            if (currentX >= btn.x && currentX <= btn.x + btn.w && mouseY >= btn.y && mouseY <= btn.y + btn.h) currentHover = btn.id;
        });
    }

    if (currentHover && currentHover !== hoveredButtonId) playHoverSound();
    hoveredButtonId = currentHover;
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (gameState === 'MENU') {
        menuButtons.forEach(btn => {
            if (clickX >= btn.x && clickX <= btn.x + btn.w && clickY >= btn.y && clickY <= btn.y + btn.h) {
                playClickSound();
                if (btn.id === 'endless') startMode('ENDLESS');
                if (btn.id === 'levels') gameState = 'LEVEL_SELECT';
                if (btn.id === 'shop') gameState = 'SHOP';
                if (btn.id === 'achievements') gameState = 'ACHIEVEMENTS';
                if (btn.id === 'reset') {
                    if (confirm('Сбросить весь прогресс и покупки профиля?')) {
                        localStorage.removeItem('tankGameProfile');
                        location.reload();
                    }
                }
            }
        });
        return;
    }

    if (gameState === 'LEVEL_SELECT') {
        handleLevelSelectClick(clickX, clickY);
        return;
    }

    if (gameState === 'SHOP') { handleShopClick(clickX, clickY); return; }
    if (gameState === 'ACHIEVEMENTS') { handleAchievementsClick(clickX, clickY); return; }

    if (gameState === 'PAUSED') {
        if (clickX >= 300 && clickX <= 500 && clickY >= 250 && clickY <= 300) {
            playClickSound();
            gameState = 'PLAYING';
            startBackgroundMusic();
        }
        if (clickX >= 300 && clickX <= 500 && clickY >= 320 && clickY <= 370) {
            playClickSound();
            stopBackgroundMusic();
            saveProfile();
            gameState = 'MENU';
        }
        return;
    }

    if (gameState === 'UPGRADE') {
        upgradeOptions.forEach((opt, index) => {
            if (clickX >= opt.x && clickX <= opt.x + opt.width && clickY >= opt.y && clickY <= opt.y + opt.height) {
                playClickSound();
                selectUpgrade(index);
            }
        });
    }
});

// Клик по сетке выбора уровней (20 уровней: 5 рядов по 4 кнопки)
function handleLevelSelectClick(x, y) {
    if (x >= 50 && x <= 150 && y >= 40 && y <= 80) {
        playClickSound();
        gameState = 'MENU';
        return;
    }

    for (let i = 1; i <= 20; i++) {
        let col = (i - 1) % 5;
        let row = Math.floor((i - 1) / 5);
        let bx = 110 + col * 120;
        let by = 130 + row * 85;
        let bw = 100;
        let bh = 65;

        if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
            if (i <= playerProfile.unlockedLevel) {
                playClickSound();
                startLevel(i);
            }
        }
    }
}

function handleShopClick(x, y) {
    const tabs = [
        { id: 'tankSkins', name: 'Танки', x: 50, y: 120, w: 120, h: 40 },
        { id: 'bulletSkins', name: 'Пули', x: 180, y: 120, w: 120, h: 40 },
        { id: 'tankEffects', name: 'Аура', x: 310, y: 120, w: 120, h: 40 },
        { id: 'perks', name: 'Перки', x: 440, y: 120, w: 120, h: 40 }
    ];

    tabs.forEach(t => {
        if (x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h) {
            playClickSound();
            shopCategory = t.id;
        }
    });

    if (x >= 50 && x <= 150 && y >= 40 && y <= 80) { playClickSound(); gameState = 'MENU'; return; }

    const items = SHOP_ITEMS[shopCategory];
    if (!items) return;

    items.forEach((item, index) => {
        let ix = 80 + (index % 3) * 220;
        let iy = 190 + Math.floor(index / 3) * 150;

        if (x >= ix && x <= ix + 200 && y >= iy && y <= iy + 130) {
            playClickSound();
            if (shopCategory === 'perks') {
                if (!playerProfile.ownedPerks.includes(item.id) && playerProfile.coins >= item.price) {
                    playerProfile.coins -= item.price;
                    playerProfile.ownedPerks.push(item.id);
                    if (item.id === 'extra_hp') { tank.maxHp += 100; tank.hp += 100; }
                    saveProfile();
                }
            } else {
                let ownedList, activeField;
                if (shopCategory === 'tankSkins') { ownedList = 'ownedSkins'; activeField = 'activeTankSkin'; }
                if (shopCategory === 'bulletSkins') { ownedList = 'ownedBulletSkins'; activeField = 'activeBulletSkin'; }
                if (shopCategory === 'tankEffects') { ownedList = 'ownedTankEffects'; activeField = 'activeTankEffect'; }

                if (playerProfile[ownedList].includes(item.id)) {
                    playerProfile[activeField] = item.id;
                } else if (playerProfile.coins >= item.price) {
                    playerProfile.coins -= item.price;
                    playerProfile[ownedList].push(item.id);
                    playerProfile[activeField] = item.id;
                }
                saveProfile();
            }
        }
    });
}

function handleAchievementsClick(x, y) {
    if (x >= 50 && x <= 150 && y >= 40 && y <= 80) { playClickSound(); gameState = 'MENU'; return; }

    ACHIEVEMENTS.forEach((ach, index) => {
        let ax = 150;
        let ay = 110 + index * 70;
        let aw = 500;
        let ah = 65;

        let currentVal = playerProfile[ach.type] || 0;
        let isCompleted = currentVal >= ach.target;
        let isClaimed = playerProfile.achievementsClaimed.includes(ach.id);

        if (isCompleted && !isClaimed && x >= ax + 360 && x <= ax + aw - 10 && y >= ay + 10 && y <= ay + ah - 10) {
            playCoinSound();
            playerProfile.coins += ach.reward;
            playerProfile.achievementsClaimed.push(ach.id);
            saveProfile();
        }
    });
}

// --- 7. Игровая Логика ---
function startMode(mode) {
    gameMode = mode;
    score = 0;
    wave = 1;
    destroyedCount = 0;
    doubleXpActive = false;
    doubleSpeedActive = false;
    shieldActive = false;
    isAutoFiring = true;

    let baseHp = playerProfile.ownedPerks.includes('extra_hp') ? 600 : 500;
    tank.hp = baseHp;
    tank.maxHp = baseHp;
    tank.bulletDamage = 1;
    tank.bulletCount = 1;
    tank.x = canvas.width / 2;

    bullets.length = 0;
    bossBullets.length = 0;
    powerUps.length = 0;
    coinsList.length = 0;
    particles.length = 0;

    startWaveSpawning();
    gameState = 'PLAYING';
    startBackgroundMusic();
}

function startLevel(levelNum) {
    gameMode = 'LEVELS';
    currentStage = levelNum;
    score = 0;
    destroyedCount = 0;
    doubleXpActive = false;
    doubleSpeedActive = false;
    shieldActive = false;
    isAutoFiring = true;

    let baseHp = playerProfile.ownedPerks.includes('extra_hp') ? 600 : 500;
    tank.hp = baseHp;
    tank.maxHp = baseHp;
    tank.bulletDamage = 1;
    tank.bulletCount = 1;
    tank.x = canvas.width / 2;

    bullets.length = 0;
    bossBullets.length = 0;
    powerUps.length = 0;
    coinsList.length = 0;
    particles.length = 0;

    startWaveSpawning();
    gameState = 'PLAYING';
    startBackgroundMusic();
}

function shootBullet() {
    playShootSound();
    const count = tank.bulletCount;
    const spreadAngle = 15;
    const speed = 8 * (doubleSpeedActive ? 2 : 1);

    let bColor = SHOP_ITEMS.bulletSkins.find(s => s.id === playerProfile.activeBulletSkin)?.color || '#00BCD4';
    if (doubleSpeedActive) bColor = '#00FFFF';

    let hasCrit = playerProfile.ownedPerks.includes('crit_chance') && Math.random() < 0.15;
    let finalDamage = tank.bulletDamage * (hasCrit ? 2 : 1);

    for (let i = 0; i < count; i++) {
        let angleOffset = count > 1 ? (i - (count - 1) / 2) * (spreadAngle * Math.PI / 180) : 0;
        bullets.push({
            x: tank.x,
            y: tank.y - tank.height / 2 - 15,
            vx: Math.sin(angleOffset) * speed,
            vy: -Math.cos(angleOffset) * speed,
            width: hasCrit ? 8 : 6,
            height: hasCrit ? 16 : 12,
            damage: finalDamage,
            color: hasCrit ? '#FFD700' : bColor
        });
    }
}

function updateTank() {
    tank.x += (mouseX - tank.x) * 0.3;

    if (playerProfile.activeTankEffect === 'trail' && Math.random() > 0.4) {
        particles.push({
            x: tank.x + (Math.random() - 0.5) * 20,
            y: tank.y + tank.height / 2,
            vx: (Math.random() - 0.5) * 1,
            vy: Math.random() * 2 + 1,
            size: Math.random() * 3 + 2,
            color: '#888',
            alpha: 0.6,
            decay: 0.03
        });
    }

    if (isAutoFiring) {
        let currentTime = Date.now();
        let currentInterval = doubleSpeedActive ? baseShootInterval / 2 : baseShootInterval;
        if (currentTime - lastShootTime >= currentInterval) {
            shootBullet();
            lastShootTime = currentTime;
        }
    }
}

function updateBlocks() {
    for (let i = blocks.length - 1; i >= 0; i--) {
        let blk = blocks[i];
        blk.y += blk.speed;

        if (
            blk.x < tank.x + tank.width / 2 &&
            blk.x + blk.width > tank.x - tank.width / 2 &&
            blk.y < tank.y + tank.height / 2 &&
            blk.y + blk.height > tank.y - tank.height / 2
        ) {
            if (!shieldActive) {
                tank.hp -= blk.hp * 10;
            }
            createExplosion(blk.x + blk.width / 2, blk.y + blk.height / 2, blk.color);
            blocks.splice(i, 1);
            if (tank.hp <= 0) triggerGameOver();
            continue;
        }

        if (blk.y + blk.height >= canvas.height) {
            if (!shieldActive) {
                tank.hp -= 50;
            }
            blocks.splice(i, 1);
            if (tank.hp <= 0) triggerGameOver();
        }
    }
}

function updateBossBullets() {
    for (let i = bossBullets.length - 1; i >= 0; i--) {
        let bb = bossBullets[i];
        bb.x += bb.vx;
        bb.y += bb.vy;

        if (
            bb.x > tank.x - tank.width / 2 &&
            bb.x < tank.x + tank.width / 2 &&
            bb.y > tank.y - tank.height / 2 &&
            bb.y < tank.y + tank.height / 2
        ) {
            if (!shieldActive) {
                tank.hp -= 40;
            }
            bossBullets.splice(i, 1);
            if (tank.hp <= 0) triggerGameOver();
            continue;
        }

        if (bb.y > canvas.height) bossBullets.splice(i, 1);
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += bullets[i].vx;
        bullets[i].y += bullets[i].vy;

        if (bullets[i].y < 0 || bullets[i].x < 0 || bullets[i].x > canvas.width) {
            bullets.splice(i, 1);
            continue;
        }

        let bulletRemoved = false;
        for (let j = blocks.length - 1; j >= 0; j--) {
            const b = bullets[i];
            const blk = blocks[j];

            if (
                b.x - b.width / 2 < blk.x + blk.width &&
                b.x + b.width / 2 > blk.x &&
                b.y < blk.y + blk.height &&
                b.y + b.height > blk.y
            ) {
                let damageDealt = blk.type === 'armored' ? Math.max(1, b.damage - 1) : b.damage;
                blk.hp -= damageDealt;

                bullets.splice(i, 1);
                bulletRemoved = true;

                if (blk.hp <= 0) {
                    let earnedXp = blk.xpValue * (doubleXpActive ? 2 : 1);
                    score += earnedXp;
                    playerProfile.totalXp += earnedXp;
                    destroyedCount++;
                    playerProfile.destroyedBlocksTotal++;

                    if (blk.isBoss) playerProfile.bossesDefeated++;
                    if (blk.type === 'explosive') triggerExplosiveBlock(blk);

                    let coinCount = blk.isBoss ? 15 : 1;
                    for (let c = 0; c < coinCount; c++) {
                        coinsList.push({
                            x: blk.x + blk.width / 2 + (Math.random() - 0.5) * 40,
                            y: blk.y + blk.height / 2,
                            radius: 8,
                            speed: 1.5 + Math.random()
                        });
                    }

                    createExplosion(blk.x + blk.width / 2, blk.y + blk.height / 2, blk.color);

                    if (destroyedCount % 20 === 0) {
                        spawnPowerUp(blk.x + blk.width / 2, blk.y + blk.height / 2);
                    }
                    blocks.splice(j, 1);
                }
                break;
            }
        }
        if (bulletRemoved) continue;
    }

    // Завершение волны / уровня
    if (blocksToSpawn === 0 && blocks.length === 0 && gameState === 'PLAYING') {
        stopBackgroundMusic();
        
        if (gameMode === 'LEVELS') {
            // Сохраняем прохождение уровня кампании
            if (!playerProfile.completedLevels.includes(currentStage)) {
                playerProfile.completedLevels.push(currentStage);
            }
            if (currentStage >= playerProfile.unlockedLevel && currentStage < 20) {
                playerProfile.unlockedLevel = currentStage + 1;
            }
            saveProfile();
            gameState = 'VICTORY_LEVEL';
        } else {
            openUpgradeMenu();
        }
    }
}

function updateCoins() {
    let hasMagnet = playerProfile.ownedPerks.includes('coin_magnet');

    for (let i = coinsList.length - 1; i >= 0; i--) {
        let c = coinsList[i];
        
        if (hasMagnet) {
            let dx = tank.x - c.x;
            let dy = tank.y - c.y;
            let dist = Math.hypot(dx, dy);
            if (dist < 200) {
                c.x += (dx / dist) * 4;
                c.y += (dy / dist) * 4;
            } else {
                c.y += c.speed;
            }
        } else {
            c.y += c.speed;
        }

        if (
            c.x > tank.x - tank.width / 2 - 15 &&
            c.x < tank.x + tank.width / 2 + 15 &&
            c.y > tank.y - tank.height / 2 - 15 &&
            c.y < tank.y + tank.height / 2 + 15
        ) {
            playCoinSound();
            playerProfile.coins += 1;
            playerProfile.coinsCollectedTotal += 1;
            saveProfile();
            coinsList.splice(i, 1);
            continue;
        }

        if (c.y > canvas.height) coinsList.splice(i, 1);
    }
}

function triggerGameOver() {
    tank.hp = 0;
    gameState = 'GAME_OVER';
    stopBackgroundMusic();
    saveProfile();
}

// --- 8. Меню Улучшений (для бесконечного режима) ---
function openUpgradeMenu() {
    gameState = 'UPGRADE';

    if (gameMode === 'ENDLESS' && wave > playerProfile.maxWave) {
        playerProfile.maxWave = wave;
        saveProfile();
    }

    upgradeOptions = [
        { title: "1. Увеличение HP", desc: "+200 к макс. HP и лечение", type: "hp", x: 100, y: 220, width: 180, height: 180 },
        { title: "2. Доп. Пуля", desc: `Стрелять пуль: ${tank.bulletCount + 1}`, type: "bullet", x: 310, y: 220, width: 180, height: 180 },
        { title: "3. Урон Пули", desc: `Урон: ${tank.bulletDamage + 1}`, type: "damage", x: 520, y: 220, width: 180, height: 180 }
    ];
}

function selectUpgrade(index) {
    if (!upgradeOptions[index]) return;

    const selected = upgradeOptions[index];
    if (selected.type === "hp") {
        tank.maxHp += 200;
        tank.hp = Math.min(tank.hp + 200, tank.maxHp);
    } else if (selected.type === "bullet") {
        tank.bulletCount += 1;
    } else if (selected.type === "damage") {
        tank.bulletDamage += 1;
    }

    wave++;
    startWaveSpawning();
    gameState = 'PLAYING';
    startBackgroundMusic();
}

// --- 9. Отрисовка Экранов ---
function drawMenu() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 38px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ТАНК ПРОТИВ БЛОКОВ', canvas.width / 2, 50);

    ctx.fillStyle = '#222';
    ctx.fillRect(180, 75, 440, 105);
    ctx.strokeStyle = '#444';
    ctx.strokeRect(180, 75, 440, 105);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('ПРОФИЛЬ ИГРОКА', canvas.width / 2, 100);
    ctx.fillStyle = '#FFF';
    ctx.font = '16px Arial';
    ctx.fillText(`Монеты: 🪙 ${playerProfile.coins}`, canvas.width / 2, 128);
    ctx.fillText(`Общий опыт: ${playerProfile.totalXp} XP | Рекорд волны: ${playerProfile.maxWave}`, canvas.width / 2, 153);

    menuButtons.forEach(btn => {
        ctx.fillStyle = btn.id === 'shop' ? '#E91E63' : btn.id === 'achievements' ? '#9C27B0' : '#333';
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = '#00BCD4';
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(btn.text, btn.x + btn.w / 2, btn.y + btn.h / 2 + 6);
    });

    ctx.textAlign = 'left';
}

// Отрисовка сетки 20 уровней кампании
function drawLevelSelect() {
    ctx.fillStyle = '#181818';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#333';
    ctx.fillRect(50, 40, 100, 40);
    ctx.strokeStyle = '#FFF';
    ctx.strokeRect(50, 40, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('← Назад', 65, 65);

    ctx.fillStyle = '#00BCD4';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ВЫБОР УРОВНЯ (Кампания 1-20)', canvas.width / 2, 65);

    for (let i = 1; i <= 20; i++) {
        let col = (i - 1) % 5;
        let row = Math.floor((i - 1) / 5);
        let bx = 110 + col * 120;
        let by = 130 + row * 85;
        let bw = 100;
        let bh = 65;

        let isUnlocked = i <= playerProfile.unlockedLevel;
        let isCompleted = playerProfile.completedLevels.includes(i);

        ctx.fillStyle = isCompleted ? '#1B5E20' : isUnlocked ? '#222' : '#111';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = isCompleted ? '#00E676' : isUnlocked ? '#00BCD4' : '#444';
        ctx.lineWidth = isCompleted ? 3 : 1;
        ctx.strokeRect(bx, by, bw, bh);

        ctx.fillStyle = isUnlocked ? '#FFF' : '#666';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`Ур. ${i}`, bx + bw / 2, by + 30);

        if (isCompleted) {
            ctx.fillStyle = '#00E676';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('✅ ПРОЙДЕНО', bx + bw / 2, by + 50);
        } else if (!isUnlocked) {
            ctx.fillStyle = '#888';
            ctx.font = '12px Arial';
            ctx.fillText('🔒 Закрыто', bx + bw / 2, by + 50);
        } else {
            ctx.fillStyle = '#FFD700';
            ctx.font = '12px Arial';
            ctx.fillText('Доступно', bx + bw / 2, by + 50);
        }
    }

    ctx.textAlign = 'left';
}

function drawShop() {
    ctx.fillStyle = '#181818';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#333';
    ctx.fillRect(50, 40, 100, 40);
    ctx.strokeStyle = '#FFF';
    ctx.strokeRect(50, 40, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('← Назад', 65, 65);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`МАГАЗИН (Баланс: 🪙 ${playerProfile.coins})`, canvas.width / 2, 65);

    const tabs = [
        { id: 'tankSkins', name: 'Танки', x: 50, y: 120, w: 120, h: 40 },
        { id: 'bulletSkins', name: 'Пули', x: 180, y: 120, w: 120, h: 40 },
        { id: 'tankEffects', name: 'Аура', x: 310, y: 120, w: 120, h: 40 },
        { id: 'perks', name: 'Перки', x: 440, y: 120, w: 120, h: 40 }
    ];

    tabs.forEach(t => {
        ctx.fillStyle = shopCategory === t.id ? '#00BCD4' : '#333';
        ctx.fillRect(t.x, t.y, t.w, t.h);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(t.name, t.x + t.w / 2, t.y + 25);
    });

    const items = SHOP_ITEMS[shopCategory];
    if (!items) return;

    items.forEach((item, index) => {
        let ix = 80 + (index % 3) * 220;
        let iy = 190 + Math.floor(index / 3) * 150;

        let isOwned = false;
        let isActive = false;

        if (shopCategory === 'perks') {
            isOwned = playerProfile.ownedPerks.includes(item.id);
        } else {
            let ownedList, activeField;
            if (shopCategory === 'tankSkins') { ownedList = 'ownedSkins'; activeField = 'activeTankSkin'; }
            if (shopCategory === 'bulletSkins') { ownedList = 'ownedBulletSkins'; activeField = 'activeBulletSkin'; }
            if (shopCategory === 'tankEffects') { ownedList = 'ownedTankEffects'; activeField = 'activeTankEffect'; }

            isOwned = playerProfile[ownedList].includes(item.id);
            isActive = playerProfile[activeField] === item.id;
        }

        ctx.fillStyle = isActive ? '#1B5E20' : isOwned ? '#2E7D32' : '#333';
        ctx.fillRect(ix, iy, 200, 130);
        ctx.strokeStyle = isActive ? '#00E676' : '#555';
        ctx.lineWidth = isActive ? 3 : 1;
        ctx.strokeRect(ix, iy, 200, 130);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 15px Arial';
        ctx.fillText(item.name, ix + 100, iy + 30);

        ctx.font = '12px Arial';
        ctx.fillStyle = '#CCC';
        if (shopCategory === 'perks') {
            ctx.fillText(item.desc, ix + 100, iy + 55);
        }

        if (isActive) {
            ctx.fillStyle = '#00E676';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('ЭКИПИРОВАНО', ix + 100, iy + 95);
        } else if (isOwned) {
            ctx.fillStyle = '#81C784';
            ctx.font = 'bold 13px Arial';
            ctx.fillText(shopCategory === 'perks' ? 'КУПЛЕНО' : 'НАЖМИТЕ НАДЕТЬ', ix + 100, iy + 95);
        } else {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(`Цена: 🪙 ${item.price}`, ix + 100, iy + 95);
        }
    });

    ctx.textAlign = 'left';
}

function drawAchievements() {
    ctx.fillStyle = '#181818';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#333';
    ctx.fillRect(50, 40, 100, 40);
    ctx.strokeStyle = '#FFF';
    ctx.strokeRect(50, 40, 100, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('← Назад', 65, 65);

    ctx.fillStyle = '#9C27B0';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ДОСТИЖЕНИЯ И КВЕСТЫ', canvas.width / 2, 65);

    ACHIEVEMENTS.forEach((ach, index) => {
        let ax = 150;
        let ay = 110 + index * 70;
        let aw = 500;
        let ah = 60;

        let currentVal = playerProfile[ach.type] || 0;
        let isCompleted = currentVal >= ach.target;
        let isClaimed = playerProfile.achievementsClaimed.includes(ach.id);

        ctx.fillStyle = '#222';
        ctx.fillRect(ax, ay, aw, ah);
        ctx.strokeStyle = isCompleted ? '#00E676' : '#555';
        ctx.strokeRect(ax, ay, aw, ah);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(ach.title, ax + 15, ay + 25);

        ctx.fillStyle = '#FFF';
        ctx.font = '13px Arial';
        ctx.fillText(ach.desc, ax + 15, ay + 45);

        ctx.fillStyle = '#AAA';
        ctx.font = '13px Arial';
        ctx.fillText(`${Math.min(currentVal, ach.target)} / ${ach.target}`, ax + 230, ay + 25);

        let btnX = ax + 350;
        let btnY = ay + 10;
        let btnW = 135;
        let btnH = 40;

        ctx.fillStyle = isClaimed ? '#444' : isCompleted ? '#4CAF50' : '#555';
        ctx.fillRect(btnX, btnY, btnW, btnH);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        let btnText = isClaimed ? 'ПОЛУЧЕНО' : isCompleted ? `НАГРАДА 🪙${ach.reward}` : 'НЕ ВЫПОЛНЕНО';
        ctx.fillText(btnText, btnX + btnW / 2, btnY + 25);
    });

    ctx.textAlign = 'left';
}

function drawUI() {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(gameMode === 'ENDLESS' ? `Волна: ${wave}` : `Уровень: ${currentStage} / 20`, 20, 30);

    if (isBossWave) {
        ctx.fillStyle = '#E91E63';
        ctx.fillText(`⚠️ БИТВА С БОССОМ!`, 20, 55);
    } else {
        ctx.fillText(`Блоков осталось: ${blocks.length + blocksToSpawn} / ${totalWaveBlocks}`, 20, 55);
    }

    ctx.fillStyle = '#FFF';
    ctx.fillText(`Опыт: ${score}`, 20, 80);

    ctx.fillStyle = '#FFD700';
    ctx.fillText(`Монеты: 🪙 ${playerProfile.coins}`, 20, 105);

    ctx.fillStyle = '#FFF';
    ctx.fillText(`Танк HP: ${tank.hp} / ${tank.maxHp}`, 20, 130);
    ctx.fillStyle = '#555';
    ctx.fillRect(20, 137, 180, 10);
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(20, 137, Math.max(0, (tank.hp / tank.maxHp) * 180), 10);

    let buffY = 167;
    if (doubleXpActive) { ctx.fillStyle = '#E91E63'; ctx.fillText(`⚡ 2X XP Активен`, 20, buffY); buffY += 22; }
    if (doubleSpeedActive) { ctx.fillStyle = '#00BCD4'; ctx.fillText(`🚀 Скорострельность Активна`, 20, buffY); buffY += 22; }
    if (shieldActive) { ctx.fillStyle = '#2196F3'; ctx.fillText(`🛡️ Щит Активен`, 20, buffY); buffY += 22; }

    ctx.fillStyle = musicEnabled ? '#00E676' : '#FF5722';
    ctx.fillText(`Музыка (M): ${musicEnabled ? 'ВКЛ' : 'ВЫКЛ'}`, 20, 259);

    ctx.fillStyle = '#AAA';
    ctx.font = '14px Arial';
    ctx.fillText('Пауза: ESC или P', canvas.width - 150, 30);
}

function drawPauseMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 38px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ИГРА НА ПАУЗЕ', canvas.width / 2, 170);

    ctx.fillStyle = '#333';
    ctx.fillRect(300, 250, 200, 50);
    ctx.strokeStyle = '#00BCD4';
    ctx.lineWidth = 2;
    ctx.strokeRect(300, 250, 200, 50);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Продолжить', canvas.width / 2, 281);

    ctx.fillStyle = '#333';
    ctx.fillRect(300, 320, 200, 50);
    ctx.strokeStyle = '#F44336';
    ctx.strokeRect(300, 320, 200, 50);

    ctx.fillStyle = '#F44336';
    ctx.fillText('Завершить игру', canvas.width / 2, 351);

    ctx.textAlign = 'left';
}

function drawUpgradeMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`ВОЛНА ${wave} ПРОЙДЕНА!`, canvas.width / 2, 120);

    ctx.fillStyle = '#FFF';
    ctx.font = '20px Arial';
    ctx.fillText('Выберите ваше улучшение (клавиши 1, 2, 3 или клик мышкой):', canvas.width / 2, 165);

    upgradeOptions.forEach((opt) => {
        ctx.fillStyle = '#333';
        ctx.fillRect(opt.x, opt.y, opt.width, opt.height);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(opt.x, opt.y, opt.width, opt.height);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(opt.title, opt.x + opt.width / 2, opt.y + 45);

        ctx.fillStyle = '#FFF';
        ctx.font = '14px Arial';
        ctx.fillText(opt.desc, opt.x + opt.width / 2, opt.y + 100);
    });

    ctx.textAlign = 'left';
}

// --- 10. Главный Цикл ---
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'MENU') {
        drawMenu();
    } else if (gameState === 'LEVEL_SELECT') {
        drawLevelSelect();
    } else if (gameState === 'SHOP') {
        drawShop();
    } else if (gameState === 'ACHIEVEMENTS') {
        drawAchievements();
    } else {
        if (gameState === 'PLAYING') {
            updateSpawning();
            updateTank();
            updateBlocks();
            updateBossAbilities();
            updateBossBullets();
            updateBullets();
            updatePowerUps();
            updateCoins();
            updateParticles();
        }

        drawUI();
        drawParticles();

        if (laserActiveAnimation > 0) {
            ctx.fillStyle = 'rgba(0, 229, 255, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            laserActiveAnimation--;
        }

        for (let i = 0; i < blocks.length; i++) {
            const blk = blocks[i];
            ctx.fillStyle = blk.color;
            ctx.globalAlpha = Math.max(0.2, blk.hp / blk.maxHp);
            ctx.fillRect(blk.x, blk.y, blk.width, blk.height);
            ctx.globalAlpha = 1.0;

            ctx.strokeStyle = blk.isBoss ? '#FFD700' : '#000';
            ctx.lineWidth = blk.isBoss ? 4 : 1;
            ctx.strokeRect(blk.x, blk.y, blk.width, blk.height);

            let label = blk.isBoss ? `${blk.name} (${blk.hp})` : `${blk.hp}`;
            let icon = '';
            if (blk.type === 'explosive') icon = '💣 ';
            if (blk.type === 'armored') icon = '🛡️ ';

            ctx.fillStyle = '#000';
            ctx.font = blk.isBoss ? 'bold 15px Arial' : 'bold 13px Arial';
            ctx.fillText(`${icon}${label}`, blk.x + 8, blk.y + blk.height / 2 + 5);
        }

        for (let bb of bossBullets) {
            ctx.fillStyle = '#FF0055';
            ctx.fillRect(bb.x - bb.width / 2, bb.y, bb.width, bb.height);
        }

        for (let c of coinsList) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#B78103';
            ctx.stroke();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 10px Arial';
            ctx.fillText('$', c.x - 3, c.y + 3);
        }

        for (let i = 0; i < powerUps.length; i++) {
            const p = powerUps[i];
            let pColor = '#E91E63';
            let symbol = 'XP';
            if (p.type === 'bomb') { pColor = '#FF5722'; symbol = '💥'; }
            if (p.type === 'shield') { pColor = '#2196F3'; symbol = '🛡️'; }
            if (p.type === 'speed') { pColor = '#00BCD4'; symbol = '⚡'; }

            ctx.fillStyle = pColor;
            ctx.fillRect(p.x - p.width / 2, p.y, p.width, p.height);
            ctx.strokeStyle = '#FFF';
            ctx.strokeRect(p.x - p.width / 2, p.y, p.width, p.height);

            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(symbol, p.x, p.y + 20);
            ctx.textAlign = 'left';
        }

        for (let i = 0; i < bullets.length; i++) {
            const b = bullets[i];
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x - b.width / 2, b.y, b.width, b.height);
        }

        if (shieldActive) {
            ctx.save();
            ctx.strokeStyle = '#2196F3';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(tank.x, tank.y, tank.width, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        if (playerProfile.activeTankEffect === 'aura') {
            ctx.save();
            ctx.shadowColor = '#00E5FF';
            ctx.shadowBlur = 20;
            ctx.strokeStyle = '#00E5FF';
            ctx.lineWidth = 3;
            ctx.strokeRect(tank.x - tank.width / 2 - 4, tank.y - tank.height / 2 - 4, tank.width + 8, tank.height + 8);
            ctx.restore();
        }

        let tankColor = SHOP_ITEMS.tankSkins.find(s => s.id === playerProfile.activeTankSkin)?.color || '#4CAF50';
        ctx.fillStyle = tankColor;
        ctx.fillRect(tank.x - tank.width / 2, tank.y - tank.height / 2, tank.width, tank.height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(tank.x - 4, tank.y - tank.height / 2 - 15, 8, 15);

        if (gameState === 'PAUSED') drawPauseMenu();
        if (gameState === 'UPGRADE') drawUpgradeMenu();

        // Экран победы для отдельного уровня кампании
        if (gameState === 'VICTORY_LEVEL') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#00E676';
            ctx.font = 'bold 40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`УРОВЕНЬ ${currentStage} ПРОЙДЕН!`, canvas.width / 2, canvas.height / 2 - 40);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px Arial';
            ctx.fillText(`Вы победили! Монеты и опыт сохранены.`, canvas.width / 2, canvas.height / 2 + 10);
            ctx.fillText('Нажмите Пробел или R для возврата к выбору уровней', canvas.width / 2, canvas.height / 2 + 60);

            ctx.textAlign = 'left';
        }

        if (gameState === 'GAME_OVER') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#F44336';
            ctx.font = 'bold 40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('ТАНК УНИЧТОЖЕН', canvas.width / 2, canvas.height / 2 - 30);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px Arial';
            ctx.fillText(`Все заработанные монеты и опыт сохранены!`, canvas.width / 2, canvas.height / 2 + 15);
            ctx.fillText('Нажмите Пробел или R для выхода в меню', canvas.width / 2, canvas.height / 2 + 60);

            ctx.textAlign = 'left';
        }
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();