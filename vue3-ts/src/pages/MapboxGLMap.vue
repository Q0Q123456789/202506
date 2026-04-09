<template>
  <div id="map"></div>
</template>

<script setup lang="ts">
import { replaceTemplate } from '@/utils/util'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = ''

// 天地图URL模板
const tiandituUrlTemplate = import.meta.env.VITE_MAP_DOMAIN_NAME
const mapParam = import.meta.env.VITE_MAP_PARAM

const map = ref(null)
const initMap = () => {
  map.value = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',
    projection: 'globe',
    zoom: 1, // starting zoom
    minZoom: 2,
    maxZoom: 18,
    // projection: 'mercator',
    pitch: 0, // 锁定倾斜角为 0
    bearing: 0, // 锁定旋转角为 0
    interactive: true,
    dragRotate: false, // 禁用拖拽旋转
    touchZoomRotate: false, // 禁用手势旋转
    center: [121.32, 31.2],
  })
}

/**
 * 组件挂载时初始化地图
 */
onMounted(() => {
  initMap()

  /**
   * 地图加载完成后添加自定义图层
   */
  map.value.on('load', () => {
    map.value.addLayer({
      id: 'custom-tiles-layer',
      type: 'raster',
      source: {
        type: 'raster',
        tiles: [`${replaceTemplate(tiandituUrlTemplate, ['img_w', 'img'])}&${mapParam}`],
        tileSize: 256,
        minzoom: 1,
        maxzoom: 18,
      },
      paint: {},
    })
  })
})

/**
 * 组件卸载时移除地图实例
 */
onUnmounted(() => {
  map.value.remove()
  map.value = null
})
</script>

<style scoped>
#map {
  width: 100vw;
  height: 100vh;
}
</style>
