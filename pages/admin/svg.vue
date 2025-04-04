<template>
  <div class="svg-page">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold mb-6">SVG Management</h1>
      
      <div class="mb-6 flex justify-between">
        <div class="flex space-x-4">
          <button 
            @click="fetchSvgLogs"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md"
            :class="{ 'bg-indigo-800': viewMode === 'logs' }"
          >
            View SVG Logs
          </button>
          
          <button 
            @click="fetchSvgFiles"
            class="px-4 py-2 bg-green-600 text-white rounded-md"
            :class="{ 'bg-green-800': viewMode === 'files' }"
          >
            View SVG Files
          </button>
        </div>
        
        <button 
          @click="refreshData"
          class="px-4 py-2 bg-gray-600 text-white rounded-md"
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
      
      <div v-else-if="viewMode === 'logs'" class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="p-4 bg-gray-50 border-b">
          <h2 class="text-lg font-semibold">SVG Operation Logs</h2>
        </div>
        
        <div class="overflow-auto max-h-[70vh]">
          <pre v-if="svgLogs.length" class="p-4 text-sm font-mono whitespace-pre-wrap">
            <div v-for="(entry, index) in svgLogs" :key="index" class="mb-4 pb-4 border-b border-gray-200">
              {{ entry }}
            </div>
          </pre>
          <div v-else class="p-8 text-center text-gray-500">
            No SVG log entries found
          </div>
        </div>
      </div>
      
      <div v-else-if="viewMode === 'files'" class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="p-4 bg-gray-50 border-b">
          <h2 class="text-lg font-semibold">SVG Files</h2>
        </div>
        
        <div v-if="svgFiles.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          <div v-for="file in svgFiles" :key="file.hash" class="border rounded-lg overflow-hidden">
            <div class="p-3 bg-gray-50 border-b flex justify-between items-center">
              <div class="text-sm font-medium truncate" :title="file.name">{{ file.name }}</div>
              <div class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</div>
            </div>
            <div class="p-4 flex justify-center">
              <img :src="file.url" alt="SVG Preview" class="max-h-40" />
            </div>
            <div class="p-3 bg-gray-50 border-t flex justify-between">
              <a :href="file.url" target="_blank" class="text-xs text-blue-600 hover:underline">View</a>
              <span class="text-xs text-gray-500">{{ formatDate(file.created) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="p-8 text-center text-gray-500">
          No SVG files found
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const viewMode = ref('logs') // 'logs' or 'files'
const svgLogs = ref([])
const svgFiles = ref([])
const isLoading = ref(false)
const error = ref(null)

const fetchSvgLogs = async () => {
  viewMode.value = 'logs'
  isLoading.value = true
  error.value = null
  
  try {
    const response = await fetch('/api/logs/svg-operations?lines=100')
    const data = await response.json()
    
    if (data.error) {
      error.value = data.error
      svgLogs.value = []
    } else {
      svgLogs.value = data.entries
    }
  } catch (err) {
    error.value = err.message || 'Failed to fetch SVG logs'
    svgLogs.value = []
  } finally {
    isLoading.value = false
  }
}

const fetchSvgFiles = async () => {
  viewMode.value = 'files'
  isLoading.value = true
  error.value = null
  
  try {
    const response = await fetch('/api/svg/list')
    const data = await response.json()
    
    if (data.error) {
      error.value = data.error
      svgFiles.value = []
    } else {
      svgFiles.value = data.files
    }
  } catch (err) {
    error.value = err.message || 'Failed to fetch SVG files'
    svgFiles.value = []
  } finally {
    isLoading.value = false
  }
}

const refreshData = () => {
  if (viewMode.value === 'logs') {
    fetchSvgLogs()
  } else {
    fetchSvgFiles()
  }
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  else return (bytes / 1048576).toFixed(1) + ' MB'
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

onMounted(() => {
  fetchSvgLogs()
})
</script>
