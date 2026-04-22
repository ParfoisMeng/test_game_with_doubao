<template>
  <div id="paragon-panel" v-if="paragon.level > 0 || availablePoints > 0">
    <span class="paragon-header">
      巅峰 Lv.{{ paragon.level }}
      <span class="paragon-exp">（{{ paragon.totalExp }}/{{ expToNext }}）</span>
    </span>
    <span class="paragon-stats">
      击杀:{{ paragon.totalKills }} BOSS:{{ paragon.totalBossKills }} 最高:{{ paragon.highestWave }}波
    </span>
    <div v-if="availablePoints > 0" class="paragon-allocate">
      <span class="paragon-points">{{ availablePoints }}点</span>
      <button
        v-for="u in upgrades"
        :key="u.key"
        class="paragon-btn"
        :title="u.desc"
        @click="$emit('allocate', u.key)"
      >{{ u.name }}+</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  paragon: { type: Object, required: true },
  expToNext: { type: Number, required: true },
  availablePoints: { type: Number, required: true },
  upgrades: { type: Array, required: true },
})

defineEmits(['allocate'])
</script>
