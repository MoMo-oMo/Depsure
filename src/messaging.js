import { isSupported, getMessaging, getToken, onMessage } from 'firebase/messaging'
import { firebaseApp, db, auth } from '@/firebaseConfig'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'

const VAPID_KEY = import.meta?.env?.VITE_FCM_VAPID_KEY || ''

let _messagingInitDone = false

export async function initMessaging (explicitUid) {
  try {
    const supported = await isSupported().catch((e) => { console.warn('FCM support check failed', e); return false })
    console.info('[FCM] supported:', supported)
    if (!supported) return { supported: false }
    if (!VAPID_KEY) {
      console.warn('[FCM] VAPID key missing (VITE_FCM_VAPID_KEY). Skipping push setup.')
      return { supported: true, configured: false }
    }

    // Register service worker (must be at root)
    let reg
    try {
      reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      console.info('[FCM] service worker registered')
    } catch (e) {
      console.error('[FCM] service worker registration failed', e)
      return { supported: true, configured: false, error: e }
    }

    // Request permission
    let perm
    try {
      perm = await Notification.requestPermission()
    } catch (e) {
      console.error('[FCM] Notification permission request failed', e)
      return { supported: true, configured: false, error: e }
    }
    console.info('[FCM] permission:', perm)
    if (perm !== 'granted') {
      console.warn('[FCM] Notifications permission not granted')
      return { supported: true, configured: false }
    }

    const messaging = getMessaging(firebaseApp)
    let token
    try {
      token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg })
    } catch (e) {
      console.error('[FCM] getToken failed', e)
      return { supported: true, configured: false, error: e }
    }
    console.info('[FCM] token present:', Boolean(token))

    if (token) {
      // Store token under user subcollection for easy fanout
      let uid = explicitUid || auth?.currentUser?.uid || ''
      if (!uid) {
        try {
          const raw = localStorage.getItem('userInfo')
          if (raw) uid = JSON.parse(raw)?.uid || ''
        } catch {}
      }
      if (!uid) {
        // Try Pinia store if available in active context
        try { uid = useAppStore().userId } catch {}
      }
      if (uid) {
        try {
          await setDoc(doc(db, 'users', uid, 'fcmTokens', token), {
            token,
            createdAt: serverTimestamp(),
            platform: navigator.platform || '',
            userAgent: navigator.userAgent || ''
          }, { merge: true })
          console.info('[FCM] token saved for user', uid)
          try {
            window.__fcmRegistered = true; localStorage.setItem('fcmRegistered', '1')
            if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
              window.dispatchEvent(new CustomEvent('fcm-registered'))
            }
          } catch {}
        } catch (e) {
          console.error('[FCM] failed to save token for user', uid, e)
        }
      } else {
        console.warn('[FCM] no UID resolved; token not stored')
      }
    }

    // Foreground handler
    if (!_messagingInitDone) {
      onMessage(messaging, (payload) => {
        console.info('[FCM] foreground message received', payload)
        try {
          const mid = payload?.data?.messageId || ''
          try {
            const last = localStorage.getItem('lastNotifiedMessageId')
            if (mid && last === mid) {
              console.info('[FCM] duplicate message suppressed', mid)
              return
            }
          } catch {}

          // Only surface a native notification if tab not focused/visible
          try {
            if (typeof document !== 'undefined') {
              const focused = typeof document.hasFocus === 'function' ? document.hasFocus() : (document.visibilityState === 'visible')
              if (focused) return
            }
          } catch {}

          const title = payload.notification?.title || 'New message'
          const body = payload.notification?.body || ''
          // Best effort: show a native notification in foreground too
          if (Notification.permission === 'granted') {
          const n = new Notification(title, { body, icon: '/favicon.ico', data: payload.data || {} })
            n.onclick = () => {
              window.focus?.()
              if (payload.data?.click_action) {
                const target = payload.data.click_action
                if (typeof window?.router?.push === 'function') {
                  window.router.push(target)
                } else {
                  window.location.assign(target)
                }
              }
            }
            try { if (mid) localStorage.setItem('lastNotifiedMessageId', mid) } catch {}
          }
        } catch (e) {
          console.warn('onMessage handler error', e)
        }
      })
      _messagingInitDone = true
    }

    return { supported: true, configured: true }
  } catch (e) {
    console.error('initMessaging error', e)
    return { supported: false, error: e }
  }
}
