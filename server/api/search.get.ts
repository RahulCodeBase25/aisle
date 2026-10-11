export default defineEventHandler(async (event) => {
  const q = String(getQuery(event).q || '').slice(0, 80).trim()
  if (q.length < 2) return []
  const all = await getCatalog()
  return all
    .map(p => ({ p, s: score(p, q) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s || b.p.rating - a.p.rating)
    .slice(0, 8)
    .map(x => toCard(x.p))
})
