<script setup lang="ts">
import type { ProductCard } from '~~/shared/types'
import { prettyCategory } from '~~/shared/departments'

const props = defineProps<{ product: ProductCard; eager?: boolean }>()
const cart = useCart()
const toast = useToast()
const added = ref(false)

function add() {
  cart.add(props.product)
  added.value = true
  setTimeout(() => (added.value = false), 1400)
  toast.add({ title: 'Added to cart', description: props.product.title, icon: 'i-lucide-check', color: 'primary', actions: [{ label: 'View cart', onClick: () => { cart.open = true } }] })
}
</script>

<template>
  <article class="group relative flex flex-col">
    <NuxtLink :to="productLink(product)" class="relative block overflow-hidden rounded-2xl bg-elevated ring-1 ring-default">
      <NuxtImg
        :src="product.thumbnail" :alt="product.title" width="400" height="400" sizes="50vw sm:33vw lg:25vw"
        :loading="eager ? 'eager' : 'lazy'"
        class="aspect-square w-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.05]"
      />
      <UBadge v-if="product.discountPercentage >= 15" color="secondary" variant="solid" size="sm" class="absolute left-3 top-3 rounded-full">
        −{{ Math.round(product.discountPercentage) }}%
      </UBadge>
      <UBadge v-if="product.stock > 0 && product.stock <= 5" color="neutral" variant="subtle" size="sm" class="absolute right-3 top-3 rounded-full">
        Only {{ product.stock }} left
      </UBadge>
    </NuxtLink>
    <div class="mt-3 flex flex-1 flex-col">
      <p class="text-xs text-muted">{{ product.brand || prettyCategory(product.category) }}</p>
      <NuxtLink :to="productLink(product)" class="mt-0.5 line-clamp-2 font-medium leading-snug hover:underline underline-offset-2">
        {{ product.title }}
      </NuxtLink>
      <Stars :value="product.rating" class="mt-1.5" />
      <div class="mt-auto flex items-end justify-between gap-2 pt-2">
        <Price :price="product.price" :sale="product.salePrice" :discount="product.discountPercentage" />
        <UButton
          :icon="added ? 'i-lucide-check' : 'i-lucide-plus'" size="sm" :variant="added ? 'solid' : 'soft'"
          :aria-label="`Add ${product.title} to cart`" :disabled="product.stock <= 0" @click="add"
        />
      </div>
    </div>
  </article>
</template>
