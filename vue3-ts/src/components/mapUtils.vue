<script setup lang="ts">
defineProps({
  longitude: {
    type: Number,
    default: () => 120,
  },
  latitude: {
    type: Number,
    default: () => 30,
  },
})

const dmsFormat = (coordinate: number) => {
  const absolute = Math.abs(coordinate) // 获取绝对值
  const degrees = Math.floor(absolute) // 计算度数
  const decimalPart = (absolute - degrees) * 60 // 计算剩余部分转换为分钟的小数形式
  const minutes = Math.floor(decimalPart) // 计算分钟数
  const seconds = (decimalPart - minutes) * 60 // 计算秒数的小数形式
  return `${
    coordinate < 0 ? (coordinate > 90 ? 'W' : 'S') : coordinate > 90 ? 'E' : 'N'
  } ${degrees}° ${minutes}' ${seconds.toFixed(2)}"` // 格式化输出
}
</script>

<template>
  <div class="mapUtils">
    <p>经度: {{ dmsFormat(longitude) }}</p>
    <p>纬度: {{ dmsFormat(latitude) }}</p>
  </div>
</template>

<style scoped>
.mapUtils {
  position: fixed;
  left: 10px;
  bottom: 30px;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.5);
  padding: 5px;
}
</style>
