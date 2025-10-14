<template>
  <div class="messenger-page" ref="pageRoot">
    <!-- Header -->
    <div class="header" >
      <div class="header-gradient">
        <div class="header-row">
          <v-btn icon variant="text" class="mr-1" @click="goBack" aria-label="Back">
            <v-icon color="white">mdi-arrow-left</v-icon>
          </v-btn>

          <!-- Contact / Agency -->
          <div class="header-user">
            <v-avatar size="44" class="avatar-ring">
              <img :src="chatAvatarUrl || fallbackAvatar" alt="Avatar" />
            </v-avatar>
            <div class="user-meta">
              <div class="name">
                <template v-if="isStaff && !selectedAgencyId">
                  <!-- Inline picker hint when no agency selected -->
                  <v-btn size="small" color="white" variant="text" class="pa-0 text-none" @click="openAgencyPicker = true">
                    Select Agency
                  </v-btn>
                </template>
                <template v-else>
                  {{ chatPartnerName }}
                </template>
              </div>
              <div class="status"><span class="dot" :class="isPartnerOnline ? 'online' : 'offline'"></span> {{ statusText }}</div>
            </div>
          </div>

          <div class="header-actions" style="margin-left:auto">
            <v-btn icon variant="text" @click="openHeaderMenu($event)" aria-label="Menu">
              <v-icon color="white">mdi-dots-vertical</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
      <div class="header-curve"></div>
    </div>

    <!-- Selection actions bar -->
    <div v-if="selectionMode" class="selection-bar">
      <div class="left">
        <v-btn icon variant="text" @click="clearSelection" aria-label="Close selection"><v-icon>mdi-close</v-icon></v-btn>
        <span class="sel-count">{{ selectionCount }} selected</span>
      </div>
      <div class="right">
          <v-btn
          size="small"
          variant="text"
          :disabled="!canBulkEdit"
          @click="beginEdit(singleSelected)"
        >
          <v-icon class="mr-1">mdi-pencil</v-icon> Edit
          </v-btn>
        
        <v-btn
          size="small"
          variant="text"
          color="#b91c1c"
          :disabled="!canBulkDelete"
          @click="deleteSelected"
        >
          <v-icon class="mr-1">mdi-delete</v-icon> Delete
        </v-btn>
      </div>
    </div>

    <!-- Chat scroll -->
    <div class="chat-scroll"  ref="chat">
      <template v-for="(m, idx) in normalizedMessages" :key="m._key">
        <!-- Day chip like WhatsApp: Today / Yesterday / date -->
        <div class="time-chip" v-if="shouldShowDate(idx)">{{ dateChipLabel(m) }}</div>

        <div
          class="msg-row"
          :class="[m.direction, { selecting: selectionMode && canEdit(m), 'drag-over': dragOverId === m.id }]"
          :style="rowStyle(m)"
          @click="onMessageClick(m, $event)"
          @dragover.prevent="onMessageDragOver(m)"
          @dragleave="onMessageDragLeave(m)"
          @drop="onDropOnMessage(m, $event)"
        >
          <!-- Selection checkbox - only show for messages that can be edited/deleted -->
          <div v-if="selectionMode && canEdit(m)" class="select-box" @click.stop="toggleSelect(m)">
            <input type="checkbox" :checked="isSelected(m)" aria-label="Select message" />
            </div>

          <!-- Deleted bubble -->
          <div v-if="m.deleted" class="bubble deleted-bubble" :class="m.direction">
            <span class="deleted-icon"><v-icon size="14" color="#94a3b8">mdi-clock-outline</v-icon></span>
            <span class="deleted-text">This message was deleted</span>
            <div class="bubble-meta">
              <span class="time">{{ m.time }}</span>
            </div>
              </div>

          <!-- Image bubble -->
          <div
            v-else-if="m.type === 'image'"
            class="bubble image-bubble"
            :class="m.direction"
            @contextmenu.prevent="openReactionPicker(m, $event)"
          >
            <!-- Sender name for incoming image messages -->
            <div 
              v-if="m.direction === 'incoming' && getSenderName(m)" 
              class="sender-name image-sender-name"
              :style="{ color: getSenderColor(getSenderName(m)) }"
            >
              {{ getSenderName(m) }}
              </div>

            <img :src="m.imageUrl" alt="image" class="message-image" @click.stop="openImagePreview(m.imageUrl)" />
            <div class="bubble-meta">
              <span v-if="m.edited" class="edited-inline">Edited</span>
              <span class="time">{{ m.time }}</span>
              <!-- Message status ticks for outgoing messages -->
              <div v-if="m.direction === 'outgoing'" class="message-status">
                <v-icon 
                  v-if="getMessageStatus(m) === 'sent'" 
                  size="12" 
                  color="rgba(255,255,255,0.6)"
                >
                  mdi-check
                </v-icon>
                <div v-else-if="getMessageStatus(m) === 'delivered'" class="double-ticks delivered">
                  <v-icon size="12" color="rgba(255,255,255,0.6)">mdi-check</v-icon>
                  <v-icon size="12" color="rgba(255,255,255,0.6)">mdi-check</v-icon>
                </div>
                <div v-else-if="getMessageStatus(m) === 'read'" class="double-ticks read">
                  <v-icon size="12" color="#4fc3f7">mdi-check</v-icon>
                  <v-icon size="12" color="#4fc3f7">mdi-check</v-icon>
                </div>
              </div>
            </div>
            <div v-if="m.reaction" class="reaction-under" :class="m.direction" @click="clearReaction(m)" title="Remove reaction">{{ m.reaction }}</div>
              </div>

          <!-- Text bubble (default) -->
          <div
            v-else
            class="bubble text-bubble"
            :class="m.direction"
            @contextmenu.prevent="openReactionPicker(m, $event)"
          >
            <!-- Sender name for incoming messages -->
            <div 
              v-if="m.direction === 'incoming' && getSenderName(m)" 
              class="sender-name"
              :style="{ color: getSenderColor(getSenderName(m)) }"
            >
              {{ getSenderName(m) }}
                  </div>
            
            <div v-if="m.replyTo" class="reply-quote" :class="m.direction">
              <div class="reply-bar"></div>
              <div class="reply-text">{{ quoteText(m.replyTo) }}</div>
                    </div>
            <div class="msg-text">{{ m.text }}</div>

            <div class="bubble-meta">
              <span v-if="m.edited" class="edited-inline">Edited</span>
              <span class="time">{{ m.time }}</span>
              <!-- Message status ticks for outgoing messages -->
              <div v-if="m.direction === 'outgoing'" class="message-status">
                <v-icon 
                  v-if="getMessageStatus(m) === 'sent'" 
                  size="12" 
                  color="rgba(255,255,255,0.6)"
                >
                  mdi-check
                </v-icon>
                <div v-else-if="getMessageStatus(m) === 'delivered'" class="double-ticks delivered">
                  <v-icon size="12" color="rgba(255,255,255,0.6)">mdi-check</v-icon>
                  <v-icon size="12" color="rgba(255,255,255,0.6)">mdi-check</v-icon>
                </div>
                <div v-else-if="getMessageStatus(m) === 'read'" class="double-ticks read">
                  <v-icon size="12" color="#4fc3f7">mdi-check</v-icon>
                  <v-icon size="12" color="#4fc3f7">mdi-check</v-icon>
                </div>
              </div>
                  </div>

            <div v-if="m.reaction" class="reaction-under" :class="m.direction" @click="clearReaction(m)" title="Remove reaction">{{ m.reaction }}</div>
                </div>

          <!-- Optional inline time (disabled; we keep time inside bubble) -->
          <div class="inline-time" v-if="false">{{ m.time }}</div>
        </div>
      </template>

      <!-- Typing indicator bubble (incoming) -->
      <div v-if="otherTyping" class="msg-row incoming">
        <div class="bubble text-bubble incoming typing-bubble">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
              </div>
            </div>

    <!-- Composer -->
    <div class="composer my-6" ref="composer">
      <div class="composer-inner">
      <!-- Reply preview -->
        <div v-if="editing && editing.active" class="edit-preview">
          <div class="edit-label">Editing</div>
          <div class="edit-text">{{ editing.originalText }}</div>
          <v-btn icon size="small" variant="text" @click="cancelEdit" aria-label="Cancel edit"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <div v-if="replyTo" class="reply-preview">
          <div class="reply-preview-bar"></div>
          <div class="reply-preview-text">Replying to: {{ quoteText(replyTo) }}</div>
          <v-btn icon size="small" variant="text" @click="dismissReply" aria-label="Cancel reply"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <!-- Contenteditable input (Shift+Enter = newline, Enter = send) -->
        <div
          class="input"
          ref="composerInput"
          contenteditable="true"
          tabindex="0"
          role="textbox"
          aria-label="Your message"
          placeholder="Your message"
          @focus="onInputFocus"
          @input="onComposerInput"
          @keydown="onComposerKeydown"
        ></div>

        <!-- Tools -->
        <div class="tools">
          <v-icon class="tool" @click="toggleEmojiPicker" aria-label="Emoji">mdi-emoticon-outline</v-icon>
          <v-icon class="tool" @click="triggerFileSelect" aria-label="Attach">mdi-paperclip</v-icon>
          <input ref="fileInput" type="file" class="hidden-file" multiple @change="onFilesSelected" />
          
        </div>

        <!-- Send -->
        <button class="send" @click="handleSend" aria-label="Send">
          <v-icon color="white">mdi-send</v-icon>
        </button>
      </div>

      <!-- Emoji picker -->
      <div v-if="showEmojiPicker" class="emoji-panel" @click.stop>
        <div class="emoji-tabs">
          <v-btn
            size="small"
            variant="text"
            :class="['emoji-tab', {active: emojiCategory==='recent'}]"
            @click.stop="setEmojiCategory('recent')"
          ><v-icon>mdi-clock-outline</v-icon></v-btn>
          <v-btn
            size="small"
            variant="text"
            :class="['emoji-tab', {active: emojiCategory==='faces'}]"
            @click.stop="setEmojiCategory('faces')"
          ><v-icon>mdi-emoticon-outline</v-icon></v-btn>
          <v-btn
            size="small"
            variant="text"
            :class="['emoji-tab', {active: emojiCategory==='hands'}]"
            @click.stop="setEmojiCategory('hands')"
          ><v-icon>mdi-hand-back-right-outline</v-icon></v-btn>
          <v-btn
            size="small"
            variant="text"
            :class="['emoji-tab', {active: emojiCategory==='symbols'}]"
            @click.stop="setEmojiCategory('symbols')"
          ><v-icon>mdi-heart-outline</v-icon></v-btn>
        </div>
        <div class="emoji-grid">
          <button
            v-for="e in getEmojiOptions()"
            :key="e"
            class="emoji-btn"
            @click.stop="insertEmoji(e)"
            :draggable="allowEmojiDrag"
            @dragstart="onEmojiDragStart($event, e)"
            @dragend="onEmojiDragEnd"
          >{{ e }}</button>
        </div>
      </div>
      
    </div>

    <!-- Reaction picker overlay -->
    <div v-if="reactionPicker && reactionPicker.show" class="reaction-panel" ref="reactionPanel" :style="reactionPanelStyle" @click.stop>
      <button v-for="e in safeReactionEmojis" :key="e" class="reaction-btn" @click.stop="selectReaction(e)">{{ e }}</button>
    </div>

    

    <!-- Image preview overlay (reserved for future image/file types) -->
    <div v-if="imagePreview.visible" class="img-overlay" @click="imagePreview.visible=false">
      <img :src="imagePreview.src" alt="image" class="img-full" />
    </div>

    <!-- Header actions menu -->
    <div v-if="headerMenu && headerMenu.show" class="msg-menu" :style="headerMenuStyle" @click.stop>
      <button class="menu-item" v-if="isStaff" @click.stop="openAgencyPicker = true; closeHeaderMenu()">Change agency</button>
      <button class="menu-item" @click.stop="enterSelection(); closeHeaderMenu()">Select messages</button>
      <button class="menu-item" @click.stop="scrollToBottom(); closeHeaderMenu()">Jump to bottom</button>
    </div>

    <!-- Click-away overlay for any open panels/menus -->
    <div v-if="isOverlayActive" class="click-away" @click="closeAllOverlays"></div>

    <!-- Upload overlay -->
    <div v-if="isUploading" class="upload-overlay" aria-live="polite" aria-busy="true">
      <div class="upload-box">
        <v-progress-circular indeterminate size="28" color="#000000"></v-progress-circular>
        <div class="upload-text">Uploading…</div>
      </div>
    </div>

    <!-- Agency picker dialog -->
    <v-dialog v-model="openAgencyPicker" max-width="520">
      <v-card>
        <v-card-title class="text-h6">Select Agency</v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="selectedAgencyId"
            :items="agencies"
            item-title="agencyName"
            item-value="id"
            :loading="agenciesLoading"
            label="Agency"
            prepend-inner-icon="mdi-domain"
                variant="outlined"
            hide-details="auto"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="openAgencyPicker = false">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" :disabled="!selectedAgencyId" @click="applyAgencySelection">
            Load chat
              </v-btn>
        </v-card-actions>
          </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { db } from '@/firebaseConfig'
