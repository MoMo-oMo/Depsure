<template>
  <div class="edit-vacancy-page">
    <v-container fluid>
      
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
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
      </v-row>

      <!-- Title Section -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="title-section">
            <h1 class="page-title">Edit Vacancy</h1>
          </div>
          
          <div class="form-card" elevation="0">
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

            <!-- Edit Form -->
            <v-form v-else-if="vacancy" ref="form" v-model="valid" lazy-validation>
                  <v-card-text>
                <v-row>
                  <!-- Unit Name -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="vacancy.unitName"
                      label="Unit Name/Address"
                      variant="outlined"
                      class="custom-input"
                      :rules="unitNameRules"
                      required
                      @input="validateForm"
                      :disabled="isAgency"
                    />
                  </v-col>

                  <!-- Date Vacated (shown as Lease End Date for agents) -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="vacancy.dateVacated"
                      :label="isAgency ? 'Lease End Date' : 'Date Vacated'"
                      variant="outlined"
                      type="date"
                      class="custom-input"
                      :rules="dateVacatedRules"
                      required
                      @input="validateForm"
                      :disabled="false"
                    />
                  </v-col>

                  

                </v-row>
                  </v-card-text>

                  <!-- Action Buttons -->
                  <v-card-actions class="pa-4">
                    <v-spacer />
                    <v-btn
                      color="grey"
                      variant="outlined"
                      @click="goBack"
                      class="cancel-btn"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      color="black"
                      variant="elevated"
                      @click="saveVacancy"
                      :disabled="!valid || saving"
                      :loading="saving"
                      class="save-btn"
                    >
                      {{ saving ? 'Saving...' : 'Update Vacancy' }}
                    </v-btn>
                  </v-card-actions>
                <!-- Notes removed - using live chat -->
                <div style="display:none;">
                  <v-card-text>
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
                  </v-card-text>
                </div>
            </v-form>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { db } from '@/firebaseConfig'
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp, collection, addDoc, deleteDoc } from 'firebase/firestore'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { useAppStore } from '@/stores/app'

