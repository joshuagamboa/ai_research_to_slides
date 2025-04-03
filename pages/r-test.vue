<template>
  <div class="r-test-page">
    <h1 class="text-2xl font-bold mb-4">R Integration Test</h1>
    
    <div v-if="isLoading" class="flex items-center justify-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="result" class="bg-white shadow-lg rounded-xl p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Test Result</h2>
      <pre class="bg-gray-50 p-4 rounded-md overflow-x-auto">{{ result }}</pre>
    </div>
    
    <div class="mt-6">
      <button 
        @click="testRIntegration" 
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        :disabled="isLoading"
      >
        Run R Test
      </button>
    </div>
    
    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-4">R Markdown Test</h2>
      <textarea 
        v-model="rMarkdownCode" 
        class="w-full h-64 font-mono text-sm p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Enter R Markdown code here..."
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
          :disabled="isProcessing || !processedMarkdown"
        >
          Generate Slides
        </button>
      </div>
      
      <div v-if="isProcessing" class="mt-4 flex items-center">
        <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500 mr-2"></div>
        <span>Processing...</span>
      </div>
      
      <div v-if="processedMarkdown" class="mt-6">
        <h3 class="text-lg font-semibold mb-2">Processed Output</h3>
        <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
          <div v-html="processedMarkdown"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMarp } from '~/composables/useMarp'

// State
const isLoading = ref(false)
const error = ref<string | null>(null)
const result = ref<string | null>(null)
const rMarkdownCode = ref(`---
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
`)
const isProcessing = ref(false)
const processedMarkdown = ref<string | null>(null)

// Get the MARP functions
const { processRMarkdownChunks, convertMarkdownToSlides } = useMarp()

// Function to test R integration
const testRIntegration = async () => {
  isLoading.value = true
  error.value = null
  result.value = null
  
  try {
    const response = await fetch('/api/r-test')
    const data = await response.json()
    
    if (data.success) {
      result.value = data.result
    } else {
      error.value = data.error || 'An error occurred'
    }
  } catch (err) {
    console.error('Error testing R integration:', err)
    error.value = err.message || 'An error occurred'
  } finally {
    isLoading.value = false
  }
}

// Function to process R Markdown
const processRMarkdown = async () => {
  if (!rMarkdownCode.value) return
  
  isProcessing.value = true
  processedMarkdown.value = null
  
  try {
    // Process R Markdown code chunks
    const processed = await processRMarkdownChunks(rMarkdownCode.value)
    processedMarkdown.value = processed
  } catch (err) {
    console.error('Error processing R Markdown:', err)
    error.value = err.message || 'An error occurred while processing R Markdown'
  } finally {
    isProcessing.value = false
  }
}

// Function to generate slides
const generateSlides = async () => {
  if (!rMarkdownCode.value) return
  
  isProcessing.value = true
  
  try {
    // Convert to MARP slides
    const slidesHtml = await convertMarkdownToSlides(rMarkdownCode.value)
    
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
.r-test-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
