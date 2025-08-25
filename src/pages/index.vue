<template>
  <v-app>
    <v-main class="split-login">
      <!-- Left Panel: Form -->
      <div class="left-panel">
        <div class="login-card">
          <h2 class="login-title">Hello!</h2>
          <small>Login to Get Started</small>

          <v-form ref="form" v-model="valid" class="my-3" lazy-validation>
            <!-- Email Field -->
            <v-text-field
              v-model="email"
              label="Email Address"
              prepend-inner-icon="mdi-email"
              flat="true"
                     density="comfortable"
              variant="outlined"
              class="custom-input"
              :rules="emailRules"
              dense
            />

            <!-- Password Field -->
            <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              density="comfortable"

              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              flat="true"
              variant="outlined"
              class="custom-input"
              :rules="passwordRules"
              dense
            />
          </v-form>

          <!-- Forgot Password (Left-aligned) -->
          <div class="forgot-password">
            <a href="#" @click.prevent="onForgotPassword">Forgot Password?</a>
          </div>

          <!-- Custom Black Login Button -->
          <button
            class="custom-btn"
            :disabled="!valid || loading"
            @click="onSubmit"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>

          <!-- Register as plain text -->
          <div class="register-text" @click="onRegister">
            Register
          </div>



        </div>
      </div>

      <!-- Right Panel: Image background with overlay -->
      <div class="right-panel">
        <div class="overlay"></div>
        <img src="@/assets/ds.png" alt="Brand Logo" class="brand-image"/>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import { useNotification } from '@/composables/useNotification'
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { auth, db } from '@/firebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'

export default {
  setup() {
    const { showSuccess, showError, showWarning, showInfo } = useNotification()
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    const appStore = useAppStore()
    return { showSuccess, showError, showWarning, showInfo, showSuccessDialog, showErrorDialog, appStore }
  },
  data() {
    return {
      email: '',
      password: '',
      valid: false,
      showPassword: false,
      loading: false,
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 6 || 'Password must be at least 6 characters',
      ],
    }
  },
  methods: {
    async onSubmit() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          // Sign in with Firebase Auth
          const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
          const user = userCredential.user;
          
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Store user data using Pinia store
            const userInfo = {
              uid: user.uid,
              email: user.email,
              ...userData
            };
            this.appStore.setUser(userInfo);
            
            console.log('User logged in:', userInfo);
            this.showSuccess('Login successful!');
            
            // Redirect based on user type
            if (userData.userType === 'Agency') {
              this.$router.push('/agency');
            } else {
              this.$router.push('/dashboard');
            }
          } else {
            // User exists in Auth but not in Firestore
            this.showError('User profile not found. Please contact administrator.');
            await auth.signOut();
          }
        } catch (error) {
          console.error('Login error:', error);
          let errorMessage = 'Login failed. Please check your credentials.';
          
          if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email address.';
          } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password. Please try again.';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Please enter a valid email address.';
          } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later.';
          } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'This account has been disabled. Please contact administrator.';
          }
          
          this.showError(errorMessage);
        } finally {
          this.loading = false;
        }
      }
    },
    onForgotPassword() {
      this.showInfo('Redirecting to Forgot Password page...')
    },
    onRegister() {
      this.showInfo('Redirecting to Register page...')
    },
    testSuccess() {
      this.showSuccess('This is a success notification!')
    },
    testError() {
      this.showError('This is an error notification!')
    },
    testWarning() {
      this.showWarning('This is a warning notification!')
    },
    testInfo() {
      this.showInfo('This is an info notification!')
    },
    testCustomSuccess() {
      this.showSuccessDialog('Operation completed successfully! This is a beautiful custom dialog.', 'Success!', 'Continue', '/agency')
    },
    testCustomError() {
      this.showErrorDialog('Something went wrong. Please check your input and try again.', 'Oops!', 'Try Again', '/')
    }
  },
}
</script>

<style scoped>
.split-login {
  display: flex;
  height: 100vh;
}

.left-panel {
  flex: 1;
  background-color: #f6f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
}

.right-panel {
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-image: url('https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg');
  background-size: cover;
  background-position: center;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.6);
  z-index: 1;
}

.brand-image {
  max-width: 400px;
  height: auto;
  z-index: 2;
  position: relative;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: none;
  z-index: 3;
  position: relative;
  display: flex;
  flex-direction: column;
}

.login-title {
  margin: 0;
  font-size: 2rem;
}

.custom-input .v-field {
  border-radius: 8px;
}

/* Buttons */
.custom-btn {
  width: 100%;
  padding: 10px 24px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s;
  z-index: 3;
  min-width: 280px;
}

.custom-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.custom-btn:hover:not(:disabled) {
  background-color: #222;
}

/* Forgot Password */
.forgot-password {
  text-align: left; /* left aligned */
  margin-top: -20px;
}

.forgot-password a {
  font-size: 0.9rem;
  color: #555;
  text-decoration: none;
}

.forgot-password a:hover {
  text-decoration: underline;
}

/* Register text */
.register-text {
  text-align: center;
  margin-top: 1rem;
  font-size: 1rem;
  color: #555;
  cursor: pointer;
  transition: color 0.3s;
}

.register-text:hover {
  color: black;
  text-decoration: underline;
}

/* Test notification buttons */
.test-notifications {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.test-dialogs {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.test-dialogs h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #333;
  text-align: center;
}

.test-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.test-btn.success {
  background-color: #4caf50;
}

.test-btn.success:hover {
  background-color: #45a049;
}

.test-btn.error {
  background-color: #f44336;
}

.test-btn.error:hover {
  background-color: #da190b;
}

.test-btn.warning {
  background-color: #ff9800;
}

.test-btn.warning:hover {
  background-color: #e68900;
}

.test-btn.info {
  background-color: #2196f3;
}

.test-btn.info:hover {
  background-color: #0b7dda;
}
</style>
