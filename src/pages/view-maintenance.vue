<template>
  <div class="view-maintenance-entry-page">
    <v-container fluid>

      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            class="back-btn"
            color="primary"
            icon="mdi-arrow-left"
            variant="outlined"
            @click="$router.push('/maintenance')"
          >
            Back
          </v-btn>
        </v-col>
      </v-row>

      <!-- Agency Info Card (if applicable) -->
      <v-row v-if="agencyDetails" class="mb-6">
        <v-col cols="12">
          <v-card class="agency-info-card-black">
            <div class="agency-card-bg" :style="agencyCardBgStyle" />
            <v-row align="stretch" class="no-gutters">
              <v-col cols="12">
                <div class="agency-content-right">
                  <v-card-title class="text-white text-h4 mb-2">
                    {{ agencyDetails.name }}
                  </v-card-title>
                  <v-card-text class="text-white">
                    <div class="agency-details-black">
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-map-marker" />
                        <span>{{ agencyDetails.address || 'Address not provided' }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-card-account-details" />
                        <span>Reg No: {{ agencyDetails.regNo || '—' }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-account" />
                        <span>Primary Contact: {{ agencyDetails.primaryContactName || 'N/A' }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-phone" />
                        <span>{{ agencyDetails.contactNumber || 'N/A' }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-email" />
                        <span>{{ agencyDetails.email || 'N/A' }}</span>
                      </div>
                      <div v-if="agencyDetails.properties != null" class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-home" />
                        <span>{{ agencyDetails.properties }} Properties</span>
                      </div>
                    </div>
                    <v-divider class="my-4 bg-white" />
                    <p class="agency-description-black">
                      {{ agencyDetails.notes || 'No notes available' }}
                    </p>
                  </v-card-text>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Maintenance Entry Details -->
      <v-row>
        <v-col cols="12" lg="6" md="8">
          <v-card class="pa-4">
            <v-card-title class="text-h5">
              Maintenance Entry Details
            </v-card-title>
            <v-divider class="my-2" />
            <v-card-text>
              <v-row class="mb-3">
                <v-col class="font-weight-bold" cols="5">Unit Name:</v-col>
                <v-col cols="7">{{ entry.unitName }}</v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col class="font-weight-bold" cols="5">Notice Given:</v-col>
                <v-col cols="7">{{ entry.noticeGiven }}</v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col class="font-weight-bold" cols="5">Vacate Date:</v-col>
                <v-col cols="7">{{ entry.vacateDate }}</v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col class="font-weight-bold" cols="5">Contact Number:</v-col>
                <v-col cols="7">{{ entry.contactNumber }}</v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col class="font-weight-bold" cols="5">Address:</v-col>
                <v-col cols="7">{{ entry.address }}</v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col class="font-weight-bold" cols="5">Quote Instructions:</v-col>
                <v-col cols="7">
                  <div v-if="entry.quoteFileName && entry.quoteFileURL" class="quote-file-display">
                    <v-btn
                      class="quote-file-btn"
                      color="primary"
                      :href="entry.quoteFileURL"
                      prepend-icon="mdi-file-pdf-box"
                      size="small"
                      target="_blank"
                      variant="outlined"
                    >
                      <span class="quote-file-name">{{ entry.quoteFileName }}</span>
                      <v-icon right>mdi-open-in-new</v-icon>
                    </v-btn>
                  </div>
                  <div v-else class="no-file-message">
                    No file uploaded
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions class="mt-4">
              <v-btn
                v-if="entry.quoteFileName && entry.quoteFileURL"
                class="view-quote-btn"
                color="primary"
                prepend-icon="mdi-file-pdf-box"
                variant="outlined"
                @click="showQuoteDialog = true"
              >
                View Quote Instructions
              </v-btn>
              <v-btn
                v-if="isAgencyUser || userType === 'Admin'"
                color="primary"
                @click="editEntry"
              >
                Edit Entry
              </v-btn>
              <v-btn
                v-if="isAgencyUser || userType === 'Admin'"
                color="error"
                @click="deleteEntry"
              >
                Delete Entry
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Quote Instructions Dialog -->
      <v-dialog
        v-model="showQuoteDialog"
        max-height="90vh"
        max-width="90vw"
        persistent
      >
        <v-card class="quote-dialog">
          <v-card-title class="quote-dialog-title">
            <v-icon color="primary" left>mdi-file-pdf-box</v-icon>
            Quote Instructions - {{ entry.quoteFileName }}
            <v-spacer />
            <v-btn
              class="close-btn"
              icon="mdi-close"
              variant="text"
              @click="showQuoteDialog = false"
            />
          </v-card-title>
          <v-card-text class="quote-dialog-content">
            <div v-if="entry.quoteFileURL" class="pdf-container">
              <iframe
                class="pdf-iframe"
                frameborder="0"
                height="600"
                :src="entry.quoteFileURL"
                width="100%"
              />
            </div>
            <div v-else class="no-pdf-message">
              <v-icon color="error" size="64">mdi-file-pdf-box</v-icon>
              <p>PDF file not available</p>
            </div>
          </v-card-text>
          <v-card-actions class="quote-dialog-actions">
            <v-spacer />
            <v-btn
              color="primary"
              variant="outlined"
              @click="showQuoteDialog = false"
            >
              Close
            </v-btn>
            <v-btn
              color="primary"
              :href="entry.quoteFileURL"
              prepend-icon="mdi-open-in-new"
              target="_blank"
              variant="elevated"
            >
              Open in New Tab
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script>
  import { useCustomDialogs } from '@/composables/useCustomDialogs'
  import { useNotification } from '@/composables/useNotification'
  import { useAppStore } from '@/stores/app'

  export default {
    name: 'ViewMaintenanceEntry',
    setup () {
      const { showSuccess } = useNotification()
      const { showConfirmDialog } = useCustomDialogs()
      return { showSuccess, showConfirmDialog }
    },
    data () {
      return {
        entry: null,
        showQuoteDialog: false,
        agencies: [
          {
            name: 'Pam Golding Properties',
            logo: 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg',
            location: 'Cape Town, South Africa',
            established: '1976',
            properties: 1250,
            rating: 4.8,
            description: 'Premium real estate agency specializing in luxury properties and exceptional service.',
          },
          {
            name: 'RE/MAX Properties',
            logo: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
            location: 'Johannesburg, South Africa',
            established: '1973',
            properties: 890,
            rating: 4.6,
            description: 'Global real estate network with local expertise and innovative solutions.',
          },
        ],
      }
    },
    computed: {
      agencyDetails () {
        return this.entry ? this.agencies.find(a => a.name === this.entry.agency) : null
      },
      isAgencyUser () {
        const appStore = useAppStore()
        const user = appStore.currentUser
        return user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency')
      },
      userType () {
        const appStore = useAppStore()
        return appStore.currentUser?.userType
      },
      agencyCardBgStyle () {
        const url = this.agencyDetails?.logo || this.agencyDetails?.profileImageUrl || this.agencyDetails?.profileImage || 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg'
        return {
          background: `url(${url}) center/cover no-repeat`,
        }
      },
    },
    mounted () {
      this.fetchEntry()
      document.title = 'View Maintenance Entry - Depsure'
    },
    methods: {
      fetchEntry () {
        const id = Number(this.$route.params.id)
        // Fetch entry from a store, API, or pass via props
        const entries = [
          {
            id: 1,
            unitName: '123 Main Street, Cape Town',
            noticeGiven: '2024-12-01',
            vacateDate: '2025-01-15',
            contactNumber: '0821234567',
            address: '123 Main Street, Cape Town',
            quoteInstructions: 'Upload required quote PDF here.',
            agency: 'Pam Golding Properties',
          },
          {
            id: 2,
            unitName: '456 Ocean Drive, Camps Bay',
            noticeGiven: '2024-05-01',
            vacateDate: '2024-06-01',
            contactNumber: '0839876543',
            address: '456 Ocean Drive, Camps Bay',
            quoteInstructions: '',
            agency: 'RE/MAX Properties',
          },
        ]
        this.entry = entries.find(e => e.id === id)
      },
      editEntry () {
        this.$router.push(`/edit-maintenance-${this.entry.id}`)
      },
      async deleteEntry () {
        try {
          await this.showConfirmDialog({
            title: 'Delete maintenance entry?',
            message: `Are you sure you want to delete maintenance entry for ${this.entry.unitName}?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            color: '#dc3545',
          })
        } catch {
          return
        }
        // Delete logic here (API or store)
        this.showSuccess('Maintenance entry deleted successfully!')
        this.$router.back()
      },
    },
  }
</script>

<style scoped>
.view-maintenance-entry-page {
  padding: 20px;
  min-height: 100vh;
}

.back-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: black !important;
  color: white !important;
  border: 2px solid black !important;
  width: 140px;
  height: 40px;
}

.agency-info-card-black {
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  color: white;
  padding: 0;
  position: relative;
}
/* Background image layer */
.agency-card-bg { position:absolute; inset:0; z-index:0; }
/* Dark right-to-left gradient overlay behind info */
.agency-info-card-black::after { content:''; position:absolute; inset:0; background:linear-gradient(to left, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0)); pointer-events:none; }
.agency-info-card-black .no-gutters, .agency-info-card-black .v-row { position:relative; z-index:1; }
.agency-content-right { margin-left:auto; width:min(720px,55%); padding:16px 16px 24px; text-align:left; }

.agency-logo-black {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.agency-details-black { margin-bottom: 16px; }
.detail-item-black { display: flex; align-items: center; margin-bottom: 12px; color: #fff; }
.agency-description-black { color: #e0e0e0; }

/* Quote file display */
.quote-file-display {
  display: flex;
  align-items: center;
}

.quote-file-btn {
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  max-width: 100%;
  overflow: hidden;
}

.quote-file-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.quote-file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  display: inline-block;
}

.no-file-message {
  color: #666;
  font-style: italic;
  padding: 8px 0;
}

/* View Quote Button */
.view-quote-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-right: 12px;
}

.view-quote-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Quote Dialog */
.quote-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.quote-dialog-title {
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  font-weight: 600;
}

.close-btn {
  margin-left: 8px;
}

.quote-dialog-content {
  padding: 0;
  max-height: 70vh;
  overflow: hidden;
}

.pdf-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
}

.pdf-iframe {
  border: none;
  border-radius: 0;
  width: 100%;
  height: 100%;
  min-height: 600px;
}

.no-pdf-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #666;
}

.no-pdf-message p {
  margin-top: 16px;
  font-size: 1.1rem;
}

.quote-dialog-actions {
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  padding: 16px 24px;
}

@media (max-width: 768px) {
  .agency-logo-black { height: 220px; }
  .agency-content-right { width:100%; }
}
</style>
