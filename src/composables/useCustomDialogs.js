import { computed, reactive } from 'vue'

// Create a reactive store for custom dialogs
const dialogStore = reactive({
  successDialog: {
    show: false,
    title: 'Success!',
    message: 'Operation completed successfully.',
    buttonText: 'OK',
    redirectTo: null,
  },
  errorDialog: {
    show: false,
    title: 'Error!',
    message: 'An error occurred. Please try again.',
    buttonText: 'OK',
    redirectTo: null,
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
    _rejecter: null,
  },
  promptDialog: {
    show: false,
    title: 'Enter Value',
    message: 'Please enter a value:',
    inputValue: '',
    inputType: 'text',
    confirmText: 'OK',
    cancelText: 'Cancel',
    // internal
    _resolver: null,
    _rejecter: null,
  },
  dateNotesDialog: {
    show: false,
    title: 'Set Date',
    message: 'Please enter a date:',
    dateValue: '',
    notesValue: '',
    confirmText: 'Save',
    cancelText: 'Cancel',
    // internal
    _resolver: null,
    _rejecter: null,
  },
})

export function useCustomDialogs () {
  const showSuccessDialog = (
    message,
    title = 'Success!',
    buttonText = 'OK',
    redirectTo = null,
  ) => {
    dialogStore.successDialog.message = message
    dialogStore.successDialog.title = title
    dialogStore.successDialog.buttonText = buttonText
    dialogStore.successDialog.redirectTo = redirectTo
    dialogStore.successDialog.show = true
  }

  const showErrorDialog = (
    message,
    title = 'Error!',
    buttonText = 'OK',
    redirectTo = null,
  ) => {
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
    color = '#dc3545',
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
    if (dialogStore.confirmDialog._resolver) {
      dialogStore.confirmDialog._resolver()
    }
  }

  const cancel = () => {
    if (dialogStore.confirmDialog._rejecter) {
      dialogStore.confirmDialog._rejecter()
    }
  }

  const showPromptDialog = ({
    message = 'Please enter a value:',
    title = 'Enter Value',
    inputType = 'text',
    confirmText = 'OK',
    cancelText = 'Cancel',
    defaultValue = '',
  } = {}) => {
    // Set props
    dialogStore.promptDialog.message = message
    dialogStore.promptDialog.title = title
    dialogStore.promptDialog.inputType = inputType
    dialogStore.promptDialog.inputValue = defaultValue
    dialogStore.promptDialog.confirmText = confirmText
    dialogStore.promptDialog.cancelText = cancelText
    dialogStore.promptDialog.show = true

    // Return a promise that resolves with input value on confirm, rejects on cancel
    return new Promise((resolve, reject) => {
      dialogStore.promptDialog._resolver = () => {
        const value = dialogStore.promptDialog.inputValue
        dialogStore.promptDialog.show = false
        dialogStore.promptDialog.inputValue = ''
        dialogStore.promptDialog._resolver = null
        dialogStore.promptDialog._rejecter = null
        resolve(value)
      }
      dialogStore.promptDialog._rejecter = () => {
        dialogStore.promptDialog.show = false
        dialogStore.promptDialog.inputValue = ''
        dialogStore.promptDialog._resolver = null
        dialogStore.promptDialog._rejecter = null
        reject(new Error('User cancelled'))
      }
    })
  }

  const showDateNotesDialog = ({
    message = 'Please enter a date:',
    title = 'Set Date',
    confirmText = 'Save',
    cancelText = 'Cancel',
    defaultDate = '',
    defaultNotes = '',
  } = {}) => {
    // Set props
    dialogStore.dateNotesDialog.message = message
    dialogStore.dateNotesDialog.title = title
    dialogStore.dateNotesDialog.dateValue = defaultDate
    dialogStore.dateNotesDialog.notesValue = defaultNotes
    dialogStore.dateNotesDialog.confirmText = confirmText
    dialogStore.dateNotesDialog.cancelText = cancelText
    dialogStore.dateNotesDialog.show = true

    // Return a promise that resolves with {date, notes} on confirm, rejects on cancel
    return new Promise((resolve, reject) => {
      dialogStore.dateNotesDialog._resolver = () => {
        const result = {
          date: dialogStore.dateNotesDialog.dateValue,
          notes: dialogStore.dateNotesDialog.notesValue,
        }
        dialogStore.dateNotesDialog.show = false
        dialogStore.dateNotesDialog.dateValue = ''
        dialogStore.dateNotesDialog.notesValue = ''
        dialogStore.dateNotesDialog._resolver = null
        dialogStore.dateNotesDialog._rejecter = null
        resolve(result)
      }
      dialogStore.dateNotesDialog._rejecter = () => {
        dialogStore.dateNotesDialog.show = false
        dialogStore.dateNotesDialog.dateValue = ''
        dialogStore.dateNotesDialog.notesValue = ''
        dialogStore.dateNotesDialog._resolver = null
        dialogStore.dateNotesDialog._rejecter = null
        reject(new Error('User cancelled'))
      }
    })
  }

  const confirmPrompt = () => {
    if (dialogStore.promptDialog._resolver) {
      dialogStore.promptDialog._resolver()
    }
  }

  const cancelPrompt = () => {
    if (dialogStore.promptDialog._rejecter) {
      dialogStore.promptDialog._rejecter()
    }
  }

  const confirmDateNotes = () => {
    if (dialogStore.dateNotesDialog._resolver) {
      dialogStore.dateNotesDialog._resolver()
    }
  }

  const cancelDateNotes = () => {
    if (dialogStore.dateNotesDialog._rejecter) {
      dialogStore.dateNotesDialog._rejecter()
    }
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
    promptDialog: computed(() => dialogStore.promptDialog),
    dateNotesDialog: computed(() => dialogStore.dateNotesDialog),
    showSuccessDialog,
    showErrorDialog,
    showConfirmDialog,
    showPromptDialog,
    showDateNotesDialog,
    hideSuccessDialog,
    hideErrorDialog,
    confirm,
    cancel,
    confirmPrompt,
    cancelPrompt,
    confirmDateNotes,
    cancelDateNotes,
  }
}
