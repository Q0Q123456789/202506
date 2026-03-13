<template>
  <div id="map">
    <!--    111-->
    <!--    <router-view></router-view>-->
  </div>
</template>
<script setup lang="ts">
import 'ol/ol.css' // 引入OpenLayers基础样式
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'

import { onMounted } from 'vue'
import { fromLonLat, toLonLat } from 'ol/proj'

const token = import.meta.env.VITE_MAP_KEY

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
      new TileLayer({
        // source: new OSM(), // 使用OpenStreetMap数据源
        source: new XYZ({
          url: `http://t0.tianditu.gov.cn/ibo_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ibo&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`,
          attributions: '© 天地图',
        }),
      }),
    ],
    // 配置视图
    view: new View({
      center: fromLonLat([120, 30]), // 初始中心点
      zoom: 7, // 初始缩放级别
      minZoom: 1,
      maxZoom: 18,
      projection: 'EPSG:3857',
    }),
  })

  map.on('singleclick', (e) => {
    console.log(e.coordinate)
    console.log(toLonLat(e.coordinate))
    console.log('当前缩放级别:', map.getView().getZoom())
  })

  // 滚动事件处理
  map.on('change', (e) => {
    console.log('滚动事件:', e)
    // console.log('滚动方向:', e.deltaY > 0 ? '向下滚动（缩小）' : '向上滚动（放大）')
    // console.log('滚动速度:', e.deltaY)
    console.log('当前缩放级别:', map.getView().getZoom())
  })
})
</script>
<style scoped>
#map {
  width: 100vw;
  height: 100vh;
}
</style>
