<template>
  <div id="map">
    <!-- <router-view></router-view> -->
  </div>
</template>
<script setup lang="ts">
import 'ol/ol.css' // 引入OpenLayers基础样式
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { ScaleLine, defaults } from 'ol/control'
// import OSM from 'ol/source/OSM'

import { onMounted } from 'vue'
import { fromLonLat, toLonLat } from 'ol/proj'

const token = import.meta.env.VITE_MAP_KEY

//实例化比例尺控件（ScaleLine）
const scaleLineControl = new ScaleLine({
  //设置比例尺单位，degrees、imperial、us、nautical、metric（度量单位）
  units: 'metric',
})

onMounted(() => {
  const map = new Map({
    // target指向DOM元素
    target: 'map',
    // 配置图层
    layers: [
      new TileLayer({
        // source: new OSM(), // 使用OpenStreetMap数据源
        source: new XYZ({
          url: `http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`,
          attributions: '© 天地图',
        }),
      }),
      new TileLayer({
        // source: new OSM(), // 使用OpenStreetMap数据源
        source: new XYZ({
          url: `http://t0.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`,
          attributions: '© 天地图',
        }),
      }),
      // new TileLayer({
      //   // source: new OSM(), // 使用OpenStreetMap数据源
      //   source: new XYZ({
      //     url: `http://t0.tianditu.gov.cn/ibo_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ibo&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`,
      //     attributions: '© 天地图',
      //   }),
      // }),
      // new TileLayer({
      //   source: new OSM(), // 使用OpenStreetMap数据源
      // }),
    ],
    // 配置视图
    view: new View({
      center: fromLonLat([120, 30]), // 初始中心点
      zoom: 7, // 初始缩放级别
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
    console.log('鼠标移动事件:', event)
    const coordinate = event.coordinate
    const pixel = event.pixel
    console.log(toLonLat(coordinate))
    console.log(pixel)
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
