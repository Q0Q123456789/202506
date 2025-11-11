<template>
  <div class="home">
    home
    <base-dialog v-model="openVisitDialog"> </base-dialog>
    <base-tabs
      :data="[
        { label: 'tabs1', value: 0 },
        { label: 'tabs2', value: 1 }
      ]"
    ></base-tabs>
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
