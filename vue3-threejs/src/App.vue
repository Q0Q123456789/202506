<script setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { onMounted, onBeforeUnmount } from "vue";

let scene, camera, renderer, controls;
let animationFrameId;

const init = () => {
  // 创建场景
  scene = new THREE.Scene();

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(3, 3, 3);
  camera.lookAt(0, 0, 0);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.setClearColor(0xf0f0f0);
  document.getElementById("three-container").appendChild(renderer.domElement);

  // 加载贴图
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    "/src/assets/111.jpeg",
    (texture) => {
      // 贴图加载成功
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.5,
        roughness: 0.5,
      });

      const cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), material);
      cube.position.set(0, 0, 0);
      scene.add(cube);
    },
    undefined,
    (error) => {
      console.error("贴图加载失败:", error);
      // 加载失败时使用默认材质
      const material = new THREE.MeshStandardMaterial({
        color: 0x808080,
        metalness: 0.5,
        roughness: 0.5,
      });

      const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
      cube.position.set(0, 0, 0);
      scene.add(cube);
    }
  );

  // 创建网格
  // const gridHelper = new THREE.GridHelper(10, 10);
  // scene.add(gridHelper);

  // 添加坐标轴辅助
  // const axesHelper = new THREE.AxesHelper(5);
  // scene.add(axesHelper);

  // 创建立方体
  // const geometry = new THREE.SphereGeometry(1, 32, 32);
  // const material = new THREE.MeshPhongMaterial({
  //   color: 0x000000,
  //   shininess: 100,
  // });
  // const cube = new THREE.Mesh(geometry, material);
  // cube.position.set(0, 0, 0); // 将立方体放置在网格中间，底面正好在网格平面上
  // scene.add(cube);

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // 添加平行光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // 创建轨道控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // 添加阻尼效果
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 3;
  controls.maxDistance = 10;
  controls.maxPolarAngle = Math.PI / 2;

  // 开始动画循环
  animate();
};

const animate = () => {
  animationFrameId = requestAnimationFrame(animate);
  controls.update(); // 更新控制器
  renderer.render(scene, camera);
};

// 处理窗口大小变化
const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

onMounted(() => {
  init();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  cancelAnimationFrame(animationFrameId);
  renderer.dispose();
});
</script>

<template>
  <div id="three-container"></div>
</template>

<style scoped>
#three-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
