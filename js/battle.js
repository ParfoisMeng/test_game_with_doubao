let autoBattleInterval = null;
let autoSkillEnabled = false;
let battleSpeed = 1; // 默认倍速为 1 倍

function attack() {
    const playerDamage = getRandomDamage(getPlayerAttack());
    const currentEnemyHealth = getEnemyHealth();
    const newEnemyHealth = currentEnemyHealth - playerDamage;
    setEnemyHealth(newEnemyHealth);
    addLog(`玩家进行普通攻击，造成 ${playerDamage} 点伤害，恶龙剩余生命值: ${newEnemyHealth}`);

    if (newEnemyHealth <= 0) {
        addLog('玩家战胜了恶龙！获得 50 经验值');
        addPlayerExp(50);
        recoverHealthAfterWin();
        dropEquipment();
        resetEnemy();
        reduceSkillCooldowns();
        return;
    }

    const enemyDamage = getRandomDamage(getEnemyAttack());
    const currentPlayerHealth = getPlayerHealth();
    const newPlayerHealth = currentPlayerHealth - enemyDamage;
    playerHealth = newPlayerHealth;
    updatePlayerInfo();
    addLog(`恶龙反击玩家，造成 ${enemyDamage} 点伤害，玩家剩余生命值: ${newPlayerHealth}`);

    if (newPlayerHealth <= 0) {
        addLog('玩家被恶龙击败了！');
        const attackButton = document.getElementById('attack-button');
        if (attackButton) {
            attackButton.disabled = true;
        }
        disableAllSkillButtons();
        const resetButton = document.getElementById('reset-button');
        if (resetButton) {
            resetButton.style.display = 'block';
        }
        stopAutoBattle();
    } else {
        reduceSkillCooldowns();
    }
}

function getRandomDamage(baseDamage) {
    return Math.floor(Math.random() * (baseDamage * 0.2)) + baseDamage * 0.9;
}

function startAutoBattle() {
    if (autoBattleInterval) return;
    const intervalTime = 1000 / battleSpeed; // 根据倍速计算间隔时间
    autoBattleInterval = setInterval(() => {
        if (autoSkillEnabled) {
            const availableSkills = getPlayerSkills().filter(skill => skillCooldowns[skill.name] === 0);
            if (availableSkills.length > 0) {
                const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                useSkill(randomSkill);
            } else {
                attack();
            }
        } else {
            attack();
        }
    }, intervalTime);
    const autoBattleButton = document.getElementById('auto-battle-button');
    autoBattleButton.textContent = '停止自动战斗';
}

function stopAutoBattle() {
    if (autoBattleInterval) {
        clearInterval(autoBattleInterval);
        autoBattleInterval = null;
        const autoBattleButton = document.getElementById('auto-battle-button');
        autoBattleButton.textContent = '开启自动战斗';
    }
}

function toggleAutoSkill() {
    autoSkillEnabled =!autoSkillEnabled;
    const autoSkillCheckbox = document.getElementById('auto-skill-checkbox');
    autoSkillCheckbox.checked = autoSkillEnabled;
}

function changeBattleSpeed(speed) {
    battleSpeed = speed;
    if (autoBattleInterval) {
        stopAutoBattle();
        startAutoBattle();
    }
}