const admin = require('firebase-admin')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')
const logger = require('firebase-functions/logger')
const { onDocumentDeleted } = require('firebase-functions/v2/firestore')
const { onDocumentUpdated, onDocumentCreated } = require('firebase-functions/v2/firestore')

// Initialize the Admin SDK
admin.initializeApp()

// Gen 2 Firestore trigger: When a Firestore user document is deleted, delete the Auth user as well
exports.onUserDocDelete = onDocumentDeleted('users/{uid}', async event => {
  const { uid } = event.params || {}
  if (!uid) {
    logger.error('Missing uid param in onUserDocDelete event')
    return
  }
  try {
    await getAuth().deleteUser(uid)
    logger.info(`Deleted Auth user: ${uid}`)
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      logger.info(`Auth user not found for uid ${uid}, skipping.`)
      return
    }
    logger.error(`Failed to delete Auth user ${uid}`, { error })
    throw error
  }
})

// Helper: fetch FCM tokens for a list of userIds from both subcollection `fcmTokens` and array field `fcmTokens`
async function getUserTokens (userIds = []) {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return []
  }
  const db = getFirestore()
  const tokens = new Set()

  // Fetch tokens stored as array field on user document
  const userDocs = await db.getAll(...userIds.map(id => db.collection('users').doc(id)))
  for (const snap of userDocs) {
    const data = snap.exists ? snap.data() : null
    const arr = Array.isArray(data?.fcmTokens) ? data.fcmTokens : []
    for (const t of arr) {
      tokens.add(String(t))
    }
  }

  // Fetch tokens from subcollection `users/{uid}/fcmTokens/{token}`
  await Promise.all(userIds.map(async uid => {
    const snapshot = await db.collection('users').doc(uid).collection('fcmTokens').get()
    for (const doc of snapshot) {
      tokens.add(String(doc.id))
    }
  }))

  return Array.from(tokens).filter(Boolean)
}

// Firestore trigger: push notification on new chat message (array-based messages)
exports.onChatUpdatedSendPush = onDocumentUpdated('chats/{chatId}', async event => {
  try {
    const before = event.data?.before?.data() || {}
    const after = event.data?.after?.data() || {}

    const beforeLen = Array.isArray(before.messages) ? before.messages.length : 0
    const afterLen = Array.isArray(after.messages) ? after.messages.length : 0
    if (!(afterLen > beforeLen)) {
      // Not an appended message; ignore edits/deletes
      return
    }

    const last = Array.isArray(after.messages) ? after.messages.at(-1) : null
    if (!last || !last.text || !last.authorId) {
      return
    }

    const chatId = event.params.chatId
    const agencyId = after.agencyId || null

    // Determine recipient users (exclude author). Simpler and more robust:
    // - Always notify depsure staff (Super Admins + Admins of depsure scope)
    // - If chat has an agencyId, notify that agency account and any agency-scoped admins
    const db = getFirestore()
    const recipients = new Set()

    const staffSnap = await db.collection('users')
      .where('userType', 'in', ['Super Admin', 'Admin']).get()
    for (const doc of staffSnap) {
      const u = doc.data() || {}
      const isDepsure = u.userType === 'Super Admin' || (u.userType === 'Admin' && String(u.adminScope || '') === 'depsure')
      if (isDepsure && doc.id !== last.authorId) {
        recipients.add(doc.id)
      }
    }

    if (agencyId) {
      recipients.add(String(agencyId)) // agency main account
      try {
        const adminsSnap = await db.collection('users')
          .where('userType', '==', 'Admin')
          .where('adminScope', '==', 'agency')
          .get()
        for (const doc of adminsSnap) {
          const u = doc.data() || {}
          if (String(u.managedAgencyId || '') === String(agencyId) && doc.id !== last.authorId) {
            recipients.add(doc.id)
          }
        }
      } catch (error) {
        logger.warn('Agency admins query failed; falling back to all admins (may over-notify)', { error: String(error) })
        for (const doc of staffSnap) {
          const u = doc.data() || {}
          if (u.userType === 'Admin' && String(u.adminScope || '') === 'agency' && doc.id !== last.authorId) {
            recipients.add(doc.id)
          }
        }
      }
    }

    const userIds = Array.from(recipients)
    if (userIds.length === 0) {
      return
    }
    const tokens = await getUserTokens(userIds)
    if (tokens.length === 0) {
      return
    }

    const title = after.agencyName ? `Chat • ${after.agencyName}` : 'New chat message'
    const kind = last.type || (last.text ? 'text' : 'message')
    const textPreview = last.text ? String(last.text).slice(0, 120) : (kind === 'image' ? 'Photo' : 'New message')
    const body = `${last.authorName || 'Someone'}: ${textPreview}`

    const message = {
      notification: { title, body },
      data: {
        chatId: String(chatId),
        agencyId: String(agencyId || ''),
        click_action: '/chat',
      },
      webpush: {
        headers: {
          Urgency: 'high',
        },
        notification: {
          title,
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          requireInteraction: true,
          data: { click_action: '/chat' },
        },
        fcmOptions: {
          link: '/chat',
        },
      },
      android: {
        priority: 'high',
        notification: { clickAction: 'FLUTTER_NOTIFICATION_CLICK' },
      },
      tokens,
    }

    const resp = await admin.messaging().sendEachForMulticast(message)
    const successCount = resp.successCount || 0
    const failureCount = resp.failureCount || 0
    logger.info(`Chat push: sent ${successCount} ok, ${failureCount} failed to ${tokens.length} tokens (chat ${chatId})`)
  } catch (error) {
    logger.error('onChatUpdatedSendPush error', { error })
  }
})

