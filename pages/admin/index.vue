<template>
  <div class="admin-dashboard">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white shadow-lg rounded-lg p-6">
          <h2 class="text-lg font-semibold mb-4">Server Status</h2>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-md">
              <div class="text-sm text-gray-500">Environment</div>
              <div class="text-lg font-medium">{{ isDev ? 'Development' : 'Production' }}</div>
            </div>
            <div class="bg-gray-50 p-4 rounded-md">
              <div class="text-sm text-gray-500">SVG Storage</div>
              <div class="text-lg font-medium">{{ isDev ? 'File System' : 'Base64' }}</div>
            </div>
            <div class="bg-gray-50 p-4 rounded-md">
              <div class="text-sm text-gray-500">SVG Files</div>
              <div class="text-lg font-medium">{{ svgCount }}</div>
            </div>
            <div class="bg-gray-50 p-4 rounded-md">
              <div class="text-sm text-gray-500">Log Files</div>
              <div class="text-lg font-medium">4</div>
            </div>
          </div>
        </div>
        
        <div class="bg-white shadow-lg rounded-lg p-6">
          <h2 class="text-lg font-semibold mb-4">Quick Actions</h2>
          <div class="grid grid-cols-2 gap-4">
            <button 
              @click="navigateTo('/admin/logs')" 
              class="bg-indigo-600 text-white p-4 rounded-md hover:bg-indigo-700"
            >
              View Logs
            </button>
            <button 
              @click="navigateTo('/admin/svg')" 
              class="bg-green-600 text-white p-4 rounded-md hover:bg-green-700"
            >
              Manage SVGs
            </button>
            <button 
              @click="refreshSvgCount" 
              class="bg-blue-600 text-white p-4 rounded-md hover:bg-blue-700"
            >
              Refresh Stats
            </button>
            <button 
              v-if="isDev"
              @click="openSvgFolder" 
              class="bg-purple-600 text-white p-4 rounded-md hover:bg-purple-700"
            >
              Open SVG Folder
            </button>
          </div>
        </div>
      </div>
      
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Recent R Runtime Logs</h2>
        <LogViewer 
          title="R Runtime Logs" 
          logType="r-runtime" 
          :autoRefresh="true" 
        />
      </div>
      
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Recent SVG Operations</h2>
        <LogViewer 
          title="SVG Operations" 
          logType="svg-operations" 
          :autoRefresh="true" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LogViewer from '~/components/LogViewer.vue'

const isDev = process.env.NODE_ENV === 'development'
const svgCount = ref(0)

const refreshSvgCount = async () => {
  try {
    const response = await fetch('/api/svg/list')
    const data = await response.json()
    svgCount.value = data.count
  } catch (err) {
    console.error('Error fetching SVG count:', err)
  }
}

const openSvgFolder = () => {
  if (isDev) {
    window.open('/svg-cache', '_blank')
  }
}

onMounted(() => {
  refreshSvgCount()
})
</script>
