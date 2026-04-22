<template>
  <div id="battle-log">
    <p class="log-title">操作日志</p>
    <ul id="log-list">
      <li
        v-for="(msg, idx) in logs"
        :key="idx"
        :style="msg.color ? { color: msg.color } : {}"
      >{{ msg.text || msg }}</li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  logs: { type: Array, required: true },
})
</script>
