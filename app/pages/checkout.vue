<script setup lang="ts">
import { z } from 'zod'
import { SHIPPING, TAX_RATE, FREE_SHIPPING_FROM, type ShippingSpeed } from '~~/shared/departments'

const cart = useCart()
const router = useRouter()
const toast = useToast()

const step = ref(0)
const steps = [
  { title: 'Address', icon: 'i-lucide-map-pin' },
  { title: 'Delivery', icon: 'i-lucide-truck' },
  { title: 'Review', icon: 'i-lucide-receipt' },
]

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your full name'),
  email: z.email('Enter a valid email'),
  line1: z.string().trim().min(3, 'Enter your street address'),
  city: z.string().trim().min(2, 'Enter a city'),
  state: z.string().trim().length(2, '2 letters, like TX'),
  zip: z.string().trim().regex(/^\d{5}$/, '5 digits'),
})
const address = reactive({ name: '', email: '', line1: '', city: '', state: '', zip: '' })
const speed = ref<ShippingSpeed>('standard')

const shipping = computed(() => (speed.value === 'standard' && cart.subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING[speed.value].price))
const tax = computed(() => Math.round(cart.subtotal * TAX_RATE * 100) / 100)
const total = computed(() => Math.round((cart.subtotal + shipping.value + tax.value) * 100) / 100)

const placing = ref(false)
async function place() {
  placing.value = true
  try {
    const order = await $fetch<any>('/api/checkout', {
      method: 'POST',
      body: { items: cart.lines.map(l => ({ id: l.item.id, qty: l.qty })), speed: speed.value, address: { ...address, state: address.state.toUpperCase() } },
    })
    try { sessionStorage.setItem(`aisle-order-${order.id}`, JSON.stringify(order)) } catch { /* the page will say it can't find it */ }
    cart.clear()
    router.push(`/order/${order.id}`)
  } catch (e: any) {
    toast.add({ title: 'Couldn’t place the order', description: e?.data?.statusMessage || e?.statusMessage || 'Please try again.', color: 'error', icon: 'i-lucide-circle-alert' })
  } finally {
    placing.value = false
  }
}

useSeoMeta({ title: 'Checkout · Aisle' })
</script>

