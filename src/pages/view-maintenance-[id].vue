<template>
  <div class="view-maintenance-page">
    <v-container fluid>
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            icon="mdi-arrow-left"
            variant="outlined"
            color="primary"
            @click="$router.push('/maintenance')"
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
            <h1 class="page-title">Maintenance Entry Details</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading maintenance entry...</p>
            </v-card-text>
          </v-card>

          <!-- Error -->
          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon icon="mdi-alert" color="error" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <!-- Maintenance Info -->
          <div v-else class="form-card" elevation="0">
            <v-card-text>
              <v-row>
                <!-- Agency -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.agencyName || 'Not specified'"
                    label="Agency"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

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

                <!-- Notice Given -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.noticeGiven"
                    label="Notice Given"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Vacate Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.vacateDate"
                    label="Vacate Date"
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

                <!-- Address -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.address"
                    label="Address"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Status -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.status"
                    label="Maintenance Status"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Priority -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.priority"
                    label="Priority Level"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Estimated Cost -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.estimatedCost ? `R${entry.estimatedCost.toLocaleString()}` : 'Not specified'"
                    label="Estimated Cost"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                

                <!-- Notes -->
                <v-col cols="12">
                  <v-textarea
                    :model-value="entry.notes || 'No additional notes'"
                    label="Additional Notes"
                    variant="outlined"
                    readonly
                    class="custom-input"
                    rows="3"
                    auto-grow
                  />
                </v-col>

                <!-- Created Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'Not available'"
                    label="Created Date"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Last Updated -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString() : 'Not available'"
                    label="Last Updated"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
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
                v-if="isAgencyUser || userType === 'Admin'"
                color="black"
                variant="elevated"
                class="edit-btn"
                @click="editEntry"
              >
                Edit Entry
              </v-btn>
            </v-card-actions>
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
        <div class="quote-dialog-inner" >
          <button class="quote-close" @click="showQuoteDialog = false">&times;</button>

          <div class="quote-icon">
            <v-icon >mdi-file-pdf-box</v-icon>
          </div>

          <h2 class="quote-title">Quote Instructions</h2>
          <p class="quote-subtitle">{{ entry.quoteFileName }}</p>
          
          <div v-if="entry.quoteFileURL" class="pdf-container">
            <div class="pdf-controls">
              <button class="zoom-btn" @click="zoomOut">-</button>
              <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
              <button class="zoom-btn" @click="zoomIn">+</button>
            </div>
            <div class="pdf-wrapper" :style="{ transform: `scale(${zoomLevel})` }">
              <iframe
                :src="entry.quoteFileURL"
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
              v-if="entry.quoteFileURL"
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
import { db } from '@/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'

export default {
  name: "ViewMaintenancePage",
  setup() {
    const { showErrorDialog } = useCustomDialogs()
    return { showErrorDialog }
  },
  computed: {
    isAgencyUser() {
      const appStore = useAppStore();
      return appStore.currentUser?.userType === 'Agency';
    },
    userType() {
      const appStore = useAppStore();
      return appStore.currentUser?.userType;
    }
  },
  data() {
    return {
      entry: {},
      loading: true,
      error: null,
      showQuoteDialog: false,
      zoomLevel: 1
    };
  },
  async mounted() {
    document.title = "Maintenance Entry Details - Depsure";
    const entryId = this.$route.params.id;
    this.loadEntry(entryId);
  },
  methods: {
    async loadEntry(entryId) {
      try {
        const docRef = doc(db, 'maintenance', entryId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          this.entry = {
            id: docSnap.id,
            agencyName: data.agencyName || 'Not specified',
            unitName: data.unitName || '',
            noticeGiven: data.noticeGiven || 'No',
            vacateDate: data.vacateDate || '',
            contactNumber: data.contactNumber || '',
            address: data.address || '',
            status: data.status || 'Pending',
            priority: data.priority || 'Medium',
            estimatedCost: data.estimatedCost || 0,
            notes: data.notes || '',
            quoteFileName: data.quoteFileName || '',
            quoteFileURL: data.quoteFileURL || '',
            createdAt: data.createdAt?.toDate() || data.createdAt,
            updatedAt: data.updatedAt?.toDate() || data.updatedAt
          };
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

    editEntry() {
      this.$router.push(`/edit-maintenance-${this.entry.id}`);
    },
    
    openInNewTab() {
      if (this.entry.quoteFileURL) {
        window.open(this.entry.quoteFileURL, '_blank');
      }
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
.view-maintenance-page {
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.custom-input .v-field {
  border-radius: 8px;
}

.custom-input :deep(.v-field__input) {
  padding: 10px !important;
  background-color: white !important;
  color: #000 !important;
}

.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}

.edit-btn {
  width: 160px;
  height: 44px;
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  background-color: black !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background-color: #333 !important;
  transform: translateY(-1px);
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
  margin-top: -14%;
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
  .view-maintenance-page {
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
