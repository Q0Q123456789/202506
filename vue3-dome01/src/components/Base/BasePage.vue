<template>
  <el-pagination
    v-model:current-page="props.currentPage"
    v-model:page-size="props.pageSize"
    :page-sizes="props.pageSizes"
    :size="props.size"
    :disabled="props.disabled"
    :background="props.background"
    :layout="props.layout"
    :total="props.total"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>

<script setup>
const props = defineProps({
  size: {
    type: String,
    default: 'small'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  background: {
    type: Boolean,
    default: false
  },
  pageSize: {
    type: Number,
    default: 10
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 30, 50, 80, 100]
  },
  total: {
    type: Number,
    default: 0
  },
  layout: {
    type: String,
    default: 'total, prev, pager, next, sizes, jumper'
  }
})
const emit = defineEmits(['handlePageChange'])
const handleSizeChange = (val) => {
  emit('handlePageChange', { currentPage: val, pageSize: props.pageSize })
}
const handleCurrentChange = (val) => {
  emit('handlePageChange', { pageSize: val, currentPage: 1 })
}
</script>

<style lang="scss" scoped></style>
