import { reactive, computed } from 'vue'

const EXP_PER_LEVEL = 100

const state = reactive({
  level: 1,
  exp: 0,
  baseHealth: 100,
  baseAttack: 10,
  health: 100,
  attack: 10,
  bonusMaxHealth: 0,
  equipment: {
    '头盔': null,
    '胸甲': null,
    '手套': null,
    '护腿': null,
    '鞋子': null,
    '武器': null,
    '戒指': null,
    '项链': null,
  },
  skills: [],
  skillCooldowns: {},
  gameHistory: [],
})

const equipHealthBonus = computed(() => {
  let total = 0
  for (const equip of Object.values(state.equipment)) {
    if (equip) total += equip.health
  }
  return total
})

const maxHealth = computed(() => 100 + (state.level - 1) * 30 + state.bonusMaxHealth + equipHealthBonus.value)
const expToNextLevel = computed(() => EXP_PER_LEVEL * state.level)

export function usePlayer() {
  function addExp(exp, addLog) {
    state.exp += exp
    checkLevelUp(addLog)
  }

  function checkLevelUp(addLog) {
    if (state.exp >= expToNextLevel.value) {
      const cost = expToNextLevel.value
      state.exp -= cost
      state.level++
      state.baseHealth += 30
      state.health = Math.min(state.health + 50, maxHealth.value)
      state.baseAttack += 10
      state.attack += 10
      addLog?.(`玩家升级到了 ${state.level} 级！生命值提升到 ${state.health}，攻击力提升到 ${state.attack}`)
      checkLevelUp(addLog)
    }
  }

  function recoverHealth(addLog) {
    state.health = Math.min(state.health + 30, maxHealth.value)
    addLog?.(`玩家战胜怪物后，生命值恢复到 ${state.health}`)
  }

  function takeDamage(damage) {
    state.health = Math.max(0, Math.floor(state.health - damage))
  }

  function calculateScore(wave, kills, bossKills) {
    const waveScore = wave * 10
    const levelScore = state.level * 20
    const killScore = kills * 2
    const bossScore = bossKills * 50
    let equipScore = 0
    Object.values(state.equipment).forEach(equip => {
      if (equip) {
        equipScore += equip.health + equip.attack
        if (equip.affixes) {
          for (const af of equip.affixes) equipScore += Math.floor(af.value * 0.5)
        }
        const rarityIdx = ['普通', '优秀', '稀有', '传说', '史诗'].indexOf(equip.rarity?.name || '普通')
        equipScore += rarityIdx * 5
      }
    })
    const total = waveScore + levelScore + killScore + bossScore + equipScore
    return {
      total,
      wave, waveScore,
      level: state.level, levelScore,
      kills, killScore,
      bossKills, bossScore,
      equipScore,
    }
  }

  function addGameToHistory(score, wave) {
    const timestamp = new Date().toLocaleString()
    state.gameHistory.push({ score, wave, timestamp })
    state.gameHistory.sort((a, b) => b.score - a.score)
  }

  function reset() {
    state.level = 1
    state.exp = 0
    state.baseHealth = 100
    state.baseAttack = 10
    state.health = 100
    state.attack = 10
    state.bonusMaxHealth = 0
    state.equipment = {
      '头盔': null, '胸甲': null, '手套': null, '护腿': null,
      '鞋子': null, '武器': null, '戒指': null, '项链': null,
    }
    state.skills = []
    state.skillCooldowns = {}
  }

  function reduceSkillCooldowns() {
    for (const name in state.skillCooldowns) {
      if (state.skillCooldowns[name] > 0) {
        state.skillCooldowns[name]--
      }
    }
  }

  return {
    state,
    maxHealth,
    expToNextLevel,
    addExp,
    recoverHealth,
    takeDamage,
    calculateScore,
    addGameToHistory,
    reset,
    reduceSkillCooldowns,
  }
}
