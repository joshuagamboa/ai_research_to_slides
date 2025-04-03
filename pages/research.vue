<template>
  <div class="research-output-page">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Research Results Section -->
      <div class="research-results-container">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Research Results</h2>
          <div class="flex space-x-3">
            <button
              v-if="isResearchComplete && !presentationOutline"
              @click="generateOutlineInNewWindow"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ease-in-out relative overflow-hidden"
              :disabled="isLoading || isGeneratingOutline"
            >
              <span v-if="!isGeneratingOutline">Generate Outline</span>
              <span v-else class="flex items-center">
                <Loader :size="16" inline />
                <span class="ml-2">Generating...</span>
              </span>
              <div v-if="isGeneratingOutline" class="absolute bottom-0 left-0 h-1 bg-white rounded-full transition-all duration-300" :style="{ width: outlineProgress + '%' }"></div>
            </button>
            <button
              @click="resetResearch"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
              :disabled="isLoading"
            >
              Start New Research
            </button>
          </div>
        </div>

        <!-- Loading Indicator (inline) -->
        <div v-if="isLoading && !researchResults" class="bg-white shadow-lg rounded-xl p-6 mb-8 flex flex-col items-center justify-center py-8">
          <Loader size="large" />
          <p class="mt-4 text-gray-600">Researching... Please wait</p>
        </div>

        <!-- Research Content -->
        <div v-else class="bg-white shadow-lg rounded-xl p-6 mb-8">
          <div v-if="researchResults || isStreaming" class="prose max-w-none">
            <div v-if="isStreaming" class="relative">
              <div v-html="renderedResults" class="streaming-content min-h-[100px] transition-all duration-300"></div>
              <div class="absolute top-0 right-0 flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-bl-lg">
                <span class="text-sm text-blue-600">Streaming</span>
                <Loader :size="20" inline />
              </div>
            </div>
            <div v-else-if="researchResults" v-html="renderedResults"></div>
          </div>
          <div v-else class="text-gray-500 italic">Research will begin automatically...</div>
        </div>

        <!-- Generate Outline Button has been moved to the top right corner -->

        <!-- Error Message -->
        <div v-if="error" class="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useResearch } from '~/composables/useResearch'
import { renderMarkdown } from '~/utils/markdown'
import { useMarp } from '~/composables/useMarp'
import type { MarpTemplate } from '~/types/research'

// Initialize composables
const {
  researchResults,
  presentationOutline,
  conductResearch,
  generateOutline,
  isLoading,
  isStreaming,
  isResearchComplete,
  error,
  streamingContent,
  isGeneratingOutline,
  outlineProgress
} = useResearch()
const { generateMarpSlides, convertMarkdownToSlides } = useMarp()
const router = useRouter()

// Local state
const showTemplateSelector = ref(false)

// Function to clean markdown code block delimiters
const cleanMarkdownDelimiters = (content: string): string => {
  if (!content) return ''

  // Remove ```markdown at the beginning
  let cleaned = content.replace(/^\s*```markdown\s*\n/, '')

  // Remove ``` at the end
  cleaned = cleaned.replace(/\n\s*```\s*$/, '')

  // Also handle case where it might just be ``` without 'markdown'
  cleaned = cleaned.replace(/^\s*```\s*\n/, '')

  return cleaned
}

// Computed properties
const renderedResults = computed(() => {
  // Use streamingContent when streaming, otherwise use researchResults
  // Add null checks to prevent "Cannot read properties of undefined" error
  const content = isStreaming?.value && streamingContent?.value ? streamingContent.value : researchResults?.value || ''
  // Return the rendered content
  return content ? renderMarkdown(content) : ''
})

// Watch streamingContent for updates
watch(
  // Ensure the source is properly wrapped in a function that safely handles undefined
  () => streamingContent?.value,
  (newContent, oldContent) => {
    // Only process if we're streaming and have new content
    if (isStreaming?.value && newContent) {
      // Ensure DOM updates after content changes
      nextTick(() => {
        try {
          // Initialize researchResults if needed
          if (!researchResults.value) {
            researchResults.value = ''
          }
          // Safely handle undefined or non-string values
          const safeNewContent = typeof newContent === 'string' ? newContent : ''
          const safeOldContent = typeof oldContent === 'string' ? oldContent : ''

          // Safely append new content (only the difference between old and new)
          const contentToAdd = safeOldContent ? safeNewContent.slice(safeOldContent.length) : safeNewContent
          if (contentToAdd) {
            researchResults.value += contentToAdd
          }
        } catch (err) {
          console.error('Error updating research results:', err)
        }
      })
    }
  },
  { immediate: false }
)

// Start research automatically when the page loads
onMounted(() => {
  // Get research topic from URL query parameters
  const route = useRoute()
  const topicFromQuery = route.query.topic

  console.log('Research page mounted, topic from query:', topicFromQuery)

  // Start research automatically if no results exist
  if (!researchResults.value) {
    conductResearch(topicFromQuery)
  }

  // Listen for messages from the outline window
  window.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'generateSlides') {
      // When the "Generate Slides" button is clicked in the outline window
      generateSlidesFromOutline()
    }
  })
})

// Methods
const resetResearch = () => {
  if (isLoading.value) return // Prevent reset while loading

  researchResults.value = ''
  presentationOutline.value = ''
  showTemplateSelector.value = false
  // Start a new research
  conductResearch()
}

const generateOutlineInNewWindow = async () => {
  if (isLoading.value || isGeneratingOutline.value) return // Prevent generating outline while loading

  // Reset progress
  outlineProgress.value = 0

  // Start the progress animation
  const startTime = Date.now()
  const estimatedDuration = 10000 // Estimate 10 seconds for generation

  // Simulate progress while generating
  const progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(90, (elapsed / estimatedDuration) * 90)
    outlineProgress.value = progress
  }, 100)

  try {
    // Generate the outline (non-streaming)
    await generateOutline(false) // false means don't open in new window

    // Complete the progress bar
    outlineProgress.value = 100

    // Wait a moment to show the completed progress bar
    setTimeout(() => {
      // Clean and store the outline data in localStorage so the new window can access it
      const cleanedOutline = cleanMarkdownDelimiters(presentationOutline.value)
      localStorage.setItem('marpOutline', cleanedOutline)

      // Open the outline page in a new tab/window
      window.open('/outline', '_blank')

      // Reset the generating state after a short delay
      setTimeout(() => {
        isGeneratingOutline.value = false
      }, 300)
    }, 500)
  } catch (err) {
    console.error('Error generating outline:', err)
    error.value = 'Failed to generate outline. Please try again.'
    isGeneratingOutline.value = false
  } finally {
    clearInterval(progressInterval)
  }
}

// Generate slides from the outline using MARP
const generateSlidesFromOutline = async () => {
  if (!presentationOutline.value) return

  // Convert Markdown to HTML slides using MARP
  const slidesHtml = await convertMarkdownToSlides(presentationOutline.value)

  if (slidesHtml) {
    // Open slides in a new window
    const slidesWindow = window.open('', '_blank')
    if (slidesWindow) {
      slidesWindow.document.write(slidesHtml)
      slidesWindow.document.close()
    } else {
      alert('Popup blocked. Please allow popups for this site.')
    }
  }
}

const downloadOutline = () => {
  if (!presentationOutline.value) return

  const blob = new Blob([presentationOutline.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'presentation_outline.Rmd'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.research-output-page {
  min-height: calc(100vh - 64px); /* Adjust based on your navbar height */
  background-color: #f9fafb;
}

.research-results-container {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>