import {
  collection,
  query,
  orderBy,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  serverTimestamp,
  deleteField
} from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAppStore } from '@/stores/app'
import { useCustomDialogs } from '@/composables/useCustomDialogs'

export default {
  name: 'ChatPage',
  beforeRouteLeave(to, from, next) {
    // Ensure overlays don’t trap clicks across route changes
    try {
      this.closeAllOverlays()
      this.selectionMode = false
      this.selected = {}
    } catch {}
    next()
  },
  data() {
    return {
      // Agency selection
      selectedAgencyId: null,
      agencies: [],
      agenciesLoading: false,
      openAgencyPicker: false,

      // UI state
      loading: false,
      sending: false,
      messages: [],              // Raw messages from Firestore (array on chat doc)
      newMessage: '',            // (unused for contenteditable; kept for parity)
      chatDocId: null,
      unsubscribe: null,

      // Header / contact fallback (if no logo)
      fallbackAvatar: 'https://firebasestorage.googleapis.com/v0/b/depsure-a9b61.firebasestorage.app/o/ChatGPT%20Image%20Aug%2025%2C%202025%2C%2009_03_46%20PM.png?alt=media&token=604bc334-793f-4c56-ad94-7e3c40d2357d',
      
      // Super Admin profile for support chat
      superAdminProfile: null,

      // Selection mode
      selectionMode: false,
      selected: {},

      // Overlays
      headerMenu: { show: false, x: 0, y: 0 },
      showEmojiPicker: false,
      emojiCategory: 'faces',
      recentEmojis: [],

      // Typing demo flags (no live presence on this backend)
      otherTyping: false,

      // Reply
      replyTo: null,

      // Upload / image preview stubs
      uploadingCount: 0,
      imagePreview: { visible: false, src: '' },

      // Editing state
      editing: { active: false, messageId: null, originalText: '' },

      // Reaction picker
      reactionPicker: { show: false, x: 0, y: 0, messageId: null },
      safeReactionEmojis: ['\u{1F44D}','\u2764\uFE0F','\u{1F602}','\u{1F62E}','\u{1F622}','\u{1F64F}'],

      // Drag & drop reactions
      draggingEmoji: false,
      dragOverId: null,

      // Layout cache
      _lastSafeGapPx: 0,
      _lastComposerHeightPx: 0,

      // Presence tracking
      presenceRealtimeEnabled: false,
      presence: {},
      presenceUnsub: null,
      presenceHeartbeat: null,
      _onVisibility: null,
      
    }
  },
  computed: {
    currentUserId() {
      const appStore = useAppStore()
      return appStore.currentUser?.uid
    },
    isAgencyUser() {
      const appStore = useAppStore()
      const user = appStore.currentUser
      return user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency')
    },
    isSuperAdmin() {
      const appStore = useAppStore()
      return appStore.currentUser?.userType === 'Super Admin'
    },
    isStaff() {
      const appStore = useAppStore()
      const user = appStore.currentUser
      return user?.userType === 'Super Admin' || (user?.userType === 'Admin' && user?.adminScope === 'depsure')
    },
    chatPartnerName() {
      if (this.isAgencyUser) return 'Depsure Support'
      const agency = this.agencies.find(a => a.id === this.selectedAgencyId)
      return agency ? agency.agencyName : '—'
    },
    chatAvatarUrl() {
      // Show the chat partner's avatar
      if (this.isAgencyUser) {
        // Agency users are chatting with Support (Super Admin side).
        // Try to get Super Admin avatar from messages first
        try {
          const arr = Array.isArray(this.messages) ? this.messages : []
          for (let i = arr.length - 1; i >= 0; i--) {
            const m = arr[i]
            if (m && String(m.authorId || '') !== String(this.currentUserId || '')) {
              if (m.authorAvatarUrl) return m.authorAvatarUrl
            }
          }
        } catch {}
        
        // If no message avatar found, try to get Super Admin profile from stored data
        if (this.superAdminProfile) {
          return this.superAdminProfile.profileImageUrl || this.superAdminProfile.profileImage || 'https://firebasestorage.googleapis.com/v0/b/depsure-a9b61.firebasestorage.app/o/ChatGPT%20Image%20Aug%2025%2C%202025%2C%2009_03_46%20PM.png?alt=media&token=604bc334-793f-4c56-ad94-7e3c40d2357d'
        }
        
        // Fallback to default support avatar
        return 'https://firebasestorage.googleapis.com/v0/b/depsure-a9b61.firebasestorage.app/o/ChatGPT%20Image%20Aug%2025%2C%202025%2C%2009_03_46%20PM.png?alt=media&token=604bc334-793f-4c56-ad94-7e3c40d2357d'
      }
      // Super Admin side: show the agency's profile/logo
      const agency = this.agencies.find(a => a.id === this.selectedAgencyId)
      return agency?.profileImageUrl || agency?.profileImage || agency?.logoUrl || 'https://firebasestorage.googleapis.com/v0/b/depsure-a9b61.firebasestorage.app/o/ChatGPT%20Image%20Aug%2025%2C%202025%2C%2009_03_46%20PM.png?alt=media&token=604bc334-793f-4c56-ad94-7e3c40d2357d'
    },
    // Identify likely partner id for presence
    partnerId() {
      try {
        if (this.isStaff) return this.selectedAgencyId || null
        const arr = Array.isArray(this.messages) ? this.messages : []
        for (let i = arr.length - 1; i >= 0; i--) {
          const m = arr[i]
          if (m && String(m.authorId || '') !== String(this.currentUserId || '')) {
            return String(m.authorId)
          }
        }
        return null
      } catch { return null }
    },
    statusText() {
      if (this.otherTyping) return 'typing…'
      return this.isPartnerOnline ? 'online' : 'offline'
    },
    isPartnerOnline() {
      try {
        // Heuristic: partner considered online if their last incoming message is recent
        const arr = Array.isArray(this.messages) ? this.messages : []
        let lastIncoming = 0
        for (let i = arr.length - 1; i >= 0; i--) {
          const m = arr[i]
          if (m && String(m.authorId || '') !== String(this.currentUserId || '')) {
            lastIncoming = this.asDate(m.timestamp).getTime()
            break
          }
        }
        const thresholdMs = 120000 // 2 minutes
        const heuristicOnline = !!lastIncoming && (Date.now() - lastIncoming) < thresholdMs
        // Also use a one-shot presence doc if available (no realtime required)
        const pid = this.partnerId
        const p = pid ? this.presence[pid] : null
        const presenceOnline = this.isPresenceOnline(p)
        return presenceOnline || heuristicOnline
      } catch { return false }
    },
    isUploading() {
      return (this.uploadingCount || 0) > 0
    },
    isOverlayActive() {
      return !!(this.showEmojiPicker || (this.headerMenu && this.headerMenu.show) || (this.reactionPicker && this.reactionPicker.show))
    },

    // Normalize array-based messages from the "chats" document to the UI model
    normalizedMessages() {
      const arr = Array.isArray(this.messages) ? this.messages.slice() : []
      const mapped = arr.map((m, idx) => {
        const d = this.asDate(m.timestamp)
        const dir = m.authorId === this.currentUserId ? 'outgoing' : 'incoming'
        return {
          _key: (m.id || `row_${idx}`),
          id: m.id || `row_${idx}`,
          direction: dir,
          type: m.type || 'text',
          text: m.text || '',
          imageUrl: m.imageUrl || null,
          deleted: !!m.deleted,
          edited: !!m.edited,
          reaction: m.reaction || null,
          replyTo: m.replyTo || null,
          createdAtMs: d.getTime(),
          time: this.formatTime(d)
        }
      })
      mapped.sort((a, b) => a.createdAtMs - b.createdAtMs)
      return mapped
    },

    selectionCount() {
      try { return Object.values(this.selected).filter(Boolean).length } catch { return 0 }
    },
    selectedMessages() {
      try {
        const ids = new Set(Object.keys(this.selected).filter(k => this.selected[k]))
        return this.normalizedMessages.filter(m => ids.has(String(m.id)))
      } catch { return [] }
    },
    canBulkDelete() {
      const arr = this.selectedMessages
      return arr.length > 0 && arr.every(m => m.direction === 'outgoing' && !m.deleted)
    },
    singleSelected() {
      return this.selectedMessages.length === 1 ? this.selectedMessages[0] : null
    },
    canBulkEdit() {
      const m = this.singleSelected
      return !!(m && m.direction === 'outgoing' && !m.deleted)
    },

    headerMenuStyle() {
      const top = Math.max(10, (this.headerMenu?.y || 0) + 8)
      const left = Math.max(10, (this.headerMenu?.x || 0) - 100)
      return { top: top + 'px', left: left + 'px' }
    },
    reactionPanelStyle() {
      let top = Math.max(10, (this.reactionPicker?.y || 0) - 56)
      // Start with a centered-ish guess
      let left = Math.max(10, (this.reactionPicker?.x || 0) - 100)
      try {
        const vw = (window && window.innerWidth) ? window.innerWidth : 1024
        const vh = (window && window.innerHeight) ? window.innerHeight : 768
        const rect = (this.$refs.reactionPanel && this.$refs.reactionPanel.getBoundingClientRect)
          ? this.$refs.reactionPanel.getBoundingClientRect()
          : { width: 220, height: 44 }
        const panelWidth = Math.ceil(rect.width)
        const panelHeight = Math.ceil(rect.height)
        const maxLeft = Math.max(10, vw - panelWidth - 10)
        left = Math.min(left, maxLeft)
        // vertical clamp
        const maxTop = Math.max(10, vh - panelHeight - 10)
        top = Math.min(top, maxTop)
      } catch {}
      return { top: top + 'px', left: left + 'px' }
    },
    // Disable drag on touch devices to ensure click works reliably
    allowEmojiDrag() {
      try {
        return !('ontouchstart' in window) && !((navigator && navigator.maxTouchPoints) > 0)
      } catch { return true }
    },
  },
  async mounted() {
    // Load recent emojis (optional)
    try {
      const saved = JSON.parse(localStorage.getItem('recentEmojis') || '[]')
      if (Array.isArray(saved)) this.recentEmojis = saved
    } catch {}
    // Wire composable (we're in Options API)
    const { showErrorDialog } = useCustomDialogs()
    this.showErrorDialog = showErrorDialog

    document.title = 'Chat - Depsure'
    await this.fetchAgencies()
    await this.fetchSuperAdminProfile()
    
    // Auto-select for agency users
    if (this.isAgencyUser) {
      const appStore = useAppStore()
      const user = appStore.currentUser
      this.selectedAgencyId = user.userType === 'Agency' ? user.uid : user.managedAgencyId
      await this.loadChat()
    } else {
      // For Super Admins, try global selection first or query param
      const appStore = useAppStore()
      const globalAgencyId = appStore.currentAgency?.id || null
      if (globalAgencyId) {
        this.selectedAgencyId = globalAgencyId
        await this.loadChat()
      } else if (this.$route?.query?.agencyId) {
        this.selectedAgencyId = this.$route.query.agencyId
        await this.loadChat()
      }
    }

    // Keep scrolled to bottom initially
    this.$nextTick(() => {
      this.scrollToBottom()
      this.updateSafeGaps()
      // Mark messages as read when chat loads
      this.markMessagesAsRead()
    })

    // Resize/orientation listeners to keep layout safe gaps correct
    this._onResize = () => this.updateSafeGaps()
    window.addEventListener('resize', this._onResize, { passive: true })
    window.addEventListener('orientationchange', this._onResize, { passive: true })

    // Presence: guarded by flag to avoid ongoing costs
    if (this.presenceRealtimeEnabled) {
      this.startPresence()
      this.subscribeToPartnerPresence()
    }
  },
  watch: {
    // Auto-scroll when new messages arrive
    messages(newVal, oldVal) {
      if ((oldVal?.length || 0) < (newVal?.length || 0)) {
        this.$nextTick(this.scrollToBottom)
      }
    },
    // Reload chat when agency changes (for Super Admin switching)
    selectedAgencyId(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.loadChat()
      }
    },
    partnerId() {
      this.fetchPartnerPresenceOnce()
      if (this.presenceRealtimeEnabled) this.subscribeToPartnerPresence()
    },
    showEmojiPicker() {
      this.$nextTick(() => {
        this.updateSafeGaps()
        this.scrollToBottom()
      })
    },
    replyTo() {
      this.$nextTick(this.updateSafeGaps)
    }
  },
  beforeUnmount() {
    if (this.unsubscribe) {
      try { this.unsubscribe() } catch {}
      this.unsubscribe = null
    }
    try {
      if (this._onResize) {
        window.removeEventListener('resize', this._onResize)
        window.removeEventListener('orientationchange', this._onResize)
      }
    } catch {}
    // Presence cleanup
    try { this.stopPresence() } catch {}
    try { if (this.presenceUnsub) { this.presenceUnsub(); this.presenceUnsub = null } } catch {}
  },
  methods: {
    /* =========================
       Composer text helpers
       ========================= */
    readComposerText() {
      try {
        const el = this.$refs.composerInput
        if (!el) return ''
        // Use textContent for better emoji support across browsers
        let txt = (el.textContent || '').replace(/\u00A0/g, ' ')
        // Remove zero‑width characters that can appear in contenteditable
        // Keep \u200D (ZWJ) so combined emojis like family/flags are preserved
        txt = txt.replace(/[\u200B\uFEFF]/g, '')
        return txt.trim()
      } catch { return '' }
    },
    clearComposer() {
      const el = this.$refs.composerInput
      if (el) el.innerHTML = ''
    },
    ensureCaretAtEnd(el) {
      try {
        if (!el) return
        const sel = window.getSelection && window.getSelection()
        if (!sel) return
        const range = document.createRange()
        range.selectNodeContents(el)
        range.collapse(false) // end
        sel.removeAllRanges()
        sel.addRange(range)
      } catch {}
    },
    /* =========================
       Backend: Agencies & Chat
       ========================= */
    async fetchAgencies() {
      this.agenciesLoading = true
      try {
        const appStore = useAppStore()
        const user = appStore.currentUser
        
        if (user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency')) {
          // Only own agency
          let agencyData = null
          if (user.userType === 'Agency') {
            const agencyDoc = await getDoc(doc(db, 'users', user.uid))
            if (agencyDoc.exists()) agencyData = { id: agencyDoc.id, ...agencyDoc.data() }
          } else if (user.managedAgencyId) {
            const agencyDoc = await getDoc(doc(db, 'users', user.managedAgencyId))
            if (agencyDoc.exists()) agencyData = { id: agencyDoc.id, ...agencyDoc.data() }
          }
          this.agencies = agencyData ? [agencyData] : []
        } else {
          // Super/Admin see all agencies
          const agenciesQuery = query(collection(db, 'users'), where('userType', '==', 'Agency'))
          const snapshot = await getDocs(agenciesQuery)
          this.agencies = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        }
      } catch (error) {
        console.error('Error fetching agencies:', error)
        this.showErrorDialog && this.showErrorDialog(`Failed to fetch agencies: ${error.message}`, 'Error', 'OK')
      } finally {
        this.agenciesLoading = false
      }
    },
    async fetchSuperAdminProfile() {
      if (!this.isAgencyUser) return
      
      try {
        // Query for Super Admin users
        const superAdminQuery = query(collection(db, 'users'), where('userType', '==', 'Super Admin'))
        const snapshot = await getDocs(superAdminQuery)
        
        if (!snapshot.empty) {
          // Get the first Super Admin found
          const superAdminDoc = snapshot.docs[0]
          this.superAdminProfile = { id: superAdminDoc.id, ...superAdminDoc.data() }
        }
      } catch (error) {
        console.error('Error fetching Super Admin profile:', error)
      }
    },
    applyAgencySelection() {
      if (this.selectedAgencyId) {
        this.openAgencyPicker = false
        this.loadChat()
      }
    },
    async loadChat() {
      if (!this.selectedAgencyId) return
      
      // Update global agency selection for Super Admins
      if (this.isStaff) {
        const appStore = useAppStore()
        const selectedAgency = this.agencies.find(a => a.id === this.selectedAgencyId)
        if (selectedAgency && appStore.setCurrentAgency) {
          appStore.setCurrentAgency(selectedAgency)
        }
      }
      
      this.loading = true
      try {
        // Unsubscribe previous
        if (this.unsubscribe) {
          try { this.unsubscribe() } catch {}
          this.unsubscribe = null
        }

        // Find or create chat document for this agency
        const chatQuery = query(collection(db, 'chats'), where('agencyId', '==', this.selectedAgencyId))
        const snapshot = await getDocs(chatQuery)
        
        if (snapshot.empty) {
          const selectedAgency = this.agencies.find(a => a.id === this.selectedAgencyId)
          const chatData = {
            agencyId: this.selectedAgencyId,
            agencyName: selectedAgency?.agencyName || '',
            createdAt: new Date(),
            updatedAt: new Date()
          }
          const chatRef = doc(collection(db, 'chats'))
          await setDoc(chatRef, chatData)
          this.chatDocId = chatRef.id
          this.messages = []
          // Presence (one-shot) on initial load
          this.fetchPartnerPresenceOnce()
        } else {
          this.chatDocId = snapshot.docs[0].id
          // One-time migration: drop legacy messages array if present to keep doc < 1MB
          try {
            const chatRef = doc(db, 'chats', this.chatDocId)
            const data = snapshot.docs[0].data() || {}
            if (Array.isArray(data.messages) && data.messages.length) {
              await updateDoc(chatRef, { messages: deleteField() })
            }
          } catch (e) { /* ignore */ }
          // Presence (one-shot)
          this.fetchPartnerPresenceOnce()
        }

        // Subscribe to messages subcollection ordered by timestamp
        const msgsCol = collection(db, 'chats', this.chatDocId, 'messages')
        const msgsQuery = query(msgsCol, orderBy('timestamp', 'asc'))
        this.unsubscribe = onSnapshot(msgsQuery, (snap) => {
          const list = []
          snap.forEach(d => {
            list.push({ ...d.data(), docId: d.id })
          })
          this.messages = list
          this.$nextTick(() => this.scrollToBottom())
          this.markMessagesAsRead()
        }, (error) => {
          console.error('Chat subscription error:', error)
          this.showErrorDialog && this.showErrorDialog(`Chat subscription failed: ${error.message}`, 'Error', 'OK')
        })
      } catch (error) {
        console.error('Error loading chat:', error)
        this.showErrorDialog && this.showErrorDialog(`Failed to load chat: ${error.message}`, 'Error', 'OK')
      } finally {
        this.loading = false
      }
    },

    /* =========================
       Sending / Deleting / Reply
       ========================= */
    async handleSend() {
      const text = this.readComposerText()
      if (!text || !this.chatDocId) return
      this.sending = true
      try {
        // If editing a message, update it instead of sending a new one
        if (this.editing && this.editing.active && this.editing.messageId) {
          const userId = String(this.currentUserId || '')
          const msgDoc = doc(db, 'chats', this.chatDocId, 'messages', String(this.editing.messageId))
          const msnap = await getDoc(msgDoc)
          if (msnap.exists()) {
            const data = msnap.data() || {}
            if (String(data.authorId || '') !== userId || data.deleted) {
              this.showErrorDialog && this.showErrorDialog('You can only edit your own messages.', 'Not allowed', 'OK')
            } else {
              await updateDoc(msgDoc, { text, edited: true, editedAt: new Date() })
              await updateDoc(doc(db, 'chats', this.chatDocId), { updatedAt: new Date() })
            }
          }
          // Clear editor state
          this.clearComposer()
          this.editing = { active: false, messageId: null, originalText: '' }
          this.replyTo = null
          this.scrollToBottom()
          this.$nextTick(this.updateSafeGaps)
          return
        }

        const appStore = useAppStore()
        const user = appStore.currentUser
        const isAgency = user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency')
        
        let authorName = 'Unknown User'
        if (isAgency) {
          authorName = user?.agencyName || 'Agency'
        } else {
          // For Super Admin and Admin users, use their name or email
          if (user?.userType === 'Super Admin') {
            authorName = user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user?.firstName || user?.lastName || user?.email || 'Super Admin'
          } else {
            authorName = user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user?.firstName || user?.lastName || user?.email || 'Admin'
          }
        }

        const message = {
          id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
          text,
          authorId: user.uid,
          authorName,
          authorType: user.userType,
          adminScope: user?.adminScope || '',
          authorAvatarUrl: user?.profileImageUrl || user?.profileImage || '',
          timestamp: new Date(),
          readBy: [user.uid],
          deleted: false,
          edited: false,
          // carry reply (optional)
          ...(this.replyTo ? { replyTo: this.buildReplyRef(this.replyTo) } : {})
        }

        await setDoc(doc(db, 'chats', this.chatDocId, 'messages', String(message.id)), message)
        try { await updateDoc(doc(db, 'chats', this.chatDocId), { updatedAt: new Date() }) } catch {}

        // clear composer + reply
        this.clearComposer()
        this.replyTo = null
        this.scrollToBottom()
        this.$nextTick(this.updateSafeGaps)

        // One-shot presence refresh for partner (cost-efficient)
        this.fetchPartnerPresenceOnce()
      } catch (error) {
        console.error('Error sending message:', error)
        this.showErrorDialog && this.showErrorDialog('Failed to send message. Please try again.', 'Error', 'OK')
      } finally {
        this.sending = false
      }
    },
    canDelete(m) {
      return !!m && m.direction === 'outgoing' && !m.deleted
    },
    async deleteSelected() {
      const toDelete = this.selectedMessages
      if (!toDelete.length || !this.chatDocId) return
      try {
        const ids = new Set(toDelete.map(m => String(m.id)))
        const userId = String(this.currentUserId || '')
        const batchOps = []
        for (const mid of ids) {
          const msgDoc = doc(db, 'chats', this.chatDocId, 'messages', mid)
          const msnap = await getDoc(msgDoc)
          if (msnap.exists()) {
            const data = msnap.data() || {}
            if (String(data.authorId || '') === userId && !data.deleted) {
              batchOps.push(updateDoc(msgDoc, { deleted: true, deletedAt: new Date() }))
            } else if (String(data.authorId || '') !== userId) {
              console.warn('Delete attempt blocked for message', mid)
            }
          }
        }
        if (!batchOps.length) {
          this.showErrorDialog && this.showErrorDialog('You can only delete your own messages.', 'Not allowed', 'OK')
        } else {
          await Promise.all(batchOps)
          await updateDoc(doc(db, 'chats', this.chatDocId), { updatedAt: new Date() })
        }
        this.selectionMode = false
        this.selected = {}
      } catch (e) {
        console.error('Bulk delete failed', e)
        this.showErrorDialog && this.showErrorDialog('Failed to delete selected messages.', 'Error', 'OK')
      }
    },
    triggerReply(m) {
      this.replyTo = m
      this.$nextTick(this.scrollToBottom)
    },
    dismissReply() { this.replyTo = null; this.$nextTick(this.updateSafeGaps) },
    buildReplyRef(m) {
      if (!m) return null
      const ref = { id: m.id, type: m.type || 'text' }
      if (ref.type === 'text') ref.text = (m.text || '').slice(0, 200)
      return ref
    },
    quoteText(m) {
      try {
        if (!m) return ''
        if (typeof m === 'object') {
          if (m.text) return String(m.text).slice(0, 200)
          if (m.type && m.type !== 'text') {
            if (m.type === 'image') return 'Photo'
            if (m.type === 'pdf') return m.fileName ? `PDF · ${m.fileName}` : 'PDF document'
            if (m.type === 'file') return m.fileName ? `File · ${m.fileName}` : 'File'
            if (m.type === 'audio') return 'Voice message'
            return String(m.type)
          }
        }
        return String(m).slice(0, 200)
      } catch { return '' }
    },
    getSenderName(message) {
      try {
        // Find the original message data from the messages array
        const originalMessage = this.messages.find(m => {
          if (m.id === message.id) return true
          if (m.timestamp && message.createdAtMs) {
            const messageTime = this.asDate(m.timestamp).getTime()
            return Math.abs(messageTime - message.createdAtMs) < 1000 // Within 1 second
          }
          return false
        })
        
        if (originalMessage && originalMessage.authorName) {
          return originalMessage.authorName
        }
        
        // Fallback: if we can't find the original message, try to get name from current user context
        if (message.direction === 'incoming') {
          return this.chatPartnerName || 'Unknown User'
        }
        
        return null
      } catch {
        return null
      }
    },
    getSenderColor(senderName) {
      if (!senderName) return '#64748b'
      
      // Create a consistent color based on the sender name
      const colors = [
        '#ff6b35', // Orange (like Jeff in the image)
        '#6FB02B', // Green (like Nicole in the image)
        '#1f77b4', // Blue
        '#ff7f0e', // Dark orange
        '#2ca02c', // Dark green
        '#d62728', // Red
        '#9467bd', // Purple
        '#8c564b', // Brown
        '#e377c2', // Pink
        '#7f7f7f', // Gray
        '#bcbd22', // Olive
        '#17becf'  // Cyan
      ]
      
      // Generate a consistent hash from the sender name
      let hash = 0
      for (let i = 0; i < senderName.length; i++) {
        hash = ((hash << 5) - hash + senderName.charCodeAt(i)) & 0xffffffff
      }
      
      // Use absolute value and modulo to get a consistent index
      const index = Math.abs(hash) % colors.length
      return colors[index]
    },
    getMessageStatus(message) {
      // Only show status for outgoing messages
      if (message.direction !== 'outgoing') return null
      
      // Find the original message data from the messages array
      const originalMessage = this.messages.find(m => {
        if (m.id === message.id) return true
        if (m.timestamp && message.createdAtMs) {
          const messageTime = this.asDate(m.timestamp).getTime()
          return Math.abs(messageTime - message.createdAtMs) < 1000 // Within 1 second
        }
        return false
      })
      
      if (!originalMessage || !originalMessage.readBy) return 'sent'
      
      // Get the other user ID (the recipient)
      const otherUserId = this.getOtherUserId()
      if (!otherUserId) return 'sent'
      
      // Check if the other user has read the message
      const isRead = originalMessage.readBy.includes(otherUserId)
      if (isRead) return 'read'
      
      // For now, assume delivered if not read (in a real app, you'd track delivery separately)
      return 'delivered'
    },
    getOtherUserId() {
      // Get the other user's ID in this chat
      if (this.selectedAgencyId && this.selectedAgencyId !== this.currentUserId) {
        return this.selectedAgencyId
      }
      
      // For agency chats, find any user who is not the current user
      const otherUser = this.messages.find(m => m.authorId !== this.currentUserId)
      return otherUser ? otherUser.authorId : null
    },
    async markMessagesAsRead() {
      if (!this.chatDocId || !this.currentUserId) return
      try {
        // Only mark read if the tab is focused/visible to the user
        try {
          if (typeof document !== 'undefined') {
            const focused = typeof document.hasFocus === 'function' ? document.hasFocus() : (document.visibilityState === 'visible')
            if (!focused) return
          }
        } catch {}

        const ops = []
        for (const m of (this.messages || [])) {
          if (!m || m.deleted) continue
          if (m.authorId === this.currentUserId) continue
          const rb = Array.isArray(m.readBy) ? m.readBy : []
          if (rb.includes(this.currentUserId)) continue
          const msgDoc = doc(db, 'chats', this.chatDocId, 'messages', String(m.id))
          ops.push(updateDoc(msgDoc, { readBy: arrayUnion(this.currentUserId) }))
        }
        if (ops.length) {
          await Promise.allSettled(ops)
          await this.clearUnreadCounter()
        }
      } catch (error) {
        console.error('Error marking messages as read:', error)
      }
    },
    async clearUnreadCounter() {
      try {
        const appStore = useAppStore()
        const uid = appStore.currentUser?.uid
        if (!uid || !this.chatDocId) return
        await setDoc(doc(db, 'unread', uid, 'chats', this.chatDocId), { count: 0, updatedAt: serverTimestamp() }, { merge: true })
      } catch {}
    },

    /* =========================
       UI & Input Helpers
       ========================= */
    onComposerInput() {
      // Could toggle typing presence here if you later add presence backend
      // Also re-measure composer height as content grows
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => this.updateSafeGaps())
      } else {
        this.$nextTick(this.updateSafeGaps)
      }
    },
    onComposerKeydown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.handleSend()
      }
    },
    onInputFocus() {
      setTimeout(() => {
        this.scrollToBottom()
        this.updateSafeGaps()
      }, 50)
    },
    onMessageClick(m, ev) {
      if (this.selectionMode && this.canEdit(m)) {
        this.toggleSelect(m)
        return
      }
      // Single-click to set reply
      this.triggerReply(m)
    },
    openHeaderMenu(ev) {
      const el = ev?.currentTarget
      if (el && el.getBoundingClientRect) {
        const r = el.getBoundingClientRect()
        this.headerMenu = { show: true, x: r.left + r.width / 2, y: r.bottom }
      } else {
        const x = ev?.clientX || 0
        const y = ev?.clientY || 0
        this.headerMenu = { show: true, x, y }
      }
    },
    closeHeaderMenu() { this.headerMenu = { show: false, x: 0, y: 0 } },
    closeAllOverlays() {
      this.showEmojiPicker = false
      this.reactionPicker = { show: false, x: 0, y: 0, messageId: null }
      this.headerMenu = { show: false, x: 0, y: 0 }
    },
    enterSelection(m) {
      this.selectionMode = true
      this.selected = m ? { [String(m.id)]: true } : {}
      this.closeAllOverlays()
    },
    clearSelection() {
      this.selectionMode = false
      this.selected = {}
    },
    isSelected(m) { return !!(m && this.selected[String(m.id)]) },
    toggleSelect(m) {
      if (!m) return
      const id = String(m.id)
      const next = !this.selected[id]
      this.selected = Object.assign({}, this.selected, { [id]: next })
      if (Object.values(this.selected).every(v => !v)) this.selectionMode = false
    },
    rowStyle(m) {
      const needsUnder = !!(m && m.reaction)
      const mb = needsUnder ? 26 : 0
      const tr = m && typeof m._offsetX === 'number' ? `translateX(${m._offsetX}px)` : undefined
      return { position: 'relative', marginBottom: mb ? mb + 'px' : undefined, transform: tr }
    },

    /* =========================
       Drag & Drop Reactions
       ========================= */
    onEmojiDragStart(ev, emoji) {
      try {
        ev.dataTransfer?.setData('application/x-emoji', emoji)
        ev.dataTransfer?.setData('text/plain', emoji)
        if (ev.dataTransfer) ev.dataTransfer.effectAllowed = 'copy'
      } catch {}
      this.draggingEmoji = true
    },
    onEmojiDragEnd() {
      this.draggingEmoji = false
      this.dragOverId = null
    },
    onMessageDragOver(m) {
      this.dragOverId = m?.id || null
    },
    onMessageDragLeave(m) {
      if ((m?.id || null) === this.dragOverId) this.dragOverId = null
    },
    async onDropOnMessage(m, ev) {
      try {
        const emoji = ev.dataTransfer?.getData('application/x-emoji') || ev.dataTransfer?.getData('text/plain') || ''
        this.draggingEmoji = false
        this.dragOverId = null
        if (!emoji || !m?.id) return
        await this.setMessageReaction(String(m.id), emoji)
      } catch {}
    },
    async setMessageReaction(messageId, emoji) {
      if (!this.chatDocId || !messageId) return
      try {
        const msgDoc = doc(db, 'chats', this.chatDocId, 'messages', String(messageId))
        await updateDoc(msgDoc, { reaction: emoji, reactedAt: new Date() })
        try { await updateDoc(doc(db, 'chats', this.chatDocId), { updatedAt: new Date() }) } catch {}
      } catch (e) { console.error('Set reaction failed', e) }
    },
    async clearReaction(m) {
      if (!m?.id || !this.chatDocId) return
      try {
        const msgDoc = doc(db, 'chats', this.chatDocId, 'messages', String(m.id))
        await updateDoc(msgDoc, { reaction: deleteField() })
        try { await updateDoc(doc(db, 'chats', this.chatDocId), { updatedAt: new Date() }) } catch {}
      } catch (e) { console.error('Clear reaction failed', e) }
    },

    /* =========================
       Layout safe gaps (composer/emoji)
       ========================= */
    updateSafeGaps() {
      try {
        const root = this.$refs.pageRoot
        if (!root) return
        const comp = this.$refs.composer
        const composerHeight = comp?.getBoundingClientRect?.().height || 108
        // Measure header height so content sits below fixed header
        try {
          const headerEl = root.querySelector && root.querySelector('.header')
          const hh = headerEl?.getBoundingClientRect?.().height || 96
          root.style.setProperty('--header-height', Math.round(hh) + 'px')
        } catch {}
        // Include bottom margin (e.g., from utility class like my-6)
        let composerMarginBottom = 0
        try {
          const cs = comp && window.getComputedStyle ? window.getComputedStyle(comp) : null
          composerMarginBottom = cs ? parseFloat(cs.marginBottom || '0') : 0
          if (Number.isNaN(composerMarginBottom)) composerMarginBottom = 0
        } catch {}

        // If emoji panel is visible, include its height so bottom messages are not hidden
        let panelExtra = 0
        if (this.showEmojiPicker) {
          const panelEl = comp?.querySelector?.('.emoji-panel')
          if (panelEl && panelEl.getBoundingClientRect) {
            panelExtra = panelEl.getBoundingClientRect().height + 12
          } else {
            panelExtra = 220 // sensible fallback
          }
        }
        // Small safety pad so content never sits flush
        const safetyPad = 20

        // Expose variables to CSS
        root.style.setProperty('--composer-height', composerHeight + 'px')
        // Compute numeric gap (without env()) to detect change and auto-scroll
        const safeGapPx = Math.round(composerHeight + composerMarginBottom + panelExtra + safetyPad)
        // Include safe-area inset so click-away overlay leaves room for emoji panel too
        const gapCalc = `calc(${composerHeight}px + ${composerMarginBottom}px + ${panelExtra}px + ${safetyPad}px + env(safe-area-inset-bottom))`
        root.style.setProperty('--composer-safe-gap', gapCalc)

        // Apply the same bottom padding directly to the scroll container for robustness (iOS quirks)
        try {
          const chatEl = this.$refs.chat
          if (chatEl && chatEl.style) {
            chatEl.style.paddingBottom = gapCalc
          }
        } catch {}

        // If gap changed and user is near the bottom, keep view pinned to bottom
        if (Math.abs(safeGapPx - (this._lastSafeGapPx || 0)) > 1) {
          const pinned = this.isNearBottom()
          this._lastSafeGapPx = safeGapPx
          this._lastComposerHeightPx = Math.round(composerHeight)
          if (pinned) {
            if (typeof requestAnimationFrame !== 'undefined') {
              requestAnimationFrame(() => this.scrollToBottom())
            } else {
              this.$nextTick(this.scrollToBottom)
            }
          }
        }
      } catch {}
    },

    // Detect if the chat is close to bottom so we can pin
    isNearBottom() {
      try {
        const el = this.$refs.chat
        if (!el) return true
        return (el.scrollHeight - el.scrollTop - el.clientHeight) < 64
      } catch { return true }
    },

    /* =========================
       Day Chips / Time
       ========================= */
    asDate(ts) {
      if (!ts) return new Date(0)
      return ts.toDate ? ts.toDate() : new Date(ts)
    },
    dateKeyFromMs(ms) {
      const d = new Date(ms || Date.now())
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    },
    msgDateKeyByIndex(idx) {
      const list = this.normalizedMessages
      if (!list[idx]) return ''
      return this.dateKeyFromMs(list[idx].createdAtMs)
    },
    shouldShowDate(idx) {
      const list = this.normalizedMessages
      if (!Array.isArray(list) || !list.length) return false
      if (idx === 0) return true
      const prevKey = this.msgDateKeyByIndex(idx - 1)
      const currKey = this.msgDateKeyByIndex(idx)
      return prevKey !== currKey
    },
    dateChipLabel(m) {
      const d = new Date(m.createdAtMs || Date.now())
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)
      const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
      if (sameDay(d, today)) return 'Today'
      if (sameDay(d, yesterday)) return 'Yesterday'
      const opts = { weekday: 'short', month: 'short', day: 'numeric' }
      const base = d.toLocaleDateString(undefined, opts)
      if (d.getFullYear() !== today.getFullYear()) return `${base}, ${d.getFullYear()}`
      return base
    },
    formatTime(date) {
      const d = date instanceof Date ? date : new Date()
      let h = d.getHours()
      const m = String(d.getMinutes()).padStart(2, '0')
      const ampm = h >= 12 ? 'PM' : 'AM'
      h = h % 12
      if (h === 0) h = 12
      return `${String(h).padStart(2,'0')}:${m} ${ampm}`
    },

    /* =========================
       Scrolling
       ========================= */
    scrollToBottom() {
      const el = this.$refs.chat
      if (el) el.scrollTop = el.scrollHeight
      
      // Mark messages as read when user scrolls to bottom
      this.markMessagesAsRead()
    },

    /* =========================
       Presence (online/offline)
       ========================= */
    startPresence() {
      if (!this.presenceRealtimeEnabled) return
      try {
        const uid = String(this.currentUserId || '')
        if (!uid) return
        const appStore = useAppStore()
        const user = appStore.currentUser || {}
        const presenceRef = doc(db, 'presence', uid)
        setDoc(presenceRef, {
          state: 'online',
          lastActive: serverTimestamp(),
          userType: user.userType || null
        }, { merge: true }).catch(()=>{})

        // Optional heartbeat disabled to reduce costs

        this._onVisibility = () => {
          updateDoc(presenceRef, {
            state: document.visibilityState === 'visible' ? 'online' : 'away',
            lastActive: serverTimestamp()
          }).catch(()=>{})
        }
        document.addEventListener('visibilitychange', this._onVisibility)
      } catch {}
    },
    stopPresence() {
      if (!this.presenceRealtimeEnabled) return
      try {
        const uid = String(this.currentUserId || '')
        if (this._onVisibility) {
          document.removeEventListener('visibilitychange', this._onVisibility)
          this._onVisibility = null
        }
        // No heartbeat used
        if (uid) {
          const presenceRef = doc(db, 'presence', uid)
          updateDoc(presenceRef, { state: 'offline', lastActive: serverTimestamp() }).catch(()=>{})
        }
      } catch {}
    },
    subscribeToPartnerPresence() {
      if (!this.presenceRealtimeEnabled) return
      try {
        if (this.presenceUnsub) { this.presenceUnsub(); this.presenceUnsub = null }
        const pid = this.partnerId
        if (!pid) return
        this.presenceUnsub = onSnapshot(doc(db, 'presence', pid), (snap) => {
          const data = snap.data() || null
          if (this.$set) this.$set(this.presence, pid, data)
          else this.presence = { ...this.presence, [pid]: data }
        })
      } catch {}
    },
    async fetchPartnerPresenceOnce() {
      try {
        const pid = this.partnerId
        if (!pid) return
        const snap = await getDoc(doc(db, 'presence', pid))
        const data = snap.exists() ? snap.data() : null
        if (this.$set) this.$set(this.presence, pid, data)
        else this.presence = { ...this.presence, [pid]: data }
      } catch {}
    },
    isPresenceOnline(p) {
      try {
        if (!p) return false
        if (p.state === 'online') return true
        const d = this.asDate(p.lastActive)
        return (Date.now() - d.getTime()) < 90000
      } catch { return false }
    },

    /* =========================
       Emoji / Files / Mic (UI)
       ========================= */
    toggleEmojiPicker() {
      // Close other overlays so emoji panel isn't blocked
      this.headerMenu && this.closeHeaderMenu()
      this.reactionPicker = { show: false, x: 0, y: 0, messageId: null }
      this.showEmojiPicker = !this.showEmojiPicker
      this.$nextTick(this.updateSafeGaps)
    },

    /* =========================
       Reactions UI
       ========================= */
    openReactionPicker(m, ev) {
      if (!m) return
      const el = ev?.currentTarget
      if (el && el.getBoundingClientRect) {
        const r = el.getBoundingClientRect()
        this.reactionPicker = { show: true, x: r.left + r.width / 2, y: r.top, messageId: m.id }
      } else {
        const x = ev?.clientX || 0
        const y = ev?.clientY || 0
        this.reactionPicker = { show: true, x, y, messageId: m.id }
      }
    },
    async selectReaction(emoji) {
      try {
        const id = this.reactionPicker?.messageId
        this.reactionPicker = { show: false, x: 0, y: 0, messageId: null }
        if (!id) return
        await this.setMessageReaction(String(id), emoji)
      } catch {}
    },

    /* =========================
       Editing
       ========================= */
    canEdit(m) { return !!(m && m.direction === 'outgoing' && !m.deleted) },
    beginEdit(m) {
      if (!this.canEdit(m)) return
      this.editing = { active: true, messageId: m.id, originalText: m.text || '' }
      if (this.$refs.composerInput) {
        this.$refs.composerInput.innerText = m.text || ''
        this.$refs.composerInput.focus()
      }
      // Exit selection and close overlays to focus on editing
      this.selectionMode = false
      this.selected = {}
      this.closeAllOverlays()
    },
    cancelEdit() {
      this.editing = { active: false, messageId: null, originalText: '' }
      if (this.$refs.composerInput) this.$refs.composerInput.innerText = ''
    },
    
    setEmojiCategory(cat) { this.emojiCategory = cat },
    getEmojiOptions() {
      const faces = ['\u{1F600}','\u{1F603}','\u{1F604}','\u{1F601}','\u{1F606}','\u{1F605}','\u{1F923}','\u{1F602}','\u{1F642}','\u{1F609}','\u{1F60A}','\u{1F970}','\u{1F60D}','\u{1F618}','\u{1F617}','\u{1F61A}','\u{1F619}','\u{1F917}','\u{1F60F}','\u{1F60C}','\u{1F924}','\u{1F634}','\u{1F92A}','\u{1F61C}','\u{1F60E}','\u{1F914}','\u{1F62C}','\u{1F62E}','\u{1F62F}','\u{1F632}','\u{1F633}','\u{1F622}','\u{1F62D}','\u{1F621}','\u{1F92F}']
      const hands = ['\u{1F44D}','\u{1F44F}','\u{1F64F}','\u{1F91D}','\u{1F44C}','\u270C\uFE0F','\u{1F91E}','\u{1F91F}','\u{1F90C}','\u{1F44B}','\u{1FAF6}','\u{1F44A}','\u{1F932}','\u{1F4AA}','\u{1F590}\uFE0F']
      const symbols = ['\u2764\uFE0F','\u{1F9E1}','\u{1F49B}','\u{1F49A}','\u{1F499}','\u{1F49C}','\u{1F90D}','\u{1F90E}','\u{1F5A4}','\u{1F494}','\u2728','\u{1F525}','\u{1F389}','\u{1F4AF}','\u2B50','\u26A1','\u2600\uFE0F','\u{1F319}']
      if (this.emojiCategory === 'recent' && this.recentEmojis.length) return this.recentEmojis
      if (this.emojiCategory === 'hands') return hands
      if (this.emojiCategory === 'symbols') return symbols
      return faces
    },
    insertEmoji(e) {
      const el = this.$refs.composerInput
      if (!el) return
      // Move focus and caret into composer at end
      el.focus()
      this.ensureCaretAtEnd(el)
      // Try execCommand for broad browser support (esp. iOS Safari)
      let inserted = false
      try {
        if (document.execCommand) {
          inserted = document.execCommand('insertText', false, e)
        }
      } catch { inserted = false }
      // Fallback: manual range insert or append
      if (!inserted) {
        try {
          const sel = window.getSelection && window.getSelection()
          if (sel && sel.rangeCount) {
            const range = sel.getRangeAt(0)
            range.deleteContents()
            range.insertNode(document.createTextNode(e))
            range.collapse(false)
            sel.removeAllRanges()
            sel.addRange(range)
            inserted = true
          }
        } catch {}
      }
      if (!inserted) {
        el.appendChild(document.createTextNode(e))
      }
      // If mobile focus delay prevented insertion, re-attempt shortly
      if (!inserted) {
        setTimeout(() => {
          try {
            el.focus(); this.ensureCaretAtEnd(el)
            if (document.execCommand) document.execCommand('insertText', false, e)
            else el.appendChild(document.createTextNode(e))
            el.dispatchEvent(new Event('input', { bubbles: true }))
          } catch {}
        }, 0)
      }
      // Fire input event so any listeners react and UI remeasures
      try { el.dispatchEvent(new Event('input', { bubbles: true })) } catch {}
      // Recompute layout
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => this.updateSafeGaps())
      } else {
        this.$nextTick(this.updateSafeGaps)
      }
      // Track recents (simple)
      try {
        const set = new Set(this.recentEmojis)
        set.delete(e)
        const next = [e, ...this.recentEmojis.filter(x => x !== e)]
        this.recentEmojis = next.slice(0, 30)
        localStorage.setItem('recentEmojis', JSON.stringify(this.recentEmojis))
      } catch {}
      // Keep the emoji panel open so multiple emojis can be selected
      this.$nextTick(this.updateSafeGaps)
    },
    triggerFileSelect() {
      this.showEmojiPicker = false
      if (this.$refs.fileInput) this.$refs.fileInput.click()
    },
    async onFilesSelected(ev) {
      try {
        const files = Array.from(ev?.target?.files || [])
        ev.target.value = ''
        if (!files.length || !this.chatDocId) return
        const storage = getStorage()
        const appStore = useAppStore()
        const user = appStore.currentUser

        for (const file of files) {
          if (!file || !file.type || !file.type.startsWith('image/')) {
            this.showErrorDialog && this.showErrorDialog('Only image uploads are supported right now.', 'Not supported', 'OK')
            continue
          }
          this.uploadingCount++
          try {
            const safeName = (file.name || 'image').replace(/[^a-zA-Z0-9_.-]/g, '_')
            const path = `chat_uploads/${this.chatDocId}/${Date.now()}_${Math.random().toString(36).slice(2,8)}_${safeName}`
            const sref = storageRef(storage, path)
            await uploadBytes(sref, file, { contentType: file.type })
            const url = await getDownloadURL(sref)

            // Build image message
            const message = {
              id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
              type: 'image',
              imageUrl: url,
              text: '',
              authorId: user.uid,
              authorName: (user?.userType === 'Agency') ? (user?.agencyName || 'Agency') : (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.firstName || user?.lastName || user?.email || 'Admin')),
              authorType: user.userType,
              authorAvatarUrl: user?.profileImageUrl || user?.profileImage || '',
              timestamp: new Date(),
              readBy: [user.uid],
              deleted: false,
              edited: false,
              ...(this.replyTo ? { replyTo: this.buildReplyRef(this.replyTo) } : {})
            }

            await setDoc(doc(db, 'chats', this.chatDocId, 'messages', String(message.id)), message)
            await updateDoc(doc(db, 'chats', this.chatDocId), { updatedAt: new Date() })
          } catch (e) {
            console.error('Image upload failed', e)
            this.showErrorDialog && this.showErrorDialog('Failed to upload image. Please try again.', 'Upload error', 'OK')
          } finally {
            this.uploadingCount = Math.max(0, (this.uploadingCount || 1) - 1)
          }
        }
        this.replyTo = null
        this.$nextTick(() => { this.scrollToBottom(); this.updateSafeGaps() })
      } catch {
        try { ev.target.value = '' } catch {}
      }
    },
    openImagePreview(url) {
      if (!url) return
      this.imagePreview = { visible: true, src: url }
    },
    toggleMicDemo() {
      // Demo only (no MediaRecorder on this array backend in this version)
      this.replyTo = null
      const el = this.$refs.composerInput
      if (el) el.focus()
    },

    /* =========================
       Navigation
       ========================= */
    goBack() {
      const appStore = useAppStore()
      const user = appStore.currentUser
      const isAgency = user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency')
      if (isAgency) {
        this.$router.push('/onboard-units')
      } else {
        this.$router.push('/agencies')
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
* { font-family: 'Montserrat', sans-serif; }

.messenger-page {
  display: flex;
  flex-direction: column;
  /* Use dynamic viewport height to avoid mobile browser UI cutting content */
  height: 90vh; /* fallback */
  height: 90svh; /* better on some mobile browsers */
  height: 90dvh; /* dynamic on modern browsers */

  position: relative;
  /* spacing for fixed composer */
  --composer-safe-gap: calc(108px + env(safe-area-inset-bottom));
  --composer-height: 108px;
  --accent: #000000;
  /* heights for bars */
  --appbar-height: 64px;   /* used only for fixed overlays (e.g., selection bar) */
  --header-height: 96px;   /* messenger header */
  overflow-x: hidden;
  /* header is sticky; no manual top padding needed */
  padding-top: 0;
}

/* Full-page background image overlay (subtle) */
.messenger-page::before {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at 10% 10%, rgba(152, 201, 232, 0.08), transparent 40%),
              radial-gradient(circle at 90% 20%, rgba(111, 176, 43, 0.07), transparent 40%),
              radial-gradient(circle at 50% 80%, rgba(26, 151, 212, 0.06), transparent 40%);
  opacity: 1;
  pointer-events: none;
  z-index: 0;
}

/* Background image behind chat (50% opacity) */
.messenger-page::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url('@/assets/chat.png');
  /* Fewer tiles with spacing between them */
  background-size: 200px auto;
  background-position: top left;
  background-repeat: repeat;
  opacity: 0.1;
  pointer-events: none;
  z-index: 0;
}

