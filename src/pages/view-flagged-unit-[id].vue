<template>
  <div class="view-flagged-unit-page">
    <v-container fluid>
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            icon="mdi-arrow-left"
            variant="outlined"
            color="primary"
            @click="$router.push('/flagged-units')"
            class="back-btn"
          >
            Back
          </v-btn>
        </v-col>
      </v-row>

      <!-- Title Section -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="title-section">
            <h1 class="page-title">Flagged Unit Details</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading flagged unit details...</p>
            </v-card-text>
          </v-card>

          <!-- Error -->
          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon icon="mdi-alert" color="error" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <!-- Unit Info -->
          <div v-else class="form-card" elevation="0">
            <v-tabs v-model="activeTab" class="property-tabs" density="comfortable">
              <v-tab value="details">Details</v-tab>
              <v-tab value="notes">Notes</v-tab>
            </v-tabs>
            <v-window v-model="activeTab">
              <v-window-item value="details">
                <v-card-text>
                  <v-row>
                <!-- Agency -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="agencyName"
                    label="Agency"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Unit Name -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="unit.unitName"
                    label="Unit Name"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Tenant Reference -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="unit.tenantRef"
                    label="Tenant Reference"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Lease Start Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="unit.leaseStartDate"
                    label="Lease Start Date"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Flag Reason -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="unit.flagReason"
                    label="Reason Flagged"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Date Flagged -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="unit.dateFlagged"
                    label="Date Flagged"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Missed Payment Flag -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="unit.missedPaymentFlag"
                    label="Missed Payment Flag"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Notice to Vacate Given -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="noticeToVacateDisplay"
                    label="Notice to Vacate"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Action Taken -->
                <v-col cols="12">
                  <v-textarea
                    :model-value="unit.actionTaken"
                    label="Action Taken"
                    readonly
                    class="custom-input"
                    rows="3"
                  />
                </v-col>

                  </v-row>
                </v-card-text>
              </v-window-item>
              <v-window-item value="notes">
                <v-card-text>
                  <div class="notes-section">
                    <h3 class="mb-2">Notes</h3>
                    <div v-if="(unit.notesLog && unit.notesLog.length)" class="chat-log" ref="chatLog">
                      <div
                        v-for="(n, idx) in sortedNotes"
                        :key="idx"
                        class="chat-message"
                        :class="{ 'mine': n.authorId === currentUserId, 'other': n.authorId !== currentUserId }"
                      >
                        <div class="chat-avatar">
                          <img v-if="n.authorAvatarUrl" :src="n.authorAvatarUrl" alt="avatar" class="chat-avatar-img" />
                          <template v-else>{{ noteInitials(n.authorName) }}</template>
                        </div>
                        <div class="chat-bubble">
                          <div class="chat-header">
                            <span class="chat-author">{{ n.authorName || 'Unknown' }}</span>
                            <span class="chat-time">{{ formatNoteDate(n.timestamp) }}</span>
                          </div>
                          <div class="chat-text">{{ n.text }}</div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-medium-emphasis">No notes yet.</div>
                    <div class="chat-input mt-4">
                      <v-textarea
                        v-model="newNote"
                        placeholder="Write a note..."
                        variant="outlined"
                        class="custom-input"
                        :counter="500"
                        maxlength="500"
                        rows="2"
                        auto-grow
                      />
                      <div class="d-flex justify-end mt-2">
                        <v-btn color="black" variant="elevated" :disabled="!newNote || savingNote" :loading="savingNote" @click="appendNote">
                          <v-icon start>mdi-send</v-icon>
                          Send
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-window-item>
            </v-window>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { db } from '@/firebaseConfig'
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'
import { useCustomDialogs } from '@/composables/useCustomDialogs'

