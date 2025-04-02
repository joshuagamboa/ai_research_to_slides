<template>
  <div class="result-card">
    <div class="card-header">
      <h3 class="card-title">{{ title }}</h3>
      <span class="card-timestamp" v-if="timestamp">
        {{ formatDate(timestamp) }}
      </span>
    </div>
    
    <div class="card-content">
      <div v-if="contentType === 'markdown'" v-html="renderedContent"></div>
      <pre v-else-if="contentType === 'code'">{{ content }}</pre>
      <p v-else>{{ content }}</p>
    </div>
    
    <div class="card-actions" v-if="$slots.actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '~/utils/markdown'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    default: 'text',
    validator: (value: string) => ['text', 'markdown', 'code'].includes(value)
  },
  timestamp: {
    type: String,
    default: ''
  }
})

const renderedContent = computed(() => {
  if (props.contentType === 'markdown') {
    return renderMarkdown(props.content)
  }
  return props.content
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

.card-timestamp {
  font-size: 0.75rem;
  color: #6c757d;
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