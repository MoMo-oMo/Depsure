<template>
  <div class="edit-maintenance-page">
    <v-container fluid>

      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
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
            <h1 class="page-title">Edit Maintenance Entry</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading maintenance entry details...</p>
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
          <div v-else class="form-card" elevation="0">
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-card-text>
                <v-row>
                  <!-- Unit Name -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.unitName"
                      label="Unit Name"
                      variant="outlined"
                      class="custom-input"
                      :rules="unitNameRules"
                      required
                    />
                  </v-col>

                  <!-- Notice Given (Yes/No) -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.noticeGiven"
                      label="Notice Given (Yes/No)"
                      variant="outlined"
                      class="custom-input"
                      :items="['Yes', 'No']"
                      :rules="noticeGivenRules"
                      required
                    />
                  </v-col>

                  <!-- Vacate Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.vacateDate"
                      label="Vacate Date"
                      type="date"
                      variant="outlined"
                      class="custom-input"
                      :rules="vacateDateRules"
                      required
                    />
                  </v-col>

                  <!-- Contact Number -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.contactNumber"
                      label="Contact Number"
                      variant="outlined"
                      class="custom-input"
                      :rules="contactNumberRules"
                      required
                    />
                  </v-col>

                  <!-- Address -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.address"
                      label="Address"
                      variant="outlined"
                      class="custom-input"
                      :rules="addressRules"
                      required
                    />
                  </v-col>

                  <!-- Quote Instructions Upload -->
                  <v-col cols="12" md="6">
                    <v-file-input
                      v-model="entry.quoteFile"
                      label="Upload Quote Instructions"
                      variant="outlined"
                      class="custom-input"
                      accept=".pdf,.doc,.docx"
                      show-size
                      prepend-icon="mdi-upload"
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
                  @click="$router.go(-1)"
                  class="cancel-btn"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="black"
                  variant="elevated"
                  @click="saveEntry"
                  :disabled="!valid"
                  class="save-btn"
                >
                  Save Changes
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
export default {
  name: "EditMaintenancePage",
  data() {
    return {
      entry: {
        id: null,
        unitName: "",
        noticeGiven: "No",
        vacateDate: "",
        contactNumber: "",
        address: "",
        quoteFile: null, // For uploaded file
      },
      loading: true,
      error: null,
      valid: true,
      // Validation rules
      unitNameRules: [v => !!v || "Unit Name is required"],
      noticeGivenRules: [v => !!v || "Notice Given is required"],
      vacateDateRules: [v => !!v || "Vacate Date is required"],
      contactNumberRules: [v => !!v || "Contact Number is required"],
      addressRules: [v => !!v || "Address is required"],
    };
  },
  mounted() {
    document.title = "Edit Maintenance Entry - Depsure";
    const entryId = this.$route.params.id;
    if (entryId) {
      this.loadEntryData(entryId);
    } else {
      this.error = "Entry ID not found";
      this.loading = false;
    }
  },
  methods: {
    loadEntryData(id) {
      const mockEntries = [
        {
          id: 1,
          unitName: "123 Main Street, Cape Town",
          noticeGiven: "Yes",
          vacateDate: "2025-01-15",
          contactNumber: "0821234567",
          address: "123 Main Street, Cape Town",
          quoteFile: null
        },
        {
          id: 2,
          unitName: "456 Ocean Drive, Camps Bay",
          noticeGiven: "No",
          vacateDate: "2024-06-01",
          contactNumber: "0839876543",
          address: "456 Ocean Drive, Camps Bay",
          quoteFile: null
        }
      ];

      const foundEntry = mockEntries.find(e => e.id == id);
      if (foundEntry) {
        this.entry = { ...foundEntry };
        this.loading = false;
      } else {
        this.error = "Entry not found";
        this.loading = false;
      }
    },
    saveEntry() {
      if (this.$refs.form.validate()) {
        console.log("Saving maintenance entry:", this.entry);
        if (this.entry.quoteFile) {
          console.log("Uploaded file:", this.entry.quoteFile.name);
        }
        alert("Maintenance entry saved successfully!");
        this.$router.go(-1);
      }
    }
  }
};
</script>

<style scoped>
.edit-maintenance-page {
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
  margin-bottom: 0;
}
.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
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

.save-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  width: 160px;
  height: 44px;
  background-color: black !important;
  color: white !important;
}

.save-btn:hover:not(:disabled) {
  background-color: #333 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .edit-maintenance-page {
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
