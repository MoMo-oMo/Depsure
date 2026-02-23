<template>
  <div class="view-user-page">
    <v-container fluid>

      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            class="back-btn"
            color="primary"
            icon="mdi-arrow-left"
            variant="outlined"
            @click="$router.push('/user-management')"
          >
            Back
          </v-btn>
        </v-col>
      </v-row>

      <!-- Title Section -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="title-section">
            <h1 class="page-title">User Details</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular color="primary" indeterminate />
              <p class="mt-4">Loading user details...</p>
            </v-card-text>
          </v-card>

          <!-- Error -->
          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon color="error" icon="mdi-alert" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <!-- User Info -->
          <div v-else class="form-card" elevation="0">
            <v-card-text>
              <!-- Profile Image Preview -->
              <v-row class="mb-4" justify="center">
                <v-col class="d-flex justify-center" cols="12">
                  <v-avatar class="user-avatar" size="112">
                    <v-img v-if="profileImageSource" alt="Profile image" cover :src="profileImageSource" />
                    <span v-else class="avatar-initials">{{ userInitials }}</span>
                  </v-avatar>
                </v-col>
              </v-row>
              <v-row>
                <!-- First Name -->
                <v-col v-if="user.userType !== 'Agency'" cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="First Name"
                    :model-value="user.firstName"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Last Name -->
                <v-col v-if="user.userType !== 'Agency'" cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Last Name"
                    :model-value="user.lastName"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Email -->
                <v-col cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Email"
                    :model-value="user.email"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- User Type -->
                <v-col cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="User Type"
                    :model-value="user.userType"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Agency Name (if Agency type) -->
                <v-col v-if="user.userType === 'Agency'" cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Agency Name"
                    :model-value="user.agencyName"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Registration Number (if Agency) -->
                <v-col v-if="user.userType === 'Agency'" cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Registration Number"
                    :model-value="user.regNo || 'Not specified'"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Address (if Agency) -->
                <v-col v-if="user.userType === 'Agency'" cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Address"
                    :model-value="user.address || user.agencyAddress || 'Not specified'"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Primary Contact Name (if Agency) -->
                <v-col v-if="user.userType === 'Agency'" cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Primary Contact Name"
                    :model-value="user.primaryContactName || 'Not specified'"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Contact Number (if Agency) -->
                <v-col v-if="user.userType === 'Agency'" cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Contact Number"
                    :model-value="user.contactNumber || user.agencyPhone || 'Not specified'"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Description / Notes (if Agency) -->
                <v-col v-if="user.userType === 'Agency'" cols="12">
                  <v-textarea
                    auto-grow
                    class="custom-input"
                    label="Description / Notes"
                    :model-value="user.agencyDescription || user.notes || 'Not specified'"
                    readonly
                    rows="3"
                    variant="outlined"
                  />
                </v-col>

                <!-- Status -->
                <v-col cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Status"
                    :model-value="user.status"
                    readonly
                    variant="outlined"
                  />
                </v-col>
              </v-row>
            </v-card-text>

            <!-- Action Buttons -->
            <v-card-actions class="pa-4">
              <v-spacer />
              <v-btn
                class="submit-btn"
                color="black"
                variant="elevated"
                @click="editUser"
              >
                <v-icon left>mdi-pencil</v-icon>
                Edit User
              </v-btn>
            </v-card-actions>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  import { doc, getDoc } from 'firebase/firestore'
  import { db } from '@/firebaseConfig'

  export default {
    name: 'ViewUserPage',
    data () {
      return {
        user: {
          id: null,
          firstName: '',
          lastName: '',
          email: '',
          userType: '',
          agencyName: '',
          status: '',
        },
        loading: true,
        error: null,
      }
    },
    computed: {
      profileImageSource () {
        return this.user?.profileImageUrl || this.user?.profileImage || ''
      },
      userInitials () {
        return this._initials(this.user?.firstName, this.user?.lastName)
      },
    },
    async mounted () {
      document.title = 'User Details - Depsure'
      const userId = this.$route.params.id
      if (userId) {
        await this.loadUser(userId)
      } else {
        this.error = 'No user ID provided'
        this.loading = false
      }
    },
    methods: {
      // Derive initials if no image
      _initials (first, last) {
        const a = (String(first || '').trim()[0] || '').toUpperCase()
        const b = (String(last || '').trim()[0] || '').toUpperCase()
        return (a + b) || a || b || '?'
      },
      async loadUser (userId) {
        try {
          const docRef = doc(db, 'users', userId)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            this.user = {
              id: docSnap.id,
              ...docSnap.data(),
            }
          } else {
            this.error = 'User not found'
          }
        } catch (error) {
          console.error('Error loading user:', error)
          this.error = 'Failed to load user details'
        } finally {
          this.loading = false
        }
      },
      editUser () {
        if (this.user?.id) {
          this.$router.push(`/edit-user-${this.user.id}`)
        }
      },
    },
  }
</script>

<style scoped>
.view-user-page {
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
  width: 160px;
  height: 44px;
}
.back-btn:hover {
  background-color: #333 !important;
  border-color: #333 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

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

.form-card {
  background: white;
  border-radius: 0 0 12px 12px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.custom-input .v-field {
  border-radius: 8px;
}

.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}

.user-avatar { background: #e9ecef; }
.avatar-initials { color:#111; font-weight:700; font-size: 1.25rem; display:flex; align-items:center; justify-content:center; width:100%; height:100%; }

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
</style>
