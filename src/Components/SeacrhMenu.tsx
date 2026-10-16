import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import products from '../../Data.json'
import { FiX } from 'react-icons/fi'

type SearchProps = {
    isSearchOpen: boolean
    toggleSearch: () => void
}

type SearchItem = {
    id: string
    name: string
    category: string
    image: string
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

const SEARCH_ITEMS = products as unknown as SearchItem[]
const SEARCH_CATEGORIES = [...new Set(SEARCH_ITEMS.map((p) => p.category))]

const TRENDING = SEARCH_CATEGORIES
    .map((category) => ({
        category,
        reviews: SEARCH_ITEMS.filter((p) => p.category === category).reduce((sum, p) => sum + p.review_count, 0),
    }))
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 5)
    .map((item) => item.category)

// New in: only categories that have at least one product marked is_new
const SEARCH_NEW_IN = SEARCH_CATEGORIES
    .filter((category) => SEARCH_ITEMS.some((p) => p.category === category && p.is_new))
    .map((category) => ({ label: category, to: `/shop?category=${encodeURIComponent(category)}&sort=new` }))

// Every product, best ones first: featured, then best rated
const ALL_PRODUCTS = [...SEARCH_ITEMS]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating || b.review_count - a.review_count)

const formatPrice = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

export default function Search({ isSearchOpen, toggleSearch }: SearchProps) {
    const [query, setQuery] = useState('')

    // Lock page scroll while open
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

    // Close with Escape
    useEffect(() => {
        if (!isSearchOpen) return

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') toggleSearch()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [isSearchOpen, toggleSearch])

    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const isSearching = words.length > 0

    const matches = isSearching
        ? SEARCH_ITEMS.filter((p) => {
            const haystack = [p.name, p.category, p.material, p.description, p.colors.join(' '), p.tags.join(' ')]
                .join(' ')
                .toLowerCase()
            return words.every((word) => haystack.includes(word))
        }).slice(0, 9)
        : ALL_PRODUCTS

    const noMatch = isSearching && matches.length === 0
    const list = noMatch ? ALL_PRODUCTS : matches

    const linkClass = 'font-jost text-sm underline underline-offset-4 transition-colors duration-300 hover:text-accent'
    const headingClass = 'font-jost text-xs font-semibold uppercase tracking-wider'

    // Horizontal scroll row on phones (bleeds to the screen edge, hidden scrollbar), normal layout from md up
    const scrollRow =
        '-mx-4 flex flex-nowrap items-center gap-x-5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 md:mx-0 md:px-0'

    return (
        <div
            aria-hidden={!isSearchOpen}
            className={`bg-black/50 fixed inset-0 z-100 transition-[opacity,visibility] duration-550 ${isSearchOpen ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'}`}
        >
            <div className={`bg-base-100 fixed inset-0 z-120 overflow-x-hidden overflow-y-auto overscroll-contain transition-all duration-700 ${isSearchOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-1000 scale-50 opacity-0'}`}>
                <div className="mx-auto max-w-360 px-4 pb-16 sm:px-6 sm:pb-20">
                    {/* Phone: title */}
                    <div className="flex items-center justify-between gap-2 pt-4 md:block md:pt-5">
                        <h1 className="order-1 whitespace-nowrap text-left font-jost text-base font-bold uppercase tracking-[0.18em] min-[400px]:text-xl md:text-center md:text-5xl md:tracking-[0.3em]">
                            Fashion Shop
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
                                onSubmit={(e) => e.preventDefault()}
                                className="flex max-w-179 items-baseline gap-2 border-b border-base-300 pb-3"
                            >
                                <label htmlFor="site-search" className="sr-only shrink-0 font-jost text-lg font-light text-base-content/60 sm:not-sr-only">
                                    Search for:
                                </label>
                                <input
                                    id="site-search"
                                    type="search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={TRENDING[0]}
                                    className="w-full min-w-0 bg-transparent font-jost text-lg font-light outline-none placeholder:text-base-content/40"
                                />
                            </form>

                            <div className="mt-5 sm:mt-6 md:flex md:flex-wrap md:items-center md:gap-x-6 md:gap-y-2">
                                <h2 className="font-jost text-sm text-base-content md:text-base-content/60 font-bold">
                                    Trending Searches
                                </h2>

                                <div className={`${scrollRow} mt-3 md:contents`}>
                                    {TRENDING.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setQuery(item)}
                                            className={`shrink-0 cursor-pointer whitespace-nowrap ${linkClass}`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* New in: horizontal scroll on phones, vertical sidebar on lg+ */}
                        <aside className="order-2 min-w-0 lg:order-0 lg:col-start-1 lg:row-start-2">
                            <h2 className={headingClass}>New in</h2>
                            <ul className={`${scrollRow} mt-3 md:mt-4 md:flex-wrap md:gap-y-3 md:gap-x-6 md:overflow-visible md:pb-0 lg:mt-5 lg:flex-col lg:items-start lg:gap-y-4`}>
                                {SEARCH_NEW_IN.map((link) => (
                                    <li key={link.label} className="shrink-0 whitespace-nowrap">
                                        <Link to={link.to} onClick={toggleSearch} className={linkClass}>{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </aside>

                        {/* Results */}
                        <section className="order-3 min-w-0 lg:order-0 lg:col-start-2 lg:row-start-2" aria-live="polite">
                            <h2 className={`${headingClass} mb-6`}>
                                {noMatch
                                    ? `No results for “${query.trim()}”. Here is everything`
                                    : isSearching
                                        ? `${list.length} result${list.length === 1 ? '' : 's'} for “${query.trim()}”`
                                        : `All products (${list.length})`}
                            </h2>

                            {list.length === 0 ? (
                                <p className="font-jost text-base font-light">No products found. Try another search.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4">
                                    {list.map((product) => (
                                        <Link key={product.id} to={`/product/${product.id}`} onClick={toggleSearch} className="group block min-w-0">
                                            <div className="relative aspect-3/4 overflow-hidden bg-base-200 transition-colors duration-300">
                                                <img
                                                    src={product.image}
                                                    alt=""
                                                    loading="lazy"
                                                    onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                {product.is_new && (
                                                    <span className="absolute left-2 top-2 font-jost text-[11px] uppercase tracking-wider sm:left-3 sm:top-3">New</span>
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
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}