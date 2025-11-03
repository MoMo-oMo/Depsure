<template>
  <v-main class="split-login">
      <!-- Left Panel: Form -->
      <div class="left-panel">
        <div class="login-card animate-form">
          <h2 class="login-title animate-title">Hello!</h2>
          <small class="animate-subtitle">Login to Get Started</small>

          <v-form ref="form" v-model="valid" class="pa-0 animate-form-fields">
            <!-- Email Field -->
            <v-text-field
              v-model="email"
              label="Email Address"
              prepend-inner-icon="mdi-email"
              flat
              density="comfortable"
              variant="outlined"
              class="custom-input animate-input pa-0"
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
               flat
               style="margin-top: -18px;"
               variant="outlined"
               class="custom-input animate-input pa-0"
               :rules="passwordRules"
               dense
             />

           </v-form>

          <!-- Forgot Password (Left-aligned) -->
          <div class="forgot-password animate-forgot">
            <a href="#" @click.prevent="onForgotPassword">Forgot Password?</a>
          </div>

          <!-- Custom Black Login Button -->
          <button
            class="custom-btn animate-button"
            :disabled="loading"
            @click="onSubmit"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </div>
      </div>

             <!-- Right Panel: Image background with overlay -->
       <div class="right-panel">
         <div class="overlay"></div>
         <img src="@/assets/ds.png" alt="Brand Logo" class="brand-image animate-logo"/>
       </div>
     </v-main>
     
     <!-- Error Dialog Overlay -->
     <NotificationDialog
       :visible="!!loginError"
       type="error"
       title="Login Error!"
       :message="loginError"
       buttonText="Try Again"
       @close="loginError = ''"
     />

     <!-- Forgot Password Dialog -->
     <ForgotPasswordDialog
       v-model:visible="showForgotPasswordDialog"
       @close="showForgotPasswordDialog = false"
     />
   
</template>

<script>
import { useNotification } from '@/composables/useNotification'
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { auth, db } from '@/firebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'
import NotificationDialog from '@/components/NotificationDialog.vue'
import ForgotPasswordDialog from '@/components/ForgotPasswordDialog.vue'


export default {
  components: { NotificationDialog, ForgotPasswordDialog },
  setup() {
    const { showSuccess, showError, showWarning, showInfo } = useNotification()
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions } = useAuditTrail()
    const appStore = useAppStore()
    return { showSuccess, showError, showWarning, showInfo, showSuccessDialog, showErrorDialog, appStore, logAuditEvent, auditActions }
    
  },
  data() {
    return {
      email: '',
      password: '',
      valid: false,
      showPassword: false,
      loading: false,
      loginError: '',
      showForgotPasswordDialog: false,
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
            
            // Decide landing route based on role
            let landingRoute;
            if (userData.userType === 'Agency') {
              // Agency users go to Onboard Units
              landingRoute = '/onboard-units';
            } else if (userData.userType === 'Admin' && userData.adminScope === 'agency') {
              // Agency Admin users go to Onboard Units
              landingRoute = '/onboard-units';
            } else {
              // Super Admin and regular Admin go to Agencies
              landingRoute = '/agencies';
            }
            
            // Log audit event
            await this.logAuditEvent(
              this.auditActions.LOGIN,
              { 
                loginMethod: 'email',
                userType: userData.userType,
                redirectPath: landingRoute
              },
              'USER',
              user.uid
            );
            
            console.log('User logged in:', userInfo);
            this.showSuccess('Login successful!');
            
            // Redirect based on role
            this.$router.push(landingRoute);
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
          } else if (error.code === 'auth/invalid-credential' || 
                     error.code === 'auth/wrong-password') {
            errorMessage = 'Email or password is incorrect';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Please enter a valid email address.';
          } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Email or password is incorrect';
          } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'This account has been disabled. Please contact administrator.';
          }

          this.loginError = errorMessage;
        } finally {
          this.loading = false;
        }
      }
    },
    onForgotPassword() {
      this.showForgotPasswordDialog = true
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
/* Main Layout */
.split-login {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Left Panel - Form Side */
.left-panel {
  flex: 1;

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

/* Right Panel - Image Side */
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
  background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%);
  z-index: 1;
}

/* Logo Animation */
.brand-image {
  max-width: 400px;
  height: auto;
  z-index: 2;
  position: relative;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
}

.animate-logo {
  animation: logoSlideUp 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  transform: translateY(100px);
  opacity: 0;
}

@keyframes logoSlideUp {
  0% {
    transform: translateY(100px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Login Card */
.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 3;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.animate-form {
  animation: formSlideIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s forwards;
  transform: translateX(-50px);
  opacity: 0;
}

@keyframes formSlideIn {
  0% {
    transform: translateX(-50px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Title Animations */
.login-title {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #333 0%, #000 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.animate-title {
  animation: titleFadeIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes titleFadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-subtitle {
  animation: subtitleFadeIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.7s forwards;
  opacity: 0;
  transform: translateY(20px);
  color: #666;
  font-size: 1rem;
  margin-bottom: 2rem;
}

@keyframes subtitleFadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Form Fields */
.animate-form-fields {
  animation: formFieldsSlideIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.9s forwards;
  opacity: 0;
  transform: translateY(30px);
}

@keyframes formFieldsSlideIn {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-input {
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.custom-input .v-field {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.custom-input:hover .v-field {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.animate-input {
  animation: inputFadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  opacity: 0;
  transform: translateY(20px);
}

.animate-input:nth-child(1) {
  animation-delay: 1.1s;
}

.animate-input:nth-child(2) {
  animation-delay: 1.3s;
}

@keyframes inputFadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Forgot Password */
.forgot-password {
  text-align: left;
  margin-top: -10px;
  margin-bottom: 1rem;
}

.animate-forgot {
  animation: forgotFadeIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.5s forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes forgotFadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.forgot-password a {
  font-size: 0.9rem;
  color: #666;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.forgot-password a:hover {
  color: #000;
  text-decoration: none;
}

.forgot-password a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: #000;
  transition: width 0.3s ease;
}

.forgot-password a:hover::after {
  width: 100%;
}

/* Login Button */
.custom-btn {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #000 0%, #333 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 3;
  min-width: 280px;
  position: relative;
  overflow: hidden;
}

.custom-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.custom-btn:hover::before {
  left: 100%;
}

.custom-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.custom-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #333 0%, #000 100%);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.animate-button {
  animation: buttonSlideIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.7s forwards;
  opacity: 0;
  transform: translateY(30px);
}

@keyframes buttonSlideIn {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .split-login {
    flex-direction: column;
  }
  
  .right-panel {
    display: none;
  }
  
  .left-panel {
    padding: 1rem;
  }
  
  .login-card {
    padding: 2rem;
    max-width: 100%;
  }
  
  .brand-image {
    max-width: 300px;
  }
}

/* Loading State */
.custom-btn:disabled {
  background: linear-gradient(135deg, #666 0%, #999 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Focus States */
.custom-input .v-field--focused {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
</style>
