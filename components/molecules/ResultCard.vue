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
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.card-date {
  font-size: 0.75rem;
  color: #6c757d;
}

.card-meta {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.card-summary {
  margin-bottom: 1rem;
}

.subtopics-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.subtopic-tag {
  background-color: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.card-content {
  padding: 1.5rem;
  color: #2c3e50;
  line-height: 1.6;
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
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.view-button:hover {
  background-color: #2980b9;
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