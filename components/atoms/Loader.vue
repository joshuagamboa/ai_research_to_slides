<template>
  <div class="loader-container" :class="{ 'inline': inline }">
    <div class="loader" :style="{ width: size + 'px', height: size + 'px' }"></div>
    <p v-if="text" class="loader-text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  size: {
    type: Number,
    default: 40
  },
  text: {
    type: String,
    default: ''
  },
  inline: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.loader-container.inline {
  display: inline-flex;
  padding: 0;
}

.loader {
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>