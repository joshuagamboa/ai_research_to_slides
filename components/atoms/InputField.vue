<template>
  <div class="input-field">
    <label v-if="label" :for="id" class="input-label">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      class="input"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="input-error">{{ error }}</p>
    <p v-if="helpText" class="input-help">{{ helpText }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  }
})

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substring(2, 9)}`)

defineEmits(['update:modelValue'])
</script>

<style scoped>
.input-field {
  margin-bottom: 1.5rem;
  width: 100%;
}

.input-label {
  display: block;
  margin-bottom: 0.625rem;
  font-weight: 600;
  font-size: 0.9375rem;
  color: #1a202c;
  letter-spacing: 0.025em;
}

.input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #2d3748;
  background-color: #fff;
  background-clip: padding-box;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.input:hover {
  border-color: #cbd5e0;
}

.input:focus {
  border-color: #4299e1;
  outline: 0;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
}

.input:disabled {
  background-color: #f7fafc;
  border-color: #edf2f7;
  opacity: 0.75;
  cursor: not-allowed;
}

.input-error {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #e53e3e;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.input-help {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #718096;
  line-height: 1.4;
}
</style>