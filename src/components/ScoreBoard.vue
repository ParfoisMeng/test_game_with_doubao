<template>
  <div id="scoreboard-page">
    <h1>游戏结束</h1>

    <!-- 评分详情 -->
    <div class="score-breakdown">
      <div class="score-total">总评分: {{ score }}</div>
      <div v-if="scoreDetail" class="score-items">
        <span>波次: {{ scoreDetail.wave }}×10={{ scoreDetail.waveScore }}</span>
        <span>等级: {{ scoreDetail.level }}×20={{ scoreDetail.levelScore }}</span>
        <span>击杀: {{ scoreDetail.kills }}×2={{ scoreDetail.killScore }}</span>
        <span>BOSS: {{ scoreDetail.bossKills }}×50={{ scoreDetail.bossScore }}</span>
        <span>装备: {{ scoreDetail.equipScore }}</span>
      </div>
    </div>

    <!-- 人物终态 -->
    <div v-if="deathState" class="death-state">
      <div class="death-header" @click="showDeathDetail = !showDeathDetail">
        ── 角色状态 ── <span class="toggle-hint">{{ showDeathDetail ? '▲' : '▼' }}</span>
      </div>
      <div class="death-summary">
        Lv.{{ deathState.level }} | 波次 {{ deathState.wave }} | HP {{ deathState.health }}/{{ deathState.maxHealth }} | ATK {{ deathState.attack }}
      </div>
      <div v-if="showDeathDetail" class="death-detail">
        <div class="detail-title">── 装备 ──</div>
        <div v-for="(equip, slot) in deathState.equipment" :key="slot" class="equip-detail-row">
          <span class="slot-icon">{{ slotIcons[slot] }}</span>
          <template v-if="equip">
            <span class="equip-name" :style="{ color: equip.rarity?.color || '' }">
              {{ equip.rarity?.name !== '普通' ? `[${equip.rarity.name}]` : '' }}{{ equip.name }}
            </span>
            <span class="equip-stat">HP+{{ equip.health }} ATK+{{ equip.attack }}</span>
            <div v-if="equip.affixes?.length > 0" class="equip-affixes">
              <span v-for="af in equip.affixes" :key="af.key" class="affix-tag">{{ af.name }}+{{ af.value }}{{ af.unit }}</span>
            </div>
          </template>
          <span v-else class="equip-empty">空</span>
        </div>
      </div>
    </div>

    <!-- 巅峰 -->
    <div v-if="paragon && paragon.level > 0" class="paragon-summary">
      巅峰 Lv.{{ paragon.level }} | 总击杀: {{ paragon.totalKills }} | BOSS: {{ paragon.totalBossKills }} | 最高波次: {{ paragon.highestWave }}
    </div>

    <!-- 战斗记录 -->
    <div v-if="battleLogs.length > 0" class="death-logs">
      <div class="death-header" @click="showLogs = !showLogs">
        ── 战斗记录 ({{ battleLogs.length }}条) ── <span class="toggle-hint">{{ showLogs ? '▲' : '▼' }}</span>
      </div>
      <ul v-if="showLogs" class="death-log-list">
        <li
          v-for="(msg, idx) in battleLogs"
          :key="idx"
          :style="msg.color ? { color: msg.color } : {}"
        >{{ msg.text || msg }}</li>
      </ul>
    </div>

    <h2>历史游戏记录</h2>
    <ul id="history-list">
      <li v-for="(record, idx) in history" :key="idx">
        {{ idx + 1 }}. 评分: {{ record.score }}，波次: {{ record.wave || '-' }}，时间: {{ record.timestamp }}
      </li>
    </ul>
    <button id="restart-button" @click="$emit('restart')">重新开始</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  score: { type: Number, required: true },
  scoreDetail: { type: Object, default: null },
  history: { type: Array, required: true },
  paragon: { type: Object, default: null },
  deathState: { type: Object, default: null },
  battleLogs: { type: Array, default: () => [] },
})

defineEmits(['restart'])

const showDeathDetail = ref(false)
const showLogs = ref(false)
const slotIcons = ['🪖', '🛡', '🧤', '👖', '👢', '⚔', '💍', '📿']
</script>