export default {
  name: 'EditVacancyPage',
  setup() {
    const { showSuccessDialog, showErrorDialog, showConfirmDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    return { showSuccessDialog, showErrorDialog, showConfirmDialog, logAuditEvent, auditActions, resourceTypes }
  },
  computed: {
    currentUserId() {
      const appStore = useAppStore()
      return appStore.userId
    },
    isAgency() {
    const appStore = useAppStore()
    const user = appStore.currentUser
    // Include both Agency users and Agency Admin users
    return user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency')
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
      activeTab: 'details',
      vacancy: null,
      loading: true,
      saving: false,
      error: null,
      valid: false,
      newNote: '',
      savingNote: false,
      editingKey: null,
      editingText: '',
      savingEdit: false,
      // Validation rules
      unitNameRules: [
        v => !!v || 'Unit Name is required',
        v => v.length >= 3 || 'Unit Name must be at least 3 characters'
      ],
      dateVacatedRules: [
        v => !!v || 'Date Vacated is required'
      ],
      
    }
  },
  mounted() {
    console.log('EditVacancyPage mounted with ID:', this.$route.params.id);
    document.title = 'Edit Vacancy - Depsure';
    this.loadVacancy().then(() => { this.scrollNotesToBottom() })
  },
  watch: {
    vacancy: {
      handler(newVacancy) {
        if (newVacancy) {
          // Trigger form validation after vacancy is loaded
          this.$nextTick(() => {
            if (this.$refs.form) {
              this.valid = this.$refs.form.validate();
            }
          });
        }
      },
      immediate: true
    },
  },
  methods: {
    goBack() {
      try {
        const appStore = useAppStore();
        const user = appStore.currentUser;
        const isAgency = user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency');
        if (isAgency) { this.$router.push('/onboard-units'); return }
      } catch(_) {}
      const from = this.$route?.query?.from
      if (from === 'onboard') this.$router.push('/onboard-units')
      else this.$router.push('/vacancies')
    },
    

    noteInitials(name) { if (!name) return '?'; const parts = String(name).trim().split(/\s+/); const a = parts[0]?.[0] || ''; const b = parts[1]?.[0] || ''; return (a + b).toUpperCase() || a.toUpperCase() || '?'; },
    formatNoteDate(ts) { try { if (!ts) return 'Just now'; const d = ts.toDate ? ts.toDate() : new Date(ts); return d.toLocaleString() } catch(_) { return String(ts) } },
    scrollNotesToBottom() { this.$nextTick(()=>{ const el=this.$refs.chatLog; if(el&&el.scrollHeight!=null) el.scrollTop=el.scrollHeight; }) },
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
    
    validateForm() {
      if (this.$refs.form) {
        this.valid = this.$refs.form.validate();
        console.log('Form validation result:', this.valid);
        console.log('Form errors:', this.$refs.form.errors);
      }
    },
    
    async saveVacancy() {
      this.validateForm();
      if (this.valid) {
        this.saving = true;
        

        try {
          console.log('Updating vacancy:', this.vacancy);
          
          // Prepare update data
          const updateData = {
            unitName: this.vacancy.unitName,
            dateVacated: this.vacancy.dateVacated,
                        notes: this.vacancy.notes || "",
            updatedAt: new Date()
          };
          
          // Log the update action before saving
          await this.logAuditEvent(
            this.auditActions.UPDATE,
            {
              vacancyId: this.vacancy.id,
              unitName: updateData.unitName,
              updatedFields: Object.keys(updateData),
              updatedData: updateData
            },
            this.resourceTypes.VACANCY,
            this.vacancy.id
          )
          
          // Update the document
          const docRef = doc(db, 'vacancies', this.vacancy.id);
          await updateDoc(docRef, updateData);

          console.log('Vacancy updated successfully');
          // Pass the 'from' query parameter to maintain navigation context
          const from = this.$route?.query?.from
          const redirectUrl = from === 'onboard' ? `/view-vacancy-${this.vacancy.id}?from=onboard` : `/view-vacancy-${this.vacancy.id}`
          this.showSuccessDialog('Vacancy updated successfully!', 'Success!', 'Continue', redirectUrl);
        } catch (err) {
          console.error('Error updating vacancy:', err);
          this.showErrorDialog('Failed to update vacancy. Please try again.', 'Error', 'OK');
        } finally {
          this.saving = false;
        }
      }
    },
    async appendNote() {
      if (!this.newNote || !this.vacancy?.id) return
      try {
        this.savingNote = true
        const appStore = useAppStore()
        const currentUser = appStore.currentUser
        const isAgency = currentUser?.userType === 'Agency' || (currentUser?.userType === 'Admin' && currentUser?.adminScope === 'agency')
        
        // Get proper author name based on user type
        let authorName = 'Unknown User'
        if (isAgency) {
          authorName = currentUser?.agencyName || this.vacancy?.unitName || this.vacancy?.propertyName || 'Property'
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
    }
  }
}
</script>

<style scoped>
.edit-vacancy-page {
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

/* Form card styling */
.form-card {
  background: white;
  border-radius: 0 0 12px 12px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Chat-like notes styling to match view page */
.notes-section{margin-top:8px}
.chat-log{display:flex;flex-direction:column;gap:10px;max-height:320px;overflow-y:auto;padding:8px 0}
.chat-message{display:flex;align-items:flex-end;gap:8px}
.chat-message.mine{flex-direction:row-reverse}
.chat-avatar{width:28px;height:28px;border-radius:50%;background:#6b7280;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600}
.chat-avatar-img{width:100%;height:100%;border-radius:50%;object-fit:cover}
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

/* Input field styling */
.custom-input .v-field {
  border-radius: 8px;
}



.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}

/* Button styling */
.cancel-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 120px;
  height: 44px;
}

.cancel-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.save-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 160px;
  height: 44px;
  background-color: black !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.save-btn:hover:not(:disabled) {
  background-color: #333 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .edit-vacancy-page {
    padding: 10px;
  }
  
  .page-title {
    font-size: 1.1rem;
  }
  
  .back-btn {
    width: 140px;
    height: 40px;
  }
  
  .cancel-btn,
  .save-btn {
    width: 100%;
    margin-bottom: 8px;
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

