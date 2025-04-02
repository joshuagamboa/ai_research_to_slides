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
  margin-bottom: 1rem;
  width: 100%;
}

.input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: #2c3e50;
}

.input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #2c3e50;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.input:focus {
  border-color: #3498db;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
}

.input:disabled {
  background-color: #e9ecef;
  opacity: 1;
}

.input-error {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #e74c3c;
}

.input-help {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6c757d;
}
</style>