<template>
  <UContainer class="py-10">
    <h1 class="font-display text-4xl font-semibold sm:text-5xl">Checkout</h1>

    <div v-if="cart.ready && !cart.lines.length" class="flex flex-col items-center gap-4 py-24 text-center">
      <UIcon name="i-lucide-shopping-bag" class="size-12 text-muted" />
      <p class="font-display text-2xl">Your cart is empty.</p>
      <UButton to="/shop" label="Find something" />
    </div>

    <div v-else class="mt-8 grid gap-10 lg:grid-cols-[1fr_24rem]">
      <div>
        <UStepper v-model="step" :items="steps" disabled class="mb-10" />

        <!-- 1. Address -->
                <UForm v-if="step === 0" :schema="schema" :state="address" class="grid gap-x-4 gap-y-1 sm:grid-cols-2" @submit="step = 1">
          <UFormField label="Full name" name="name" class="sm:col-span-2"><UInput v-model="address.name" autocomplete="name" class="w-full" size="lg" /></UFormField>
          <UFormField label="Email" name="email" class="sm:col-span-2" description="For your receipt. No email is actually sent."><UInput v-model="address.email" type="email" autocomplete="email" class="w-full" size="lg" /></UFormField>
          <UFormField label="Street address" name="line1" class="sm:col-span-2"><UInput v-model="address.line1" autocomplete="address-line1" class="w-full" size="lg" /></UFormField>
          <UFormField label="City" name="city"><UInput v-model="address.city" autocomplete="address-level2" class="w-full" size="lg" /></UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="State" name="state"><UInput v-model="address.state" maxlength="2" autocomplete="address-level1" class="w-full uppercase" size="lg" placeholder="TX" /></UFormField>
            <UFormField label="ZIP" name="zip"><UInput v-model="address.zip" inputmode="numeric" maxlength="5" autocomplete="postal-code" class="w-full" size="lg" /></UFormField>
          </div>
          <div class="sm:col-span-2"><UButton type="submit" size="lg" label="Continue to delivery" trailing-icon="i-lucide-arrow-right" /></div>
        </UForm>

        <!-- 2. Delivery -->
        <div v-else-if="step === 1" class="space-y-6">
          <URadioGroup
            v-model="speed" variant="card" :items="(Object.keys(SHIPPING) as ShippingSpeed[]).map(k => ({
              value: k, label: `${SHIPPING[k].label} · ${k === 'standard' && cart.subtotal >= FREE_SHIPPING_FROM ? 'Free' : money(SHIPPING[k].price)}`, description: SHIPPING[k].days,
            }))"
          />
          <div class="flex gap-3">
            <UButton color="neutral" variant="outline" size="lg" label="Back" icon="i-lucide-arrow-left" @click="step = 0" />
            <UButton size="lg" label="Review order" trailing-icon="i-lucide-arrow-right" @click="step = 2" />
          </div>
        </div>

        <!-- 3. Review -->
        <div v-else class="space-y-6">
          <div class="grid gap-4 sm:grid-cols-2">
            <UCard>
              <p class="text-sm text-muted">Shipping to</p>
              <p class="mt-1 font-medium">{{ address.name }}</p>
              <p class="text-sm">{{ address.line1 }}, {{ address.city }}, {{ address.state.toUpperCase() }} {{ address.zip }}</p>
              <UButton variant="link" size="sm" class="mt-1 px-0" label="Change" @click="step = 0" />
            </UCard>
            <UCard>
              <p class="text-sm text-muted">Delivery</p>
              <p class="mt-1 font-medium">{{ SHIPPING[speed].label }}</p>
              <p class="text-sm">{{ SHIPPING[speed].days }}</p>
              <UButton variant="link" size="sm" class="mt-1 px-0" label="Change" @click="step = 1" />
            </UCard>
          </div>
          <UAlert icon="i-lucide-info" color="neutral" variant="subtle" title="This is a demo store" description="No payment is taken and nothing ships. Placing the order sends your cart to the server, which checks stock and prices it from the catalog." />
          <div class="flex gap-3">
            <UButton color="neutral" variant="outline" size="lg" label="Back" icon="i-lucide-arrow-left" @click="step = 1" />
            <UButton size="xl" :loading="placing" :label="`Place order · ${money(total)}`" @click="place" />
          </div>
        </div>
      </div>

      <!-- Summary -->
      <aside class="h-fit rounded-3xl bg-elevated p-6 ring-1 ring-default lg:sticky lg:top-36">
        <h2 class="font-semibold">Order summary</h2>
        <ul class="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
          <li v-for="l in cart.lines" :key="l.item.id" class="flex items-center gap-3">
            <UChip :text="l.qty" size="3xl" color="primary">
              <NuxtImg :src="l.item.thumbnail" :alt="l.item.title" width="56" height="56" class="size-14 rounded-xl bg-default object-contain p-1 ring-1 ring-default" />
            </UChip>
            <span class="line-clamp-2 flex-1 text-sm">{{ l.item.title }}</span>
            <span class="text-sm tabular-nums">{{ money(l.item.salePrice * l.qty) }}</span>
          </li>
        </ul>
        <USeparator class="my-4" />
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between"><dt class="text-muted">Subtotal</dt><dd class="tabular-nums">{{ money(cart.subtotal) }}</dd></div>
          <div class="flex justify-between"><dt class="text-muted">Shipping</dt><dd class="tabular-nums">{{ shipping ? money(shipping) : 'Free' }}</dd></div>
          <div class="flex justify-between"><dt class="text-muted">Tax (8.25%)</dt><dd class="tabular-nums">{{ money(tax) }}</dd></div>
          <div v-if="cart.savings" class="flex justify-between text-secondary-700 dark:text-secondary-400"><dt>You save</dt><dd class="tabular-nums">{{ money(cart.savings) }}</dd></div>
        </dl>
        <USeparator class="my-4" />
        <div class="flex items-baseline justify-between"><span class="font-medium">Total</span><span class="font-display text-3xl tabular-nums">{{ money(total) }}</span></div>
      </aside>
    </div>
  </UContainer>
</template>
