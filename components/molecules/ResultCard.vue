<template>
  <div class="result-card">
    <div class="card-header">
      <h3 class="card-title">{{ title }}</h3>
      <span class="card-date" v-if="result.timestamp">
        {{ formatDate(result.timestamp) }}
      </span>
    </div>
    
    <div class="card-content">
      <div class="card-meta">{{ result.topic }}</div>
      <div class="card-summary" v-html="summary"></div>
      
      <div class="subtopics-container" v-if="result.subtopics && result.subtopics.length > 0">
        <span class="subtopic-tag" v-for="subtopic in result.subtopics" :key="subtopic">
          {{ subtopic }}
        </span>
      </div>
    </div>
    
    <div class="card-actions">
      <button 
        class="view-button" 
        @click="viewDetails"
        data-test="view-details"
      >
        View Details
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown, extractTitle, createSummary } from '~/utils/markdown'
import type { ResearchResult } from '~/types/research'

const emit = defineEmits(['view-details'])

const props = defineProps({
  result: {
    type: Object as () => ResearchResult,
    required: true
  }
})

const title = computed(() => {
  return extractTitle(props.result.content) || props.result.topic
})

const summary = computed(() => {
  return createSummary(props.result.content)
})

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (e) {
    return dateString
  }
}

const viewDetails = () => {
  emit('view-details', props.result)
}
</script>

<style scoped>
.result-card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.result-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card-header {
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid #edf2f7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
}

.card-title {
  margin: 0;
  font-size: 1.375rem;
  color: #1a202c;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.card-date {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.card-meta {
  font-size: 0.9375rem;
  color: #4a5568;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.card-summary {
  margin-bottom: 1.5rem;
  line-height: 1.7;
  color: #2d3748;
}

.subtopics-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  margin-top: 1.25rem;
}

.subtopic-tag {
  background-color: #edf2f7;
  color: #2d3748;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.subtopic-tag:hover {
  background-color: #e2e8f0;
  transform: translateY(-1px);
}

.card-content {
  padding: 1.75rem;
  color: #2d3748;
  line-height: 1.7;
}

.card-content pre {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
  overflow-x: auto;
  font-family: monospace;
  font-size: 0.875rem;
}

.card-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eaeaea;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.view-button {
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.625rem 1.25rem;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.view-button:hover {
  background-color: #3182ce;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.view-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Style for rendered markdown content */
.card-content :deep(h1),
.card-content :deep(h2),
.card-content :deep(h3),
.card-content :deep(h4),
.card-content :deep(h5),
.card-content :deep(h6) {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #2c3e50;
}

.card-content :deep(p) {
  margin-bottom: 1rem;
}

.card-content :deep(ul),
.card-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.card-content :deep(li) {
  margin-bottom: 0.5rem;
}

.card-content :deep(a) {
  color: #3498db;
  text-decoration: none;
}

.card-content :deep(a:hover) {
  text-decoration: underline;
}

.card-content :deep(blockquote) {
  border-left: 4px solid #eaeaea;
  padding-left: 1rem;
  color: #6c757d;
  font-style: italic;
  margin: 1rem 0;
}

.card-content :deep(code) {
  background-color: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875rem;
}

.card-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.card-content :deep(th),
.card-content :deep(td) {
  padding: 0.5rem;
  border: 1px solid #eaeaea;
}

.card-content :deep(th) {
  background-color: #f8f9fa;
  font-weight: bold;
}
</style>