<template>
  <div class="add-agency-page">
    <v-container fluid>

      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            class="back-btn"
            color="primary"
            icon="mdi-arrow-left"
            variant="outlined"
            @click="$router.go(-1)"
          >
            Back
          </v-btn>
        </v-col>
      </v-row>

      <!-- Title Section -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="title-section">
            <h1 class="page-title">Add New Agency</h1>
          </div>

          <div class="form-card" elevation="0">
            <v-form ref="form" v-model="valid" lazy-validation>
              <!-- Profile Image Upload -->
              <v-row class="logo-row pa-4">
                <v-col class="d-flex align-center" cols="12" md="auto">
                  <div class="logo-square" :class="{ 'has-image': !!user.profileImage }" @click="triggerFileInput">
                    <template v-if="user.profileImage">
                      <img alt="Profile Preview" :src="user.profileImage">
                    </template>
                    <template v-else>
                      <div class="logo-placeholder">
                        <v-icon class="mr-2" size="24">mdi-image-plus</v-icon>
                        <span>Profile</span>
                      </div>
                    </template>
                  </div>
                </v-col>
                <v-col class="d-flex align-center logo-actions" cols="12" md="8">
                  <input
                    ref="fileInput"
                    accept="image/*"
                    style="display: none"
                    type="file"
                    @change="handleImageUpload"
                  >
                  <v-btn
                    class="upload-btn mr-3"
                    color="black"
                    variant="elevated"
                    @click="triggerFileInput"
                  >
                    Upload Image
                  </v-btn>
                  <v-btn
                    v-if="user.profileImage"
                    class="cancel-btn"
                    color="grey"
                    variant="outlined"
                    @click="removeImage"
                  >
                    Remove
                  </v-btn>
                </v-col>
              </v-row>

              <v-card-text>
                <v-row>
                  <!-- Email -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="user.email"
                      class="custom-input"
                      label="Email Address"
                      required
                      :rules="emailRules"
                      type="email"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Password -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="user.password"
                      class="custom-input"
                      label="Password"
                      required
                      :rules="passwordRules"
                      type="password"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Status -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="user.status"
                      class="custom-input"
                      :items="['Active', 'Inactive']"
                      label="Status"
                      required
                      :rules="statusRules"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Agency Fields (mirror View Agency) -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="user.agencyName"
                      class="custom-input"
                      label="Agency Name"
                      required
                      :rules="agencyNameRules"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="user.regNo"
                      class="custom-input"
                      label="Registration Number (optional)"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="user.address"
                      class="custom-input"
                      label="Address"
                      required
                      :rules="addressRules"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="user.primaryContactName"
                      class="custom-input"
                      label="Primary Contact Name"
                      required
                      :rules="primaryContactNameRules"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="user.contactNumber"
                      class="custom-input"
                      label="Contact Number"
                      required
                      :rules="phoneRules"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="user.notes"
                      auto-grow
                      class="custom-input"
                      label="Notes (optional)"
                      rows="3"
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
                  variant="outlined"
                  @click="$router.go(-1)"
                >
                  Cancel
                </v-btn>
                <v-btn
                  class="save-btn"
                  color="black"
                  :disabled="!valid || loading"
                  :loading="loading"
                  variant="elevated"
                  @click="saveUser"
                >
                  {{ loading ? 'Adding Agency...' : 'Add Agency' }}
                </v-btn>
              </v-card-actions>
            </v-form>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  import { createUserWithEmailAndPassword } from 'firebase/auth'
  import { doc, setDoc } from 'firebase/firestore'
  import { useAuditTrail } from '@/composables/useAuditTrail'
  import { useCustomDialogs } from '@/composables/useCustomDialogs'
  import { auth, db } from '@/firebaseConfig'
  import { useAppStore } from '@/stores/app'

  export default {
    name: 'AddAgencyPage',
    setup () {
      const appStore = useAppStore()
      const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
      const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
      return { appStore, showSuccessDialog, showErrorDialog, logAuditEvent, auditActions, resourceTypes }
    },
    data () {
      return {
        user: {
          email: '',
          password: '',
          userType: 'Agency',
          status: 'Active',
          profileImage: null,
          // Agency fields (mirror View Agency)
          agencyName: '',
          regNo: '',
          address: '',
          primaryContactName: '',
          contactNumber: '',
          notes: '',
        },
        valid: true,
        loading: false,
        // Validation rules
        emailRules: [
          v => !!v || 'Email is required',
          v => /.+@.+\..+/.test(v) || 'Email must be valid',
        ],
        passwordRules: [
          v => !!v || 'Password is required',
          v => v.length >= 8 || 'Password must be at least 8 characters',
          v => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v) || 'Password must contain uppercase, lowercase, and number',
        ],
        statusRules: [
          v => !!v || 'Status is required',
        ],
        agencyNameRules: [
          v => !!v || 'Agency Name is required',
          v => v.length >= 3 || 'Agency Name must be at least 3 characters',
        ],
        addressRules: [
          v => !!v || 'Address is required',
        ],
        primaryContactNameRules: [
          v => !!v || 'Primary Contact Name is required',
        ],
        phoneRules: [
          v => !!v || 'Contact Number is required',
          v => (/^(0[1-9]\d{8}|\+27[1-9]\d{8})$/).test((v || '').replace(/\s|-/g, '')) || 'Enter a valid SA number (0XXXXXXXXX or +27XXXXXXXXX)',
        ],
      }
    },
    mounted () {
      document.title = 'Add New Agency - Depsure'
    },
    methods: {
      async saveUser () {
        if (this.$refs.form.validate()) {
          this.loading = true
          try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              this.user.email,
              this.user.password,
            )

            const newUser = userCredential.user

            // Prepare user data for Firestore
            const userData = {
              email: this.user.email,
              userType: 'Agency',
              status: this.user.status,
              createdAt: new Date(),
              createdBy: this.appStore.userId,
              profileImageUrl: this.user.profileImage || null,
              // Agency-specific fields
              agencyName: this.user.agencyName,
              regNo: this.user.regNo || '',
              address: this.user.address,
              primaryContactName: this.user.primaryContactName,
              contactNumber: this.user.contactNumber,
              notes: this.user.notes || '',
            }

            // Save user data to Firestore
            await setDoc(doc(db, 'users', newUser.uid), userData)

            // Log the audit event
            await this.logAuditEvent(
              this.auditActions.CREATE,
              {
                userEmail: this.user.email,
                userType: 'Agency',
                status: this.user.status,
                hasProfileImage: !!this.user.profileImage,
                agencyName: this.user.agencyName || null,
              },
              this.resourceTypes.USER,
              newUser.uid,
            )

            this.showSuccessDialog('Agency added successfully!', 'Success!', 'Continue', '/user-management')
          } catch (error) {
            console.error('Error saving agency:', error)

            let errorMessage = 'Failed to add agency. Please try again.'
            switch (error.code) {
              case 'auth/email-already-in-use': {
                errorMessage = 'A user with this email already exists.'

                break
              }
              case 'auth/weak-password': {
                errorMessage = 'Password is too weak. Please choose a stronger password.'

                break
              }
              case 'auth/invalid-email': {
                errorMessage = 'Invalid email address.'

                break
              }
            // No default
            }

            this.showErrorDialog(errorMessage, 'Error', 'OK')
          } finally {
            this.loading = false
          }
        }
      },

      triggerFileInput () {
        this.$refs.fileInput.click()
      },

      handleImageUpload (event) {
        const file = event.target.files[0]
        if (file) {
          if (file.size > 25 * 1024 * 1024) {
            this.showErrorDialog('File size must be less than 25MB', 'File Too Large', 'OK')
            return
          }
          if (!file.type.startsWith('image/')) {
            this.showErrorDialog('Please select a valid image file', 'Invalid File', 'OK')
            return
          }
          const reader = new FileReader()
          reader.addEventListener('load', e => {
            this.user.profileImage = e.target.result
          })
          reader.readAsDataURL(file)
        }
      },

      removeImage () {
        this.user.profileImage = null
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = ''
        }
      },
    },
  }