// Firestore trigger: push notification when a new message doc is created
exports.onChatMessageCreatedSendPush = onDocumentCreated('chats/{chatId}/messages/{messageId}', async event => {
  try {
    const { chatId } = event.params || {}
    const msg = event.data?.data() || null
    if (!chatId || !msg) {
      return
    }

    const db = getFirestore()
    const chatSnap = await db.collection('chats').doc(chatId).get()
    const chat = chatSnap.exists ? chatSnap.data() : {}
    const agencyId = chat.agencyId || null

    // Collect recipients (exclude author)
    const recipients = new Set()
    const staffSnap = await db.collection('users').where('userType', 'in', ['Super Admin', 'Admin']).get()
    for (const doc of staffSnap) {
      const u = doc.data() || {}
      const isDepsure = u.userType === 'Super Admin' || (u.userType === 'Admin' && String(u.adminScope || '') === 'depsure')
      if (isDepsure && doc.id !== msg.authorId) {
        recipients.add(doc.id)
      }
    }
    if (agencyId) {
      recipients.add(String(agencyId))
      try {
        const adminsSnap = await db.collection('users')
          .where('userType', '==', 'Admin')
          .where('adminScope', '==', 'agency')
          .get()
        for (const doc of adminsSnap) {
          const u = doc.data() || {}
          if (String(u.managedAgencyId || '') === String(agencyId) && doc.id !== msg.authorId) {
            recipients.add(doc.id)
          }
        }
      } catch {}
    }

    const userIds = Array.from(recipients)
    if (userIds.length === 0) {
      return
    }
    const tokens = await getUserTokens(userIds)
    if (tokens.length === 0) {
      return
    }

    const title = chat.agencyName ? `Chat • ${chat.agencyName}` : 'New chat message'
    const kind = msg.type || (msg.text ? 'text' : 'message')
    const textPreview = msg.text ? String(msg.text).slice(0, 120) : (kind === 'image' ? 'Photo' : 'New message')
    const body = `${msg.authorName || 'Someone'}: ${textPreview}`

    const message = {
      notification: { title, body },
      data: {
        chatId: String(chatId),
        agencyId: String(agencyId || ''),
        click_action: '/chat',
        messageId: String(event.params.messageId || ''),
      },
      webpush: {
        headers: { Urgency: 'high' },
        notification: {
          title,
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          requireInteraction: true,
          data: { click_action: '/chat' },
        },
        fcmOptions: { link: '/chat' },
      },
      android: { priority: 'high', notification: { clickAction: 'FLUTTER_NOTIFICATION_CLICK' } },
      tokens,
    }

    const resp = await admin.messaging().sendEachForMulticast(message)
    logger.info(`Chat push (created): sent ${resp.successCount || 0} ok, ${resp.failureCount || 0} failed to ${tokens.length} tokens (chat ${chatId})`)

    // Update unread counters for recipients (low-cost single-doc increments)
    try {
      const db = getFirestore()
      const inc = admin.firestore.FieldValue.increment(1)
      const ts = admin.firestore.FieldValue.serverTimestamp()
      await Promise.all(userIds.map(uid => db.collection('unread').doc(uid).collection('chats').doc(chatId)
        .set({ count: inc, updatedAt: ts, agencyId: String(agencyId || ''), lastAuthor: msg.authorName || '', lastText: (msg.text || '').slice(0, 120) }, { merge: true })))
    } catch (error) {
      logger.warn('Failed to update unread counters', { error: String(error) })
    }
  } catch (error) {
    logger.error('onChatMessageCreatedSendPush error', { error })
  }
})
