// main.js
window.onload = async function () {
    try {
        // 加载装备数据
        await loadEquipmentData();
        // 加载怪物数据
        await loadMonsterData();
        // 初始化 UI
        initializeUI();
    } catch (error) {
        console.error('游戏初始化出错:', error);
    }
};