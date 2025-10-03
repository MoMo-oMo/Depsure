<template>
  <div class="view-vacancy-page">
    <v-container fluid>
      
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            icon="mdi-arrow-left"
            variant="outlined"
            color="primary"
            @click="$router.push('/vacancies')"
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
            <h1 class="page-title">View Vacancy Details</h1>
          </div>
          
          <div class="content-card" elevation="0">
            <!-- Loading State -->
            <div v-if="loading" class="loading-container">
              <v-progress-circular indeterminate color="black" size="64"></v-progress-circular>
              <p class="loading-text">Loading vacancy details...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-container">
              <v-icon color="error" size="64">mdi-alert-circle</v-icon>
              <h3 class="error-title">Error Loading Vacancy</h3>
              <p class="error-message">{{ error }}</p>
              <v-btn @click="loadVacancy" color="black" variant="elevated">
                Try Again
              </v-btn>
            </div>

            <!-- Vacancy Details -->
            <template v-else-if="vacancy">
              <v-card-text>
                <div class="vacancy-details">
                    <v-row>
                      <!-- Unit Name/Address -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          :model-value="vacancy.unitName"
                          label="Unit Name/Address"
                          variant="outlined"
                          readonly
                          class="custom-input"
                        />
                      </v-col>

                      <!-- Date Vacated -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          :model-value="formatDate(vacancy.dateVacated)"
                          label="Date Vacated"
                          variant="outlined"
                          readonly
                          class="custom-input"
                        />
                      </v-col>

                      <!-- Move In Date -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          :model-value="vacancy.moveInDate ? formatDate(vacancy.moveInDate) : 'Not specified'"
                          label="Move In Date"
                          variant="outlined"
                          readonly
                          class="custom-input"
                        />
                      </v-col>

                      <!-- Property Manager -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          :model-value="vacancy.propertyManager"
                          label="Property Manager"
                          variant="outlined"
                          readonly
                          class="custom-input"
                        />
                      </v-col>

                      <!-- Contact Number -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          :model-value="vacancy.contactNumber"
                          label="Contact Number"
                          variant="outlined"
                          readonly
                          class="custom-input"
                        />
                      </v-col>

                      <!-- Agency Name -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          :model-value="vacancy.agencyName || 'Not specified'"
                          label="Agency"
                          variant="outlined"
                          readonly
                          class="custom-input"
                        />
                      </v-col>

                      <!-- Created At -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          :model-value="vacancy.createdAt ? formatDate(vacancy.createdAt) : 'Not specified'"
                          label="Created At"
                          variant="outlined"
                          readonly
                          class="custom-input"
                        />
                      </v-col>

                      <!-- Updated At -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          :model-value="vacancy.updatedAt ? formatDate(vacancy.updatedAt) : 'Not specified'"
                          label="Updated At"
                          variant="outlined"
                          readonly
                          class="custom-input"
                        />
                      </v-col>

                      <!-- Notes removed (use Notes tab) -->
                    </v-row>

                    <!-- Action Buttons -->
                    <v-row class="mt-6">
                      <v-col cols="12" class="d-flex justify-center gap-4">
                    <v-btn
                      v-if="isAgencyUser || userType === 'Admin'"
                      color="black"
                      variant="elevated"
                      @click="editVacancy"
                      class="action-btn"
                    >
                      <v-icon left>mdi-pencil</v-icon>
                      Edit Vacancy
                    </v-btn>
                    <v-btn
                      v-if="isAgencyUser || userType === 'Admin'"
                      color="error"
                      variant="outlined"
                      @click="deleteVacancy"
                      class="action-btn"
                    >
                      <v-icon left>mdi-delete</v-icon>
                      Delete Vacancy
                    </v-btn>
                    </v-col>
                    </v-row>
                  <!-- Notes removed - using live chat -->
                  <div style="display:none;">
                    <div class="notes-section">
                      <h3 class="mb-2">Notes</h3>
                      <div v-if="(vacancy.notesLog && vacancy.notesLog.length)" class="chat-log" ref="chatLog">
                        <div v-for="(n, idx) in sortedNotes" :key="noteKey(n)" class="chat-message" :class="{ 'mine': n.authorId === currentUserId, 'other': n.authorId !== currentUserId }">
                          <div class="chat-avatar">
                            <img v-if="n.authorAvatarUrl" :src="n.authorAvatarUrl" alt="avatar" class="chat-avatar-img" />
                            <template v-else>{{ noteInitials(n.authorName) }}</template>
                          </div>
                          <div class="chat-bubble">
                            <div class="chat-header">
                              <span class="chat-author">{{ n.authorName || 'Unknown' }}</span>
                              <div class="chat-header-right">
                                <span class="chat-time">{{ formatNoteDate(n.timestamp) }}</span>
                                <span v-if="n.isEdited && !n.isDeleted" class="chat-edited">(edited)</span>
                                <v-menu v-if="n.authorId === currentUserId && !n.isDeleted" location="bottom end">
                                  <template #activator="{ props }">
                                    <v-btn v-bind="props" icon="mdi-dots-vertical" size="x-small" variant="text" color="white" />
                                  </template>
                                  <v-list density="compact">
                                    <v-list-item @click="startEdit(n)">
                                      <v-list-item-title>
                                        <v-icon size="small" class="mr-1">mdi-pencil</v-icon>
                                        Edit
                                      </v-list-item-title>
                                    </v-list-item>
                                    <v-list-item @click="softDeleteNote(n)">
                                      <v-list-item-title class="text-error">
                                        <v-icon size="small" class="mr-1" color="error">mdi-delete</v-icon>
                                        Delete
                                      </v-list-item-title>
                                    </v-list-item>
                                  </v-list>
                                </v-menu>
                              </div>
                            </div>
                            <div v-if="n.isDeleted" class="chat-text deleted">This message was deleted</div>
                            <div v-else>
                            <div v-if="editingKey && editingKey === noteKey(n)" class="edit-area">
                              <v-textarea v-model="editingText" rows="2" auto-grow variant="outlined" class="custom-input" :counter="500" maxlength="500" />
                              <div class="d-flex justify-end mt-2 gap-2">
                                <v-btn size="small" variant="text" @click="cancelEdit">Cancel</v-btn>
                                <v-btn size="small" color="black" variant="elevated" :loading="savingEdit" :disabled="!editingText.trim()" @click="saveEdit(n)">Save</v-btn>
                              </div>
                            </div>
                            <div v-else class="chat-text">{{ n.text }}</div>
                          </div>
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
                  </div>
                </div>
              </v-card-text>
            </template>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { db } from '@/firebaseConfig'
