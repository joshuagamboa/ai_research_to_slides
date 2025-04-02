<template>
  <button
    :class="[
      'btn',
      variant,
      { 'btn-block': block, 'btn-loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="loader"></span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'btn-primary',
    validator: (value: string) => [
      'btn-primary',
      'btn-secondary',
      'btn-outline',
      'btn-danger',
      'btn-success'
    ].includes(value)
  },
  block: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #7f8c8d;
}

.btn-outline {
  background-color: transparent;
  border-color: #3498db;
  color: #3498db;
}

.btn-outline:hover:not(:disabled) {
  background-color: #3498db;
  color: white;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn-success {
  background-color: #2ecc71;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #27ae60;
}

.btn-block {
  display: flex;
  width: 100%;
}

.btn-loading {
  position: relative;
  color: transparent;
}

.loader {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  position: absolute;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>