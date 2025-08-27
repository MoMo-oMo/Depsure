<template>
  <div v-if="visible" class="notification-overlay" @click.self="closeDialog">
    <div class="notification-dialog">
      <!-- colored card behind -->
      <div class="notification-dialog-bg info"></div>
      <!-- main white card -->
      <div class="notification-dialog-inner">
        <button class="notification-close" @click="closeDialog">&times;</button>

        <div class="notification-icon info">
          <v-icon>mdi-email-lock</v-icon>
        </div>

        <h2 class="notification-title">Forgot Password</h2>
        <p class="notification-message">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <!-- Email Input Field -->
        <div class="email-input-container">
          <v-text-field
            v-model="email"
            label="Email Address"
            type="email"
            variant="outlined"
            prepend-inner-icon="mdi-email"
            :rules="emailRules"
            :disabled="loading"
            @keyup.enter="resetPassword"
            class="email-input"
            density="comfortable"
          />
        </div>

        <!-- Success message -->
        <div v-if="successMessage" class="success-message">
          <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
          {{ successMessage }}
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="error-message">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          {{ errorMessage }}
        </div>

        <div class="button-container">
          <button class="notification-button info" @click="resetPassword" :disabled="loading || !isEmailValid">
            {{ loading ? 'Sending...' : 'Send Reset Link' }}
          </button>
          <button class="notification-button secondary" @click="closeDialog" :disabled="loading">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/firebaseConfig'

export default {
  name: 'ForgotPasswordDialog',
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      email: '',
      valid: false,
      loading: false,
      successMessage: '',
      errorMessage: '',
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Please enter a valid email address',
      ]
    }
  },
  computed: {
    isEmailValid() {
      return this.email && /.+@.+\..+/.test(this.email)
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.resetForm()
      }
    }
  },
  methods: {
    async resetPassword() {
      if (!this.isEmailValid) {
        this.errorMessage = 'Please enter a valid email address.'
        return
      }

      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''

             try {
         await sendPasswordResetEmail(auth, this.email)
         this.successMessage = 'Password reset link sent! Please check your email.'
         
         // Auto-close after 2 seconds
         setTimeout(() => {
           this.closeDialog()
         }, 2000)
       } catch (error) {
        console.error('Password reset error:', error)
        
        // Handle specific Firebase errors
        switch (error.code) {
          case 'auth/user-not-found':
            this.errorMessage = 'No account found with this email address.'
            break
          case 'auth/invalid-email':
            this.errorMessage = 'Please enter a valid email address.'
            break
          case 'auth/too-many-requests':
            this.errorMessage = 'Too many requests. Please try again later.'
            break
          default:
            this.errorMessage = 'Failed to send reset link. Please try again.'
        }
      } finally {
        this.loading = false
      }
    },
    
    closeDialog() {
      this.$emit("update:visible", false)
      this.$emit("close")
    },
    
    resetForm() {
      this.email = ''
      this.valid = false
      this.successMessage = ''
      this.errorMessage = ''
    }
  }
}
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
}

.notification-message {
  font-size: 1.2em;
  margin: 0 0 24px 0;
  color: #666;
}

.email-input-container {
  margin-bottom: 24px;
}

.email-input {
  max-width: 300px;
  margin: 0 auto;
}

.email-input :deep(.v-field) {
  border-radius: 12px;
}

.success-message {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0fff4;
  color: #22543d;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 1em;
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fed7d7;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 1em;
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
  padding: 8px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  width: 200px;
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
