import { reactive, computed } from 'vue'

// 巅峰系统：局外永久成长，死亡后保留
const paragon = reactive({
  level: 0,
  totalExp: 0,
  // 累积的永久属性加成
  bonusHealth: 0,
  bonusAttack: 0,
  bonusCritRate: 0,
  bonusLifeSteal: 0,
  bonusDamageReduce: 0,
  // 统计
  totalKills: 0,
  totalBossKills: 0,
  highestWave: 0,
})

// 巅峰升级所需经验（递增）
const PARAGON_BASE_EXP = 200
function paragonExpNeeded(level) {
  return PARAGON_BASE_EXP + level * 50
}

const paragonExpToNext = computed(() => paragonExpNeeded(paragon.level))

// 巅峰可分配点数（每级1点）
const PARAGON_UPGRADES = [
  { key: 'bonusHealth', name: '体质', desc: '永久+5生命值', perPoint: 5 },
  { key: 'bonusAttack', name: '力量', desc: '永久+2攻击力', perPoint: 2 },
  { key: 'bonusCritRate', name: '精准', desc: '永久+1%暴击率', perPoint: 1 },
  { key: 'bonusLifeSteal', name: '汲取', desc: '永久+1%吸血', perPoint: 1 },
  { key: 'bonusDamageReduce', name: '坚韧', desc: '永久+1%减伤', perPoint: 1 },
]

export function useParagon() {
  function addParagonExp(exp) {
    paragon.totalExp += exp
    while (paragon.totalExp >= paragonExpToNext.value) {
      paragon.totalExp -= paragonExpToNext.value
      paragon.level++
    }
  }

  // 玩家死亡时：根据本局表现给巅峰经验
  function onGameEnd(wave, playerLevel) {
    const expGain = wave * 10 + playerLevel * 20
    addParagonExp(expGain)
    if (wave > paragon.highestWave) {
      paragon.highestWave = wave
    }
    return expGain
  }

  function addKill(isBoss) {
    paragon.totalKills++
    if (isBoss) paragon.totalBossKills++
  }

  // 分配巅峰点数到指定属性
  function allocatePoint(upgradeKey) {
    const upgrade = PARAGON_UPGRADES.find(u => u.key === upgradeKey)
    if (upgrade) {
      paragon[upgradeKey] += upgrade.perPoint
    }
  }

  // 获取巅峰系统可用点数（总等级 - 已分配点数）
  const allocatedPoints = computed(() => {
    let total = 0
    for (const u of PARAGON_UPGRADES) {
      total += paragon[u.key] / u.perPoint
    }
    return Math.round(total)
  })

  const availablePoints = computed(() => paragon.level - allocatedPoints.value)

  // 保存到 localStorage
  function save() {
    try {
      localStorage.setItem('paragon', JSON.stringify({ ...paragon }))
    } catch { /* ignore */ }
  }

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem('paragon'))
      if (data) {
        Object.assign(paragon, data)
      }
    } catch { /* ignore */ }
  }

  return {
    paragon,
    paragonExpToNext,
    PARAGON_UPGRADES,
    onGameEnd,
    addKill,
    allocatePoint,
    availablePoints,
    allocatedPoints,
    save,
    load,
  }
}
