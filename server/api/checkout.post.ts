import { z } from 'zod'
import { FREE_SHIPPING_FROM, SHIPPING, TAX_RATE } from '~~/shared/departments'

const Body = z.object({
  items: z.array(z.object({ id: z.number().int().positive(), qty: z.number().int().min(1).max(20) })).min(1).max(50),
  speed: z.enum(['standard', 'express']),
  address: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.email().max(120),
    line1: z.string().trim().min(3).max(120),
    city: z.string().trim().min(2).max(60),
    state: z.string().trim().length(2),
    zip: z.string().trim().regex(/^\d{5}$/),
  }),
})

const round2 = (n: number) => Math.round(n * 100) / 100

// The order is priced here from the catalog, never from numbers the browser sends.
export default defineEventHandler(async (event) => {
  const parsed = Body.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Check the highlighted fields', data: parsed.error.flatten() })
  }
  const { items, speed, address } = parsed.data
  const all = await getCatalog()

  const lines = items.map(({ id, qty }) => {
    const p = all.find(x => x.id === id)
    if (!p) throw createError({ statusCode: 409, statusMessage: 'An item in your cart is no longer sold' })
    if (p.stock < qty) throw createError({ statusCode: 409, statusMessage: `Only ${p.stock} left of ${p.title}` })
    return { id, title: p.title, thumbnail: p.thumbnail, qty, unit: p.salePrice, listUnit: p.price, total: round2(p.salePrice * qty) }
  })

  const subtotal = round2(lines.reduce((s, l) => s + l.total, 0))
  const savings = round2(lines.reduce((s, l) => s + (l.listUnit - l.unit) * l.qty, 0))
  const shipping = speed === 'standard' && subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING[speed].price
  const tax = round2(subtotal * TAX_RATE)
  const days = speed === 'express' ? 2 : 6
  const eta = new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10)

  return {
    id: `AS-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    placedAt: new Date().toISOString(),
    lines, subtotal, savings, shipping, tax,
    total: round2(subtotal + shipping + tax),
    speed, eta,
    shipTo: { name: address.name, city: address.city, state: address.state.toUpperCase() },
  }
})
