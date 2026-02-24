<template>
  <UDropdownMenu
    v-slot="{ open }"
    :modal="false"
    :items="props.items"
    :content="{ align: 'start' }"
    :ui="{ content: 'min-w-fit' }"
    :size="size"
  >
    <UButton
      :label="buttonLabel"
      :trailing-icon="`i-lucide-chevron-down`"
      class="font-semibold"
      :class="{ 'bg-primary/15': open }"
      :ui="{
        trailingIcon: 'transition-transform duration-200' + (open ? ' rotate-180' : '')
      }"
    />
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '#ui/types'

interface Props {
  items?: DropdownMenuItem[]
  buttonLabel?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  buttonLabel: 'Starter',
  size: 'lg',
  items: () => [
    {
      label: 'Starter',
      to: 'https://starter-template.nuxt.dev/',
      color: 'primary',
      checked: true,
      type: 'checkbox'
    },
    {
      label: 'Landing',
      to: 'https://landing-template.nuxt.dev/'
    },
    {
      label: 'Docs',
      to: 'https://docs-template.nuxt.dev/'
    },
    {
      label: 'SaaS',
      to: 'https://saas-template.nuxt.dev/'
    },
    {
      label: 'Dashboard',
      to: 'https://dashboard-template.nuxt.dev/'
    },
    {
      label: 'Chat',
      to: 'https://chat-template.nuxt.dev/'
    },
    {
      label: 'Portfolio',
      to: 'https://portfolio-template.nuxt.dev/'
    },
    {
      label: 'Changelog',
      to: 'https://changelog-template.nuxt.dev/'
    }
  ]
})
</script>
