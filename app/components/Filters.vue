<script setup lang="ts">
import type { CatalogResult } from '~~/shared/types'

const props = defineProps<{ facets?: CatalogResult['facets'] }>()
const route = useRoute()
const router = useRouter()

const asList = (v: unknown) => (v ? String(v).split(',').filter(Boolean) : [])

// Every filter lives in the URL, so results can be shared, refreshed and go back/forward
function set(patch: Record<string, string | number | undefined | null>) {
  const query: Record<string, any> = { ...route.query, ...patch, page: undefined }
  for (const k of Object.keys(query)) if (query[k] === undefined || query[k] === null || query[k] === '') delete query[k]
  router.replace({ query })
}
const toggleIn = (key: 'category' | 'brand', value: string) => {
  const cur = asList(route.query[key])
  const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value]
  set({ [key]: next.join(',') })
}

const showAllBrands = ref(false)
const brands = computed(() => (showAllBrands.value ? props.facets?.brands : props.facets?.brands.slice(0, 8)) ?? [])

// Price slider: local while dragging, written to the URL when released
const bounds = computed(() => props.facets?.price ?? { min: 0, max: 0 })
const price = ref<number[]>([0, 0])
watch([bounds, () => route.query.min, () => route.query.max], () => {
  price.value = [Number(route.query.min ?? bounds.value.min), Number(route.query.max ?? bounds.value.max)]
}, { immediate: true })
const commitPrice = () => set({
  min: price.value[0] > bounds.value.min ? price.value[0] : undefined,
  max: price.value[1] < bounds.value.max ? price.value[1] : undefined,
})
</script>

<template>
  <div class="space-y-8">
    <section v-if="facets?.categories.length">
      <h3 class="mb-3 text-sm font-semibold">Category</h3>
      <ul class="space-y-2">
        <li v-for="c in facets.categories" :key="c.value">
          <UCheckbox
            :model-value="asList(route.query.category).includes(c.value)" :label="c.label"
            :ui="{ label: 'flex-1' }" @update:model-value="toggleIn('category', c.value)"
          >
            <template #label><span class="flex w-full justify-between gap-2"><span>{{ c.label }}</span><span class="text-muted tabular-nums">{{ c.count }}</span></span></template>
          </UCheckbox>
        </li>
      </ul>
    </section>

    <section v-if="bounds.max > bounds.min">
      <h3 class="mb-4 text-sm font-semibold">Price</h3>
      <USlider v-model="price" :min="bounds.min" :max="bounds.max" :step="1" @change="commitPrice" />
      <div class="mt-3 flex justify-between text-sm tabular-nums text-muted"><span>{{ money(price[0]) }}</span><span>{{ money(price[1]) }}</span></div>
    </section>

    <section>
      <h3 class="mb-3 text-sm font-semibold">Customer rating</h3>
      <URadioGroup
        :model-value="String(route.query.rating ?? '')"
        :items="[{ label: 'Any rating', value: '' }, { label: '4.5 and up', value: '4.5' }, { label: '4 and up', value: '4' }, { label: '3 and up', value: '3' }]"
        @update:model-value="v => set({ rating: String(v) })"
      />
    </section>

    <section class="space-y-3">
      <USwitch :model-value="route.query.deals === '1'" label="On sale (15% off or more)" @update:model-value="v => set({ deals: v ? '1' : undefined })" />
      <USwitch :model-value="route.query.inStock === '1'" label="In stock only" @update:model-value="v => set({ inStock: v ? '1' : undefined })" />
    </section>

    <section v-if="facets?.brands.length">
      <h3 class="mb-3 text-sm font-semibold">Brand</h3>
      <ul class="space-y-2">
        <li v-for="b in brands" :key="b.value">
          <UCheckbox :model-value="asList(route.query.brand).includes(b.value)" :ui="{ label: 'flex-1' }" @update:model-value="toggleIn('brand', b.value)">
            <template #label><span class="flex w-full justify-between gap-2"><span>{{ b.label }}</span><span class="text-muted tabular-nums">{{ b.count }}</span></span></template>
          </UCheckbox>
        </li>
      </ul>
      <UButton v-if="facets.brands.length > 8" variant="link" color="neutral" size="sm" class="mt-2 px-0" :label="showAllBrands ? 'Show fewer' : `Show all ${facets.brands.length}`" @click="showAllBrands = !showAllBrands" />
    </section>
  </div>
</template>
