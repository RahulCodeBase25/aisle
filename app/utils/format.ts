const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
export const money = (n: number) => usd.format(n)
export const productLink = (p: { id: number; slug: string }) => `/p/${p.id}/${p.slug}`
