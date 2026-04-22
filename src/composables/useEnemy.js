import { reactive } from 'vue'
import monsterList from '../data/monsters.json'

const HEALTH_COEFF = 3    // 降低：原5
const ATTACK_COEFF = 1    // 降低：原2
const EXP_COEFF = 10
const BOSS_INTERVAL = 10
const ELITE_CHANCE = 0.2  // 降低：原25%

// 精英词缀
const ELITE_AFFIXES = [
  { name: '火焰附体', desc: '每回合灼烧玩家', key: 'burn', value: 5 },
  { name: '嗜血', desc: '攻击附带吸血', key: 'vampiric', value: 0.15 },
  { name: '坚壳', desc: '减免受到的伤害', key: 'armor', value: 0.2 },
  { name: '狂暴', desc: '攻击力大幅提升', key: 'enrage', value: 0.4 },
  { name: '再生', desc: '每回合恢复生命', key: 'regen', value: 0.03 },
  { name: '反弹', desc: '反弹部分伤害', key: 'reflect', value: 0.1 },
]

const state = reactive({
  name: '',
  health: 100,
  maxHealth: 100,
  attack: 10,
  wave: 1,
  type: 'normal',  // 'normal' | 'elite' | 'boss'
  affixes: [],
  description: '',
})

export function useEnemy() {
  function init(playerLevel) {
    const idx = Math.floor(Math.random() * monsterList.length)
    const monster = monsterList[idx]

    const baseHealth = monster.baseHealth + HEALTH_COEFF * (playerLevel - 1) ** 2
    const baseAttack = monster.baseAttack + ATTACK_COEFF * (playerLevel - 1) ** 2

    // 确定怪物类型
    let type = 'normal'
    let affixes = []
    let healthMult = 1
    let attackMult = 1

    if (state.wave % BOSS_INTERVAL === 0) {
      type = 'boss'
      healthMult = 2.0    // 降低：原3.0
      attackMult = 1.5    // 降低：原2.0
      // BOSS 带 2-3 个词缀
      const count = 2 + Math.floor(Math.random() * 2)
      affixes = rollEliteAffixes(count)
    } else if (Math.random() < ELITE_CHANCE) {
      type = 'elite'
      healthMult = 1.5    // 降低：原1.8
      attackMult = 1.3    // 降低：原1.5
      // 精英带 1-2 个词缀
      const count = 1 + Math.floor(Math.random() * 2)
      affixes = rollEliteAffixes(count)
    }

    // 狂暴词缀额外加攻击
    for (const af of affixes) {
      if (af.key === 'enrage') attackMult *= (1 + af.value)
    }

    state.name = monster.name
    state.health = Math.floor(baseHealth * healthMult)
    state.maxHealth = state.health
    state.attack = Math.floor(baseAttack * attackMult)
    state.type = type
    state.affixes = affixes
    state.description = monster.description
  }

  function rollEliteAffixes(count) {
    const pool = [...ELITE_AFFIXES]
    const result = []
    for (let i = 0; i < Math.min(count, pool.length); i++) {
      const idx = Math.floor(Math.random() * pool.length)
      result.push(pool.splice(idx, 1)[0])
    }
    return result
  }

  function takeDamage(damage) {
    // 坚壳词缀减伤
    const armor = state.affixes.find(a => a.key === 'armor')
    if (armor) {
      damage = Math.floor(damage * (1 - armor.value))
    }
    state.health = Math.max(0, Math.floor(state.health - damage))
    return damage
  }

  // 精英/BOSS 回合效果，返回日志消息数组
  function applyTurnEffects(playerTakeDamage) {
    const messages = []

    for (const af of state.affixes) {
      if (af.key === 'burn') {
        playerTakeDamage(af.value)
        messages.push({ text: `${getDisplayName()} 的火焰灼烧了你，造成 ${af.value} 点伤害！`, color: '#ff6600' })
      }
      if (af.key === 'regen' && state.health > 0) {
        const heal = Math.floor(state.maxHealth * af.value)
        state.health = Math.min(state.maxHealth, state.health + heal)
        messages.push({ text: `${getDisplayName()} 恢复了 ${heal} 点生命值`, color: '#44cc44' })
      }
    }

    return messages
  }

  // 攻击时的吸血效果
  function applyVampiric(damage) {
    const vamp = state.affixes.find(a => a.key === 'vampiric')
    if (vamp && state.health > 0) {
      const heal = Math.floor(damage * vamp.value)
      state.health = Math.min(state.maxHealth, state.health + heal)
      return heal
    }
    return 0
  }

  // 反弹伤害
  function getReflectDamage(incomingDamage) {
    const ref = state.affixes.find(a => a.key === 'reflect')
    if (ref) return Math.floor(incomingDamage * ref.value)
    return 0
  }

  function getExp(playerLevel) {
    let base = 50 + EXP_COEFF * (playerLevel - 1) ** 2
    if (state.type === 'elite') base = Math.floor(base * 2)
    if (state.type === 'boss') base = Math.floor(base * 5)
    return base
  }

  function getDisplayName() {
    const prefix = state.type === 'boss' ? '【BOSS】' : state.type === 'elite' ? '〈精英〉' : ''
    return prefix + state.name
  }

  function getTypeColor() {
    if (state.type === 'boss') return '#ff2222'
    if (state.type === 'elite') return '#ff8c00'
    return ''
  }

  function nextWave(playerLevel) {
    state.wave++
    init(playerLevel)
  }

  function reset(playerLevel) {
    state.wave = 1
    init(playerLevel)
  }

  return {
    state,
    init,
    takeDamage,
    getExp,
    nextWave,
    reset,
    getDisplayName,
    getTypeColor,
    applyTurnEffects,
    applyVampiric,
    getReflectDamage,
  }
}
