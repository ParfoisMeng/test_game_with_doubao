// 初始化游戏
window.onload = function () {
    // 生成 UI
    generateUI();
    // 初始化玩家
    initPlayer();
    // 初始化敌人
    initEnemy();
    // 给玩家带上初始装备
    equipInitialEquipment();
    // 提示玩家初始属性
    addLog(`玩家初始生命值: ${getPlayerHealth()}，攻击力: ${getPlayerAttack()}`);

    // 绑定攻击按钮事件
    const attackButton = document.getElementById('attack-button');
    if (attackButton) {
        attackButton.addEventListener('click', attack);
    }

    // 绑定自动战斗按钮事件
    const autoBattleButton = document.getElementById('auto-battle-button');
    if (autoBattleButton) {
        autoBattleButton.addEventListener('click', () => {
            if (autoBattleInterval) {
                stopAutoBattle();
            } else {
                startAutoBattle();
            }
        });
    }

    // 绑定重置按钮事件
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', resetGame);
    }

    // 绑定模式切换按钮事件
    const modeToggleButton = document.getElementById('mode-toggle-button');
    if (modeToggleButton) {
        modeToggleButton.addEventListener('click', toggleMode);
    }
};

function toggleMode() {
    const styleLink = document.getElementById('style-link');
    const titleElement = document.querySelector('title');
    const h1Element = document.querySelector('h1');
    const modeToggleButton = document.getElementById('mode-toggle-button');

    if (styleLink.href.endsWith('work_mode.css')) {
        styleLink.href = 'css/game_mode.css';
        titleElement.textContent = '🎮包暗黑豆🎮';
        h1Element.textContent = '🎮包暗黑豆🎮';
        modeToggleButton.textContent = '切换到摸鱼模式';
    } else {
        styleLink.href = 'css/work_mode.css';
        titleElement.textContent = '📄工作文档📄';
        h1Element.textContent = '📄工作文档📄';
        modeToggleButton.textContent = '切换到游戏模式';
    }
}