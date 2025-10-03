<template>
  <div class="edit-inspection-page">
    <v-container fluid>

      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn @click="goBack" class="back-btn">Back</v-btn>
        </v-col>
      </v-row>

      <!-- Title Section -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="title-section">
            <h1 class="page-title">Edit Inspection Entry</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading inspection entry details...</p>
            </v-card-text>
          </v-card>

          <!-- Error -->
          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon icon="mdi-alert" color="error" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <!-- Form -->
          <div v-else class="form-card" elevation="0">
            <v-form ref="form" v-model="valid" lazy-validation>
                  <v-card-text>
                <v-row>
                  <!-- Unit Name -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.unitName"
                      label="Unit Name"
                      variant="outlined"
                      class="custom-input"
                      :rules="unitNameRules"
                      required
                    />
                  </v-col>

                  <!-- Inspection Required (always Yes) -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      :model-value="'Yes'"
                      label="Inspection Required"
                      variant="outlined"
                      class="custom-input"
                      readonly
                    />
                  </v-col>

                  <!-- Contact Person -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.contactPerson"
                      label="Contact Person"
                      variant="outlined"
                      class="custom-input"
                      :rules="contactPersonRules"
                      required
                    />
                  </v-col>

                  <!-- Contact Number -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.contactNumber"
                      label="Contact Number"
                      variant="outlined"
                      class="custom-input"
                      :rules="contactNumberRules"
                      required
                    />
                  </v-col>

                  <!-- Appointment Made -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.appointmentMade"
                      label="Appointment Made (Yes/No)"
                      variant="outlined"
                      class="custom-input"
                      :items="['Yes','No']"
                      :rules="appointmentMadeRules"
                      required
                    />
                  </v-col>

                  <!-- Inspection Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.inspectionDate"
                      label="Inspection Date"
                      type="date"
                      variant="outlined"
                      class="custom-input"
                      :rules="appointmentMadeIsYes ? requiredRule : []"
                      :disabled="!appointmentMadeIsYes"
                      :placeholder="appointmentMadeIsYes ? '' : 'Not applicable'"
                    />
                  </v-col>

                  <!-- Inspection Time (new) -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.inspectionTime"
                      label="Inspection Time"
                      type="time"
                      variant="outlined"
                      class="custom-input"
                      :rules="appointmentMadeIsYes ? requiredRule : []"
                      :disabled="!appointmentMadeIsYes"
                      :placeholder="appointmentMadeIsYes ? '' : 'Not applicable'"
                    />
                  </v-col>

                  <!-- Quotes Needed -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.quotesNeeded"
                      label="Quotes Needed"
                      variant="outlined"
                      class="custom-input"
                      :items="['Yes','No']"
                      :rules="quotesNeededRules"
                      required
                    />
                  </v-col>

                  <!-- Status (Admin editable) -->
                  <v-col cols="12" md="6">
                    <template v-if="userType === 'Admin'">
                      <v-select
                        v-model="entry.status"
                        label="Status"
                        variant="outlined"
                        class="custom-input"
                        :items="['Active', 'Pending', 'Completed']"
                        :rules="statusRules"
                        required
                      />
                    </template>
                    <template v-else>
                      <v-text-field
                        :model-value="entry.status"
                        label="Status"
                        variant="outlined"
                        class="custom-input"
                        readonly
                      />
                    </template>
                  </v-col>

                  <!-- Priority -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.priority"
                      label="Priority"
                      variant="outlined"
                      class="custom-input"
                      :items="['Low', 'Medium', 'High', 'Urgent']"
                      :rules="priorityRules"
                      required
                    />
                  </v-col>

                </v-row>
                  </v-card-text>

                  <!-- Action Buttons -->
                  <v-card-actions class="pa-4">
                    <v-spacer />
                    <v-btn color="grey" variant="outlined" @click="goBack" class="cancel-btn">
                      Cancel
                    </v-btn>
                    <v-btn color="black" variant="elevated" @click="saveEntry" :disabled="!valid || saving" :loading="saving" class="save-btn">
                      {{ saving ? 'Saving...' : 'Save Changes' }}
                    </v-btn>
                  </v-card-actions>
                <!-- Notes removed - using live chat -->
                <div style="display:none;">
                  <v-card-text>
                    <div class="notes-section">
                      <h3 class="mb-2">Notes</h3>
                      <div v-if="(entry.notesLog && entry.notesLog.length)" class="chat-log" ref="chatLog">
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
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { useAppStore } from '@/stores/app'

