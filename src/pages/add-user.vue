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

                    <!-- Agency Name -->
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

                    <!-- Agency Tagline -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="user.agencyTagline"
                        label="Agency Tagline"
                        variant="outlined"
                        class="custom-input"
                        :rules="agencyTaglineRules"
                        required
                      />
                    </v-col>

                    <!-- Location -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="user.location"
                        label="Location"
                        variant="outlined"
                        class="custom-input"
                        :rules="locationRules"
                        required
                      />
                    </v-col>

                    <!-- Established Year -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model.number="user.establishedYear"
                        label="Established Year"
                        variant="outlined"
                        type="number"
                        class="custom-input"
                        :rules="establishedYearRules"
                        required
                      />
                    </v-col>

                    <!-- Removed Number of Properties and Rating: derived elsewhere -->

                    <!-- Agency Description -->
                    <v-col cols="12">
                      <v-textarea
                        v-model="user.agencyDescription"
                        label="Agency Description"
                        variant="outlined"
                        class="custom-input"
                        rows="4"
                        auto-grow
                        :rules="agencyDescriptionRules"
                        required
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
import { auth, db } from '@/firebaseConfig'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
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
         // Agency fields
         agencyName: '',
         agencyTagline: '',
         location: '',
         establishedYear: new Date().getFullYear(),
         agencyDescription: ''
       },
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
        v => {
          if (this.user.userType === 'Agency') {
            return !!v || 'Agency Name is required'
          }
          return true
        },
        v => {
          if (this.user.userType === 'Agency' && v) {
            return v.length >= 3 || 'Agency Name must be at least 3 characters'
          }
          return true
        }
      ],
      agencyTaglineRules: [
        v => {
          if (this.user.userType === 'Agency') {
            return !!v || 'Agency Tagline is required'
          }
          return true
        }
      ],
      locationRules: [
        v => {
          if (this.user.userType === 'Agency') {
            return !!v || 'Location is required'
          }
          return true
        }
      ],
      establishedYearRules: [
        v => {
          if (this.user.userType === 'Agency') {
            return !!v || 'Established Year is required'
          }
          return true
        },
        v => {
          if (this.user.userType === 'Agency' && v) {
            return v >= 1900 && v <= new Date().getFullYear() || 'Established Year must be between 1900 and current year'
          }
          return true
        }
      ],
      // Removed numberOfPropertiesRules and ratingRules: not collected for Agency
      agencyDescriptionRules: [
        v => {
          if (this.user.userType === 'Agency') {
            return !!v || 'Agency Description is required'
          }
          return true
        },
        v => {
          if (this.user.userType === 'Agency' && v) {
            return v.length >= 20 || 'Agency Description must be at least 20 characters'
          }
          return true
        }
      ]
    }
  },
  mounted() {
    console.log('AddUserPage mounted');
    document.title = 'Add New User - Depsure';
  },
     methods: {
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
           
           // Prepare user data for Firestore
           const userData = {
             email: this.user.email,
             userType: this.user.userType,
             status: this.user.status,
             createdAt: new Date(),
             createdBy: this.appStore.userId,
             profileImageUrl: this.user.profileImage || null,
             // Agency-specific fields
             agencyName: this.user.userType === 'Agency' ? this.user.agencyName : null,
             agencyTagline: this.user.userType === 'Agency' ? this.user.agencyTagline : null,
             location: this.user.userType === 'Agency' ? this.user.location : null,
             establishedYear: this.user.userType === 'Agency' ? this.user.establishedYear : null,
             agencyDescription: this.user.userType === 'Agency' ? this.user.agencyDescription : null
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
               hasProfileImage: !!this.user.profileImage,
               agencyName: this.user.agencyName || null
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
         // Validate file size (5MB limit)
         if (file.size > 5 * 1024 * 1024) {
           this.showErrorDialog('File size must be less than 5MB', 'File Too Large', 'OK');
           return;
         }
         
         // Validate file type
         if (!file.type.startsWith('image/')) {
           this.showErrorDialog('Please select a valid image file', 'Invalid File', 'OK');
           return;
         }
         
         // Create preview URL
         const reader = new FileReader();
         reader.onload = (e) => {
           this.user.profileImage = e.target.result;
         };
         reader.readAsDataURL(file);
       }
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
  text-align: left;
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
  object-fit: contain;
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

.custom-input :deep(.v-field__input) {
  background-color: white !important;
  color: #000000 !important;
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
