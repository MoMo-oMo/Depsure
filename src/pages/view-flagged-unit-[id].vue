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
                <v-card-text>
                  <v-row>
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

                <!-- Unit Number -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="unit.unitNumber"
                    label="Unit Number"
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

                <!-- Months Missed Rent -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="editedMonths"
                    label="Months Missed Rent"
                    type="number"
                    min="0"
                    step="1"
                    variant="outlined"
                    class="custom-input"
                    :rules="monthsRules"
                    :disabled="savingMonths"
                    suffix="months"
                    hint="Total number of months this unit has missed rent"
                    persistent-hint
                    @blur="handleMonthsBlur"
                  />
                </v-col>
                   
                   </v-row>
                 </v-card-text>
                <v-card-actions class="pa-4 pt-0">
                  <v-spacer />
                  <v-btn
                    color="black"
                    variant="elevated"
                    :disabled="!canSaveMonths || savingMonths"
                    :loading="savingMonths"
                    @click="saveMonthsMissed"
                  >
                    Save Changes
                  </v-btn>
                </v-card-actions>
              <!-- Notes removed - using live chat -->
              <div style="display:none;">
                <v-card-text>
                  <div class="notes-section">
                    <h3 class="mb-2">Notes</h3>
                    <div v-if="(unit.notesLog && unit.notesLog.length)" class="chat-log" ref="chatLog">
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
              </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { db } from '@/firebaseConfig'
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'
import { useCustomDialogs } from '@/composables/useCustomDialogs'

