<template>
  <div>
    <!-- Success Dialog -->
    <SuccessDialog
      :show="successDialog.show"
      :title="successDialog.title"
      :message="successDialog.message"
      :button-text="successDialog.buttonText"
      @close="hideSuccessDialog"
    />

    <!-- Error Dialog -->
    <ErrorDialog
      :show="errorDialog.show"
      :title="errorDialog.title"
      :message="errorDialog.message"
      :button-text="errorDialog.buttonText"
      @close="hideErrorDialog"
    />

    <!-- Confirm Dialog -->
    <ConfirmDialog
      :show="confirmDialog.show"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-text="confirmDialog.confirmText"
      :cancel-text="confirmDialog.cancelText"
      :color="confirmDialog.color"
      @confirm="confirm"
      @cancel="cancel"
    />

    <!-- Prompt Dialog -->
    <PromptDialog />
  </div>
</template>

<script setup>
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import SuccessDialog from '@/components/SuccessDialog.vue'
import ErrorDialog from '@/components/ErrorDialog.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import PromptDialog from '@/components/PromptDialog.vue'

const {
  successDialog,
  errorDialog,
  confirmDialog,
  hideSuccessDialog,
  hideErrorDialog,
  confirm,
  cancel
} = useCustomDialogs()
</script>
