<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <nav class="bg-white shadow-md backdrop-blur-sm bg-white/90 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <NuxtLink to="/" class="flex items-center">
                <img class="h-10 w-auto transition-transform hover:scale-105" src="/logo.svg" alt="Logo" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <NuxtPage />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToResearch = () => {
  router.push('/research')
}
</script>

<style>
/* Add any custom styles here */
@import "tailwindcss";
</style>
