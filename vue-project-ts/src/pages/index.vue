<template>
  <div class="app">{{ time }}</div>
</template>

<script setup lang="ts">
import { dayjs } from "element-plus";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

console.log(router.getRoutes());

const time = ref(dayjs().format("YYYY-MM-DD HH:mm:ss"));

setInterval(() => {
  time.value = dayjs().format("YYYY-MM-DD HH:mm:ss");
}, 1000);
</script>

<style scoped>
.app {
  font-family: "LCD", sans-serif;
  font-size: 100px;
  color: #00ff00;
  position: fixed;
  inset: 0;
}
</style>
