<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import AppLayout from './components/layout/AppLayout.vue'

const route = useRoute()
const isAuthRoute = computed(() => route.name === 'login')
</script>

<template>
  <RouterView v-if="isAuthRoute" />
  <AppLayout v-else>
    <RouterView />
  </AppLayout>
</template>