import { doc, getDoc, deleteDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { useAppStore } from '@/stores/app'

export default {
  name: 'ViewVacancyPage',
  setup() {
    const { showSuccessDialog, showErrorDialog, showConfirmDialog } = useCustomDialogs()
    return { showSuccessDialog, showErrorDialog, showConfirmDialog }
  },
  computed: {
    isAgencyUser() {
      const appStore = useAppStore();
      const user = appStore.currentUser;
      return user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency');
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
      const notes = this.vacancy?.notesLog || []
      return [...notes].sort((a,b) => {
        const ad = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0)
        const bd = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0)
        return ad - bd
      })
    }
  },
  data() {
    return {
      vacancy: null,
      loading: true,
      error: null,
      activeTab: 'details',
      newNote: '',
      savingNote: false,
      editingKey: null,
      editingText: '',
      savingEdit: false
    }
  },
  mounted() {
    console.log('ViewVacancyPage mounted with ID:', this.$route.params.id);
    document.title = 'View Vacancy - Depsure';
    this.loadVacancy();
  },
  methods: {
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
    startEdit(note) { this.editingKey = this.noteKey(note); this.editingText = String(note.text || '') },
    cancelEdit() { this.editingKey = null; this.editingText = '' },
    noteKey(n) {
      try {
        if (n?.id) return `id:${n.id}`
        const t = n?.timestamp?.toDate ? n.timestamp.toDate().getTime() : new Date(n?.timestamp || 0).getTime()
        const aid = n?.authorId || ''
        const txt = String(n?.text || '')
        return `legacy:${aid}:${t}:${txt.length}:${txt.slice(0,8)}`
      } catch (_) { return `legacy:${Math.random().toString(36).slice(2,8)}` }
    },
    findNoteIndexByIdOrMatch(list, target) {
      if (!Array.isArray(list)) return -1
      if (target.id) { const i = list.findIndex(n => n && n.id === target.id); if (i !== -1) return i }
      const tA = target.timestamp?.toDate ? target.timestamp.toDate().getTime() : new Date(target.timestamp || 0).getTime()
      const txt = String(target.text || '')
      const aid = target.authorId || ''
      for (let i = list.length - 1; i >= 0; i--) {
        const n = list[i] || {}
        const nT = n.timestamp?.toDate ? n.timestamp.toDate().getTime() : new Date(n.timestamp || 0).getTime()
        if ((n.id && !target.id) ? false : (String(n.text || '') === txt && (n.authorId || '') === aid && nT === tA)) return i
      }
      return -1
    },
    async saveEdit(target) {
      if (!this.vacancy?.id) return
      const newText = this.editingText.trim(); if (!newText) return
      try {
        this.savingEdit = true
        const list = Array.isArray(this.vacancy.notesLog) ? [...this.vacancy.notesLog] : []
        const idx = this.findNoteIndexByIdOrMatch(list, target)
        if (idx === -1) throw new Error('Note not found')
        const old = list[idx] || {}
        list[idx] = { ...old, text: newText, isEdited: true, editedAt: new Date(), id: old.id || (Date.now()+ '_' + Math.random().toString(36).slice(2,8)) }
        await updateDoc(doc(db, 'vacancies', this.vacancy.id), { notesLog: list, updatedAt: serverTimestamp() })
        this.vacancy.notesLog = list
        this.cancelEdit()
      } catch (e) {
        console.error('Error editing note:', e)
        this.showErrorDialog('Failed to edit note. Please try again.', 'Error', 'OK')
      } finally { this.savingEdit = false }
    },
    async softDeleteNote(target) {
      if (!this.vacancy?.id) return
      try { await this.showConfirmDialog({ title: 'Delete message?', message: 'This message will be shown as deleted.', confirmText: 'Delete', cancelText: 'Cancel', color: '#dc3545' }) } catch(_) { return }
      try {
        const list = Array.isArray(this.vacancy.notesLog) ? [...this.vacancy.notesLog] : []
        const idx = this.findNoteIndexByIdOrMatch(list, target)
        if (idx === -1) throw new Error('Note not found')
        const old = list[idx] || {}
        list[idx] = { ...old, isDeleted: true, deletedAt: new Date(), id: old.id || (Date.now()+ '_' + Math.random().toString(36).slice(2,8)) }
        await updateDoc(doc(db, 'vacancies', this.vacancy.id), { notesLog: list, updatedAt: serverTimestamp() })
        this.vacancy.notesLog = list
      } catch (e) {
        console.error('Error deleting note:', e)
        this.showErrorDialog('Failed to delete note. Please try again.', 'Error', 'OK')
      }
    },
    formatNoteDate(ts) {
      try {
        if (!ts) return 'Just now'
        const d = ts.toDate ? ts.toDate() : new Date(ts)
        return d.toLocaleString()
      } catch (_) { return String(ts) }
    },
    scrollNotesToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatLog
        if (el && el.scrollHeight != null) el.scrollTop = el.scrollHeight
      })
    },
    async loadVacancy() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Loading vacancy with ID:', this.$route.params.id);
        const docRef = doc(db, 'vacancies', this.$route.params.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          this.vacancy = {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate(),
            updatedAt: docSnap.data().updatedAt?.toDate()
          };
          console.log('Vacancy loaded:', this.vacancy);
          this.scrollNotesToBottom()
          
          // If agencyId exists but no agencyName, try to fetch agency name
          if (this.vacancy.agencyId && !this.vacancy.agencyName) {
            await this.fetchAgencyName(this.vacancy.agencyId);
          }
        } else {
          this.error = 'Vacancy not found';
          console.log('Vacancy not found with ID:', this.$route.params.id);
        }
        
        this.loading = false;
      } catch (err) {
        this.error = 'Failed to load vacancy details. Please try again.';
        this.loading = false;
        console.error('Error loading vacancy:', err);
      }
    },
    async appendNote() {
      if (!this.newNote || !this.vacancy?.id) return
      try {
        this.savingNote = true
        const appStore = useAppStore()
        const currentUser = appStore.currentUser
        const isAgency = currentUser?.userType === 'Agency'
        
        // Get proper author name based on user type
        let authorName = 'Unknown User'
        if (isAgency) {
          authorName = currentUser?.agencyName || this.vacancy?.unitName || 'Property'
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
          id: Date.now() + '_' + Math.random().toString(36).slice(2,8),
          text: this.newNote,
          authorId: appStore.userId || currentUser?.uid || '',
          authorName: authorName,
          authorType: appStore.userType || currentUser?.userType || '',
          authorAvatarUrl: isAgency 
            ? (this.vacancy?.agencyProfileImageUrl || this.vacancy?.profileImageUrl || currentUser?.profileImageUrl || currentUser?.profileImage || '') 
            : (currentUser?.profileImageUrl || currentUser?.profileImage || ''),
          timestamp: new Date(),
          isEdited: false,
          isDeleted: false
        }
        
        await updateDoc(doc(db, 'vacancies', this.vacancy.id), { 
          notesLog: arrayUnion(note), 
          updatedAt: serverTimestamp() 
        })
        
        if (!this.vacancy.notesLog) this.vacancy.notesLog = []
        this.vacancy.notesLog.push(note)
        this.newNote = ''
        this.scrollNotesToBottom()
      } catch (e) {
        console.error('Error adding note:', e)
        this.showErrorDialog('Failed to add note. Please try again.', 'Error', 'OK')
      } finally {
        this.savingNote = false
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Not specified';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    async fetchAgencyName(agencyId) {
      try {
        const agencyRef = doc(db, 'users', agencyId);
        const agencySnap = await getDoc(agencyRef);
        if (agencySnap.exists()) {
          this.vacancy.agencyName = agencySnap.data().agencyName;
        }
      } catch (error) {
        console.error('Error fetching agency name:', error);
      }
    },
    
    editVacancy() {
      this.$router.push(`/edit-vacancy-${this.vacancy.id}`);
    },
    
    async deleteVacancy() {
      try {
        await this.showConfirmDialog({
          title: 'Delete vacancy?',
          message: `Are you sure you want to delete the vacancy for ${this.vacancy.unitName}?`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          color: '#dc3545'
        })
      } catch (_) {
        return
      }
      try {
        console.log('Deleting vacancy:', this.vacancy.id);
        await deleteDoc(doc(db, 'vacancies', this.vacancy.id));
        console.log('Vacancy deleted successfully');
        this.showSuccessDialog('Vacancy deleted successfully!', 'Success!', 'Continue', '/vacancies');
      } catch (error) {
        console.error('Error deleting vacancy:', error);
        this.showErrorDialog('Failed to delete vacancy. Please try again.', 'Error', 'OK');
      }
    }
  }
}
</script>

