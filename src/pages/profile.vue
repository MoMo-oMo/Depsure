<template>
  <div class="profile-page">
    <v-container fluid>
      

      <!-- Profile Content -->
      <v-row>
        <v-col cols="12" lg="4">
          <!-- Profile Card -->
          <div class="profile-card-container">
            <div class="profile-card-header">
              <h2 class="profile-card-title">Profile Picture</h2>
            </div>
            <v-card class="profile-card">
              <v-card-text class="text-center pa-6">
                <div class="profile-avatar-container">
                  <v-avatar size="120" class="profile-avatar">
                    <v-img 
                      :src="userAvatar" 
                      alt="Profile Picture"
                      cover
                    />
                  </v-avatar>
                </div>
                
                <h2 class="profile-name mt-4">{{ userName }}</h2>
                <v-chip 
                  :color="getRoleColor(userType)" 
                  size="small" 
                  variant="tonal"
                  class="mt-2"
                >
                  {{ userType }}
                </v-chip>
                <p class="profile-email mt-2">{{ userEmail }}</p>
                <p class="profile-since mt-1">Member since {{ memberSince }}</p>
                
                <button
                  v-if="isEditMode"
                  class="change-image-btn mt-4"
                  @click="selectFile"
                  :disabled="imageUploadLoading"
                >
                  {{ imageUploadLoading ? 'Uploading...' : 'Change Image' }}
                </button>
              </v-card-text>
            </v-card>
          </div>
        </v-col>

        <v-col cols="12" lg="8">
          <!-- Personal Information Form -->
          <div class="form-card-container">
            <div class="form-card-header">
              <h2 class="form-card-title">
                <v-icon class="mr-2">mdi-account</v-icon>
                Personal Information
              </h2>
            </div>
            <v-card class="form-card">
            
            <v-card-text>
              <v-form ref="personalForm" v-model="personalFormValid">
                <v-row class="my-4">
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="personalInfo.firstName"
                      label="First Name"
                      variant="outlined"
                      density="comfortable"
                      :rules="nameRules"
                      prepend-inner-icon="mdi-account"
                      :disabled="!isEditMode"
                      class="custom-input"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="personalInfo.lastName"
                      label="Last Name"
                      variant="outlined"
                      density="comfortable"
                      :rules="nameRules"
                      prepend-inner-icon="mdi-account"
                      :disabled="!isEditMode"
                      class="custom-input"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="personalInfo.email"
                      label="Email Address"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-email"
                      type="email"
                      disabled
                      class="custom-input"
                    />
                  </v-col>
                 
                </v-row>
              </v-form>
            </v-card-text>

            <!-- Action Buttons -->
            <v-card-actions class="pa-4" v-if="isEditMode">
              <v-spacer />
              <v-btn
                class="cancel-btn mr-3"
                @click="cancelEdit"
              >
                Cancel
              </v-btn>
              <v-btn
                class="save-btn"
                @click="savePersonalInfo"
                :loading="personalLoading"
                :disabled="!personalFormValid"
              >
                Save Changes
              </v-btn>
            </v-card-actions>
            </v-card>
          </div>

          <!-- Agency Information (for Agency users) -->
          <div v-if="userType === 'Agency'" class="form-card-container mt-4">
            <div class="form-card-header">
              <h2 class="form-card-title">
                <v-icon class="mr-2">mdi-office-building</v-icon>
                Agency Information
              </h2>
            </div>
            <v-card class="form-card">
              <v-card-text>
                <v-form ref="agencyForm" v-model="agencyFormValid">
                  <v-row class="my-4">
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="agencyInfo.agencyName"
                        label="Agency Name"
                        variant="outlined"
                        density="comfortable"
                        :rules="nameRules"
                        prepend-inner-icon="mdi-office-building"
                        :disabled="!isEditMode"
                        class="custom-input"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="agencyInfo.contactNumber"
                        label="Primary Contact Number"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-phone"
                        :disabled="!isEditMode"
                        class="custom-input"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="agencyInfo.primaryContactName"
                        label="Primary Contact Name"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-account"
                        :disabled="!isEditMode"
                        class="custom-input"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="agencyInfo.regNo"
                        label="Registration Number"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-card-account-details"
                        :disabled="!isEditMode"
                        class="custom-input"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="agencyInfo.address"
                        label="Agency Address"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-map-marker"
                        :disabled="!isEditMode"
                        class="custom-input"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="agencyInfo.description"
                        label="Agency Description"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-text"
                        :disabled="!isEditMode"
                        class="custom-input"
                        rows="3"
                      />
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>

              <!-- Agency Action Buttons -->
              <v-card-actions class="pa-4" v-if="isEditMode">
                <v-spacer />
                <v-btn
                  class="cancel-btn mr-3"
                  @click="cancelEdit"
                >
                  Cancel
                </v-btn>
                <v-btn
                  class="save-btn"
                  @click="saveAgencyInfo"
                  :loading="agencyLoading"
                  :disabled="!agencyFormValid"
                >
                  Save Changes
                </v-btn>
              </v-card-actions>
            </v-card>
          </div>

          <!-- Account Information -->
          <div class="form-card-container mt-4">
            <div class="form-card-header">
              <h2 class="form-card-title">
                <v-icon class="mr-2">mdi-information</v-icon>
                Account Information
              </h2>
            </div>
            <v-card class="form-card">
            
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="info-item">
                    <div class="info-label">Account Type</div>
                    <div class="info-value">
                      <v-chip :color="getRoleColor(userType)" size="small" variant="tonal">
                        {{ userType }}
                      </v-chip>
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="info-item">
                    <div class="info-label">Member Since</div>
                    <div class="info-value">{{ memberSince }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="info-item">
                    <div class="info-label">User ID</div>
                    <div class="info-value">{{ userId }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value">
                      <v-chip color="success" size="small">
                        Active
                      </v-chip>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
            </v-card>
          </div>

          <!-- Super Admin Actions -->
          <div v-if="userType === 'Super Admin'" class="form-card-container mt-4">
            <div class="form-card-header">
              <h2 class="form-card-title">
                <v-icon class="mr-2">mdi-shield-crown</v-icon>
                Super Admin Actions
              </h2>
            </div>
            <v-card class="form-card">
              <v-card-text>
                <v-row>
                  <v-col cols="12">
                    <button
                      class="archived-units-btn"
                      @click="showArchivedUnitsDialog = true"
                    >
                      <v-icon class="mr-2">mdi-eye</v-icon>
                      View Deleted Archived Units
                    </button>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>

      <!-- Floating Edit Button -->
      <v-btn
        v-if="!isEditMode"
        color="black"
        icon="mdi-pencil"
        size="large"
        class="floating-edit-btn"
        @click="toggleEditMode"
        elevation="8"
      />

      <!-- PIN Dialog for Archived Units -->
      <div v-if="showArchivedUnitsDialog" class="notification-overlay" @click.self="showArchivedUnitsDialog = false">
        <div class="notification-dialog">
          <!-- colored card behind -->
          <div class="notification-dialog-bg primary"></div>
          <!-- main white card -->
          <div class="notification-dialog-inner">
            <button class="notification-close" @click="showArchivedUnitsDialog = false">&times;</button>
    
            <div class="notification-icon black">
              <v-icon>mdi-eye</v-icon>
            </div>
    
            <h2 class="notification-title">Access Archived Units</h2>
            <p class="notification-message">Enter the PIN to view deleted/archived property units</p>
            
            <v-form ref="pinForm" v-model="pinFormValid" class="mt-4">
              <v-text-field
                v-model="pinInput"
                label="Enter PIN"
                type="password"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock"
                :rules="pinRules"
                @keyup.enter="validatePin"
                autocomplete="off"
                class="mb-4"
                hide-details
              />
            </v-form>
            
            <div class="dialog-buttons">
              <button class="notification-button secondary" @click="showArchivedUnitsDialog = false">
                Cancel
              </button>
              <button 
                :class="['notification-button', 'black']" 
                @click="validatePin"
                :disabled="!pinFormValid || pinLoading"
              >
                <span v-if="pinLoading">Validating...</span>
                <span v-else>Access</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Hidden file input for image upload -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileSelect"
      />
    </v-container>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useNotification } from '@/composables/useNotification'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { updatePassword, updateEmail } from 'firebase/auth'
import { auth, storage, db } from '@/firebaseConfig'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, updateDoc } from 'firebase/firestore'

