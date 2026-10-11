import { z } from 'zod'

const list = z.preprocess(v => (v == null || v === '' ? undefined : Array.isArray(v) ? v : String(v).split(',')), z.array(z.string().max(60)).max(30).optional())
const num = z.preprocess(v => (v === '' || v == null ? undefined : Number(v)), z.number().finite().nonnegative().optional())

const Query = z.object({
  q: z.string().max(80).optional(),
  dept: z.string().max(30).optional(),
  category: list,
  brand: list,
  min: num,
  max: num,
  rating: num,
  inStock: z.preprocess(v => v === '1' || v === 'true', z.boolean()).optional(),
  deals: z.preprocess(v => v === '1' || v === 'true', z.boolean()).optional(),
  sort: z.enum(['relevance', 'price-asc', 'price-desc', 'rating', 'discount']).optional().catch('relevance'),
  page: num,
  perPage: num,
})

export default defineEventHandler(async (event) => {
  const parsed = Query.safeParse(getQuery(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Bad filters' })
  return queryCatalog(await getCatalog(), parsed.data)
})
