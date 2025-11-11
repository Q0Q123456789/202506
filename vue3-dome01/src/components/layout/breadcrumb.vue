<template>
  <el-breadcrumb :separator-icon="ArrowRight">
    <el-breadcrumb-item>homepage</el-breadcrumb-item>
    <el-breadcrumb-item>promotion management</el-breadcrumb-item>
    <el-breadcrumb-item>promotion list</el-breadcrumb-item>
    <el-breadcrumb-item>promotion detail</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue'
</script>

<style lang="less" scoped>
.el-breadcrumb {
  padding: 10px 0;
}
</style>
