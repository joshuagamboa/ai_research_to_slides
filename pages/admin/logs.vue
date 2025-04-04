<template>
  <div class="logs-page">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold mb-6">Server Logs</h1>
      
      <div class="mb-6 flex space-x-4">
        <button 
          v-for="type in logTypes" 
          :key="type.value"
          @click="fetchLogs(type.value)"
          class="px-4 py-2 rounded-md"
          :class="currentLogType === type.value ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'"
        >
          {{ type.label }}
        </button>
        
        <button 
          @click="refreshLogs"
          class="px-4 py-2 bg-green-600 text-white rounded-md ml-auto"
        >
          Refresh
        </button>
      </div>
      
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
      
      <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
        <p>{{ error }}</p>
      </div>
      
      <div v-else class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="p-4 bg-gray-50 border-b">
          <h2 class="text-lg font-semibold">{{ getLogTypeLabel(currentLogType) }}</h2>
        </div>
        
        <div class="overflow-auto max-h-[70vh]">
          <pre v-if="logEntries.length" class="p-4 text-sm font-mono whitespace-pre-wrap">
            <div v-for="(entry, index) in logEntries" :key="index" class="mb-4 pb-4 border-b border-gray-200">
              {{ entry }}
            </div>
          </pre>
          <div v-else class="p-8 text-center text-gray-500">
            No log entries found
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const logTypes = [
  { label: 'API Requests', value: 'requests' },
  { label: 'API Responses', value: 'responses' },
  { label: 'R Runtime', value: 'r-runtime' },
  { label: 'SVG Operations', value: 'svg-operations' }
]

const currentLogType = ref('r-runtime') // Default to R runtime logs
const logEntries = ref([])
const isLoading = ref(false)
const error = ref(null)

const getLogTypeLabel = (type) => {
  const found = logTypes.find(t => t.value === type)
  return found ? found.label : 'Logs'
}

const fetchLogs = async (type) => {
  currentLogType.value = type
  isLoading.value = true
  error.value = null
  
  try {
    const response = await fetch(`/api/logs/${type}?lines=100`)
    const data = await response.json()
    
    if (data.error) {
      error.value = data.error
      logEntries.value = []
    } else {
      logEntries.value = data.entries
    }
  } catch (err) {
    error.value = err.message || 'Failed to fetch logs'
    logEntries.value = []
  } finally {
    isLoading.value = false
  }
}

const refreshLogs = () => {
  fetchLogs(currentLogType.value)
}

onMounted(() => {
  fetchLogs(currentLogType.value)
})
</script>
