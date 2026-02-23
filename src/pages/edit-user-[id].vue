<template>
  <div class="edit-user-page">
    <v-container fluid>
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn class="back-btn" @click="$router.push('/user-management')">
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
              <v-progress-circular color="primary" indeterminate />
              <p class="mt-4">Loading User Information Details...</p>
            </v-card-text>
          </v-card>

          <!-- Error -->
          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon color="error" icon="mdi-alert" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <!-- Form -->
          <v-card v-else class="form-card" elevation="0">
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-card-text>
                <!-- Profile Image Preview -->
                <v-row class="mb-4" justify="center">
                  <v-col class="d-flex justify-center" cols="12">
                    <v-avatar class="user-avatar" size="112">
                      <v-img v-if="entryProfileImageSource" alt="Profile image" cover :src="entryProfileImageSource" />
                      <span v-else class="avatar-initials">{{ entryInitials }}</span>
                    </v-avatar>
                  </v-col>
                </v-row>
                <!-- Image actions -->
                <v-row class="mb-2" justify="center">
                  <v-col class="d-flex justify-center" cols="12">
                    <input
                      ref="fileInput"
                      accept="image/*"
                      style="display:none"
                      type="file"
                      @change="handleFileSelect"
                    >
                    <v-btn
                      class="upload-btn mr-3"
                      color="black"
                      :disabled="imageUploadLoading || !entry.id"
                      :loading="imageUploadLoading"
                      variant="elevated"
                      @click="selectFile"
                    >
                      {{ imageUploadLoading ? 'Uploading...' : 'Change Image' }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row>
                  <!-- First Name -->
                  <v-col v-if="entry.userType !== 'Agency'" cols="12" md="6">
                    <v-text-field
                      v-model="entry.firstName"
                      class="custom-input"
                      label="First Name"
                      required
                      :rules="[v => !!v || 'First name is required']"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Last Name -->
                  <v-col v-if="entry.userType !== 'Agency'" cols="12" md="6">
                    <v-text-field
                      v-model="entry.lastName"
                      class="custom-input"
                      label="Last Name"
                      required
                      :rules="[v => !!v || 'Last name is required']"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Email -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.email"
                      class="custom-input"
                      label="Email"
                      readonly
                      required
                      :rules="emailRules"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- User Type -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.userType"
                      class="custom-input"
                      :items="['Agency', 'Admin', 'Super Admin']"
                      label="User Type"
                      required
                      :rules="[v => !!v || 'User type is required']"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Agency Name -->
                  <v-col v-if="entry.userType === 'Agency'" cols="12" md="6">
                    <v-text-field
                      v-model="entry.agencyName"
                      class="custom-input"
                      label="Agency Name"
                      required
                      :rules="[v => !!v || 'Agency name is required']"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Registration Number (optional) -->
                  <v-col v-if="entry.userType === 'Agency'" cols="12" md="6">
                    <v-text-field
                      v-model="entry.regNo"
                      class="custom-input"
                      label="Registration Number (optional)"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Address -->
                  <v-col v-if="entry.userType === 'Agency'" cols="12" md="6">
                    <v-text-field
                      v-model="entry.address"
                      class="custom-input"
                      label="Address"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Primary Contact Name -->
                  <v-col v-if="entry.userType === 'Agency'" cols="12" md="6">
                    <v-text-field
                      v-model="entry.primaryContactName"
                      class="custom-input"
                      label="Primary Contact Name"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Contact Number -->
                  <v-col v-if="entry.userType === 'Agency'" cols="12" md="6">
                    <v-text-field
                      v-model="entry.contactNumber"
                      class="custom-input"
                      label="Contact Number"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Notes / Description (optional) -->
                  <v-col v-if="entry.userType === 'Agency'" cols="12">
                    <v-textarea
                      v-model="entry.notes"
                      auto-grow
                      class="custom-input"
                      label="Notes (optional)"
                      rows="3"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Status -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.status"
                      class="custom-input"
                      :items="['Active', 'Inactive']"
                      label="Status"
                      required
                      :rules="[v => !!v || 'Status is required']"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>
              </v-card-text>

              <!-- Action Buttons -->
              <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn
                  class="cancel-btn"
                  color="grey"
                  :disabled="saving"
                  variant="outlined"
                  @click="$router.push('/user-management')"
                >
                  Cancel
                </v-btn>
                <v-btn
                  class="submit-btn"
                  color="black"
                  :disabled="!valid || saving"
                  :loading="saving"
                  variant="elevated"
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
  import { doc, getDoc, updateDoc } from 'firebase/firestore'
  import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
  import { useAuditTrail } from '@/composables/useAuditTrail'
  import { useCustomDialogs } from '@/composables/useCustomDialogs'
  import { db, storage } from '@/firebaseConfig'

  export default {
    name: 'EditUserPage',
    setup () {
      const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
      const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
      return { showSuccessDialog, showErrorDialog, logAuditEvent, auditActions, resourceTypes }
    },
    data () {
      return {
        entry: {
          id: null,
          firstName: '',
          lastName: '',
          email: '',
          userType: '',
          agencyName: '',
          regNo: '',
          address: '',
          primaryContactName: '',
          contactNumber: '',
          notes: '',
          status: 'Active',
        },
        loading: true,
        saving: false,
        error: null,
        valid: true,
        imageUploadLoading: false,
        imageError: '',
        emailRules: [
          v => !!v || 'Email is required',
          v => /.+@.+\..+/.test(v) || 'Enter a valid email',
        ],
      }
    },
    computed: {
      entryProfileImageSource () {
        return this.entry?.profileImageUrl || this.entry?.profileImage || ''
      },
      entryInitials () {
        const a = (String(this.entry?.firstName || '').trim()[0] || '').toUpperCase()
        const b = (String(this.entry?.lastName || '').trim()[0] || '').toUpperCase()
        return (a + b) || a || b || '?'
      },
    },
    async mounted () {
      document.title = 'Edit User Information - Depsure'
      const entryId = this.$route.params.id
      if (entryId) {
        await this.loadEntryData(entryId)
      } else {
        this.error = 'User ID not found'
        this.loading = false
      }
    },
    methods: {
      selectFile () {
        this.imageError = ''
        if (this.$refs.fileInput) this.$refs.fileInput.click()
      },
      async handleFileSelect (event) {
        const file = event.target.files && event.target.files[0]
        this.imageError = ''
        if (!file || !this.entry?.id) return
        // Validate
        if (!file.type || !file.type.startsWith('image/')) {
          this.showErrorDialog('Please select a valid image file', 'Invalid File', 'OK')
          return
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
          this.showErrorDialog('Image size must be less than 5MB', 'Too Large', 'OK')
          return
        }
        this.imageUploadLoading = true
        try {
          const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
          const path = `profile-images/${this.entry.id}-${Date.now()}.${ext}`
          const ref = storageRef(storage, path)
          const snap = await uploadBytes(ref, file)
          const url = await getDownloadURL(snap.ref)
          // Update Firestore doc
          const userRef = doc(db, 'users', this.entry.id)
          await updateDoc(userRef, { profileImageUrl: url, updatedAt: new Date() })
          // Update local state
          this.entry.profileImageUrl = url
          this.showSuccessDialog('Profile picture updated successfully', 'Success', 'OK')
        } catch (error) {
          console.error('Error uploading image:', error)
          this.showErrorDialog('Failed to upload image. Please try again.', 'Error', 'OK')
        } finally {
          this.imageUploadLoading = false
          if (this.$refs.fileInput) this.$refs.fileInput.value = ''
        }
      },
      async loadEntryData (id) {
        try {
          const docRef = doc(db, 'users', id)
          const docSnap = await getDoc(docRef)

          if (docSnap.exists()) {
            this.entry = {
              id: docSnap.id,
              ...docSnap.data(),
            }
            // Ensure optional fields exist for reactivity and backward compatibility
            this.entry.regNo = this.entry.regNo || ''
            this.entry.address = this.entry.address || this.entry.agencyAddress || ''
            this.entry.primaryContactName = this.entry.primaryContactName || ''
            this.entry.contactNumber = this.entry.contactNumber || this.entry.agencyPhone || ''
            this.entry.notes = this.entry.notes || this.entry.agencyDescription || ''
          } else {
            this.error = 'User not found'
          }
        } catch (error) {
          console.error('Error loading user:', error)
          this.error = 'Failed to load user'
        } finally {
          this.loading = false
        }
      },

      async saveEntry () {
        if (this.$refs.form.validate()) {
          this.saving = true
          try {
            console.log('Saving user information:', this.entry)

            const userData = {
              firstName: this.entry.firstName,
              lastName: this.entry.lastName,
              email: this.entry.email,
              userType: this.entry.userType,
              agencyName: this.entry.userType === 'Agency' ? this.entry.agencyName : '',
              // Extended agency fields + legacy mappings
              regNo: this.entry.userType === 'Agency' ? (this.entry.regNo || '') : '',
              address: this.entry.userType === 'Agency' ? (this.entry.address || '') : '',
              primaryContactName: this.entry.userType === 'Agency' ? (this.entry.primaryContactName || '') : '',
              contactNumber: this.entry.userType === 'Agency' ? (this.entry.contactNumber || '') : '',
              notes: this.entry.userType === 'Agency' ? (this.entry.notes || '') : '',
              agencyPhone: this.entry.userType === 'Agency' ? (this.entry.contactNumber || '') : '',
              agencyAddress: this.entry.userType === 'Agency' ? (this.entry.address || '') : '',
              agencyDescription: this.entry.userType === 'Agency' ? (this.entry.notes || '') : '',
              status: this.entry.status,
              updatedAt: new Date(),
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
                lastName: this.entry.lastName,
              },
              this.resourceTypes.USER,
              this.entry.id,
            )

            console.log('User data updated in Firestore')
            this.showSuccessDialog(
              'User information updated successfully!',
              'Success!',
              'Continue',
              `/view-user-${this.entry.id}`,
            )
          } catch (error) {
            console.error('Error updating user:', error)
            this.showErrorDialog(
              'Failed to update user information. Please try again.',
              'Error',
              'OK',
            )
          } finally {
            this.saving = false
          }
        }
      },
    },
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

.user-avatar { background: #e9ecef; }
.avatar-initials { color:#111; font-weight:700; font-size: 1.25rem; display:flex; align-items:center; justify-content:center; width:100%; height:100%; }
</style>
