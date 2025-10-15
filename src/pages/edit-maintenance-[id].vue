<template>
  <div class="edit-maintenance-page">
    <v-container fluid>

      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
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
            <h1 class="page-title">Edit Maintenance Entry</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading maintenance entry details...</p>
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
                  <!-- Property Name -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.unitName"
                      label="Property Name"
                      variant="outlined"
                      class="custom-input"
                      :rules="unitNameRules"
                      required
                    />
                  </v-col>

                  <!-- Unit Number -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.unitNumber"
                      label="Unit Number"
                      variant="outlined"
                      class="custom-input"
                      :rules="unitNumberRules"
                      required
                    />
                  </v-col>

                  <!-- Contact Person for Keys -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.contactPerson"
                      label="Contact Person for Keys"
                      variant="outlined"
                      class="custom-input"
                      :rules="contactPersonRules"
                      required
                    />
                  </v-col>
                  
                  <!-- Contact Person Number -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.contactPersonNumber"
                      label="Contact Person Number"
                      variant="outlined"
                      class="custom-input"
                      type="tel"
                      autocomplete="tel"
                      prepend-inner-icon="mdi-phone"
                    />
                  </v-col>

                  <!-- Request Upload Section (PDF only) -->
                  <v-col cols="12">
                    <div class="upload-row">
                      <v-file-input
                        :key="`quotes-${quoteInputKey}`"
                        v-model="newQuoteFiles"
                        label="Upload Request (PDF only)"
                        variant="outlined"
                        class="custom-input file-input-flex"
                        accept=".pdf"
                        multiple
                        show-size
                        prepend-icon="mdi-file-pdf-box"
                        :loading="uploadingQuotes"
                        :rules="quoteFileRules"
                        hint="Only PDF files are allowed. Maximum size: 10MB per file"
                        persistent-hint
                      />
                      <v-btn
                        color="black"
                        variant="elevated"
                        class="upload-doc-btn"
                        :disabled="!newQuoteFiles || newQuoteFiles.length === 0 || uploadingQuotes"
                        :loading="uploadingQuotes"
                        @click="uploadQuotes"
                      >
                        Upload
                      </v-btn>
                    </div>

                    <!-- Existing Uploaded Requests -->
                    <div v-if="entry.quotes && entry.quotes.length > 0" class="existing-quotes mt-4">
                      <h5 class="existing-title">Uploaded Requests:</h5>
                      <div class="quote-list">
                        <div v-for="(quote, index) in entry.quotes" :key="`quote-${index}`" class="quote-item">
                          <v-icon color="primary" class="mr-2">mdi-file-pdf-box</v-icon>
                          <span class="quote-name">{{ quote.fileName }}</span>
                          <v-btn
                            size="small"
                            color="primary"
                            variant="outlined"
                            @click="viewQuote(quote)"
                            class="view-btn"
                          >
                            View
                          </v-btn>
                          <v-btn
                            size="small"
                            color="error"
                            variant="outlined"
                            @click="deleteQuote(index)"
                            class="delete-btn"
                          >
                            Delete
                          </v-btn>
                        </div>
                      </div>
                    </div>
                  </v-col>

                </v-row>
                  </v-card-text>
                  <!-- Action Buttons -->
                  <v-card-actions class="pa-4">
                    <v-spacer />
                    <v-btn
                      v-if="entry.quoteFileName && entry.quoteFileURL"
                      color="black"
                      variant="elevated"
                      class="view-quote-btn"
                      @click="showQuoteDialog = true"
                    >
                      View Quote Instructions
                    </v-btn>
                    <v-btn
                      v-if="entry.quoteFileName && entry.quoteFileURL"
                      color="error"
                      variant="outlined"
                      class="delete-quote-btn"
                      @click="deleteQuoteFile"
                      :disabled="saving"
                    >
                      Delete Quote
                    </v-btn>
                    <v-btn
                      color="grey"
                      variant="outlined"
                      class="cancel-btn"
                      @click="goBack"
                      :disabled="saving"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      color="black"
                      variant="elevated"
                      class="submit-btn"
                      :disabled="!valid || saving"
                      :loading="saving"
                      @click="saveEntry"
                    >
                      {{ saving ? 'Saving...' : 'Submit Request' }}
                    </v-btn>
                  </v-card-actions>
                <!-- Notes tab removed - using live chat instead -->
                <div style="display: none;">
                  <v-card-text>
                    <div class="notes-section" style="display: none;">
                      <h3 class="mb-2">Notes</h3>
                      <div v-if="(entry.notesLog && entry.notesLog.length)" class="chat-log" ref="chatLog">
                        <div
                          v-for="(n, idx) in sortedNotes"
                          :key="noteKey(n)"
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

                      <!-- Append note input (Admin and Agency) -->
                      <div v-if="userType === 'Admin' || userType === 'Super Admin' || isAgencyUser" class="chat-input mt-4">
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
                          <v-btn
                            color="black"
                            variant="elevated"
                            :disabled="!newNote || savingNote"
                            :loading="savingNote"
                            @click="appendNote"
                          >
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

    <!-- Quote Instructions Dialog -->
    <div v-if="showQuoteDialog" class="quote-overlay" @click.self="showQuoteDialog = false">
      <div class="quote-dialog">
        <!-- colored card behind -->
        <div class="quote-dialog-bg"></div>
        <!-- main white card -->
        <div class="quote-dialog-inner">
          <button class="quote-close" @click="showQuoteDialog = false">&times;</button>

          <div class="quote-icon">
            <v-icon>mdi-file-pdf-box</v-icon>
          </div>

          <h2 class="quote-title">Quote Document</h2>
          <p class="quote-subtitle">{{ currentQuoteName }}</p>
          
          <div v-if="currentQuoteURL" class="pdf-container">
            <div class="pdf-controls">
              <button class="zoom-btn" @click="zoomOut">-</button>
              <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
              <button class="zoom-btn" @click="zoomIn">+</button>
            </div>
            <div class="pdf-wrapper" :style="{ transform: `scale(${zoomLevel})` }">
              <iframe
                :src="currentQuoteURL"
                width="100%"
                height="400"
                frameborder="0"
                class="pdf-iframe"
              />
            </div>
          </div>
          <div v-else class="no-pdf-message">
            <v-icon color="error" size="48">mdi-file-pdf-box</v-icon>
            <p>PDF file not available</p>
          </div>

          <div class="quote-actions">
            <button class="quote-button secondary" @click="showQuoteDialog = false">
              Close
            </button>
            <button 
              v-if="currentQuoteURL"
              class="quote-button primary" 
              @click="openInNewTab"
            >
              Open in New Tab
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { db, storage } from '@/firebaseConfig'
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { useAppStore } from '@/stores/app'

