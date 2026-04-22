<template>
  <div id="game-container">
    <!-- 游戏主页面 -->
    <div v-if="!showScoreboard" id="game-page">
      <h1>{{ title }}</h1>

      <div class="panels-row">
        <PlayerPanel
          :player="battle.player.state"
          :max-health="battle.player.maxHealth.value"
          :exp-to-next-level="battle.player.expToNextLevel.value"
          :is-game-theme="isGameTheme"
        />

        <EnemyPanel :enemy="battle.enemy.state" :is-game-theme="isGameTheme" />
      </div>

      <ParagonPanel
        :paragon="battle.paragon.paragon"
        :exp-to-next="battle.paragon.paragonExpToNext.value"
        :available-points="battle.paragon.availablePoints.value"
        :upgrades="battle.paragon.PARAGON_UPGRADES"
        @allocate="handleAllocateParagon"
      />

      <BattleControls
        :is-game-theme="isGameTheme"
        :is-defeated="battle.isDefeated.value"
        :is-auto-battling="!!battle.autoBattleInterval.value"
        :auto-skill-enabled="battle.autoSkillEnabled.value"
        :battle-speed="battle.battleSpeed.value"
        :skills="battle.player.state.skills"
        :skill-cooldowns="battle.player.state.skillCooldowns"
        @attack="battle.attack"
        @toggle-auto-battle="toggleAutoBattle"
        @toggle-auto-skill="battle.autoSkillEnabled.value = !battle.autoSkillEnabled.value"
        @change-speed="battle.changeBattleSpeed"
        @use-skill="battle.useSkill"
      />

      <BattleLog :logs="logs" />

      <button
        v-if="battle.isDefeated.value"
        id="reset-button"
        @click="restartGame"
      >
        重新挑战
      </button>

      <button id="style-toggle-button" @click="toggleTheme">切换模式</button>
    </div>

    <!-- 结算榜单页面 -->
    <ScoreBoard
      v-else
      :score="finalScore"
      :score-detail="scoreDetail"
      :history="battle.player.state.gameHistory"
      :paragon="battle.paragon.paragon"
      :death-state="battle.deathState.value"
      :battle-logs="logs"
      @restart="restartGame"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useBattle } from './composables/useBattle'
import PlayerPanel from './components/PlayerPanel.vue'
import EnemyPanel from './components/EnemyPanel.vue'
import BattleControls from './components/BattleControls.vue'
import BattleLog from './components/BattleLog.vue'
import ScoreBoard from './components/ScoreBoard.vue'
import ParagonPanel from './components/ParagonPanel.vue'
import './assets/work.css'
import './assets/game.css'

const logs = ref([])
const showScoreboard = ref(false)
const finalScore = ref(0)
const scoreDetail = ref(null)
const isGameTheme = ref(false)

const title = computed(() => isGameTheme.value ? '🎮包暗黑豆奇幻冒险🎮' : '工作数据看板 - Q4绩效追踪')

function addLog(msg) {
  // 支持字符串或 { text, color } 对象
  if (typeof msg === 'string') {
    logs.value.unshift({ text: msg })
  } else {
    logs.value.unshift(msg)
  }
}

const battle = useBattle(addLog)

// 监听玩家死亡 → 显示结算
watch(
  () => battle.isDefeated.value,
  (defeated) => {
    if (defeated) {
      finalScore.value = battle.lastScoreDetail.value?.total || 0
      scoreDetail.value = battle.lastScoreDetail.value
      showScoreboard.value = true
    }
  }
)

function toggleAutoBattle() {
  if (battle.autoBattleInterval.value) {
    battle.stopAutoBattle()
  } else {
    battle.startAutoBattle()
  }
}

function restartGame() {
  logs.value = []
  showScoreboard.value = false
  finalScore.value = 0
  scoreDetail.value = null
  battle.resetGame()
}

function handleAllocateParagon(key) {
  if (battle.paragon.availablePoints.value > 0) {
    battle.paragon.allocatePoint(key)
    battle.paragon.save()
    // 实时应用到当前局内
    const upgrade = battle.paragon.PARAGON_UPGRADES.find(u => u.key === key)
    if (key === 'bonusHealth') {
      battle.player.state.bonusMaxHealth += upgrade.perPoint
      battle.player.state.health += upgrade.perPoint
    } else if (key === 'bonusAttack') {
      battle.player.state.attack += upgrade.perPoint
    }
    addLog({ text: `巅峰属性 [${upgrade.name}] 提升！`, color: '#daa520' })
  }
}

function toggleTheme() {
  isGameTheme.value = !isGameTheme.value
  document.title = isGameTheme.value ? '🎮包暗黑豆奇幻冒险🎮' : '工作数据看板'
  document.body.classList.toggle('game-theme', isGameTheme.value)
}

// 初始化游戏
battle.resetGame()

onBeforeUnmount(() => {
  battle.stopAutoBattle()
})
</script>
