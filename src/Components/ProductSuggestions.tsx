import { Link } from 'react-router'
import siteData from '../../Data.json'
import ProductCartButton from './ProductCartButton'

type Product = {
  id: string
  name: string
  category: string
  main_image: string | string[]
  price_idr: number
  sale_price_idr: number | null
}

const PRODUCTS: Product[] = siteData.products
const formatPrice = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

export default function ProductSuggestions({ excludedIds }: { excludedIds: string[] }) {
  const excluded = new Set(excludedIds)
  const categoryCounts = new Map<string, number>()

  for (const product of PRODUCTS) {
    if (excluded.has(product.id)) {
      categoryCounts.set(product.category, (categoryCounts.get(product.category) ?? 0) + 1)
    }
  }

  const suggestions = PRODUCTS
    .filter((product) => !excluded.has(product.id))
    .sort((left, right) =>
      (categoryCounts.get(right.category) ?? 0) - (categoryCounts.get(left.category) ?? 0)
    )
    .slice(0, 4)

  if (suggestions.length === 0) return null

  return (
    <section aria-labelledby="product-suggestions-title" className="mt-12 border-t border-base-300 pt-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-jost text-xs uppercase tracking-widest text-base-content/60">Picked for you</p>
          <h2 id="product-suggestions-title" className="mt-1 font-jost text-xl font-light">
            You may also like
          </h2>
        </div>
        <Link to="/shop" className="font-jost text-sm underline underline-offset-4 hover:text-accent">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {suggestions.map((product) => {
          const image = Array.isArray(product.main_image) ? product.main_image[0] : product.main_image
          return (
            <article key={product.id} className="group relative font-jost">
              <Link to={`/product/${product.id}`} className="block">
                <div className="aspect-3/4 overflow-hidden rounded-lg bg-base-200">
                  <img
                    src={image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="mt-3 text-xs text-base-content/60">{product.category}</p>
                <p className="mt-1 truncate text-sm font-medium">{product.name}</p>
                <p className="mt-1 text-sm">
                  {product.sale_price_idr
                    ? formatPrice(product.sale_price_idr)
                    : formatPrice(product.price_idr)}
                </p>
              </Link>
              <ProductCartButton
                productId={product.id}
                productName={product.name}
                className="absolute right-2 top-2 h-9 w-9"
              />
            </article>
          )
        })}
      </div>
    </section>
  )
}
