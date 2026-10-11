<script setup lang="ts">
import type { ProductCard } from '~~/shared/types'
import { DEPARTMENTS } from '~~/shared/departments'

const { data } = await useFetch<{
  deals: ProductCard[]; topRated: ProductCard[]; total: number
  departments: { slug: string; count: number; cover: string[] }[]
}>('/api/home')

const hero = computed(() => [...(data.value?.topRated.slice(0, 3) ?? []), ...(data.value?.deals.slice(1, 4) ?? [])])
const depts = computed(() => DEPARTMENTS.map(d => ({ ...d, ...data.value?.departments.find(x => x.slug === d.slug) })))
const brands = computed(() => [...new Set([...(data.value?.deals ?? []), ...(data.value?.topRated ?? [])].map(p => p.brand).filter(Boolean))])

useSeoMeta({ title: 'Aisle — a better place to shop' })
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <UContainer class="grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-20">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-primary-700 dark:text-primary-400">New season · up to 30% off</p>
          <h1 class="font-display mt-4 text-[clamp(2.8rem,6.5vw,5.4rem)] font-semibold leading-[0.95]">
            Everything you need,<br><em class="font-normal italic text-primary-700 dark:text-primary-400">one aisle</em> away.
          </h1>
          <p class="mt-6 max-w-lg text-lg text-muted">
            {{ data?.total ?? 194 }} hand-picked products across tech, home, beauty and style. Search anything with
            <UKbd value="meta" /> <UKbd value="K" />, filter by what matters, and check out in three steps.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton to="/shop" size="xl" label="Shop everything" trailing-icon="i-lucide-arrow-right" />
            <UButton to="/shop?deals=1&sort=discount" size="xl" color="neutral" variant="outline" label="Today's deals" icon="i-lucide-badge-percent" />
          </div>
        </div>

        <div class="relative" aria-hidden="true">
          <div class="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-primary-100 via-[var(--ui-bg-muted)] to-secondary-100 dark:from-primary-950 dark:to-secondary-950" />
          <div class="relative grid grid-cols-3 gap-3 p-4 sm:gap-4">
            <NuxtLink
              v-for="(p, i) in hero.slice(0, 6)" :key="p.id" :to="productLink(p)" tabindex="-1"
              class="float rounded-3xl bg-elevated p-3 shadow-xl shadow-black/5 ring-1 ring-default transition hover:scale-[1.04]"
              :class="i % 3 === 1 ? 'translate-y-8' : i % 3 === 2 ? 'translate-y-3' : ''"
              :style="{ animationDelay: `${i * -1.1}s` }"
            >
              <NuxtImg :src="p.thumbnail" :alt="p.title" width="300" height="300" loading="eager" class="aspect-square w-full object-contain" />
              <p class="mt-1 truncate px-1 text-xs font-medium">{{ p.title }}</p>
              <p class="px-1 text-xs tabular-nums text-muted">{{ money(p.salePrice) }}</p>
            </NuxtLink>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Brand marquee -->
    <div class="border-y border-default bg-elevated/60 py-4">
      <UMarquee pause-on-hover :ui="{ root: '[--gap:--spacing(12)] [--duration:40s]' }">
        <span v-for="b in brands" :key="b" class="font-display text-xl text-muted">{{ b }}</span>
      </UMarquee>
    </div>

    <!-- Departments -->
    <UContainer class="mt-20">
      <div class="flex items-end justify-between gap-4">
        <h2 class="font-display text-4xl font-semibold">Shop by department</h2>
        <UButton to="/shop" variant="link" color="neutral" trailing-icon="i-lucide-arrow-right" label="All products" />
      </div>
      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <NuxtLink
          v-for="d in depts" :key="d.slug" :to="{ path: '/shop', query: { dept: d.slug } }"
          class="group relative flex flex-col overflow-hidden rounded-3xl bg-elevated p-5 ring-1 ring-default transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
        >
          <div class="flex items-center justify-between">
            <UIcon :name="d.icon" class="size-6 text-primary-700 dark:text-primary-400" />
            <span class="text-xs text-muted">{{ d.count }} items</span>
          </div>
          <div class="relative mt-4 h-32">
            <NuxtImg
              v-for="(src, i) in d.cover" :key="src" :src="src" alt="" width="160" height="160"
              class="absolute size-24 rounded-2xl bg-default object-contain p-2 shadow-md ring-1 ring-default transition duration-500 group-hover:rotate-0"
              :class="['left-0 top-6 -rotate-6 group-hover:-translate-x-1', 'left-1/2 top-0 -translate-x-1/2 z-10', 'right-0 top-6 rotate-6 group-hover:translate-x-1'][i]"
            />
          </div>
          <p class="mt-4 font-display text-xl font-semibold">{{ d.name }}</p>
        </NuxtLink>
      </div>
    </UContainer>

    <!-- Deals -->
    <UContainer class="mt-20">
      <div class="flex items-end justify-between gap-4">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-secondary-600 dark:text-secondary-400">Biggest markdowns</p>
          <h2 class="font-display mt-1 text-4xl font-semibold">Deals worth a look</h2>
        </div>
        <UButton to="/shop?deals=1&sort=discount" variant="link" color="neutral" trailing-icon="i-lucide-arrow-right" label="See all deals" />
      </div>
      <UCarousel
        v-slot="{ item }" :items="data?.deals ?? []" arrows class="mt-8"
        :ui="{ item: 'basis-1/2 sm:basis-1/3 lg:basis-1/5 ps-4', container: '-ms-4', prev: 'start-0 sm:-start-4', next: 'end-0 sm:-end-4' }"
      >
        <ProductCard :product="item" />
      </UCarousel>
    </UContainer>

    <!-- Promise strip -->
    <UContainer class="mt-20">
      <div class="grid gap-px overflow-hidden rounded-3xl bg-[var(--ui-border)] ring-1 ring-default sm:grid-cols-3">
        <div v-for="f in [
          { i: 'i-lucide-truck', t: 'Free shipping over $75', d: 'Standard delivery in 4–6 business days, express in 1–2.' },
          { i: 'i-lucide-rotate-ccw', t: '30-day returns', d: 'Changed your mind? Send it back, no questions asked.' },
          { i: 'i-lucide-shield-check', t: 'Prices checked at checkout', d: 'Your order is priced on the server, so the total is always right.' },
        ]" :key="f.t" class="bg-elevated p-6">
          <UIcon :name="f.i" class="size-6 text-primary-700 dark:text-primary-400" />
          <p class="mt-3 font-semibold">{{ f.t }}</p>
          <p class="mt-1 text-sm text-muted">{{ f.d }}</p>
        </div>
      </div>
    </UContainer>

    <!-- Top rated -->
    <UContainer class="mt-20">
      <h2 class="font-display text-4xl font-semibold">Customers' favourites</h2>
      <div class="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
        <ProductCard v-for="p in data?.topRated ?? []" :key="p.id" :product="p" />
      </div>
    </UContainer>
  </div>
</template>

<style scoped>
.float { animation: float 7s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@media (prefers-reduced-motion: reduce) { .float { animation: none; } }
</style>
