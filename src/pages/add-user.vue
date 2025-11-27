<template>
  <div class="add-user-page">
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
            <h1 class="page-title">Add New User</h1>
          </div>
          
          <div class="form-card" elevation="0">
                         <v-form ref="form" v-model="valid" lazy-validation>
               <!-- **Row 0: Profile Image Upload at very top (square block + button)** -->
               <v-row class="logo-row pa-4">
                 <v-col cols="12" md="auto" class="d-flex align-center">
                   <div class="logo-square"  :class="{ 'has-image': !!user.profileImage }" @click="triggerFileInput">
                     <template v-if="user.profileImage">
                       <img :src="user.profileImage" alt="Profile Preview" />
                     </template>
                     <template v-else>
                       <div class="logo-placeholder">
                         <v-icon size="24" class="mr-2">mdi-image-plus</v-icon>
                         <span>Profile</span>
                       </div>
                     </template>
                   </div>
                 </v-col>
                 <v-col cols="12" md="8" class="d-flex align-center logo-actions">
                   <input
                     ref="fileInput"
                     type="file"
                     accept="image/*"
                     @change="handleImageUpload"
                     style="display: none"
                   />
                   <v-btn
                     color="black"
                     variant="elevated"
                     class="upload-btn mr-3"
                     @click="triggerFileInput"
                   >
                     Upload Image
                   </v-btn>
                   <v-btn
                     v-if="user.profileImage"
                     color="grey"
                     variant="outlined"
                     class="cancel-btn"
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
                       label="Email Address"
                       variant="outlined"
                       type="email"
                       class="custom-input"
                       :rules="emailRules"
                       required
                     />
                   </v-col>

                  <!-- Password -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="user.password"
                      label="Password"
                      variant="outlined"
                      type="password"
                      class="custom-input"
                      :rules="passwordRules"
                      required
                    />
                  </v-col>

                  <!-- User Type -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="user.userType"
                      label="User Type"
                      variant="outlined"
                      class="custom-input"
                      :items="['Agency', 'Admin', 'Super Admin']"
                      :rules="userTypeRules"
                      required
                    />
                  </v-col>

                  <!-- Admin Scope (only for Admin users) -->
                  <template v-if="user.userType === 'Admin'">
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="user.adminScope"
                        :items="[
                          { title: 'Depsure Admin', value: 'depsure' },
                          { title: 'Agency Admin', value: 'agency' }
                        ]"
                        item-title="title"
                        item-value="value"
                        label="Admin Type"
                        variant="outlined"
                        class="custom-input"
                        :rules="[v => !!v || 'Admin type is required']"
                        required
                      />
                    </v-col>
                    <!-- Agency Admin specific fields -->
                    <v-col cols="12" md="6" v-if="user.adminScope === 'agency'">
                      <v-select
                        v-model="user.managedAgencyId"
                        :items="agencies"
                        item-title="agencyName"
                        item-value="id"
                        :loading="agenciesLoading"
                        label="Select Agency"
                        variant="outlined"
                        class="custom-input"
                        :rules="[v => !!v || 'Please select an agency']"
                        required
                      />
                    </v-col>
                    <v-col cols="12" md="6" v-if="user.adminScope === 'agency'">
                      <v-text-field
                        v-model="user.firstName"
                        label="First Name"
                        variant="outlined"
                        class="custom-input"
                        :rules="firstNameRules"
                        required
                      />
                    </v-col>
                    <v-col cols="12" md="6" v-if="user.adminScope === 'agency'">
                      <v-text-field
                        v-model="user.lastName"
                        label="Last Name"
                        variant="outlined"
                        class="custom-input"
                        :rules="lastNameRules"
                        required
                      />
                    </v-col>
                  </template>

                  <!-- Status -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="user.status"
                      label="Status"
                      variant="outlined"
                      class="custom-input"
                      :items="['Active', 'Inactive']"
                      :rules="statusRules"
                       required
                     />
                   </v-col>

                  <!-- Agency Fields (Conditional) -->
                  <template v-if="user.userType === 'Agency'">
                    <v-col cols="12">
                      <v-divider class="my-4"></v-divider>
                      <h3 class="section-title">Agency Information</h3>
                    </v-col>

                    <!-- Agency Name (required) -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="user.agencyName"
                        label="Agency Name"
                        variant="outlined"
                        class="custom-input"
                        :rules="agencyNameRules"
                        required
                      />
                    </v-col>

                    <!-- Registration Number (optional) -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="user.regNo"
                        label="Registration Number (optional)"
                        variant="outlined"
                        class="custom-input"
                      />
                    </v-col>

                    <!-- Address (required) -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="user.address"
                        label="Address"
                        variant="outlined"
                        class="custom-input"
                        :rules="addressRules"
                        required
                      />
                    </v-col>

                    <!-- Primary Contact Name (required) -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="user.primaryContactName"
                        label="Primary Contact Name"
                        variant="outlined"
                        class="custom-input"
                        :rules="primaryContactNameRules"
                        required
                      />
                    </v-col>

                    <!-- Contact Number (required; SA format) -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="user.contactNumber"
                        label="Contact Number"
                        variant="outlined"
                        class="custom-input"
                        :rules="phoneRules"
                        required
                      />
                    </v-col>

                    <!-- Notes (optional) -->
                    <v-col cols="12">
                      <v-textarea
                        v-model="user.notes"
                        label="Notes (optional)"
                        variant="outlined"
                        class="custom-input"
                        rows="3"
                        auto-grow
                      />
                    </v-col>
                  </template>
                </v-row>
              </v-card-text>

              <!-- Action Buttons -->
              <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn
                  color="grey"
                  variant="outlined"
                  @click="$router.go(-1)"
                  class="cancel-btn"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="black"
                  variant="elevated"
                  @click="saveUser"
                  :disabled="!valid || loading"
                  :loading="loading"
                  class="save-btn"
                >
                  {{ loading ? 'Adding User...' : 'Add User' }}
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
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { auth, db, storage } from '@/firebaseConfig'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage'
import { useAppStore } from '@/stores/app'

