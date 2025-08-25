<template>
  <div class="add-flagged-unit-page">
    <v-container fluid>
      <!-- Form Section -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <!-- Title Section -->
          <div class="title-section">
            <h1 class="page-title">Add Flagged Unit</h1>
          </div>

          <div class="form-card" elevation="0">
            <v-form ref="form" v-model="valid" lazy-validation>
              <!-- Row 0: Unit Info -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="unit.propertyName"
                    label="Unit Name"
                    variant="outlined"
                    class="custom-input"
                    :rules="propertyNameRules"
                    required
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="unit.tenantRef"
                    label="Tenant Reference"
                    variant="outlined"
                    class="custom-input"
                    :rules="tenantRefRules"
                    required
                  />
                </v-col>
              </v-row>

              <!-- Row 1: Flag Reason & Date -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="unit.flagReason"
                    label="Reason Flagged"
                    variant="outlined"
                    class="custom-input"
                    :rules="flagReasonRules"
                    required
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="unit.dateFlagged"
                    label="Date Flagged"
                    type="date"
                    variant="outlined"
                    class="custom-input"
                    :rules="dateFlaggedRules"
                    required
                  />
                </v-col>
              </v-row>

              <!-- Row 2: Action Taken -->
              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="unit.actionTaken"
                    label="Action Taken"
                    variant="outlined"
                    class="custom-input"
                    :rules="actionTakenRules"
                    rows="3"
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
                  Add Flagged Unit
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
export default {
  name: "AddFlaggedUnitPage",
  data() {
    return {
      valid: false,
      unit: {
        propertyName: "",
        tenantRef: "",
        flagReason: "",
        dateFlagged: "",
        actionTaken: ""
      },
      propertyNameRules: [
        v => !!v || "Unit Name is required",
        v => v.length >= 3 || "Unit Name must be at least 3 characters"
      ],
      tenantRefRules: [v => !!v || "Tenant Reference is required"],
      flagReasonRules: [v => !!v || "Reason Flagged is required"],
      dateFlaggedRules: [v => !!v || "Date Flagged is required"],
      actionTakenRules: [v => !!v || "Action Taken is required"]
    };
  },
  methods: {
    submitForm() {
      if (this.$refs.form.validate()) {
        console.log("Adding flagged unit:", this.unit);
        alert("Flagged unit added successfully!");
        this.$router.push("/flagged-units");
      }
    },
    goBack() {
      this.$router.push("/flagged-units");
    }
  }
};
</script>

<style scoped>
.add-flagged-unit-page {
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.custom-input .v-field {
  border-radius: 8px;
}

.custom-input :deep(.v-field__input) {
  padding: 10px !important;
  background-color: white !important;
  color: #000 !important;
}

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
