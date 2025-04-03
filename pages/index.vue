<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center space-y-4">
        <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 sm:text-5xl md:text-6xl">
          Research to Slides
        </h1>
        <p class="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl font-medium">
          Transform your research into beautiful presentations
        </p>
      </div>

      <div class="mt-12 max-w-2xl mx-auto">
        <div class="bg-white shadow-xl rounded-xl border border-gray-100 backdrop-blur-sm bg-white/90">
          <div class="px-8 py-8 space-y-6">
            <div>
              <label for="research" class="block text-lg font-semibold text-gray-800 mb-3">
                Enter your research topic
              </label>
              <div class="mt-2">
                <textarea
                  id="research"
                  name="research"
                  rows="6"
                  v-model="researchTopic"
                  class="shadow-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full text-base border border-gray-200 rounded-xl transition-all duration-200 ease-in-out bg-gray-50/50 px-4 py-3"
                  placeholder="Type or paste your research content here..."
                ></textarea>
              </div>
            </div>
            <div class="flex justify-end">
              <button
                type="button"
                @click="navigateToResearch"
                class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
              >
                Do Research
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-16">
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div class="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transition-all duration-200 ease-in-out hover:shadow-xl hover:-translate-y-1">
            <div class="px-6 py-6">
              <h3 class="text-lg font-semibold text-gray-900">Template Selection</h3>
              <p class="mt-3 text-base text-gray-600 leading-relaxed">
                Choose from a variety of professional presentation templates
              </p>
            </div>
          </div>
          <div class="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transition-all duration-200 ease-in-out hover:shadow-xl hover:-translate-y-1">
            <div class="px-6 py-6">
              <h3 class="text-lg font-semibold text-gray-900">Smart Generation</h3>
              <p class="mt-3 text-base text-gray-600 leading-relaxed">
                AI-powered content organization and slide creation
              </p>
            </div>
          </div>
          <div class="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transition-all duration-200 ease-in-out hover:shadow-xl hover:-translate-y-1">
            <div class="px-6 py-6">
              <h3 class="text-lg font-semibold text-gray-900">Export Options</h3>
              <p class="mt-3 text-base text-gray-600 leading-relaxed">
                Download your presentation in multiple formats
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const researchTopic = ref('')

const navigateToResearch = () => {
  console.log('Navigating to research with topic:', researchTopic.value)
  
  // Pass the research topic as a query parameter
  router.push({
    path: '/research',
    query: { topic: researchTopic.value }
  })
}
</script>