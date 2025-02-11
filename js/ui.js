let gamePage;
let scoreboardPage;

function initializeUI() {
    // 预创建游戏页面和结算榜单页面
    gamePage = createGamePage();
    scoreboardPage = createScoreboardPage();

    const gameContainer = document.getElementById('game-container');
    gameContainer.appendChild(gamePage);
    gameContainer.appendChild(scoreboardPage);

    // 初始显示游戏页面
    showGamePage();

    // 绑定按钮事件
    bindButtonEvents();
    // 初始化玩家信息
    initPlayer();
    // 提示玩家初始属性
    addLog(`玩家初始生命值: ${getPlayerHealth()}，攻击力: ${getPlayerAttack()}`);
}

function createGamePage() {
    const gamePage = document.createElement('div');
    gamePage.id = 'game-page';

    const title = document.createElement('h1');
    title.textContent = '🎮包暗黑豆🎮';
    gamePage.appendChild(title);

    const playerInfoDiv = createInfoDiv('player', [
        { label: '玩家等级', id: 'player-level' },
        { label: '玩家经验值', id: 'player-exp' },
        { label: '玩家生命值', id: 'player-health' },
        { label: '玩家攻击力', id: 'player-attack' },
        { label: '当前装备', id: 'player-equipment' },
        { label: '可用技能', id: 'player-skills' }
    ]);
    gamePage.appendChild(playerInfoDiv);

    const enemyInfoDiv = createInfoDiv('enemy', [
        { label: '当前怪物', id: 'enemy-name' },
        { label: '怪物生命值', id: 'enemy-health' },
        { label: '怪物攻击力', id: 'enemy-attack' },
        { label: '当前怪物波次', id: 'wave-info' }
    ]);
    gamePage.appendChild(enemyInfoDiv);

    const attackButton = createButton('attack-button', '普通攻击');
    gamePage.appendChild(attackButton);

    const autoBattleButton = createButton('auto-battle-button', '开启自动战斗');
    gamePage.appendChild(autoBattleButton);

    const autoSkillCheckbox = createCheckbox('auto-skill-checkbox', '自动释放技能');
    gamePage.appendChild(autoSkillCheckbox);

    const speedSelect = createSpeedSelect();
    gamePage.appendChild(speedSelect);

    const skillButtonsDiv = document.createElement('div');
    skillButtonsDiv.id = 'skill-buttons';
    gamePage.appendChild(skillButtonsDiv);

    const battleLogDiv = createBattleLogDiv();
    gamePage.appendChild(battleLogDiv);

    const resetButton = createButton('reset-button', '重新挑战');
    resetButton.style.display = 'none';
    gamePage.appendChild(resetButton);

    const styleToggleButton = createButton('style-toggle-button', '切换样式');
    gamePage.appendChild(styleToggleButton);

    return gamePage;
}

function createScoreboardPage() {
    const scoreboardPage = document.createElement('div');
    scoreboardPage.id = 'scoreboard-page';
    scoreboardPage.style.display = 'none';

    const gameOverTitle = document.createElement('h1');
    gameOverTitle.textContent = '游戏结束';
    scoreboardPage.appendChild(gameOverTitle);

    const currentScoreElement = document.createElement('p');
    currentScoreElement.id = 'current-score';
    scoreboardPage.appendChild(currentScoreElement);

    const historyTitle = document.createElement('h2');
    historyTitle.textContent = '历史游戏记录';
    scoreboardPage.appendChild(historyTitle);

    const historyList = document.createElement('ul');
    historyList.id = 'history-list';
    scoreboardPage.appendChild(historyList);

    const restartButton = createButton('restart-button', '重新开始');
    restartButton.addEventListener('click', resetGame);
    scoreboardPage.appendChild(restartButton);

    return scoreboardPage;
}

function createInfoDiv(prefix, fields) {
    const div = document.createElement('div');
    div.id = `${prefix}-info`;
    fields.forEach(field => {
        const p = document.createElement('p');
        p.innerHTML = `${field.label}: <span id="${field.id}"></span>`;
        div.appendChild(p);
    });
    return div;
}

function createButton(id, text) {
    const button = document.createElement('button');
    button.id = id;
    button.textContent = text;
    return button;
}

function createCheckbox(id, labelText) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = labelText;
    const div = document.createElement('div');
    div.appendChild(checkbox);
    div.appendChild(label);
    return div;
}

