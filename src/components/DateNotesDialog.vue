<template>
  <div v-if="show" class="dialog-overlay" @click.self="cancel">
    <div class="dialog">
      <!-- colored card behind -->
      <div class="dialog-bg"></div>
      <!-- main white card -->
      <div class="dialog-inner">
        <button class="dialog-close" @click="cancel">&times;</button>

        <div class="dialog-icon">
          <v-icon>mdi-calendar</v-icon>
        </div>

        <h2 class="dialog-title">{{ title }}</h2>
        <p class="dialog-subtitle">{{ message }}</p>

        <div class="dialog-content">
          <!-- Date Input -->
          <v-text-field
            v-model="dateValue"
            label="Date"
            type="date"
            variant="outlined"
            class="custom-input"
            :rules="dateRules"
            required
          />

          <!-- Notes Input -->
          <v-textarea
            v-model="notesValue"
            label="Notes (Optional)"
            variant="outlined"
            class="custom-input"
            rows="3"
            placeholder="Add any additional notes..."
            hide-details
          />
        </div>

        <div class="dialog-actions">
          <button class="dialog-button secondary" @click="cancel">
            {{ cancelText }}
          </button>
          <button
            class="dialog-button primary"
            @click="confirm"
            :disabled="!isValid"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useCustomDialogs } from "@/composables/useCustomDialogs";

const { dateNotesDialog, confirmDateNotes, cancelDateNotes } =
  useCustomDialogs();

const show = computed(() => dateNotesDialog.value.show);
const title = computed(() => dateNotesDialog.value.title);
const message = computed(() => dateNotesDialog.value.message);
const confirmText = computed(() => dateNotesDialog.value.confirmText);
const cancelText = computed(() => dateNotesDialog.value.cancelText);

const dateValue = computed({
  get: () => dateNotesDialog.value.dateValue,
  set: (value) => {
    dateNotesDialog.value.dateValue = value;
  },
});

const notesValue = computed({
  get: () => dateNotesDialog.value.notesValue,
  set: (value) => {
    dateNotesDialog.value.notesValue = value;
  },
});

const dateRules = [(v) => !!v || "Date is required"];

const isValid = computed(() => {
  return !!dateValue.value;
});

const confirm = () => {
  if (isValid.value) {
    confirmDateNotes();
  }
};

const cancel = () => {
  cancelDateNotes();
};
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
}

.dialog {
  position: relative;
  width: 500px;
  max-width: 90vw;
  min-height: 400px;
}

.dialog-bg {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 96%;
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  background-color: #000000;
}

.dialog-inner {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.dialog-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  color: #666;
}

.dialog-close:hover {
  color: #333;
}

.dialog-icon {
  position: relative;
  margin: 0 auto 24px auto;
  margin-top: -16%;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInCircle 0.3s ease-out forwards;
  background-color: #000000;
}

.dialog-icon .v-icon {
  font-size: 40px;
  color: #ffffff;
}

.dialog-icon::before {
  content: "";
  position: absolute;
  width: 100px;
  height: 100px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  opacity: 0.2;
  animation: pulse 2s ease-in-out infinite;
  background-color: #000000;
}

@keyframes fadeInCircle {
  from {
    opacity: 0;
    transform: scale(0.7);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.dialog-title {
  font-size: 2em;
  margin: 0 0 8px 0;
  color: #333;
}

.dialog-subtitle {
  font-size: 1.1em;
  margin: 0 0 24px 0;
  color: #666;
}

.dialog-content {
  margin: 24px 0;
  text-align: left;
}

.dialog-content .custom-input {
  margin-bottom: 16px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.dialog-button {
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1.1em;
  padding: 12px 24px;
  cursor: pointer;
  transition: opacity 0.3s ease;
  min-width: 100px;
}

.dialog-button.secondary {
  background-color: #666;
}

.dialog-button.primary {
  background-color: #000000;
}

.dialog-button:hover:not(:disabled) {
  opacity: 0.9;
}

.dialog-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Input field styling */
.custom-input .v-field {
  border-radius: 8px;
}

.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}

.custom-input :deep(.v-field--focused .v-field__outline) {
  border-color: #000 !important;
  border-width: 2px !important;
}
</style>
