<template>
  <div id="map"></div>
  <toggleDraw :map="map" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { replaceTemplate } from '@/utils/util'
import mapboxgl from 'mapbox-gl'
import toggleDraw from '@/components/toggleDraw.vue'

mapboxgl.accessToken = ''

// 天地图URL模板
const tiandituUrlTemplate = import.meta.env.VITE_MAP_DOMAIN_NAME
const mapParam = import.meta.env.VITE_MAP_PARAM

// 响应式状态
const map = ref<mapboxgl.Map | null>(null)

const initMap = () => {
  try {
    map.value = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/standard',
      projection: 'globe',
      zoom: 8,
      minZoom: 2,
      maxZoom: 18,
      pitch: 0,
      bearing: 0,
      interactive: true,
      dragRotate: false,
      touchZoomRotate: false,
      center: [121.32, 31.2],
    })
  } catch (error) {
    console.error('地图初始化失败:', error)
  }
}

/**
 * 组件挂载时初始化地图
 */
onMounted(async () => {
  await nextTick()
  initMap()
})
</script>

<style scoped>
#map {
  width: 100vw;
  height: 100vh;
  position: relative;
}
</style>