export default {
  name: 'EditInspectionPage',
  setup() {
    const { showSuccessDialog, showErrorDialog, showConfirmDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    return { showSuccessDialog, showErrorDialog, showConfirmDialog, logAuditEvent, auditActions, resourceTypes }
  },
  data() {
    return {
      activeTab: 'details',
      entry: {
        id: null,
        unitName: "",
        inspectionRequired: "Yes",
        contactPerson: "",
        contactNumber: "",
        appointmentMade: "No",
        inspectionDate: "",
        inspectionTime: "",
        quotesNeeded: "No",
        status: "Pending",
        priority: "Medium",
        notes: "",
        notesLog: [],
        agencyId: "",
        agencyName: ""
      },
      loading: true,
      saving: false,
      error: null,
      valid: true,
      newNote: '',
      savingNote: false,
      // Inline edit state for notes
      editingKey: null,
      editingText: '',
      savingEdit: false,
      unitNameRules: [v => !!v || "Unit Name is required"],
      inspectionRequiredRules: [],
      contactPersonRules: [v => !!v || "Contact Person is required"],
      contactNumberRules: [v => !!v || "Contact Number is required"],
      appointmentMadeRules: [v => !!v || "Appointment Made is required"],
      inspectionDateRules: [],
      requiredRule: [v => !!v || "This field is required"],
      quotesNeededRules: [v => !!v || "Quotes Needed is required"],
      statusRules: [v => !!v || "Status is required"],
      priorityRules: [v => !!v || "Priority is required"]
    };
  },
  computed: {
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
    },
    appointmentMadeIsYes() {
      return String(this.entry.appointmentMade).toLowerCase() === 'yes';
    }
  },
  mounted() {
    document.title = "Edit Inspection Entry - Depsure";
    const entryId = this.$route.params.id;
    if (entryId) this.loadEntryData(entryId);
    else { this.error = "Entry ID not found"; this.loading = false; }
  },
  methods: {
    goBack() {
      const appStore = useAppStore();
      const user = appStore.currentUser;
      const isAgency = user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency');
      
      // Agency users always go back to onboard-units
      if (isAgency) {
        this.$router.push('/onboard-units');
      } else {
        // Admin/Super Admin go to inspections
        this.$router.push('/inspections');
      }
    },
    scrollNotesToBottom() {
      this.$nextTick(() => {
        const el = this.$refs?.chatLog
        if (el && el.scrollHeight != null) el.scrollTop = el.scrollHeight
      })
    },
    // Begin notes edit/delete helpers
    startEdit(note) {
      this.editingKey = this.noteKey(note)
      this.editingText = String(note.text || '')
    },
    cancelEdit() {
      this.editingKey = null
      this.editingText = ''
    },
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
      if (target.id) {
        const i = list.findIndex(n => n && n.id === target.id)
        if (i !== -1) return i
      }
      // Fallback match (legacy notes without id): by authorId + text + timestamp
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
      if (!this.entry?.id) return
      const newText = this.editingText.trim()
      if (!newText) return
      try {
        this.savingEdit = true
        const list = Array.isArray(this.entry.notesLog) ? [...this.entry.notesLog] : []
        const idx = this.findNoteIndexByIdOrMatch(list, target)
        if (idx === -1) throw new Error('Note not found')
        const old = list[idx] || {}
        list[idx] = { ...old, text: newText, isEdited: true, editedAt: new Date(), id: old.id || (Date.now()+ '_' + Math.random().toString(36).slice(2,8)) }
        await updateDoc(doc(db, 'inspections', this.entry.id), { notesLog: list, updatedAt: serverTimestamp() })
        this.entry.notesLog = list
        this.cancelEdit()
      } catch (e) {
        console.error('Error editing note:', e)
        this.showErrorDialog('Failed to edit note. Please try again.', 'Error', 'OK')
      } finally {
        this.savingEdit = false
      }
    },
    async softDeleteNote(target) {
      if (!this.entry?.id) return
      try {
        await this.showConfirmDialog({ title: 'Delete message?', message: 'This message will be shown as deleted.', confirmText: 'Delete', cancelText: 'Cancel', color: '#dc3545' })
      } catch (_) { return }
      try {
        const list = Array.isArray(this.entry.notesLog) ? [...this.entry.notesLog] : []
        const idx = this.findNoteIndexByIdOrMatch(list, target)
        if (idx === -1) throw new Error('Note not found')
        const old = list[idx] || {}
        list[idx] = { ...old, isDeleted: true, deletedAt: new Date(), id: old.id || (Date.now()+ '_' + Math.random().toString(36).slice(2,8)) }
        await updateDoc(doc(db, 'inspections', this.entry.id), { notesLog: list, updatedAt: serverTimestamp() })
        this.entry.notesLog = list
      } catch (e) {
        console.error('Error deleting note:', e)
        this.showErrorDialog('Failed to delete note. Please try again.', 'Error', 'OK')
      }
    },
    // End notes edit/delete helpers
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
    async loadEntryData(id) {
      try {
        console.log('Loading inspection entry with ID:', id);
        const docRef = doc(db, 'inspections', id);
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
          console.log('Inspection entry not found with ID:', id);
        }
      } catch (error) {
        console.error('Error loading inspection entry:', error);
        this.error = "Failed to load inspection entry";
      } finally {
        this.loading = false;
      }
    },
    
    async saveEntry() {
      if (this.$refs.form.validate()) {
        this.saving = true;
        try {
          console.log("Saving inspection entry:", this.entry);
          
          // Prepare update data
          const updateData = {
            unitName: this.entry.unitName,
            inspectionRequired: 'Yes',
            contactPerson: this.entry.contactPerson,
            contactNumber: this.entry.contactNumber,
            appointmentMade: this.entry.appointmentMade,
            inspectionDate: this.entry.inspectionDate,
            inspectionTime: this.entry.inspectionTime || '',
            quotesNeeded: this.entry.quotesNeeded,
            status: this.entry.status,
            priority: this.entry.priority,
            notes: this.entry.notes || "",
            updatedAt: new Date()
          };
          
          // Log the update action before saving
          await this.logAuditEvent(
            this.auditActions.UPDATE,
            {
              inspectionId: this.entry.id,
              unitName: updateData.unitName,
              updatedFields: Object.keys(updateData),
              updatedData: updateData
            },
            this.resourceTypes.INSPECTION,
            this.entry.id
          )
          
          // Update the document
          const docRef = doc(db, 'inspections', this.entry.id);
          await updateDoc(docRef, updateData);
          
          console.log('Inspection entry updated successfully');
          this.showSuccessDialog("Inspection entry saved successfully!", "Success!", "Continue", `/view-inspection-${this.entry.id}`);
        } catch (error) {
          console.error('Error updating inspection entry:', error);
          this.showErrorDialog('Failed to save inspection entry. Please try again.', 'Error', 'OK');
        } finally {
          this.saving = false;
        }
      }
    },
    async appendNote() {
      if (!this.newNote || !this.entry?.id) return
      try {
        this.savingNote = true
        const appStore = useAppStore()
        const currentUser = appStore.currentUser
        const isAgency = currentUser?.userType === 'Agency'
        
        // Get proper author name based on user type
        let authorName = 'Unknown User'
        if (isAgency) {
          authorName = currentUser?.agencyName || this.entry?.unitName || this.entry?.propertyName || 'Property'
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
            ? (this.entry?.agencyProfileImageUrl || this.entry?.profileImageUrl || currentUser?.profileImageUrl || currentUser?.profileImage || '') 
            : (currentUser?.profileImageUrl || currentUser?.profileImage || ''),
          timestamp: new Date(),
          isEdited: false,
          isDeleted: false
        }
        
        await updateDoc(doc(db, 'inspections', this.entry.id), { 
          notesLog: arrayUnion(note), 
          updatedAt: serverTimestamp() 
        })
        
        if (!this.entry.notesLog) this.entry.notesLog = []
        this.entry.notesLog.push(note)
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
};
</script>

<style scoped>
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
.edit-inspection-page {
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
.back-btn:hover { background-color: #333 !important; border-color: #333 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.5); }

/* Title section */
.title-section { background: black; color: white; padding: 0.75rem; border-radius: 12px 12px 0 0; margin-bottom: 0; }
.page-title { font-size: 1.25rem; font-weight: 600; color: white; margin: 0; text-align: center; text-transform: uppercase; }

/* Form card */
.form-card { background: white; border-radius: 12px; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }

/* Input styling */
.custom-input .v-field { border-radius: 8px; }

.custom-input :deep(.v-field__outline) { border-color: #e9ecef !important; }

/* Buttons */
.cancel-btn { font-weight: 500; text-transform: none; border-radius: 8px; width: 120px; height: 44px; }
.save-btn { font-weight: 500; text-transform: none; border-radius: 8px; width: 160px; height: 44px; background-color: black !important; color: white !important; }
.save-btn:hover:not(:disabled) { background-color: #333 !important; }

/* Responsive */
@media (max-width: 768px) {
  .edit-inspection-page { padding: 10px; }
  .page-title { font-size: 1.1rem; }
  .back-btn { width: 140px; height: 40px; }
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
