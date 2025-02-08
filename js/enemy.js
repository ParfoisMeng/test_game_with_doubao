let enemyHealth = 100;
let enemyAttack = 10;

function initEnemy() {
    const enemyHealthElement = document.getElementById('enemy-health');
    const enemyAttackElement = document.getElementById('enemy-attack');

    enemyHealthElement.textContent = enemyHealth;
    enemyAttackElement.textContent = enemyAttack;
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
    enemyHealth = 100 + (getPlayerLevel() - 1) * 5;
    enemyAttack = 10 + (getPlayerLevel() - 1) * 1;
    setEnemyHealth(enemyHealth);
    setEnemyAttack(enemyAttack);
}