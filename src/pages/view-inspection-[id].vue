<template>
  <div class="view-inspection-page">
    <v-container fluid>
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            icon="mdi-arrow-left"
            variant="outlined"
            color="primary"
            @click="$router.push('/inspections')"
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
            <h1 class="page-title">Inspection Entry Details</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading inspection entry...</p>
            </v-card-text>
          </v-card>

          <!-- Error -->
          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon icon="mdi-alert" color="error" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <!-- Inspection Info -->
          <div v-else class="form-card" elevation="0">
            <v-tabs v-model="activeTab" class="property-tabs" density="comfortable">
              <v-tab value="details">Details</v-tab>
              <v-tab value="notes">Notes</v-tab>
            </v-tabs>
            <v-window v-model="activeTab">
              <v-window-item value="details">
            <v-card-text>
              <v-row>
                <!-- Unit Name -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.unitName"
                    label="Unit Name"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Inspection Required -->
                <v-col cols="12" md="6">
                  <label class="mb-1 font-weight-bold">Inspection Required</label>
                  <div>
                    <v-chip :color="entry.inspectionRequired === 'Yes' ? 'success' : 'error'" size="small">
                      {{ entry.inspectionRequired }}
                    </v-chip>
                  </div>
                </v-col>

                <!-- Contact Person -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.contactPerson"
                    label="Contact Person"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Contact Number -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.contactNumber"
                    label="Contact Number"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Appointment Made -->
                <v-col cols="12" md="6">
                  <label class="mb-1 font-weight-bold">Appointment Made</label>
                  <div>
                    <v-chip :color="entry.appointmentMade === 'Yes' ? 'success' : 'error'" size="small">
                      {{ entry.appointmentMade }}
                    </v-chip>
                  </div>
                </v-col>

                <!-- Inspection Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.inspectionDate"
                    label="Inspection Date"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Quotes Needed -->
                <v-col cols="12" md="6">
                  <label class="mb-1 font-weight-bold">Quotes Needed</label>
                  <div>
                    <v-chip :color="entry.quotesNeeded === 'Yes' ? 'success' : 'error'" size="small">
                      {{ entry.quotesNeeded }}
                    </v-chip>
                  </div>
                </v-col>

                <!-- Status -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.status"
                    label="Status"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Priority -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.priority"
                    label="Priority"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Agency Name -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.agencyName"
                    label="Agency"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Notes removed from Details tab -->

                <!-- Created At -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.createdAt ? entry.createdAt.toLocaleDateString() : ''"
                    label="Created At"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Updated At -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.updatedAt ? entry.updatedAt.toLocaleDateString() : ''"
                    label="Updated At"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>
              </v-row>

              <!-- Action Buttons -->
              <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn color="grey" variant="outlined" @click="$router.push('/inspections')" class="cancel-btn">
                  Back
                </v-btn>
                <v-btn 
                  v-if="isAgencyUser || userType === 'Admin'"
                  color="black" 
                  variant="elevated" 
                  @click="editEntry" 
                  class="edit-btn"
                >
                  Edit Entry
                </v-btn>
                <v-btn 
                  v-if="isAgencyUser || userType === 'Admin'"
                  color="error" 
                  variant="outlined" 
                  @click="deleteEntry" 
                  class="delete-btn"
                >
                  Delete Entry
                </v-btn>
              </v-card-actions>
            </v-card-text>
              </v-window-item>
              <v-window-item value="notes">
                <v-card-text>
                  <div class="notes-section">
                    <h3 class="mb-2">Notes</h3>
                    <div v-if="(entry.notesLog && entry.notesLog.length)" class="chat-log" ref="chatLog">
                      <div v-for="(n, idx) in sortedNotes" :key="idx" class="chat-message" :class="{ 'mine': n.authorId === currentUserId, 'other': n.authorId !== currentUserId }">
                        <div class="chat-avatar">{{ noteInitials(n.authorName) }}</div>
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
                      <v-textarea v-model="newNote" placeholder="Write a note..." variant="outlined" class="custom-input" :counter="500" maxlength="500" rows="2" auto-grow />
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
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { useAppStore } from '@/stores/app'

