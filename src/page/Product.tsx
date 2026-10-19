import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { FiChevronLeft, FiChevronRight, FiHeart } from 'react-icons/fi'
import gsap from 'gsap'
import siteData from '../../Data.json'
import { useAuth } from '../auth/useAuth'

type ProductRecord = {
  id: string
  name: string
  category: string
  price_idr: number
  sale_price_idr: number | null
  colors: string[]
  sizes: string[]
  stock_by_size: Record<string, number | undefined>
  material: string
  description: string
  main_image: string[]
  variant_image: string[]
  product_Detail: string[]
}

type Slide = {
  src: string
  alt: string
  colorIndex: number | null
}

const PRODUCTS = siteData.products as ProductRecord[]
const formatPrice = (value: number) => `Rp ${value.toLocaleString('id-ID')}`
const isValidImage = (image: unknown): image is string => typeof image === 'string' && image.length > 0
const colorSwatches: Record<string, string> = {
  black: '#171717',
  blue: '#344f73',
  charcoal: '#454545',
  cream: '#e9dfc9',
  forest: '#315744',
  green: '#47724b',
  grey: '#939393',
  gray: '#939393',
  maroon: '#702d3b',
  navy: '#263b59',
  olive: '#737347',
  red: '#a43c36',
  white: '#f8f8f5',
}

function getSwatchColor(color: string) {
  const normalizedColor = color.toLowerCase()
  return colorSwatches[normalizedColor] ??
    Object.entries(colorSwatches).find(([name]) => normalizedColor.includes(name))?.[1] ??
    '#b9b2a8'
}

function getNearestIndex(element: HTMLElement) {
  const items = Array.from(element.children) as HTMLElement[]
  const canScroll = element.scrollWidth > element.clientWidth + 2
  const atEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - 2
  if (canScroll && atEnd) return items.length - 1

  let nearest = 0
  let best = Infinity
  items.forEach((item, index) => {
    const distance = Math.abs(item.offsetLeft - element.scrollLeft)
    if (distance < best) {
      best = distance
      nearest = index
    }
  })
  return nearest
}