export default {
  name: 'AddUserPage',
  setup() {
    const appStore = useAppStore()
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    return { appStore, showSuccessDialog, showErrorDialog, logAuditEvent, auditActions, resourceTypes }
  },
  data() {
    return {
      user: {
        email: '',
        password: '',
        userType: '',
        status: 'Active',
        profileImage: null,
        // Admin scope fields
        adminScope: 'depsure', // 'depsure' | 'agency'
        managedAgencyId: '',
        managedAgencyName: '',
        firstName: '',
        lastName: '',
        // Agency fields (mirror View Agency)
        agencyName: '',
        regNo: '',
        address: '',
        primaryContactName: '',
        contactNumber: '',
        notes: ''
      },
      agencies: [],
      agenciesLoading: false,
      valid: true,
      loading: false,
      // Validation rules
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Email must be valid'
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 8 || 'Password must be at least 8 characters',
        v => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v) || 'Password must contain uppercase, lowercase, and number'
      ],
      userTypeRules: [
        v => !!v || 'User Type is required'
      ],
      statusRules: [
        v => !!v || 'Status is required'
      ],
      agencyNameRules: [
        v => (this.user.userType !== 'Agency') || (!!v && v.length >= 3) || 'Agency Name is required (min 3 chars)'
      ],
      addressRules: [
        v => (this.user.userType !== 'Agency') || !!v || 'Address is required'
      ],
      primaryContactNameRules: [
        v => (this.user.userType !== 'Agency') || !!v || 'Primary Contact Name is required'
      ],
      phoneRules: [
        v => (this.user.userType !== 'Agency') || !!v || 'Contact Number is required',
        v => (this.user.userType !== 'Agency') || (/^(0[1-9]\d{8}|\+27[1-9]\d{8})$/).test((v||'').replace(/\s|-/g,'')) || 'Enter a valid SA number (0XXXXXXXXX or +27XXXXXXXXX)'
      ],
      firstNameRules: [
        v => (this.user.userType !== 'Admin' || this.user.adminScope !== 'agency') || !!v || 'First name is required for Agency Admin'
      ],
      lastNameRules: [
        v => (this.user.userType !== 'Admin' || this.user.adminScope !== 'agency') || !!v || 'Last name is required for Agency Admin'
      ]
    }
  },
  mounted() {
    console.log('AddUserPage mounted');
    document.title = 'Add New User - Depsure';
    // Prefill from query params (e.g., after creating an Agency)
    const qp = this.$route?.query || {}
    if (qp.userType) this.user.userType = String(qp.userType)
    if (qp.agencyName) this.user.agencyName = String(qp.agencyName)
    // Preload agencies for Admin scope selection
    this.fetchAgencies()
  },
     methods: {
      async fetchAgencies() {
        try {
          this.agenciesLoading = true
          const q = query(collection(db, 'users'), where('userType', '==', 'Agency'))
          const snap = await getDocs(q)
          this.agencies = snap.docs.map(d => ({ id: d.id, ...(d.data() || {} ) }))
        } catch (e) {
          console.error('Failed to fetch agencies for admin assignment:', e)
          this.agencies = []
        } finally {
          this.agenciesLoading = false
        }
      },
      async saveUser() {
        if (this.$refs.form.validate()) {
          this.loading = true;
          console.log('Adding new user:', this.user);
          
          try {
           // Create user in Firebase Auth
           const userCredential = await createUserWithEmailAndPassword(
             auth,
             this.user.email,
             this.user.password
           );
           
           const newUser = userCredential.user;
           
           // Upload profile image to Firebase Storage if present
           let profileImageUrl = null;
           if (this.user.profileImage) {
             try {
               const imageRef = storageRef(storage, `profile-images/${newUser.uid}`);
               await uploadString(imageRef, this.user.profileImage, 'data_url');
               profileImageUrl = await getDownloadURL(imageRef);
               console.log('Profile image uploaded successfully:', profileImageUrl);
             } catch (error) {
               console.error('Error uploading profile image:', error);
               // Continue even if image upload fails
             }
           }
           
           // Prepare user data for Firestore
           const userData = {
              email: this.user.email,
              userType: this.user.userType,
              status: this.user.status,
              createdAt: new Date(),
              createdBy: this.appStore.userId,
              profileImageUrl: profileImageUrl,
              // Admin scope
              adminScope: this.user.userType === 'Admin' ? (this.user.adminScope || 'depsure') : null,
              managedAgencyId: this.user.userType === 'Admin' && this.user.adminScope === 'agency' ? (this.user.managedAgencyId || null) : null,
              managedAgencyName: this.user.userType === 'Admin' && this.user.adminScope === 'agency' ? (this.agencies.find(a => a.id === this.user.managedAgencyId)?.agencyName || null) : null,
              firstName: this.user.userType === 'Admin' ? (this.user.firstName || null) : null,
              lastName: this.user.userType === 'Admin' ? (this.user.lastName || null) : null,
              // Agency-specific fields
              agencyName: this.user.userType === 'Agency' ? this.user.agencyName : null,
              regNo: this.user.userType === 'Agency' ? (this.user.regNo || '') : null,
              address: this.user.userType === 'Agency' ? this.user.address : null,
              primaryContactName: this.user.userType === 'Agency' ? this.user.primaryContactName : null,
              contactNumber: this.user.userType === 'Agency' ? this.user.contactNumber : null,
              notes: this.user.userType === 'Agency' ? (this.user.notes || '') : null
            };
           
           // Save user data to Firestore
           await setDoc(doc(db, 'users', newUser.uid), userData);
           
           // Log the audit event
            await this.logAuditEvent(
              this.auditActions.CREATE,
              {
                userEmail: this.user.email,
                userType: this.user.userType,
                status: this.user.status,
                hasProfileImage: !!profileImageUrl,
                agencyName: this.user.agencyName || null,
                adminScope: this.user.userType === 'Admin' ? (this.user.adminScope || 'depsure') : null,
                managedAgencyId: this.user.userType === 'Admin' && this.user.adminScope === 'agency' ? (this.user.managedAgencyId || null) : null
              },
              this.resourceTypes.USER,
              newUser.uid
            );
           
           this.showSuccessDialog('User added successfully!', 'Success!', 'Continue', '/user-management');
         } catch (error) {
           console.error('Error saving user:', error);
           
           let errorMessage = 'Failed to add user. Please try again.';
           if (error.code === 'auth/email-already-in-use') {
             errorMessage = 'A user with this email already exists.';
           } else if (error.code === 'auth/weak-password') {
             errorMessage = 'Password is too weak. Please choose a stronger password.';
           } else if (error.code === 'auth/invalid-email') {
             errorMessage = 'Invalid email address.';
           }
           
           this.showErrorDialog(errorMessage, 'Error', 'OK');
         } finally {
           this.loading = false;
         }
       }
     },
     
     triggerFileInput() {
       this.$refs.fileInput.click();
     },
     
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          this.showErrorDialog('Please select a valid image file', 'Invalid File', 'OK');
          return;
        }
        
        // Handle ALL images - compress if larger than 2MB for optimal performance
        const compressionThreshold = 2 * 1024 * 1024; // 2MB threshold
        
        if (file.size > compressionThreshold) {
          // Compress the image for better performance
          this.compressAndLoadImage(file);
        } else {
          // Create preview URL directly for small images
          const reader = new FileReader();
          reader.onload = (e) => {
            this.user.profileImage = e.target.result;
          };
          reader.onerror = (error) => {
            console.error('Error reading file:', error);
            this.showErrorDialog('Failed to load image. Please try a different file.', 'Error', 'OK');
          };
          reader.readAsDataURL(file);
        }
      }
    },
    
    compressAndLoadImage(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 1920px on longest side)
          let width = img.width;
          let height = img.height;
          const maxDimension = 1920;
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with quality compression
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          this.user.profileImage = compressedDataUrl;
          
          // Show info that image was compressed
          console.log('Large image compressed for upload');
        };
        img.onerror = () => {
          this.showErrorDialog('Failed to process image. Please try a different file.', 'Error', 'OK');
        };
        img.src = e.target.result;
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        this.showErrorDialog('Failed to load image. Please try a different file.', 'Error', 'OK');
      };
      reader.readAsDataURL(file);
    },
     
     removeImage() {
       this.user.profileImage = null;
       if (this.$refs.fileInput) {
         this.$refs.fileInput.value = '';
       }
     }
   }
}
</script>

