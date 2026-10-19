import { useRef, useState } from 'react'
import { Link } from 'react-router'

import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import siteData from '../../Data.json'
import { useAuth } from '../auth/useAuth'

import {
  FiArrowRight,
  FiHeart,
  FiShoppingBag,
  FiStar,
} from 'react-icons/fi'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type Product = {
  id: string
  name: string
  category: string
  tags?: string[]
  main_image: string | string[]
  variant_image: string | string[]
  price_idr: number
  sale_price_idr: number | null
  purchases: number
  rating?: number
  review_count?: number
  is_new: boolean
}

const PRODUCTS: Product[] = siteData.products

const NEW_ARRIVALS = PRODUCTS.filter((p) => p.is_new).slice(0, 4)
const ON_SALE = PRODUCTS.filter((p) => p.sale_price_idr).slice(0, 4)
const BEST_SELLERS = PRODUCTS
  .filter((product) => product.purchases > 0)
  .sort((a, b) => b.purchases - a.purchases)

const BEST_SELLER_TABS = [
  { label: 'All', tag: null },
  { label: 'Women', tag: 'woman' },
  { label: 'Men', tag: 'man' },
  { label: 'Accessories', tag: 'accessories' },
]
const MAX_DISCOUNT = Math.max(
  0,
  ...PRODUCTS.filter((p) => p.sale_price_idr).map((p) => Math.round((1 - p.sale_price_idr! / p.price_idr) * 100))
)

