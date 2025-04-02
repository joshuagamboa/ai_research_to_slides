<template>
  <div class="results-container">
    <!-- Results list section -->
    <section v-if="results && results.length > 0" class="results-list">
      <div v-for="result in filteredAndSortedResults" :key="result.timestamp">
        <ResultCard 
          :result="result" 
          @view-details="onSelectResult"
          data-testid="result-card"
        />
      </div>
    </section>
    
    <!-- No results message -->
    <section v-else-if="results && results.length === 0" class="no-results" data-testid="no-results">
      <p>No results found. Try adjusting your search criteria.</p>
    </section>
    
    <section v-if="researchResults" class="research-section">
      <h2>Research Results</h2>
      <div v-html="renderedResults" class="research-content" />
    </section>
    
    <section v-if="presentationOutline" class="presentation-section">
      <div class="presentation-controls">
        <h2>Presentation Outline</h2>
        <div class="button-group">
          <Button @click="downloadOutline">Download R Markdown</Button>
          <Button @click="showTemplateSelector = true">Generate Slides</Button>
        </div>
      </div>
      <pre class="outline-content">{{ presentationOutline }}</pre>
      
      <TemplatePreview
        v-if="showTemplateSelector"
        @template-selected="generateSlides"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { renderMarkdown } from '~/utils/markdown'
import { useMarp } from '~/composables/useMarp'
import Button from '~/components/atoms/Button.vue'
import ResultCard from '~/components/molecules/ResultCard.vue'
import TemplatePreview from '~/components/organisms/TemplatePreview.vue'
import type { MarpTemplate, ResearchResult } from '~/types/research'

const emit = defineEmits(['select-result'])

const props = defineProps<{
  results?: ResearchResult[];
  researchResults?: string;
  presentationOutline?: string;
  filterText?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}>()

const showTemplateSelector = ref(false)
const { generateMarpSlides, isGenerating, error } = useMarp()

const renderedResults = computed(() => {
  return props.researchResults ? renderMarkdown(props.researchResults) : ''
})

const filteredAndSortedResults = computed(() => {
  if (!props.results) return []
  
  // Filter results
  let filtered = props.results
  if (props.filterText) {
    const filterLower = props.filterText.toLowerCase()
    filtered = filtered.filter(result => {
      return (
        result.topic.toLowerCase().includes(filterLower) ||
        result.content.toLowerCase().includes(filterLower) ||
        result.subtopics.some(subtopic => subtopic.toLowerCase().includes(filterLower))
      )
    })
  }
  
  // Sort results
  if (props.sortBy) {
    filtered = [...filtered].sort((a, b) => {
      const aValue = a[props.sortBy as keyof ResearchResult]
      const bValue = b[props.sortBy as keyof ResearchResult]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return props.sortDirection === 'desc'
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue)
      }
      
      return 0
    })
  }
  
  return filtered
})

const onSelectResult = (result: ResearchResult) => {
  emit('select-result', result)
}

const downloadOutline = () => {
  if (!props.presentationOutline) return
  
  const blob = new Blob([props.presentationOutline], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'presentation_outline.Rmd'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const generateSlides = async (template: MarpTemplate) => {
  if (!props.presentationOutline) return
  
  showTemplateSelector.value = false
  const marpContent = await generateMarpSlides(props.presentationOutline)
  
  if (marpContent) {
    const blob = new Blob([marpContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    
    const newWindow = window.open(url, '_blank')
    if (!newWindow) {
      alert('Popup blocked. Please allow popups for this site.')
    }
  }
}
</script>

<style scoped>
.results-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem;
}

.research-section,
.presentation-section {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.presentation-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.button-group {
  display: flex;
  gap: 1rem;
}

.research-content {
  line-height: 1.6;
}

.outline-content {
  background-color: #f8f9fa;
  border-radius: 0.25rem;
  padding: 1rem;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  max-height: 400px;
  overflow-y: auto;
}
</style>