<template>
    <div class="add-agency-page">
      <v-container fluid>
        <!-- Form Section -->
        <v-row justify="center">
          <v-col cols="12" lg="10" xl="8">
            <!-- Title Section -->
            <div class="title-section">
              <h1 class="page-title">Add New Agency</h1>
            </div>
            
            <div class="form-card" elevation="0">
              <v-form ref="form" v-model="valid" lazy-validation>
                <!-- **Row 0: Logo Upload at very top (square block + button)** -->
                <v-row class="logo-row">
                  <v-col cols="12" md="auto" class="d-flex align-center">
                    <div class="logo-square" :class="{ 'has-image': !!logoPreview }" @click="triggerLogoUpload">
                      <template v-if="logoPreview">
                        <img :src="logoPreview" alt="Logo Preview" />
                      </template>
                      <template v-else>
                        <div class="logo-placeholder">
                          <v-icon size="24" class="mr-2">mdi-image-plus</v-icon>
                          <span>Logo</span>
                        </div>
                      </template>
                    </div>
                  </v-col>
                  <v-col cols="12" md="8" class="d-flex align-center logo-actions">
                    <input
                      ref="logoInput"
                      type="file"
                      accept="image/*"
                      @change="handleLogoChange"
                      style="display: none"
                    />
                    <v-btn
                      color="black"
                      variant="elevated"
                      class="upload-btn mr-3"
                      @click="triggerLogoUpload"
                    >
                      Upload Image
                    </v-btn>
                    <v-btn
                      v-if="logoPreview"
                      color="grey"
                      variant="outlined"
                      class="cancel-btn"
                      @click="clearLogo"
                    >
                      Remove
                    </v-btn>
                  </v-col>
                </v-row>
  
                <!-- Row 1: Agency Name & Title -->
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="agencyData.name"
                      label="Agency Name"
                      prepend-inner-icon="mdi-domain"
                      variant="outlined"
                      density="comfortable"
                      class="custom-input"
                      :rules="nameRules"
                      hide-details="auto"
                      required
                    />
                  </v-col>
                  <v-col>
                    <v-text-field
                      v-model="agencyData.title"
                      label="Agency Tagline"
                      prepend-inner-icon="mdi-tag"
                      variant="outlined"
                      density="comfortable"
                      class="custom-input"
                      :rules="titleRules"
                      hide-details="auto"
                      required
                    />
                  </v-col>
                </v-row>
  
                <!-- Row 2: Location & Established Year -->
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="agencyData.location"
                      label="Location"
                      prepend-inner-icon="mdi-map-marker"
                      variant="outlined"
                      density="comfortable"
                      class="custom-input"
                      :rules="locationRules"
                      hide-details="auto"
                      required
                    />
                  </v-col>
                  <v-col>
                    <v-text-field
                      v-model="agencyData.established"
                      label="Established Year"
                      prepend-inner-icon="mdi-calendar"
                      variant="outlined"
                      density="comfortable"
                      class="custom-input"
                      :rules="yearRules"
                      type="number"
                      hide-details="auto"
                      required
                    />
                  </v-col>
                </v-row>
  
                <!-- Row 3: Properties Count & Rating -->
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="agencyData.properties"
                      label="Number of Properties"
                      prepend-inner-icon="mdi-home"
                      variant="outlined"
                      density="comfortable"
                      class="custom-input"
                      :rules="propertiesRules"
                      type="number"
                      hide-details="auto"
                      required
                    />
                  </v-col>
                  <v-col>
                    <v-text-field
                      v-model="agencyData.rating"
                      label="Rating (1-5)"
                      prepend-inner-icon="mdi-star"
                      variant="outlined"
                      density="comfortable"
                      class="custom-input"
                      :rules="ratingRules"
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      hide-details="auto"
                      required
                    />
                  </v-col>
                </v-row>
  
                <!-- Row 4: Description (Full Width) -->
                <v-row>
                  <v-col>
                    <v-textarea
                      v-model="agencyData.description"
                      label="Agency Description"
                      prepend-inner-icon="mdi-text"
                      variant="outlined"
                      density="comfortable"
                      class="custom-input"
                      :rules="descriptionRules"
                      rows="4"
                      hide-details="auto"
                      required
                    />
                  </v-col>
                </v-row>
  
                <!-- Action Buttons -->
                <div class="button-container">
                  <v-btn
                    color="grey"
                    variant="outlined"
                    class="cancel-btn"
                    @click="goBack"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="black"
                    variant="elevated"
                    class="submit-btn"
                    :disabled="!valid"
                    @click="submitForm"
                  >
                    Create Agency
                  </v-btn>
                </div>
              </v-form>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </template>
  
  <script>
import { useCustomDialogs } from '@/composables/useCustomDialogs'

