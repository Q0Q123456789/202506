<template>
  <el-menu :router="true" :default-active="defaultActive" :default-openeds="openedMenus">
    <template v-for="(item, index) in menu" :key="index">
      <el-sub-menu :index="item.path" v-if="item.children && item.children.length">
        <template #title> {{ item.name }} </template>
        <el-menu-item-group v-if="item.children && item.children.length">
          <template v-for="(node, key) in item.children" :key="key">
            <el-menu-item :index="node.path">{{ node.name }}</el-menu-item>
          </template>
        </el-menu-item-group>
      </el-sub-menu>
      <el-menu-item v-else :index="item.path">{{ item.name }}</el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
const route = useRoute()
const menu = [
  {
    name: '首页',
    path: '/home'
  },
  {
    name: '系统管理',
    children: [
      {
        name: '用户管理',
        path: '/user'
      },
      {
        name: '角色管理',
        path: '/role'
      }
    ]
  }
]

const defaultActive = ref<string>('')
const openedMenus = ref<string[]>([])

onMounted(() => {
  console.log('当前路由信息：', route)
  defaultActive.value = route.path
  openedMenus.value.push(route.path)
})
</script>

<style lang="scss" scoped></style>
