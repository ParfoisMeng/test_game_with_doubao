// 技能列表
const skillList = [
    {
        name: "火球术",
        damage: 50,
        cooldown: 2, // 冷却时间（回合数）
        requiredLevel: 2
    },
    {
        name: "冰冻术",
        damage: 40,
        cooldown: 1,
        requiredLevel: 3
    }
];

function learnAvailableSkills() {
    for (const skill of skillList) {
        if (getPlayerLevel() >= skill.requiredLevel &&!getPlayerSkills().some(s => s.name === skill.name)) {
            playerSkills.push(skill);
            skillCooldowns[skill.name] = 0;
            updatePlayerInfo();
            addLog(`玩家学会了技能: ${skill.name}`);
            createSkillButton(skill);
        }
    }
}

function createSkillButton(skill) {
    const skillButtonsDiv = document.getElementById('skill-buttons');
    const button = document.createElement('button');
    button.textContent = skill.name;
    button.addEventListener('click', () => useSkill(skill));
    skillButtonsDiv.appendChild(button);
}

function useSkill(skill) {
    if (skillCooldowns[skill.name] > 0) {
        addLog(`技能 ${skill.name} 还在冷却中，剩余 ${skillCooldowns[skill.name]} 回合`);
        return;
    }

    let skillDamage = 0;
    if (skill.damage) {
        skillDamage = getRandomDamage(skill.damage);
        setEnemyHealth(getEnemyHealth() - skillDamage);
    }
    if (skill.healthBoost) {
        playerHealth = Math.min(playerHealth + skill.healthBoost, 100 + (getPlayerLevel() - 1) * 30);
        updatePlayerInfo();
    }
    addLog(`玩家使用技能 ${skill.name}，造成 ${skillDamage} 点伤害，玩家生命值: ${playerHealth}，恶龙剩余生命值: ${getEnemyHealth()}`);

    if (getEnemyHealth() <= 0) {
        addLog('玩家战胜了恶龙！获得 50 经验值');
        addPlayerExp(50);
        recoverHealthAfterWin();
        dropEquipment();
        resetEnemy();
        reduceSkillCooldowns();
        skillCooldowns[skill.name] = skill.cooldown;
        return;
    }

    const enemyDamage = getRandomDamage(getEnemyAttack());
    playerHealth -= enemyDamage;
    updatePlayerInfo();
    addLog(`恶龙反击玩家，造成 ${enemyDamage} 点伤害，玩家剩余生命值: ${playerHealth}`);

    if (playerHealth <= 0) {
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
    } else {
        reduceSkillCooldowns();
        skillCooldowns[skill.name] = skill.cooldown;
    }
}

function reduceSkillCooldowns() {
    for (const skillName in skillCooldowns) {
        if (skillCooldowns[skillName] > 0) {
            skillCooldowns[skillName]--;
        }
    }
}

function disableAllSkillButtons() {
    const skillButtons = document.getElementById('skill-buttons').querySelectorAll('button');
    skillButtons.forEach(button => {
        button.disabled = true;
    });
}