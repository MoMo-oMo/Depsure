<template>
  <div class="chat-page">
    <v-container fluid>
      <!-- Back Button and Agency Selection -->
      <v-row class="mb-4 align-center">
        <!-- Back Button -->
        <v-col cols="12" md="4">
          <v-btn
            icon="mdi-arrow-left"
            variant="outlined"
            color="primary"
            @click="goBack"
            class="back-btn"
          >
            Back
          </v-btn>
        </v-col>
        
        <v-spacer v-if="showAgencySelector" />
        
        <!-- Agency Selection for Super Admins (always visible) -->
        <v-col cols="12" md="4" v-if="showAgencySelector" class="d-flex justify-end">
          <v-select
            v-model="selectedAgencyId"
            :items="agencies"
            item-title="agencyName"
            item-value="id"
            :label="selectedAgencyId ? `Viewing: ${getSelectedAgencyName()}` : 'Select Agency'"
            prepend-inner-icon="mdi-domain"
            variant="outlined"
            class="custom-input"
            :loading="agenciesLoading"
            @update:model-value="loadChat"
            style="max-width: 350px; width: 100%;"
            :color="selectedAgencyId ? 'success' : 'primary'"
            :prepend-inner-icon="selectedAgencyId ? 'mdi-check-circle' : 'mdi-domain'"
            :disabled="agencies.length === 0"
            :hint="agencies.length === 0 ? 'No agencies available' : ''"
            persistent-hint
          />
        </v-col>
      </v-row>

      <!-- Chat Title Banner -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card class="chat-hero-card" elevation="1">
            <div class="chat-hero-bg"></div>
            <div class="chat-hero-center">
              <v-icon class="mr-3" size="32">mdi-message-text</v-icon>
              {{ chatTitle }}
              <v-chip 
                v-if="isSuperAdmin && selectedAgencyId" 
                color="success" 
                size="small" 
                class="ml-3"
                prepend-icon="mdi-check-circle"
              >
                {{ getSelectedAgencyName() }}
              </v-chip>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Chat Container -->
      <v-row>
        <v-col cols="12">
          <v-card class="chat-card" elevation="2">
            <!-- Messages Area -->
            <div class="chat-messages" ref="chatMessages">
              <div v-if="loading" class="text-center pa-8">
                <v-progress-circular indeterminate color="black" />
                <p class="mt-4">Loading messages...</p>
              </div>

              <div v-else-if="!selectedAgencyId && this.isSuperAdmin" class="empty-state">
                <v-icon size="64" color="grey">mdi-forum-outline</v-icon>
                <p class="mt-4">Select an agency to view their chat conversation</p>
                <p v-if="agencies.length === 0" class="mt-2 text-red">No agencies found. Please check your permissions.</p>
              </div>

              <div v-else-if="messages.length === 0" class="empty-state">
                <v-icon size="64" color="grey">mdi-message-outline</v-icon>
                <p class="mt-4">No messages yet. Start the conversation!</p>
              </div>

              <div v-else class="messages-list">
                <div
                  v-for="(msg, index) in messages"
                  :key="msg.id || index"
                  class="message-wrapper"
                  :class="{ 'mine': msg.authorId === currentUserId, 'other': msg.authorId !== currentUserId }"
                >
                  <div class="message-avatar">
                    <img v-if="msg.authorAvatarUrl" :src="msg.authorAvatarUrl" alt="avatar" class="avatar-img" />
                    <span v-else class="avatar-initials">{{ getInitials(msg.authorName) }}</span>
                  </div>
                  <div class="message-bubble">
                    <div class="message-header">
                      <span class="message-author">{{ msg.authorName }}</span>
                      <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
                    </div>
                    <div class="message-text">{{ msg.text }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Input Area -->
            <v-divider />
            <div class="chat-input-area">
              <v-textarea
                v-model="newMessage"
                placeholder="Type your message..."
                variant="outlined"
                class="message-input"
                rows="2"
                auto-grow
                :max-rows="4"
                hide-details
                @keydown.enter.exact.prevent="sendMessage"
              />
              <v-btn
                color="black"
                variant="elevated"
                class="send-btn"
                :disabled="!newMessage.trim() || sending"
                :loading="sending"
                @click="sendMessage"
              >
                <v-icon start>mdi-send</v-icon>
                Send
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { db } from '@/firebaseConfig'
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'
import { useCustomDialogs } from '@/composables/useCustomDialogs'

export default {
  name: 'ChatPage',
  setup() {
    const { showErrorDialog } = useCustomDialogs()
    return { showErrorDialog }
  },
  data() {
    return {
      selectedAgencyId: null,
      agencies: [],
      agenciesLoading: false,
      loading: false,
      sending: false,
      messages: [],
      newMessage: '',
      chatDocId: null,
      unsubscribe: null
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
    showAgencySelector() {
      // Show selector only for Super Admins when no agency is selected
      return this.isSuperAdmin && !this.selectedAgencyId
    },
    chatTitle() {
      if (this.isAgencyUser) {
        return 'Agency Chat'
      }
      const agency = this.agencies.find(a => a.id === this.selectedAgencyId)
      return agency ? `Chat with ${agency.agencyName}` : 'Select an Agency to View Chat'
    },
    getSelectedAgencyName() {
      const agency = this.agencies.find(a => a.id === this.selectedAgencyId)
      return agency ? agency.agencyName : 'Unknown Agency'
    }
  },
    async mounted() {
    document.title = 'Chat - Depsure'
    await this.fetchAgencies()
    
    // Auto-select for agency users
    if (this.isAgencyUser) {
      const appStore = useAppStore()
      const user = appStore.currentUser
      this.selectedAgencyId = user.userType === 'Agency' ? user.uid : user.managedAgencyId
      await this.loadChat()
    } else {
      // For Super Admins, check global agency selection first
      const appStore = useAppStore()
      const globalAgencyId = appStore.currentAgency?.id || null
      
      if (globalAgencyId) {
        this.selectedAgencyId = globalAgencyId
        console.log('Loading chat from global agency selection:', globalAgencyId)
        await this.loadChat()
      } else if (this.$route.query.agencyId) {
        this.selectedAgencyId = this.$route.query.agencyId
        console.log('Loading chat from query param:', this.selectedAgencyId)
        await this.loadChat()
      }
      // If no agency is selected, show dropdown
    }
    
    console.log('Chat page mounted - selectedAgencyId:', this.selectedAgencyId)
    console.log('Available agencies:', this.agencies)
  },
  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
  },
  methods: {
    goBack() {
      // Go back to previous page or default to agencies/onboard-units
      const appStore = useAppStore()
      const user = appStore.currentUser
      const isAgency = user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency')
      
      if (isAgency) {
        this.$router.push('/onboard-units')
      } else {
        this.$router.push('/agencies')
      }
    },
    
    async fetchAgencies() {
      this.agenciesLoading = true
      try {
        const appStore = useAppStore()
        const user = appStore.currentUser
        
        console.log('Fetching agencies for user:', user?.userType, user?.adminScope)
        
        if (user.userType === 'Agency' || (user.userType === 'Admin' && user.adminScope === 'agency')) {
          // Agency users only see their own agency
          let agencyData = null
          if (user.userType === 'Agency') {
            const agencyDoc = await getDoc(doc(db, 'users', user.uid))
            if (agencyDoc.exists()) {
              agencyData = { id: agencyDoc.id, ...agencyDoc.data() }
            }
          } else if (user.managedAgencyId) {
            const agencyDoc = await getDoc(doc(db, 'users', user.managedAgencyId))
            if (agencyDoc.exists()) {
              agencyData = { id: agencyDoc.id, ...agencyDoc.data() }
            }
          }
          this.agencies = agencyData ? [agencyData] : []
          console.log('Agency user - agencies:', this.agencies)
        } else {
          // Admin/Super Admin see all agencies
          const agenciesQuery = query(collection(db, 'users'), where('userType', '==', 'Agency'))
          const snapshot = await getDocs(agenciesQuery)
          this.agencies = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          console.log('Admin user - agencies:', this.agencies)
        }
      } catch (error) {
        console.error('Error fetching agencies:', error)
        this.showErrorDialog(`Failed to fetch agencies: ${error.message}`, 'Error', 'OK')
      } finally {
        this.agenciesLoading = false
      }
    },

    async loadChat() {
      if (!this.selectedAgencyId) {
        console.log('No agency selected, cannot load chat')
        return
      }
      
      // Update global agency selection for Super Admins
      if (this.isSuperAdmin) {
        const appStore = useAppStore()
        const selectedAgency = this.agencies.find(a => a.id === this.selectedAgencyId)
        if (selectedAgency) {
          appStore.setCurrentAgency(selectedAgency)
        }
      }
      
      this.loading = true
      try {
        // Unsubscribe from previous chat
        if (this.unsubscribe) {
          this.unsubscribe()
          this.unsubscribe = null
        }
        
        console.log('Loading chat for agency:', this.selectedAgencyId)

        // Find or create chat document for this agency
        const chatQuery = query(
          collection(db, 'chats'),
          where('agencyId', '==', this.selectedAgencyId)
        )
        const snapshot = await getDocs(chatQuery)
        
        if (snapshot.empty) {
          // Create new chat document
          const selectedAgency = this.agencies.find(a => a.id === this.selectedAgencyId)
          const chatData = {
            agencyId: this.selectedAgencyId,
            agencyName: selectedAgency?.agencyName || '',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
          const chatRef = doc(collection(db, 'chats'))
          await setDoc(chatRef, chatData)
          this.chatDocId = chatRef.id
          this.messages = []
          console.log('Created new chat for agency:', selectedAgency?.agencyName)
        } else {
          this.chatDocId = snapshot.docs[0].id
          const data = snapshot.docs[0].data()
          this.messages = (data.messages || []).sort((a, b) => {
            const aTime = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp)
            const bTime = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp)
            return aTime - bTime
          })
          
          console.log('Loaded existing chat for agency:', data.agencyName)
          // Mark messages as read
          await this.markAsRead()
        }

        // Subscribe to real-time updates
        this.unsubscribe = onSnapshot(doc(db, 'chats', this.chatDocId), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data()
            this.messages = (data.messages || []).sort((a, b) => {
              const aTime = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp)
              const bTime = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp)
              return aTime - bTime
            })
            this.$nextTick(() => {
              try {
                this.scrollToBottom()
                this.markAsRead()
              } catch (error) {
                console.log('Component update error (may be unmounting):', error)
              }
            })
          }
        }, (error) => {
          console.error('Chat subscription error:', error)
          this.showErrorDialog(`Chat subscription failed: ${error.message}`, 'Error', 'OK')
        })
      } catch (error) {
        console.error('Error loading chat:', error)
        console.error('Error details:', error.message)
        this.showErrorDialog(`Failed to load chat: ${error.message}`, 'Error', 'OK')
      } finally {
        this.loading = false
      }
    },

    async sendMessage() {
      if (!this.newMessage.trim() || !this.chatDocId) return
      
      this.sending = true
      try {
        const appStore = useAppStore()
        const user = appStore.currentUser
        const isAgency = user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency')
        
        let authorName = 'Unknown User'
        if (isAgency) {
          authorName = user?.agencyName || 'Agency'
        } else {
          authorName = user?.firstName && user?.lastName 
            ? `${user.firstName} ${user.lastName}`
            : user?.firstName || user?.lastName || user?.email || 'Admin'
        }

        const message = {
          id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
          text: this.newMessage.trim(),
          authorId: user.uid,
          authorName: authorName,
          authorType: user.userType,
          authorAvatarUrl: user?.profileImageUrl || user?.profileImage || '',
          timestamp: new Date(),
          readBy: [user.uid]
        }

        await updateDoc(doc(db, 'chats', this.chatDocId), {
          messages: arrayUnion(message),
          updatedAt: new Date()
        })

        this.newMessage = ''
        this.scrollToBottom()
      } catch (error) {
        console.error('Error sending message:', error)
        this.showErrorDialog('Failed to send message. Please try again.', 'Error', 'OK')
      } finally {
        this.sending = false
      }
    },

    async markAsRead() {
      if (!this.chatDocId || !this.currentUserId) return
      
      try {
        const chatRef = doc(db, 'chats', this.chatDocId)
        const chatSnap = await getDoc(chatRef)
        if (!chatSnap.exists()) return
        
        const data = chatSnap.data()
        const messages = data.messages || []
        let updated = false
        
        const updatedMessages = messages.map(msg => {
          if (msg.authorId !== this.currentUserId && (!msg.readBy || !msg.readBy.includes(this.currentUserId))) {
            updated = true
            return {
              ...msg,
              readBy: [...(msg.readBy || []), this.currentUserId]
            }
          }
          return msg
        })

        if (updated) {
          await updateDoc(chatRef, { messages: updatedMessages })
        }
      } catch (error) {
        console.error('Error marking messages as read:', error)
        // Don't show error dialog for read status updates
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        try {
          const el = this.$refs.chatMessages
          if (el && el.scrollHeight) {
            el.scrollTop = el.scrollHeight
          }
        } catch (error) {
          console.log('Scroll error (component may be unmounting):', error)
        }
      })
    },

    getInitials(name) {
      if (!name) return '?'
      const parts = name.trim().split(/\s+/)
      const first = parts[0]?.[0] || ''
      const last = parts[1]?.[0] || ''
      return (first + last).toUpperCase() || first.toUpperCase() || '?'
    },

    formatTime(timestamp) {
      try {
        if (!timestamp) return ''
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
        const now = new Date()
        const diff = now - date
        
        // Less than 1 minute
        if (diff < 60000) return 'Just now'
        
        // Less than 1 hour
        if (diff < 3600000) {
          const mins = Math.floor(diff / 60000)
          return `${mins}m ago`
        }
        
        // Less than 24 hours
        if (diff < 86400000) {
          const hours = Math.floor(diff / 3600000)
          return `${hours}h ago`
        }
        
        // Show date
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      } catch {
        return ''
      }
    },

  }
}
</script>

