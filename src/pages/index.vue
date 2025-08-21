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
            :disabled="!valid"
            @click="onSubmit"
          >
            Login
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
export default {
  data() {
    return {
      email: '',
      password: '',
      valid: false,
      showPassword: false,
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
    onSubmit() {
      this.$router.push('/dashbaaord')
    },
    onForgotPassword() {
      alert('Redirect to Forgot Password page')
    },
    onRegister() {
      alert('Redirect to Register page')
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
  padding: 12px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s;
  z-index: 3;
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
</style>
