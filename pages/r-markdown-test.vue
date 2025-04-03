<template>
  <div class="r-markdown-test-page">
    <h1 class="text-2xl font-bold mb-4">R Markdown Integration Test</h1>
    
    <div class="mb-6">
      <p class="mb-2">This page allows you to test the R Markdown integration with MARP slides.</p>
      <p>Enter R Markdown content in the editor below and click "Process R Markdown" to convert it to MARP-compatible markdown.</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="editor-container">
        <h2 class="text-xl font-semibold mb-2">R Markdown Editor</h2>
        <textarea 
          v-model="rMarkdownContent" 
          class="w-full h-96 font-mono text-sm p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter R Markdown content here..."
        ></textarea>
        
        <div class="mt-4 flex space-x-4">
          <button 
            @click="processRMarkdown" 
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :disabled="isProcessing"
          >
            Process R Markdown
          </button>
          
          <button 
            @click="generateSlides" 
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            :disabled="isProcessing || !processedContent"
          >
            Generate Slides
          </button>
        </div>
      </div>
      
      <div class="preview-container">
        <h2 class="text-xl font-semibold mb-2">Processed Markdown</h2>
        <div 
          v-if="processedContent" 
          class="w-full h-96 overflow-auto p-4 border border-gray-300 rounded-md bg-white"
        >
          <div v-html="renderedContent"></div>
        </div>
        <div 
          v-else 
          class="w-full h-96 flex items-center justify-center p-4 border border-gray-300 rounded-md bg-gray-50"
        >
          <p class="text-gray-500">Processed content will appear here</p>
        </div>
      </div>
    </div>
    
    <div v-if="isProcessing" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <div class="flex items-center">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mr-3"></div>
          <p>Processing R Markdown...</p>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
      <p class="font-bold">Error</p>
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMarp } from '~/composables/useMarp'
import { marked } from 'marked'

// State
const rMarkdownContent = ref(`---
title: "R Markdown Test"
author: "Test User"
date: "2023-04-03"
---

# R Markdown Test

This is a test of R Markdown integration.

## A Simple Plot

\`\`\`{r}
library(ggplot2)
ggplot(mtcars, aes(x = wt, y = mpg)) +
  geom_point() +
  geom_smooth(method = "lm") +
  labs(title = "Weight vs MPG",
       x = "Weight (1000 lbs)",
       y = "Miles per Gallon") +
  theme_minimal()
\`\`\`

## A Simple Table

\`\`\`{r}
knitr::kable(head(mtcars[, c("mpg", "cyl", "wt")]))
\`\`\`

## A Comparison Table

\`\`\`{r}
comparison <- data.frame(
  Feature = c("Tables", "Plots", "Charts", "Code"),
  "R Markdown" = c("✅", "✅", "✅", "✅"),
  "MARP" = c("✅", "⚠️", "⚠️", "✅"),
  "Our Integration" = c("✅", "✅", "✅", "✅")
)
knitr::kable(comparison)
\`\`\`
`)
const processedContent = ref<string | null>(null)
const isProcessing = ref(false)
const error = ref<string | null>(null)

// Get the MARP functions
const { processRMarkdownContent, convertMarkdownToSlides } = useMarp()

// Computed property to render the processed content as HTML
const renderedContent = computed(() => {
  if (!processedContent.value) return ''
  return marked(processedContent.value)
})

// Function to process R Markdown
const processRMarkdown = async () => {
  if (!rMarkdownContent.value) return
  
  isProcessing.value = true
  error.value = null
  
  try {
    // Process the R Markdown content
    const processed = await processRMarkdownContent(rMarkdownContent.value)
    processedContent.value = processed
  } catch (err) {
    console.error('Error processing R Markdown:', err)
    error.value = err.message || 'An error occurred while processing R Markdown'
  } finally {
    isProcessing.value = false
  }
}

// Function to generate slides
const generateSlides = async () => {
  if (!processedContent.value) return
  
  isProcessing.value = true
  error.value = null
  
  try {
    // Convert to MARP slides
    const slidesHtml = await convertMarkdownToSlides(processedContent.value)
    
    if (slidesHtml) {
      // Open slides in a new window
      const slidesWindow = window.open('', '_blank')
      if (slidesWindow) {
        slidesWindow.document.write(slidesHtml)
        slidesWindow.document.close()
      } else {
        error.value = 'Popup blocked. Please allow popups for this site.'
      }
    } else {
      error.value = 'Failed to generate slides'
    }
  } catch (err) {
    console.error('Error generating slides:', err)
    error.value = err.message || 'An error occurred while generating slides'
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.r-markdown-test-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
