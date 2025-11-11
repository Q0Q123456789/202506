<template>
  <el-dialog
    append-to-body
    v-model="visibleDialog"
    :title="props.title"
    align-center
    transition="scale"
    :width="props.width"
    :before-close="handleClose"
  >
    <template #default></template>
    <template #footer>
      <el-button
        @click="handleClose"
        v-if="closeOptions.isVisible"
      >{{ closeOptions.text }}</el-button>
      <el-button
        type="primary"
        v-if="saveOptions.isVisible"
        @click="handleSave"
      >{{ saveOptions.text }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import { computed } from 'vue'
  const visibleDialog = defineModel({ default: false })
  const emit = defineEmits(['onSave', 'onClose'])
  const props = defineProps({
    title: {
      type: String,
      default: '标题'
    },
    width: {
      type: String,
      default: '25%'
    },
    saveVisible: {
      type: Object,
      default: () => {
        return {
          isVisible: true,
          text: '确认',
        }

      }
    },
    closeVisible: {
      type: Object,
      default: () => {
        return {
          isVisible: true,
          text: '取消',
        }
      }
    },
  })

  const saveOptions = computed(() => {
    return {
      ...props.saveVisible,
    }
  })

  const closeOptions = computed(() => {
    return {
      ...props.closeVisible,
    }
  })

  const handleSave = () => {
    emit('onSave')
  }
  const handleClose = () => {
    visibleDialog.value = false
    emit('onClose')
  }
</script>

<style lang="less" scoped></style>