export default {
  name: "EditMaintenancePage",
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
        agencyId: "",
        unitName: "",
        unitNumber: "",
        contactPerson: "",
        contactPersonNumber: "",
        noticeGiven: "No",
        vacateDate: "",
        contactNumber: "",
        address: "",
        status: "Pending",
        priority: "Medium",
        estimatedCost: 0,
        notes: "",
        quotes: []
      },
      agencies: [],
      agenciesLoading: false,
      loading: true,
      saving: false,
      uploadingQuotes: false,
      error: null,
      valid: true,
      showQuoteDialog: false,
      currentQuoteURL: '',
      currentQuoteName: '',
      newQuoteFiles: [],
      quoteInputKey: 0,
      zoomLevel: 1,
      newNote: '',
      savingNote: false,
      editingKey: null,
      editingText: '',
      savingEdit: false,
      // Validation rules
      agencyRules: [v => !!v || "Agency selection is required"],
      unitNameRules: [v => !!v || "Unit Name is required"],
      unitNumberRules: [v => !!v || "Unit Number is required"],
      contactPersonRules: [v => !!v || "Contact Person is required"],
      noticeGivenRules: [v => !!v || "Notice Given is required"],
      vacateDateRules: [v => !!v || "Vacate Date is required"],
      contactNumberRules: [v => !!v || "Contact Number is required"],
      addressRules: [v => !!v || "Address is required"],
      statusRules: [v => !!v || "Status is required"],
      priorityRules: [v => !!v || "Priority is required"],
      estimatedCostRules: [v => v >= 0 || "Project budget cannot be negative"],
      quoteFileRules: [
        v => !v || !v.length || v.every(file => file.size <= 50 * 1024 * 1024) || "Each file must be less than 50MB",
        v => !v || !v.length || v.every(file => file.type === 'application/pdf') || "Only PDF files are allowed"
      ]
    };
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
      const notes = this.entry?.notesLog || []
      return [...notes].sort((a,b) => {
        const ad = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0)
        const bd = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0)
        return ad - bd
      })
    }
  },
  async mounted() {
    document.title = "Edit Maintenance Entry - Depsure";
    const entryId = this.$route.params.id;
    if (entryId) {
      await this.fetchAgencies();
      this.loadEntryData(entryId);
    } else {
      this.error = "Entry ID not found";
      this.loading = false;
    }
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
      else this.$router.push('/maintenance')
    },
    goBack() {
      const from = this.$route?.query?.from
      if (from === 'onboard') this.$router.push('/onboard-units')
      else this.$router.push('/maintenance')
    },
    scrollNotesToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatLog
        if (el && el.scrollHeight != null) {
          el.scrollTop = el.scrollHeight
        }
      })
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
      if (!this.entry?.id) return
      const newText = this.editingText.trim(); if (!newText) return
      try {
        this.savingEdit = true
        const list = Array.isArray(this.entry.notesLog) ? [...this.entry.notesLog] : []
        const idx = this.findNoteIndexByIdOrMatch(list, target)
        if (idx === -1) throw new Error('Note not found')
        const old = list[idx] || {}
        list[idx] = { ...old, text: newText, isEdited: true, editedAt: new Date(), id: old.id || (Date.now()+ '_' + Math.random().toString(36).slice(2,8)) }
        await updateDoc(doc(db, 'maintenance', this.entry.id), { notesLog: list, updatedAt: serverTimestamp() })
        this.entry.notesLog = list
        this.cancelEdit()
      } catch (e) {
        console.error('Error editing note:', e)
        this.showErrorDialog('Failed to edit note. Please try again.', 'Error', 'OK')
      } finally { this.savingEdit = false }
    },
    async softDeleteNote(target) {
      if (!this.entry?.id) return
      try { await this.showConfirmDialog({ title: 'Delete message?', message: 'This message will be shown as deleted.', confirmText: 'Delete', cancelText: 'Cancel', color: '#dc3545' }) } catch(_) { return }
      try {
        const list = Array.isArray(this.entry.notesLog) ? [...this.entry.notesLog] : []
        const idx = this.findNoteIndexByIdOrMatch(list, target)
        if (idx === -1) throw new Error('Note not found')
        const old = list[idx] || {}
        list[idx] = { ...old, isDeleted: true, deletedAt: new Date(), id: old.id || (Date.now()+ '_' + Math.random().toString(36).slice(2,8)) }
        await updateDoc(doc(db, 'maintenance', this.entry.id), { notesLog: list, updatedAt: serverTimestamp() })
        this.entry.notesLog = list
      } catch (e) {
        console.error('Error deleting note:', e)
        this.showErrorDialog('Failed to delete note. Please try again.', 'Error', 'OK')
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
    async loadEntryData(id) {
      try {
        const docRef = doc(db, 'maintenance', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          this.entry = {
            id: docSnap.id,
            agencyId: data.agencyId || "",
            unitName: data.unitName || "",
            unitNumber: data.unitNumber || "",
            contactPerson: data.contactPerson || "",
            contactPersonNumber: data.contactPersonNumber || "",
            noticeGiven: data.noticeGiven || "No",
            vacateDate: data.vacateDate || "",
            contactNumber: data.contactNumber || "",
            address: data.address || "",
            status: data.status || "Pending",
            priority: data.priority || "Medium",
            estimatedCost: data.estimatedCost || 0,
            notes: data.notes || "",
            notesLog: data.notesLog || [],
            quotes: data.quotes || []
          };
          
          // Automatically fetch and populate unit number from the unit
          if (this.entry.unitName) {
            try {
              const unitsQuery = query(
                collection(db, 'units'),
                where('propertyName', '==', this.entry.unitName)
              );
              const unitsSnapshot = await getDocs(unitsQuery);
              
              if (!unitsSnapshot.empty) {
                const unitData = unitsSnapshot.docs[0].data();
                // Auto-populate unit number if it exists
                if (unitData.unitNumber) {
                  this.entry.unitNumber = unitData.unitNumber;
                  console.log('Auto-populated unit number from property:', unitData.unitNumber);
                }
              } else {
                console.log('No unit found with propertyName:', this.entry.unitName);
              }
            } catch (unitError) {
              console.error('Could not fetch unit number:', unitError);
              // Continue even if unit fetch fails
            }
          }
          
          this.loading = false;
        } else {
          this.error = "Maintenance entry not found";
          this.loading = false;
        }
      } catch (error) {
        console.error('Error loading maintenance entry:', error);
        this.error = "Failed to load maintenance entry";
        this.loading = false;
      }
    },

    async fetchAgencies() {
      this.agenciesLoading = true
      try {
        const q = query(collection(db, 'users'), where('userType', '==', 'Agency'))
        const querySnapshot = await getDocs(q)
        this.agencies = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log('Agencies loaded:', this.agencies.length)
      } catch (error) {
        console.error('Error fetching agencies:', error)
        this.showErrorDialog('Failed to load agencies. Please try again.', 'Error', 'OK')
      } finally {
        this.agenciesLoading = false
      }
    },

    async saveEntry() {
      if (this.$refs.form.validate()) {
        this.saving = true
        try {
          console.log("Saving maintenance entry:", this.entry);
          
          // Get agency name from selected agency
          const selectedAgency = this.agencies.find(agency => agency.id === this.entry.agencyId)
          
          // Prepare maintenance data for Firestore
          const maintenanceData = {
            agencyId: this.entry.agencyId,
            agencyName: selectedAgency ? selectedAgency.agencyName : '',
            unitName: this.entry.unitName,
            unitNumber: this.entry.unitNumber,
            contactPerson: String(this.entry.contactPerson || '').trim(),
            contactPersonNumber: String(this.entry.contactPersonNumber || '').replace(/\s+/g,' ').trim(),
            noticeGiven: this.entry.noticeGiven,
            vacateDate: this.entry.vacateDate,
            contactNumber: this.entry.contactNumber,
            address: this.entry.address,
            status: this.entry.status,
            priority: this.entry.priority,
            estimatedCost: this.entry.estimatedCost || 0,
            notes: this.entry.notes || "",
            quotes: this.entry.quotes || [],
            updatedAt: new Date()
          }
          
          // Log the update action before saving
          await this.logAuditEvent(
            this.auditActions.UPDATE,
            {
              maintenanceId: this.entry.id,
              maintenanceType: maintenanceData.maintenanceType,
              updatedFields: Object.keys(maintenanceData),
              updatedData: maintenanceData
            },
            this.resourceTypes.MAINTENANCE,
            this.entry.id
          )
          
          // Update maintenance data in Firestore
          const docRef = doc(db, 'maintenance', this.entry.id)
          await updateDoc(docRef, maintenanceData)
          
          console.log('Maintenance data updated in Firestore')
          this.showSuccessDialog('Maintenance entry updated successfully!', 'Success!', 'Continue', `/view-maintenance-${this.entry.id}`)
          
        } catch (error) {
          console.error('Error updating maintenance entry:', error)
          this.showErrorDialog('Failed to update maintenance entry. Please try again.', 'Error', 'OK')
        } finally {
          this.saving = false
        }
      }
    },
    async appendNote() {
      if (!this.newNote || !this.entry?.id) return
      try {
        this.savingNote = true
        const appStore = useAppStore()
        const currentUser = appStore.currentUser
        const isAgency = currentUser?.userType === 'Agency' || (currentUser?.userType === 'Admin' && currentUser?.adminScope === 'agency')
        
        // Get proper author name based on user type
        let authorName = 'Unknown User'
        if (isAgency) {
          authorName = currentUser?.agencyName || this.entry?.unitName || 'Property'
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
        
        await updateDoc(doc(db, 'maintenance', this.entry.id), { 
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
    },
    
    async uploadQuotes() {
      if (!this.newQuoteFiles || this.newQuoteFiles.length === 0) return
      
      this.uploadingQuotes = true
      try {
        const uploaded = []
        for (const file of this.newQuoteFiles) {
          const ts = Date.now()
          const fileRef = ref(storage, `maintenance-quotes/${this.entry.id}/${ts}_${file.name}`)
          const snapshot = await uploadBytes(fileRef, file)
          const downloadURL = await getDownloadURL(snapshot.ref)
          const storagePath = snapshot.ref.fullPath
          uploaded.push({
            fileName: file.name,
            fileURL: downloadURL,
            storagePath,
            uploadedAt: new Date().toISOString()
          })
        }
        
        // Merge with existing quotes in maintenance
        const updatedQuotes = [...(this.entry.quotes || []), ...uploaded]
        this.entry.quotes = updatedQuotes
        
        // Update maintenance document
        await updateDoc(doc(db, 'maintenance', this.entry.id), {
          quotes: updatedQuotes,
          updatedAt: new Date()
        })

        // Also update the property's quotes if we can find it
        try {
          const unitsQuery = query(
            collection(db, 'units'),
            where('unitName', '==', this.entry.unitName)
          )
          const unitsSnapshot = await getDocs(unitsQuery)
          
          if (!unitsSnapshot.empty) {
            const propertyDoc = unitsSnapshot.docs[0]
            const propertyData = propertyDoc.data()
            const existingPropertyQuotes = propertyData.quotes || []
            
            // Add new quotes to property
            const updatedPropertyQuotes = [...existingPropertyQuotes, ...uploaded]
            
            await updateDoc(doc(db, 'units', propertyDoc.id), {
              quotes: updatedPropertyQuotes,
              updatedAt: new Date()
            })
            
            console.log('Quotes also added to property documents')
          }
        } catch (propertyError) {
          console.log('Could not add quotes to property:', propertyError)
          // Continue even if property update fails
        }
        
        // Reset file input
        this.newQuoteFiles = []
        this.quoteInputKey++
        
        this.showSuccessDialog(`${uploaded.length} quote(s) uploaded successfully and added to property documents!`, 'Success', 'OK')
      } catch (error) {
        console.error('Error uploading quotes:', error)
        this.showErrorDialog('Failed to upload quotes. Please try again.', 'Error', 'OK')
      } finally {
        this.uploadingQuotes = false
      }
    },

    viewQuote(quote) {
      this.currentQuoteURL = quote.fileURL
      this.currentQuoteName = quote.fileName
      this.showQuoteDialog = true
    },

    async deleteQuote(index) {
      const quote = this.entry.quotes[index]
      if (!quote) return

      try {
        await this.showConfirmDialog({
          title: 'Delete Quote?',
          message: `Are you sure you want to delete "${quote.fileName}"?`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          color: '#dc3545'
        })
      } catch (_) {
        return
      }

      try {
        // Delete from storage if storagePath exists
        if (quote.storagePath) {
          try {
            const fileRef = ref(storage, quote.storagePath)
            await deleteObject(fileRef)
          } catch (deleteError) {
            console.log('Storage delete failed, continuing:', deleteError)
          }
        }

        // Remove from maintenance array
        const updatedQuotes = this.entry.quotes.filter((_, i) => i !== index)
        this.entry.quotes = updatedQuotes

        // Update maintenance document
        await updateDoc(doc(db, 'maintenance', this.entry.id), {
          quotes: updatedQuotes,
          updatedAt: new Date()
        })

        // Also remove from property's quotes if we can find it
        try {
          const unitsQuery = query(
            collection(db, 'units'),
            where('unitName', '==', this.entry.unitName)
          )
          const unitsSnapshot = await getDocs(unitsQuery)
          
          if (!unitsSnapshot.empty) {
            const propertyDoc = unitsSnapshot.docs[0]
            const propertyData = propertyDoc.data()
            const existingPropertyQuotes = propertyData.quotes || []
            
            // Remove quote from property by matching fileURL
            const updatedPropertyQuotes = existingPropertyQuotes.filter(
              q => q.fileURL !== quote.fileURL
            )
            
            await updateDoc(doc(db, 'units', propertyDoc.id), {
              quotes: updatedPropertyQuotes,
              updatedAt: new Date()
            })
            
            console.log('Quote also removed from property documents')
          }
        } catch (propertyError) {
          console.log('Could not remove quote from property:', propertyError)
          // Continue even if property update fails
        }

        this.showSuccessDialog('Quote deleted successfully from maintenance and property!', 'Success', 'OK')
      } catch (error) {
        console.error('Error deleting quote:', error)
        this.showErrorDialog('Failed to delete quote. Please try again.', 'Error', 'OK')
      }
    },

    openInNewTab() {
      if (this.currentQuoteURL) {
        window.open(this.currentQuoteURL, '_blank');
      }
    },

    async deleteQuoteFile() {
      if (!this.entry.quoteFileName || !this.entry.quoteFileURL) {
        return;
      }

      // Store the file details before deletion for audit logging
      const fileNameToDelete = this.entry.quoteFileName;
      const fileURLToDelete = this.entry.quoteFileURL;

      // Show confirmation dialog
      const confirmed = await this.showConfirmDialog(
        `Are you sure you want to delete "${fileNameToDelete}"?`,
        'Delete Quote File',
        'This action cannot be undone.'
      );

      if (!confirmed) {
        return;
      }

      try {
        // Delete from Firebase Storage
        console.log('Attempting to delete file URL:', fileURLToDelete);
        
        // Extract the file path from the URL
        let filePath;
        
        // Try to extract from Firebase Storage URL
        if (fileURLToDelete.includes('firebasestorage.googleapis.com')) {
          // Firebase Storage URL format
          const urlParts = fileURLToDelete.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const cleanFileName = fileName.split('?')[0];
          filePath = `maintenance-quotes/${cleanFileName}`;
        } else {
          // Fallback: try to extract filename from any URL
          const urlParts = fileURLToDelete.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const cleanFileName = fileName.split('?')[0];
          filePath = `maintenance-quotes/${cleanFileName}`;
        }
        
        console.log('Extracted file path:', filePath);
        
                 // Try to delete the file from Firebase Storage
         try {
           const fileRef = ref(storage, filePath);
           await deleteObject(fileRef);
           console.log('Quote file deleted from storage:', filePath);
         } catch (deleteError) {
           console.log('Failed to delete from storage, but continuing with local cleanup:', deleteError);
           // Continue with local cleanup even if storage delete fails
         }

         // Always clear the file data from the entry and update Firestore
         this.entry.quoteFileName = '';
         this.entry.quoteFileURL = '';

         // Always update the Firestore document to remove file references
         const docRef = doc(db, 'maintenance', this.entry.id);
         await updateDoc(docRef, {
           quoteFileName: '',
           quoteFileURL: '',
           updatedAt: new Date()
         });

         console.log('Firestore document updated successfully');

        // Log the delete action with the original file details
        await this.logAuditEvent(
          this.auditActions.DELETE,
          {
            maintenanceId: this.entry.id,
            fileName: fileNameToDelete,
            fileURL: fileURLToDelete
          },
          this.resourceTypes.MAINTENANCE,
          this.entry.id
        );

        // Reload the entry data to ensure UI is updated
        await this.loadEntryData(this.entry.id);

        this.showSuccessDialog(
          'Quote file has been deleted successfully.',
          'File Deleted',
          'OK'
        );

             } catch (error) {
         console.error('Error deleting quote file:', error);
         console.error('Error details:', {
           code: error.code,
           message: error.message,
           stack: error.stack
         });
         // No error dialog - just log the error and continue
       }
    },

    async showConfirmDialog(message, title, subtitle = '') {
      return new Promise((resolve) => {
        // Create a custom confirmation dialog with exact NotificationDialog styling
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog-overlay';
        dialog.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100000;
        `;
        
        dialog.innerHTML = `
          <div style="
            position: relative;
            width: 500px;
            max-width: 90vw;
            min-height: 200px;
          ">
            <!-- colored card behind -->
            <div style="
              position: absolute;
              top: 12px;
              left: 12px;
              width: 96%;
              height: 100%;
              border-radius: 16px;
              box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
              background-color: #e53e3e;
            "></div>
            <!-- main white card -->
            <div style="
              position: relative;
              background: #ffffff;
              border-radius: 16px;
              padding: 32px;
              text-align: center;
              box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
            ">
              <button onclick="this.closest('.confirm-dialog-overlay').remove(); window.confirmResult = false;" style="
                position: absolute;
                top: 16px;
                right: 16px;
                background: transparent;
                border: none;
                font-size: 24px;
                cursor: pointer;
                line-height: 1;
                color: #666;
              ">&times;</button>

              <div style="
                position: relative;
                margin: 0 auto 24px auto;
                margin-top: -16%;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #e53e3e;
                animation: fadeInCircle 0.3s ease-out forwards;
              ">
                <i class="mdi mdi-delete" style="
                  font-size: 40px;
                  color: #ffffff;
                "></i>
              </div>
              <style>
                @keyframes fadeInCircle {
                  from {
                    opacity: 0;
                    transform: scale(0.7);
                  }
                  to {
                    opacity: 1;
                    transform: scale(1);
                  }
                }
                @keyframes pulse {
                  0%, 100% {
                    transform: translate(-50%, -50%) scale(1);
                  }
                  50% {
                    transform: translate(-50%, -50%) scale(1.2);
                  }
                }
                .confirm-dialog-overlay div[style*="background-color: #e53e3e"]::before {
                  content: '';
                  position: absolute;
                  width: 100px;
                  height: 100px;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  border-radius: 50%;
                  opacity: 0.2;
                  animation: pulse 2s ease-in-out infinite;
                  background-color: #e53e3e;
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

/* removed duplicate styles - now at end of file */

              <h2 style="
                font-size: 2em;
                margin: 0 0 12px 0;
                color: #333;
              ">${title}</h2>
              <p style="
                font-size: 1.2em;
                margin: 0 0 32px 0;
                color: #666;
              ">${message}</p>
              
              <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="this.closest('.confirm-dialog-overlay').remove(); window.confirmResult = false;" style="
                  border: none;
                  border-radius: 8px;
                  color: #ffffff;
                  font-size: 1.1em;
                  padding: 12px 24px;
                  cursor: pointer;
                  background-color: #666;
                  transition: opacity 0.3s ease;
                ">Cancel</button>
                <button onclick="this.closest('.confirm-dialog-overlay').remove(); window.confirmResult = true;" style="
                  border: none;
                  border-radius: 8px;
                  color: #ffffff;
                  font-size: 1.1em;
                  padding: 12px 24px;
                  cursor: pointer;
                  background-color: #e53e3e;
                  transition: opacity 0.3s ease;
                ">Delete</button>
              </div>
            </div>
          </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Handle the result
        const checkResult = () => {
          if (typeof window.confirmResult !== 'undefined') {
            const result = window.confirmResult;
            delete window.confirmResult;
            resolve(result);
          } else {
            setTimeout(checkResult, 100);
          }
        };
        checkResult();
      });
    },
    
    zoomIn() {
      if (this.zoomLevel < 2) {
        this.zoomLevel += 0.1;
      }
    },
    
    zoomOut() {
      if (this.zoomLevel > 0.5) {
        this.zoomLevel -= 0.1;
      }
    }
  }
};
</script>

<style scoped>
.notes-section { margin-top: 8px; }
.chat-log { display: flex; flex-direction: column; gap: 10px; max-height: 320px; overflow-y: auto; padding: 8px 0; }
.chat-message { display: flex; align-items: flex-end; gap: 8px; }
.chat-message.mine { flex-direction: row-reverse; }
.chat-avatar { width: 28px; height: 28px; border-radius: 50%; background: #6b7280; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }
.chat-avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.chat-bubble { max-width: 55%; min-width: 0; overflow-wrap: anywhere; word-break: break-word; background: #f2f4f7; color: #111; border-radius: 12px; padding: 10px 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
.chat-message.mine .chat-bubble { background: #000; color: #fff; }
.chat-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 4px; }
.chat-header-right { display: flex; align-items: center; gap: 8px; }
.chat-author { font-weight: 700; font-size: 0.8rem; opacity: 0.95; }
.chat-time { font-size: 0.7rem; opacity: 0.7; margin-left: 8px; }
.chat-edited { font-size: 0.7rem; opacity: 0.7; }
.chat-text { white-space: pre-wrap; word-wrap: break-word; line-height: 1.35; text-align: center; }
.chat-text.deleted { font-style: italic; opacity: 0.75; }
.edit-area { background: #000; border-radius: 10px; padding: 6px; }
.edit-area :deep(.v-field__outline) { border-color: #444 !important; }
.chat-input :deep(.v-field__input) { min-height: 44px; }
.edit-maintenance-page {
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
  text-align: center;
  text-transform: uppercase;
}

/* Form card */
.form-card {
  background: white;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
}

/* Input styling */
.custom-input .v-field {
  border-radius: 8px;
}



.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}

/* Buttons */
.cancel-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  width: 120px;
  height: 44px;
}

.submit-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  width: 160px;
  height: 44px;
  background-color: black !important;
  color: white !important;
}

.submit-btn:hover:not(:disabled) {
  background-color: #333 !important;
}

/* View Quote Button */
.view-quote-btn {
  width: 240px;
  height: 44px;
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  background-color: black !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  margin-right: 12px;
}

.view-quote-btn:hover {
  background-color: #333 !important;
  transform: translateY(-1px);
}

/* Quote Dialog - NotificationDialog Style */
.quote-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
}

.quote-dialog {
  position: relative;
  width: 600px;
  max-width: 90vw;
  min-height: 500px;
}

.quote-dialog-bg {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 96%;
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  background-color: #000000;
}

.quote-dialog-inner {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.quote-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  color: #666;
}

.quote-close:hover {
  color: #333;
}

.quote-icon {
  position: relative;
  margin: 0 auto 24px auto;
  margin-top: -16%;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInCircle 0.3s ease-out forwards;
  background-color: #000000;
}

.quote-icon .v-icon {
  font-size: 40px;
  color: #ffffff;
}

.quote-icon::before {
  content: '';
  position: absolute;
  width: 100px;
  height: 100px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  opacity: 0.2;
  animation: pulse 2s ease-in-out infinite;
  background-color: #000000;
}

@keyframes fadeInCircle {
  from {
    opacity: 0;
    transform: scale(0.7);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.quote-title {
  font-size: 2em;
  margin: 0 0 8px 0;
  color: #333;
}

.quote-subtitle {
  font-size: 1.1em;
  margin: 0 0 24px 0;
  color: #666;
  word-break: break-all;
}

.pdf-container {
  width: 100%;
  margin: 0 0 24px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.pdf-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.zoom-btn {
  background-color: #000000;
  color: white;
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.zoom-btn:hover {
  background-color: #333;
}

.zoom-level {
  font-weight: 600;
  color: #333;
  min-width: 50px;
  text-align: center;
}

.pdf-wrapper {
  transform-origin: top center;
  transition: transform 0.3s ease;
  overflow: auto;
  max-height: 400px;
}

.pdf-iframe {
  border: none;
  width: 100%;
  height: 400px;
  display: block;
}

.no-pdf-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #666;
  margin: 0 0 24px 0;
}

.no-pdf-message p {
  margin-top: 16px;
  font-size: 1.1rem;
}

.quote-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.quote-button {
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1.1em;
  padding: 12px 24px;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.quote-button.secondary {
  background-color: #666;
}

.quote-button.primary {
  background-color: #000000;
}

.quote-button:hover {
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
  .edit-maintenance-page {
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

/* Confirmation Dialog Styles */
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
}

.confirm-dialog {
  background: white;
  border-radius: 12px;
  padding: 0;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.confirm-dialog-header {
  background: #dc3545;
  color: white;
  padding: 20px 24px;
  text-align: center;
}

.confirm-dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.confirm-dialog-subtitle {
  margin: 8px 0 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.confirm-dialog-content {
  padding: 24px;
  text-align: center;
}

.confirm-dialog-content p {
  margin: 0;
  font-size: 1rem;
  color: #333;
  line-height: 1.5;
}

.confirm-dialog-actions {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
  justify-content: center;
}

.confirm-btn {
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  min-width: 100px;
}

.confirm-btn.cancel {
  background-color: #6c757d;
  color: white;
}

.confirm-btn.cancel:hover {
  background-color: #5a6268;
  transform: translateY(-1px);
}

.confirm-btn.delete {
  background-color: #dc3545;
  color: white;
}

.confirm-btn.delete:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

/* Responsive adjustments for confirmation dialog */
@media (max-width: 768px) {
  .confirm-dialog {
    width: 95%;
    margin: 20px;
  }
  
  .confirm-dialog-actions {
    flex-direction: column;
  }
  
  .confirm-btn {
    width: 100%;
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

/* Quote Upload Section */
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
}

.upload-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.file-input-flex {
  flex: 1;
  min-width: 0;
}

.upload-doc-btn {
  margin-top: 4px;
  min-width: 120px;
  height: 44px;
  text-transform: none;
  font-weight: 500;
  background-color: black !important;
  color: white !important;
  border-radius: 8px;
}

.existing-quotes {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid var(--v-theme-primary);
}

.existing-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.quote-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quote-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.quote-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.quote-name {
  flex: 1;
  font-weight: 500;
  color: #333;
  margin-left: 8px;
}

.quote-item .view-btn,
.quote-item .delete-btn {
  margin-left: 8px;
}
</style>
