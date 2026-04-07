<template>
  <div id="map"></div>
  <mapUtils v-bind="position" />
</template>

<script setup lang="ts">
import 'ol/ol.css' // 引入OpenLayers基础样式
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { ScaleLine, defaults } from 'ol/control'
import mapUtils from '@/components/mapUtils.vue'

import { ref, onMounted } from 'vue'
import { replaceTemplate } from '@/utils/util'
import { fromLonLat, toLonLat } from 'ol/proj'

const mapParam = import.meta.env.VITE_MAP_PARAM

//实例化比例尺控件（ScaleLine）
const scaleLineControl = new ScaleLine({
  //设置比例尺单位，degrees、imperial、us、nautical、metric（度量单位）
  units: 'metric',
})

interface positions {
  longitude: number
  latitude: number
}

const position = ref<positions>({
  longitude: 120,
  latitude: 30,
})

// 天地图URL模板
const tiandituUrlTemplate = import.meta.env.VITE_MAP_DOMAIN_NAME

onMounted(() => {
  const map = new Map({
    // target指向DOM元素
    target: 'map',
    // 配置图层
    layers: [
      new TileLayer({
        // source: new OSM(), // 使用OpenStreetMap数据源
        source: new XYZ({
          url: `${replaceTemplate(tiandituUrlTemplate, ['img_w', 'img'])}&${mapParam}`,
          attributions: '© 天地图',
        }),
      }),
      new TileLayer({
        // source: new OSM(), // 使用OpenStreetMap数据源
        source: new XYZ({
          url: `${replaceTemplate(tiandituUrlTemplate, ['cia_w', 'cia'])}&${mapParam}`,
          attributions: '© 天地图',
        }),
      }),
      // new TileLayer({
      //   // source: new OSM(), // 使用OpenStreetMap数据源
      //   source: new XYZ({
      //     url: `http://map.429004.online/img_c/{z}/{x}/{y}/tile.png`,
      //     attributions: '© 天地图',
      //   }),
      // }),
      new TileLayer({
        // source: new OSM(), // 使用OpenStreetMap数据源
        source: new XYZ({
          url: `${replaceTemplate(tiandituUrlTemplate, ['ibo_w', 'ibo'])}&${mapParam}`,
          attributions: '© 天地图',
        }),
      }),
    ],
    // 配置视图
    view: new View({
      center: fromLonLat([121.32, 31.2]), // 初始中心点
      zoom: 9, // 初始缩放级别
      minZoom: 1,
      maxZoom: 18,
      projection: 'EPSG:3857',
    }),
    //加载比例尺控件
    controls: defaults().extend([scaleLineControl]),
  })

  map.on('singleclick', (e) => {
    console.log(e.coordinate)
    console.log(toLonLat(e.coordinate))
    console.log('当前缩放级别:', map.getView().getZoom())
  })

  // 鼠标移动事件
  map.on('pointermove', (event) => {
    // console.log('鼠标移动事件:', event)
    const coordinate = event.coordinate
    const pixel = event.pixel

    position.value = {
      latitude: toLonLat(coordinate)[1],
      longitude: toLonLat(coordinate)[0],
    }

    // 示例：可根据 coordinate 与 pixel 自行实现更新逻辑
    // updateMousePosition(coordinate, pixel)
    const features = map.getFeaturesAtPixel(pixel)
    if (features.length > 0) {
      // 🎯 鼠标悬停在要素上
      map.getTargetElement().style.cursor = 'pointer'

      // const feature = features[0]
      // console.log('🔍 悬停要素:', feature.getId() || '未命名要素')
    } else {
      // 🔄 重置鼠标样式
      map.getTargetElement().style.cursor = ''
    }
  })

  // 滚动事件处理
  // map.on('change', (e) => {
  //   console.log('当前缩放级别:', map.getView().getZoom())
  // })
})
</script>
<style scoped>
#map {
  width: 100vw;
  height: 100vh;
}
</style>
