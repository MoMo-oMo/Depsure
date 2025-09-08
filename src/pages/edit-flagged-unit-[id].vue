<template>
  <div class="edit-flagged-unit-page">
    <v-container fluid>
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
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
            <h1 class="page-title">Edit Flagged Unit</h1>
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
                      v-model="unit.unitName"
                      label="Unit Name"
                      variant="outlined"
                      class="custom-input"
                      :rules="unitNameRules"
                      required
                    />
                  </v-col>

                  <!-- Tenant Reference -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="unit.tenantRef"
                      label="Tenant Reference"
                      variant="outlined"
                      class="custom-input"
                      :rules="tenantRefRules"
                      required
                    />
                  </v-col>

                  <!-- Lease Start Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="unit.leaseStartDate"
                      label="Lease Start Date"
                      type="date"
                      variant="outlined"
                      class="custom-input"
                      :rules="leaseStartDateRules"
                      required
                    />
                  </v-col>

                  <!-- Flag Reason -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="unit.flagReason"
                      label="Reason Flagged"
                      variant="outlined"
                      class="custom-input"
                      :rules="flagReasonRules"
                      required
                    />
                  </v-col>

                  <!-- Date Flagged -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="unit.dateFlagged"
                      label="Date Flagged"
                      type="date"
                      variant="outlined"
                      class="custom-input"
                      :rules="dateFlaggedRules"
                      required
                    />
                  </v-col>

                  <!-- Missed Payment Flag -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="unit.missedPaymentFlag"
                      :items="['Yes', 'No']"
                      label="Missed Payment Flag"
                      variant="outlined"
                      class="custom-input"
                      :rules="missedPaymentFlagRules"
                      required
                    />
                  </v-col>

                  <!-- Notice to Vacate Given -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="unit.noticeToVacateGiven"
                      label="Notice to Vacate Given"
                      type="date"
                      variant="outlined"
                      class="custom-input"
                      :rules="noticeToVacateGivenRules"
                      required
                    />
                  </v-col>

                  <!-- Action Taken -->
                  <v-col cols="12">
                    <v-textarea
                      v-model="unit.actionTaken"
                      label="Action Taken"
                      variant="outlined"
                      class="custom-input"
                      :rules="actionTakenRules"
                      :counter="500"
                      maxlength="500"
                      rows="3"
                      required
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
                      @click="$router.push('/flagged-units')"
                      class="cancel-btn"
                      :disabled="saving"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      color="black"
                      variant="elevated"
                      @click="saveUnit"
                      :disabled="!valid || saving"
                      :loading="saving"
                      class="save-btn"
                    >
                      {{ saving ? 'Saving...' : 'Save Changes' }}
                    </v-btn>
                  </v-card-actions>
                </v-window-item>
                <v-window-item value="notes">
                  <v-card-text>
                    <div class="notes-section">
                      <h3 class="mb-2">Notes</h3>
                      <div v-if="(unit.notesLog && unit.notesLog.length)" class="chat-log" ref="chatLog">
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

