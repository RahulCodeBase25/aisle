export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const all = await getCatalog()
  const product = all.find(p => p.id === id)
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  const related = all
    .filter(p => p.category === product.category && p.id !== id)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8)
    .map(toCard)
  return { product, related }
})
