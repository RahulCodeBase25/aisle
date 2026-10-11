<script setup lang="ts">
import type { Product, ProductCard } from '~~/shared/types'
import { departmentOf, prettyCategory, FREE_SHIPPING_FROM } from '~~/shared/departments'

const route = useRoute()
const { data, error } = await useFetch<{ product: Product; related: ProductCard[] }>(`/api/products/${route.params.id}`)
if (error.value) throw createError({ statusCode: 404, statusMessage: 'Product not found', fatal: true })

const p = computed(() => data.value!.product)
const dept = computed(() => departmentOf(p.value.category))
const active = ref(0)
const qty = ref(1)
const cart = useCart()
const toast = useToast()
const router = useRouter()

const card = computed<ProductCard>(() => ({
  id: p.value.id, title: p.value.title, slug: p.value.slug, category: p.value.category, price: p.value.price,
  discountPercentage: p.value.discountPercentage, salePrice: p.value.salePrice, rating: p.value.rating,
  stock: p.value.stock, brand: p.value.brand, thumbnail: p.value.thumbnail,
}))

function add() {
  cart.add(card.value, qty.value)
  toast.add({ title: `Added ${qty.value} to cart`, description: p.value.title, icon: 'i-lucide-check', actions: [{ label: 'View cart', onClick: () => { cart.open = true } }] })
}
function buyNow() { cart.add(card.value, qty.value); router.push('/checkout') }

const ratingBars = computed(() => {
  const r = p.value.reviews ?? []
  return [5, 4, 3, 2, 1].map(n => ({ n, pct: r.length ? Math.round(r.filter(x => x.rating === n).length / r.length * 100) : 0 }))
})

// Zoom: the main image follows the pointer
const zoom = reactive({ on: false, x: 50, y: 50 })
function onMove(e: PointerEvent) {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  zoom.x = ((e.clientX - r.left) / r.width) * 100
  zoom.y = ((e.clientY - r.top) / r.height) * 100
}

useSeoMeta({
  title: () => `${p.value.title} · Aisle`,
  description: () => p.value.description,
  ogImage: () => p.value.thumbnail,
})
useHead({
  script: [{ type: 'application/ld+json', innerHTML: () => JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product', name: p.value.title, image: p.value.images, description: p.value.description, brand: p.value.brand,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: p.value.rating, reviewCount: p.value.reviews?.length ?? 0 },
    offers: { '@type': 'Offer', price: p.value.salePrice, priceCurrency: 'USD', availability: p.value.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
  }) }],
})
</script>

