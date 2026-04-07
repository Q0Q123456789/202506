<template>
  <div class="map-container">
    <h1>地图展示</h1>
    <p>请选择要展示的地图：</p>
    <select v-model="selectedMap" class="map-select">
      <option v-for="map in mapData" :key="map.id" :value="map.url">
        {{ map.name }}
      </option>
    </select>
    <iframe v-if="selectedMap" :src="selectedMap" frameborder="0" class="map-iframe"></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface MapItem {
  id: string
  name: string
  url: string
}
const mapData = ref<MapItem[]>([
  {
    id: '001',
    name: '百度地图',
    url: 'https://chat.baidu.com/',
  },
  {
    id: '002',
    name: '淘宝地图',
    url: 'https://www.taobao.com/',
  },
  {
    id: '003',
    name: '新浪地图',
    url: 'https://www.sina.com.cn/',
  },
  {
    id: '004',
    name: '搜狗地图',
    url: 'https://www.sogou.com/',
  },
])

const selectedMap = ref<string>(mapData.value[0].url)

onMounted(() => {
  // 组件挂载时的初始化逻辑
})
</script>

<style scoped>
.map-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.map-select {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 300px;
  transition: all 0.3s ease;
}

.map-select:hover {
  border-color: #409eff;
}

.map-select:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.map-iframe {
  width: 100%;
  max-width: 500px;
  height: 500px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
}

@media (max-width: 768px) {
  .map-iframe {
    height: 300px;
  }

  .map-select {
    max-width: 100%;
  }
}
</style>
