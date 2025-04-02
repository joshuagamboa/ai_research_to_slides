<template>
  <div class="template-preview">
    <h2>Select a Template</h2>
    <div v-if="error" data-testid="error-message" class="error-message">
      {{ error }}
    </div>
    <div v-if="isGenerating" data-testid="loading-indicator" class="loading-indicator">
      <p>Generating slides...</p>
    </div>
    <div class="templates-grid">
      <div
        v-for="(template, index) in templates"
        :key="template.name"
        class="template-card"
        :class="{ 'selected': selectedIndex === index }"
        @click="selectTemplate(index)"
        data-testid="template-card"
      >
        <div 
          class="preview-box"
          :style="{
            backgroundColor: template.backgroundColor,
            color: template.textColor,
            fontFamily: template.bodyFont
          }"
        >
          <h3 :style="{
            color: template.accentColor,
            fontFamily: template.headingFont
          }">
            {{ template.name }}
          </h3>
          <p>Sample Text</p>
          <a :style="{ color: template.accentColor }">Sample Link</a>
        </div>
        <div class="template-info">
          <span class="template-name">{{ template.name }}</span>
          <span class="template-theme">Theme: {{ template.theme }}</span>
        </div>
      </div>
    </div>
    
    <div class="preview-actions">
      <Button
        @click="refreshTemplates"
        variant="btn-outline"
      >
        Refresh Templates
      </Button>
      <Button
        @click="confirmSelection"
        variant="btn-primary"
        :disabled="selectedIndex === null"
      >
        Use Selected Template
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useMarp } from '~/composables/useMarp'
import Button from '~/components/atoms/Button.vue'

const props = defineProps({
  outline: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['template-selected', 'slides-generated'])

const { templates, loadRandomTemplates, selectTemplate: setTemplate, generateMarpSlides, isGenerating, error, selectedTemplate } = useMarp()
const selectedIndex = ref<number | null>(null)

const selectTemplate = async (index: number) => {
  selectedIndex.value = index
  setTemplate(index)
  
  if (selectedTemplate.value) {
    const slides = await generateMarpSlides(props.outline)
    if (slides) {
      emit('slides-generated', slides)
    }
  }
}

const refreshTemplates = () => {
  loadRandomTemplates()
  selectedIndex.value = null
}

const confirmSelection = () => {
  if (selectedIndex.value !== null && templates.value[selectedIndex.value]) {
    const selectedTemplateData = { ...templates.value[selectedIndex.value] }
    setTemplate(selectedIndex.value)
    emit('template-selected', selectedTemplateData)
  }
}

onMounted(() => {
  loadRandomTemplates()
})
</script>

<style scoped>
.template-preview {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.template-card {
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.template-card.selected {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
}

.preview-box {
  height: 220px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  overflow: hidden;
}

.preview-box::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.1));
  pointer-events: none;
}

.template-info {
  padding: 1.25rem;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  border-top: 1px solid #edf2f7;
}

.template-name {
  font-weight: 600;
  color: #1a202c;
  font-size: 1.125rem;
  letter-spacing: -0.025em;
}

.template-theme {
  font-size: 0.9375rem;
  color: #64748b;
  font-weight: 500;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1.25rem;
  margin-top: 2rem;
}

.error-message {
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  background-color: #fff5f5;
  color: #c53030;
  border: 1px solid #feb2b2;
  border-radius: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-indicator {
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  background-color: #ebf8ff;
  color: #2b6cb0;
  border: 1px solid #bee3f8;
  border-radius: 0.5rem;
  text-align: center;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}
</style>