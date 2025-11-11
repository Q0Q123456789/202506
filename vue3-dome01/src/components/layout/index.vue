<template>
  <div class="common-layout">
    <el-container>
      <el-header style="box-shadow: var(--el-box-shadow-lighter)">
        <headerPage></headerPage>
      </el-header>
      <el-container>
        <el-aside width="200px" style="box-shadow: 0px 6px 6px rgba(0, 0, 0, 0.12); height: calc(100vh - 60px)">
          Aside
        </el-aside>
        <el-main>
          <breadcrumbPage></breadcrumbPage>
          <div class="main-views">
            <router-view></router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import headerPage from './header.vue'
import breadcrumbPage from './breadcrumb.vue'
</script>

<style lang="less" scoped>
.el-header,
.el-aside,
.main-views {
  background-color: var(--el-color-white);
}
.el-main {
  padding: 0 16px 16px;
}
.main-views {
  padding: 10px;
  height: calc(100vh - 110px);
}
</style>
