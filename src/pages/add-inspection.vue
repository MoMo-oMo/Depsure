<template>
  <div class="add-inspection-page">
    <v-container fluid>

      <!-- Title Section -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="title-section">
            <h1 class="page-title">Add Inspection Entry</h1>
          </div>

          <div class="form-card" elevation="0">
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

                  <!-- Inspection Required (Yes/No) -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.inspectionRequired"
                      label="Inspection Required (Yes/No)"
                      variant="outlined"
                      class="custom-input"
                      :items="['Yes', 'No']"
                      :rules="inspectionRequiredRules"
                      required
                    />
                  </v-col>

                  <!-- Contact Person -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.contactPerson"
                      label="Contact Person"
                      variant="outlined"
                      class="custom-input"
                      :rules="contactPersonRules"
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

                  <!-- Appointment Made (Yes/No) -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.appointmentMade"
                      label="Appointment Made (Yes/No)"
                      variant="outlined"
                      class="custom-input"
                      :items="['Yes', 'No']"
                      :rules="appointmentMadeRules"
                      required
                    />
                  </v-col>

                  <!-- Inspection Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.inspectionDate"
                      label="Inspection Date"
                      type="date"
                      variant="outlined"
                      class="custom-input"
                      :rules="inspectionDateRules"
                      required
                    />
                  </v-col>

                  <!-- Quotes Needed (Yes/No) -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.quotesNeeded"
                      label="Quotes Needed (Yes/No)"
                      variant="outlined"
                      class="custom-input"
                      :items="['Yes', 'No']"
                      :rules="quotesNeededRules"
                      required
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
                  Add Inspection Entry
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

export default {
  name: "AddInspectionPage",
  setup() {
    const { showSuccessDialog } = useCustomDialogs()
    return { showSuccessDialog }
  },
  data() {
    return {
      valid: false,
      entry: {
        unitName: "",
        inspectionRequired: "No",
        contactPerson: "",
        contactNumber: "",
        appointmentMade: "No",
        inspectionDate: "",
        quotesNeeded: "No",
      },
      unitNameRules: [v => !!v || "Unit Name is required"],
      inspectionRequiredRules: [v => !!v || "Inspection Required is required"],
      contactPersonRules: [v => !!v || "Contact Person is required"],
      contactNumberRules: [v => !!v || "Contact Number is required"],
      appointmentMadeRules: [v => !!v || "Appointment Made is required"],
      inspectionDateRules: [v => !!v || "Inspection Date is required"],
      quotesNeededRules: [v => !!v || "Quotes Needed is required"],
    };
  },
  methods: {
    submitForm() {
      if (this.$refs.form.validate()) {
        console.log("Adding inspection entry:", this.entry);
        this.showSuccessDialog("Inspection entry added successfully!", "Success!", "Continue", "/inspections");
      }
    },
    goBack() {
      this.$router.push("/inspections");
    }
  }
};
</script>

<style scoped>
.add-inspection-page {
  padding: 20px;
  min-height: 100vh;
  background-color: #f6f7fa;
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
  text-align: left;
}

.form-card {
  background: white;
  border-radius: 0 0 12px 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.custom-input .v-field {
  border-radius: 8px;
}

.custom-input :deep(.v-field__input) {
  padding: 10px !important;
  background-color: white !important;
  color: #000 !important;
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

.submit-btn {
  width: 160px;
  height: 44px;
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  background-color: black !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #333 !important;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
