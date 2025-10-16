<template>
  <!-- Overlay container following the requested structure -->
  <section class="container" style="z-index: 10000 !important;">
    <section class="sec__container">
      <div class="cookie__box" :class="[{ hide: !open, show: open }]">
        <img :src="imageUrl" alt="cookie">
        <div class="content">
          <h2>{{ title }}</h2>
          <p v-if="currentVersion" class="version-text">Version: {{ currentVersion }}</p>
          <p>{{ displayMessage }}</p>
          <div class="btn__group">
            <button class="accept__btn" @click="accept">Accept</button>
            <a v-if="policyUrl" :href="policyUrl" target="_blank" rel="noopener" class="learn__more-btn">Learn More</a>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<script>
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebaseConfig'

export default {
  name: 'ClearCookies',
  props: {
    brand: { type: String, default: '' },
    title: { type: String, default: 'Cookie Notice' },
    message: { type: String, default: "This site uses cookies because they're freshly baked & tasty." },
    policyUrl: { type: String, default: '' },
    imageUrl: { type: String, default: 'https://i.postimg.cc/mDLqkpv7/cookie.png' },
    checkVersion: { type: Boolean, default: true },
    showOnFirstVisit: { type: Boolean, default: true }
  },
  data() {
    return {
      open: false,
      currentVersion: '1.0.2'
    }
  },
  computed: {
    displayMessage() {
      if (this.currentVersion) {
        return 'A new version has been detected. Click Accept to clear cookies and cached data.'
      }
      return this.brand ? `${this.brand} uses cookies because they're freshly baked & tasty.` : this.message
    }
  },
  mounted() {
    this.evaluateConsent()
  },
  methods: {
    openConsentIfNeeded({ accepted, mismatch }) {
      if (!accepted && !mismatch && this.showOnFirstVisit) {
        this.open = true
      }
    },
    async evaluateConsent() {
      try {
        let accepted = false
        try { accepted = localStorage.getItem('cookieAccepted') === '1' } catch {}

        let mismatch = false
        let local = ''
        if (this.checkVersion) {
          const snap = await getDoc(doc(db, 'version', 'RfXRwpsn2XyZ1NMTcw9q'))
          const data = typeof snap.data === 'function' ? snap.data() : (snap && snap._document ? { version: snap.get('version') } : null)
          const remote = data && data.version
          console.log('Version Check - Remote:', remote)
          if (remote) {
            const remoteVersion = String(remote)
            const localVersion = this.currentVersion // This is '1.0.0' from data
            console.log('Version Check - Remote:', remoteVersion)
            console.log('Version Check - Local (data):', localVersion)
            
            // Compare remote version with local data version
            if (remoteVersion !== localVersion) {
              console.log('Version mismatch detected! Showing dialog')
              this.currentVersion = remoteVersion // Update currentVersion as indicator
              mismatch = true
              this.open = true
            } else {
              console.log('Versions match - no dialog needed')
            }
          } else {
            console.warn('No remote version found, falling back to consent flag only')
          }
        }

        if (!this.open) {
          this.openConsentIfNeeded({ accepted, mismatch })
        }
      } catch (e) {
        console.error('Consent/version evaluation failed:', e)
        try {
          const accepted = localStorage.getItem('cookieAccepted') === '1'
          if (!accepted && this.showOnFirstVisit) this.open = true
        } catch {}
      }
    },
    async checkRemoteVersion() {
      try {
        const snap = await getDoc(doc(db, 'version', 'RfXRwpsn2XyZ1NMTcw9q'))
        const data = typeof snap.data === 'function' ? snap.data() : (snap && snap._document ? { version: snap.get('version') } : null)
        const remote = data && data.version
        console.log('🔍 Version Check - Remote:', remote)
        if (!remote) {
          console.warn('No remote version found')
          return
        }
        this.currentVersion = String(remote)
        let local = ''
        // Compare remote version with local data version
        const remoteVersion = String(remote)
        const localVersion = this.currentVersion // This is '1.0.0' from data
        console.log('🔍 Version Check - Remote:', remoteVersion)
        console.log('🔍 Version Check - Local (data):', localVersion)
        if (remoteVersion !== localVersion) {
          console.log('⚠️ Version mismatch detected - showing dialog')
          this.currentVersion = remoteVersion // Update currentVersion as indicator
          this.open = true
        } else {
          console.log('✅ Versions match - no dialog needed')
        }
      } catch (e) {
        console.error('❌ Version check failed:', e)
      }
    },
    clearAllCookies() {
      try {
        document.cookie.split(';').forEach(c => {
          const eq = c.indexOf('=')
          const name = (eq > -1 ? c.substring(0, eq) : c).trim()
          if (!name) return
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
        })
      } catch {}
    },
    accept() {
      if (this.currentVersion) {
        // Clear everything for version update
        try { this.clearAllCookies() } catch {}
        try { sessionStorage.clear() } catch {}
        try { localStorage.clear() } catch {}
        // Don't store version in sessionStorage - always show dialog on mismatch
        try { localStorage.setItem('cookieAccepted', '1') } catch {}
        try { location.reload() } catch {}
      } else {
        // Regular cookie acceptance
        try { localStorage.setItem('cookieAccepted', '1') } catch {}
        this.open = false
      }
    }
  }
}
</script>

