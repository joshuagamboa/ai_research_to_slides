<template>
  <div class="outline-page">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Outline Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">MARP Presentation Outline</h1>
        <div class="flex space-x-3">
          <button
            @click="generateSlides"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 ease-in-out"
          >
            Generate Slides
          </button>
          <button
            @click="fixTableFormatting"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
          >
            Fix Table Formatting
          </button>
          <button
            @click="downloadOutline"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
          >
            Download Markdown
          </button>
        </div>
      </div>

      <!-- Note about R Markdown compatibility -->
      <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-md">
        <p class="text-blue-700">
          This outline uses R Markdown format. You can include R code chunks for data visualization and mermaid.js diagrams.
        </p>
      </div>

      <!-- Template Selector -->
      <div class="bg-white shadow-md rounded-md p-4 mb-6">
        <h3 class="text-lg font-medium mb-3">Select Slide Template</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div
            v-for="template in TEMPLATES.slice(0, 4)"
            :key="template.name"
            @click="selectedTemplate = template"
            class="template-preview cursor-pointer rounded-md p-3 border-2 transition-all duration-200"
            :class="{
              'border-indigo-500 shadow-md': selectedTemplate.name === template.name,
              'border-gray-200 hover:border-gray-300': selectedTemplate.name !== template.name
            }"
            :style="{
              backgroundColor: template.backgroundColor,
              color: template.textColor
            }"
          >
            <h4
              class="text-sm font-bold mb-1"
              :style="{ color: template.accentColor, fontFamily: template.headingFont }"
            >
              {{ template.name }}
            </h4>
            <p class="text-xs" :style="{ fontFamily: template.bodyFont }">
              Theme: {{ template.theme }}
            </p>
          </div>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div v-if="isLoading" class="bg-white shadow-lg rounded-xl p-6 mb-8 flex flex-col items-center justify-center py-8">
        <Loader size="large" />
        <p class="mt-4 text-gray-600">Loading outline... Please wait</p>
      </div>

      <!-- Outline Content -->
      <div v-else-if="presentationOutline" class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <div class="mb-4 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-700">Edit Your Outline</h3>
          <div class="text-sm text-gray-500">Markdown formatting supported</div>
        </div>
        <textarea
          v-model="presentationOutline"
          class="outline-editor w-full h-[60vh] font-mono text-sm p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out"
          spellcheck="false"
          placeholder="Your MARP presentation outline will appear here..."
        ></textarea>
      </div>

      <!-- No Outline Message -->
      <div v-else class="bg-white shadow-lg rounded-xl p-6 mb-8 text-center">
        <p class="text-gray-500">No outline available. Please generate an outline from the research page.</p>
        <button
          @click="navigateToResearch"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
        >
          Go to Research
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useResearch } from '~/composables/useResearch'
import { useMarp } from '~/composables/useMarp'
import { convertRMdToMarp, TEMPLATES } from '~/utils/marpUtils'

// Initialize composables
const { presentationOutline: composableOutline, isLoading } = useResearch()
const { convertMarkdownToSlides } = useMarp()
const router = useRouter()

// Local state for the outline content
const presentationOutline = ref('')

// Watch for changes to the outline and save to localStorage
watch(presentationOutline, (newValue) => {
  if (typeof window !== 'undefined' && newValue) {
    // Save the content as is - no need to add delimiters back
    localStorage.setItem('marpOutline', newValue)
  }
})

