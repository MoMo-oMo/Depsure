<template>
    <div v-if="visible" class="notification-overlay" @click.self="close">
      <div class="notification-dialog">
        <!-- colored card behind -->
        <div :class="['notification-dialog-bg', type]"></div>
        <!-- main white card -->
        <div class="notification-dialog-inner">
          <button class="notification-close" @click="close">&times;</button>
  
          <div :class="['notification-icon', type]">
            <v-icon v-if="type === 'success'">mdi-check</v-icon>
            <v-icon v-else-if="type === 'error'">mdi-close</v-icon>
          </div>
  
          <h2 class="notification-title">{{ title }}</h2>
          <p class="notification-message">{{ message }}</p>
          <button :class="['notification-button', type]" @click="close">
            {{ buttonText }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "NotificationDialog",
    props: {
      visible: {
        type: Boolean,
        required: true
      },
      type: {
        type: String,
        default: "success"
      },
      title: {
        type: String,
        required: true
      },
      message: {
        type: String,
        required: true
      },
      buttonText: {
        type: String,
        default: "OK"
      }
    },
    methods: {
      close() {
        this.$emit("update:visible", false);
        this.$emit("close");
      }
    }
  };
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
    width: 500px;               /* increased width */
    max-width: 90vw;            /* responsive fallback */
    min-height: 200px;          /* ensure adequate height */
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
  .notification-dialog-bg.success {
    background-color: #38a169;
  }
  .notification-dialog-bg.error {
    background-color: #e53e3e;
  }
  
  .notification-dialog-inner {
    position: relative;
    background: #ffffff;
    border-radius: 16px;
    padding: 32px;              /* increased padding */
    text-align: center;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  }
  
  .notification-close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: transparent;
    border: none;
    font-size: 24px;            /* larger close icon */
    cursor: pointer;
    line-height: 1;
  }
  
  .notification-icon {
    position: relative;
    margin: 0 auto 24px auto;  /* larger bottom margin */
    margin-top: -16%;
    width: 80px;                /* larger icon container */
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeInCircle 0.3s ease-out forwards;
  }
  .notification-icon.success {
    background-color: #38a169;
  }
  .notification-icon.error {
    background-color: #e53e3e;
  }
  .notification-icon .v-icon {
    font-size: 40px;            /* larger icon */
    color: #ffffff;
  }
  .notification-icon::before {
    content: '';
    position: absolute;
    width: 100px;               /* larger pulse */
    height: 100px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    opacity: 0.2;
    animation: pulse 2s ease-in-out infinite;
  }
  .notification-icon.success::before {
    background-color: #38a169;
  }
  .notification-icon.error::before {
    background-color: #e53e3e;
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
    font-size: 2em;             /* larger title font */
    margin: 0 0 12px 0;
  }
  
  .notification-message {
    font-size: 1.2em;           /* larger message font */
    margin: 0 0 32px 0;
  }
  
  .notification-button {
    border: none;
    border-radius: 8px;
    color: #ffffff;
    font-size: 1.1em;           /* slightly larger button text */
    padding: 12px 24px;         /* larger padding */
    cursor: pointer;
  }
  .notification-button.success {
    background-color: #38a169;
  }
  .notification-button.error {
    background-color: #e53e3e;
  }
  .notification-button:hover {
    opacity: 0.9;
  }
  </style>
  