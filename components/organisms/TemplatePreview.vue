<template>
  <div class="template-preview">
    <h2>Select a Template</h2>
    <div class="templates-grid">
      <div
        v-for="(template, index) in templates"
        :key="template.name"
        class="template-card"
        :class="{ 'selected': selectedIndex === index }"
        @click="selectTemplate(index)"
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
import { ref, onMounted } from 'vue'
import { useMarp } from '~/composables/useMarp'
import Button from '~/components/atoms/Button.vue'

const emit = defineEmits(['template-selected'])

const { templates, loadRandomTemplates, selectTemplate: setTemplate } = useMarp()
const selectedIndex = ref<number | null>(null)

const selectTemplate = (index: number) => {
  selectedIndex.value = index
  setTemplate(index)
}

const refreshTemplates = () => {
  loadRandomTemplates()
  selectedIndex.value = null
}

const confirmSelection = () => {
  if (selectedIndex.value !== null) {
    emit('template-selected', templates.value[selectedIndex.value])
  }
}

onMounted(() => {
  loadRandomTemplates()
})
</script>

<style scoped>
.template-preview {
  padding: 1.5rem;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.template-card {
  border: 2px solid transparent;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-card.selected {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.preview-box {
  height: 200px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.template-info {
  padding: 1rem;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.template-name {
  font-weight: 600;
  color: #2c3e50;
}

.template-theme {
  font-size: 0.875rem;
  color: #6c757d;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>