<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">SVG in MARP Test</h1>

    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Generate SVG Plot</h2>
      <div class="flex space-x-4 mb-4">
        <button
          @click="generatePlot"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          :disabled="isGenerating"
        >
          {{ isGenerating ? 'Generating...' : 'Generate Plot' }}
        </button>

        <button
          @click="generateMarpSlides"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          :disabled="!svgBase64 || isGeneratingSlides"
        >
          {{ isGeneratingSlides ? 'Generating Slides...' : 'Create MARP Slides' }}
        </button>
      </div>

      <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
        {{ error }}
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white shadow-md rounded p-4">
        <h2 class="text-lg font-semibold mb-2">R Code</h2>
        <textarea
          v-model="rCode"
          class="w-full h-64 p-2 border rounded font-mono text-sm"
          placeholder="Enter R code to generate a plot..."
        ></textarea>
      </div>

      <div class="bg-white shadow-md rounded p-4">
        <h2 class="text-lg font-semibold mb-2">SVG Output</h2>
        <div v-if="svgBase64" class="border p-2 h-64 overflow-auto">
          <img :src="'data:image/svg+xml;base64,' + svgBase64" alt="Generated SVG" class="max-w-full" />
        </div>
        <div v-else class="border p-2 h-64 flex items-center justify-center text-gray-500">
          No SVG generated yet
        </div>
      </div>
    </div>

    <div class="mt-6 bg-white shadow-md rounded p-4">
      <h2 class="text-lg font-semibold mb-2">MARP Markdown</h2>
      <textarea
        v-model="marpMarkdown"
        class="w-full h-64 p-2 border rounded font-mono text-sm"
        placeholder="MARP markdown will appear here after generating a plot..."
      ></textarea>
    </div>

    <div v-if="slidesHtml" class="mt-6">
      <h2 class="text-lg font-semibold mb-2">Generated Slides</h2>
      <div class="bg-white shadow-md rounded p-4">
        <iframe
          ref="slidesFrame"
          class="w-full h-96 border"
          title="MARP Slides"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useMarp } from '~/composables/useMarp'
import { svgToDataUrl, createSvgImgTag } from '~/utils/svgUtils'

// Default R code for generating a plot
const rCode = ref(`# Create a simple scatter plot with a trend line
plot(mtcars$wt, mtcars$mpg,
     main="Car Weight vs. Miles Per Gallon",
     xlab="Weight (1000 lbs)",
     ylab="Miles Per Gallon",
     pch=19,
     col="blue")

# Add a regression line
abline(lm(mpg ~ wt, data = mtcars), col = "red", lwd = 2)

# Add a legend
legend("topright",
       legend = c("Data points", "Regression line"),
       col = c("blue", "red"),
       pch = c(19, NA),
       lty = c(NA, 1),
       lwd = c(NA, 2))`)

// State variables
const svgBase64 = ref('')
const svgContent = ref('')
const marpMarkdown = ref('')
const isGenerating = ref(false)
const isGeneratingSlides = ref(false)
const error = ref('')
const slidesHtml = ref('')
const slidesFrame = ref(null)

// Get the MARP functions
const { generateMarpSlides: generateMarpSlidesFromMarkdown, isGenerating: isMarpGenerating } = useMarp()

// Generate SVG plot from R code
const generatePlot = async () => {
  if (!rCode.value) {
    error.value = 'Please enter R code to generate a plot'
    return
  }

  isGenerating.value = true
  error.value = ''

  try {
    // Call the R Markdown API to generate an SVG
    const response = await fetch('/api/rmarkdown', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: rCode.value,
        type: 'svg'
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    // Store the SVG content and base64
    svgContent.value = data.result
    svgBase64.value = data.base64

    // Generate MARP markdown with the SVG
    marpMarkdown.value = `---
marp: true
theme: default
paginate: true
---

# SVG Test in MARP

This slide contains an SVG generated from R code.

---

## R Code

\`\`\`r
${rCode.value}
\`\`\`

---

## Standard Markdown Approach (May Not Work)

![R Plot](data:image/svg+xml;base64,${data.base64})

---

## Recommended HTML Approach

${createSvgImgTag(data.result, 'R Plot')}

---

# Thank You!

SVG integration with MARP is working correctly.
`
  } catch (err) {
    error.value = err.message || 'An error occurred while generating the plot'
    console.error('Error generating plot:', err)
  } finally {
    isGenerating.value = false
  }
}

// Generate MARP slides from the markdown
const generateMarpSlides = async () => {
  if (!marpMarkdown.value) {
    error.value = 'Please generate a plot first'
    return
  }

  isGeneratingSlides.value = true
  error.value = ''

  try {
    // Generate MARP slides
    const html = await generateMarpSlidesFromMarkdown(marpMarkdown.value, 'default', false)

    if (!html) {
      throw new Error('Failed to generate slides')
    }

    slidesHtml.value = html

    // Update the iframe with the generated HTML
    setTimeout(() => {
      if (slidesFrame.value) {
        const doc = slidesFrame.value.contentDocument
        doc.open()
        doc.write(html)
        doc.close()
      }
    }, 100)
  } catch (err) {
    error.value = err.message || 'An error occurred while generating the slides'
    console.error('Error generating slides:', err)
  } finally {
    isGeneratingSlides.value = false
  }
}

// Watch for changes in the MARP generation state
watch(isMarpGenerating, (newValue) => {
  isGeneratingSlides.value = newValue
})
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
