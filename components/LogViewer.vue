<template>
  <div class="log-viewer">
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 class="text-lg font-semibold">{{ title }}</h2>
        <div class="flex space-x-2">
          <select 
            v-model="selectedLines" 
            class="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option v-for="option in lineOptions" :key="option" :value="option">
              {{ option }} lines
            </option>
          </select>
          <button 
            @click="refresh" 
            class="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
      
      <div v-else-if="error" class="bg-red-100 p-4 text-red-700">
        <p>{{ error }}</p>
      </div>
      
      <div v-else class="overflow-auto max-h-[70vh]">
        <pre v-if="entries.length" class="p-4 text-sm font-mono whitespace-pre-wrap">
          <div v-for="(entry, index) in entries" :key="index" class="mb-4 pb-4 border-b border-gray-200">
            {{ entry }}
          </div>
        </pre>
        <div v-else class="p-8 text-center text-gray-500">
          No log entries found
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Logs'
  },
  logType: {
    type: String,
    required: true,
    validator: (value) => ['requests', 'responses', 'r-runtime', 'svg-operations'].includes(value)
  },
  autoRefresh: {
    type: Boolean,
    default: false
  },
  refreshInterval: {
    type: Number,
    default: 10000 // 10 seconds
  }
})

const entries = ref([])
const isLoading = ref(false)
const error = ref(null)
const selectedLines = ref(100)
const lineOptions = [50, 100, 200, 500]
let refreshTimer = null

const fetchLogs = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await fetch(`/api/logs/${props.logType}?lines=${selectedLines.value}`)
    const data = await response.json()
    
    if (data.error) {
      error.value = data.error
      entries.value = []
    } else {
      entries.value = data.entries
    }
  } catch (err) {
    error.value = err.message || 'Failed to fetch logs'
    entries.value = []
  } finally {
    isLoading.value = false
  }
}

const refresh = () => {
  fetchLogs()
}

watch(selectedLines, () => {
  fetchLogs()
})

onMounted(() => {
  fetchLogs()
  
  if (props.autoRefresh) {
    refreshTimer = setInterval(fetchLogs, props.refreshInterval)
  }
})

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>