<style scoped>
.notes-section{margin-top:8px}
.chat-log{display:flex;flex-direction:column;gap:10px;max-height:320px;overflow-y:auto;padding:8px 0}
.chat-message{display:flex;align-items:flex-end;gap:8px}
.chat-message.mine{flex-direction:row-reverse}
.chat-avatar{width:28px;height:28px;border-radius:50%;background:#6b7280;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;overflow:hidden}
.chat-avatar-img{width:100%;height:100%;object-fit:cover;display:block}
.chat-bubble{max-width:55%;min-width:0;overflow-wrap:anywhere;word-break:break-word;background:#f2f4f7;color:#111;border-radius:12px;padding:10px 12px;box-shadow:0 1px 2px rgba(0,0,0,.06)}
.chat-message.mine .chat-bubble{background:#000;color:#fff}
.chat-header{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px}
.chat-header-right{display:flex;align-items:center;gap:8px}
.chat-author{font-weight:700;font-size:.8rem;opacity:.95}
.chat-time{font-size:.7rem;opacity:.7;margin-left:8px}
.chat-edited{font-size:.7rem;opacity:.7}
.chat-text{white-space:pre-wrap;word-wrap:break-word;line-height:1.35;text-align:center}
.chat-text.deleted{font-style:italic;opacity:.75}
.edit-area{background:#000;border-radius:10px;padding:6px}
.edit-area :deep(.v-field){}
.edit-area :deep(.v-field__input){}
.edit-area :deep(.v-field__outline){border-color:#444 !important}
.chat-input :deep(.v-field__input){min-height:44px}
.view-vacancy-page {
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

/* Title section styling */
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
  text-align: center;
  text-transform: uppercase;
}

/* Content card styling */
.content-card {
  background: white;
  border-radius: 0 0 12px 12px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Loading and error states */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-text {
  margin-top: 16px;
  color: #666;
  font-size: 1.1rem;
}

.error-title {
  margin: 16px 0 8px 0;
  color: #d32f2f;
  font-size: 1.25rem;
}

.error-message {
  color: #666;
  margin-bottom: 24px;
}

/* Detail items styling */
.vacancy-details {
  padding: 24px;
}

.detail-item {
  margin-bottom: 24px;
}

.detail-label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1.1rem;
  color: #000;
  line-height: 1.4;
}

.contact-link {
  color: #1976d2;
  text-decoration: none;
}

.contact-link:hover {
  text-decoration: underline;
}

.notes-text {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
  font-style: italic;
}

/* Action buttons */
.action-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  min-width: 160px;
  height: 44px;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.gap-4 {
  gap: 16px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .view-vacancy-page {
    padding: 10px;
  }
  
  .page-title {
    font-size: 1.1rem;
  }
  
  .back-btn {
    width: 140px;
    height: 40px;
  }
  
  .vacancy-details {
    padding: 16px;
  }
  
  .action-btn {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .gap-4 {
    flex-direction: column;
    gap: 8px;
  }
}
/* Tabs styling */
.property-tabs {
  background-color: #f8f9fa;
}

.property-tabs :deep(.tab-label) {
  font-weight: 500;
  text-transform: none;
  transition: color 0.2s ease;
}

.property-tabs :deep(.tab-label.v-tab--selected) {
  font-weight: 600;
  background-color: white;
}

.property-tabs :deep(.v-tabs-slider) {
  background-color: #000000 !important;
}

.property-tabs :deep(.tab--details) {
  color: #1e88e5;
}

.property-tabs :deep(.tab--details.v-tab--selected) {
  color: #0d47a1;
}

.property-tabs :deep(.tab--documents) {
  color: #fb8c00;
}

.property-tabs :deep(.tab--documents.v-tab--selected) {
  color: #ef6c00;
}

.property-tabs :deep(.tab--notes) {
  color: #43a047;
}

.property-tabs :deep(.tab--notes.v-tab--selected) {
  color: #1b5e20;
}

.property-tabs :deep(.tab--archive) {
  color: #8e24aa;
}

.property-tabs :deep(.tab--archive.v-tab--selected) {
  color: #5e35b1;
}
</style>
