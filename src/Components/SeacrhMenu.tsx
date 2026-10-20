import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

import siteData from '../../Data.json'
import { FiX, FiSearch } from 'react-icons/fi'
import AnimatedContent from './animated-content'

const PAGE_SIZE = 12

function getPageItems(current: number, total: number): (number | '…')[] {
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)

    const pages = new Set([1, total, current - 1, current, current + 1])
    const sorted = [...pages].filter((value) => value >= 1 && value <= total).sort((a, b) => a - b)
    const items: (number | '…')[] = []
    sorted.forEach((value, index) => {
        if (index > 0 && value - sorted[index - 1] > 1) items.push('…')
        items.push(value)
    })
    return items
}

type SearchProps = {
    isSearchOpen: boolean
    toggleSearch: () => void
}

type SearchItem = {
    id: string
    name: string
    category: string
    images: string[]
    price_idr: number
    sale_price_idr: number | null
    rating: number
    review_count: number
    is_new: boolean
    featured: boolean
    material: string
    colors: string[]
    tags: string[]
    description: string
}

const SEARCH_ITEMS: SearchItem[] = siteData.products.map((product) => ({
    ...product,
    images: product.main_image.slice(0, 10),
    rating: 0,
    review_count: 0,
}))
const SEARCH_CATEGORIES = [...new Set(SEARCH_ITEMS.map((p) => p.category))]

const TRENDING = SEARCH_CATEGORIES
    .map((category) => ({
        category,
        reviews: SEARCH_ITEMS.filter((p) => p.category === category).reduce((sum, p) => sum + p.review_count, 0),
    }))
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 5)
    .map((item) => item.category)

const SIDEBAR = [
    {
        title: 'New in',
        links: [
            { label: 'Women', to: '/shop?category=Women&sort=new' },
            { label: 'Men', to: '/shop?category=Men&sort=new' },
        ],
    },
    {
        title: 'Social Media',
        links: [
            { label: 'Instagram', to: 'https://www.instagram.com/' },
            { label: 'Facebook', to: 'https://www.facebook.com/' },
        ],
    },
]

const ALL_PRODUCTS = [...SEARCH_ITEMS]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating || b.review_count - a.review_count)

const formatPrice = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

