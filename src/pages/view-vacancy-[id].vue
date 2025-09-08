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
              <v-tabs v-model="activeTab" class="property-tabs" density="comfortable">
                <v-tab value="details">Details</v-tab>
                <v-tab value="notes">Notes</v-tab>
              </v-tabs>
              <v-card-text>
                <div class="vacancy-details">
                  <v-window v-model="activeTab">
                  <v-window-item value="details">
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

                      <!-- New Tenant Found -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          :model-value="vacancy.newTenantFound"
                          label="New Tenant Found"
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
                  </v-window-item>
                  <v-window-item value="notes">
                    <div class="notes-section">
                      <h3 class="mb-2">Notes</h3>
                      <div v-if="(vacancy.notesLog && vacancy.notesLog.length)" class="chat-log" ref="chatLog">
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
                  </v-window-item>
                </v-window>
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
      savingNote: false
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
          text: this.newNote,
          authorId: appStore.userId || currentUser?.uid || '',
          authorName: authorName,
          authorType: appStore.userType || currentUser?.userType || '',
          authorAvatarUrl: isAgency 
            ? (this.vacancy?.agencyProfileImageUrl || this.vacancy?.profileImageUrl || currentUser?.profileImageUrl || currentUser?.profileImage || '') 
            : (currentUser?.profileImageUrl || currentUser?.profileImage || ''),
          timestamp: new Date()
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
.chat-bubble{max-width:75%;background:#3a3f44;color:#fff;border-radius:10px;padding:8px 12px;box-shadow:0 1px 3px rgba(0,0,0,.18)}
.chat-message.mine .chat-bubble{background:#000}
.chat-header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px}
.chat-author{font-weight:700;font-size:.8rem;opacity:.95}
.chat-time{font-size:.7rem;opacity:.7;margin-left:8px}
.chat-text{white-space:pre-wrap;word-wrap:break-word;line-height:1.35}
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
  text-align: left;
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
</style>
