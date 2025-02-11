let playerLevel = 1;
let playerExp = 0;
let playerHealth = 100;
let playerAttack = 10;
let playerEquipment = {
    "头盔": null,
    "胸甲": null,
    "手套": null,
    "护腿": null,
    "鞋子": null,
    "武器": null,
    "戒指": null,
    "项链": null
};
let playerSkills = [];
let skillCooldowns = {};
let gameHistory = [];

// 每级所需额外经验，可根据需要调整线性比例
const expPerLevel = 100;

function initPlayer() {
    updatePlayerInfo();
}

function getPlayerLevel() {
    return playerLevel;
}

function getPlayerExp() {
    return playerExp;
}

function getPlayerHealth() {
    return playerHealth;
}

function getPlayerAttack() {
    return playerAttack;
}

function getPlayerEquipment() {
    return playerEquipment;
}

function getPlayerSkills() {
    return playerSkills;
}

function getSkillCooldowns() {
    return skillCooldowns;
}

function addPlayerExp(exp) {
    playerExp += exp;
    checkLevelUp();
    updatePlayerInfo();
}

function getExpToNextLevel() {
    return expPerLevel * playerLevel;
}

function checkLevelUp() {
    const expToNextLevel = getExpToNextLevel();
    if (playerExp >= expToNextLevel) {
        playerLevel++;
        playerHealth += 30;
        playerHealth = Math.min(playerHealth + 50, 100 + (playerLevel - 1) * 30);
        playerAttack += 10;
        playerExp -= expToNextLevel;
        addLog(`玩家升级到了 ${playerLevel} 级！生命值提升到 ${playerHealth}，攻击力提升到 ${playerAttack}`);
        checkLevelUp();
        updatePlayerInfo();
    }
}

function updatePlayerInfo() {
    const playerLevelElement = document.getElementById('player-level');
    const playerExpElement = document.getElementById('player-exp');
    const playerHealthElement = document.getElementById('player-health');
    const playerAttackElement = document.getElementById('player-attack');
    const playerEquipmentElement = document.getElementById('player-equipment');
    const playerSkillsElement = document.getElementById('player-skills');

    playerLevelElement.textContent = playerLevel;
    playerExpElement.textContent = playerExp;
    playerHealthElement.textContent = playerHealth;
    playerAttackElement.textContent = playerAttack;
    playerEquipmentElement.textContent = Object.values(playerEquipment).map(equip => equip ? equip.name : '无').join(', ');
    playerSkillsElement.textContent = playerSkills.map(skill => skill.name).join(', ') || '无';
}

// 战胜恶龙后补充生命值
function recoverHealthAfterWin() {
    playerHealth = Math.min(playerHealth + 30, 100 + (playerLevel - 1) * 30);
    updatePlayerInfo();
    addLog(`玩家战胜恶龙后，生命值恢复到 ${playerHealth}`);
}

function calculatePlayerScore() {
    let score = Math.floor(playerHealth) + Math.floor(playerAttack);
    Object.values(playerEquipment).forEach(equip => {
        if (equip) {
            score += Math.floor(equip.health) + Math.floor(equip.attack);
        }
    });
    return score;
}

function addGameToHistory(score) {
    const date = new Date();
    const timestamp = date.toLocaleString();
    gameHistory.push({ score, timestamp });
    gameHistory.sort((a, b) => b.score - a.score);
}

function getGameHistory() {
    return gameHistory;
}