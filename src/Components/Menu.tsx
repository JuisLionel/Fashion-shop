import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'

import siteData from '../../Data.json'

type MenuProps = {
    isMenuOpen: boolean
    toggleMenu: () => void
}

type Product = { id: string; name: string; category: string; variant_image: string[] }
type NavLink = { label: string; to: string }
type Section = {
    label: string
    to?: string
    category?: string
    links?: NavLink[]
}

const PRODUCTS: Product[] = siteData.products
const CATEGORIES = [...new Set(PRODUCTS.map((p) => p.category))]

const categoryParam = (c: string) => encodeURIComponent(c)

const MENU_GROUPS: Section[][] = [
    [
        { label: 'New In', to: '/shop?sort=new' },
        { label: 'Sale', to: '/shop?sale=true' },
    ],
    CATEGORIES.map((category) => ({
        label: category,
        category,
        links: [
            { label: 'New In', to: `/shop?category=${categoryParam(category)}&sort=new` },
            { label: `All ${category}`, to: `/shop?category=${categoryParam(category)}` },
        ],
    })),
    [
        {
            label: 'Services',
            links: [
                { label: 'Size guide', to: '/services/size-guide' },
                { label: 'Shipping', to: '/services/shipping' },
                { label: 'Exchanges', to: '/services/exchanges' },
            ],
        },
    ],
]

const SMALL_LINKS: NavLink[] = [
    { label: 'Find a Store', to: '/stores' },
    { label: 'Indonesia', to: '/' },
    { label: 'Beralih Ke Bahasa Indonesia', to: '/' },
    { label: 'Sustainability', to: '/sustainability' },
]

const LAST_GROUP_INDEX = MENU_GROUPS.length - 1

const itemClass =
    'group flex w-full cursor-pointer items-center justify-between py-3.5 text-left font-jost text-xl font-light leading-6 transition-colors duration-300 hover:text-accent md:py-[11px]'

const secondaryClass = 'max-md:py-3 max-md:text-base'

// Always visible on phones; on laptop it fades in on hover or focus
const RowChevron = () => (
    <FiChevronRight
        className="h-5 w-5 shrink-0 transition-all duration-300 md:-translate-x-2 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100 md:group-focus-visible:translate-x-0 md:group-focus-visible:opacity-100"
        aria-hidden="true"
    />
)

