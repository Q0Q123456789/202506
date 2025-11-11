<template>
  <div class="home">
    home
    <base-dialog v-model="openVisitDialog"> </base-dialog>
  </div>
</template>

<script setup>
// 添加组件name属性以满足vue/multi-word-component-names规则
defineOptions({
  name: 'HomeView'
})
const openVisitDialog = ref(true)
</script>

<style lang="less" scoped>
.home {
  color: red;
}
</style>
