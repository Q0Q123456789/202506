<template>
  <div class="common-layout">
    <el-container>
      <el-header style="box-shadow: var(--el-box-shadow-lighter)">
        <headerPage></headerPage>
      </el-header>
      <el-container>
        <el-aside width="200px" class="main-aside">
          <menuPage />
        </el-aside>
        <el-main>
          <breadcrumbPage></breadcrumbPage>
          <div class="main-views">
            <router-view></router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>
    <div class="login">
      <img src="@/assets/image/login.svg" alt="" />
    </div>
  </div>
</template>

<script setup>
import headerPage from './header.vue'
import breadcrumbPage from './breadcrumb.vue'
import menuPage from './menu.vue'
</script>

<style lang="scss" scoped>
.el-header,
.el-aside,
.main-views {
  background-color: var(--el-color-white);
}
.el-main {
  padding: 0 16px 16px;
}

.main-aside {
  box-shadow: 0px 6px 6px rgba(0, 0, 0, 0.12);
  height: calc(100vh - 60px);
}

.main-views {
  padding: 10px;
  height: calc(100vh - 110px);
}

.common-layout {
  position: relative;
}

.login {
  position: absolute;
  top: 15px;
  left: 50%;
  width: 100px;
  height: 30px;
  // background: url('@/assets/image/login.svg') no-repeat;
  z-index: 999;
  // background-size: 100% 100%;
  transform: translateX(-50%);
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