export default function Menu({ isMenuOpen, toggleMenu }: MenuProps) {
    const [active, setActive] = useState<Section | null>(null)
    const [shown, setShown] = useState<Section | null>(null)

    const drawerRef = useRef<HTMLDivElement>(null)
    const level1Ref = useRef<HTMLElement>(null)
    const level2Ref = useRef<HTMLElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const timeline = useRef<gsap.core.Timeline | null>(null)

    const tiles = shown?.category ? PRODUCTS.filter((p) => p.category === shown.category).slice(0, 6) : []
    const showPanel = active?.category !== undefined

    const openSection = (section: Section) => {
        setActive(section)
        setShown(section)
    }

    const close = () => {
        setActive(null)
        toggleMenu()
    }

    useEffect(() => {
        if (!isMenuOpen) return

        const previousDocumentOverflow = document.documentElement.style.overflow
        const previousBodyOverflow = document.body.style.overflow
        document.documentElement.style.overflow = 'hidden'
        document.body.style.overflow = 'hidden'

        return () => {
            document.documentElement.style.overflow = previousDocumentOverflow
            document.body.style.overflow = previousBodyOverflow
        }
    }, [isMenuOpen])

    useEffect(() => {
        if (!isMenuOpen) return

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMenuOpen])

    useGSAP(
        () => {
            gsap.set(level2Ref.current, { autoAlpha: 0 })
            gsap.set(panelRef.current, { xPercent: -100, autoAlpha: 0 })
        },
        { scope: drawerRef }
    )

    useGSAP(
        () => {
            const level1 = level1Ref.current
            const level2 = level2Ref.current
            const panel = panelRef.current
            if (!level1 || !level2 || !panel) return

            if (!active && !timeline.current) return

            timeline.current?.kill()
            const tl = gsap.timeline()
            timeline.current = tl

            if (active) {
                tl.to(level1, { autoAlpha: 0, duration: 0.2, ease: 'power1.out' }, 0)
                tl.set(level2, { autoAlpha: 1 }, 0.1)
                tl.fromTo(
                    '.lvl2-item',
                    { autoAlpha: 0, y: 10 },
                    { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.07 },
                    0.15
                )

                if (showPanel) {
                    tl.set(panel, { autoAlpha: 1 }, 0)
                    tl.fromTo(panel, { xPercent: -100 }, { xPercent: 0, duration: 0.6, ease: 'power3.out' }, 0.05)

                    tl.fromTo(
                        '.tile-img',
                        { clipPath: 'inset(0% 0% 100% 0%)' },
                        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power2.inOut', stagger: 0.12 },
                        0.4
                    )
                    tl.fromTo(
                        '.tile-cap',
                        { autoAlpha: 0 },
                        { autoAlpha: 1, duration: 0.4, ease: 'power1.out', stagger: 0.12 },
                        0.4
                    )
                }
            } else {
                tl.to(level2, { autoAlpha: 0, duration: 0.15, ease: 'power1.out' }, 0)
                tl.to(panel, { xPercent: -100, duration: 0.55, ease: 'power3.inOut' }, 0)
                tl.set(panel, { autoAlpha: 0 }, 0.6)
                tl.set(level1, { autoAlpha: 1 }, 0.15)
                tl.fromTo(
                    '.lvl1-item',
                    { autoAlpha: 0, y: 8 },
                    { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.04 },
                    0.15
                )
            }

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) tl.progress(1)
        },
        { scope: drawerRef, dependencies: [active] }
    )

    return (
        <div
            className={`fixed inset-0 z-100 bg-black/50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            onClick={(event) => { if (event.target === event.currentTarget) close() }}
        >
            <div
                ref={drawerRef}
                className={`fixed inset-y-0 left-0 z-50 w-full transition-[translate,visibility] duration-300 ease-out md:w-120 md:max-w-[90vw] ${isMenuOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'}`}
            >
                <div className="relative z-10 flex h-full flex-col bg-base-100 transition-colors duration-300">
                    <div className="flex shrink-0 justify-end p-4 md:justify-start">
                        <button
                            type="button"
                            aria-label="Close menu"
                            onClick={close}
                            className="close-menu-button group inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition duration-300 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:bg-base-content! max-md:text-base-100! max-md:shadow-lg md:h-10 md:w-auto md:px-2.5"
                        >
                            <FiX className="h-5 w-5 shrink-0" aria-hidden="true" />
                            <span className="max-w-0 font-jost overflow-hidden whitespace-nowrap text-lg font-bold opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-16 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-16 group-focus-visible:opacity-100 max-md:hidden">
                                close
                            </span>
                        </button>
                    </div>

                    <div className="relative flex-1 overflow-hidden">
                        <nav ref={level1Ref} aria-label="Main menu" className="absolute inset-0 overflow-y-auto overscroll-contain px-6 pb-10 pt-2 md:px-8 md:pt-4">
                            {MENU_GROUPS.map((group, groupIndex) => (
                                <ul key={groupIndex} className={groupIndex > 0 ? 'mt-6' : ''}>
                                    {group.map((section) => {
                                        const cls = `${itemClass} ${groupIndex === LAST_GROUP_INDEX ? secondaryClass : ''}`

                                        return (
                                            <li key={section.label} className="lvl1-item">
                                                {section.links ? (
                                                    <button type="button" onClick={() => openSection(section)} className={cls}>
                                                        {section.label}
                                                        <RowChevron />
                                                    </button>
                                                ) : (
                                                    <Link to={section.to ?? '/'} onClick={close} className={cls}>
                                                        {section.label}
                                                    </Link>
                                                )}
                                            </li>
                                        )
                                    })}
                                </ul>
                            ))}

                            <ul className="mt-6 md:mt-10">
                                {SMALL_LINKS.map((link) => (
                                    <li key={link.label} className="lvl1-item">
                                        <Link
                                            to={link.to}
                                            onClick={close}
                                            className="block py-2.5 font-jost text-base font-light transition-colors duration-300 hover:text-accent md:py-2 md:text-[15px]"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <ul className="mt-10 md:hidden">
                                <li className="lvl1-item">
                                    <Link
                                        to="/sign-in"
                                        onClick={close}
                                        className="inline-block font-jost text-base font-light underline underline-offset-4 transition-colors duration-300 hover:text-accent"
                                    >
                                        Sign In
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        <nav ref={level2Ref} aria-label={shown?.label} className="absolute inset-0 overflow-y-auto overscroll-contain px-6 pb-10 pt-2 md:px-8 md:pt-4">
                            <button
                                type="button"
                                onClick={() => setActive(null)}
                                className="inline-flex cursor-pointer items-center gap-3 font-jost text-xl font-light transition-colors duration-300 hover:text-accent"
                            >
                                <FiChevronLeft className="h-6 w-6" aria-hidden="true" />
                                {shown?.label}
                            </button>

                            <ul className="mt-8 md:mt-10">
                                {shown?.links?.map((link) => (
                                    <li key={link.label} className="lvl2-item">
                                        <Link to={link.to} onClick={close} className={itemClass}>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>

                <div
                    ref={panelRef}
                    className="absolute inset-y-0 left-full z-0 hidden w-115 overflow-y-auto bg-base-100 transition-colors duration-300 lg:block"
                >
                    <div className="grid grid-cols-2 gap-x-2 gap-y-6">
                        {tiles.map((product) => (
                            <Link key={product.id} to={`/product/${product.id}`} onClick={close} className="group block">
                                <div className="tile-img aspect-4/5 overflow-hidden bg-base-200">
                                    <img
                                        src={product.variant_image[0]}
                                        alt=""
                                        loading="lazy"
                                        onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <p className="tile-cap mt-2 truncate font-jost text-[15px] font-light transition-colors duration-300 group-hover:text-accent">
                                    {product.name}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}