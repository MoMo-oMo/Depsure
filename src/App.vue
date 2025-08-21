<template>
  <v-app>
    <NavDrawer v-if="showDrawer" />
    <AppBar v-if="showDrawer" />
    <router-view />
  </v-app>
</template>

<script setup>
  // Components
  import NavDrawer from '@/components/NavDrawer.vue'
  import AppBar from '@/components/AppBar.vue'
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()
  const showDrawer = computed(() => route.path !== '/')
</script>
