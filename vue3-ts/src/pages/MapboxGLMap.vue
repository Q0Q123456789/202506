<template>
  <div id="map"></div>
  <div class="draw-controls">
    <button id="startBtn" class="draw-btn">✏️ 自由划线</button>
    <button id="endBtn" class="clear-btn">🗑️ 清除所有</button>
    <button id="saveBtn" class="save-btn">💾 保存轨迹</button>
  </div>
  <div class="info" id="info">状态: 待机中 | 点击"自由划线"开始绘制</div>
</template>

<script setup lang="ts">
import { replaceTemplate } from '@/utils/util'
import mapboxgl from 'mapbox-gl'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

mapboxgl.accessToken = ''

// 天地图URL模板
const tiandituUrlTemplate = import.meta.env.VITE_MAP_DOMAIN_NAME
const mapParam = import.meta.env.VITE_MAP_PARAM

const map = ref<mapboxgl.Map | null>(null)
let isDrawing = false
const lineCoordinates = ref<[number, number][]>([])
let throttleTimer: ReturnType<typeof setTimeout> | null = null
const THROTTLE_DELAY = 16
const initMap = () => {
  map.value = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',
    projection: 'globe',
    zoom: 8, // starting zoom
    minZoom: 2,
    maxZoom: 18,
    // projection: 'mercator',
    pitch: 60, // 锁定倾斜角为 0
    bearing: 0, // 锁定旋转角为 0
    dragPan: false, //拽平移
    interactive: true,
    dragRotate: false, // 禁用拖拽旋转
    touchZoomRotate: false, // 禁用手势旋转
    center: [121.32, 31.2],
  })

  map.value.on('load', () => {
    const mapInstance = map.value!
    // 添加GeoJSON数据源
    mapInstance.addSource('freehand-line', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    })

    // 添加线图层
    mapInstance.addLayer({
      id: 'freehand-line-layer',
      type: 'line',
      source: 'freehand-line',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#000000',
        'line-width': 4,
        'line-opacity': 1,
      },
    })

    // 监听鼠标移动（节流）- 必须在地图加载后添加
    mapInstance.on('mousemove', (e: mapboxgl.MapMouseEvent) => {
      if (!isDrawing) return
      if (throttleTimer) clearTimeout(throttleTimer)
      throttleTimer = setTimeout(() => {
        const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat]
        lineCoordinates.value.push(lngLat)
        // 更新GeoJSON数据
        const source = mapInstance.getSource('freehand-line') as mapboxgl.GeoJSONSource
        if (source) {
          source.setData({
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: lineCoordinates.value,
                },
                properties: {},
              },
            ],
          })
        }

        console.log('source', source)
      }, 0)
    })

    // 鼠标离开地图时自动结束
    mapInstance.on('mouseleave', () => {
      if (isDrawing) {
        document.getElementById('endBtn')?.click()
      }
    })
  })

  // 开始手绘
  document.getElementById('startBtn')?.addEventListener('click', () => {
    if (isDrawing || !map.value) return
    isDrawing = true
    lineCoordinates.value = []
    const source = map.value.getSource('freehand-line') as mapboxgl.GeoJSONSource
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: [],
      })
    }
    map.value.dragPan.disable()
    map.value.getCanvas().style.cursor = 'crosshair'
    const startBtn = document.getElementById('startBtn') as HTMLButtonElement
    const endBtn = document.getElementById('endBtn') as HTMLButtonElement
    startBtn.disabled = true
    endBtn.disabled = false
  })

  // 结束手绘
  document.getElementById('endBtn')?.addEventListener('click', () => {
    if (!isDrawing || !map.value) return
    isDrawing = false
    map.value.dragPan.enable()
    map.value.getCanvas().style.cursor = ''
    const startBtn = document.getElementById('startBtn') as HTMLButtonElement
    const endBtn = document.getElementById('endBtn') as HTMLButtonElement
    startBtn.disabled = false
    endBtn.disabled = true
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
  map.value?.on('load', () => {
    map.value?.addLayer({
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
  if (!map.value) return
  map.value.remove()
  map.value = null
})
</script>

<style scoped>
#map {
  width: 100vw;
  height: 100vh;

  position: relative;
}

.draw-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  gap: 10px;
}
button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.draw-btn {
  background: #007cbf;
  color: white;
}
.draw-btn.active {
  background: #ff6b00;
  box-shadow: 0 0 0 2px rgba(255, 107, 0, 0.3);
}
.clear-btn {
  background: #dc3545;
  color: white;
}
.save-btn {
  background: #28a745;
  color: white;
}
button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
.info {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1000;
  pointer-events: none;
}
</style>
