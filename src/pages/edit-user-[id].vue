<template>
  <div class="edit-user-page">
    <v-container fluid>
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn @click="$router.push('/user-management')" class="back-btn">
            Back
          </v-btn>
        </v-col>
      </v-row>

      <!-- Title Section -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="title-section">
            <h1 class="page-title">Edit User Information</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading User Information Details...</p>
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
          <v-card v-else class="form-card" elevation="0">
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-card-text>
                <v-row>
                  <!-- First Name -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.firstName"
                      label="First Name"
                      variant="outlined"
                      class="custom-input"
                      :rules="[v => !!v || 'First name is required']"
                      required
                    />
                  </v-col>

                  <!-- Last Name -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.lastName"
                      label="Last Name"
                      variant="outlined"
                      class="custom-input"
                      :rules="[v => !!v || 'Last name is required']"
                      required
                    />
                  </v-col>

                  <!-- Email -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.email"
                      label="Email"
                      variant="outlined"
                      class="custom-input"
                      :rules="emailRules"
                      required
                      readonly
                    />
                  </v-col>

                  <!-- User Type -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.userType"
                      label="User Type"
                      variant="outlined"
                      class="custom-input"
                      :items="['Agency', 'Admin', 'Super Admin']"
                      :rules="[v => !!v || 'User type is required']"
                      required
                    />
                  </v-col>

                  <!-- Agency Name -->
                  <v-col cols="12" md="6" v-if="entry.userType === 'Agency'">
                    <v-text-field
                      v-model="entry.agencyName"
                      label="Agency Name"
                      variant="outlined"
                      class="custom-input"
                      :rules="[v => !!v || 'Agency name is required']"
                      required
                    />
                  </v-col>

                  <!-- Status -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.status"
                      label="Status"
                      variant="outlined"
                      class="custom-input"
                      :items="['Active', 'Inactive']"
                      :rules="[v => !!v || 'Status is required']"
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
                  class="cancel-btn"
                  @click="$router.push('/user-management')"
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
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { db } from '@/firebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useAuditTrail } from '@/composables/useAuditTrail'

export default {
  name: "EditUserPage",
  setup() {
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    return { showSuccessDialog, showErrorDialog, logAuditEvent, auditActions, resourceTypes }
  },
  data() {
    return {
      entry: {
        id: null,
        firstName: "",
        lastName: "",
        email: "",
        userType: "",
        agencyName: "",
        status: "Active"
      },
      loading: true,
      saving: false,
      error: null,
      valid: true,
      emailRules: [
        v => !!v || "Email is required",
        v => /.+@.+\..+/.test(v) || "Enter a valid email"
      ]
    };
  },
  async mounted() {
    document.title = "Edit User Information - Depsure"
    const entryId = this.$route.params.id
    if (entryId) {
      await this.loadEntryData(entryId)
    } else {
      this.error = "User ID not found"
      this.loading = false
    }
  },
  methods: {
    async loadEntryData(id) {
      try {
        const docRef = doc(db, 'users', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          this.entry = {
            id: docSnap.id,
            ...docSnap.data()
          }
        } else {
          this.error = "User not found"
        }
      } catch (error) {
        console.error('Error loading user:', error)
        this.error = "Failed to load user"
      } finally {
        this.loading = false
      }
    },

    async saveEntry() {
      if (this.$refs.form.validate()) {
        this.saving = true
        try {
          console.log("Saving user information:", this.entry)

          const userData = {
            firstName: this.entry.firstName,
            lastName: this.entry.lastName,
            email: this.entry.email,
            userType: this.entry.userType,
            agencyName: this.entry.userType === 'Agency' ? this.entry.agencyName : '',
            status: this.entry.status,
            updatedAt: new Date()
          }

          const docRef = doc(db, 'users', this.entry.id)
          await updateDoc(docRef, userData)

          // Log the audit event
          await this.logAuditEvent(
            this.auditActions.UPDATE,
            {
              userId: this.entry.id,
              email: this.entry.email,
              userType: this.entry.userType,
              agencyName: this.entry.agencyName,
              status: this.entry.status,
              firstName: this.entry.firstName,
              lastName: this.entry.lastName
            },
            this.resourceTypes.USER,
            this.entry.id
          )

          console.log('User data updated in Firestore')
          this.showSuccessDialog(
            'User information updated successfully!',
            'Success!',
            'Continue',
            `/view-user-${this.entry.id}`
          )
        } catch (error) {
          console.error('Error updating user:', error)
          this.showErrorDialog(
            'Failed to update user information. Please try again.',
            'Error',
            'OK'
          )
        } finally {
          this.saving = false
        }
      }
    }
  }
}
</script>

<style scoped>
.edit-user-page {
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
}
.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  text-align: left;
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
.custom-input :deep(.v-field__input) {
  background-color: white !important;
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

/* Responsive */
@media (max-width: 768px) {
  .edit-user-page {
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