<style scoped>
.chat-page {
  padding: 20px;
  min-height: 100vh;
  background: #f5f5f5;
}

/* Hero Banner */
.chat-hero-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  min-height: 100px;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
}

.chat-hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #000000 0%, #2a2a2a 100%);
}

.chat-hero-center {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  color: #fff;
  font-weight: 700;
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 0.5px;
}

/* Chat Card */
.chat-card {
  border-radius: 12px;
  overflow: hidden;
  background: white;
  min-height: 600px;
  display: flex;
  flex-direction: column;
}

/* Messages Area */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  min-height: 500px;
  max-height: 600px;
  background: #fafbfc;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Message Styling */
.message-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  animation: fadeIn 0.3s ease;
}

.message-wrapper.mine {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-initials {
  font-weight: 700;
  font-size: 0.875rem;
  color: #666;
}

.message-bubble {
  max-width: 60%;
  min-width: 200px;
  background: white;
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

.message-wrapper.mine .message-bubble {
  background: #000000;
  color: white;
  border-color: #000000;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  gap: 12px;
}

.message-author {
  font-weight: 700;
  font-size: 0.875rem;
}

.message-wrapper.mine .message-author {
  color: rgba(255, 255, 255, 0.9);
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  white-space: nowrap;
}

.message-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.5;
}

/* Input Area */
.chat-input-area {
  padding: 16px;
  background: white;
  border-top: 2px solid #e9ecef;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
}

.message-input :deep(.v-field) {
  border-radius: 12px;
}

.send-btn {
  height: 56px;
  min-width: 120px;
  text-transform: none;
  font-weight: 600;
  border-radius: 12px;
}

.send-btn:hover:not(:disabled) {
  background-color: #333 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Back Button */
.back-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: black !important;
  color: white !important;
  border: 2px solid black !important;
  width: 160px;
  height: 44px;
}

.back-btn:hover {
  background-color: #333 !important;
  border-color: #333 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

/* Custom Input */
.custom-input .v-field {
  border-radius: 8px;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .chat-page {
    padding: 10px;
  }
  
  .message-bubble {
    max-width: 75%;
    min-width: 150px;
  }
  
  .chat-hero-center {
    font-size: 1.2rem;
  }
  
  .send-btn {
    min-width: 100px;
  }
}

</style>

