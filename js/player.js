let playerLevel = 1;
let playerExp = 0;
let playerHealth = 100;
let playerAttack = 10;
let playerEquipment = null;
let playerSkills = [];
let skillCooldowns = {};

// 升级所需经验值表，可根据需要调整
const expTable = [
    100,  // 1 级升 2 级所需经验
    200,  // 2 级升 3 级所需经验
    300,  // 3 级升 4 级所需经验
    400,  // 4 级升 5 级所需经验
    500   // 5 级升 6 级所需经验
];

function initPlayer() {
    const playerLevelElement = document.getElementById('player-level');
    const playerExpElement = document.getElementById('player-exp');
    const playerHealthElement = document.getElementById('player-health');
    const playerAttackElement = document.getElementById('player-attack');

    playerLevelElement.textContent = playerLevel;
    playerExpElement.textContent = playerExp;
    playerHealthElement.textContent = playerHealth;
    playerAttackElement.textContent = playerAttack;
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
    updatePlayerInfo();
    checkLevelUp();
}

function checkLevelUp() {
    if (playerLevel < expTable.length && playerExp >= expTable[playerLevel - 1]) {
        playerLevel++;
        playerHealth += 30;
        playerHealth = Math.min(playerHealth + 50, 100 + (playerLevel - 1) * 30);
        playerAttack += 10;
        playerExp -= expTable[playerLevel - 2];
        updatePlayerInfo();
        addLog(`玩家升级到了 ${playerLevel} 级！生命值提升到 ${playerHealth}，攻击力提升到 ${playerAttack}`);
        learnAvailableSkills();
        checkLevelUp();
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
    playerEquipmentElement.textContent = playerEquipment ? playerEquipment.name : '无';
    playerSkillsElement.textContent = playerSkills.map(skill => skill.name).join(', ') || '无';
}

// 战胜恶龙后补充生命值
function recoverHealthAfterWin() {
    playerHealth = Math.min(playerHealth + 30, 100 + (playerLevel - 1) * 30);
    updatePlayerInfo();
    addLog(`玩家战胜恶龙后，生命值恢复到 ${playerHealth}`);
}