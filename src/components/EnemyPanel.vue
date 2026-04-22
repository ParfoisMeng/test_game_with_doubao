<template>
  <div class="panel enemy-panel" :class="panelClass">
    <div class="panel-header clickable" :class="enemyTypeClass" @click="showDetail = !showDetail">
      {{ isGameTheme ? '怪物属性' : '目标数据' }}
      <span v-if="enemy.type !== 'normal'" class="enemy-type-badge">
        {{ enemy.type === 'boss' ? 'BOSS' : '精英' }}
      </span>
      <span class="toggle-hint">{{ showDetail ? '▲' : '▼' }}</span>
    </div>
    <div class="panel-body">
      <div class="stat-row">
        <span class="stat-label">{{ isGameTheme ? '名称' : '目标' }}</span>
        <span class="stat-value" :style="nameStyle">{{ displayName }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">{{ isGameTheme ? '生命值' : '体力' }}</span>
        <span class="stat-value">{{ enemy.health }} / {{ enemy.maxHealth }}</span>
      </div>
      <div class="bar-row">
        <div class="progress-bar hp-bar">
          <div class="progress-fill" :style="{ width: hpPercent + '%' }" :class="hpFillClass"></div>
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-label">{{ isGameTheme ? '攻击力' : '产出' }}</span>
        <span class="stat-value">{{ enemy.attack }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">{{ isGameTheme ? '波次' : '批次' }}</span>
        <span class="stat-value">{{ enemy.wave }}</span>
      </div>
      <div v-if="enemy.affixes && enemy.affixes.length > 0" class="stat-row">
        <span class="stat-label">{{ isGameTheme ? '词缀' : '特性' }}</span>
        <span class="stat-value affix-text">{{ affixText }}</span>
      </div>

      <!-- 展开的详情 -->
      <div v-if="showDetail && enemy.affixes?.length > 0" class="detail-section">
        <div class="detail-title">── 词缀详情 ──</div>
        <div v-for="af in enemy.affixes" :key="af.name" class="affix-detail-row">
          <span class="affix-tag">{{ af.name }}</span>
          <span class="affix-desc">{{ af.desc }}</span>
        </div>
      </div>
      <div v-if="showDetail && enemy.description" class="detail-section">
        <div class="detail-title">── 描述 ──</div>
        <div class="enemy-desc">{{ enemy.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  enemy: { type: Object, required: true },
  isGameTheme: { type: Boolean, default: false },
})

const showDetail = ref(false)

const displayName = computed(() => {
  const prefix = props.enemy.type === 'boss' ? '【BOSS】' : props.enemy.type === 'elite' ? '〈精英〉' : ''
  return prefix + props.enemy.name
})

const nameStyle = computed(() => {
  if (props.enemy.type === 'boss') return { color: '#ff2222', fontWeight: 'bold' }
  if (props.enemy.type === 'elite') return { color: '#ff8c00', fontWeight: 'bold' }
  return {}
})

const panelClass = computed(() => {
  if (props.enemy.type === 'boss') return 'panel-boss'
  if (props.enemy.type === 'elite') return 'panel-elite'
  return ''
})

const enemyTypeClass = computed(() => {
  if (props.enemy.type === 'boss') return 'enemy-boss'
  if (props.enemy.type === 'elite') return 'enemy-elite'
  return ''
})

const hpPercent = computed(() => Math.max(0, Math.min(100, (props.enemy.health / props.enemy.maxHealth) * 100)))

const hpFillClass = computed(() => {
  if (props.enemy.type === 'boss') return 'hp-boss'
  if (props.enemy.type === 'elite') return 'hp-elite'
  return 'hp-enemy'
})

const affixText = computed(() =>
  props.enemy.affixes?.map(a => a.name).join('、') || ''
)
</script>
