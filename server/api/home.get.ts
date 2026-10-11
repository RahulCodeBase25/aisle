import { DEPARTMENTS } from '~~/shared/departments'

export default defineEventHandler(async () => {
  const all = await getCatalog()
  const byDiscount = [...all].sort((a, b) => b.discountPercentage - a.discountPercentage)
  const byRating = [...all].sort((a, b) => b.rating - a.rating || b.stock - a.stock)
  return {
    deals: byDiscount.slice(0, 12).map(toCard),
    topRated: byRating.slice(0, 12).map(toCard),
    departments: DEPARTMENTS.map(d => {
      const items = all.filter(p => (d.categories as readonly string[]).includes(p.category))
      return { slug: d.slug, count: items.length, cover: [...items].sort((a, b) => b.rating - a.rating).slice(0, 3).map(p => p.thumbnail) }
    }),
    total: all.length,
  }
})
