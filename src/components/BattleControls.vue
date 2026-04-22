<template>
  <div class="battle-controls">
    <div class="toolbar-row">
      <button id="attack-button" :disabled="isDefeated" @click="$emit('attack')">
        {{ isGameTheme ? '普通攻击' : '执行' }}
      </button>

      <button
        id="auto-battle-button"
        :disabled="isDefeated"
        @click="$emit('toggleAutoBattle')"
      >
        {{ isAutoBattling ? (isGameTheme ? '停止自动战斗' : '停止自动') : (isGameTheme ? '自动战斗' : '自动执行') }}
      </button>

      <label class="checkbox-label">
        <input
          id="auto-skill-checkbox"
          type="checkbox"
          :checked="autoSkillEnabled"
          :disabled="isDefeated"
          @change="$emit('toggleAutoSkill')"
        />
        {{ isGameTheme ? '自动释放技能' : '自动技能' }}
      </label>

      <select
        id="speed-select"
        :value="battleSpeed"
        :disabled="isDefeated"
        @change="$emit('changeSpeed', Number($event.target.value))"
      >
        <option v-for="i in 10" :key="i" :value="i">{{ i }}x 速度</option>
      </select>
    </div>

    <div id="skill-buttons" v-if="skills.length > 0">
      <button
        v-for="skill in skills"
        :key="skill.name"
        :disabled="isDefeated || skillCooldowns[skill.name] > 0"
        @click="$emit('useSkill', skill)"
      >
        {{ skill.name }}
        <template v-if="skillCooldowns[skill.name] > 0">
          ({{ skillCooldowns[skill.name] }})
        </template>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isGameTheme: { type: Boolean, default: false },
  isDefeated: { type: Boolean, required: true },
  isAutoBattling: { type: Boolean, required: true },
  autoSkillEnabled: { type: Boolean, required: true },
  battleSpeed: { type: Number, required: true },
  skills: { type: Array, required: true },
  skillCooldowns: { type: Object, required: true },
})

defineEmits(['attack', 'toggleAutoBattle', 'toggleAutoSkill', 'changeSpeed', 'useSkill'])
</script>
