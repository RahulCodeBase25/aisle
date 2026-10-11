// Groups DummyJSON's 24 categories into five departments for navigation.
export const DEPARTMENTS = [
  { slug: 'tech', name: 'Tech', icon: 'i-lucide-cpu', categories: ['smartphones', 'laptops', 'tablets', 'mobile-accessories'] },
  { slug: 'home', name: 'Home & Kitchen', icon: 'i-lucide-sofa', categories: ['furniture', 'home-decoration', 'kitchen-accessories', 'groceries'] },
  { slug: 'beauty', name: 'Beauty', icon: 'i-lucide-sparkles', categories: ['beauty', 'fragrances', 'skin-care'] },
  { slug: 'style', name: 'Style', icon: 'i-lucide-shirt', categories: ['mens-shirts', 'mens-shoes', 'mens-watches', 'tops', 'womens-dresses', 'womens-shoes', 'womens-bags', 'womens-jewellery', 'womens-watches', 'sunglasses'] },
  { slug: 'outdoors', name: 'Sport & Motor', icon: 'i-lucide-bike', categories: ['sports-accessories', 'motorcycle', 'vehicle'] },
] as const

export type DepartmentSlug = (typeof DEPARTMENTS)[number]['slug']

export const departmentOf = (category: string) => DEPARTMENTS.find(d => (d.categories as readonly string[]).includes(category))

export const prettyCategory = (slug: string) =>
  slug.replace(/^mens-/, "Men's ").replace(/^womens-/, "Women's ").replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export const FREE_SHIPPING_FROM = 75
export const SHIPPING = { standard: { label: 'Standard', days: '4–6 business days', price: 6.99 }, express: { label: 'Express', days: '1–2 business days', price: 14.99 } } as const
export type ShippingSpeed = keyof typeof SHIPPING
export const TAX_RATE = 0.0825 // Texas
