import { reactive, computed } from 'vue'

// Create a reactive store for custom dialogs
const dialogStore = reactive({
  successDialog: {
    show: false,
    title: 'Success!',
    message: 'Operation completed successfully.',
    buttonText: 'OK',
    redirectTo: null
  },
  errorDialog: {
    show: false,
    title: 'Error!',
    message: 'An error occurred. Please try again.',
    buttonText: 'OK',
    redirectTo: null
  }
})

export function useCustomDialogs() {
  const showSuccessDialog = (message, title = 'Success!', buttonText = 'OK', redirectTo = null) => {
    dialogStore.successDialog.message = message
    dialogStore.successDialog.title = title
    dialogStore.successDialog.buttonText = buttonText
    dialogStore.successDialog.redirectTo = redirectTo
    dialogStore.successDialog.show = true
  }

  const showErrorDialog = (message, title = 'Error!', buttonText = 'OK', redirectTo = null) => {
    dialogStore.errorDialog.message = message
    dialogStore.errorDialog.title = title
    dialogStore.errorDialog.buttonText = buttonText
    dialogStore.errorDialog.redirectTo = redirectTo
    dialogStore.errorDialog.show = true
  }

  const hideSuccessDialog = () => {
    dialogStore.successDialog.show = false
    // Handle redirect if specified
    if (dialogStore.successDialog.redirectTo) {
      setTimeout(() => {
        window.location.href = dialogStore.successDialog.redirectTo
      }, 300)
    }
  }

  const hideErrorDialog = () => {
    dialogStore.errorDialog.show = false
    // Handle redirect if specified
    if (dialogStore.errorDialog.redirectTo) {
      setTimeout(() => {
        window.location.href = dialogStore.errorDialog.redirectTo
      }, 300)
    }
  }

  // Return computed properties to ensure proper reactivity
  return {
    successDialog: computed(() => dialogStore.successDialog),
    errorDialog: computed(() => dialogStore.errorDialog),
    showSuccessDialog,
    showErrorDialog,
    hideSuccessDialog,
    hideErrorDialog
  }
}
