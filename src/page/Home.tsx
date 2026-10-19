import { useRef } from 'react'
import { Link } from 'react-router'

import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import siteData from '../../Data.json'

import { FiArrowRight, FiPackage, FiRefreshCw, FiSun, FiTruck } from 'react-icons/fi'

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
  review_count?: number
  is_new: boolean
}

const PRODUCTS: Product[] = siteData.products

const NEW_ARRIVALS = PRODUCTS.filter((p) => p.is_new).slice(0, 4)
const ON_SALE = PRODUCTS.filter((p) => p.sale_price_idr).slice(0, 4)
const BEST_SELLERS = [...PRODUCTS].sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0)).slice(0, 4)

const MAX_DISCOUNT = Math.max(
  0,
  ...PRODUCTS.filter((p) => p.sale_price_idr).map((p) => Math.round((1 - p.sale_price_idr! / p.price_idr) * 100))
)

const BENEFIT_ICONS = {
  shipping: FiTruck,
  exchange: FiRefreshCw,
  package: FiPackage,
  cotton: FiSun,
}

const formatPrice = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function SectionHeader({ title, to, label = 'View all' }: { title: string; to?: string; label?: string }) {
  return (
    <div className="reveal mb-10 flex items-end justify-between gap-4">
      <h2 className="font-jost text-3xl font-light md:text-4xl">{title}</h2>
      {to && (
        <Link
          to={to}
          className="inline-flex items-center gap-2 font-jost text-sm underline underline-offset-4 transition-colors duration-300 hover:text-accent"
        >
          {label}
          <FiArrowRight aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const images = Array.isArray(product.main_image) ? product.main_image : [product.main_image]

  return (
    <Link to={`/product/${product.id}`} className="reveal group block">
      <div className="img-shadow relative aspect-3/4 overflow-hidden bg-base-200 transition-colors duration-300">
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
        {product.is_new && (
          <span className="badge badge-neutral badge-sm absolute left-3 top-3 rounded-none font-jost uppercase tracking-wider">
            New
          </span>
        )}
        {product.sale_price_idr && (
          <span className="badge badge-accent badge-sm absolute right-3 top-3 rounded-none font-jost uppercase tracking-wider">
            Sale
          </span>
        )}
      </div>
      <div className="pt-4 font-jost text-sm">
        <p className="truncate transition-colors duration-300 group-hover:text-accent">{product.name}</p>
        <p className="mt-2">
          {product.sale_price_idr ? (
            <>
              <span className="text-accent">{formatPrice(product.sale_price_idr)}</span>
              <span className="ml-2 text-base-content/50 line-through">{formatPrice(product.price_idr)}</span>
            </>
          ) : (
            formatPrice(product.price_idr)
          )}
        </p>
      </div>
    </Link>
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

function Benefits() {
  return (
    <section className="border-b border-base-300">
      <div className="mx-auto grid max-w-360 grid-cols-2 gap-y-8 px-6 py-10 md:px-12 lg:grid-cols-4">
        {siteData.site.home.benefits.map(({ icon, title, text }) => {
          const Icon = BENEFIT_ICONS[icon as keyof typeof BENEFIT_ICONS]
          return (
            <div key={title} className="reveal flex items-start gap-4 font-jost">
              <Icon className="mt-1 h-6 w-6 shrink-0" aria-hidden="true" />
              <div>
                <h3 className="text-base font-medium">{title}</h3>
                <p className="mt-1 text-sm font-light text-base-content/70">{text}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Category() {
  const { categories } = siteData.site.home

  return (
    <section className="mx-auto max-w-360 px-6 py-20 md:px-12">
      <div className="reveal mb-10 flex items-end justify-between gap-4">
        <h2 className="font-jost text-3xl font-light md:text-4xl">Shop by Category</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2">
        {categories.map((category) => {
          const categoryProducts = PRODUCTS.filter((product) =>
            product.tags?.some((tag) => tag.toLowerCase() === category.tag.toLowerCase())
          )
          const productCategories = [...new Set(categoryProducts.map((product) => product.category))]

          const maxLinks = category.featured ? 8 : 5
          const visibleCategories = productCategories.slice(0, maxLinks)
          const hasMore = productCategories.length > maxLinks

          return (
            <Link
              key={category.name}
              to={category.to}
              aria-label={`Shop ${category.name}`}
              className={`reveal group relative flex overflow-hidden rounded-2xl bg-[#e6e6e7] ${category.featured ? 'min-h-96 items-center md:row-span-2' : 'min-h-64 items-start'
                }`}
            >
              {/* Background image */}
              {category.featured ? (
                <div className="absolute inset-x-0 bottom-0 h-[95%] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_12%)]">
                  <img
                    src={category.image}
                    alt=""
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
                    className="h-full w-full origin-bottom-right object-cover object-right transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              ) : (
                <img
                  src={category.image}
                  alt=""
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
                  className="absolute inset-0 h-full w-full origin-right object-cover object-right transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}

              {/* Text */}
              <div className="relative z-10 flex w-3/5 flex-col items-start gap-3 p-5 font-jost text-[#111111] md:w-1/2 md:p-8">
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
    <section className="mx-auto max-w-360 px-6 pb-20 md:px-12">
      <SectionHeader title={siteData.site.home.newArrivalsTitle} to="/shop?category=new" />
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
    <section className="bg-base-200 transition-colors duration-300">
      <div className="mx-auto max-w-360 px-6 py-20 md:px-12">
        <div className="reveal mb-10 max-w-xl">
          <p className="font-jost text-sm uppercase tracking-[0.3em] text-accent">{siteData.site.home.saleEyebrow}</p>
          <h2 className="mt-3 font-jost text-4xl font-light md:text-5xl">Up to {MAX_DISCOUNT}% off</h2>
          <p className="mt-4 font-jost font-light text-base-content/70">
            {siteData.site.home.saleDescription}
          </p>
          <Link to="/shop?category=sale" className="btn btn-neutral mt-6 rounded-none font-jost uppercase tracking-widest">
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
  return (
    <section className="mx-auto max-w-360 px-6 pb-20 md:px-12">
      <SectionHeader title={siteData.site.home.bestSellersTitle} to="/shop" label="Shop all" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {BEST_SELLERS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

/* ----------------------------------- Page ---------------------------------- */

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
      <Benefits />
      <Category />
      <NewArrivals />
      <Sale />
      <BestSellers />
    </div>
  )
}