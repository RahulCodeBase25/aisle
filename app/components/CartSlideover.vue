<script setup lang="ts">
import { FREE_SHIPPING_FROM } from '~~/shared/departments'
const cart = useCart()
const progress = computed(() => Math.min(100, (cart.subtotal / FREE_SHIPPING_FROM) * 100))
</script>

<template>
  <USlideover v-model:open="cart.open" title="Your cart" :description="cart.count ? `${cart.count} item${cart.count > 1 ? 's' : ''}` : 'Nothing here yet'">
    <template #body>
      <div v-if="!cart.lines.length" class="flex h-full flex-col items-center justify-center gap-4 text-center">
        <UIcon name="i-lucide-shopping-bag" class="size-12 text-muted" />
        <p class="text-muted">Your cart is empty. Find something you love.</p>
        <UButton to="/shop" label="Start shopping" @click="cart.open = false" />
      </div>
      <div v-else class="space-y-5">
        <div class="rounded-xl bg-muted p-3">
          <p class="text-sm">
            <template v-if="cart.toFreeShipping > 0">Add <b>{{ money(cart.toFreeShipping) }}</b> more for free standard shipping.</template>
            <template v-else><UIcon name="i-lucide-truck" class="mr-1 align-[-2px]" />You've unlocked free shipping.</template>
          </p>
          <UProgress :model-value="progress" size="sm" class="mt-2" />
        </div>
        <TransitionGroup tag="ul" name="line" class="divide-y divide-default">
          <li v-for="l in cart.lines" :key="l.item.id" class="flex gap-3 py-3">
            <NuxtLink :to="productLink(l.item)" class="shrink-0" @click="cart.open = false">
              <NuxtImg :src="l.item.thumbnail" :alt="l.item.title" width="80" height="80" class="size-20 rounded-xl bg-elevated object-contain p-1.5 ring-1 ring-default" />
            </NuxtLink>
            <div class="min-w-0 flex-1">
              <p class="line-clamp-2 text-sm font-medium">{{ l.item.title }}</p>
              <p class="mt-0.5 text-sm tabular-nums">{{ money(l.item.salePrice) }}</p>
              <div class="mt-2 flex items-center gap-2">
                <UInputNumber :model-value="l.qty" :min="0" :max="Math.min(l.item.stock, 20)" size="xs" class="w-24" @update:model-value="v => cart.setQty(l.item.id, Number(v ?? 0))" />
                <UButton icon="i-lucide-trash-2" variant="ghost" color="neutral" size="xs" :aria-label="`Remove ${l.item.title}`" @click="cart.remove(l.item.id)" />
              </div>
            </div>
            <p class="text-sm font-semibold tabular-nums">{{ money(l.item.salePrice * l.qty) }}</p>
          </li>
        </TransitionGroup>
      </div>
    </template>
    <template v-if="cart.lines.length" #footer>
      <div class="w-full space-y-3">
        <div class="flex justify-between text-sm"><span class="text-muted">You save</span><span class="tabular-nums text-secondary-600 dark:text-secondary-400">{{ money(cart.savings) }}</span></div>
        <div class="flex items-baseline justify-between"><span class="font-medium">Subtotal</span><span class="font-display text-2xl tabular-nums">{{ money(cart.subtotal) }}</span></div>
        <UButton to="/checkout" block size="lg" label="Check out" trailing-icon="i-lucide-arrow-right" @click="cart.open = false" />
      </div>
    </template>
  </USlideover>
</template>

<style>
.line-enter-active, .line-leave-active { transition: all .25s ease; }
.line-enter-from, .line-leave-to { opacity: 0; transform: translateX(16px); }
</style>