export default {
  name: 'AddAgencyPage',
  setup() {
    const { showSuccessDialog } = useCustomDialogs()
    return { showSuccessDialog }
  },
  data() {
    return {
      valid: false,
      logoPreview: '',
      agencyData: {
        name: '',
        title: '',
        location: '',
        established: '',
        // store data URL or uploaded file URL after upload
        logo: '',
        description: '',
        properties: '',
        rating: ''
      },
      nameRules: [
        v => !!v || 'Agency name is required',
        v => v.length >= 3 || 'Name must be at least 3 characters'
      ],
      titleRules: [
        v => !!v || 'Agency tagline is required',
        v => v.length >= 5 || 'Tagline must be at least 5 characters'
      ],
      locationRules: [
        v => !!v || 'Location is required'
      ],
      yearRules: [
        v => !!v || 'Established year is required',
        v => (v >= 1800 && v <= new Date().getFullYear()) || 'Please enter a valid year'
      ],
      descriptionRules: [
        v => !!v || 'Description is required',
        v => v.length >= 20 || 'Description must be at least 20 characters'
      ],
      propertiesRules: [
        v => !!v || 'Number of properties is required',
        v => v > 0 || 'Number of properties must be greater than 0'
      ],
      ratingRules: [
        v => !!v || 'Rating is required',
        v => (v >= 1 && v <= 5) || 'Rating must be between 1 and 5'
      ]
    }
  },
  methods: {
    triggerLogoUpload() {
      this.$refs.logoInput && this.$refs.logoInput.click()
    },
    handleLogoChange(e) {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        this.logoPreview = ev.target.result
        this.agencyData.logo = ev.target.result // replace with uploaded URL after integrating storage
      }
      reader.readAsDataURL(file)
    },
    clearLogo() {
      this.logoPreview = ''
      this.agencyData.logo = ''
      if (this.$refs.logoInput) {
        this.$refs.logoInput.value = ''
      }
    },
    submitForm() {
      if (this.$refs.form.validate()) {
        // Send to backend here
        console.log('Submitting agency data:', this.agencyData)
        this.showSuccessDialog('Agency created successfully!', 'Success!', 'Continue', '/agency')
      }
    },
    goBack() {
      this.$router.push('/agency')
    }
  }
}
</script>
  
  <style scoped>
  .add-agency-page {
    padding: 20px;
    min-height: 100vh;
    background-color: #f6f7fa;
  }
  
  .title-section {
    background: black;
    color: white;
    padding: 0.75rem; /* comfor header */
    border-radius: 12px 12px 0 0;
    margin-bottom: 0;
  }
  
  .page-title {
    font-size: 1.25rem; /* reduced */
    font-weight: 600;
    color: white;
    margin: 0;
    text-align: left;
  }
  
  .form-card {
    background: white;
    border-radius: 0 0 12px 12px;
    padding: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  .v-form {
    padding: 1rem;
  }
  
  /* Inputs: even padding & comfor details */
  .custom-input .v-field {
    border-radius: 8px;
  }
  
  .custom-input :deep(.v-input__details) {
    padding: 0 !important;
    margin: 0 !important;
    min-height: 0 !important;
    height: 0 !important;
  }
  
  .custom-input :deep(.v-field__input) {
    padding: 10px !important; /* equal padding all around */
    line-height: 1.25;
  }
  
  .custom-input :deep(.v-field__outline) {
    margin: 0 !important;
  }
  
  /* Grid gutters */
  .v-row {
    margin-bottom: 0 !important;
  }
  
  .v-col {
    padding: 0.5rem !important; /* equal on all sides */
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
  
  /* Buttons */
  .button-container {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1rem;
  }
  
  .cancel-btn {
    width: 120px;
    height: 44px;
    font-weight: 500;
    text-transform: none;
    border-radius: 8px;
    border: 2px solid #666;
    color: #666;
    transition: all 0.3s ease;
  }
  
  .cancel-btn:hover {
    border-color: #333;
    color: #333;
    transform: translateY(-1px);
  }
  
  .upload-btn {
    height: 44px;
    text-transform: none;
    border-radius: 8px;
  }
  
  .submit-btn {
    width: 160px;
    height: 44px;
    font-weight: 500;
    text-transform: none;
    border-radius: 8px;
    background-color: black !important;
    color: white !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
  }
  
  .submit-btn:hover:not(:disabled) {
    background-color: #333 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }
  
  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .page-title {
      font-size: 1.1rem;
    }
    
    .form-card {
      padding: 1.25rem;
    }
  
    .logo-square {
      width: 160px;
      height: 160px; /* maintain square */
      margin-bottom: 8px;
    }
  
    .button-container {
      flex-direction: column;
    }
    
    .cancel-btn,
    .submit-btn {
      width: 100%;
    }
  }
  </style>
  