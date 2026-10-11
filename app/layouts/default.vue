<script setup lang="ts">
import { DEPARTMENTS } from '~~/shared/departments'

const cart = useCart()
const searchOpen = ref(false)
const route = useRoute()
const colorMode = useColorMode()

defineShortcuts({
  meta_k: () => (searchOpen.value = true),
  '/': () => (searchOpen.value = true),
})

const nav = computed(() => DEPARTMENTS.map(d => ({
  label: d.name, icon: d.icon, to: { path: '/shop', query: { dept: d.slug } },
  active: route.path === '/shop' && route.query.dept === d.slug,
})))
</script>

<template>
  <div class="min-h-dvh">
    <div class="bg-primary-800 text-primary-50 dark:bg-primary-900">
      <UContainer class="flex h-9 items-center justify-center gap-2 text-xs sm:text-sm">
        <UIcon name="i-lucide-truck" class="size-4" />
        <span>Free shipping over $75<span class="hidden sm:inline"> · 30-day returns</span></span>
      </UContainer>
    </div>

    <header class="sticky top-0 z-40 border-b border-default bg-default/85 backdrop-blur">
      <UContainer class="flex h-16 items-center gap-3 sm:gap-6">
        <NuxtLink to="/" aria-label="Aisle home"><Logo /></NuxtLink>

        <button
          class="group flex h-10 flex-1 items-center gap-2 rounded-full border border-default bg-elevated px-4 text-left text-sm text-muted transition hover:border-accented sm:max-w-xl md:ml-6"
          aria-label="Search products" @click="searchOpen = true"
        >
          <UIcon name="i-lucide-search" class="size-4 shrink-0" />
          <span class="truncate">Search 194 products</span>
          <span class="ml-auto hidden items-center gap-0.5 sm:flex"><UKbd value="meta" /><UKbd value="K" /></span>
        </button>

        <div class="ml-auto flex items-center gap-1">
          <UButton
            :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'" color="neutral" variant="ghost"
            :aria-label="colorMode.value === 'dark' ? 'Light mode' : 'Dark mode'" class="hidden sm:inline-flex"
            @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
          />
          <UChip :text="cart.count" :show="cart.ready && cart.count > 0" size="3xl" color="secondary" inset>
            <UButton icon="i-lucide-shopping-bag" color="neutral" variant="ghost" aria-label="Open cart" @click="cart.open = true" />
          </UChip>
        </div>
      </UContainer>
      <UContainer>
        <div class="no-scrollbar -mx-2 overflow-x-auto">
          <UNavigationMenu :items="nav" class="w-max" :ui="{ list: 'flex-nowrap', item: 'shrink-0', linkLabel: 'overflow-visible whitespace-nowrap' }" />
        </div>
      </UContainer>
    </header>

    <main>
      <slot />
    </main>

    <footer class="mt-24 border-t border-default">
      <UContainer class="grid gap-8 py-12 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p class="mt-3 max-w-sm text-sm text-muted">
            Aisle is a demo store, so nothing is charged or shipped. Product data comes from DummyJSON.
            Built by <a href="https://rahul-dev-portfolio.vercel.app" class="underline underline-offset-2 hover:text-default" target="_blank" rel="noopener">Rahul Singh</a>.
          </p>
        </div>
        <div>
          <p class="mb-3 text-sm font-semibold">Shop</p>
          <ul class="space-y-2 text-sm text-muted">
            <li v-for="d in DEPARTMENTS" :key="d.slug"><NuxtLink :to="{ path: '/shop', query: { dept: d.slug } }" class="hover:text-default">{{ d.name }}</NuxtLink></li>
          </ul>
        </div>
        <div>
          <p class="mb-3 text-sm font-semibold">Built with</p>
          <ul class="space-y-2 text-sm text-muted">
            <li>Nuxt 4 · Vue 3 · Nitro</li><li>Nuxt UI 4 · Tailwind CSS 4</li><li>Pinia · Zod</li>
            <li><a href="https://github.com/RahulCodeBase25/aisle" class="hover:text-default" target="_blank" rel="noopener">Source on GitHub</a></li>
          </ul>
        </div>
      </UContainer>
    </footer>

    <CartSlideover />
    <SearchPalette v-model:open="searchOpen" />
  </div>
</template>