export default {
  name: 'EditFlaggedUnitPage',
  setup() {
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    return { showSuccessDialog, showErrorDialog, logAuditEvent, auditActions, resourceTypes }
  },
  computed: {
    currentUserId() {
      return this.$pinia?.state?.app?.currentUser?.uid || ''
    },
    sortedNotes() {
      const notes = this.unit?.notesLog || []
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
      unit: {
        unitName: '',
        tenantRef: '',
        leaseStartDate: '',
        flagReason: '',
        dateFlagged: '',
        missedPaymentFlag: '',
        noticeToVacateGiven: '',
        actionTaken: '',
        notes: '',
        notesLog: []
      },
      agencyName: '',
      loading: true,
      saving: false,
      error: null,
      valid: false,
      newNote: '',
      savingNote: false,
      unitNameRules: [
        v => !!v || "Unit Name is required",
        v => v.length >= 3 || "Unit Name must be at least 3 characters"
      ],
      tenantRefRules: [v => !!v || "Tenant Reference is required"],
      leaseStartDateRules: [v => !!v || "Lease Start Date is required"],
      flagReasonRules: [v => !!v || "Reason Flagged is required"],
      dateFlaggedRules: [v => !!v || "Date Flagged is required"],
      missedPaymentFlagRules: [v => !!v || "Missed Payment Flag is required"],
      noticeToVacateGivenRules: [v => !!v || "Notice To Vacate Given is required"],
      actionTakenRules: [
        v => !!v || "Action Taken is required",
        v => (v ? v.length <= 500 : true) || 'Action Taken cannot exceed 500 characters'
      ],
      notesRules: [
        v => (v ? v.length <= 500 : true) || 'Additional Notes cannot exceed 500 characters'
      ],
      
    };
  },
  async mounted() {
    document.title = "Edit Flagged Unit - Depsure";
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
        const el = this.$refs?.chatLog
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
            unitName: unitData.unitName || '',
            tenantRef: unitData.tenantRef || '',
            leaseStartDate: unitData.leaseStartDate || '',
            flagReason: unitData.flagReason || '',
            dateFlagged: unitData.dateFlagged || '',
            missedPaymentFlag: unitData.missedPaymentFlag || '',
            noticeToVacateGiven: unitData.noticeToVacateGiven || '',
            actionTaken: unitData.actionTaken || '',
            notes: unitData.notes || '',
            notesLog: unitData.notesLog || []
          };
          
          // Fetch agency name if agencyId exists
          if (unitData.agencyId) {
            await this.loadAgencyName(unitData.agencyId);
          }
          
          console.log('Flagged unit loaded:', this.unit);
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
    },

    async saveUnit() {
      if (this.$refs.form.validate()) {
        this.saving = true;
        try {
          console.log('Saving flagged unit:', this.unit);
          
          // Check if unit has an ID
          if (!this.unit.id) {
            throw new Error('No flagged unit ID found');
          }

          // Prepare the update data
          const updateData = {
            unitName: this.unit.unitName,
            tenantRef: this.unit.tenantRef,
            leaseStartDate: this.unit.leaseStartDate,
            flagReason: this.unit.flagReason,
            dateFlagged: this.unit.dateFlagged,
            missedPaymentFlag: this.unit.missedPaymentFlag,
            noticeToVacateGiven: this.unit.noticeToVacateGiven,
            actionTaken: this.unit.actionTaken,
            notes: this.unit.notes,
            updatedAt: new Date()
          };

          // Log the update action before saving
          await this.logAuditEvent(
            this.auditActions.UPDATE,
            {
              flaggedUnitId: this.unit.id,
              unitName: updateData.unitName,
              updatedFields: Object.keys(updateData),
              updatedData: updateData
            },
            this.resourceTypes.UNIT,
            this.unit.id
          )

          // Update the flagged unit in Firestore
          await updateDoc(doc(db, 'flaggedUnits', this.unit.id), updateData);
          
          console.log('Flagged unit updated successfully');
          this.showSuccessDialog("Flagged unit updated successfully!", "Success!", "Continue", `/view-flagged-unit-${this.unit.id}`);
        } catch (error) {
          console.error('Error saving flagged unit:', error);
          this.showErrorDialog('Failed to save flagged unit. Please try again.');
        } finally {
          this.saving = false;
        }
      }
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
    async appendNote() {
      if (!this.newNote || !this.unit?.id) return
      try {
        this.savingNote = true
        const note = {
          text: this.newNote,
          authorId: this.$pinia?.state?.app?.currentUser?.uid || '',
          authorName: ((this.$pinia?.state?.app?.currentUser?.firstName || '') + ' ' + (this.$pinia?.state?.app?.currentUser?.lastName || '')).trim(),
          authorType: this.$pinia?.state?.app?.currentUser?.userType || '',
          timestamp: new Date()
        }
        await updateDoc(doc(db, 'flaggedUnits', this.unit.id), { notesLog: arrayUnion(note), updatedAt: serverTimestamp() })
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
  },
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
.edit-flagged-unit-page {
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

/* Buttons */
.cancel-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  width: 120px;
  height: 44px;
}
.save-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  width: 160px;
  height: 44px;
  background-color: black !important;
  color: white !important;
}
.save-btn:hover:not(:disabled) {
  background-color: #333 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .edit-flagged-unit-page {
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

