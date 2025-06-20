<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const currentTime = ref(new Date());
let timer = null;

const updateTime = () => {
  currentTime.value = new Date();
};

const formatTime = (date) => {
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

onMounted(() => {
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<template>
  <div class="time-container">
    <div class="time-display">{{ formatTime(currentTime) }}</div>
  </div>
</template>

<style scoped>
.time-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  /* background-color: var(--color-background); */
}

.time-display {
  font-size: 48px;
  font-weight: bold;
  color: var(--color-text);
  font-family: monospace;
  padding: 20px;
  border-radius: 10px;
  background-color: var(--color-background-soft);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
