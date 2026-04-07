<template>
  <div>user index page {{ id }}</div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

interface RouteParams {
  id: number
}
const route = useRoute()
const { id } = route.params as RouteParams

console.log('id', id)
</script>

<style scoped>
</style>