export default {
  name: "ViewFlaggedUnitPage",
  setup() {
    const { showErrorDialog, showConfirmDialog, showSuccessDialog } = useCustomDialogs()
    return { showErrorDialog, showConfirmDialog, showSuccessDialog }
  },
  data() {
    return {
      activeTab: 'details',
      unit: {},
      loading: true,
      error: null,
      newNote: '',
      savingNote: false,
      editingKey: null,
      editingText: '',
      savingEdit: false,
      editedMonths: 0,
      originalMonths: 0,
      savingMonths: false,
      monthsDirty: false,
      monthsRules: [
        (v) => v === null || v === '' || Number(v) >= 0 || 'Months missed must be zero or greater',
      ],
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
    canSaveMonths() {
      const normalized = this.normalizeMonths(this.editedMonths)
      if (normalized === null) return false
      return this.monthsDirty
    }
  },
  watch: {
    editedMonths(newVal) {
      const normalized = this.normalizeMonths(newVal)
      if (normalized === null) {
        this.monthsDirty = false
        return
      }
      this.monthsDirty = normalized !== this.originalMonths
    },
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
    normalizeMonths(value) {
      if (value === null || value === undefined || value === '') return null
      const num = Number(value)
      if (!Number.isFinite(num) || num < 0) return null
      return Math.round(num)
    },
    handleMonthsBlur() {
      const normalized = this.normalizeMonths(this.editedMonths)
      if (normalized === null) return
      this.editedMonths = normalized
    },
    async saveMonthsMissed() {
      if (!this.unit?.id) return
      const months = this.normalizeMonths(this.editedMonths)
      if (months === null) {
        this.showErrorDialog?.('Please enter a valid number of months (0 or more).', 'Invalid Value', 'OK')
        return
      }

      this.savingMonths = true
      try {
        await updateDoc(doc(db, 'flaggedUnits', this.unit.id), {
          monthsMissed: months,
          monthsMissedRent: months,
          updatedAt: serverTimestamp(),
        })

        const synced = await this.syncMonthsToActiveUnit(months)

        this.unit.monthsMissed = months
        this.unit.monthsMissedRent = months
        this.originalMonths = months
        this.editedMonths = months
        this.monthsDirty = false

        if (synced) {
          this.showSuccessDialog?.(
            'Months missed rent updated across flagged and active unit records.',
            'Success!',
            'Continue'
          )
        } else {
          this.showErrorDialog?.(
            'Months missed rent was updated for the flagged unit, but the active unit record could not be updated automatically. Please verify the unit linkage.',
            'Sync Warning',
            'OK'
          )
        }
      } catch (error) {
        console.error('Error updating months missed:', error)
        this.showErrorDialog?.(
          'Failed to update months missed rent. Please try again.',
          'Error',
          'OK'
        )
      } finally {
        this.savingMonths = false
      }
    },
    async syncMonthsToActiveUnit(months) {
      try {
        if (this.unit?.unitId) {
          await updateDoc(doc(db, 'units', this.unit.unitId), {
            monthsMissed: months,
            monthsMissedRent: months,
            updatedAt: serverTimestamp(),
          })
          return true
        }

        const unitName = (this.unit?.unitName || '').trim()
        if (!unitName) return false

        const constraints = [where('propertyName', '==', unitName)]
        if (this.unit?.agencyId) {
          constraints.push(where('agencyId', '==', this.unit.agencyId))
        }

        const unitsRef = collection(db, 'units')
        const unitsQuery = query(unitsRef, ...constraints)
        const snapshot = await getDocs(unitsQuery)

        if (snapshot.empty) {
          console.warn('No matching active unit found to sync months missed.')
          return false
        }

        const targetDoc = snapshot.docs[0]
        await updateDoc(doc(db, 'units', targetDoc.id), {
          monthsMissed: months,
          monthsMissedRent: months,
          updatedAt: serverTimestamp(),
        })

        if (!this.unit.unitId) {
          this.unit.unitId = targetDoc.id
        }

        return true
      } catch (error) {
        console.warn('Failed to sync months missed to active unit:', error)
        return false
      }
    },
    scrollNotesToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatLog
        if (el && el.scrollHeight != null) el.scrollTop = el.scrollHeight
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
      if (!this.unit?.id) return
      const newText = this.editingText.trim(); if (!newText) return
      try {
        this.savingEdit = true
        const list = Array.isArray(this.unit.notesLog) ? [...this.unit.notesLog] : []
        const idx = this.findNoteIndexByIdOrMatch(list, target)
        if (idx === -1) throw new Error('Note not found')
        const old = list[idx] || {}
        list[idx] = { ...old, text: newText, isEdited: true, editedAt: new Date(), id: old.id || (Date.now()+ '_' + Math.random().toString(36).slice(2,8)) }
        await updateDoc(doc(db, 'flaggedUnits', this.unit.id), { notesLog: list, updatedAt: serverTimestamp() })
        this.unit.notesLog = list
        this.cancelEdit()
      } catch (e) {
        console.error('Error editing note:', e)
        this.showErrorDialog('Failed to edit note. Please try again.', 'Error', 'OK')
      } finally { this.savingEdit = false }
    },
    async softDeleteNote(target) {
      if (!this.unit?.id) return
      try { await this.showConfirmDialog({ title: 'Delete message?', message: 'This message will be shown as deleted.', confirmText: 'Delete', cancelText: 'Cancel', color: '#dc3545' }) } catch(_) { return }
      try {
        const list = Array.isArray(this.unit.notesLog) ? [...this.unit.notesLog] : []
        const idx = this.findNoteIndexByIdOrMatch(list, target)
        if (idx === -1) throw new Error('Note not found')
        const old = list[idx] || {}
        list[idx] = { ...old, isDeleted: true, deletedAt: new Date(), id: old.id || (Date.now()+ '_' + Math.random().toString(36).slice(2,8)) }
        await updateDoc(doc(db, 'flaggedUnits', this.unit.id), { notesLog: list, updatedAt: serverTimestamp() })
        this.unit.notesLog = list
      } catch (e) {
        console.error('Error deleting note:', e)
        this.showErrorDialog('Failed to delete note. Please try again.', 'Error', 'OK')
      }
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

          const normalizedMonths = this.normalizeMonths(
            unitData.monthsMissed ?? unitData.monthsMissedRent ?? 0
          )
          const monthsValue = normalizedMonths === null ? 0 : normalizedMonths
          this.unit.monthsMissed = monthsValue
          this.unit.monthsMissedRent = monthsValue
          this.originalMonths = monthsValue
          this.editedMonths = monthsValue
          this.monthsDirty = false
          
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
        const isAgency = currentUser?.userType === 'Agency' || (currentUser?.userType === 'Admin' && currentUser?.adminScope === 'agency')
        
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
          id: Date.now() + '_' + Math.random().toString(36).slice(2,8),
          text: this.newNote,
          authorId: appStore.userId || currentUser?.uid || '',
          authorName: authorName,
          authorType: appStore.userType || currentUser?.userType || '',
          authorAvatarUrl: isAgency 
            ? (this.unit?.agencyProfileImageUrl || this.unit?.profileImageUrl || currentUser?.profileImageUrl || currentUser?.profileImage || '') 
            : (currentUser?.profileImageUrl || currentUser?.profileImage || ''),
          timestamp: new Date(),
          isEdited: false,
          isDeleted: false
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
  text-align: center;
  text-transform: uppercase;
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
