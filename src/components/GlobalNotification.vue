<template>
  <v-snackbar 
    :model-value="snackbar.value" 
    :timeout="snackbarTimeout.value"
    :color="snackbarColor.value"
    location="top"
    class="global-notification"
    @update:model-value="hideNotification"
  >
    <div class="d-flex align-center">
      <v-icon 
        :icon="getIcon()" 
        class="me-3"
        :color="getIconColor()"
      />
      <span class="notification-message">{{ snackbarMessage.value }}</span>
    </div>
    
    <template v-slot:actions>
      <v-btn
        icon="mdi-close"
        variant="text"
        @click="hideNotification"
        color="white"
      />
    </template>
  </v-snackbar>
</template>

<script setup>
import { useNotification } from '@/composables/useNotification'

const {
  snackbar,
  snackbarMessage,
  snackbarColor,
  snackbarTimeout,
  hideNotification
} = useNotification()

const getIcon = () => {
  switch (snackbarColor.value) {
    case 'success':
      return 'mdi-check-circle'
    case 'error':
      return 'mdi-alert-circle'
    case 'warning':
      return 'mdi-alert'
    case 'info':
      return 'mdi-information'
    default:
      return 'mdi-check-circle'
  }
}

const getIconColor = () => {
  return 'white'
}
</script>

<style scoped>
.global-notification {
  z-index: 100000;
}

.notification-message {
  font-weight: 500;
  color: white;
}
</style>
