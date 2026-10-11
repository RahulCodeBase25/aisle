<script setup lang="ts">
import type { CatalogResult } from '~~/shared/types'
import { DEPARTMENTS, prettyCategory } from '~~/shared/departments'

const route = useRoute()
const router = useRouter()

const query = computed(() => ({ ...route.query, perPage: 24 }))
const { data, status, error } = await useFetch<CatalogResult>('/api/catalog', { query })

const dept = computed(() => DEPARTMENTS.find(d => d.slug === route.query.dept))
const heading = computed(() => {
  if (route.query.q) return `Results for “${route.query.q}”`
  if (route.query.deals) return 'Deals'
  return dept.value?.name ?? 'All products'
})

const sortItems = [
  { label: 'Best match', value: 'relevance' },
  { label: 'Price: low to high', value: 'price-asc' },
  { label: 'Price: high to low', value: 'price-desc' },
  { label: 'Top rated', value: 'rating' },
  { label: 'Biggest discount', value: 'discount' },
]
const setQuery = (patch: Record<string, any>) => {
  const q: Record<string, any> = { ...route.query, ...patch }
  for (const k of Object.keys(q)) if (q[k] === undefined || q[k] === '') delete q[k]
  router.replace({ query: q })
}

// Removable chips for every active filter
const chips = computed(() => {
  const q = route.query
  const out: { label: string; remove: Record<string, any> }[] = []
  if (q.q) out.push({ label: `“${q.q}”`, remove: { q: undefined } })
  for (const c of String(q.category || '').split(',').filter(Boolean)) out.push({ label: prettyCategory(c), remove: { category: String(q.category).split(',').filter(x => x !== c).join(',') || undefined } })
  for (const b of String(q.brand || '').split(',').filter(Boolean)) out.push({ label: b, remove: { brand: String(q.brand).split(',').filter(x => x !== b).join(',') || undefined } })
  if (q.min || q.max) out.push({ label: `${q.min ? money(Number(q.min)) : '$0'} – ${q.max ? money(Number(q.max)) : 'any'}`, remove: { min: undefined, max: undefined } })
  if (q.rating) out.push({ label: `${q.rating}★ and up`, remove: { rating: undefined } })
  if (q.deals) out.push({ label: 'On sale', remove: { deals: undefined } })
  if (q.inStock) out.push({ label: 'In stock', remove: { inStock: undefined } })
  return out
})

const filtersOpen = ref(false)
watch(() => route.query.page, () => import.meta.client && window.scrollTo({ top: 0, behavior: 'smooth' }))

useSeoMeta({ title: () => `${heading.value} · Aisle` })
</script>

<template>
  <UContainer class="py-10">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <UBreadcrumb :items="[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }, ...(dept ? [{ label: dept.name }] : [])]" />
        <h1 class="font-display mt-3 text-4xl font-semibold sm:text-5xl">{{ heading }}</h1>
        <p class="mt-2 text-muted" aria-live="polite">{{ data?.total ?? 0 }} products</p>
      </div>
      <div class="flex items-center gap-2">
        <UButton class="lg:hidden" icon="i-lucide-sliders-horizontal" color="neutral" variant="outline" label="Filters" @click="filtersOpen = true" />
        <USelect :model-value="String(route.query.sort || 'relevance')" :items="sortItems" class="w-48" aria-label="Sort by" @update:model-value="v => setQuery({ sort: v === 'relevance' ? undefined : v, page: undefined })" />
      </div>
    </div>

    <div v-if="chips.length" class="mt-5 flex flex-wrap items-center gap-2">
      <UButton v-for="c in chips" :key="c.label" size="xs" color="neutral" variant="soft" trailing-icon="i-lucide-x" :label="c.label" @click="setQuery({ ...c.remove, page: undefined })" />
      <UButton size="xs" variant="link" color="neutral" label="Clear all" @click="router.replace({ query: route.query.dept ? { dept: route.query.dept } : {} })" />
    </div>

    <div class="mt-8 grid gap-10 lg:grid-cols-[15rem_1fr]">
      <aside class="hidden lg:block">
        <div class="sticky top-36 max-h-[calc(100dvh-10rem)] overflow-y-auto pr-2">
          <Filters :facets="data?.facets" />
        </div>
      </aside>

      <section :class="status === 'pending' ? 'opacity-60 transition-opacity' : ''">
        <UAlert v-if="error" color="error" variant="subtle" title="Couldn't load products" :description="error.statusMessage || 'Please try again.'" />
        <div v-else-if="data && !data.items.length" class="flex flex-col items-center gap-4 py-24 text-center">
          <UIcon name="i-lucide-search-x" class="size-12 text-muted" />
          <p class="font-display text-2xl">Nothing matches those filters.</p>
          <UButton label="Clear filters" @click="router.replace({ query: {} })" />
        </div>
        <TransitionGroup v-else tag="div" name="grid" class="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
          <ProductCard v-for="(p, i) in data?.items ?? []" :key="p.id" :product="p" :eager="i < 4" />
        </TransitionGroup>
        <div v-if="(data?.pages ?? 1) > 1" class="mt-12 flex justify-center">
          <UPagination :page="data!.page" :total="data!.total" :items-per-page="24" @update:page="p => setQuery({ page: p > 1 ? p : undefined })" />
        </div>
      </section>
    </div>

    <USlideover v-model:open="filtersOpen" title="Filters" side="left">
      <template #body><Filters :facets="data?.facets" /></template>
      <template #footer><UButton block :label="`Show ${data?.total ?? 0} products`" @click="filtersOpen = false" /></template>
    </USlideover>
  </UContainer>
</template>

<style scoped>
.grid-enter-active { transition: opacity .35s ease, transform .35s ease; }
.grid-enter-from { opacity: 0; transform: translateY(10px); }
</style>
