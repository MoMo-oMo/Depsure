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
            @click="$router.go(-1)"
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
            <v-card-text>
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
              <div v-else-if="vacancy" class="vacancy-details">
                <v-row>
                  <!-- Unit Name -->
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Unit Name/Address</label>
                      <div class="detail-value">{{ vacancy.unitName }}</div>
                    </div>
                  </v-col>

                  <!-- Date Vacated -->
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Date Vacated</label>
                      <div class="detail-value">{{ formatDate(vacancy.dateVacated) }}</div>
                    </div>
                  </v-col>

                  <!-- New Tenant Found -->
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">New Tenant Found</label>
                      <div class="detail-value">
                        <v-chip 
                          :color="vacancy.newTenantFound === 'Yes' ? 'success' : 'warning'"
                          size="small"
                        >
                          {{ vacancy.newTenantFound }}
                        </v-chip>
                      </div>
                    </div>
                  </v-col>

                  <!-- Move In Date -->
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Move In Date</label>
                      <div class="detail-value">
                        {{ vacancy.moveInDate ? formatDate(vacancy.moveInDate) : 'Not specified' }}
                      </div>
                    </div>
                  </v-col>

                  <!-- Property Manager -->
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Property Manager</label>
                      <div class="detail-value">{{ vacancy.propertyManager }}</div>
                    </div>
                  </v-col>

                  <!-- Contact Number -->
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Contact Number</label>
                      <div class="detail-value">
                        <a :href="`tel:${vacancy.contactNumber}`" class="contact-link">
                          {{ vacancy.contactNumber }}
                        </a>
                      </div>
                    </div>
                  </v-col>

                  <!-- Monthly Rent -->
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Monthly Rent</label>
                      <div class="detail-value">${{ formatCurrency(vacancy.monthlyRent) }}</div>
                    </div>
                  </v-col>

                  <!-- Security Deposit -->
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Security Deposit</label>
                      <div class="detail-value">${{ formatCurrency(vacancy.securityDeposit) }}</div>
                    </div>
                  </v-col>

                  <!-- Property Status -->
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Property Status</label>
                      <div class="detail-value">
                        <v-chip 
                          :color="getStatusColor(vacancy.propertyStatus)"
                          size="small"
                        >
                          {{ vacancy.propertyStatus }}
                        </v-chip>
                      </div>
                    </div>
                  </v-col>

                  <!-- Cleaning Required -->
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Cleaning Required</label>
                      <div class="detail-value">
                        <v-chip 
                          :color="vacancy.cleaningRequired === 'Yes' ? 'error' : 'success'"
                          size="small"
                        >
                          {{ vacancy.cleaningRequired }}
                        </v-chip>
                      </div>
                    </div>
                  </v-col>

                  <!-- Notes -->
                  <v-col cols="12">
                    <div class="detail-item">
                      <label class="detail-label">Notes</label>
                      <div class="detail-value notes-text">
                        {{ vacancy.notes || 'No notes available' }}
                      </div>
                    </div>
                  </v-col>
                </v-row>

                <!-- Action Buttons -->
                <v-row class="mt-6">
                  <v-col cols="12" class="d-flex justify-center gap-4">
                    <v-btn
                      color="black"
                      variant="elevated"
                      @click="editVacancy"
                      class="action-btn"
                    >
                      <v-icon left>mdi-pencil</v-icon>
                      Edit Vacancy
                    </v-btn>
                    <v-btn
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
              </div>
            </v-card-text>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { useNotification } from '@/composables/useNotification'

export default {
  name: 'ViewVacancyPage',
  setup() {
    const { showSuccess } = useNotification()
    return { showSuccess }
  },
  data() {
    return {
      vacancy: null,
      loading: true,
      error: null
    }
  },
  mounted() {
    console.log('ViewVacancyPage mounted with ID:', this.$route.params.id);
    document.title = 'View Vacancy - Depsure';
    this.loadVacancy();
  },
  methods: {
    async loadVacancy() {
      this.loading = true;
      this.error = null;
      
      try {
        // Simulate API call - in real app, fetch from API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API call
        this.vacancy = {
          id: this.$route.params.id,
          unitName: '123 Main Street, Apt 4B',
          dateVacated: '2024-12-01',
          newTenantFound: 'Yes',
          moveInDate: '2025-01-15',
          propertyManager: 'John Smith',
          contactNumber: '+1 (555) 123-4567',
          monthlyRent: 2500,
          securityDeposit: 5000,
          propertyStatus: 'Reserved',
          cleaningRequired: 'No',
          notes: 'Tenant left the property in excellent condition. New tenant has been approved and will move in on January 15th, 2025.'
        };
        
        this.loading = false;
      } catch (err) {
        this.error = 'Failed to load vacancy details. Please try again.';
        this.loading = false;
        console.error('Error loading vacancy:', err);
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
    
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US').format(amount);
    },
    
    getStatusColor(status) {
      const colors = {
        'Available': 'success',
        'Under Maintenance': 'warning',
        'Reserved': 'info',
        'Rented': 'primary'
      };
      return colors[status] || 'default';
    },
    
    editVacancy() {
      this.$router.push(`/edit-vacancy-${this.vacancy.id}`);
    },
    
    deleteVacancy() {
      if (confirm(`Are you sure you want to delete the vacancy for ${this.vacancy.unitName}?`)) {
        // In a real app, make API call to delete
        console.log('Deleting vacancy:', this.vacancy.id);
        this.showSuccess('Vacancy deleted successfully!');
        this.$router.push('/vacancies');
      }
    }
  }
}
</script>

<style scoped>
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
