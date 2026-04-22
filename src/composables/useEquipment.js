import { usePlayer } from './usePlayer'
import equipmentList from '../data/equipment.json'

const INITIAL_EQUIPMENT = '木剑'

// 稀有度定义：名称、颜色、属性倍率(降低)、词缀数量范围(核心)
const RARITIES = [
  { name: '普通', color: '#aaa',    multiplier: 1.0, affixCount: [0, 0], affixMult: 1.0, weight: 40 },
  { name: '优秀', color: '#4a9eff', multiplier: 1.05, affixCount: [1, 1], affixMult: 1.0, weight: 30 },
  { name: '稀有', color: '#b44aff', multiplier: 1.1, affixCount: [1, 2], affixMult: 1.3, weight: 18 },
  { name: '传说', color: '#ff8c00', multiplier: 1.15, affixCount: [2, 3], affixMult: 1.6, weight: 9  },
  { name: '史诗', color: '#ff2222', multiplier: 1.2, affixCount: [3, 4], affixMult: 2.0, weight: 3  },
]

// 可用词缀池
const AFFIX_POOL = [
  { name: '暴击', desc: '暴击率', key: 'critRate', range: [5, 15], unit: '%' },
  { name: '吸血', desc: '生命偷取', key: 'lifeSteal', range: [3, 10], unit: '%' },
  { name: '坚韧', desc: '减伤', key: 'damageReduce', range: [3, 8], unit: '%' },
  { name: '狂暴', desc: '攻击加成', key: 'attackBonus', range: [5, 15], unit: '%' },
  { name: '生机', desc: '生命加成', key: 'healthBonus', range: [5, 20], unit: '%' },
  { name: '迅捷', desc: '闪避率', key: 'dodgeRate', range: [3, 10], unit: '%' },
  { name: '反噬', desc: '伤害反弹', key: 'reflect', range: [5, 12], unit: '%' },
  { name: '灼烧', desc: '附加火伤', key: 'fireDamage', range: [3, 12], unit: '' },
  { name: '冰冻', desc: '附加冰伤', key: 'iceDamage', range: [3, 12], unit: '' },
  { name: '雷击', desc: '附加雷伤', key: 'thunderDamage', range: [3, 12], unit: '' },
]

function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function rollRarity(isBoss = false) {
  if (isBoss) {
    // BOSS 保底稀有以上
    const bossPool = RARITIES.filter(r => RARITIES.indexOf(r) >= 2)
    const totalWeight = bossPool.reduce((s, r) => s + r.weight, 0)
    let roll = Math.random() * totalWeight
    for (const r of bossPool) {
      roll -= r.weight
      if (roll <= 0) return r
    }
    return bossPool[bossPool.length - 1]
  }

  const totalWeight = RARITIES.reduce((s, r) => s + r.weight, 0)
  let roll = Math.random() * totalWeight
  for (const r of RARITIES) {
    roll -= r.weight
    if (roll <= 0) return r
  }
  return RARITIES[0]
}

function rollAffixes(count, affixMult = 1.0) {
  const available = [...AFFIX_POOL]
  const result = []
  const num = Math.min(count, available.length)
  for (let i = 0; i < num; i++) {
    const idx = Math.floor(Math.random() * available.length)
    const affix = available.splice(idx, 1)[0]
    const baseValue = randomInRange(affix.range[0], affix.range[1])
    result.push({
      ...affix,
      value: Math.floor(baseValue * affixMult),
    })
  }
  return result
}

function generateRandomStats(base, rarity = null, isBoss = false) {
  const r = rarity || rollRarity(isBoss)
  const affixCount = randomInRange(r.affixCount[0], r.affixCount[1])
  const affixes = rollAffixes(affixCount, r.affixMult || 1.0)

  let health = Math.floor(randomInRange(base.healthRange[0], base.healthRange[1]) * r.multiplier)
  let attack = Math.floor(randomInRange(base.attackRange[0], base.attackRange[1]) * r.multiplier)

  // 词缀中的百分比加成应用到基础属性
  for (const af of affixes) {
    if (af.key === 'healthBonus') health = Math.floor(health * (1 + af.value / 100))
    if (af.key === 'attackBonus') attack = Math.floor(attack * (1 + af.value / 100))
  }

  return {
    ...base,
    health,
    attack,
    rarity: r,
    affixes,
  }
}

