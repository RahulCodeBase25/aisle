<script setup lang="ts">
import type { NuxtError } from '#app'
const props = defineProps<{ error: NuxtError }>()
</script>
<template>
  <UApp>
    <NuxtLayout>
      <UContainer class="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
        <p class="font-display text-8xl text-primary-700 dark:text-primary-400">{{ props.error.statusCode }}</p>
        <h1 class="font-display text-4xl font-semibold">{{ props.error.statusCode === 404 ? 'This aisle is empty.' : 'Something went wrong.' }}</h1>
        <p class="text-muted">{{ props.error.statusCode === 404 ? 'The page or product you’re looking for isn’t here.' : props.error.statusMessage }}</p>
        <UButton label="Back to the store" @click="clearError({ redirect: '/' })" />
      </UContainer>
    </NuxtLayout>
  </UApp>
</template>
