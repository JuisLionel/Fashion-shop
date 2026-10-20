import { Link, useSearchParams } from 'react-router'
import { FiHeart } from 'react-icons/fi'
import AnimatedContent from '../Components/animated-content'
import Pagination from '../Components/Pagination'
import siteData from '../../Data.json'
import { useAuth } from '../auth/useAuth'
import { pulseIcon } from '../Components/pulseIcon'
import { useNotifications } from '../Components/useNotifications'
import ProductCartButton from '../Components/ProductCartButton'

type Product = {
  id: string
  name: string
  category: string
  tags?: string[]
  main_image: string[]
  price_idr: number
  sale_price_idr: number | null
  is_new: boolean
  purchases: number
  review_count?: number
}

type Option = { value: string; label: string }

const PRODUCTS: Product[] = siteData.products
const PRODUCT_CATEGORIES = [...new Set(PRODUCTS.map((product) => product.category))]
const CATEGORY_OPTIONS = [...new Set(['Woman', 'Man', ...PRODUCT_CATEGORIES])]
const PAGE_SIZE = 8

const SORT_OPTIONS: Option[] = [
  { value: 'all', label: 'Featured' },
  { value: 'new', label: 'New arrivals' },
  { value: 'sale', label: 'Sale' },
  { value: 'best-sellers', label: 'Best sellers' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
]

const formatPrice = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

function normalizeCategory(value: string) {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'women' || normalized === 'woman') return 'woman'
  if (normalized === 'men' || normalized === 'man') return 'man'
  return normalized.replace(/s$/, '')
}

