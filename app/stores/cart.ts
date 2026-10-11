import { defineStore } from 'pinia'
import type { ProductCard } from '~~/shared/types'
import { FREE_SHIPPING_FROM } from '~~/shared/departments'

export interface CartLine { item: ProductCard; qty: number }
const KEY = 'aisle-cart-v1'

export const useCart = defineStore('cart', () => {
  const lines = ref<CartLine[]>([])
  const open = ref(false)
  const ready = ref(false)

  const count = computed(() => lines.value.reduce((n, l) => n + l.qty, 0))
  const subtotal = computed(() => Math.round(lines.value.reduce((s, l) => s + l.item.salePrice * l.qty, 0) * 100) / 100)
  const savings = computed(() => Math.round(lines.value.reduce((s, l) => s + (l.item.price - l.item.salePrice) * l.qty, 0) * 100) / 100)
  const toFreeShipping = computed(() => Math.max(0, FREE_SHIPPING_FROM - subtotal.value))

  function add(item: ProductCard, qty = 1) {
    const line = lines.value.find(l => l.item.id === item.id)
    const max = Math.min(item.stock, 20)
    if (line) line.qty = Math.min(line.qty + qty, max)
    else lines.value.unshift({ item, qty: Math.min(qty, max) })
  }
  const setQty = (id: number, qty: number) => {
    const line = lines.value.find(l => l.item.id === id)
    if (!line) return
    if (qty <= 0) remove(id)
    else line.qty = Math.min(qty, line.item.stock, 20)
  }
  const remove = (id: number) => { lines.value = lines.value.filter(l => l.item.id !== id) }
  const clear = () => { lines.value = [] }

  // Kept in the browser so the cart survives a refresh. Private windows can
  // throw on localStorage, so every access is guarded.
  if (import.meta.client) {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
      if (Array.isArray(saved)) lines.value = saved
    } catch { /* start empty */ }
    ready.value = true
    watch(lines, v => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* ignore */ } }, { deep: true })
  }

  return { lines, open, ready, count, subtotal, savings, toFreeShipping, add, setQty, remove, clear }
})
