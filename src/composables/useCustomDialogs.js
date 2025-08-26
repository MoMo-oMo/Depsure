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
  },
  confirmDialog: {
    show: false,
    title: 'Are you sure?',
    message: 'Do you really want to delete this item?',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    color: '#dc3545',
    // internal
    _resolver: null,
    _rejecter: null
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

  const showConfirmDialog = ({
    message = 'Do you really want to delete this item?',
    title = 'Are you sure?',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    color = '#dc3545'
  } = {}) => {
    // Set props
    dialogStore.confirmDialog.message = message
    dialogStore.confirmDialog.title = title
    dialogStore.confirmDialog.confirmText = confirmText
    dialogStore.confirmDialog.cancelText = cancelText
    dialogStore.confirmDialog.color = color
    dialogStore.confirmDialog.show = true

    // Return a promise that resolves on confirm, rejects on cancel
    return new Promise((resolve, reject) => {
      dialogStore.confirmDialog._resolver = () => {
        dialogStore.confirmDialog.show = false
        dialogStore.confirmDialog._resolver = null
        dialogStore.confirmDialog._rejecter = null
        resolve(true)
      }
      dialogStore.confirmDialog._rejecter = () => {
        dialogStore.confirmDialog.show = false
        dialogStore.confirmDialog._resolver = null
        dialogStore.confirmDialog._rejecter = null
        reject(new Error('cancelled'))
      }
    })
  }

  const confirm = () => {
    if (dialogStore.confirmDialog._resolver) dialogStore.confirmDialog._resolver()
  }

  const cancel = () => {
    if (dialogStore.confirmDialog._rejecter) dialogStore.confirmDialog._rejecter()
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
    confirmDialog: computed(() => dialogStore.confirmDialog),
    showSuccessDialog,
    showErrorDialog,
    showConfirmDialog,
    hideSuccessDialog,
    hideErrorDialog,
    confirm,
    cancel
  }
}
