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
  </div>
</template>

<script setup>
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import SuccessDialog from '@/components/SuccessDialog.vue'
import ErrorDialog from '@/components/ErrorDialog.vue'

const {
  successDialog,
  errorDialog,
  hideSuccessDialog,
  hideErrorDialog
} = useCustomDialogs()
</script>
