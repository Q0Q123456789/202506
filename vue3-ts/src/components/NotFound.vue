<template>
  <div class="not-found-container">
    <h1>404</h1>
    <p>页面不存在</p>
    <button @click="goHome" class="btn">返回首页</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 6rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: bold;
}

p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #666;
}

.btn {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #45a049;
}
</style>