export default {
  name: 'ProfilePage',
  setup() {
    const router = useRouter()
    const appStore = useAppStore()
    const { showSuccess, showError } = useNotification()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()

    // Form refs
    const personalForm = ref(null)
    const agencyForm = ref(null)
    const fileInput = ref(null)

    // Form validation
    const personalFormValid = ref(false)
    const agencyFormValid = ref(false)

    // Loading states
    const personalLoading = ref(false)
    const agencyLoading = ref(false)
    const imageUploadLoading = ref(false)
    const editLoading = ref(false)

    // Edit mode
    const isEditMode = ref(false)

    // Image upload
    const selectedImage = ref(null)
    const imageError = ref('')

    // PIN Dialog Data
    const showArchivedUnitsDialog = ref(false)
    const pinInput = ref('')
    const pinFormValid = ref(false)
    const pinLoading = ref(false)

    // User data
    const userName = computed(() => appStore.userName)
    const userType = computed(() => appStore.userType)
    const userEmail = computed(() => appStore.userEmail)
    const userAvatar = computed(() => appStore.userAvatar)
    const userId = computed(() => appStore.userId)

    // Mock data for demonstration
    const memberSince = ref('January 2024')

    // Form data
    const personalInfo = reactive({
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    })

    const agencyInfo = reactive({
      agencyName: '',
      contactNumber: '',
      primaryContactName: '',
      regNo: '',
      address: '',
      description: ''
    })

    // Validation rules
    const nameRules = [
      v => !!v || 'Name is required',
      v => v.length >= 2 || 'Name must be at least 2 characters'
    ]

    const emailRules = [
      v => !!v || 'Email is required',
      v => /.+@.+\..+/.test(v) || 'Please enter a valid email address'
    ]

    const imageRules = [
      v => !v || v.size <= 5 * 1024 * 1024 || 'Image size should be less than 5 MB'
    ]

    // Methods
    const getRoleColor = (role) => {
      const colors = {
        'Super Admin': 'error',
        'Admin': 'warning',
        'Agency': 'info',
        'User': 'success'
      }
      return colors[role] || 'grey'
    }

    const toggleEditMode = () => {
      isEditMode.value = !isEditMode.value
      if (!isEditMode.value) {
        // Reset form to original values
        resetForm()
      }
    }

    const cancelEdit = () => {
      isEditMode.value = false
      resetForm()
    }

    const resetForm = () => {
      const nameParts = userName.value.split(' ')
      personalInfo.firstName = nameParts[0] || ''
      personalInfo.lastName = nameParts.slice(1).join(' ') || ''
      personalInfo.email = userEmail.value || ''
      personalInfo.phone = ''
      
      // Reset agency info if user is agency
      if (userType.value === 'Agency') {
        agencyInfo.agencyName = appStore.currentUser?.agencyName || ''
        agencyInfo.contactNumber = appStore.currentUser?.contactNumber || appStore.currentUser?.agencyPhone || ''
        agencyInfo.primaryContactName = appStore.currentUser?.primaryContactName || ''
        agencyInfo.regNo = appStore.currentUser?.regNo || ''
        agencyInfo.address = appStore.currentUser?.address || appStore.currentUser?.agencyAddress || ''
        agencyInfo.description = appStore.currentUser?.agencyDescription || ''
      }
    }

    const savePersonalInfo = async () => {
      personalLoading.value = true
      try {
        // Update user data in Firestore
        const userRef = doc(db, 'users', userId.value)
        await updateDoc(userRef, {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          email: personalInfo.email,
          phone: personalInfo.phone,
          updatedAt: new Date()
        })

        // Update local store
        appStore.setUser({
          ...appStore.currentUser,
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          email: personalInfo.email,
          phone: personalInfo.phone
        })

        // Log the audit event
        await logAuditEvent(
          auditActions.UPDATE,
          {
            field: 'personal_info',
            oldValue: appStore.currentUser.firstName + ' ' + appStore.currentUser.lastName,
            newValue: personalInfo.firstName + ' ' + personalInfo.lastName,
            email: personalInfo.email,
            phone: personalInfo.phone
          },
          resourceTypes.PROFILE,
          userId.value
        )

        isEditMode.value = false
        showSuccess('Personal information updated successfully')
      } catch (error) {
        console.error('Error updating personal info:', error)
        showError('Failed to update personal information')
      } finally {
        personalLoading.value = false
      }
    }

    const saveAgencyInfo = async () => {
      agencyLoading.value = true
      try {
        // Update agency data in Firestore
        const userRef = doc(db, 'users', userId.value)
        await updateDoc(userRef, {
          agencyName: agencyInfo.agencyName,
          // Keep legacy fields for backward compatibility
          agencyPhone: agencyInfo.contactNumber,
          agencyAddress: agencyInfo.address,
          // Fields used across info cards
          contactNumber: agencyInfo.contactNumber,
          primaryContactName: agencyInfo.primaryContactName,
          regNo: agencyInfo.regNo,
          address: agencyInfo.address,
          agencyDescription: agencyInfo.description,
          updatedAt: new Date()
        })

        // Update local store
        appStore.setUser({
          ...appStore.currentUser,
          agencyName: agencyInfo.agencyName,
          agencyPhone: agencyInfo.contactNumber,
          agencyAddress: agencyInfo.address,
          contactNumber: agencyInfo.contactNumber,
          primaryContactName: agencyInfo.primaryContactName,
          regNo: agencyInfo.regNo,
          address: agencyInfo.address,
          agencyDescription: agencyInfo.description
        })

        // Log the audit event
        await logAuditEvent(
          auditActions.UPDATE,
          {
            field: 'agency_info',
            oldValue: appStore.currentUser.agencyName,
            newValue: agencyInfo.agencyName,
            agencyPhone: agencyInfo.phone,
            agencyAddress: agencyInfo.address,
            agencyDescription: agencyInfo.description
          },
          resourceTypes.PROFILE,
          userId.value
        )

        isEditMode.value = false
        showSuccess('Agency information updated successfully')
      } catch (error) {
        console.error('Error updating agency info:', error)
        showError('Failed to update agency information')
      } finally {
        agencyLoading.value = false
      }
    }

    const selectFile = () => {
      fileInput.value.click()
    }

    const handleFileSelect = async (event) => {
      const file = event.target.files[0]
      imageError.value = ''
      
      if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          showError('Image size must be less than 5MB')
          selectedImage.value = null
          return
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          showError('Please select a valid image file')
          selectedImage.value = null
          return
        }

        selectedImage.value = file
        // Automatically upload the image
        await uploadImage()
      } else {
        selectedImage.value = null
      }
    }

    const uploadImage = async () => {
      if (!selectedImage.value) return

      imageUploadLoading.value = true
      try {
        // Create a unique filename
        const fileExtension = selectedImage.value.name.split('.').pop()
        const fileName = `profile-images/${userId.value}-${Date.now()}.${fileExtension}`
        
        // Upload to Firebase Storage
        const imageRef = storageRef(storage, fileName)
        const snapshot = await uploadBytes(imageRef, selectedImage.value)
        
        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref)
        
        // Update user document in Firestore
        const userRef = doc(db, 'users', userId.value)
        await updateDoc(userRef, {
          profileImageUrl: downloadURL,
          updatedAt: new Date()
        })

        // Update local store
        appStore.updateUserAvatar(downloadURL)
        
        showSuccess('Profile picture updated successfully')
        selectedImage.value = null
      } catch (error) {
        console.error('Error uploading image:', error)
        showError('Failed to upload image. Please try again.')
      } finally {
        imageUploadLoading.value = false
      }
    }

    const validatePin = async () => {
      pinLoading.value = true
      try {
        // Check if PIN is correct (Pass123!)
        if (pinInput.value === 'Pass123!') {
          showSuccess('PIN validated successfully')
          showArchivedUnitsDialog.value = false
          pinInput.value = ''
          
          // Navigate to archived units page
          router.push('/archived-units')
        } else {
          showError('Incorrect PIN. Please try again.')
          pinInput.value = ''
        }
      } catch (error) {
        console.error('Error validating PIN:', error)
        showError('Failed to validate PIN. Please try again.')
      } finally {
        pinLoading.value = false
      }
    }

    // Initialize form data
    onMounted(() => {
      resetForm()
    })

    return {
      // Data
      personalForm,
      agencyForm,
      fileInput,
      personalFormValid,
      agencyFormValid,
      personalLoading,
      agencyLoading,
      imageUploadLoading,
      editLoading,
      isEditMode,
      selectedImage,
      imageError,
      personalInfo,
      agencyInfo,
      memberSince,

      // PIN Dialog Data
      showArchivedUnitsDialog,
      pinInput,
      pinFormValid,
      pinLoading,

      // Computed
      userName,
      userType,
      userEmail,
      userAvatar,
      userId,

      // Rules
      nameRules,
      emailRules,
      imageRules,
      pinRules: [
        v => !!v || 'PIN is required',
        v => v.length >= 4 || 'PIN must be at least 4 characters'
      ],

      // Methods
      getRoleColor,
      toggleEditMode,
      cancelEdit,
      resetForm,
      savePersonalInfo,
      saveAgencyInfo,
      selectFile,
      handleFileSelect,
      uploadImage,
      validatePin,
      router
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px 0;
}

