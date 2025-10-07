<template>
  <v-dialog v-model="internalVisible" max-width="520" persistent>
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        Enable Notifications
      </v-card-title>
      <v-card-text>
        <div v-if="state === 'default'">
          To get chat messages and updates in real time, allow browser notifications for this device.
        </div>
        <div v-else-if="state === 'denied'">
          Notifications are currently blocked in your browser settings. To enable:
          <ul class="mt-2">
            <li>Open your browser’s site settings for this page.</li>
            <li>Allow Notifications, then reload this page.</li>
          </ul>
        </div>
        <div v-else-if="state === 'unsupported'">
          Your browser does not support web push notifications. You can still use the app normally.
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dismiss">Not now</v-btn>
        <v-btn v-if="state === 'default'" color="primary" :loading="loading" @click="enable">
          Enable Notifications
        </v-btn>
        <v-btn v-else color="primary" @click="dismiss">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { initMessaging } from '@/messaging'
import { useAppStore } from '@/stores/app'

const props = defineProps({
  visible: { type: Boolean, default: false }
})
const emit = defineEmits(['update:visible', 'accepted', 'dismissed'])

const appStore = useAppStore()
const internalVisible = ref(false)
const loading = ref(false)
const state = ref('default') // 'default' | 'denied' | 'unsupported'

function detectState() {
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

async function enable() {
  loading.value = true
  try {
    await initMessaging(appStore.userId)
  } catch (e) {
    // fall through; permission check below decides state
  } finally {
    loading.value = false
  }
  const s = detectState()
  if (s === 'granted') {
    try { localStorage.setItem('pushPromptAccepted', '1') } catch {}
    emit('accepted')
    emit('update:visible', false)
  } else if (s === 'denied') {
    state.value = 'denied'
  } else if (s === 'default') {
    // user dismissed native sheet without deciding
    state.value = 'default'
  } else {
    state.value = 'unsupported'
  }
}

function dismiss() {
  try { sessionStorage.setItem('pushPromptDismissed', '1') } catch {}
  emit('dismissed')
  emit('update:visible', false)
}

watch(() => props.visible, (v) => {
  internalVisible.value = v
  state.value = detectState()
})

onMounted(() => {
  internalVisible.value = props.visible
  state.value = detectState()
})

</script>

<style scoped>
ul { padding-left: 18px; }
li { margin: 4px 0; }
</style>

