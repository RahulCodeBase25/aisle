<template>
  <UApp :toaster="{ position: 'bottom-right' }">
    <NuxtLoadingIndicator color="var(--color-secondary-500)" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
