<template>
  <div class="audit-trail-page">
    <v-container fluid>
      <!-- Header -->


      <!-- Filters -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-text-field
            v-model="filters.userEmail"
            label="Filter by User Email"
            variant="outlined"
            density="comfortable"
            clearable
            hide-details
            class="custom-input"
            @update:model-value="applyFilters"
          />
        </v-col>
        
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.action"
            label="Action Type"
            variant="outlined"
            density="comfortable"
            :items="actionOptions"
            clearable
            hide-details
            class="custom-input"
            @update:model-value="applyFilters"
          />
        </v-col>
        
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.resourceType"
            label="Resource Type"
            variant="outlined"
            density="comfortable"
            :items="resourceTypeOptions"
            clearable
            hide-details
            class="custom-input"
            @update:model-value="applyFilters"
          />
        </v-col>
        
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.userType"
            label="User Type"
            variant="outlined"
            density="comfortable"
            :items="userTypeOptions"
            clearable
            hide-details
            class="custom-input"
            @update:model-value="applyFilters"
          />
        </v-col>
        
        <v-col cols="12" md="2">
          <v-text-field
            v-model="filters.startDate"
            label="Start Date"
            variant="outlined"
            density="comfortable"
            type="date"
            clearable
            hide-details
            class="custom-input"
            @update:model-value="applyFilters"
          />
        </v-col>
        
                 <v-col cols="12" md="1">
           <button
             @click="clearFilters"
             class="custom-btn secondary my-2"
             :disabled="!hasActiveFilters"
           >
             Clear
           </button>
         </v-col>
      </v-row>

      

             <!-- Audit Trail Table -->
       <v-row>
         <v-col cols="12">
                       <div class="d-flex justify-space-between align-center mb-4">
              <span class="text-h6 font-weight-bold">Audit Log Entries</span>
              <button
                @click="exportAuditTrailXLSX"
                :disabled="exportLoading"
                class="custom-btn"
              >
                {{ exportLoading ? 'Exporting...' : 'Export to Excel' }}
              </button>
            </div>
           
           <v-data-table
             :headers="headers"
             :items="filteredAuditEntries"
             :loading="loading"
             :items-per-page="20"
             :items-per-page-options="[10, 20, 50, 100]"
             class="custom-header"
             hover
           >
                <!-- Timestamp Column -->
                <template #item.timestamp="{ item }">
                  <span class="text-caption">
                    {{ formatDateTime(item.timestamp) }}
                  </span>
                </template>

                <!-- User Column -->
                <template #item.userName="{ item }">
                  <div>
                    <div class="font-weight-medium">{{ item.userName }}</div>
                    <div class="text-caption text-medium-emphasis">{{ item.userEmail }}</div>
                  </div>
                </template>

                <!-- User Type Column -->
                <template #item.userType="{ item }">
                  <v-chip
                    :color="getUserTypeColor(item.userType)"
                    size="small"
                    variant="outlined"
                  >
                    {{ item.userType }}
                  </v-chip>
                </template>

                <!-- Action Column -->
                <template #item.action="{ item }">
                  <v-chip
                    :color="getActionColor(item.action)"
                    size="small"
                    variant="tonal"
                  >
                    {{ item.action }}
                  </v-chip>
                </template>

                <!-- Resource Column -->
                <template #item.resourceType="{ item }">
                  <div v-if="item.resourceType">
                    <v-chip
                      color="primary"
                      size="small"
                      variant="outlined"
                    >
                      {{ item.resourceType }}
                    </v-chip>
                    <div v-if="item.resourceId" class="text-caption text-medium-emphasis mt-1">
                      ID: {{ item.resourceId }}
                    </div>
                  </div>
                  <span v-else class="text-medium-emphasis">-</span>
                </template>

                                 <!-- Details Column -->
                 <template #item.details="{ item }">
                   <v-icon
                     v-if="Object.keys(item.details).length > 0"
                     icon="mdi-eye"
                     color="black"
                     class="cursor-pointer"
                     @click="showDetails(item)"
                   />
                   <span v-else class="text-medium-emphasis">-</span>
                 </template>

                <!-- IP Address Column -->
                <template #item.ipAddress="{ item }">
                  <span class="text-caption font-family-mono">
                    {{ item.ipAddress }}
                  </span>
                </template>
                             </v-data-table>
         </v-col>
       </v-row>
    </v-container>

    <!-- Details Dialog -->
    <div v-if="detailsDialog" class="details-overlay" @click.self="detailsDialog = false">
      <div class="details-dialog">
        <!-- colored card behind -->
        <div class="details-dialog-bg"></div>
        <!-- main white card -->
        <div class="details-dialog-inner">
          <button class="details-close" @click="detailsDialog = false">&times;</button>

          <div class="details-icon">
            <v-icon>mdi-eye</v-icon>
          </div>

          <h2 class="details-title">Audit Entry Details</h2>
          
          <div class="details-scroll-container">
            <div class="details-content">
              <div class="detail-item">
                <label class="detail-label">User</label>
                <div class="detail-value">{{ selectedEntry?.userName }} ({{ selectedEntry?.userEmail }})</div>
              </div>
              
              <div class="detail-item">
                <label class="detail-label">Action</label>
                <div class="detail-value">{{ selectedEntry?.action }}</div>
              </div>
              
              <div class="detail-item">
                <label class="detail-label">Timestamp</label>
                <div class="detail-value">{{ formatDateTime(selectedEntry?.timestamp) }}</div>
              </div>
              
              <div class="detail-item">
                <label class="detail-label">IP Address</label>
                <div class="detail-value">{{ selectedEntry?.ipAddress }}</div>
              </div>
              
              <div v-if="selectedEntry?.resourceType" class="detail-item">
                <label class="detail-label">Resource</label>
                <div class="detail-value">{{ selectedEntry?.resourceType }} - {{ selectedEntry?.resourceId }}</div>
              </div>
              
              <div v-if="Object.keys(selectedEntry?.details || {}).length > 0" class="detail-item">
                <label class="detail-label">Details</label>
                <div class="detail-value">
                  <pre class="details-json">{{ JSON.stringify(selectedEntry?.details, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </div>
          
          <button class="details-button" @click="detailsDialog = false">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { Workbook } from 'exceljs'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { useAppStore } from '@/stores/app'
import { useNotification } from '@/composables/useNotification'

export default {
  name: 'AuditTrailPage',
  setup() {
    const appStore = useAppStore()
    const { fetchAuditTrail, logAuditEvent, auditActions, resourceTypes, loading } = useAuditTrail()
    const { showError } = useNotification()

    // Check if user is super admin
    const isSuperAdmin = computed(() => appStore.userType === 'Super Admin')

    // Redirect if not super admin
    if (!isSuperAdmin.value) {
      window.location.href = '/dashboard'
    }

    // Data
    const auditEntries = ref([])
    const filteredAuditEntries = ref([])
    const exportLoading = ref(false)
    const detailsDialog = ref(false)
    const selectedEntry = ref(null)

    // Filters
    const filters = reactive({
      userEmail: '',
      action: '',
      resourceType: '',
      userType: '',
      startDate: '',
      endDate: ''
    })

    // Table headers
    const headers = [
      { title: 'Timestamp', key: 'timestamp', sortable: true },
      { title: 'User', key: 'userName', sortable: true },
      { title: 'User Type', key: 'userType', sortable: true },
      { title: 'Action', key: 'action', sortable: true },
   
      { title: 'Details', key: 'details', sortable: false },
    ]

    // Options for filters
    const actionOptions = Object.values(auditActions)
    const resourceTypeOptions = Object.values(resourceTypes)
    const userTypeOptions = ['Super Admin', 'Admin', 'Agency']

    // Computed
    const hasActiveFilters = computed(() => {
      return Object.values(filters).some(value => value !== '')
    })

    // Methods
    const loadAuditTrail = async () => {
      try {
        const entries = await fetchAuditTrail()
        auditEntries.value = entries
        filteredAuditEntries.value = entries
        
        // Log the audit event for viewing audit trail
        await logAuditEvent(
          auditActions.VIEW,
          {
            recordCount: entries.length,
            filters: filters
          },
          resourceTypes.DOCUMENT,
          null
        )
      } catch (error) {
        showError('Failed to load audit trail')
        console.error('Error loading audit trail:', error)
      }
    }

    const applyFilters = () => {
      filteredAuditEntries.value = auditEntries.value.filter(entry => {
        const emailMatch = !filters.userEmail || 
          entry.userEmail.toLowerCase().includes(filters.userEmail.toLowerCase())
        
        const actionMatch = !filters.action || entry.action === filters.action
        
        const resourceMatch = !filters.resourceType || entry.resourceType === filters.resourceType
        
        const userTypeMatch = !filters.userType || entry.userType === filters.userType
        
        const dateMatch = !filters.startDate || 
          new Date(entry.timestamp) >= new Date(filters.startDate)
        
        return emailMatch && actionMatch && resourceMatch && userTypeMatch && dateMatch
      })
    }

    const clearFilters = () => {
      Object.keys(filters).forEach(key => {
        filters[key] = ''
      })
      filteredAuditEntries.value = auditEntries.value
    }

    const showDetails = (entry) => {
      selectedEntry.value = entry
      detailsDialog.value = true
    }

    const formatDateTime = (timestamp) => {
      if (!timestamp) return 'N/A'
      return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    const getUserTypeColor = (userType) => {
      const colors = {
        'Super Admin': 'error',
        'Admin': 'warning',
        'Agency': 'info'
      }
      return colors[userType] || 'grey'
    }

    const getActionColor = (action) => {
      const colors = {
        'LOGIN': 'success',
        'LOGOUT': 'grey',
        'CREATE': 'primary',
        'UPDATE': 'warning',
        'DELETE': 'error',
        'VIEW': 'info',
        'EXPORT': 'secondary',
        'IMPORT': 'secondary',
        'APPROVE': 'success',
        'REJECT': 'error',
        'ASSIGN': 'primary',
        'UPLOAD': 'info',
        'DOWNLOAD': 'info'
      }
      return colors[action] || 'grey'
    }

    const exportAuditTrail = async () => {
      exportLoading.value = true
      try {
        // Log the audit event for export
        await logAuditEvent(
          auditActions.EXPORT,
          {
            exportType: 'CSV',
            recordCount: filteredAuditEntries.value.length,
            filters: filters
          },
          resourceTypes.DOCUMENT,
          null
        )
        
        const csvContent = generateCSV(filteredAuditEntries.value)
        downloadCSV(csvContent, `audit-trail-${new Date().toISOString().split('T')[0]}.csv`)
      } catch (error) {
        showError('Failed to export audit trail')
        console.error('Export error:', error)
      } finally {
        exportLoading.value = false
      }
    }

    const exportAuditTrailXLSX = async () => {
      exportLoading.value = true
      try {
        await logAuditEvent(
          auditActions.EXPORT,
          {
            exportType: 'XLSX',
            recordCount: filteredAuditEntries.value.length,
            filters: filters
          },
          resourceTypes.DOCUMENT,
          null
        )

        // Prepare data without IP and Resource ID
        const headers = ['Timestamp', 'User', 'User Email', 'User Type', 'Action', 'Resource Type']
        const rows = filteredAuditEntries.value.map(e => ([
          formatCsvDate(e.timestamp),
          e.userName || '',
          e.userEmail || '',
          e.userType || '',
          e.action || '',
          e.resourceType || ''
        ]))

        // Create workbook / worksheet
        const wb = new Workbook()
        const ws = wb.addWorksheet('Audit Trail')

        // Define columns with initial widths (will auto-size below)
        ws.columns = headers.map(h => ({ header: h, key: h, width: 20 }))

        // Add data rows
        rows.forEach(r => ws.addRow(r))

        // Style header row
        const headerRow = ws.getRow(1)
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } }
        headerRow.height = 20
        headerRow.eachCell(cell => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } }
          }
        })

        // Freeze header and add autofilter
        ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
        ws.autoFilter = { from: 'A1', to: String.fromCharCode(64 + headers.length) + '1' }

        // Auto-fit column widths based on content (with padding and limits)
        headers.forEach((h, i) => {
          const maxLen = Math.max(
            String(h).length,
            ...rows.map(r => String(r[i] ?? '').length)
          )
          ws.getColumn(i + 1).width = Math.min(Math.max(maxLen + 2, 12), 60)
        })

        // Generate and download
        const filename = `audit-trail-${new Date().toISOString().split('T')[0]}.xlsx`
        const buffer = await wb.xlsx.writeBuffer()
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } catch (error) {
        showError('Failed to export audit trail')
        console.error('XLSX Export error:', error)
      } finally {
        exportLoading.value = false
      }
    }

    const generateCSV = (data) => {
      const headers = [
        'Timestamp',
        'User',
        'User Email',
        'User Type',
        'Action',
        'Resource Type',
        'Resource ID',
        'IP Address'
      ]

      const csvRows = []
      csvRows.push(headers.map(csvEscape).join(','))

      data.forEach(entry => {
        const row = [
          formatCsvDate(entry.timestamp),
          entry.userName,
          entry.userEmail,
          entry.userType,
          entry.action,
          entry.resourceType || '',
          entry.resourceId || '',
          entry.ipAddress || ''
        ]
        csvRows.push(row.map(csvEscape).join(','))
      })

      return csvRows.join('\n')
    }

    // Ensures values are CSV-safe: wraps in quotes, escapes quotes, normalizes newlines
    const csvEscape = (value) => {
      if (value === null || value === undefined) return '""'
      const str = String(value)
        .replace(/"/g, '""')
        .replace(/\r?\n|\r/g, ' ')
      return `"${str}"`
    }

    // Format timestamp without commas so CSV stays tidy
    const formatCsvDate = (timestamp) => {
      const d = new Date(timestamp)
      if (isNaN(d)) return ''
      const pad = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    }

    

    const downloadCSV = (content, filename) => {
      // Prepend BOM so Excel opens UTF-8 correctly
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // Lifecycle
    onMounted(() => {
      loadAuditTrail()
      document.title = "Audit Trail - Depsure"
    })

    return {
      // Data
      auditEntries,
      filteredAuditEntries,
      loading,
      exportLoading,
      detailsDialog,
      selectedEntry,
      filters,
      
      // Options
      headers,
      actionOptions,
      resourceTypeOptions,
      userTypeOptions,
      
      // Computed
      hasActiveFilters,
      
      // Methods
      applyFilters,
      clearFilters,
      showDetails,
      formatDateTime,
      getUserTypeColor,
      getActionColor,
      exportAuditTrail,
      exportAuditTrailXLSX,
      logAuditEvent
    }
  }
}
</script>

