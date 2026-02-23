<template>
  <div>
    <!-- Success Dialog -->
    <SuccessDialog
      :button-text="successDialog.buttonText"
      :message="successDialog.message"
      :show="successDialog.show"
      :title="successDialog.title"
      @close="hideSuccessDialog"
    />

    <!-- Error Dialog -->
    <ErrorDialog
      :button-text="errorDialog.buttonText"
      :message="errorDialog.message"
      :show="errorDialog.show"
      :title="errorDialog.title"
      @close="hideErrorDialog"
    />

    <!-- Confirm Dialog -->
    <ConfirmDialog
      :cancel-text="confirmDialog.cancelText"
      :color="confirmDialog.color"
      :confirm-text="confirmDialog.confirmText"
      :message="confirmDialog.message"
      :show="confirmDialog.show"
      :title="confirmDialog.title"
      @cancel="cancel"
      @confirm="confirm"
    />

    <!-- Prompt Dialog -->
    <PromptDialog />

    <!-- Date Notes Dialog -->
    <DateNotesDialog />
  </div>
</template>

<script setup>
  import ConfirmDialog from '@/components/ConfirmDialog.vue'
  import DateNotesDialog from '@/components/DateNotesDialog.vue'
  import ErrorDialog from '@/components/ErrorDialog.vue'
  import PromptDialog from '@/components/PromptDialog.vue'
  import SuccessDialog from '@/components/SuccessDialog.vue'
  import { useCustomDialogs } from '@/composables/useCustomDialogs'

  const {
    successDialog,
    errorDialog,
    confirmDialog,
    hideSuccessDialog,
    hideErrorDialog,
    confirm,
    cancel,
  } = useCustomDialogs()
</script>
