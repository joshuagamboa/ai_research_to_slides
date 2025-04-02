<template>
  <div class="research-form">
    <h2>Research Topic</h2>
    <form @submit.prevent="handleSubmit" data-test="research-form">
      <InputField
        v-model="topic"
        label="Main Topic"
        placeholder="Enter your research topic"
        required
        :error="topicError"
        data-test="topic-input"
      />
      
      <div class="subtopics-container">
        <div class="subtopics-header">
          <h3>Subtopics</h3>
          <Button 
            @click="addSubtopic" 
            type="button" 
            variant="btn-outline"
            data-test="add-subtopic"
          >
            Add Subtopic
          </Button>
        </div>
        
        <div v-for="(subtopic, index) in subtopics" :key="index" class="subtopic-row">
          <InputField
            v-model="subtopics[index]"
            :label="`Subtopic ${index + 1}`"
            placeholder="Enter a subtopic"
            data-test="subtopic-input"
          />
          <Button 
            @click="removeSubtopic(index)" 
            type="button" 
            variant="btn-danger"
            :disabled="subtopics.length <= 1"
            data-test="remove-subtopic"
          >
            Remove
          </Button>
        </div>
      </div>
      
      <div class="form-actions">
        <Button 
          type="submit" 
          variant="btn-primary" 
          :loading="isLoading"
          :disabled="!isValid"
          data-test="submit-button"
        >
          {{ isLoading ? 'Researching...' : 'Start Research' }}
        </Button>
        <p v-if="error" class="error-message" data-test="error-message">{{ error }}</p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useResearch } from '~/composables/useResearch'
import Button from '~/components/atoms/Button.vue'
import InputField from '~/components/atoms/InputField.vue'

const props = defineProps({
  initialTopic: {
    type: String,
    default: ''
  },
  initialSubtopics: {
    type: Array as () => string[],
    default: () => ['']
  }
})

const emit = defineEmits(['research-complete'])

const { conductResearch, isLoading, error } = useResearch()

const topic = ref(props.initialTopic)
const subtopics = ref(props.initialSubtopics.length ? [...props.initialSubtopics] : [''])
const topicError = ref('')

const addSubtopic = () => {
  subtopics.value.push('')
}

const removeSubtopic = (index: number) => {
  if (subtopics.value.length > 1) {
    subtopics.value.splice(index, 1)
  }
}

const isValid = computed(() => {
  return topic.value.trim().length > 0
})

const handleSubmit = async () => {
  // Reset error state
  topicError.value = ''
  
  // Validate topic
  if (!topic.value.trim()) {
    topicError.value = 'Please enter a research topic'
    return
  }
  
  // Filter out empty subtopics
  const filteredSubtopics = subtopics.value.filter(st => st.trim())
  
  // Ensure at least one subtopic
  if (filteredSubtopics.length === 0) {
    filteredSubtopics.push('General overview')
  }
  
  try {
    await conductResearch(topic.value, filteredSubtopics)
    emit('research-complete')
  } catch (err: any) {
    console.error('Research error:', err)
  }
}
</script>

<style scoped>
.research-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtopics-container {
  margin: 1.5rem 0;
}

.subtopics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.subtopic-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.subtopic-row .input-field {
  flex: 1;
}

.form-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}
</style>