function formatEquipName(equip) {
  if (!equip.rarity || equip.rarity.name === '普通') return equip.name
  return `[${equip.rarity.name}]${equip.name}`
}

function formatEquipDetail(equip) {
  let text = `${formatEquipName(equip)}（生命: ${equip.health}，攻击: ${equip.attack}）`
  if (equip.affixes && equip.affixes.length > 0) {
    const affixText = equip.affixes.map(a => `${a.name}+${a.value}${a.unit}`).join(' ')
    text += ` [${affixText}]`
  }
  return text
}

// 计算装备综合评分（包含词缀价值）
function equipScore(equip) {
  let score = equip.health + equip.attack
  if (equip.affixes) {
    for (const af of equip.affixes) {
      score += af.value * 0.5 // 词缀也算分
    }
  }
  return score
}

export function useEquipment() {
  const { state: player } = usePlayer()

  function addAttributes(equip) {
    player.health += equip.health
    player.attack += equip.attack
  }

  function removeAttributes(equip) {
    player.health -= equip.health
    player.attack -= equip.attack
  }

  function learnSkill(skill, addLog) {
    if (!player.skills.some(s => s.name === skill.name)) {
      player.skills.push(skill)
      player.skillCooldowns[skill.name] = 0
      addLog?.(`玩家学会了装备技能: ${skill.name}`)
    }
  }

  function removeSkill(skill, addLog) {
    const idx = player.skills.findIndex(s => s.name === skill.name)
    if (idx !== -1) {
      player.skills.splice(idx, 1)
      delete player.skillCooldowns[skill.name]
      addLog?.(`玩家失去了装备技能: ${skill.name}`)
    }
  }

  function doEquip(equipment, addLog) {
    const current = player.equipment[equipment.type]
    if (current) {
      const currentScore = equipScore(current)
      const newScore = equipScore(equipment)
      if (newScore > currentScore) {
        removeAttributes(current)
        if (current.skill) removeSkill(current.skill, addLog)
        player.equipment[equipment.type] = equipment
        addAttributes(equipment)
        if (equipment.skill) learnSkill(equipment.skill, addLog)
        addLog?.({
          text: `装备了 ${formatEquipDetail(equipment)}`,
          color: equipment.rarity?.color,
        })
      } else {
        addLog?.({
          text: `丢弃了 ${formatEquipDetail(equipment)}（当前${equipment.type}更优）`,
          color: '#888',
        })
      }
    } else {
      player.equipment[equipment.type] = equipment
      addAttributes(equipment)
      if (equipment.skill) learnSkill(equipment.skill, addLog)
      addLog?.({
        text: `装备了 ${formatEquipDetail(equipment)}`,
        color: equipment.rarity?.color,
      })
    }
  }

  function equipInitial(addLog) {
    const base = equipmentList.find(e => e.name === INITIAL_EQUIPMENT)
    if (base) {
      doEquip(generateRandomStats(base, RARITIES[0]), addLog)
    }
  }

  function dropEquipment(addLog, isBoss = false) {
    const dropRate = isBoss ? 1.0 : 0.4
    if (Math.random() < dropRate) {
      const base = equipmentList[Math.floor(Math.random() * equipmentList.length)]
      const dropped = generateRandomStats(base, null, isBoss)
      const rarityIdx = RARITIES.indexOf(dropped.rarity)

      // 不同稀有度的掉落描述
      let dropPrefix = '掉落了'
      if (rarityIdx >= 4) dropPrefix = '★★★ 史诗掉落！'
      else if (rarityIdx >= 3) dropPrefix = '★★ 传说掉落！'
      else if (rarityIdx >= 2) dropPrefix = '★ 稀有掉落！'

      addLog?.({
        text: `${dropPrefix} ${formatEquipDetail(dropped)}`,
        color: dropped.rarity.color,
      })
      doEquip(dropped, addLog)
      // BOSS额外掉一件
      if (isBoss && Math.random() < 0.5) {
        const base2 = equipmentList[Math.floor(Math.random() * equipmentList.length)]
        const dropped2 = generateRandomStats(base2, null, true)
        addLog?.({
          text: `额外掉落！${formatEquipDetail(dropped2)}`,
          color: dropped2.rarity.color,
        })
        doEquip(dropped2, addLog)
      }
    }
  }

  return { doEquip, equipInitial, dropEquipment, formatEquipName, formatEquipDetail, equipScore, RARITIES }
}