<style scoped>
.audit-trail-page {
  padding: 20px;
  min-height: 100vh;

}

.custom-input {
  font-size: 0.875rem;
}

.font-family-mono {
  font-family: 'Courier New', monospace;
}

.cursor-pointer {
  cursor: pointer;
}

.text-decoration-underline {
  text-decoration: underline;
}

.custom-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #000 0%, #333 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.custom-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #333 0%, #000 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.custom-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.custom-btn.secondary {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  color: white;
}

.custom-btn.secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #495057 0%, #6c757d 100%);
}

pre {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  border: 1px solid #e9ecef;
  font-size: 0.75rem;
  line-height: 1.4;
}

/* Details Dialog Styles - matching notification dialog */
.details-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
}

.details-dialog {
  position: relative;
  width: 450px;
  max-width: 90vw;
  max-height: 80vh;
}

.details-dialog-bg {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 96%;
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  background-color: #000000;
}

.details-dialog-inner {
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.details-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  color: #666;
}

.details-close:hover {
  color: #333;
}

.details-icon {
  position: relative;
  margin: 0 auto 16px auto;
  margin-top: -12%;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInCircle 0.3s ease-out forwards;
  background-color: #000000;
}

.details-icon .v-icon {
  font-size: 30px;
  color: #ffffff;
}

.details-icon::before {
  content: '';
  position: absolute;
  width: 80px;
  height: 80px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  opacity: 0.2;
  animation: pulse 2s ease-in-out infinite;
  background-color: #000000;
}

@keyframes fadeInCircle {
  from {
    opacity: 0;
    transform: scale(0.7);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.details-title {
  font-size: 1.5em;
  margin: 0 0 16px 0;
  color: #333;
}

.details-scroll-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  max-height: 300px;
  padding-right: 8px;
}

.details-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.details-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.details-scroll-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.details-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.details-content {
  text-align: left;
}

.detail-item {
  margin-bottom: 12px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #000000;
}

.detail-label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  font-size: 0.8em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  color: #666;
  font-size: 0.9em;
  line-height: 1.4;
}

.details-json {
  background-color: #f1f3f4;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  border: 1px solid #e0e0e0;
  font-size: 0.75rem;
  line-height: 1.4;
  color: #333;
  max-height: 150px;
  overflow-y: auto;
}

.details-button {
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 1em;
  padding: 10px 20px;
  cursor: pointer;
  background-color: #000000;
  transition: all 0.3s ease;
  margin-top: auto;
}

.details-button:hover {
  background-color: #333333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>
