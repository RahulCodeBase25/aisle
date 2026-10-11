<script setup lang="ts">
defineProps<{ price: number; sale: number; discount: number; size?: 'sm' | 'lg' }>()
</script>

<template>
  <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
    <span class="font-semibold tabular-nums" :class="size === 'lg' ? 'text-3xl font-display' : 'text-lg'">{{ money(sale) }}</span>
    <template v-if="discount >= 1">
      <s class="text-sm text-muted tabular-nums">{{ money(price) }}</s>
      <span class="text-xs font-semibold text-secondary-600 dark:text-secondary-400">−{{ Math.round(discount) }}%</span>
    </template>
  </div>
</template>
