export interface Review { rating: number; comment: string; date: string; reviewerName: string }

export interface Product {
  id: number
  title: string
  slug: string
  description: string
  category: string
  price: number
  discountPercentage: number
  salePrice: number
  rating: number
  stock: number
  brand?: string
  tags: string[]
  thumbnail: string
  images: string[]
  reviews?: Review[]
  warrantyInformation?: string
  shippingInformation?: string
  returnPolicy?: string
  availabilityStatus?: string
  minimumOrderQuantity?: number
}

export type ProductCard = Pick<Product, 'id' | 'title' | 'slug' | 'category' | 'price' | 'discountPercentage' | 'salePrice' | 'rating' | 'stock' | 'brand' | 'thumbnail'>

export interface Facet { value: string; label: string; count: number }

export interface CatalogResult {
  items: ProductCard[]
  total: number
  page: number
  pages: number
  facets: { categories: Facet[]; brands: Facet[]; price: { min: number; max: number } }
}
