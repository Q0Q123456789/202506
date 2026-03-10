<template>
  <div id="map" ref="map">
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

import { onMounted, useTemplateRef } from 'vue'
import { fromLonLat } from 'ol/proj'

const mapRef = useTemplateRef('map')

onMounted(() => {
  const map = new Map({
    // target指向DOM元素
    target: mapRef.value,
    // 配置图层
    layers: [
      new TileLayer({
        // source: new OSM(), // 使用OpenStreetMap数据源
        source: new XYZ({
          url: `http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${import.meta.env.VITE_MAP_KEY}`,
          attributions: '© 天地图',
        }),
      }),
      new TileLayer({
        // source: new OSM(), // 使用OpenStreetMap数据源
        source: new XYZ({
          url: `http://t0.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${import.meta.env.VITE_MAP_KEY}`,
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

  console.log(map)
})
</script>
<style scoped>
#map {
  width: 100vw;
  height: 100vh;
}
</style>
