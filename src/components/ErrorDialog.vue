<template>
  <div
    v-if="show"
    class="notification-overlay"
    @click.self="closeDialog"
  >
    <div class="notification-dialog">
      <!-- colored card behind -->
      <div
        class="notification-dialog-bg"
        style="background-color: #dc3545"
      />
      <!-- main white card -->
      <div class="notification-dialog-inner">
        <button class="notification-close" @click="closeDialog">&times;</button>

        <div
          class="notification-icon"
          style="
            background-color: #dc3545;
            --pulse-color: #dc3545
          "
        >
          <v-icon>mdi-alert-circle</v-icon>
        </div>

        <h2 class="notification-title">
          {{ title }}
        </h2>
        <p class="notification-message">
          {{ message }}
        </p>

        <button
          class="notification-button"
          style="background-color: #dc3545"
          @click="closeDialog"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { defineEmits, defineProps } from 'vue'

  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'Error!',
    },
    message: {
      type: String,
      default: 'An error occurred. Please try again.',
    },
    buttonText: {
      type: String,
      default: 'OK',
    },
  })

  const emit = defineEmits(['close'])

  const closeDialog = () => {
    emit('close')
  }
</script>

<style scoped>
/* NotificationDialog styles */
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
  z-index: 100000;
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

/* icon with pulse behind it */
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
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  70% {
    transform: scale(1.6);
    opacity: 0;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
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

.notification-button {
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 1em;
  padding: 12px 24px;
  cursor: pointer;
  width: 100%;
  margin-bottom: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.notification-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

/* Responsive design */
@media (max-width: 480px) {
  .notification-dialog {
    width: 90%;
    margin: 0 20px;
  }

  .notification-dialog-inner {
    padding: 24px;
  }

  .notification-title {
    font-size: 1.5em;
  }

  .notification-message {
    font-size: 1em;
  }
}
</style>
