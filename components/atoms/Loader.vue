<template>
  <div class="loader" :class="{ 'inline': inline, [`loader-${size}`]: size }" :aria-label="label || 'Loading'">
    <div class="loader-spinner" :style="{ width: `${size}px`, height: `${size}px` }"></div>
    <p v-if="text" class="loader-text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  size: {
    type: [Number, String],
    default: 40
  },
  text: {
    type: String,
    default: ''
  },
  inline: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.loader.inline {
  display: inline-flex;
  padding: 0;
}

.loader-spinner {
  border: 3px solid rgba(52, 152, 219, 0.3);
  border-radius: 50%;
  border-top: 3px solid #3498db;
  animation: spin 1s linear infinite;
}

.loader-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.loader-large {
  font-size: 1.25rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>