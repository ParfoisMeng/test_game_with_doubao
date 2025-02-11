let equipmentList = [];
const initialEquipmentName = "木剑";

// 从 JSON 文件加载装备数据
async function loadEquipmentData() {
    try {
        const response = await fetch('../data/equipment.json');
        equipmentList = await response.json();
        // 找到初始装备
        const initialEquip = equipmentList.find(equip => equip.name === initialEquipmentName);
        if (initialEquip) {
            const equippedInitial = generateRandomStats(initialEquip);
            equipInitialEquipment(equippedInitial);
        }
    } catch (error) {
        console.error('加载装备数据时出错:', error);
    }
}

function generateRandomStats(equipment) {
    const health = Math.floor(Math.random() * (equipment.healthRange[1] - equipment.healthRange[0] + 1)) + equipment.healthRange[0];
    const attack = Math.floor(Math.random() * (equipment.attackRange[1] - equipment.attackRange[0] + 1)) + equipment.attackRange[0];
    return {
        ...equipment,
        health,
        attack
    };
}

function equip(equipment) {
    const currentEquip = playerEquipment[equipment.type];
    if (currentEquip) {
        const currentTotal = currentEquip.health + currentEquip.attack;
        const newTotal = equipment.health + equipment.attack;
        if (newTotal > currentTotal) {
            removeEquipmentAttributes(currentEquip);
            if (currentEquip.skill) {
                removeEquipmentSkill(currentEquip.skill);
            }
            playerEquipment[equipment.type] = equipment;
            addEquipmentAttributes(equipment);
            addLog(`玩家装备了 ${equipment.name}（生命值: ${equipment.health}，攻击力: ${equipment.attack}），总生命值提升到 ${playerHealth}，总攻击力提升到 ${playerAttack}`);
            if (equipment.skill) {
                learnEquipmentSkill(equipment.skill);
            }
        } else {
            addLog(`当前 ${equipment.type} 属性更优，未替换为 ${equipment.name}（生命值: ${equipment.health}，攻击力: ${equipment.attack}）`);
        }
    } else {
        playerEquipment[equipment.type] = equipment;
        addEquipmentAttributes(equipment);
        addLog(`玩家装备了 ${equipment.name}（生命值: ${equipment.health}，攻击力: ${equipment.attack}），总生命值提升到 ${playerHealth}，总攻击力提升到 ${playerAttack}`);
        if (equipment.skill) {
            learnEquipmentSkill(equipment.skill);
        }
    }
    updatePlayerInfo();
}

function equipInitialEquipment(equipment) {
    equip(equipment);
}

function dropEquipment() {
    const hasDroppedEquipment = Math.random() < 0.4; // 40% 概率掉落装备
    if (hasDroppedEquipment) {
        const randomIndex = Math.floor(Math.random() * equipmentList.length);
        const baseEquipment = equipmentList[randomIndex];
        const droppedEquipment = generateRandomStats(baseEquipment);
        addLog(`恭喜！恶龙掉落了 ${droppedEquipment.name}（生命值: ${droppedEquipment.health}，攻击力: ${droppedEquipment.attack}）！`);
        equip(droppedEquipment);
    }
}

function learnEquipmentSkill(skill) {
    if (!playerSkills.some(s => s.name === skill.name)) {
        playerSkills.push(skill);
        skillCooldowns[skill.name] = 0;
        addLog(`玩家学会了装备技能: ${skill.name}`);
        createSkillButton(skill);
        updatePlayerInfo();
    }
}

function removeEquipmentSkill(skill) {
    const skillIndex = playerSkills.findIndex(s => s.name === skill.name);
    if (skillIndex!== -1) {
        playerSkills.splice(skillIndex, 1);
        delete skillCooldowns[skill.name];
        addLog(`玩家失去了装备技能: ${skill.name}`);
        const skillButton = document.querySelector(`[data-skill="${skill.name}"]`);
        if (skillButton) {
            skillButton.remove();
        }
        updatePlayerInfo();
    }
}

function createSkillButton(skill) {
    const skillButtonsDiv = document.getElementById('skill-buttons');
    if (!skillButtonsDiv) {
        console.error('未找到技能按钮容器');
        return;
    }
    const button = document.createElement('button');
    button.textContent = skill.name;
    button.dataset.skill = skill.name;
    button.addEventListener('click', () => useSkill(skill));
    skillButtonsDiv.appendChild(button);
}

function addEquipmentAttributes(equipment) {
    playerHealth += equipment.health;
    playerAttack += equipment.attack;
}

function removeEquipmentAttributes(equipment) {
    playerHealth -= equipment.health;
    playerAttack -= equipment.attack;
}