/* Header */
.header {
  position: fixed;
  top: 100;
  left: var(--v-layout-left, 0px);
  right: var(--v-layout-right, 0px);
  z-index: 60;
}
.header-gradient {
  background: linear-gradient(135deg, #000000 0%, #111111 60%, #222222 100%);
  padding: 12px 12px 8px 12px;
  color: #fff;
}
.header-row { display: flex; align-items: center; justify-content: flex-start; gap: 10px; }
.header-user { display: flex; align-items: center; gap: 10px; }
.avatar-ring { border: 2px solid rgba(255,255,255,0.7); }
.avatar-ring > img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block; }
.user-meta { line-height: 1.1; }
.name { font-weight: 700; font-size: 16px; }
.status { font-size: 12px; opacity: 0.95; display: flex; align-items: center; gap: 6px; }
.status .dot { width: 8px; height: 8px; background: #6FB02B; border-radius: 50%; display: inline-block; }
.status .dot.offline { background: #b91c1c; }
.status .dot.online { background: #6FB02B; }
.header-actions { display: flex; margin-left: auto; }
.header-curve {


  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
}

@media (max-width: 600px) {
  .messenger-page { --appbar-height: 56px; }
}

/* Chat list */
.chat-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  /* Leave room for fixed header */
  padding-top: calc(var(--header-height, 96px) + 8px);
  padding-right: 16px;
  padding-bottom: var(--composer-safe-gap);
  padding-left: 16px;
  overflow-x: hidden;
  position: relative;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  touch-action: pan-y;
}

/* Time (day) chip */
.time-chip {
  margin: 8px auto 16px auto;
  width: fit-content;
  padding: 6px 12px;
  font-size: 12px;
  color: #64748b;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

/* Message row */
.msg-row { position: relative; z-index: 1; display: flex; gap: 8px; margin: 8px 0; align-items: flex-end; }
.msg-row.incoming { justify-content: flex-start; }
.msg-row.outgoing { justify-content: flex-end; }

/* Selection mode */
.selection-bar {
  position: fixed;
  z-index: 80;
  left: calc(var(--v-layout-left, 0px) + 12px);
  right: calc(var(--v-layout-right, 0px) + 12px);
  /* Below app bar and chat header */
  top: calc(var(--appbar-height) + var(--header-height, 96px) + 8px);
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}
.selection-bar .left { display: flex; align-items: center; gap: 6px; }
.selection-bar .right { display: flex; align-items: center; gap: 8px; }
.sel-count { font-weight: 600; color: #111827; font-size: 13px; }
.msg-row.selecting { padding-left: 34px; }
.select-box { position: absolute; left: 6px; top: 50%; transform: translateY(-50%); z-index: 5; display: grid; place-items: center; }
.select-box input { width: 18px; height: 18px; accent-color: var(--accent); cursor: pointer; }

/* Bubble base */
.bubble {
  max-width: 45%;
  border-radius: 8px;
  padding: 12px 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  position: relative;
  padding-bottom: 28px; /* extra space for time/meta */
  min-width: 120px;
}
/* Reserve horizontal space for time/edited */
.text-bubble { padding-right: 56px; }

/* Incoming / Outgoing */
.text-bubble.incoming { background: #ffffff; border: 1px solid #ecedf0; color: #111827; }
.text-bubble.outgoing { background: var(--accent); color: #fff; }

/* Sender name */
.sender-name {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  /* Color is now set dynamically via getSenderColor() method */
}

/* Sender name for images */
.image-sender-name {
  position: absolute;
  top: 8px;
  left: 12px;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
}

/* Message text */
.msg-text { white-space: pre-wrap; overflow-wrap: anywhere; }

/* Image bubble */
.image-bubble { padding: 0; background: transparent; border: none; box-shadow: none; }
.image-bubble.incoming { background: #ffffff; border: 1px solid #ecedf0; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border-radius: 8px; overflow: hidden; }
.image-bubble.outgoing { background: transparent; border: none; box-shadow: none; }
.message-image { display: block; max-width: min(320px, 86vw); height: auto; border-radius: 8px; }
.image-bubble.incoming .message-image { border-radius: 8px; }
.image-bubble .bubble-meta { position: absolute; right: 10px; bottom: 10px; }
.image-bubble .bubble-meta .time { color: #ffffff; text-shadow: 0 1px 2px rgba(0,0,0,0.6); }
.image-bubble.incoming .bubble-meta .time { color: #64748b; text-shadow: none; }

/* Quote */
.reply-quote { display: grid; grid-template-columns: 3px 1fr; gap: 8px; align-items: stretch; margin-bottom: 6px; }
.reply-quote .reply-bar { width: 3px; background: var(--accent); border-radius: 2px; }
.reply-quote .reply-text { font-size: 12px; opacity: 0.9; }

/* Meta (time inside bubble) */
.bubble-meta { position: absolute; right: 10px; bottom: 10px; font-size: 11px; line-height: 1; display: inline-flex; align-items: center; gap: 6px; }
.bubble-meta .time { opacity: 0.85; }
.edited-inline { font-size: 10px; color: rgba(255,255,255,0.9); }
.text-bubble.incoming .bubble-meta .time { color: #64748b; }
.text-bubble.incoming .edited-inline { color: #64748b; }
.text-bubble.outgoing .bubble-meta .time { color: rgba(255,255,255,0.9); }

/* Message status ticks */
.message-status { 
  display: inline-flex; 
  align-items: center; 
  margin-left: 4px; 
}
.double-ticks { 
  display: inline-flex; 
  align-items: center; 
  gap: -2px; 
  position: relative; 
}
.double-ticks .v-icon:last-child { 
  margin-left: -6px; 
}
.double-ticks.delivered .v-icon { 
  color: rgba(255,255,255,0.6) !important; 
}
.double-ticks.read .v-icon { 
  color: #4fc3f7 !important; 
}

/* Reaction under bubble */
.reaction-under { position: absolute; bottom: -22px; font-size: 12px; background: #ffffff; color: #0f172a; border: 1px solid #e5e7eb; border-radius: 999px; padding: 2px 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
.reaction-under.incoming { left: 6px; }
.reaction-under.outgoing { right: 10px; }

/* Deleted bubble */
.deleted-bubble { background: #f1f5f9; color: #64748b; border: 1px dashed #e2e8f0; display: flex; align-items: center; gap: 6px; }
.deleted-text { font-style: italic; font-size: 12px; }
.deleted-icon { width: 20px; height: 20px; border-radius: 999px; background: #e5e7eb; display: grid; place-items: center; }

/* Inline time (disabled) */
.inline-time { width: 100%; text-align: center; font-size: 11px; color: #94a3b8; margin-top: 4px; display: none; }

/* Typing indicator bubble */
.typing-bubble { display: inline-flex; align-items: center; gap: 4px; padding: 8px 10px; }
.typing-dot { width: 6px; height: 6px; background: #64748b; border-radius: 50%; display: inline-block; opacity: 0.6; animation: typingBlink 1.2s infinite ease-in-out; }
.typing-dot:nth-child(2) { animation-delay: 0.15s; }
.typing-dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes typingBlink { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4 } 40% { transform: translateY(-2px); opacity: 1 } }

/* Composer */
.composer {
  position: fixed;
  /* Align with Vuetify app layout (drawer/app-bar offsets) */
  left: var(--v-layout-left, 0px);
  right: var(--v-layout-right, 0px);
  bottom: 0;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom)) 12px;
  background: transparent;
  /* Raise above click-away overlay so emoji panel remains clickable */
  z-index: 70;
}
.composer-inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 10px 10px 10px 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}
.reply-preview { grid-column: 1 / -1; display: grid; grid-template-columns: 3px 1fr auto; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 6px 8px; }
.edit-preview { grid-column: 1 / -1; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 8px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 6px 10px; }
.edit-label { font-size: 12px; font-weight: 700; color: #111827; }
.edit-text { font-size: 12px; color: #374151; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.reply-preview-bar { width: 3px; background: var(--accent); height: 100%; border-radius: 2px; }
.reply-preview-text { font-size: 12px; color: #1f2937; }
.input {
  min-height: 24px;
  max-height: 160px;
  overflow-y: auto;
  outline: none;
  min-width: 0;
  max-width: 100%;
  display: block;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
  line-height: 1.35;
  padding: 6px 2px; /* extra bottom padding prevents last line cut-off */
  -webkit-overflow-scrolling: touch;
}
.input:empty:before { content: attr(placeholder); color: #9ca3af; }
.tools { display: flex; align-items: center; gap: 8px; }
.tool { color: #64748b; cursor: pointer; }
.send { width: 40px; height: 40px; border-radius: 999px; background: var(--accent); border: none; display: grid; place-items: center; cursor: pointer; }

/* Emoji panel */
.hidden-file { display: none; }
.emoji-panel {
  /* fixed so it doesn't clip inside the composer and stays fully visible */
  position: fixed;
  /* Respect layout offsets so it lines up with content area */
  left: calc(var(--v-layout-left, 0px) + 12px);
  right: calc(var(--v-layout-right, 0px) + 12px);
  bottom: calc(var(--composer-height) + 10px + env(safe-area-inset-bottom));
  z-index: 41;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}
.emoji-tabs { width: 100%; display: flex; gap: 6px; padding-bottom: 4px; border-bottom: 1px solid #f1f5f9; margin-bottom: 6px; }
.emoji-tab { min-width: 36px; height: 28px; border-radius: 8px; }
.emoji-tab.active { background: #EAF5FF !important; }
.emoji-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; width: 100%; max-height: 180px; overflow-y: auto; }
.emoji-btn { border: none; background: transparent; font-size: 22px; cursor: pointer; line-height: 1; padding: 6px; border-radius: 8px; }
.emoji-btn:hover { background: #f1f5f9; }
/* Allow selecting/copying emoji character */
.emoji-btn { -webkit-user-select: text; user-select: text; }

/* Bubble ellipsis removed per design */

/* Reaction picker */
.reaction-panel { position: fixed; z-index: 41; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 999px; padding: 6px 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); display: flex; gap: 6px; }
.reaction-panel { max-width: calc(100vw - 20px); }
.reaction-btn { border: none; background: transparent; font-size: 18px; line-height: 1; cursor: pointer; padding: 6px 8px; border-radius: 8px; }
.reaction-btn:hover { background: #f1f5f9; }

/* Drag-over highlight for reactions */
.msg-row.drag-over .bubble { outline: 2px dashed var(--accent); outline-offset: 3px; }

/* Overlay menus */
.msg-menu { position: fixed; z-index: 42; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); display: flex; flex-direction: column; gap: 8px; min-width: 160px; }
.menu-item { border: none; background: #f8fafc; color: #111827; font-size: 12px; padding: 6px 10px; border-radius: 8px; cursor: pointer; text-align: left; }
.menu-item:hover { background: #e5e7eb; }
.menu-item[disabled] { opacity: 0.5; cursor: default; pointer-events: none; }
.menu-item.danger { background: #fff1f2; color: #b91c1c; }
.menu-item.danger:hover { background: #ffe4e6; }

/* Image overlay (reserved) */
.img-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.img-full { max-width: 96vw; max-height: 90vh; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
.click-away {
  position: fixed;
  /* Constrain to content area so the nav drawer remains clickable */
  top: 0;
  /* Leave the composer area clickable even when an overlay is open */
  /* Use the computed safe gap (composer + emoji panel) */
  bottom: var(--composer-safe-gap);
  left: var(--v-layout-left, 0px);
  right: var(--v-layout-right, 0px);
  background: transparent;
  z-index: 40;
}

/* Upload overlay */
.upload-overlay { position: fixed; inset: 0; background: rgba(255,255,255,0.92); z-index: 2000; display: flex; align-items: center; justify-content: center; }
.upload-box { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.upload-text { color: #1f2937; font-weight: 700; font-size: 14px; }

@media (max-width: 480px) {
  .bubble { max-width: 65%; }
}
</style>
