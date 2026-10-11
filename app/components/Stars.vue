<script setup lang="ts">
const props = withDefaults(defineProps<{ value: number; size?: 'sm' | 'md'; count?: number }>(), { size: 'sm' })
const pct = computed(() => `${Math.max(0, Math.min(5, props.value)) / 5 * 100}%`)
</script>

<template>
  <span class="inline-flex items-center gap-1.5" :aria-label="`Rated ${value.toFixed(1)} out of 5`">
    <span class="relative inline-block leading-none" :class="size === 'sm' ? 'text-[13px]' : 'text-base'" aria-hidden="true">
      <span class="text-neutral-300 dark:text-neutral-700">★★★★★</span>
      <span class="absolute inset-0 overflow-hidden text-amber-500" :style="{ width: pct }">★★★★★</span>
    </span>
    <span class="text-xs text-muted tabular-nums">{{ value.toFixed(1) }}<template v-if="count != null"> · {{ count }}</template></span>
  </span>
</template>
