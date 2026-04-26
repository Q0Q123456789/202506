<template>
  <div class="cesiumContainer" id="cesiumContainer"></div>
</template>

<script setup lang="ts">
import { Viewer } from 'cesium'
import * as cesiumExtends from 'cesium-extends'
console.log('cesiumExtends', cesiumExtends)
onMounted(() => {
  const viewer = new Viewer('cesiumContainer', {
    // 去掉对话框警告
    infoBox: false,
    // 是否显示查询按钮
    geocoder: false,
    // 不显示home按钮
    homeButton: false,
    // 控制查看器的显示模式（3D、2.5D、2D是否显示）
    sceneModePicker: true,
    // 是否显示图层选择
    baseLayerPicker: false,
    // 是否显示帮助按钮
    navigationHelpButton: false,
    // 是否显示播放动画、计时
    animation: false,
    // 是否显示时间轴
    timeline: false,
    // 是否显示全屏按钮
    fullscreenButton: false,
  })
  // 隐藏图标
  if (viewer.cesiumWidget.creditContainer) {
    viewer.cesiumWidget.creditContainer.style.display = 'none'
  }
})
</script>

<style scoped>
.cesiumContainer {
  width: 100vw;
  height: 100vh;
}
</style>
