// 装备列表
const equipmentList = [
    {
        name: "青铜剑",
        health: 20,
        attack: 20,
        skill: {
            name: "利刃斩",
            damage: 25,
            cooldown: 2
        }
    },
    {
        name: "白银甲",
        health: 40,
        attack: 10,
        skill: {
            name: "守护壁垒",
            damage: 0,
            healthBoost: 30,
            cooldown: 3
        }
    },
    {
        name: "黄金法杖",
        health: 30,
        attack: 30,
        skill: {
            name: "魔法冲击",
            damage: 35,
            cooldown: 2
        }
    }
];

// 初始装备
const initialEquipment = {
    name: "新手剑",
    health: 10,
    attack: 10,
    skill: null
};

function equip(equipment) {
    if (getPlayerEquipment()) {
        const currentTotal = getPlayerEquipment().health + getPlayerEquipment().attack;
        const newTotal = equipment.health + equipment.attack;
        if (newTotal > currentTotal) {
            // 移除当前装备的属性加成
            playerHealth -= getPlayerEquipment().health;
            playerAttack -= getPlayerEquipment().attack;
            playerEquipment = equipment;
            // 添加新装备的属性加成
            playerHealth += equipment.health;
            playerAttack += equipment.attack;
            updatePlayerInfo();
            addLog(`玩家装备了 ${equipment.name}，生命值提升到 ${playerHealth}，攻击力提升到 ${playerAttack}`);
            if (equipment.skill) {
                learnEquipmentSkill(equipment.skill);
            }
        } else {
            addLog(`当前装备属性更优，未替换为 ${equipment.name}`);
        }
    } else {
        playerEquipment = equipment;
        playerHealth += equipment.health;
        playerAttack += equipment.attack;
        updatePlayerInfo();
        addLog(`玩家装备了 ${equipment.name}，生命值提升到 ${playerHealth}，攻击力提升到 ${playerAttack}`);
        if (equipment.skill) {
            learnEquipmentSkill(equipment.skill);
        }
    }
}

function equipInitialEquipment() {
    equip(initialEquipment);
}

function dropEquipment() {
    const hasDroppedEquipment = Math.random() < 0.4; // 40% 概率掉落装备
    if (hasDroppedEquipment) {
        const randomIndex = Math.floor(Math.random() * equipmentList.length);
        const droppedEquipment = equipmentList[randomIndex];
        addLog(`恭喜！恶龙掉落了 ${droppedEquipment.name}！`);
        equip(droppedEquipment);
    }
}

function learnEquipmentSkill(skill) {
    if (!playerSkills.some(s => s.name === skill.name)) {
        playerSkills.push(skill);
        skillCooldowns[skill.name] = 0;
        updatePlayerInfo();
        addLog(`玩家学会了装备技能: ${skill.name}`);
        createSkillButton(skill);
    }
}