export default function Product() {
  const { id } = useParams()
  const { account, addToCart, toggleWishlist } = useAuth()
  const product = useMemo(() => PRODUCTS.find((entry) => entry.id === id), [id])
  const [size, setSize] = useState<string | null>(null)
  const [colorIndex, setColorIndex] = useState(0)
  const [showSizeError, setShowSizeError] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [actionMessage, setActionMessage] = useState('')
  const infoRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Same category, excluding the product being viewed
  const recommendations = useMemo(() => {
    if (!product) return []
    return PRODUCTS
      .filter((entry) => entry.id !== product.id && entry.category === product.category)
      .slice(0, 4)
  }, [product])

  useEffect(() => {
    if (!infoRef.current) return
    gsap.fromTo(
      infoRef.current.children,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out' }
    )
  }, [id])

  // Reset page state when navigating to another product
  useEffect(() => {
    setSize(null)
    setColorIndex(0)
    setActiveImage(0)
    setShowSizeError(false)
    setActionMessage('')
    carouselRef.current?.scrollTo({ left: 0, behavior: 'instant' })
    window.scrollTo({ top: 0 })
  }, [id])

  useEffect(() => {
    const element = carouselRef.current
    if (!element) return

    let startX = 0
    let startY = 0

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return
      startX = touch.clientX
      startY = touch.clientY
    }

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch || !event.cancelable) return

      const deltaX = touch.clientX - startX
      const deltaY = touch.clientY - startY
      if (Math.abs(deltaX) <= Math.abs(deltaY)) return

      const atStart = element.scrollLeft <= 1
      const atEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - 1
      if ((atStart && deltaX > 0) || (atEnd && deltaX < 0)) {
        event.preventDefault()
      }
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  if (!product) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="space-y-4 text-center">
          <p className="text-lg">Product not found.</p>
          <Link to="/shop" className="btn btn-outline rounded-none">Back to shop</Link>
        </div>
      </div>
    )
  }

  // Carousel slides: main images first, then one image per color variant
  const slides: Slide[] = [
    ...product.main_image
      .filter(isValidImage)
      .map((src, index) => ({
        src,
        alt: `${product.name} view ${index + 1}`,
        colorIndex: null,
      })),
    ...product.variant_image
      .map((src, index) => ({
        src,
        alt: `${product.name} in ${product.colors[index] ?? `color ${index + 1}`}`,
        colorIndex: index,
      }))
      .filter((slide) => isValidImage(slide.src)),
  ]

  const selectedColor = product.colors[colorIndex] ?? product.colors[0]
  const selectedPrice = product.sale_price_idr ?? product.price_idr
  const wishlistIncludesProduct = account?.user.wishlist.includes(product.id) ?? false
  const hasAvailableSize = product.sizes.some((itemSize) => (product.stock_by_size[itemSize] ?? 0) > 0)

  const handleAddToBag = () => {
    if (!size) {
      setShowSizeError(true)
      return
    }
    if ((product.stock_by_size[size] ?? 0) < 1) return

    try {
      addToCart(product.id, { size, color: selectedColor })
      setShowSizeError(false)
      setActionMessage('Added to your shopping bag.')
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Could not add this item to your bag.')
    }
  }

  const handleWishlist = () => {
    try {
      toggleWishlist(product.id)
      setActionMessage(wishlistIncludesProduct ? 'Removed from your wishlist.' : 'Added to your wishlist.')
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Could not update your wishlist.')
    }
  }

  const goTo = (index: number) => {
    const element = carouselRef.current
    const item = element?.children[index] as HTMLElement | undefined
    if (!element || !item) return
    element.scrollTo({ left: item.offsetLeft, behavior: 'smooth' })
  }

  const goByPage = (direction: -1 | 1) => {
    const element = carouselRef.current
    if (!element) return
    const maxScroll = element.scrollWidth - element.clientWidth
    const left = Math.max(0, Math.min(maxScroll, element.scrollLeft + direction * element.clientWidth))
    element.scrollTo({ left, behavior: 'smooth' })
  }

  const handleCarouselScroll = () => {
    const element = carouselRef.current
    if (!element || element.clientWidth === 0) return
    setActiveImage(getNearestIndex(element))
  }

  const handleColorSelect = (index: number) => {
    setColorIndex(index)
    // Jump the carousel to this color's variant image
    const variantSlide = slides.findIndex((slide) => slide.colorIndex === index)
    if (variantSlide !== -1) goTo(variantSlide)
  }

  return (
    <main className="bg-base-100 text-base-content">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_480px]">
        <section aria-label="Product images" className="relative min-w-0 lg:h-[calc(100svh-4rem)]">
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="carousel relative h-full w-full gap-2 overscroll-x-none"
          >
            {slides.map((slide, index) => (
              <div
                key={`${slide.src}-${index}`}
                className={`carousel-item aspect-4/5 w-full bg-base-200 lg:aspect-auto lg:h-full ${
                  slides.length === 1 ? 'lg:w-full' : 'lg:w-[calc(50%-0.25rem)]'
                }`}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  draggable={false}
                  loading={index < 2 ? 'eager' : 'lazy'}
                  className="size-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Thumbnails, previous and next: three separate boxes */}
          {slides.length > 2 && (
            <div className="absolute bottom-4 right-4 hidden items-stretch gap-2 lg:flex">
              <div className="flex gap-1 border border-base-300 bg-base-100/90 p-1.5 backdrop-blur">
                {slides.map((slide, index) => (
                  <button
                    key={`${slide.src}-thumb-${index}`}
                    type="button"
                    aria-label={`Show image ${index + 1}`}
                    aria-current={index === activeImage}
                    onClick={() => goTo(index)}
                    className={`h-11 w-8 overflow-hidden border transition-opacity ${
                      index === activeImage
                        ? 'border-base-content'
                        : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={slide.src} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="size-[58px] border border-base-300 bg-base-100/90 backdrop-blur">
                <button
                  type="button"
                  aria-label="Previous image"
                  disabled={activeImage === 0}
                  onClick={() => goByPage(-1)}
                  className="grid size-full place-items-center transition-colors hover:bg-base-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <FiChevronLeft aria-hidden="true" />
                </button>
              </div>

              <div className="size-[58px] border border-base-300 bg-base-100/90 backdrop-blur">
                <button
                  type="button"
                  aria-label="Next image"
                  disabled={activeImage === slides.length - 1}
                  onClick={() => goByPage(1)}
                  className="grid size-full place-items-center transition-colors hover:bg-base-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <FiChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Mobile dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 lg:hidden" aria-hidden="true">
              {slides.map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 transition-all ${
                    index === activeImage ? 'w-5 bg-base-content' : 'w-1.5 bg-base-content/30'
                  }`}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="px-4 py-8 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:overflow-y-auto lg:px-10 lg:py-12">
          <div ref={infoRef} className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest opacity-60">{product.category}</p>
              <h1 className="text-2xl font-light leading-snug">{product.name}</h1>
              <div className="flex items-center gap-3 text-lg">
                <span>{formatPrice(selectedPrice)}</span>
                {product.sale_price_idr !== null && (
                  <span className="text-sm text-base-content/50 line-through">{formatPrice(product.price_idr)}</span>
                )}
              </div>
            </div>

            {product.colors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm">Color: <span className="opacity-70">{selectedColor}</span></p>
                <div className="flex gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Choose ${color}`}
                      aria-pressed={index === colorIndex}
                      onClick={() => handleColorSelect(index)}
                      className={`size-8 border border-base-300 ${
                        index === colorIndex ? 'ring-2 ring-base-content ring-offset-2 ring-offset-base-100' : ''
                      }`}
                      style={{ backgroundColor: getSwatchColor(color) }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <p>Select size</p>
                <button
                  type="button"
                  className="underline opacity-70 hover:opacity-100"
                  onClick={() => (document.getElementById('size-guide') as HTMLDialogElement | null)?.showModal()}
                >
                  Size guide
                </button>
              </div>
              {product.sizes.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {product.sizes.map((itemSize) => {
                    const inStock = (product.stock_by_size[itemSize] ?? 0) > 0
                    return (
                      <button
                        key={itemSize}
                        type="button"
                        disabled={!inStock}
                        aria-pressed={size === itemSize}
                        onClick={() => {
                          setSize(itemSize)
                          setShowSizeError(false)
                        }}
                        className={`btn btn-outline rounded-none ${size === itemSize ? 'btn-active' : ''}`}
                      >
                        {itemSize}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-base-content/60">No sizes are available for this item.</p>
              )}
              {showSizeError && <p role="alert" className="text-sm text-error">Please select a size.</p>}
              {!hasAvailableSize && <p role="status" className="text-sm text-error">This item is currently out of stock.</p>}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={!hasAvailableSize}
                className="btn btn-neutral w-full rounded-none uppercase tracking-widest"
              >
                Add to shopping bag
              </button>
              <button
                type="button"
                onClick={handleWishlist}
                aria-pressed={wishlistIncludesProduct}
                className="btn btn-outline w-full rounded-none uppercase tracking-widest"
              >
                <FiHeart
                  aria-hidden="true"
                  className={wishlistIncludesProduct ? 'fill-current text-red-500' : ''}
                />
                {wishlistIncludesProduct ? 'Remove from wishlist' : 'Add to wishlist'}
              </button>
              {actionMessage && <p role="status" className="text-sm text-base-content/70">{actionMessage}</p>}
            </div>

            <div className="border-t border-base-300">
              <div className="collapse collapse-plus rounded-none border-b border-base-300">
                <input type="checkbox" defaultChecked />
                <div className="collapse-title text-sm uppercase tracking-wider">Product details</div>
                <div className="collapse-content space-y-3 text-sm">
                  <p className="opacity-80">{product.description}</p>
                  {product.material && <p><span className="font-medium">Material:</span> {product.material}</p>}
                  {product.product_Detail.length > 0 && (
                    <ul className="list-disc space-y-1 pl-5 opacity-80">
                      {product.product_Detail.map((detail) => <li key={detail}>{detail}</li>)}
                    </ul>
                  )}
                  <p className="opacity-60">Style code: {product.id}</p>
                </div>
              </div>
              <div className="collapse collapse-plus rounded-none border-b border-base-300">
                <input type="checkbox" />
                <div className="collapse-title text-sm uppercase tracking-wider">Shipping &amp; returns</div>
                <div className="collapse-content text-sm opacity-80">
                  <p>Shipping and return details will be confirmed before checkout.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {recommendations.length > 0 && (
        <section
          aria-labelledby="recommendations-title"
          className="border-t border-base-300 px-4 py-12 lg:px-10"
        >
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-60">{product.category}</p>
              <h2 id="recommendations-title" className="text-xl font-light">You may also like</h2>
            </div>
            <Link to="/shop" className="text-sm underline opacity-70 hover:opacity-100">View all</Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {recommendations.map((item) => {
              const cover = item.main_image.find(isValidImage)
              return (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="group block border border-base-300 bg-base-100 transition-colors hover:border-base-content"
                >
                  <div className="aspect-4/5 overflow-hidden bg-base-200">
                    {cover && (
                      <img
                        src={cover}
                        alt={item.name}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="space-y-1 border-t border-base-300 p-3 text-sm">
                    <p className="font-light">{item.name}</p>
                    <p className="flex items-center gap-2">
                      <span>{formatPrice(item.sale_price_idr ?? item.price_idr)}</span>
                      {item.sale_price_idr !== null && (
                        <span className="text-xs line-through opacity-50">{formatPrice(item.price_idr)}</span>
                      )}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <dialog id="size-guide" className="modal">
        <div className="modal-box rounded-none">
          <h2 className="mb-4 text-lg font-light">Available sizes</h2>
          <ul className="divide-y divide-base-300">
            {product.sizes.map((itemSize) => (
              <li key={itemSize} className="flex justify-between py-3 text-sm">
                <span>{itemSize}</span>
                <span className="text-base-content/60">
                  {(product.stock_by_size[itemSize] ?? 0) > 0 ? 'In stock' : 'Out of stock'}
                </span>
              </li>
            ))}
          </ul>
          <div className="modal-action">
            <form method="dialog"><button className="btn rounded-none">Close</button></form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>
    </main>
  )
}