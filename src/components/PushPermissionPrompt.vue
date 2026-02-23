<template>
  <div v-if="visible" class="notification-overlay" @click.self="dismiss">
    <div class="notification-dialog">
      <!-- colored card behind -->
      <div class="notification-dialog-bg info" />
      <!-- main white card -->
      <div class="notification-dialog-inner">
        <button class="notification-close" @click="dismiss">&times;</button>

        <div class="notification-icon info">
          <v-icon>mdi-bell-ring</v-icon>
        </div>

        <h2 class="notification-title">Enable Notifications</h2>

        <!-- Default state: prompt to enable -->
        <div v-if="state === 'default'">
          <p class="notification-message">
            To get chat messages and updates in real time, allow browser notifications for this device.
          </p>
          <div class="button-container">
            <button class="notification-button info" :disabled="loading" @click="enable">
              {{ loading ? 'Requesting...' : 'Enable Notifications' }}
            </button>
            <button class="notification-button secondary" :disabled="loading" @click="dismiss">
              Not Now
            </button>
          </div>
        </div>

        <!-- Denied state: show instructions -->
        <div v-else-if="state === 'denied'">
          <p class="notification-message">
            Notifications are currently blocked in your browser settings. To enable:
          </p>
          <ul class="instruction-list">
            <li>Open your browser's site settings for this page.</li>
            <li>Allow Notifications, then reload this page.</li>
          </ul>
          <div class="button-container">
            <button class="notification-button info" @click="dismiss">
              OK
            </button>
          </div>
        </div>

        <!-- Unsupported state -->
        <div v-else-if="state === 'unsupported'">
          <p class="notification-message">
            Your browser does not support web push notifications. You can still use the app normally.
          </p>
          <div class="button-container">
            <button class="notification-button info" @click="dismiss">
              OK
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref, watch } from 'vue'
  import { initMessaging } from '@/messaging'
  import { useAppStore } from '@/stores/app'

  const props = defineProps({
    visible: { type: Boolean, default: false },
  })
  const emit = defineEmits(['update:visible', 'accepted', 'dismissed'])

  const appStore = useAppStore()
  const loading = ref(false)
  const state = ref('default') // 'default' | 'denied' | 'unsupported'

  function detectState () {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'unsupported'
      }
      const perm = Notification.permission
      if (perm === 'denied') return 'denied'
      if (perm === 'granted') return 'granted'
      return 'default'
    } catch {
      return 'unsupported'
    }
  }

  async function enable () {
    loading.value = true
    try {
      // First, request notification permission explicitly
      let permission
      try {
        permission = await Notification.requestPermission()
        console.log('[PushPrompt] Permission result:', permission)
      } catch (error) {
        console.error('[PushPrompt] Permission request failed:', error)
        permission = Notification.permission
      }

      // Check the permission result
      if (permission === 'granted') {
        // Permission granted! Now initialize messaging
        try {
          await initMessaging(appStore.userId)
        } catch (error) {
          console.warn('[PushPrompt] initMessaging failed, but permission was granted:', error)
        }

        // Store that we've accepted and close the dialog
        try {
          localStorage.setItem('pushPromptAccepted', '1')
        } catch {}
        try {
          localStorage.setItem('fcmRegistered', '1')
        } catch {}
        emit('accepted')
        emit('update:visible', false)
      } else if (permission === 'denied') {
        // User explicitly denied
        state.value = 'denied'
      } else {
        // User dismissed without deciding (still 'default')
        emit('dismissed')
        emit('update:visible', false)
      }
    } catch (error) {
      console.error('[PushPrompt] Error in enable():', error)
      // Check final state
      const s = detectState()
      if (s === 'denied') {
        state.value = 'denied'
      } else if (s === 'granted') {
        // Even though there was an error, permission was granted
        try {
          localStorage.setItem('pushPromptAccepted', '1')
        } catch {}
        emit('accepted')
        emit('update:visible', false)
      } else {
        // Just close
        emit('dismissed')
        emit('update:visible', false)
      }
    } finally {
      loading.value = false
    }
  }

  function dismiss () {
    try {
      sessionStorage.setItem('pushPromptDismissed', '1')
    } catch {}
    emit('dismissed')
    emit('update:visible', false)
  }

  watch(() => props.visible, v => {
    if (v) {
      state.value = detectState()
    }
  })

  onMounted(() => {
    state.value = detectState()
  })

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
  z-index: 100000;
}

.notification-dialog {
  position: relative;
  width: 500px;
  max-width: 90vw;
  min-height: 200px;
}

.notification-dialog-bg {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 96%;
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.notification-dialog-bg.info {
  background-color: #000000;
}

.notification-dialog-inner {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.notification-close {
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

.notification-close:hover {
  color: #000;
}

.notification-icon {
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
}

.notification-icon.info {
  background-color: #000000;
}

.notification-icon .v-icon {
  font-size: 40px;
  color: #ffffff;
}

.notification-icon::before {
  content: '';
  position: absolute;
  width: 100px;
  height: 100px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  opacity: 0.2;
  animation: pulse 2s ease-in-out infinite;
}

.notification-icon.info::before {
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
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.notification-title {
  font-size: 2em;
  margin: 0 0 12px 0;
  color: #000;
}

.notification-message {
  font-size: 1.2em;
  margin: 0 0 24px 0;
  color: #666;
}

.instruction-list {
  text-align: left;
  margin: 16px auto 24px auto;
  max-width: 400px;
  padding-left: 24px;
  color: #666;
  font-size: 1.1em;
}

.instruction-list li {
  margin: 8px 0;
}

.button-container {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.notification-button {
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1.1em;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
}

.notification-button.info {
  background-color: #000000;
}

.notification-button.secondary {
  background-color: #ffffff;
  color: #000000;
  border: 2px solid #000000;
}

.notification-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.notification-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 600px) {
  .notification-dialog {
    width: 95vw;
    margin: 0 10px;
  }

  .button-container {
    flex-direction: column;
  }

  .notification-button {
    width: 100%;
  }
}
</style>
