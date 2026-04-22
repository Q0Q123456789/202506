<template>
  <div class="controls">
    <button @click="toggleDraw">{{ isDrawing ? '停止绘制' : '开始手绘' }}</button>
    <button v-if="isDrawing" @click="undoLast">撤销</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { throttle } from '@/utils/util'

const props = defineProps({
  map: {
    type: Object,
    default: () => null,
  },
})

const isDrawing = ref(false)
const points = ref<number[][]>([])
const history = ref<number[][][]>([]) // 历史记录用于撤销

// 切换绘制状态
const toggleDraw = () => {
  if (isDrawing.value) {
    stopDraw()
  } else {
    startDraw()
  }
}

// 开始绘制
const startDraw = () => {
  isDrawing.value = true
  points.value = []
  // props.map?.getCanvas().style.cursor = 'crosshair'
  props.map?.dragPan.disable()
}

// 停止绘制
const stopDraw = () => {
  isDrawing.value = false
  // 如果有未保存的线段（用户在绘制过程中点击停止），保存它
  if (points.value.length > 1) {
    history.value.push([...points.value])
  }
  points.value = []
  // props.map?.getCanvas().style.cursor = ''
  props.map?.dragPan.enable()
  updateLine()
}

// 撤销最后一次绘制
const undoLast = () => {
  if (history.value.length > 0) {
    history.value.pop()
    updateLine()
  }
}

// 鼠标事件处理
const handleMouseDown = (e: mapboxgl.MapMouseEvent) => {
  if (!isDrawing.value) return
  points.value = [[e.lngLat.lng, e.lngLat.lat]]
  updateLine()
}

const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
  if (!isDrawing.value || points.value.length === 0) return
  points.value.push([e.lngLat.lng, e.lngLat.lat])
  updateLine()
}

const throttledMouseMove = throttle(handleMouseMove, 16) // ~60fps

const handleMouseUp = () => {
  if (!isDrawing.value) return
  // 鼠标松开时保存当前线段到历史记录
  if (points.value.length > 1) {
    history.value.push([...points.value])
  }
  points.value = []
  updateLine()
}

// 更新地图线条
const updateLine = () => {
  if (!props.map) return
  const source = props.map.getSource('trace-line') as mapboxgl.GeoJSONSource
  if (!source) return

  const features: any[] = []

  // 添加历史线条
  history.value.forEach((line) => {
    if (line.length > 1) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: line,
        },
      })
    }
  })

  // 添加当前正在绘制的线条
  if (points.value.length > 1) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: points.value,
      },
    })
  }

  source.setData({
    type: 'FeatureCollection',
    features: features,
  })
}

watch(
  () => props.map,
  (val) => {
    if (val) {
      val.on('load', () => {
        // 添加数据源
        val.addSource('trace-line', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        })

        // 添加线条图层
        val.addLayer({
          id: 'trace-layer',
          type: 'line',
          source: 'trace-line',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#ff0000',
            'line-width': 5,
            'line-opacity': 0.9,
          },
        })
      })

      // 添加事件监听器
      val.on('mousedown', handleMouseDown)
      val.on('mousemove', throttledMouseMove)
      val.on('mouseup', handleMouseUp)
    }
  },
  {
    // deep: true,
    // immediate: true,
  },
)

/**
 * 组件卸载时移除地图实例和事件监听器
 */
onUnmounted(() => {
  if (props.map) {
    props.map.off('mousedown', handleMouseDown)
    props.map.off('mousemove', throttledMouseMove)
    props.map.off('mouseup', handleMouseUp)
    props.map.remove()
  }
})
</script>

<style scoped>
.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background: white;
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  gap: 8px;
}
button {
  padding: 6px 12px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
}
button:hover {
  background: #f0f0f0;
}
</style>