.page-subtitle {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

.profile-card-container {
  margin-bottom: 24px;
}

.profile-card-header {
  background: black;
  color: white;
  padding: 0.75rem;
  border-radius: 12px 12px 0 0;
  margin-bottom: 0;
}

.profile-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0;
  text-align: center;
}

.profile-card {
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.profile-avatar-container {
  position: relative;
  display: inline-block;
}

.profile-avatar {
  border: 4px solid #e0e0e0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.profile-email {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.profile-since {
  color: #999;
  margin: 0;
  font-size: 0.8rem;
}

.form-card-container {
  margin-bottom: 24px;
}

.form-card-header {
  background: black;
  color: white;
  padding: 0.75rem;
  border-radius: 12px 12px 0 0;
  margin-bottom: 0;
}

.form-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0;
  text-align: center;
}

.form-card {
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.info-item {
  padding: 16px;
  border-radius: 8px;
  background: #f8f9fa;
  margin-bottom: 8px;
}

.info-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
  margin-bottom: 4px;
}

.info-value {
  font-size: 1rem;
  color: #333;
  font-weight: 600;
}

.custom-input :deep(.v-field) {
  border-radius: 8px;
}

.custom-input :deep(.v-field__input) {
  background-color: white !important;
  color: #333 !important;
}

