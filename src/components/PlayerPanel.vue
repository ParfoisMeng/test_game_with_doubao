<template>
  <div class="panel player-panel">
    <div class="panel-header clickable" @click="showDetail = !showDetail">
      {{ isGameTheme ? '勇者属性' : '人员数据' }}
      <span class="toggle-hint">{{ showDetail ? '▲' : '▼' }}</span>
    </div>
    <div class="panel-body">
      <div class="stat-row">
        <span class="stat-label">{{ isGameTheme ? '等级' : '级别' }}</span>
        <span class="stat-value">{{ player.level }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">{{ isGameTheme ? '经验值' : '绩效值' }}</span>
        <span class="stat-value">{{ player.exp }} / {{ expToNextLevel }}</span>
      </div>
      <div class="bar-row">
        <div class="progress-bar exp-bar">
          <div class="progress-fill" :style="{ width: expPercent + '%' }"></div>
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-label">{{ isGameTheme ? '生命值' : '体力值' }}</span>
        <span class="stat-value">{{ player.health }} / {{ maxHealth }}</span>
      </div>
      <div class="bar-row">
        <div class="progress-bar hp-bar">
          <div class="progress-fill" :style="{ width: hpPercent + '%' }" :class="hpClass"></div>
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-label">{{ isGameTheme ? '攻击力' : '产出值' }}</span>
        <span class="stat-value">{{ player.attack }}</span>
      </div>

      <!-- 展开的详情区域 -->
      <div v-if="showDetail" class="detail-section">
        <div class="detail-title">── 装备详情 ──</div>
        <div
          v-for="(equip, slot) in player.equipment"
          :key="slot"
          class="equip-detail-row"
        >
          <span class="slot-icon">{{ slotIcons[slot] }}</span>
          <template v-if="equip">
            <span class="equip-name" :style="{ color: equip.rarity?.color || '' }">
              {{ equip.rarity?.name !== '普通' ? `[${equip.rarity.name}]` : '' }}{{ equip.name }}
            </span>
            <span class="equip-stat">HP+{{ equip.health }} ATK+{{ equip.attack }}</span>
            <div v-if="equip.affixes?.length > 0" class="equip-affixes">
              <span v-for="af in equip.affixes" :key="af.key" class="affix-tag">{{ af.name }}+{{ af.value }}{{ af.unit }}</span>
            </div>
            <div v-if="equip.skill" class="equip-skill-tag">技能: {{ equip.skill.name }}</div>
          </template>
          <span v-else class="equip-empty">{{ slotNames[slot] }}(空)</span>
        </div>
        <div v-if="totalAffixes.length > 0" class="detail-title">── 词缀汇总 ──</div>
        <div v-if="totalAffixes.length > 0" class="affix-summary">
          <span v-for="af in totalAffixes" :key="af.key" class="affix-tag">{{ af.name }}+{{ af.total }}{{ af.unit }}</span>
        </div>
        <div v-if="player.skills.length > 0" class="detail-title">── 技能 ──</div>
        <div v-if="player.skills.length > 0" class="skill-list">
          <span v-for="s in player.skills" :key="s.name" class="skill-tag">{{ s.name }}</span>
        </div>
      </div>

      <!-- 收起时只显示简洁装备列表 -->
      <div v-else class="equip-section">
        <div class="stat-label equip-title">{{ isGameTheme ? '装备' : '工具清单' }}</div>
        <div class="equip-grid">
          <div
            v-for="(equip, slot) in player.equipment"
            :key="slot"
            class="equip-slot"
            :title="equip ? equipTooltip(equip) : slotNames[slot]"
          >
            <span class="slot-icon">{{ slotIcons[slot] }}</span>
            <span
              v-if="equip"
              class="equip-name"
              :style="{ color: equip.rarity?.color || '' }"
            >{{ equip.rarity?.name !== '普通' ? `[${equip.rarity.name}]` : '' }}{{ equip.name }}</span>
            <span v-else class="equip-name equip-empty">-</span>
          </div>
        </div>
      </div>
      <div v-if="!showDetail && player.skills.length > 0" class="stat-row">
        <span class="stat-label">{{ isGameTheme ? '技能' : '技能标签' }}</span>
        <span class="stat-value">{{ skillsText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  player: { type: Object, required: true },
  maxHealth: { type: Number, required: true },
  expToNextLevel: { type: Number, required: true },
  isGameTheme: { type: Boolean, default: false },
})

const showDetail = ref(false)

const slotNames = ['头盔', '胸甲', '手套', '护腿', '鞋子', '武器', '戒指', '项链']
const slotIcons = ['🪖', '🛡', '🧤', '👖', '👢', '⚔', '💍', '📿']

const hpPercent = computed(() => Math.max(0, Math.min(100, (props.player.health / props.maxHealth) * 100)))
const expPercent = computed(() => Math.max(0, Math.min(100, (props.player.exp / props.expToNextLevel) * 100)))

const hpClass = computed(() => {
  if (hpPercent.value <= 25) return 'hp-critical'
  if (hpPercent.value <= 50) return 'hp-low'
  return ''
})

// 汇总全部装备词缀
const totalAffixes = computed(() => {
  const map = {}
  for (const equip of Object.values(props.player.equipment)) {
    if (equip?.affixes) {
      for (const af of equip.affixes) {
        if (!map[af.key]) map[af.key] = { key: af.key, name: af.name, total: 0, unit: af.unit }
        map[af.key].total += af.value
      }
    }
  }
  return Object.values(map)
})

function equipTooltip(equip) {
  let tip = `${equip.name} (${equip.rarity?.name || '普通'})\n生命: ${equip.health} / 攻击: ${equip.attack}`
  if (equip.affixes?.length > 0) {
    tip += '\n词缀: ' + equip.affixes.map(a => `${a.name}+${a.value}${a.unit}`).join(', ')
  }
  if (equip.skill) {
    tip += `\n技能: ${equip.skill.name}`
  }
  return tip
}

const skillsText = computed(() =>
  props.player.skills.map(s => s.name).join(', ') || '-'
)
</script>