function SearchProductCard({ product, onSelect }: { product: SearchItem; onSelect: () => void }) {
    const [imageLoaded, setImageLoaded] = useState(false)

    return (
        <Link to={`/product/${product.id}`} onClick={onSelect} className="group block min-w-0">
            <div className="relative aspect-3/4 overflow-hidden bg-base-200">
                {!imageLoaded && (
                    <div className="skeleton absolute inset-0 z-10 rounded-none" aria-hidden="true" />
                )}
                <figure className="hover-gallery h-full w-full">
                    {product.images.map((src, i) => (
                        <img
                            key={src + i}
                            src={src}
                            alt={i === 0 ? product.name : ''}
                            loading="lazy"
                            onLoad={() => {
                                if (i === 0) setImageLoaded(true)
                            }}
                            onError={(e) => {
                                e.currentTarget.style.visibility = 'hidden'
                                if (i === 0) setImageLoaded(true)
                            }}
                            className="h-full w-full object-cover"
                        />
                    ))}
                </figure>

                {product.is_new && (
                    <span className="badge badge-sm pointer-events-none absolute left-2 top-2 z-20 border-0 bg-base-100 font-jost uppercase tracking-wider sm:left-3 sm:top-3">
                        New
                    </span>
                )}
            </div>
            <div className="px-1 pt-3 font-jost text-sm sm:px-3 sm:pt-4">
                <p className="truncate transition-colors duration-300 group-hover:text-accent">{product.name}</p>
                <p className="mt-2 sm:mt-5">
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

export default function SearchMenu({ isSearchOpen, toggleSearch }: SearchProps) {
    const [query, setQuery] = useState('')
    const [page, setPage] = useState(1)
    const inputRef = useRef<HTMLInputElement>(null)

    // Focus the input once the panel has slid in
    useEffect(() => {
        if (!isSearchOpen) return
        const timer = setTimeout(() => inputRef.current?.focus(), 400)
        return () => clearTimeout(timer)
    }, [isSearchOpen])

    useEffect(() => {
        if (!isSearchOpen) return

        const previousDocumentOverflow = document.documentElement.style.overflow
        const previousBodyOverflow = document.body.style.overflow
        document.documentElement.style.overflow = 'hidden'
        document.body.style.overflow = 'hidden'

        return () => {
            document.documentElement.style.overflow = previousDocumentOverflow
            document.body.style.overflow = previousBodyOverflow
        }
    }, [isSearchOpen])

    useEffect(() => {
        if (!isSearchOpen) return

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') toggleSearch()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [isSearchOpen, toggleSearch])

    const trimmed = query.trim()
    const words = trimmed.toLowerCase().split(/\s+/).filter(Boolean)
    const isSearching = words.length > 0

    const matches = isSearching
        ? SEARCH_ITEMS.filter((p) => {
            const haystack = [p.name, p.category, p.material, p.description, p.colors.join(' '), p.tags.join(' ')]
                .join(' ')
                .toLowerCase()
            return words.every((word) => haystack.includes(word))
        })
        : ALL_PRODUCTS

    const noMatch = isSearching && matches.length === 0
    const list = noMatch ? ALL_PRODUCTS : matches
    const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
    const currentPage = Math.min(page, pageCount)
    const visibleProducts = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    useEffect(() => setPage(1), [trimmed])

    const linkClass = 'link link-hover font-jost text-sm underline underline-offset-4 hover:text-accent'
    const headingClass = 'font-jost text-xs font-semibold uppercase tracking-wider'

    const scrollRow =
        '-mx-4 flex flex-nowrap items-center gap-x-5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 md:mx-0 md:px-0'

    return (
        <div
            aria-hidden={!isSearchOpen}
            className={`bg-black/50 fixed inset-0 z-100 transition-[opacity,visibility] duration-550 ${isSearchOpen ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'}`}
        >
            <div className={`bg-base-100 fixed inset-0 z-120 overflow-x-hidden overflow-y-auto overscroll-contain transition-all duration-700 ${isSearchOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-1000 scale-50 opacity-0'}`}>
                <div className="mx-auto max-w-360 px-4 pb-16 sm:px-6 sm:pb-20">
                    <div className="flex items-center justify-between gap-2 pt-4 md:block md:pt-5">
                        <h1 className="order-1 whitespace-nowrap text-left font-jost text-base font-bold uppercase tracking-[0.18em] min-[400px]:text-xl md:text-center md:text-5xl md:tracking-[0.3em]">
                            {siteData.site.brand.name}
                        </h1>

                        <button
                            type="button"
                            aria-label="Close search"
                            onClick={toggleSearch}
                            className="close-menu-button group order-2 -mr-2 inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-full px-2 transition duration-300 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:bg-transparent! max-md:text-base-content! max-md:hover:bg-transparent! md:absolute md:left-4 md:top-4 md:z-10 md:mr-0 md:h-10 md:px-2.5"
                        >
                            <FiX className="h-5 w-5 shrink-0" aria-hidden="true" />
                            <span className="max-w-0 font-jost overflow-hidden whitespace-nowrap text-lg font-bold opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-16 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-16 group-focus-visible:opacity-100 max-md:hidden">
                                close
                            </span>
                        </button>
                    </div>

                    <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-x-16 gap-y-6 md:mt-12 md:gap-y-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-y-10 xl:gap-x-32">
                        {/* Search input + trending */}
                        <div className="order-1 min-w-0 lg:order-0 lg:col-start-2">
                            <form
                                role="search"
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    inputRef.current?.blur()
                                }}
                                className="max-w-179"
                            >
                                <label className="input input-lg w-full rounded-full shadow-none transition-[box-shadow,border-color] duration-300 ease-out focus-within:border-base-content/30 focus-within:shadow-lg focus-within:outline-none">
                                    <FiSearch className="h-5 w-5 shrink-0 opacity-60" aria-hidden="true" />
                                    <input
                                        id="site-search"
                                        ref={inputRef}
                                        type="text"
                                        inputMode="search"
                                        enterKeyHint="search"
                                        autoComplete="off"
                                        aria-label="Search for products"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder={`Search ${TRENDING[0] ?? 'products'}`}
                                        className="grow font-jost font-light"
                                    />

                                    {query ? (
                                        <button
                                            type="button"
                                            aria-label="Clear search"
                                            onClick={() => {
                                                setQuery('')
                                                inputRef.current?.focus()
                                            }}
                                            className="btn btn-ghost btn-circle btn-xs"
                                        >
                                            <FiX className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    ) : (
                                        <kbd className="kbd kbd-sm max-md:hidden">Esc</kbd>
                                    )}
                                </label>
                            </form>

                            <div className="mt-5 sm:mt-6 md:flex md:flex-wrap md:items-center md:gap-x-4 md:gap-y-2">
                                <h2 className="font-jost text-sm text-base-content md:text-base-content/60 font-bold">
                                    Trending Searches
                                </h2>

                                <div className={`${scrollRow} mt-3 md:contents`}>
                                    {TRENDING.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setQuery(item)}
                                            className={`btn btn-outline btn-sm shrink-0 rounded-full font-jost font-normal ${trimmed.toLowerCase() === item.toLowerCase() ? 'btn-active' : ''}`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <aside className="order-2 min-w-0 lg:order-0 lg:col-start-1 lg:row-start-2">
                            <div className="flex flex-col gap-6 md:gap-10">
                                {SIDEBAR.map((section) => (
                                    <div key={section.title}>
                                        <h2 className={headingClass}>{section.title}</h2>
                                        <ul className={`${scrollRow} mt-3 md:mt-4 md:flex-wrap md:gap-y-3 md:gap-x-6 md:overflow-visible md:pb-0 lg:mt-5 lg:flex-col lg:items-start lg:gap-y-4`}>
                                            {section.links.map((link) => (
                                                <li key={link.label} className="shrink-0 whitespace-nowrap">
                                                    <Link to={link.to} onClick={toggleSearch} className={linkClass}>
                                                        {link.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </aside>

                        <section className="order-3 min-w-0 lg:order-0 lg:col-start-2 lg:row-start-2" aria-live="polite">
                            <h2 className={`${headingClass} mb-6`}>
                                {noMatch
                                    ? `No results for “${trimmed}”. Here is everything`
                                    : isSearching
                                        ? `${list.length} result${list.length === 1 ? '' : 's'} for “${trimmed}”`
                                        : `All products (${list.length})`}
                            </h2>

                            {list.length === 0 ? (
                                <p className="font-jost text-base font-light">No products found. Try another search.</p>
                            ) : (
                                isSearchOpen && <AnimatedContent key={`${trimmed}-${currentPage}`} trigger="mount" distance={24} duration={0.45} stagger={0.05} className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4">
                                    {visibleProducts.map((product) => (
                                        <SearchProductCard key={product.id} product={product} onSelect={toggleSearch} />
                                    ))}
                                </AnimatedContent>
                            )}
                            {list.length > PAGE_SIZE && (
                                <nav aria-label="Search result pages" className="mt-16 flex items-center justify-center gap-2 border-t border-base-content/10 pt-8 sm:gap-4">
                                    <button type="button" className="font-jost text-xs uppercase tracking-[0.2em] transition-colors disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:text-accent px-2 py-2" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>← Prev</button>
                                    <ul className="flex items-center gap-1">
                                        {getPageItems(currentPage, pageCount).map((item, index) => item === '…' ? (
                                            <li key={`gap-${index}`} className="px-2 font-jost text-sm text-base-content/40" aria-hidden="true">…</li>
                                        ) : (
                                            <li key={item}>
                                                <button type="button" onClick={() => setPage(item)} aria-current={item === currentPage ? 'page' : undefined} aria-label={`Page ${item}`} className={`size-10 border-b font-jost text-sm transition-colors ${item === currentPage ? 'border-base-content text-base-content' : 'border-transparent text-base-content/50 hover:text-accent'}`}>
                                                    {item}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    <button type="button" className="font-jost text-xs uppercase tracking-[0.2em] transition-colors disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:text-accent px-2 py-2" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next →</button>
                                </nav>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