export default {
  name: "ViewFlaggedUnitPage",
  setup() {
    const { showErrorDialog } = useCustomDialogs()
    return { showErrorDialog }
  },
  data() {
    return {
      activeTab: 'details',
      unit: {},
      agencyName: '',
      loading: true,
      error: null,
      newNote: '',
      savingNote: false,
    };
  },
  computed: {
    currentUserId() {
      const appStore = useAppStore();
      return appStore.userId;
    },
    sortedNotes() {
      const notes = this.unit?.notesLog || []
      return [...notes].sort((a,b) => {
        const ad = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0)
        const bd = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0)
        return ad - bd
      })
    },
    noticeToVacateDisplay() {
      const v = this.unit?.noticeToVacateGiven
      if (!v) return 'No'
      // Keep original string or show formatted date appended to Yes
      try {
        const d = new Date(v)
        const pretty = isNaN(d.getTime()) ? v : d.toLocaleDateString()
        return `Yes - ${pretty}`
      } catch (_) {
        return `Yes - ${v}`
      }
    }
  },
  async mounted() {
    document.title = "Flagged Unit Details - Depsure";
    const unitId = this.$route.params.id;
    if (unitId) {
      await this.loadUnit(unitId);
    } else {
      this.error = "No flagged unit ID provided";
      this.loading = false;
    }
  },
  methods: {
    scrollNotesToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatLog
        if (el && el.scrollHeight != null) el.scrollTop = el.scrollHeight
      })
    },
    async loadUnit(unitId) {
      try {
        console.log('Loading flagged unit with ID:', unitId);
        
        // Fetch flagged unit from Firestore
        const unitDoc = await getDoc(doc(db, 'flaggedUnits', unitId));
        
        if (unitDoc.exists()) {
          const unitData = unitDoc.data();
          this.unit = {
            id: unitDoc.id,
            ...unitData
          };
          
          // Fetch agency name if agencyId exists
          if (unitData.agencyId) {
            await this.loadAgencyName(unitData.agencyId);
          }
          
          console.log('Flagged unit loaded:', this.unit);
          this.scrollNotesToBottom()
        } else {
          this.error = "Flagged unit not found";
        }
      } catch (error) {
        console.error('Error loading flagged unit:', error);
        this.error = "Failed to load flagged unit details";
      } finally {
        this.loading = false;
      }
    },
    noteInitials(name) {
      const raw = String(name || '').trim()
      if (!raw) return '?'
      const words = raw.split(/\s+/).filter(Boolean)
      if (words.length === 1) {
        const cleaned = words[0].replace(/[^A-Za-z0-9]/g, '')
        if (!cleaned) return '?'
        return cleaned.slice(0, 2).toUpperCase()
      }
      const first = (words[0] && words[0][0]) ? words[0][0] : ''
      const second = (words[1] && words[1][0]) ? words[1][0] : ''
      const res = (first + second).trim()
      return res ? res.toUpperCase() : '?'
    },
    formatNoteDate(ts) {
      try {
        if (!ts) return 'Just now'
        const d = ts.toDate ? ts.toDate() : new Date(ts)
        return d.toLocaleString()
      } catch (_) { return String(ts) }
    },
    async appendNote() {
      if (!this.newNote || !this.unit?.id) return
      try {
        this.savingNote = true
        const appStore = useAppStore()
        const currentUser = appStore.currentUser
        const isAgency = currentUser?.userType === 'Agency'
        
        // Get proper author name based on user type
        let authorName = 'Unknown User'
        if (isAgency) {
          authorName = currentUser?.agencyName || this.unit?.unitName || 'Property'
        } else {
          // For regular users, use firstName + lastName or fallback to email
          if (currentUser?.firstName && currentUser?.lastName) {
            authorName = `${currentUser.firstName} ${currentUser.lastName}`
          } else if (currentUser?.firstName) {
            authorName = currentUser.firstName
          } else if (currentUser?.lastName) {
            authorName = currentUser.lastName
          } else if (currentUser?.email) {
            authorName = currentUser.email
          }
        }
        
        const note = {
          text: this.newNote,
          authorId: appStore.userId || currentUser?.uid || '',
          authorName: authorName,
          authorType: appStore.userType || currentUser?.userType || '',
          authorAvatarUrl: isAgency 
            ? (this.unit?.agencyProfileImageUrl || this.unit?.profileImageUrl || currentUser?.profileImageUrl || currentUser?.profileImage || '') 
            : (currentUser?.profileImageUrl || currentUser?.profileImage || ''),
          timestamp: new Date()
        }
        
        await updateDoc(doc(db, 'flaggedUnits', this.unit.id), { 
          notesLog: arrayUnion(note), 
          updatedAt: serverTimestamp() 
        })
        
        if (!this.unit.notesLog) this.unit.notesLog = []
        this.unit.notesLog.push(note)
        this.newNote = ''
        this.scrollNotesToBottom()
      } catch (e) {
        console.error('Error adding note:', e)
        this.showErrorDialog('Failed to add note. Please try again.', 'Error', 'OK')
      } finally {
        this.savingNote = false
      }
    },

    async loadAgencyName(agencyId) {
      try {
        const agencyDoc = await getDoc(doc(db, 'users', agencyId));
        if (agencyDoc.exists()) {
          const agencyData = agencyDoc.data();
          this.agencyName = agencyData.agencyName || 'Unknown Agency';
        } else {
          this.agencyName = 'Unknown Agency';
        }
      } catch (error) {
        console.error('Error loading agency name:', error);
        this.agencyName = 'Unknown Agency';
      }
    }
  },
};
</script>

<style scoped>
.view-flagged-unit-page {
  padding: 20px;
  min-height: 100vh;
}

/* Back button */
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

/* Title section */
.title-section {
  background: black;
  color: white;
  padding: 0.75rem;
  border-radius: 12px 12px 0 0;
  margin-bottom: 0;
}
.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0;
  text-align: left;
}

/* Form card */
.form-card {
  background: white;
  border-radius: 0 0 12px 12px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Input styling */
.custom-input .v-field {
  border-radius: 8px;
}
.custom-input :deep(.v-field__input) {
  background-color: #f8f9fa !important;
  color: #000000 !important;
}
.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}

/* Chat styles */
.notes-section{margin-top:8px}
.chat-log{display:flex;flex-direction:column;gap:10px;max-height:320px;overflow-y:auto;padding:8px 0}
.chat-message{display:flex;align-items:flex-end;gap:8px}
.chat-message.mine{flex-direction:row-reverse}
.chat-avatar{width:28px;height:28px;border-radius:50%;background:#6b7280;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;overflow:hidden}
.chat-avatar-img{width:100%;height:100%;object-fit:cover;display:block}
.chat-bubble{max-width:75%;background:#3a3f44;color:#fff;border-radius:10px;padding:8px 12px;box-shadow:0 1px 3px rgba(0,0,0,.18)}
.chat-message.mine .chat-bubble{background:#000}
.chat-header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px}
.chat-author{font-weight:700;font-size:.8rem;opacity:.95}
.chat-time{font-size:.7rem;opacity:.7;margin-left:8px}
.chat-text{white-space:pre-wrap;word-wrap:break-word;line-height:1.35}
.chat-input :deep(.v-field__input){min-height:44px}

/* Responsive */
@media (max-width: 768px) {
  .view-flagged-unit-page {
    padding: 10px;
  }
  .page-title {
    font-size: 1.1rem;
  }
  .back-btn {
    width: 140px;
    height: 40px;
  }
}
</style>
