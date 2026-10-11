<script setup lang="ts">
const route = useRoute()
const order = ref<any>(null)
const missing = ref(false)

onMounted(() => {
  try { order.value = JSON.parse(sessionStorage.getItem(`aisle-order-${route.params.id}`) || 'null') } catch { /* ignore */ }
  missing.value = !order.value
})

const eta = computed(() => order.value && new Date(`${order.value.eta}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }))
useSeoMeta({ title: 'Order placed · Aisle', robots: 'noindex' })
</script>

<template>
  <UContainer class="py-16">
    <div v-if="order" class="mx-auto max-w-2xl">
      <div class="flex size-16 items-center justify-center rounded-full bg-primary-700 text-white"><UIcon name="i-lucide-check" class="size-8" /></div>
      <p class="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-primary-700 dark:text-primary-400">Order {{ order.id }}</p>
      <h1 class="font-display mt-2 text-5xl font-semibold">Thank you, {{ order.shipTo.name.split(' ')[0] }}.</h1>
      <p class="mt-4 text-lg text-muted">Arriving by <b class="text-default">{{ eta }}</b> in {{ order.shipTo.city }}, {{ order.shipTo.state }}. (It’s a demo, so it won’t really.)</p>

      <UCard class="mt-10">
        <ul class="divide-y divide-default">
          <li v-for="l in order.lines" :key="l.id" class="flex items-center gap-4 py-3">
            <NuxtImg :src="l.thumbnail" :alt="l.title" width="56" height="56" class="size-14 rounded-xl bg-elevated object-contain p-1" />
            <span class="flex-1">{{ l.title }} <span class="text-muted">× {{ l.qty }}</span></span>
            <span class="tabular-nums">{{ money(l.total) }}</span>
          </li>
        </ul>
        <USeparator class="my-3" />
        <dl class="space-y-1.5 text-sm">
          <div class="flex justify-between"><dt class="text-muted">Subtotal</dt><dd class="tabular-nums">{{ money(order.subtotal) }}</dd></div>
          <div class="flex justify-between"><dt class="text-muted">Shipping</dt><dd class="tabular-nums">{{ order.shipping ? money(order.shipping) : 'Free' }}</dd></div>
          <div class="flex justify-between"><dt class="text-muted">Tax</dt><dd class="tabular-nums">{{ money(order.tax) }}</dd></div>
          <div class="flex justify-between pt-2 text-base font-semibold"><dt>Total charged (not really)</dt><dd class="tabular-nums">{{ money(order.total) }}</dd></div>
        </dl>
      </UCard>
      <UButton to="/shop" size="lg" class="mt-8" label="Keep shopping" trailing-icon="i-lucide-arrow-right" />
    </div>
    <div v-else-if="missing" class="flex flex-col items-center gap-4 py-24 text-center">
      <p class="font-display text-3xl">We can’t find that order.</p>
      <p class="text-muted">Order receipts are only kept in the tab you placed them in.</p>
      <UButton to="/" label="Back to the store" />
    </div>
  </UContainer>
</template>
