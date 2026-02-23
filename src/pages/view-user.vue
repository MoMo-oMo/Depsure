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

      <!-- Page Title -->
      <v-row class="mb-6">
        <v-col cols="12">
          <h1 class="page-title">User Details</h1>
          <p class="page-subtitle">View complete user information</p>
        </v-col>
      </v-row>

      <!-- User Information Card -->
      <v-row>
        <v-col cols="12">
          <v-card class="form-card">
            <v-card-title class="card-header">
              <v-icon class="mr-2" icon="mdi-account-circle-outline" />
              User Information
            </v-card-title>

            <v-card-text>
              <v-row>
                <!-- First Name -->
                <v-col cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="First Name"
                    :model-value="user.firstName"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Last Name -->
                <v-col cols="12" md="6">
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

                <!-- Agency Name (if applicable) -->
                <v-col v-if="user.userType === 'Agency'" cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Agency Name"
                    :model-value="user.agencyName"
                    readonly
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
          </v-card>
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
      }
    },
    async mounted () {
      document.title = 'User Details - Depsure'
      const userId = this.$route.params.id
      if (userId) {
        await this.loadUserData(userId)
      }
    },
    methods: {
      async loadUserData (id) {
        try {
          const docRef = doc(db, 'users', id)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            this.user = {
              id: docSnap.id,
              ...docSnap.data(),
            }
          } else {
            console.error('User not found')
          }
        } catch (error) {
          console.error('Error loading user:', error)
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

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.form-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
  color: #000;
}

.custom-input .v-field {
  border-radius: 8px;
}

.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}
</style>
