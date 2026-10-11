import type { CatalogResult, Facet, Product, ProductCard } from '~~/shared/types'
import { DEPARTMENTS, prettyCategory } from '~~/shared/departments'

const SOURCE = 'https://dummyjson.com/products?limit=0'

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const round2 = (n: number) => Math.round(n * 100) / 100

// The whole catalog (~200 products) is fetched once and cached for a day,
// then searched, filtered and faceted in memory. One upstream call serves
// every request in between.
export const getCatalog = defineCachedFunction(
  async (): Promise<Product[]> => {
    const data = await $fetch<{ products: any[] }>(SOURCE)
    return data.products.map(p => ({
      ...p,
      slug: slugify(p.title),
      salePrice: round2(p.price * (1 - (p.discountPercentage || 0) / 100)),
      tags: p.tags || [],
    }))
  },
  { maxAge: 60 * 60 * 24, name: 'catalog', getKey: () => 'all', swr: true },
)

export const toCard = (p: Product): ProductCard => ({
  id: p.id, title: p.title, slug: p.slug, category: p.category, price: p.price,
  discountPercentage: p.discountPercentage, salePrice: p.salePrice, rating: p.rating,
  stock: p.stock, brand: p.brand, thumbnail: p.thumbnail,
})

// Very small relevance score: whole-word title hits beat partial hits,
// which beat brand/category/tag/description hits.
export function score(p: Product, q: string) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return 1
  const title = p.title.toLowerCase()
  const other = `${p.brand || ''} ${prettyCategory(p.category)} ${p.tags.join(' ')}`.toLowerCase()
  const desc = p.description.toLowerCase()
  let total = 0
  for (const t of terms) {
    let s = 0
    if (new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(title)) s = 10
    else if (title.includes(t)) s = 6
    else if (other.includes(t)) s = 4
    else if (desc.includes(t)) s = 1
    if (!s) return 0 // every term must match somewhere
    if (title.startsWith(t)) s += 3 // "iPhone X" beats "Apple iPhone Charger"
    total += s
  }
  return total - title.length / 100 // shorter, more specific titles first on ties
}

export interface CatalogQuery {
  q?: string; dept?: string; category?: string[]; brand?: string[]
  min?: number; max?: number; rating?: number; inStock?: boolean; deals?: boolean
  sort?: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'discount'
  page?: number; perPage?: number
}

const count = (values: string[], label: (v: string) => string): Facet[] => {
  const m = new Map<string, number>()
  for (const v of values) m.set(v, (m.get(v) || 0) + 1)
  return [...m].map(([value, count]) => ({ value, label: label(value), count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

export function queryCatalog(all: Product[], q: CatalogQuery): CatalogResult {
  const dept = DEPARTMENTS.find(d => d.slug === q.dept)
  let base = all
  if (dept) base = base.filter(p => (dept.categories as readonly string[]).includes(p.category))

  const scored = base.map(p => ({ p, s: score(p, q.q || '') })).filter(x => x.s > 0)
  let pool = scored

  // Facet counts ignore their own filter, so picking one brand still shows the others
  const withoutCategory = pool.filter(({ p }) => passes(p, { ...q, category: undefined }))
  const withoutBrand = pool.filter(({ p }) => passes(p, { ...q, brand: undefined }))
  const priceBase = pool.filter(({ p }) => passes(p, { ...q, min: undefined, max: undefined }))

  pool = pool.filter(({ p }) => passes(p, q))

  const sorters: Record<string, (a: typeof pool[0], b: typeof pool[0]) => number> = {
    'relevance': (a, b) => b.s - a.s || b.p.rating - a.p.rating,
    'price-asc': (a, b) => a.p.salePrice - b.p.salePrice,
    'price-desc': (a, b) => b.p.salePrice - a.p.salePrice,
    'rating': (a, b) => b.p.rating - a.p.rating,
    'discount': (a, b) => b.p.discountPercentage - a.p.discountPercentage,
  }
  pool.sort(sorters[q.sort || 'relevance'] || sorters.relevance)

  const perPage = Math.min(Math.max(q.perPage || 24, 1), 60)
  const pages = Math.max(1, Math.ceil(pool.length / perPage))
  const page = Math.min(Math.max(q.page || 1, 1), pages)
  const prices = priceBase.map(x => x.p.salePrice)

  return {
    items: pool.slice((page - 1) * perPage, page * perPage).map(x => toCard(x.p)),
    total: pool.length,
    page,
    pages,
    facets: {
      categories: count(withoutCategory.map(x => x.p.category), prettyCategory),
      brands: count(withoutBrand.map(x => x.p.brand).filter(Boolean) as string[], b => b),
      price: { min: prices.length ? Math.floor(Math.min(...prices)) : 0, max: prices.length ? Math.ceil(Math.max(...prices)) : 0 },
    },
  }
}

function passes(p: Product, q: CatalogQuery) {
  if (q.category?.length && !q.category.includes(p.category)) return false
  if (q.brand?.length && !(p.brand && q.brand.includes(p.brand))) return false
  if (q.min != null && p.salePrice < q.min) return false
  if (q.max != null && p.salePrice > q.max) return false
  if (q.rating && p.rating < q.rating) return false
  if (q.inStock && p.stock <= 0) return false
  if (q.deals && p.discountPercentage < 15) return false
  return true
}