function FilterDropdown({
  label,
  options,
  value,
  onChange,
  align = 'start',
}: {
  label: string
  options: Option[]
  value: string
  onChange: (value: string) => void
  align?: 'start' | 'end'
}) {
  const current = options.find((option) => option.value === value) ?? options[0]

  const select = (next: string) => {
    onChange(next)
      ; (document.activeElement as HTMLElement | null)?.blur() // closes the dropdown
  }

  return (
    <div className={`dropdown ${align === 'end' ? 'dropdown-end' : 'dropdown-start'}`}>
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost h-11 min-h-0 flex-nowrap gap-1.5 whitespace-nowrap rounded-none px-2 font-jost text-[10px] font-normal uppercase tracking-[0.08em] sm:gap-3 sm:px-4 sm:text-xs sm:tracking-[0.2em]"
      >
        <span className="whitespace-nowrap text-base-content/50">{label}</span>
        <span className="whitespace-nowrap">{current.label}</span>
        <svg className="size-3 opacity-60" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 4.5 6 8.5 10 4.5" />
        </svg>
      </div>

      <ul
        tabIndex={0}
        className="dropdown-content menu z-20 mt-1 max-h-80 w-60 flex-nowrap overflow-y-auto rounded-none border border-base-content/10 bg-base-100 p-2 shadow-sm"
      >
        {options.map((option) => (
          <li key={option.value || 'all'}>
            <button
              type="button"
              onClick={() => select(option.value)}
              className={`rounded-none font-jost text-sm ${option.value === current.value ? 'menu-active' : ''}`}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ShopProductCard({ product }: { product: Product }) {
  const { account, toggleWishlist } = useAuth()
  const { notifyError } = useNotifications()
  const isWishlisted = account?.user.wishlist.includes(product.id) ?? false
  const discount = product.sale_price_idr
    ? Math.round((1 - product.sale_price_idr / product.price_idr) * 100)
    : 0

  const handleProductAction = (action: () => void) => {
    try {
      action()
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Could not update this product.')
    }
  }

  return (
    <article className="group block min-w-0">
      <div className="relative aspect-3/4 overflow-hidden bg-base-200">
        <Link to={`/product/${product.id}`} aria-label={product.name} className="block h-full w-full">
          <figure className="hover-gallery h-full w-full">
            {product.main_image.map((image, index) => (
              <img
                key={`${product.id}-${index}`}
                src={image}
                alt={index === 0 ? product.name : ''}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.visibility = 'hidden'
                }}
                className="h-full w-full object-cover"
              />
            ))}
          </figure>
        </Link>
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-1.5">
          {product.is_new && (
            <span className="rounded-md bg-base-100 px-2.5 py-1 text-xs font-medium text-base-content">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="ml-auto rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-content">
              {discount}% off
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 flex gap-2">
          <ProductCartButton productId={product.id} productName={product.name} className="h-10 w-10" />
          <button
            type="button"
            aria-label={`${isWishlisted ? 'Remove' : 'Add'} ${product.name} ${isWishlisted ? 'from' : 'to'} wishlist`}
            aria-pressed={isWishlisted}
            onClick={(event) => {
              pulseIcon(event.currentTarget)
              handleProductAction(() => toggleWishlist(product.id))
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-base-content shadow-sm transition-colors hover:bg-base-content hover:text-base-100 bg-base-100`}
          >
            <FiHeart
              className={`h-4 w-4 ${isWishlisted ? 'fill-current text-red-500' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div className="pt-4 font-jost">
        <Link to={`/product/${product.id}`} className="block truncate text-sm transition-colors duration-300 group-hover:text-accent">{product.name}</Link>
        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-base-content/50">{product.category}</p>
        <p className="mt-2 text-sm">
          {product.sale_price_idr ? (
            <>
              <span className="text-accent">{formatPrice(product.sale_price_idr)}</span>
              <span className="ml-2 text-base-content/40 line-through">{formatPrice(product.price_idr)}</span>
            </>
          ) : (
            formatPrice(product.price_idr)
          )}
        </p>
        {product.purchases > 0 && (
          <p className="mt-1 text-xs text-base-content/50">{product.purchases.toLocaleString('id-ID')} sold</p>
        )}
      </div>
    </article>
  )
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') ?? ''
  const selectedSort = searchParams.get('sort') ?? 'all'
  const normalizedCategory = normalizeCategory(selectedCategory)
  const isNewOnly = selectedSort === 'new' || normalizedCategory === 'new'
  const isSaleOnly = selectedSort === 'sale' || searchParams.get('sale') === 'true' || normalizedCategory === 'sale'

  const categoryOptions: Option[] = [
    { value: '', label: 'All' },
    ...CATEGORY_OPTIONS.map((category) => ({ value: category, label: category })),
  ]
  const activeCategory =
    CATEGORY_OPTIONS.find((category) => normalizeCategory(category) === normalizedCategory) ?? ''

  const filteredProducts = PRODUCTS.filter((product) => {
    if (isSaleOnly && product.sale_price_idr == null) return false
    if (isNewOnly && !product.is_new) return false
    if (!selectedCategory || normalizedCategory === 'new' || normalizedCategory === 'sale') return true

    return (
      normalizeCategory(product.category) === normalizedCategory ||
      product.tags?.some((tag) => normalizeCategory(tag) === normalizedCategory) === true
    )
  }).sort((a, b) => {
    if (selectedSort === 'price-low') return (a.sale_price_idr ?? a.price_idr) - (b.sale_price_idr ?? b.price_idr)
    if (selectedSort === 'price-high') return (b.sale_price_idr ?? b.price_idr) - (a.sale_price_idr ?? a.price_idr)
    if (selectedSort === 'best-sellers') return b.purchases - a.purchases
    if (isNewOnly) return Number(b.is_new) - Number(a.is_new)
    return 0
  })

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const requestedPage = Number.parseInt(searchParams.get('page') ?? '1', 10)
  const currentPage = Math.min(Math.max(Number.isNaN(requestedPage) ? 1 : requestedPage, 1), totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const pageProducts = filteredProducts.slice(startIndex, startIndex + PAGE_SIZE)

  const updateParam = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams)
    if (value && value !== 'all') nextParams.set(key, value)
    else nextParams.delete(key)
    nextParams.delete('page')
    setSearchParams(nextParams)
  }

  const goToPage = (page: number) => {
    const nextParams = new URLSearchParams(searchParams)
    if (page <= 1) nextParams.delete('page')
    else nextParams.set('page', String(page))
    setSearchParams(nextParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => setSearchParams(new URLSearchParams())

  const title = isSaleOnly
    ? 'Sale'
    : selectedCategory
      ? normalizedCategory === 'new'
        ? 'New arrivals'
        : selectedCategory
      : isNewOnly
        ? 'New arrivals'
        : 'Shop all'

  const hasFilters = Boolean(selectedCategory) || selectedSort !== 'all'
  const rangeStart = filteredProducts.length === 0 ? 0 : startIndex + 1
  const rangeEnd = Math.min(startIndex + PAGE_SIZE, filteredProducts.length)

  return (
    <section className="mx-auto max-w-360 px-6 py-12 md:px-12 md:py-16">
      <header className="border-b border-base-content/10 pb-8">
        <p className="font-jost text-xs uppercase tracking-[0.25em] text-accent">Fashion Shop</p>
        <h1 className="mt-3 font-jost text-4xl font-light capitalize md:text-5xl">{title}</h1>
        <p className="mt-3 font-jost text-sm text-base-content/60">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
        </p>
      </header>

      <div className="flex items-center justify-between gap-3 border-b border-base-content/10 py-4">
        <FilterDropdown
          label="Category"
          options={categoryOptions}
          value={activeCategory}
          onChange={(value) => updateParam('category', value)}
        />
        <FilterDropdown
          label="Sort by"
          align="end"
          options={SORT_OPTIONS}
          value={selectedSort}
          onChange={(value) => updateParam('sort', value)}
        />
      </div>

      {pageProducts.length > 0 ? (
        <>
          <p className="mt-6 font-jost text-xs text-base-content/50">
            Showing {rangeStart}–{rangeEnd} of {filteredProducts.length}
          </p>
          <AnimatedContent distance={28} duration={0.55} stagger={0.06} className="mt-6 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
            {pageProducts.map((product) => <ShopProductCard key={product.id} product={product} />)}
          </AnimatedContent>
          <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />
        </>
      ) : (
        <div className="py-24 text-center font-jost">
          <p className="text-base-content/70">No products match these filters.</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-5 text-sm underline underline-offset-4 transition-colors hover:text-accent"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </section>
  )
}