export default {
  name: "ViewInspectionPage",
  setup() {
    const { showConfirmDialog } = useCustomDialogs()
    return { showConfirmDialog }
  },
  computed: {
    isAgencyUser() {
      const appStore = useAppStore();
      return appStore.currentUser?.userType === 'Agency';
    },
    userType() {
      const appStore = useAppStore();
      return appStore.currentUser?.userType;
    },
    currentUserId() {
      const appStore = useAppStore();
      return appStore.userId;
    },
    sortedNotes() {
      const notes = this.entry?.notesLog || []
      return [...notes].sort((a,b) => {
        const ad = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0)
        const bd = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0)
        return ad - bd
      })
    }
  },
  data() {
    return {
      activeTab: 'details',
      entry: {},
      loading: true,
      error: null,
      newNote: '',
      savingNote: false
    };
  },
  mounted() {
    document.title = "Inspection Entry Details - Depsure";
    const entryId = this.$route.params.id;
    this.loadEntry(entryId);
  },
  methods: {
    scrollNotesToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatLog
        if (el && el.scrollHeight != null) el.scrollTop = el.scrollHeight
      })
    },
    noteInitials(name) {
      if (!name) return '?'
      const parts = String(name).trim().split(/\s+/)
      const a = parts[0]?.[0] || ''
      const b = parts[1]?.[0] || ''
      return (a + b).toUpperCase() || a.toUpperCase() || '?'
    },
    formatNoteDate(ts) {
      try {
        if (!ts) return 'Just now'
        const d = ts.toDate ? ts.toDate() : new Date(ts)
        return d.toLocaleString()
      } catch (_) { return String(ts) }
    },
    async loadEntry(entryId) {
      try {
        console.log('Loading inspection entry with ID:', entryId);
        const docRef = doc(db, 'inspections', entryId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          this.entry = {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate(),
            updatedAt: docSnap.data().updatedAt?.toDate()
          };
          console.log('Inspection entry loaded:', this.entry);
          this.scrollNotesToBottom()
        } else {
          this.error = "Inspection entry not found";
          console.log('Inspection entry not found with ID:', entryId);
        }
      } catch (error) {
        console.error('Error loading inspection entry:', error);
        this.error = "Failed to load inspection entry";
      } finally {
        this.loading = false;
      }
    },
    
    editEntry() {
      this.$router.push(`/edit-inspection-${this.entry.id}`);
    },
    async appendNote() {
      if (!this.newNote) return
      try {
        this.savingNote = true
        const appStore = useAppStore()
        const note = {
          text: this.newNote,
          authorId: appStore.userId,
          authorName: appStore.userName,
          authorType: appStore.userType,
          timestamp: new Date()
        }
        await updateDoc(doc(db, 'inspections', this.entry.id), { notesLog: arrayUnion(note), updatedAt: serverTimestamp() })
        if (!this.entry.notesLog) this.entry.notesLog = []
        this.entry.notesLog.push(note)
        this.newNote = ''
        this.scrollNotesToBottom()
      } catch (e) {
        console.error('Error adding note:', e)
      } finally {
        this.savingNote = false
      }
    },
    
    async deleteEntry() {
      try {
        await this.showConfirmDialog({
          title: 'Delete inspection entry?',
          message: `Are you sure you want to delete inspection entry for ${this.entry.unitName}?`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          color: '#dc3545'
        })
      } catch (_) {
        return
      }
      try {
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'inspections', this.entry.id));
        console.log('Inspection entry deleted successfully');
        this.$router.push('/inspections');
      } catch (error) {
        console.error('Error deleting inspection entry:', error);
        alert('Failed to delete inspection entry');
      }
    }
  }
};
</script>

<style scoped>
.notes-section{margin-top:8px}
.chat-log{display:flex;flex-direction:column;gap:10px;max-height:320px;overflow-y:auto;padding:8px 0}
.chat-message{display:flex;align-items:flex-end;gap:8px}
.chat-message.mine{flex-direction:row-reverse}
.chat-avatar{width:28px;height:28px;border-radius:50%;background:#6b7280;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600}
.chat-bubble{max-width:75%;background:#3a3f44;color:#fff;border-radius:10px;padding:8px 12px;box-shadow:0 1px 3px rgba(0,0,0,.18)}
.chat-message.mine .chat-bubble{background:#000}
.chat-header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px}
.chat-author{font-weight:700;font-size:.8rem;opacity:.95}
.chat-time{font-size:.7rem;opacity:.7;margin-left:8px}
.chat-text{white-space:pre-wrap;word-wrap:break-word;line-height:1.35}
.chat-input :deep(.v-field__input){min-height:44px}
.view-inspection-page {
  padding: 20px;
  min-height: 100vh;
}

/* Back button styling */
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
  padding: 1rem;
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

/* Buttons */
.cancel-btn, .edit-btn, .delete-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  width: 120px;
  height: 44px;
}

.edit-btn {
  background-color: black !important;
  color: white !important;
}

.edit-btn:hover {
  background-color: #333 !important;
}

.delete-btn:hover {
  background-color: #d32f2f !important;
  color: white !important;
}

/* Responsive */
@media (max-width: 768px) {
  .view-inspection-page {
    padding: 10px;
  }

  .page-title {
    font-size: 1.1rem;
  }

  .back-btn {
    width: 140px;
    height: 40px;
  }
  
  .cancel-btn, .edit-btn, .delete-btn {
    width: 100px;
    height: 40px;
  }
}
</style>
