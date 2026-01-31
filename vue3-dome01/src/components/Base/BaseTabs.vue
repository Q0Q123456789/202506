<template>
  <div class="base-tabs">
    <template v-for="(item, index) in data" :key="index">
      <div :class="['tabs-items', active === index ? 'active' : '']" @click="tabsChange(item)">
        {{ item.label }}
      </div>
      <el-divider direction="vertical" v-if="data.length - 1 !== index" />
    </template>
  </div>
</template>

<script setup>
const active = ref(0)
const emit = defineEmits(['tabsChange'])
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const tabsChange = (item) => {
  active.value = item.value
  emit('tabsChange', item)
}
</script>

<style lang="scss" scoped>
.base-tabs {
  border-bottom: 1px solid #ccc;
  user-select: none;
  .tabs-items {
    display: inline-block;
    padding: 10px;
    cursor: pointer;
  }
  .active {
    color: var(--el-color-primary);
    border-bottom: 1px var(--el-color-primary) solid;
  }
}
</style>