.custom-input :deep(.v-field__outline) {
  border-color: #e0e0e0 !important;
}

.floating-edit-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: black !important;
  color: white !important;
  border: 2px solid white !important;
}

.floating-edit-btn:hover {
  background-color: #333 !important;
  border-color: #333 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

/* Button styling to match system */
.cancel-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 120px;
  height: 44px;
  background-color: white !important;
  color: #333 !important;
  border: 2px solid #e0e0e0 !important;
}

.cancel-btn:hover {
  background-color: #f5f5f5 !important;
  border-color: #ccc !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.save-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 160px;
  height: 44px;
  background-color: black !important;
  color: white !important;
  border: 2px solid black !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.save-btn:hover:not(:disabled) {
  background-color: #333 !important;
  border-color: #333 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.change-image-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: black;
  color: white;
  border: 2px solid black;
  padding: 12px 24px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.change-image-btn:hover:not(:disabled) {
  background-color: #333;
  border-color: #333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.change-image-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.archived-units-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: black;
  color: white;
  border: 2px solid black;
  padding: 12px 24px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.archived-units-btn:hover {
  background-color: #333;
  border-color: #333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}



.upload-preview {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

/* PIN Dialog Styles - matching NotificationDialog */
.notification-overlay {
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

.notification-dialog {
  position: relative;
  width: 500px;
  max-width: 90vw;
  min-height: 200px;
}

.notification-dialog-bg {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 96%;
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.notification-dialog-bg.primary {
  background-color: black;
}

.notification-dialog-inner {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.notification-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}

.notification-icon {
  position: relative;
  margin: 0 auto 24px auto;
  margin-top: -16%;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInCircle 0.3s ease-out forwards;
}

.notification-icon.primary {
  background-color: #1976d2;
}

.notification-icon.black {
  background-color: #000000;
}

.notification-icon .v-icon {
  font-size: 40px;
  color: #ffffff;
}

.notification-icon::before {
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
}

.notification-icon.primary::before {
  background-color: #1976d2;
}

.notification-icon.black::before {
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

.notification-title {
  font-size: 2em;
  margin: 0 0 12px 0;
}

.notification-message {
  font-size: 1.2em;
  margin: 0 0 32px 0;
}

.dialog-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.notification-button {
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1.1em;
  padding: 12px 24px;
  cursor: pointer;
  min-width: 100px;
}

.notification-button.primary {
  background-color: #1976d2;
}

.notification-button.black {
  background-color: #000000;
}

.notification-button.secondary {
  background-color: #6c757d;
}

.notification-button:hover:not(:disabled) {
  opacity: 0.9;
}

.notification-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .floating-edit-btn {
    bottom: 16px;
    right: 16px;
  }
}
</style>

