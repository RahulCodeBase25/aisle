<script setup lang="ts">
import type { ProductCard } from '~~/shared/types'
import { DEPARTMENTS } from '~~/shared/departments'

const open = defineModel<boolean>('open', { default: false })
const term = ref('')
const debounced = useDebounced(term, 180)
const router = useRouter()

const { data, status } = await useFetch<ProductCard[]>('/api/search', {
  query: { q: debounced }, default: () => [], server: false, immediate: false, watch: [debounced],
})

const groups = computed(() => {
  const results = (term.value.trim().length >= 2 ? data.value : []).map(p => ({
    label: p.title,
    suffix: money(p.salePrice),
    avatar: { src: p.thumbnail, alt: '' },
    onSelect: () => { open.value = false; router.push(productLink(p)) },
  }))
  const g: any[] = []
  if (results.length) g.push({ id: 'products', label: 'Products', items: results, ignoreFilter: true })
  if (term.value.trim().length >= 2) {
    g.push({ id: 'all', items: [{ label: `See all results for “${term.value.trim()}”`, icon: 'i-lucide-search', onSelect: () => { open.value = false; router.push({ path: '/shop', query: { q: term.value.trim() } }) } }], ignoreFilter: true })
  }
  g.push({ id: 'depts', label: 'Departments', items: DEPARTMENTS.map(d => ({ label: d.name, icon: d.icon, onSelect: () => { open.value = false; router.push({ path: '/shop', query: { dept: d.slug } }) } })) })
  return g
})

watch(open, (v) => { if (!v) term.value = '' })
</script>

<template>
  <UModal v-model:open="open" :ui="{ content: 'sm:max-w-2xl' }" title="Search the store" description="Find products by name, brand or category">
    <template #content>
      <UCommandPalette
        v-model:search-term="term"
        :groups="groups"
        :loading="status === 'pending'"
        placeholder="Search for headphones, perfume, a sofa…"
        class="h-[min(70vh,32rem)]"
        :close="true"
        @update:open="open = $event"
      />
    </template>
  </UModal>
</template>