<template>
  <UContainer v-if="data" class="py-10">
    <UBreadcrumb :items="[
      { label: 'Home', to: '/' },
      ...(dept ? [{ label: dept.name, to: { path: '/shop', query: { dept: dept.slug } } }] : []),
      { label: prettyCategory(p.category), to: { path: '/shop', query: { category: p.category } } },
      { label: p.title },
    ]" />

    <div class="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      <!-- Gallery -->
      <div class="lg:sticky lg:top-36 lg:self-start">
        <div
          class="relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl bg-elevated ring-1 ring-default"
          @pointerenter="zoom.on = true" @pointerleave="zoom.on = false" @pointermove="onMove"
        >
          <Transition name="fade" mode="out-in">
            <NuxtImg
              :key="active" :src="p.images[active] || p.thumbnail" :alt="p.title" width="800" height="800" loading="eager"
              class="size-full object-contain p-8 transition-transform duration-200"
              :style="zoom.on ? { transform: 'scale(1.9)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : {}"
            />
          </Transition>
          <UBadge v-if="p.discountPercentage >= 1" color="secondary" variant="solid" class="absolute left-4 top-4 rounded-full">−{{ Math.round(p.discountPercentage) }}%</UBadge>
        </div>
        <div v-if="p.images.length > 1" class="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
          <button
            v-for="(img, i) in p.images" :key="img" :aria-label="`Image ${i + 1}`" :aria-pressed="i === active"
            class="size-20 shrink-0 overflow-hidden rounded-2xl bg-elevated ring-1 transition"
            :class="i === active ? 'ring-2 ring-primary-600' : 'ring-default opacity-70 hover:opacity-100'"
            @click="active = i"
          >
            <NuxtImg :src="img" alt="" width="160" height="160" class="size-full object-contain p-1.5" />
          </button>
        </div>
      </div>

      <!-- Details -->
      <div>
        <p class="text-sm font-semibold text-primary-700 dark:text-primary-400">{{ p.brand || prettyCategory(p.category) }}</p>
        <h1 class="font-display mt-2 text-4xl font-semibold leading-tight sm:text-5xl">{{ p.title }}</h1>
        <a href="#reviews" class="mt-3 inline-block"><Stars :value="p.rating" size="md" :count="p.reviews?.length" /></a>

        <Price class="mt-6" size="lg" :price="p.price" :sale="p.salePrice" :discount="p.discountPercentage" />
        <p v-if="p.discountPercentage >= 1" class="mt-1 text-sm text-secondary-700 dark:text-secondary-400">You save {{ money(p.price - p.salePrice) }}</p>

        <p class="mt-6 text-lg leading-relaxed text-muted">{{ p.description }}</p>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <UInputNumber v-model="qty" :min="1" :max="Math.max(1, Math.min(p.stock, 20))" size="lg" class="w-32" aria-label="Quantity" />
          <UButton size="xl" icon="i-lucide-shopping-bag" label="Add to cart" :disabled="p.stock <= 0" class="flex-1 justify-center sm:flex-none" @click="add" />
          <UButton size="xl" color="neutral" variant="outline" label="Buy now" :disabled="p.stock <= 0" class="flex-1 justify-center sm:flex-none" @click="buyNow" />
        </div>
        <p class="mt-3 text-sm" :class="p.stock > 10 ? 'text-primary-700 dark:text-primary-400' : p.stock > 0 ? 'text-secondary-700 dark:text-secondary-400' : 'text-error'">
          <UIcon name="i-lucide-circle-dot" class="mr-1 align-[-2px]" />
          {{ p.stock > 10 ? 'In stock' : p.stock > 0 ? `Only ${p.stock} left` : 'Out of stock' }}
        </p>

        <div class="mt-8 divide-y divide-default rounded-2xl bg-elevated ring-1 ring-default">
          <div class="flex gap-3 p-4"><UIcon name="i-lucide-truck" class="mt-0.5 size-5 shrink-0" /><div><p class="font-medium">{{ p.shippingInformation || 'Ships in 4–6 business days' }}</p><p class="text-sm text-muted">Free standard shipping on orders over {{ money(FREE_SHIPPING_FROM) }}.</p></div></div>
          <div class="flex gap-3 p-4"><UIcon name="i-lucide-rotate-ccw" class="mt-0.5 size-5 shrink-0" /><p class="font-medium">{{ p.returnPolicy || '30 days return policy' }}</p></div>
          <div class="flex gap-3 p-4"><UIcon name="i-lucide-shield" class="mt-0.5 size-5 shrink-0" /><p class="font-medium">{{ p.warrantyInformation || 'Manufacturer warranty' }}</p></div>
        </div>

        <div v-if="p.tags.length" class="mt-6 flex flex-wrap gap-2">
          <UBadge v-for="t in p.tags" :key="t" color="neutral" variant="soft" class="rounded-full capitalize">{{ t }}</UBadge>
        </div>
      </div>
    </div>

    <!-- Reviews -->
    <section id="reviews" class="mt-20 scroll-mt-40 grid gap-10 lg:grid-cols-[18rem_1fr]">
      <div>
        <h2 class="font-display text-3xl font-semibold">Reviews</h2>
        <p class="font-display mt-4 text-6xl">{{ p.rating.toFixed(1) }}</p>
        <Stars :value="p.rating" size="md" class="mt-1" />
        <div class="mt-6 space-y-2">
          <div v-for="b in ratingBars" :key="b.n" class="flex items-center gap-3 text-sm">
            <span class="w-6 tabular-nums">{{ b.n }}★</span><UProgress :model-value="b.pct" size="sm" class="flex-1" /><span class="w-10 text-right tabular-nums text-muted">{{ b.pct }}%</span>
          </div>
        </div>
      </div>
      <ul class="space-y-4">
        <li v-for="r in p.reviews" :key="r.date + r.reviewerName" class="rounded-2xl bg-elevated p-5 ring-1 ring-default">
          <div class="flex items-center justify-between gap-3">
            <UUser :name="r.reviewerName" :description="new Date(r.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })" :avatar="{ alt: r.reviewerName }" />
            <Stars :value="r.rating" />
          </div>
          <p class="mt-3">{{ r.comment }}</p>
        </li>
      </ul>
    </section>

    <!-- Related -->
    <section v-if="data.related.length" class="mt-20">
      <h2 class="font-display text-3xl font-semibold">More in {{ prettyCategory(p.category) }}</h2>
      <div class="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
        <ProductCard v-for="r in data.related.slice(0, 4)" :key="r.id" :product="r" />
      </div>
    </section>
  </UContainer>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
