<template>
  <div class="view-notice-page">
    <v-container fluid>
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            icon="mdi-arrow-left"
            variant="outlined"
            color="primary"
            @click="$router.push('/notices')"
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
            <h1 class="page-title">Notice Details</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading notice details...</p>
            </v-card-text>
          </v-card>

          <!-- Error -->
          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon icon="mdi-alert" color="error" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <!-- Notice Info -->
          <div v-else class="form-card" elevation="0">
            <v-card-text>
              <v-row>
                <!-- Unit Name -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="notice.unitName"
                    label="Unit Name"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Lease Start Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="notice.leaseStartDate"
                    label="Lease Start Date"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Notice Given Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="notice.noticeGivenDate"
                    label="Notice Given Date"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Vacate Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="notice.vacateDate"
                    label="Vacate Date"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Maintenance Required -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="notice.maintenanceRequired"
                    label="Maintenance Required After Inspection"
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
                v-if="isAgencyUser || userType === 'Admin'"
                color="black"
                variant="elevated"
                class="edit-btn"
                @click="$router.push(`/edit-notice-${notice.id}`)"
              >
                Edit Notice
              </v-btn>
              <v-btn
                v-if="isAgencyUser || userType === 'Admin'"
                color="error"
                variant="text"
                class="delete-btn"
                @click="deleteNotice"
              >
                <v-icon start>mdi-delete</v-icon>
                Delete
              </v-btn>
            </v-card-actions>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { useAppStore } from '@/stores/app'
import { db } from '@/firebaseConfig'
import { doc, getDoc, deleteDoc } from 'firebase/firestore'

export default {
  name: "ViewNoticePage",
  data() {
    return {
      notice: {
        id: '',
        unitName: '',
        leaseStartDate: '',
        noticeGivenDate: '',
        vacateDate: '',
        maintenanceRequired: ''
      },
      loading: true,
      error: null,
    };
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
  async mounted() {
    document.title = "Notice Details - Depsure";
    const noticeId = this.$route.params.id;
    if (noticeId) {
      await this.loadNotice(noticeId);
    } else {
      this.error = 'No notice ID provided';
      this.loading = false;
    }
  },
  methods: {
    async loadNotice(noticeId) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Loading notice data for ID:', noticeId);
        
        // Fetch notice from Firestore
        const noticeDoc = await getDoc(doc(db, 'notices', noticeId));
        
        if (noticeDoc.exists()) {
          const noticeData = noticeDoc.data();
          this.notice = {
            id: noticeDoc.id,
            ...noticeData
          };
          console.log('Notice loaded successfully:', this.notice);
        } else {
          this.error = 'Notice not found';
          console.log('Notice not found in Firestore');
        }
      } catch (error) {
        console.error('Error loading notice:', error);
        this.error = `Failed to load notice details: ${error.message}`;
      } finally {
        this.loading = false;
      }
    },
    async deleteNotice() {
      const { showSuccessDialog, showErrorDialog, showConfirmDialog } = useCustomDialogs()
      try {
        await showConfirmDialog({
          title: 'Delete notice?',
          message: `Are you sure you want to delete notice for ${this.notice.unitName}?`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          color: '#dc3545'
        })
      } catch (_) {
        return
      }
      try {
        await deleteDoc(doc(db, 'notices', this.notice.id))
        showSuccessDialog('Notice deleted successfully!', 'Success!', 'Continue', '/notices')
      } catch (error) {
        console.error('Error deleting notice:', error)
        showErrorDialog(`Failed to delete notice: ${error.message}`, 'Error', 'OK')
      }
    }
  },
};
</script>

<style scoped>
.view-notice-page {
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

/* Responsive */
@media (max-width: 768px) {
  .view-notice-page {
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