const formatPrice = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function SectionHeader({ title, to, label = 'View all' }: { title: string; to?: string; label?: string }) {
  return (
    <div className="reveal mb-8 flex items-end justify-between gap-4">
      <h2 className="font-jost text-3xl font-light md:text-4xl">{title}</h2>
      {to && (
        <Link
          to={to}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap font-jost text-sm underline underline-offset-4 transition-colors duration-300 hover:text-accent"
        >
          {label}
          <FiArrowRight aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}

function Banner() {
  if (MAX_DISCOUNT === 0) return null

  return (
    <section className="reveal relative flex h-[60svh] min-h-96 w-full items-end overflow-hidden bg-[#e6e6e7] font-jost text-[#111111] md:items-center">
      {/* Background image */}
      <img
        src="/banner.webp"
        alt=""
        loading="lazy"
        onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
        className="absolute inset-0 h-full w-full object-cover object-top-left"
      />

      {/* Text */}
      <div className="relative z-10 flex w-full flex-col items-start gap-4 p-6 max-md:bg-[#e6e6e7]/85 md:ml-auto md:w-[40%] md:p-12 lg:p-16">
        <p className="text-sm md:text-base ">Limited Time Offers</p>

        <h2 className="text-3xl font-medium leading-tight md:text-4xl lg:text-5xl">
          <span className='text-accent'>{MAX_DISCOUNT}%</span> Off All Fashion Favorites - Limited Time!
        </h2>

        <p className="max-w-md text-sm font-light text-[#111111]/70">
          {siteData.site.home.saleDescription}
        </p>

        <Link
          to="/shop?sort=sale"
          className="mt-2 inline-flex items-center gap-2  bg-[#3b1d12] px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:bg-[#5a2d1c]"
        >
          Shop Now
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}

function ProductCard({ product }: { product: Product }) {
  const { account, addToCart, toggleWishlist } = useAuth()
  const [actionError, setActionError] = useState('')
  const images = Array.isArray(product.main_image) ? product.main_image : [product.main_image]
  const discount = product.sale_price_idr
    ? Math.round((1 - product.sale_price_idr / product.price_idr) * 100)
    : 0
  const cartQuantity = account?.user.cart.find(
    (item) => item.productId === product.id && Number.isInteger(item.quantity) && item.quantity > 0
  )?.quantity ?? 0
  const isWishlisted = account?.user.wishlist.includes(product.id) ?? false

  const iconButton =
    'flex h-9 w-9 items-center justify-center rounded-full bg-base-100 text-base-content transition-colors duration-300 hover:bg-base-content hover:text-base-100'

  const handleProductAction = (action: () => void) => {
    try {
      action()
      setActionError('')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not update this product.')
    }
  }

  return (
    <article className="reveal group font-jost">
      <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-base-200">
        <Link to={`/product/${product.id}`} aria-label={product.name} className="block h-full w-full">
          <figure className="hover-gallery h-full w-full">
            {images.map((image) => (
              <img
                key={image}
                src={image}
                alt=""
                loading="lazy"
                onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
                className="h-full w-full object-cover"
              />
            ))}
          </figure>
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {discount > 0 && (
            <span className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-accent">
              {discount}% off
            </span>
          )}
          {product.is_new && (
            <span className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-[#111111]">
              New
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            type="button"
            aria-label={`Add ${product.name} to cart${cartQuantity ? `, currently ${cartQuantity} in cart` : ''}`}
            onClick={() => handleProductAction(() => addToCart(product.id))}
            className={`${iconButton} ${cartQuantity ? '!bg-base-content !text-base-100' : ''}`}
          >
            <FiShoppingBag className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`${isWishlisted ? 'Remove' : 'Add'} ${product.name} ${isWishlisted ? 'from' : 'to'} wishlist`}
            aria-pressed={isWishlisted}
            onClick={() => handleProductAction(() => toggleWishlist(product.id))}
            className={`${iconButton} ${isWishlisted ? '!bg-base-content !text-base-100' : ''}`}
          >
            <FiHeart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {actionError && <p role="status" className="mt-2 text-xs text-error">{actionError}</p>}

      <div className="pt-4">
        <div className="flex items-center justify-between gap-3 text-xs text-base-content/60">
          <span className="truncate">{product.category}</span>
          {product.rating && (
            <span className="inline-flex shrink-0 items-center gap-1 font-medium text-base-content">
              <FiStar className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>

        <Link
          to={`/product/${product.id}`}
          className="mt-1 block truncate text-base font-medium transition-colors duration-300 hover:text-accent"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-center justify-between gap-3 text-sm">
          <p>
            {product.sale_price_idr ? (
              <>
                <span className="font-medium">{formatPrice(product.sale_price_idr)}</span>
                <span className="ml-2 text-base-content/50 line-through">{formatPrice(product.price_idr)}</span>
              </>
            ) : (
              <span className="font-medium">{formatPrice(product.price_idr)}</span>
            )}
          </p>
          {product.purchases > 0 && (
            <span className="shrink-0 text-xs text-base-content/60">
              {product.purchases.toLocaleString('id-ID')} sold
            </span>
          )}
        </div>
      </div>
    </article>
  )
}


function Welcome() {
  const root = useRef<HTMLElement>(null)

  return (
    <section ref={root} className="relative flex h-screen min-h-128 items-end justify-center overflow-hidden bg-base-200">
      <img
        src="/hero.webp"
        alt=""
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-[50%_50%]"
      />

      <div className="relative z-10 flex flex-col items-center gap-4 pb-10 font-jost text-[#111111] md:pb-14">
        <Link
          to="/shop"
          className="inline-flex bg-white px-10 py-4 text-xs font-medium uppercase tracking-widest text-[#111111] transition-colors duration-300 hover:bg-[#111111] hover:text-white"
        >
          Shop now
        </Link>
      </div>
    </section>
  )
}

function Faq() {
  const { faqTitle, faqs } = siteData.site

  return (
    <section className="w-full bg-base-200 px-6 py-20 md:px-12">
      <div className="mx-auto max-w-3xl font-jost">
        <div className="reveal mb-10 text-center">
          <p className="text-sm text-base-content/70">FAQ</p>
          <h2 className="mt-2 text-3xl font-normal md:text-4xl">{faqTitle}</h2>
        </div>

        <div className="reveal space-y-2">
          {faqs.map((item, index) => (
            <div
              key={item.question}
              className="collapse collapse-plus rounded-none bg-base-100 transition-colors duration-300 has-checked:bg-[#3b1d12] has-checked:text-white"
            >
              <input type="radio" name="home-faq" defaultChecked={index === 1} aria-label={item.question} />
              <div className="collapse-title min-h-0! px-5 py-7 text-sm font-normal">{item.question}</div>
              <div className="collapse-content px-5 text-xs font-light leading-relaxed text-white/80">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Category() {
  const { categories } = siteData.site.home

  return (
    <section className="w-full px-6 py-20 md:px-12">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:auto-rows-96 2xl:auto-rows-104">
        {categories.map((category) => {
          const categoryProducts = PRODUCTS.filter((product) =>
            product.tags?.some((tag) => tag.toLowerCase() === category.tag.toLowerCase())
          )
          const productCategories = category.tag.toLowerCase() === 'accessories'
            ? [...new Set(categoryProducts.flatMap((product) =>
              product.tags?.filter((tag) => tag.toLowerCase() !== category.tag.toLowerCase()) ?? []
            ))].map((tag) => tag.charAt(0).toUpperCase() + tag.slice(1))
            : [...new Set(categoryProducts.map((product) => product.category))]

          const maxLinks = category.featured ? 8 : 5
          const visibleCategories = productCategories.slice(0, maxLinks)
          const hasMore = productCategories.length > maxLinks

          return (
            <Link
              key={category.name}
              to={category.to}
              aria-label={`Shop ${category.name}`}
              className={`reveal group relative flex flex-col overflow-hidden rounded-2xl bg-[#e6e6e7] ${category.featured ? 'lg:row-span-2' : ''
                }`}
            >
              <div className="relative z-10 order-1 flex w-full flex-col items-start gap-3 p-5 font-jost text-[#111111] md:p-8 lg:w-[45%]">
                <span className="rounded-md bg-white px-3 py-1 text-xs font-medium text-[#111111]">
                  {categoryProducts.length} {categoryProducts.length === 1 ? 'Item' : 'Items'}
                </span>

                <h3 className={`font-semibold ${category.featured ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'}`}>
                  {category.name}
                </h3>

                <p className="max-w-[24ch] text-xs leading-relaxed text-[#111111]/60">
                  {category.description}
                </p>

                <ul className="space-y-1.5 text-xs md:text-sm">
                  {visibleCategories.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                  {hasMore && <li className="text-[#111111]/60">and more...</li>}
                </ul>
              </div>
              <img
                src={category.image}
                alt=""
                loading="lazy"
                onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
                className={`order-2 block w-full object-cover object-right transition-transform duration-700 ease-out group-hover:scale-105 md:aspect-video lg:absolute lg:bottom-0 lg:right-0 lg:aspect-auto ${category.tag.toLowerCase() === 'accessories'
                  ? 'aspect-5/4'
                  : 'aspect-4/5 max-md:-mt-8'
                  } ${category.featured
                    ? 'origin-bottom-right lg:h-auto lg:w-[150%] lg:max-w-none'
                    : 'origin-right lg:inset-y-0 lg:h-full lg:w-auto lg:max-w-[60%]'
                  }`}
              />
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function NewArrivals() {
  if (NEW_ARRIVALS.length === 0) return null

  return (
    <section className="w-full px-6 pb-20 md:px-12 mt-10">
      <SectionHeader title={siteData.site.home.newArrivalsTitle} to="/shop?sort=new" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {NEW_ARRIVALS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

function Sale() {
  if (ON_SALE.length === 0) return null

  return (
    <section className="bg-base-100 transition-colors duration-300">
      <div className="w-full px-6 py-20 md:px-12">
        <div className="reveal mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="font-jost text-sm uppercase tracking-[0.3em] text-accent">{siteData.site.home.saleEyebrow}</p>
            <h2 className="mt-3 font-jost text-4xl font-light md:text-5xl">Up to {MAX_DISCOUNT}% off</h2>
            <p className="mt-4 font-jost font-light text-base-content/70">
              {siteData.site.home.saleDescription}
            </p>
          </div>
          <Link to="/shop?sort=sale" className="btn btn-neutral shrink-0 rounded-none font-jost uppercase tracking-widest">
            {siteData.site.home.saleButtonLabel}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {ON_SALE.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BestSellers() {
  const [activeTab, setActiveTab] = useState(0)
  const tab = BEST_SELLER_TABS[activeTab]

  const visibleProducts = (
    tab.tag
      ? BEST_SELLERS.filter((product) => product.tags?.some((t) => t.toLowerCase() === tab.tag))
      : BEST_SELLERS
  ).slice(0, 4)

  return (
    <section className="w-full px-6 pb-20 md:px-12 mt-5 bg-base-200 py-10">
      <div className="reveal mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-jost text-sm text-base-content/60">Our Products</p>
          <h2 className="mt-2 font-jost text-3xl font-light md:text-4xl">Our Top Seller Products</h2>
        </div>
        <div className="flex flex-col items-start gap-4 sm:items-end">
          <Link
            to="/shop?sort=best-sellers"
            className="inline-flex items-center gap-2 font-jost text-sm underline underline-offset-4 transition-colors duration-300 hover:text-accent"
          >
            View all
            <FiArrowRight aria-hidden="true" />
          </Link>
          <div role="tablist" className="flex max-w-full gap-2 overflow-x-auto font-jost text-sm">
            {BEST_SELLER_TABS.map((item, index) => (
              <button
                key={item.label}
                type="button"
                role="tab"
                aria-selected={activeTab === index}
                onClick={() => setActiveTab(index)}
                className={`shrink-0 rounded-md border px-4 py-2 transition-colors duration-300 ${activeTab === index
                  ? 'border-base-content bg-base-content text-base-100'
                  : 'border-base-300 hover:border-base-content'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visibleProducts.length === 0 ? (
        <p className="py-10 text-center font-jost text-base-content/60">No products here yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}

export default function Home() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return

      gsap.set('.reveal', { autoAlpha: 0, y: 32 })
      ScrollTrigger.batch('.reveal', {
        start: 'top 90%',
        once: false,
        onEnter: (batch) =>
          gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, overwrite: true }),
        onEnterBack: (batch) =>
          gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, overwrite: true }),
        onLeave: (batch) => gsap.set(batch, { autoAlpha: 0, y: 32, overwrite: true }),
        onLeaveBack: (batch) => gsap.set(batch, { autoAlpha: 0, y: 32, overwrite: true }),
      })
    },
    { scope: container }
  )

  return (
    <div ref={container}>
      <Welcome />
      <Category />
      <BestSellers />
      <NewArrivals />
      <Banner />
      <Sale />
      <Faq />
    </div>
  )
}