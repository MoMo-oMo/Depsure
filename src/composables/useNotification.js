import { computed, reactive, readonly } from 'vue'

// Create a reactive store for notifications
const state = reactive({
  snackbar: false,
  snackbarMessage: '',
  snackbarColor: 'success',
  snackbarTimeout: 3000,
})

// Export a readonly version of the state for external access if needed
export const notificationState = readonly(state)

export function useNotification () {
  const showNotification = (message, type = 'success', timeout = 3000) => {
    // Reset any existing notification first
    state.snackbar = false

    // Use nextTick to ensure the reset is processed before showing new notification
    setTimeout(() => {
      state.snackbarMessage = message
      state.snackbarColor = type
      state.snackbarTimeout = timeout
      state.snackbar = true
    }, 100)
  }

  const showSuccess = (message, timeout = 3000) => {
    showNotification(message, 'success', timeout)
  }

  const showError = (message, timeout = 5000) => {
    showNotification(message, 'error', timeout)
  }

  const showWarning = (message, timeout = 4000) => {
    showNotification(message, 'warning', timeout)
  }

  const showInfo = (message, timeout = 3000) => {
    showNotification(message, 'info', timeout)
  }

  const hideNotification = () => {
    state.snackbar = false
  }

  // Return computed properties to ensure proper reactivity
  return {
    snackbar: computed(() => state.snackbar),
    snackbarMessage: computed(() => state.snackbarMessage),
    snackbarColor: computed(() => state.snackbarColor),
    snackbarTimeout: computed(() => state.snackbarTimeout),
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
  }
}
