let enemyHealth = 100;
let enemyAttack = 10;
let currentEnemy;
let currentWave = 1;
// 怪物生命值和攻击力的二次函数系数，可根据需要调整
const enemyHealthCoefficient = 5;
const enemyAttackCoefficient = 2;
// 怪物提供经验值的二次函数系数，可根据需要调整
const enemyExpCoefficient = 10;
let monsterList = [];

// 从 JSON 文件加载怪物数据
async function loadMonsterData() {
    try {
        const response = await fetch('../data/monsters.json');
        monsterList = await response.json();
        initEnemy();
    } catch (error) {
        console.error('加载怪物数据时出错:', error);
    }
}

function initEnemy() {
    const enemyHealthElement = document.getElementById('enemy-health');
    const enemyAttackElement = document.getElementById('enemy-attack');
    const enemyNameElement = document.getElementById('enemy-name');
    const waveInfoElement = document.getElementById('wave-info');

    const randomIndex = Math.floor(Math.random() * monsterList.length);
    currentEnemy = monsterList[randomIndex];

    enemyHealth = currentEnemy.baseHealth + enemyHealthCoefficient * (getPlayerLevel() - 1) * (getPlayerLevel() - 1);
    enemyAttack = currentEnemy.baseAttack + enemyAttackCoefficient * (getPlayerLevel() - 1) * (getPlayerLevel() - 1);

    if (enemyHealthElement) { 
        enemyHealthElement.textContent = enemyHealth;
    }
    if (enemyAttackElement) {
        enemyAttackElement.textContent = enemyAttack;
    }
    if (enemyNameElement) {
        enemyNameElement.textContent = currentEnemy.name;
    }
    if (waveInfoElement) {
        waveInfoElement.textContent = `当前怪物波次: ${currentWave}`;
    }
}

function getEnemyHealth() {
    return enemyHealth;
}

function getEnemyAttack() {
    return enemyAttack;
}

function setEnemyHealth(health) {
    enemyHealth = health;
    const enemyHealthElement = document.getElementById('enemy-health');
    enemyHealthElement.textContent = enemyHealth;
}

function setEnemyAttack(attack) {
    enemyAttack = attack;
    const enemyAttackElement = document.getElementById('enemy-attack');
    enemyAttackElement.textContent = enemyAttack;
}

function resetEnemy() {
    currentWave++;
    initEnemy();
}

function getEnemyExp() {
    return 50 + enemyExpCoefficient * (getPlayerLevel() - 1) * (getPlayerLevel() - 1);
}

function getCurrentEnemyName() {
    return currentEnemy.name;
}

function getCurrentWave() {
    return currentWave;
}