function createSpeedSelect() {
    const speedSelect = document.createElement('select');
    speedSelect.id = 'speed-select';
    for (let i = 1; i <= 10; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i} 倍速`;
        speedSelect.appendChild(option);
    }
    return speedSelect;
}

function createBattleLogDiv() {
    const battleLogDiv = document.createElement('div');
    battleLogDiv.id = 'battle-log';
    battleLogDiv.innerHTML = `
        <p>战斗日志:</p>
        <ul id="log-list"></ul>
    `;
    return battleLogDiv;
}

function bindButtonEvents() {
    const attackButton = document.getElementById('attack-button');
    if (attackButton) {
        attackButton.addEventListener('click', attack);
    }

    const autoBattleButton = document.getElementById('auto-battle-button');
    if (autoBattleButton) {
        autoBattleButton.addEventListener('click', () => {
            if (autoBattleInterval) {
                stopAutoBattle();
            } else {
                startAutoBattle();
            }
        });
    }

    const autoSkillCheckbox = document.getElementById('auto-skill-checkbox');
    if (autoSkillCheckbox) {
        autoSkillCheckbox.addEventListener('change', toggleAutoSkill);
    }

    const speedSelect = document.getElementById('speed-select');
    if (speedSelect) {
        speedSelect.addEventListener('change', () => {
            const selectedSpeed = parseInt(speedSelect.value);
            changeBattleSpeed(selectedSpeed);
        });
    }

    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', resetGame);
    }

    const styleToggleButton = document.getElementById('style-toggle-button');
    if (styleToggleButton) {
        styleToggleButton.addEventListener('click', toggleStyle);
    }
}

function addLog(message) {
    const logList = document.getElementById('log-list');
    const listItem = document.createElement('li');
    listItem.textContent = message;
    logList.prepend(listItem);
    logList.scrollTop = 0;
}

function resetGame() {
    // 重置玩家数据
    resetPlayerData();
    // 重置敌人数据
    resetEnemyData();
    // 刷新 UI
    refreshUI();

    isPlayerDefeated = false;

    // 显示游戏页面，隐藏结算榜单页面
    showGamePage();
}

function resetPlayerData() {
    playerLevel = 1;
    playerExp = 0;
    playerHealth = 100;
    playerAttack = 10;
    playerEquipment = {
        "头盔": null,
        "胸甲": null,
        "手套": null,
        "护腿": null,
        "鞋子": null,
        "武器": null,
        "戒指": null,
        "项链": null
    };
    playerSkills = [];
    skillCooldowns = {};
}

function resetEnemyData() {
    currentWave = 1;
    initEnemy();
}

function refreshUI() {
    // 更新玩家信息
    updatePlayerInfo();
    // 清空战斗日志
    const logList = document.getElementById('log-list');
    logList.innerHTML = '';
    // 重新初始化敌人信息显示
    const enemyHealthElement = document.getElementById('enemy-health');
    const enemyAttackElement = document.getElementById('enemy-attack');
    const enemyNameElement = document.getElementById('enemy-name');
    const waveInfoElement = document.getElementById('wave-info');

    enemyHealthElement.textContent = getEnemyHealth();
    enemyAttackElement.textContent = getEnemyAttack();
    enemyNameElement.textContent = getCurrentEnemyName();
    waveInfoElement.textContent = `当前怪物波次: ${getCurrentWave()}`;

    // 重新启用攻击按钮
    const attackButton = document.getElementById('attack-button');
    if (attackButton) {
        attackButton.disabled = false;
    }

    // 重新启用技能按钮
    enableAllSkillButtons();
}

function showGamePage() {
    gamePage.style.display = 'block';
    scoreboardPage.style.display = 'none';
}

function showScoreboard(score) {
    const currentScoreElement = document.getElementById('current-score');
    currentScoreElement.textContent = `本次游戏总评分: ${score}`;

    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    const gameHistory = getGameHistory();
    if (gameHistory.length > 0) {
        gameHistory.forEach((record, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${index + 1}. 评分: ${record.score}，时间: ${record.timestamp}`;
            historyList.appendChild(listItem);
        });
    }

    // 隐藏游戏页面，显示结算榜单页面
    gamePage.style.display = 'none';
    scoreboardPage.style.display = 'block';
}

function toggleStyle() {
    const styleLink = document.getElementById('style-link');
    const titleElement = document.querySelector('title');
    if (styleLink.href.endsWith('work.css')) {
        styleLink.href = 'css/game.css';
        titleElement.textContent = '🎮包暗黑豆奇幻冒险🎮';
    } else {
        styleLink.href = 'css/work.css';
        titleElement.textContent = '工作数据看板';
    }
}

function enableAllSkillButtons() {
    const skillButtons = document.querySelectorAll('#skill-buttons button');
    skillButtons.forEach(button => {
        button.disabled = false;
    });
}