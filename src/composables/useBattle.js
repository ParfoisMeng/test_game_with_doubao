import { ref } from 'vue'
import { usePlayer } from './usePlayer'
import { useEnemy } from './useEnemy'
import { useEquipment } from './useEquipment'
import { useParagon } from './useParagon'

export function useBattle(addLog) {
  const player = usePlayer()
  const enemy = useEnemy()
  const equipment = useEquipment()
  const paragon = useParagon()

  const isDefeated = ref(false)
  const autoBattleInterval = ref(null)
  const autoSkillEnabled = ref(false)
  const battleSpeed = ref(1)
  const runKills = ref(0)
  const runBossKills = ref(0)
  const deathState = ref(null)
  const lastScoreDetail = ref(null)

  function getRandomDamage(base) {
    return Math.floor(Math.random() * (base * 0.2)) + Math.floor(base * 0.9)
  }

  // 检查玩家装备词缀效果 + 巅峰加成
  function getPlayerAffixValue(key) {
    let total = 0
    for (const equip of Object.values(player.state.equipment)) {
      if (equip?.affixes) {
        for (const af of equip.affixes) {
          if (af.key === key) total += af.value
        }
      }
    }
    // 巅峰永久加成
    if (key === 'critRate') total += paragon.paragon.bonusCritRate
    if (key === 'lifeSteal') total += paragon.paragon.bonusLifeSteal
    if (key === 'damageReduce') total += paragon.paragon.bonusDamageReduce
    return total
  }

  function applyPlayerCrit(damage) {
    const critRate = getPlayerAffixValue('critRate')
    if (critRate > 0 && Math.random() * 100 < critRate) {
      const critDamage = Math.floor(damage * 1.5)
      addLog({ text: `暴击！造成 ${critDamage} 点伤害！`, color: '#ffcc00' })
      return critDamage
    }
    return damage
  }

  function applyPlayerLifeSteal(damage) {
    const lifeSteal = getPlayerAffixValue('lifeSteal')
    if (lifeSteal > 0) {
      const heal = Math.floor(damage * lifeSteal / 100)
      if (heal > 0) {
        player.state.health = Math.min(player.state.health + heal, player.maxHealth.value)
        addLog({ text: `吸血回复 ${heal} 点生命值`, color: '#66cc66' })
      }
    }
  }

  function applyPlayerElementDamage() {
    let extra = 0
    const elements = [
      { key: 'fireDamage', name: '火焰' },
      { key: 'iceDamage', name: '冰霜' },
      { key: 'thunderDamage', name: '雷电' },
    ]
    for (const el of elements) {
      const val = getPlayerAffixValue(el.key)
      if (val > 0) {
        extra += val
      }
    }
    return extra
  }

  function handleEnemyDefeat(actionName) {
    const displayName = enemy.getDisplayName()
    const exp = enemy.getExp(player.state.level)
    const isBoss = enemy.state.type === 'boss'
    const typeColor = enemy.getTypeColor()

    paragon.addKill(isBoss)
    runKills.value++
    if (isBoss) runBossKills.value++

    if (isBoss) {
      addLog({ text: `══════ ${displayName} 被击败！══════`, color: typeColor })
      addLog({ text: `获得 ${exp} 经验值！BOSS 击杀奖励！`, color: '#ffcc00' })
    } else if (enemy.state.type === 'elite') {
      addLog({ text: `━━ ${displayName} 被击败！获得 ${exp} 经验值 ━━`, color: typeColor })
    } else {
      addLog(`使用 ${actionName} 战胜了 ${displayName}，获得 ${exp} 经验值`)
    }

    player.addExp(exp, addLog)
    player.recoverHealth(addLog)
    equipment.dropEquipment(addLog, isBoss)
    enemy.nextWave(player.state.level)

    // 新怪物出现提示
    announceNewEnemy()
  }

  function announceNewEnemy() {
    const displayName = enemy.getDisplayName()
    const typeColor = enemy.getTypeColor()
    if (enemy.state.type === 'boss') {
      addLog({ text: `⚠ BOSS 来袭！${displayName} 出现了！`, color: '#ff2222' })
      if (enemy.state.affixes.length > 0) {
        const affixNames = enemy.state.affixes.map(a => `${a.name}(${a.desc})`).join('、')
        addLog({ text: `  词缀: ${affixNames}`, color: '#ff8888' })
      }
    } else if (enemy.state.type === 'elite') {
      addLog({ text: `精英怪出现！${displayName}`, color: '#ff8c00' })
      if (enemy.state.affixes.length > 0) {
        const affixNames = enemy.state.affixes.map(a => a.name).join('、')
        addLog({ text: `  词缀: ${affixNames}`, color: '#ffaa44' })
      }
    }
  }

  function performAction(actionName, damage, healthBoost = 0, cooldown = 0) {
    if (isDefeated.value) return

    // 元素附加伤害
    const elementDamage = applyPlayerElementDamage()
    if (elementDamage > 0) damage += elementDamage

    // 暴击检测
    damage = applyPlayerCrit(damage)

    // 敌人减伤（坚壳词缀在 takeDamage 内处理）
    const actualDamage = enemy.takeDamage(damage)
    const displayName = enemy.getDisplayName()

    addLog(`使用 ${actionName} 对 ${displayName} 造成 ${actualDamage} 点伤害，剩余生命: ${enemy.state.health}`)

    // 吸血
    applyPlayerLifeSteal(actualDamage)

    // 反弹伤害
    const reflectDamage = enemy.getReflectDamage(actualDamage)
    if (reflectDamage > 0) {
      player.takeDamage(reflectDamage)
      addLog({ text: `${displayName} 反弹了 ${reflectDamage} 点伤害！`, color: '#cc66cc' })
    }

    if (healthBoost > 0) {
      player.state.health = Math.min(
        Math.floor(player.state.health + healthBoost),
        player.maxHealth.value
      )
      addLog(`使用 ${actionName} 恢复了 ${healthBoost} 点生命值，当前生命: ${player.state.health}`)
    }

    if (enemy.state.health <= 0) {
      handleEnemyDefeat(actionName)
    } else {
      // 敌人精英/BOSS回合效果
      const turnMessages = enemy.applyTurnEffects((dmg) => player.takeDamage(dmg))
      for (const msg of turnMessages) addLog(msg)

      // 敌人普通攻击
      let enemyDamage = getRandomDamage(enemy.state.attack)

      // 玩家闪避
      const dodgeRate = getPlayerAffixValue('dodgeRate')
      if (dodgeRate > 0 && Math.random() * 100 < dodgeRate) {
        addLog({ text: `闪避了 ${displayName} 的攻击！`, color: '#66ccff' })
      } else {
        // 玩家减伤词缀
        const damageReduce = getPlayerAffixValue('damageReduce')
        if (damageReduce > 0) {
          enemyDamage = Math.floor(enemyDamage * (1 - damageReduce / 100))
        }

        player.takeDamage(enemyDamage)
        addLog(`${displayName} 攻击，造成 ${enemyDamage} 点伤害，剩余生命: ${player.state.health}`)

        // 敌人吸血
        const vampHeal = enemy.applyVampiric(enemyDamage)
        if (vampHeal > 0) {
          addLog({ text: `${displayName} 吸血恢复了 ${vampHeal} 点生命`, color: '#cc4444' })
        }

        // 玩家反弹词缀
        const playerReflect = getPlayerAffixValue('reflect')
        if (playerReflect > 0) {
          const reflDmg = Math.floor(enemyDamage * playerReflect / 100)
          if (reflDmg > 0) {
            enemy.state.health = Math.max(0, enemy.state.health - reflDmg)
            addLog({ text: `反弹了 ${reflDmg} 点伤害给 ${displayName}`, color: '#cc66cc' })
          }
        }
      }

      if (player.state.health <= 0) {
        endGame()
      }
    }

    if (cooldown > 0) {
      player.state.skillCooldowns[actionName] = cooldown
    }
    player.reduceSkillCooldowns()
  }

  function attack() {
    performAction('普通攻击', getRandomDamage(player.state.attack))
  }

  function useSkill(skill) {
    if (player.state.skillCooldowns[skill.name] > 0) {
      addLog(`技能 ${skill.name} 还在冷却中，剩余 ${player.state.skillCooldowns[skill.name]} 回合`)
      return
    }
    performAction(skill.name, skill.damage, skill.healthBoost || 0, skill.cooldown)
  }

  function startAutoBattle() {
    if (isDefeated.value || autoBattleInterval.value) return
    const interval = 1000 / battleSpeed.value
    autoBattleInterval.value = setInterval(() => {
      if (autoSkillEnabled.value) {
        const available = player.state.skills.filter(s => player.state.skillCooldowns[s.name] === 0)
        if (available.length > 0) {
          useSkill(available[Math.floor(Math.random() * available.length)])
        } else {
          attack()
        }
      } else {
        attack()
      }
    }, interval)
  }

  function stopAutoBattle() {
    if (autoBattleInterval.value) {
      clearInterval(autoBattleInterval.value)
      autoBattleInterval.value = null
    }
  }

  function changeBattleSpeed(speed) {
    battleSpeed.value = speed
    if (autoBattleInterval.value) {
      stopAutoBattle()
      startAutoBattle()
    }
  }

  function endGame() {
    const scoreDetail = player.calculateScore(enemy.state.wave, runKills.value, runBossKills.value)
    player.addGameToHistory(scoreDetail.total, enemy.state.wave)
    stopAutoBattle()
    isDefeated.value = true
    lastScoreDetail.value = scoreDetail

    // 保存死亡时状态快照
    deathState.value = {
      level: player.state.level,
      health: player.state.health,
      maxHealth: player.maxHealth.value,
      attack: player.state.attack,
      wave: enemy.state.wave,
      equipment: JSON.parse(JSON.stringify(player.state.equipment)),
    }

    // 巅峰经验
    const paragonExp = paragon.onGameEnd(enemy.state.wave, player.state.level)
    addLog({ text: `获得 ${paragonExp} 点巅峰经验`, color: '#daa520' })
    paragon.save()

    return scoreDetail
  }

  function resetGame() {
    stopAutoBattle()
    isDefeated.value = false
    autoSkillEnabled.value = false
    battleSpeed.value = 1
    runKills.value = 0
    runBossKills.value = 0
    deathState.value = null
    lastScoreDetail.value = null
    paragon.load()
    player.reset()
    // 应用巅峰永久属性
    player.state.bonusMaxHealth = paragon.paragon.bonusHealth
    player.state.health += paragon.paragon.bonusHealth
    player.state.attack += paragon.paragon.bonusAttack
    enemy.reset(player.state.level)
    equipment.equipInitial(addLog)
    addLog(`初始生命值: ${player.state.health}，攻击力: ${player.state.attack}`)
    if (paragon.paragon.level > 0) {
      addLog({ text: `巅峰等级: ${paragon.paragon.level}（体质+${paragon.paragon.bonusHealth} 力量+${paragon.paragon.bonusAttack} 暴击+${paragon.paragon.bonusCritRate}% 吸血+${paragon.paragon.bonusLifeSteal}% 减伤+${paragon.paragon.bonusDamageReduce}%）`, color: '#daa520' })
    }
  }

  return {
    player,
    enemy,
    equipment,
    paragon,
    isDefeated,
    deathState,
    lastScoreDetail,
    autoBattleInterval,
    autoSkillEnabled,
    battleSpeed,
    attack,
    useSkill,
    startAutoBattle,
    stopAutoBattle,
    changeBattleSpeed,
    endGame,
    resetGame,
  }
}
