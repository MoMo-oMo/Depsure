<template>
  <v-snackbar
    class="global-notification"
    :color="snackbarColor.value"
    location="top"
    :model-value="snackbar.value"
    :timeout="snackbarTimeout.value"
    @update:model-value="hideNotification"
  >
    <div class="d-flex align-center">
      <v-icon
        class="me-3"
        :color="getIconColor()"
        :icon="getIcon()"
      />
      <span class="notification-message">{{ snackbarMessage.value }}</span>
    </div>

    <template #actions>
      <v-btn
        color="white"
        icon="mdi-close"
        variant="text"
        @click="hideNotification"
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
    hideNotification,
  } = useNotification()

  const getIcon = () => {
    switch (snackbarColor.value) {
      case 'success': {
        return 'mdi-check-circle'
      }
      case 'error': {
        return 'mdi-alert-circle'
      }
      case 'warning': {
        return 'mdi-alert'
      }
      case 'info': {
        return 'mdi-information'
      }
      default: {
        return 'mdi-check-circle'
      }
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
