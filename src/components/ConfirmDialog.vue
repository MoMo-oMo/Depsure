<template>
  <div
    v-if="show"
    class="notification-overlay"
    @click.self="onCancel"
  >
    <div class="notification-dialog">
      <div
        class="notification-dialog-bg"
        :style="{ backgroundColor: accentColor }"
      ></div>
      <div class="notification-dialog-inner">
        <button class="notification-close" @click="onCancel">&times;</button>

        <div
          class="notification-icon"
          :style="{
            backgroundColor: accentColor,
            '--pulse-color': accentColor
          }"
        >
          <v-icon>mdi-help-circle</v-icon>
        </div>

        <h2 class="notification-title">
          {{ title }}
        </h2>
        <p class="notification-message">
          {{ message }}
        </p>

        <div class="button-row">
          <button
            class="notification-button btn-cancel"
            @click="onCancel"
          >
            {{ cancelText }}
          </button>
          <button
            class="notification-button btn-confirm"
            :style="{ backgroundColor: accentColor }"
            @click="onConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Are you sure?' },
  message: { type: String, default: 'Do you really want to delete this item?' },
  confirmText: { type: String, default: 'Delete' },
  cancelText: { type: String, default: 'Cancel' },
  color: { type: String, default: '#dc3545' }
})

const emit = defineEmits(['confirm', 'cancel'])

const accentColor = computed(() => props.color)

const onConfirm = () => emit('confirm')
const onCancel = () => emit('cancel')
</script>

<style scoped>
.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.notification-dialog {
  position: relative;
  width: 400px;
}

.notification-dialog-bg {
  position: absolute;
  top: 8px;
  left: 11px;
  width: 92%;
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.notification-dialog-inner {
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.notification-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  color: #666;
}

.notification-close:hover {
  color: #333;
}

.notification-icon {
  position: relative;
  margin: 0 auto 16px auto;
  margin-top: -20%;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.notification-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--pulse-color);
  opacity: 0.6;
  animation: pulse-scale 1.5s infinite ease-out;
  z-index: -1;
}

.notification-icon .v-icon {
  font-size: 36px !important;
  color: #ffffff !important;
}

@keyframes pulse-scale {
  0% { transform: scale(1); opacity: 0.6; }
  70% { transform: scale(1.6); opacity: 0; }
  100% { transform: scale(1.6); opacity: 0; }
}

.notification-title {
  font-size: 1.75em;
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-weight: 600;
}

.notification-message {
  font-size: 1.125em;
  margin: 0 0 24px 0;
  color: #6c757d;
  line-height: 1.5;
}

.button-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.notification-button {
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 1em;
  padding: 12px 24px;
  cursor: pointer;
  width: 100%;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-cancel {
  background-color: #000000;
}

.notification-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

@media (max-width: 480px) {
  .notification-dialog { width: 90%; margin: 0 20px; }
  .notification-dialog-inner { padding: 24px; }
  .notification-title { font-size: 1.5em; }
  .notification-message { font-size: 1em; }
}
</style>


