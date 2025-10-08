<template>
  <div v-if="dialogData.show" class="prompt-dialog-overlay" @click.self="onCancel">
    <div class="prompt-dialog-container">
      <!-- Colored card behind -->
      <div class="prompt-dialog-bg"></div>
      
      <!-- Main white card -->
      <div class="prompt-dialog-inner">
        <button class="prompt-dialog-close" @click="onCancel">&times;</button>

        <div class="prompt-dialog-icon">
          <v-icon>mdi-calendar</v-icon>
        </div>

        <h2 class="prompt-dialog-title">{{ dialogData.title }}</h2>
        <p class="prompt-dialog-message">{{ dialogData.message }}</p>
        
        <!-- Input field -->
        <div class="prompt-dialog-input-container">
          <input
            v-model="dialogData.inputValue"
            :type="dialogData.inputType"
            class="prompt-dialog-input"
            @keyup.enter="onConfirm"
            ref="inputRef"
          />
        </div>

        <div class="prompt-dialog-actions">
          <button class="prompt-dialog-button secondary" @click="onCancel">
            {{ dialogData.cancelText }}
          </button>
          <button class="prompt-dialog-button primary" @click="onConfirm">
            {{ dialogData.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { watch, ref, nextTick } from 'vue'

export default {
  name: 'PromptDialog',
  setup() {
    const { promptDialog, confirmPrompt, cancelPrompt } = useCustomDialogs()
    const inputRef = ref(null)
    
    // Auto-focus input when dialog opens
    watch(
      () => promptDialog.value.show,
      (newValue) => {
        if (newValue) {
          nextTick(() => {
            if (inputRef.value) {
              inputRef.value.focus()
            }
          })
        }
      }
    )
    
    const onConfirm = () => {
      confirmPrompt()
    }

    const onCancel = () => {
      cancelPrompt()
    }

    return {
      dialogData: promptDialog,
      onConfirm,
      onCancel,
      inputRef
    }
  }
}
</script>

<style scoped>
.prompt-dialog-overlay {
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

.prompt-dialog-container {
  position: relative;
  width: 500px;
  max-width: 90vw;
  min-height: 300px;
}

.prompt-dialog-bg {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 96%;
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  background-color: #000000;
}

.prompt-dialog-inner {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.prompt-dialog-close {
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

.prompt-dialog-close:hover {
  color: #333;
}

.prompt-dialog-icon {
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

.prompt-dialog-icon .v-icon {
  font-size: 40px;
  color: #ffffff;
}

.prompt-dialog-icon::before {
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

.prompt-dialog-title {
  font-size: 2em;
  margin: 0 0 12px 0;
  color: #333;
}

.prompt-dialog-message {
  font-size: 1.2em;
  margin: 0 0 24px 0;
  color: #666;
}

.prompt-dialog-input-container {
  margin-bottom: 24px;
}

.prompt-dialog-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: border-color 0.3s ease;
}

.prompt-dialog-input:focus {
  outline: none;
  border-color: #000000;
}

.prompt-dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.prompt-dialog-button {
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1.1em;
  padding: 12px 24px;
  cursor: pointer;
  transition: opacity 0.3s ease;
  min-width: 100px;
}

.prompt-dialog-button.secondary {
  background-color: #666;
}

.prompt-dialog-button.secondary:hover {
  background-color: #555;
}

.prompt-dialog-button.primary {
  background-color: #000000;
}

.prompt-dialog-button.primary:hover {
  background-color: #333;
}
</style>

