<template>
  <div class="home">
    home

    <i class="icon-across-chain"></i>
  </div>
</template>

<script setup>
// 添加组件name属性以满足vue/multi-word-component-names规则
defineOptions({
  name: 'HomeView'
})
const openVisitDialog = ref(false)
</script>

<style lang="less" scoped>
.home {
  // color: red;
}
</style>
