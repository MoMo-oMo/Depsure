<template>
  <div class="active-units-page">
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 mb-6">Active Units</h1>
          <v-card>
            <v-card-title>Active Units Management</v-card-title>
            <v-card-text>
              <p>Manage your active rental units and their current status.</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'ActiveUnitsPage',
  data() {
    return {
      // Add your data here
    }
  },
  methods: {
    // Add your methods here
  }
}
</script>

<style scoped>
.active-units-page {
  padding: 20px;
}
</style>