<style scoped>
/* Container and positioning to match requested look */
.container {
  position: fixed;
  inset: 0;
  max-width: 100vw;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: grid;
  place-items: start;
  pointer-events: none;
}
.sec__container {
  width: 100%;
  height: 100%;
  position: relative;
}

/* COOKIE CONSENT BOX */
.cookie__box {
  --clr-primary: var(--v-theme-primary, #c1610c);
  --clr-on-primary: var(--v-theme-on-primary, #ffffff);
  --clr-accent: var(--v-theme-secondary, #615f5f);
  --clr-surface: var(--v-theme-surface, #ffffff);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 16px;
  right: 16px;
  left: auto;
  max-width: 300px;
  width: 100%;
  border-radius: 15px;
  text-align: center;
  padding: 16px 16px 20px;
  background-color: white;
  pointer-events: auto;
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
  transform: translateX(480px);
  opacity: 0;
  /* High, but below dialog overlays (100000) */
  z-index: 9999999 !important;
}
.cookie__box.show {
  animation: slide-in-right 500ms ease-out forwards;
}
.cookie__box.hide {
  display: none;
}
.cookie__box > img {
  max-width: 64px;
  animation: slow-spin 24s linear infinite;
}
.cookie__box .content {
  margin-top: 10px;
}
.cookie__box .content h2 {
  font-size: 20px;
  font-weight: 700;
}
.cookie__box .content .version-text {
  font-size: 12px;
  font-weight: 600;
  margin: 4px 0 8px;
  color: var(--clr-primary);
}
.cookie__box .content p {
  font-size: 13px;
  margin: 4px 0 14px;
  color: var(--clr-accent);
}
.cookie__box .content .btn__group {
  display: flex;
  justify-content: center;
  align-items: center;
}
.cookie__box .content .btn__group * {
  margin: 0 6px;
}
.cookie__box .content .btn__group .accept__btn {
  padding: 8px 16px;
  outline: none;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid var(--clr-primary);
  color: white;
  background-color: black;
}
.cookie__box .content .btn__group .accept__btn:hover {
  background-color: transparent;
  color: var(--clr-primary);
}
.cookie__box .content .btn__group .learn__more-btn {
  text-decoration: none;
  color: var(--clr-primary);
}
.cookie__box .content .btn__group .learn__more-btn:hover {
  text-decoration: underline;
}

/* For medium devices */
@media screen and (max-width: 600px) {
  .cookie__box {
    right: 8px;
    bottom: 8px;
    padding: 12px 10px;
  }
}

/* For small devices */
@media screen and (max-width: 400px) {
  .cookie__box {
    max-width: 280px;
  }
  .cookie__box .content .btn__group {
    flex-direction: column;
    gap: 15px;
  }
}

/* For extra-small devices */
@media screen and (max-width: 320px) {
  .cookie__box {
    max-width: 260px;
  }
}

/* Animations */
@keyframes slow-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes slide-in-right { 0% { transform: translateX(480px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
</style>