// Function to clean markdown code block delimiters if needed
// For R Markdown, we want to preserve the code blocks
const cleanMarkdownDelimiters = (content: string): string => {
  if (!content) return ''

  let cleaned = content

  // Remove intro text if it exists
  const introText = "Here's a comprehensive R Markdown presentation outline based on your research:"
  if (cleaned.includes(introText)) {
    cleaned = cleaned.replace(introText, '').trim()
  }

  // Remove outro text if it exists
  const outroText = "This outline balances conciseness with depth, using R Markdown's features for visual aids (tables, graphs, mermaid diagrams) while ensuring each slide is digestible. Let me know if you'd like to expand any section!"
  if (cleaned.includes(outroText)) {
    cleaned = cleaned.replace(outroText, '').trim()
  }

  // Remove ```markdown at the beginning if it exists
  if (cleaned.trim().startsWith('```markdown')) {
    cleaned = cleaned.replace(/^\s*```markdown\s*\n/, '')
  } else if (cleaned.trim().startsWith('```') && !cleaned.trim().startsWith('```{')) {
    // Handle case where it might just be ``` without 'markdown'
    // But don't remove R Markdown code blocks that start with ```{r}
    cleaned = cleaned.replace(/^\s*```\s*\n/, '')
  }

  // Remove ``` at the end if it exists
  if (cleaned.trim().endsWith('```')) {
    cleaned = cleaned.replace(/\n\s*```\s*$/, '')
  }

  // Trim any extra whitespace
  cleaned = cleaned.trim()

  console.log('Cleaned content:', cleaned)
  return cleaned
}

// Load the outline data from localStorage on mount
onMounted(() => {
  if (typeof window !== 'undefined') {
    const storedOutline = localStorage.getItem('marpOutline')
    if (storedOutline) {
      // Clean the outline before setting it
      presentationOutline.value = cleanMarkdownDelimiters(storedOutline)
    } else if (composableOutline.value) {
      // Fallback to the composable if localStorage is empty
      presentationOutline.value = cleanMarkdownDelimiters(composableOutline.value)
    }
  }
})

// Methods
// Add state for selected template
const selectedTemplate = ref(TEMPLATES[0]) // Default to first template

// Function to generate slides from R Markdown content
const generateSlides = async () => {
  if (!presentationOutline.value) return

  // First fix any table formatting issues
  fixTableFormatting()

  // Clean only the outer markdown code block delimiters if they exist
  const cleanRMarkdown = cleanMarkdownDelimiters(presentationOutline.value)

  // Convert R Markdown to MARP-compatible markdown
  const marpMarkdown = convertRMdToMarp(cleanRMarkdown, selectedTemplate.value)

  // Add MARP frontmatter if not present
  let finalMarkdown = marpMarkdown
  if (!finalMarkdown.startsWith('---\nmarp: true')) {
    finalMarkdown = `---
marp: true
theme: default
paginate: true
header: ''
footer: ''
---

${finalMarkdown}`
  }

  // Add special script to fix tables
  finalMarkdown = finalMarkdown.replace(/^---([\s\S]*?)---/m, (match, frontmatter) => {
    return `---${frontmatter}
scriptPath: /fixTables.js
---`
  })

  // Log the content for debugging
  console.log('Original content:', presentationOutline.value)
  console.log('Clean R Markdown:', cleanRMarkdown)
  console.log('MARP Markdown:', marpMarkdown)
  console.log('Final Markdown:', finalMarkdown)

  // Convert MARP markdown to HTML slides
  const slidesHtml = await convertMarkdownToSlides(finalMarkdown)

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

  // Clean only the outer markdown code block delimiters if they exist
  const cleanRMarkdown = cleanMarkdownDelimiters(presentationOutline.value)

  // For download, we want the R Markdown content as is
  const blob = new Blob([cleanRMarkdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'presentation_outline.md'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const navigateToResearch = () => {
  router.push('/research')
}

// Function to fix table formatting issues
const fixTableFormatting = () => {
  if (!presentationOutline.value) return

  // Find all markdown tables in the content and ensure they're properly formatted
  const tableRegex = /\|([^\n|]*\|)+\s*\n\|\s*(:?-+:?\|)+\s*\n((\|[^\n|]*)+\|\s*\n)+/g

  // Replace each table with a properly formatted version
  const fixedContent = presentationOutline.value.replace(tableRegex, (tableMatch) => {
    // Split the table into lines
    const lines = tableMatch.trim().split('\n')

    // Ensure each line ends with a pipe and has proper spacing
    const formattedLines = lines.map(line => {
      // Trim the line and ensure it starts and ends with a pipe
      let formattedLine = line.trim()
      if (!formattedLine.startsWith('|')) formattedLine = '| ' + formattedLine
      if (!formattedLine.endsWith('|')) formattedLine = formattedLine + ' |'

      // Ensure proper spacing around the pipe characters
      formattedLine = formattedLine.replace(/\|\s*/g, '| ')
      formattedLine = formattedLine.replace(/\s*\|/g, ' |')

      return formattedLine
    })

    // Join the lines back together with newlines
    return '\n\n' + formattedLines.join('\n') + '\n\n'
  })

  // Update the outline content
  presentationOutline.value = fixedContent
}
</script>

<style scoped>
.outline-page {
  min-height: calc(100vh - 64px);
  background-color: #f9fafb;
}

.outline-editor {
  resize: vertical;
  min-height: 400px;
  line-height: 1.6;
  tab-size: 2;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  white-space: pre-wrap;
}

.outline-editor:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

/* Add a subtle line number effect */
.outline-editor {
  background-image: linear-gradient(to right, #f3f4f6 40px, transparent 40px);
  background-size: 100% 1.6em;
  background-attachment: local;
  padding-left: 50px !important;
}

/* Template selector styles */
.template-preview {
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
}

.template-preview:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Checkmark and crossmark styling */
.checkmark {
  color: green;
  font-weight: bold;
  font-size: 1.2em;
}

.crossmark {
  color: red;
  font-weight: bold;
  font-size: 1.2em;
}
</style>