<style scoped>
.add-user-page {
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

/* Section title styling */
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 16px 0 8px 0;
  padding-left: 8px;
  border-left: 4px solid #000000;
}

/* --- Square logo block & actions --- */
.logo-row {
  margin-bottom: 0.25rem !important;
}

.logo-square {
  width: 180px;
  height: 180px;         /* perfect square (cube in 2D) */
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

.logo-square:hover {
  border-color: #9e9e9e;
}

.logo-square.has-image {
  border-style: solid;
}

.logo-square img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: none;
  outline: none;
  display: block;
  background: transparent;
  box-shadow: none;
}

.logo-placeholder {
  display: flex;
  align-items: center;
  color: #8a8a8a;
  font-size: 0.95rem;
}

.logo-actions {
  gap: 12px;
  flex-wrap: wrap;
}

.upload-btn {
  height: 44px;
  text-transform: none;
  border-radius: 8px;
}

/* Input field styling */
.custom-input .v-field {
  border-radius: 8px;
}



.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}

/* Button styling */
.cancel-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 120px;
  height: 44px;
}

.cancel-btn:hover {
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.save-btn:hover:not(:disabled) {
  background-color: #333 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .add-user-page {
    padding: 10px;
  }
  
  .page-title {
    font-size: 1.1rem;
  }
  
  .back-btn {
    width: 140px;
    height: 40px;
  }
  
  .cancel-btn,
  .save-btn {
    width: 100%;
    margin-bottom: 8px;
  }

  .logo-square {
    width: 160px;
    height: 160px; /* maintain square */
    margin-bottom: 8px;
  }
}
</style>