</script>

<style scoped>
.add-agency-page {
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
  text-align: center;
  text-transform: uppercase;
}

/* Form card styling */
.form-card {
  background: white;
  border-radius: 0 0 12px 12px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.logo-row { margin-bottom: 0 !important; }

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 16px 0 8px 0;
  padding-left: 8px;
  border-left: 4px solid #000000;
}

.logo-square {
  width: 180px;
  height: 180px;
  border: 2px dashed #cfcfcf;
  border-radius: 12px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color .2s ease;
}

.logo-square:hover { border-color: #9e9e9e; }
.logo-square.has-image { border-style: solid; }
.logo-square img { width: 100%; height: 100%; object-fit: contain; }

.logo-placeholder { display: flex; align-items: center; color: #8a8a8a; font-size: 0.95rem; }
.logo-actions { gap: 12px; flex-wrap: wrap; }

.upload-btn { height: 44px; text-transform: none; border-radius: 8px; }

/* Input field styling */
.custom-input .v-field { border-radius: 8px; }

.custom-input :deep(.v-field__outline) { border-color: #e9ecef !important; }

/* Button styling */
.cancel-btn { font-weight: 500; text-transform: none; border-radius: 8px; transition: all 0.3s ease; width: 120px; height: 44px; }
.cancel-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); }
.save-btn { font-weight: 500; text-transform: none; border-radius: 8px; transition: all 0.3s ease; width: 160px; height: 44px; background-color: black !important; color: white !important; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); }
.save-btn:hover:not(:disabled) { background-color: #333 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); }
.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Responsive adjustments */
@media (max-width: 768px) {
  .add-agency-page { padding: 10px; }
  .page-title { font-size: 1.1rem; }
  .back-btn { width: 140px; height: 40px; }
  .cancel-btn, .save-btn { width: 100%; margin-bottom: 8px; }
  .logo-square { width: 160px; height: 160px; margin-bottom: 8px; }
}
</style>
