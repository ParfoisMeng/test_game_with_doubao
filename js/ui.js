function generateUI() {
    const gameContainer = document.getElementById('game-container');

    const title = document.createElement('h1');
    title.textContent = '简易恶龙传说升级、装备与技能系统';
    gameContainer.appendChild(title);

    const playerInfoDiv = document.createElement('div');
    playerInfoDiv.id = 'player-info';
    playerInfoDiv.innerHTML = `
        <p>玩家等级: <span id="player-level">1</span></p>
        <p>玩家经验值: <span id="player-exp">0</span></p>
        <p>玩家生命值: <span id="player-health">100</span></p>
        <p>玩家攻击力: <span id="player-attack">10</span></p>
        <p>当前装备: <span id="player-equipment">无</span></p>
        <p>可用技能: <span id="player-skills">无</span></p>
    `;
    gameContainer.appendChild(playerInfoDiv);

    const enemyInfoDiv = document.createElement('div');
    enemyInfoDiv.id = 'enemy-info';
    enemyInfoDiv.innerHTML = `
        <p>恶龙生命值: <span id="enemy-health">100</span></p>
        <p>恶龙攻击力: <span id="enemy-attack">10</span></p>
    `;
    gameContainer.appendChild(enemyInfoDiv);

    const attackButton = document.createElement('button');
    attackButton.id = 'attack-button';
    attackButton.textContent = '普通攻击';
    gameContainer.appendChild(attackButton);

    const autoBattleButton = document.createElement('button');
    autoBattleButton.id = 'auto-battle-button';
    autoBattleButton.textContent = '开启自动战斗';
    gameContainer.appendChild(autoBattleButton);

    const autoSkillCheckbox = document.createElement('input');
    autoSkillCheckbox.type = 'checkbox';
    autoSkillCheckbox.id = 'auto-skill-checkbox';
    autoSkillCheckbox.addEventListener('change', toggleAutoSkill);
    const autoSkillLabel = document.createElement('label');
    autoSkillLabel.htmlFor = 'auto-skill-checkbox';
    autoSkillLabel.textContent = '自动释放技能';
    const autoSkillDiv = document.createElement('div');
    autoSkillDiv.appendChild(autoSkillCheckbox);
    autoSkillDiv.appendChild(autoSkillLabel);
    gameContainer.appendChild(autoSkillDiv);

    const speedSelect = document.createElement('select');
    speedSelect.id = 'speed-select';
    // 修改为生成 1 - 10 倍速的选项
    for (let i = 1; i <= 10; i++) { 
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i} 倍速`;
        speedSelect.appendChild(option);
    }
    speedSelect.addEventListener('change', () => {
        const selectedSpeed = parseInt(speedSelect.value);
        changeBattleSpeed(selectedSpeed);
    });
    gameContainer.appendChild(speedSelect);

    const skillButtonsDiv = document.createElement('div');
    skillButtonsDiv.id = 'skill-buttons';
    gameContainer.appendChild(skillButtonsDiv);

    const battleLogDiv = document.createElement('div');
    battleLogDiv.id = 'battle-log';
    battleLogDiv.innerHTML = `
        <p>战斗日志:</p>
        <ul id="log-list"></ul>
    `;
    gameContainer.appendChild(battleLogDiv);

    const resetButton = document.createElement('button');
    resetButton.id = 'reset-button';
    resetButton.textContent = '重新挑战';
    resetButton.style.display = 'none';
    gameContainer.appendChild(resetButton);
}

function addLog(message) {
    const logList = document.getElementById('log-list');
    const listItem = document.createElement('li');
    listItem.textContent = message;
    logList.prepend(listItem); // 新日志添加到列表顶部
    logList.scrollTop = 0; // 滚动到顶部
}

function resetGame() {
    // 重置玩家属性
    playerLevel = 1;
    playerExp = 0;
    playerHealth = 100;
    playerAttack = 10;
    playerEquipment = null;
    playerSkills = [];
    skillCooldowns = {};
    skillList.forEach(skill => {
        skillCooldowns[skill.name] = 0;
    });

    // 重置敌人属性
    enemyHealth = 100;
    enemyAttack = 10;

    // 重置 UI
    updatePlayerInfo();
    setEnemyHealth(enemyHealth);
    setEnemyAttack(enemyAttack);

    const logList = document.getElementById('log-list');
    logList.innerHTML = '';

    const attackButton = document.getElementById('attack-button');
    attackButton.disabled = false;

    const resetButton = document.getElementById('reset-button');
    resetButton.style.display = 'none';

    const skillButtonsDiv = document.getElementById('skill-buttons');
    skillButtonsDiv.innerHTML = '';

    const autoBattleButton = document.getElementById('auto-battle-button');
    autoBattleButton.textContent = '开启自动战斗';
    stopAutoBattle();

    const autoSkillCheckbox = document.getElementById('auto-skill-checkbox');
    autoSkillCheckbox.checked = false;
    autoSkillEnabled = false;

    const speedSelect = document.getElementById('speed-select');
    speedSelect.value = 1;
    battleSpeed = 1;

    // 重新装备初始装备
    equipInitialEquipment();
    addLog(`玩家初始生命值: ${playerHealth}，攻击力: ${playerAttack}`);
}