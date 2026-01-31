<template>
  <div class="header">
    <div class="header-left"></div>
    <div class="header-center"></div>
    <div class="header-right">
      <el-dropdown placement="bottom" @command="handleCommand">
        <el-avatar :icon="UserFilled" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人信息</el-dropdown-item>
            <el-dropdown-item>修改密码</el-dropdown-item>
            <el-dropdown-item>退出登陆</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { UserFilled } from '@element-plus/icons-vue'

const handleCommand = (values) => {
  console.log(values)
}
</script>

<style lang="scss" scoped>
.header {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &-right {
    // line-height: 60px;
    display: flex;
    align-items: center;
    .el-avatar {
      cursor: pointer;
    }
  }
}
</style>
