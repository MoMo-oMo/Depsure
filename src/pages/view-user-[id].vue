<template>
  <div class="view-user-page">
    <v-container fluid>

      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            icon="mdi-arrow-left"
            variant="outlined"
            color="primary"
            @click="$router.push('/user-management')"
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
            <h1 class="page-title">User Details</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading user details...</p>
            </v-card-text>
          </v-card>

          <!-- Error -->
          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon icon="mdi-alert" color="error" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <!-- User Info -->
          <div v-else class="form-card" elevation="0">
            <v-card-text>
              <!-- Profile Image Preview -->
              <v-row class="mb-4" justify="center">
                <v-col cols="12" class="d-flex justify-center">
                  <v-avatar size="112" class="user-avatar">
                    <v-img v-if="profileImageSource" :src="profileImageSource" alt="Profile image" cover />
                    <span v-else class="avatar-initials">{{ userInitials }}</span>
                  </v-avatar>
                </v-col>
              </v-row>
              <v-row>
                <!-- First Name -->
                <v-col cols="12" md="6" v-if="user.userType !== 'Agency'">
                  <v-text-field
                    :model-value="user.firstName"
                    label="First Name"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Last Name -->
                <v-col cols="12" md="6" v-if="user.userType !== 'Agency'">
                  <v-text-field
                    :model-value="user.lastName"
                    label="Last Name"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Email -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="user.email"
                    label="Email"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- User Type -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="user.userType"
                    label="User Type"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Agency Name (if Agency type) -->
                <v-col cols="12" md="6" v-if="user.userType === 'Agency'">
                  <v-text-field
                    :model-value="user.agencyName"
                    label="Agency Name"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Registration Number (if Agency) -->
                <v-col cols="12" md="6" v-if="user.userType === 'Agency'">
                  <v-text-field
                    :model-value="user.regNo || 'Not specified'"
                    label="Registration Number"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Address (if Agency) -->
                <v-col cols="12" md="6" v-if="user.userType === 'Agency'">
                  <v-text-field
                    :model-value="user.address || user.agencyAddress || 'Not specified'"
                    label="Address"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Primary Contact Name (if Agency) -->
                <v-col cols="12" md="6" v-if="user.userType === 'Agency'">
                  <v-text-field
                    :model-value="user.primaryContactName || 'Not specified'"
                    label="Primary Contact Name"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Contact Number (if Agency) -->
                <v-col cols="12" md="6" v-if="user.userType === 'Agency'">
                  <v-text-field
                    :model-value="user.contactNumber || user.agencyPhone || 'Not specified'"
                    label="Contact Number"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Description / Notes (if Agency) -->
                <v-col cols="12" v-if="user.userType === 'Agency'">
                  <v-textarea
                    :model-value="user.agencyDescription || user.notes || 'Not specified'"
                    label="Description / Notes"
                    variant="outlined"
                    readonly
                    class="custom-input"
                    auto-grow
                    rows="3"
                  />
                </v-col>

                <!-- Status -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="user.status"
                    label="Status"
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
                color="black"
                variant="elevated"
                class="submit-btn"
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
import { db } from '@/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'

export default {
  name: "ViewUserPage",
  data() {
    return {
      user: {
        id: null,
        firstName: "",
        lastName: "",
        email: "",
        userType: "",
        agencyName: "",
        status: ""
      },
      loading: true,
      error: null
    }
  },
  computed: {
    profileImageSource() {
      return this.user?.profileImageUrl || this.user?.profileImage || ''
    },
    userInitials() {
      return this._initials(this.user?.firstName, this.user?.lastName)
    }
  },
  async mounted() {
    document.title = "User Details - Depsure"
    const userId = this.$route.params.id
    if (userId) {
      await this.loadUser(userId)
    } else {
      this.error = "No user ID provided"
      this.loading = false
    }
  },
  methods: {
    // Derive initials if no image
    _initials(first, last) {
      const a = (String(first || '').trim()[0] || '').toUpperCase();
      const b = (String(last || '').trim()[0] || '').toUpperCase();
      return (a + b) || a || b || '?'
    },
    async loadUser(userId) {
      try {
        const docRef = doc(db, 'users', userId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          this.user = {
            id: docSnap.id,
            ...docSnap.data()
          }
        } else {
          this.error = "User not found"
        }
      } catch (error) {
        console.error('Error loading user:', error)
        this.error = "Failed to load user details"
      } finally {
        this.loading = false
      }
    },
    editUser() {
      if (this.user?.id) {
        this.$router.push(`/edit-user-${this.user.id}`)
      }
    }
  }
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
.custom-input :deep(.v-field__input) {
  background-color: #f8f9fa !important;
  color: #000000 !important;
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