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

<style>
/* Make the header row container allow rounded corners */
.custom-header .v-data-table__thead {
  background-color: #002060 !important;
  border-collapse: separate;        /* allow cell-level radii */
  overflow: hidden;                 /* clip overflowing corners */
}

/* Base styling for every header cell */
.custom-header .v-data-table__th {
  background-color:#002060 !important;
  white-space: nowrap;
  color: white !important;
  text-transform: none;             /* keep original casing */
}

/* Top-left corner radius on the very first <th> */
.custom-header .v-data-table__th:first-child {
  border-top-left-radius: 20px !important;
}

/* Top-right corner radius on the very last <th> */
.custom-header .v-data-table__th:last-child {
  border-top-right-radius: 20px !important;
}

/* Optional: striped row background */
.custom-header .v-data-table__tr:nth-child(odd) {
  background-color: white !important;
}

.custom-header .v-data-table__tr:nth-child(even) {
  background-color: #f2f2f2 !important;
}

/* Global responsive utilities */
.text-responsive {
  font-size: clamp(0.875rem, 2.5vw, 1rem);
}

.heading-responsive {
  font-size: clamp(1.25rem, 4vw, 2rem);
}

.padding-responsive {
  padding: clamp(0.5rem, 2vw, 1.5rem);
}

.margin-responsive {
  margin: clamp(0.5rem, 2vw, 1rem);
}

/* Vuetify component overrides for consistent, smaller scaling */
:deep(.v-btn) {
  font-size: 0.75rem !important;
  min-height: 32px !important;
  padding: 0.375rem 0.75rem !important;
}

:deep(.v-btn--size-large) {
  font-size: 0.875rem !important;
  min-height: 40px !important;
  padding: 0.5rem 1rem !important;
}

:deep(.v-data-table) {
  font-size: 0.75rem !important;
}

:deep(.v-data-table .v-data-table__th) {
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  padding: 0.5rem !important;
  text-align: center !important;
}

:deep(.v-data-table .v-data-table__td) {
  font-size: 0.75rem !important;
  padding: 0.5rem !important;
  text-align: center !important;
}

:deep(.v-text-field .v-field__input) {
  font-size: 0.875rem !important;
  min-height: 36px !important;
}

:deep(.v-text-field .v-field-label) {
  font-size: 0.75rem !important;
}

:deep(.v-card-title) {
  font-size: 1rem !important;
  font-weight: 600 !important;
  padding: 1rem !important;
}

:deep(.v-card-text) {
  font-size: 0.875rem !important;
  padding: 0.75rem 1rem !important;
}

:deep(.v-chip) {
  font-size: 0.6875rem !important;
  height: 24px !important;
}

:deep(.v-select .v-field__input) {
  font-size: 0.875rem !important;
}

:deep(.v-textarea .v-field__input) {
  font-size: 0.875rem !important;
}

/* Consistent form styling */
:deep(.v-field--variant-solo) {
  border-radius: 6px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

:deep(.v-field--variant-solo .v-field__overlay) {
  background-color: #f8f9fa !important;
}

/* Consistent dialog styling */
:deep(.v-dialog .v-card) {
  border-radius: 8px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

/* Router transition effects */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
