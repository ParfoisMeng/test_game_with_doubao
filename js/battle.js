// 全局变量
let autoBattleInterval = null;
let autoSkillEnabled = false;
let battleSpeed = 1; 
let isPlayerDefeated = false;

// 执行战斗动作的通用函数
function performBattleAction(action, actionName, damage, healthBoost = 0, cooldown = 0) {
    if (isPlayerDefeated) return;

    const currentEnemyHealth = getEnemyHealth();
    const newEnemyHealth = Math.max(0, Math.floor(currentEnemyHealth - damage));
    setEnemyHealth(newEnemyHealth);
    const enemyName = getCurrentEnemyName();
    addLog(`玩家使用 ${actionName} 对 ${enemyName} 造成 ${damage} 点伤害，${enemyName} 剩余生命值: ${newEnemyHealth}`);

    if (healthBoost > 0) {
        playerHealth = Math.min(Math.floor(playerHealth + healthBoost), 100 + (getPlayerLevel() - 1) * 30);
        updatePlayerInfo();
        addLog(`玩家使用 ${actionName} 恢复了 ${healthBoost} 点生命值，当前生命值: ${playerHealth}`);
    }

    handleEnemyDefeat(newEnemyHealth, actionName);

    if (cooldown > 0) {
        skillCooldowns[actionName] = cooldown;
    }
    reduceSkillCooldowns();
}

// 处理敌人被击败的情况
function handleEnemyDefeat(newEnemyHealth, actionName) {
    if (newEnemyHealth <= 0) {
        const enemyExp = getEnemyExp();
        addLog(`玩家使用 ${actionName} 战胜了 ${getCurrentEnemyName()}！获得 ${enemyExp} 经验值`);
        addPlayerExp(enemyExp);
        recoverHealthAfterWin();
        dropEquipment();
        resetEnemy();
    } else {
        const enemyDamage = getRandomDamage(getEnemyAttack());
        const currentPlayerHealth = getPlayerHealth();
        const newPlayerHealth = Math.max(0, Math.floor(currentPlayerHealth - enemyDamage));
        playerHealth = newPlayerHealth;
        updatePlayerInfo();
        addLog(`${getCurrentEnemyName()} 反击玩家，造成 ${enemyDamage} 点伤害，玩家剩余生命值: ${newPlayerHealth}`);

        if (newPlayerHealth <= 0) {
            endGame();
        }
    }
}

// 普通攻击函数
function attack() {
    const playerDamage = getRandomDamage(getPlayerAttack());
    performBattleAction('attack', '普通攻击', playerDamage);
}

// 使用技能函数
function useSkill(skill) {
    if (skillCooldowns[skill.name] > 0) {
        addLog(`技能 ${skill.name} 还在冷却中，剩余 ${skillCooldowns[skill.name]} 回合`);
        return;
    }
    performBattleAction('skill', skill.name, skill.damage, skill.healthBoost, skill.cooldown);
}

// 生成随机伤害值
function getRandomDamage(baseDamage) {
    return Math.floor(Math.random() * (baseDamage * 0.2)) + Math.floor(baseDamage * 0.9);
}

// 启动自动战斗
function startAutoBattle() {
    if (isPlayerDefeated) {
        return;
    }

    if (autoBattleInterval) {
        return;
    }

    const intervalTime = 1000 / battleSpeed;
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

// 停止自动战斗
function stopAutoBattle() {
    if (autoBattleInterval) {
        clearInterval(autoBattleInterval);
        autoBattleInterval = null;
        const autoBattleButton = document.getElementById('auto-battle-button');
        // 检查元素是否存在
        if (autoBattleButton) { 
            autoBattleButton.textContent = '开启自动战斗';
        }
    }
}

// 切换自动释放技能选项
function toggleAutoSkill() {
    autoSkillEnabled =!autoSkillEnabled;
    const autoSkillCheckbox = document.getElementById('auto-skill-checkbox');
    autoSkillCheckbox.checked = autoSkillEnabled;
}

// 改变战斗速度
function changeBattleSpeed(speed) {
    battleSpeed = speed;
    if (autoBattleInterval) {
        stopAutoBattle();
        startAutoBattle();
    }
}

// 减少技能冷却时间
function reduceSkillCooldowns() {
    for (const skillName in skillCooldowns) {
        if (skillCooldowns[skillName] > 0) {
            skillCooldowns[skillName]--;
        }
    }
    updateSkillButtonStates();
}

// 更新技能按钮状态
function updateSkillButtonStates() {
    const skillButtons = document.querySelectorAll('#skill-buttons button');
    skillButtons.forEach(button => {
        const skillName = button.dataset.skill;
        if (skillCooldowns[skillName] > 0) {
            button.disabled = true;
            button.textContent = `${skillName} (冷却中: ${skillCooldowns[skillName]})`;
        } else {
            button.disabled = false;
            button.textContent = skillName;
        }
    });
}

// 禁用所有技能按钮
function disableAllSkillButtons() {
    const skillButtons = document.querySelectorAll('#skill-buttons button');
    skillButtons.forEach(button => {
        button.disabled = true;
    });
}

// 结束游戏
function endGame() {
    const enemyNameFinal = getCurrentEnemyName();
    const currentWave = getCurrentWave();
    const playerScore = calculatePlayerScore();
    addGameToHistory(playerScore);
    // 显示结算榜单页面
    showScoreboard(playerScore);
    const attackButton = document.getElementById('attack-button');
    if (attackButton) {
        attackButton.disabled = true;
    }
    disableAllSkillButtons();
    stopAutoBattle();
    isPlayerDefeated = true;
}