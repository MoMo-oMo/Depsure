<template>
  <div class="edit-inspection-page">
    <v-container fluid>

      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn @click="$router.push('/inspections')" class="back-btn">Back</v-btn>
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
                    <v-btn color="grey" variant="outlined" @click="$router.push('/inspections')" class="cancel-btn">
                      Cancel
                    </v-btn>
                    <v-btn color="black" variant="elevated" @click="saveEntry" :disabled="!valid || saving" :loading="saving" class="save-btn">
                      {{ saving ? 'Saving...' : 'Save Changes' }}
                    </v-btn>
                  </v-card-actions>
                </v-window-item>
                <v-window-item value="notes">
                  <v-card-text>
                    <div class="notes-section">
                      <h3 class="mb-2">Notes</h3>
                      <div v-if="(entry.notesLog && entry.notesLog.length)" class="chat-log" ref="chatLog">
                        <div v-for="(n, idx) in sortedNotes" :key="idx" class="chat-message" :class="{ 'mine': n.authorId === currentUserId, 'other': n.authorId !== currentUserId }">
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
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    return { showSuccessDialog, showErrorDialog, logAuditEvent, auditActions, resourceTypes }
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
    scrollNotesToBottom() {
      this.$nextTick(() => {
        const el = this.$refs?.chatLog
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
          text: this.newNote,
          authorId: appStore.userId || currentUser?.uid || '',
          authorName: authorName,
          authorType: appStore.userType || currentUser?.userType || '',
          authorAvatarUrl: isAgency 
            ? (this.entry?.agencyProfileImageUrl || this.entry?.profileImageUrl || currentUser?.profileImageUrl || currentUser?.profileImage || '') 
            : (currentUser?.profileImageUrl || currentUser?.profileImage || ''),
          timestamp: new Date()
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
.chat-bubble{max-width:75%;background:#3a3f44;color:#fff;border-radius:10px;padding:8px 12px;box-shadow:0 1px 3px rgba(0,0,0,.18)}
.chat-message.mine .chat-bubble{background:#000}
.chat-header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px}
.chat-author{font-weight:700;font-size:.8rem;opacity:.95}
.chat-time{font-size:.7rem;opacity:.7;margin-left:8px}
.chat-text{white-space:pre-wrap;word-wrap:break-word;line-height:1.35}
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
.page-title { font-size: 1.25rem; font-weight: 600; color: white; margin: 0; text-align: left; }

/* Form card */
.form-card { background: white; border-radius: 12px; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }

/* Input styling */
.custom-input .v-field { border-radius: 8px; }
.custom-input :deep(.v-field__input) { background-color: white !important; color: #000000 !important; }
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
</style>
