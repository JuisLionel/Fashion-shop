import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import Search from './SeacrhMenu'
import Menu from './Menu'

import { RiAccountCircleLine } from 'react-icons/ri'
import { FiMoon, FiSun, FiSearch, FiMenu, FiShoppingCart } from 'react-icons/fi'

const THEME_STORAGE_KEY = 'shirt-shop-theme'
type Theme = 'tepian-light' | 'tepian-dark'

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme === 'tepian-dark' || savedTheme === 'tepian-light') return savedTheme

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'tepian-dark'
    : 'tepian-light'
}

export default function Navbar() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const isDark = theme === 'tepian-dark'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100)

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  const textButton =
    'btn btn-ghost btn-sm h-10 min-h-10 w-10 cursor-pointer justify-center gap-2 rounded-full px-0 font-josefin text-xl leading-none hover:text-accent md:btn-md md:h-12 md:min-h-12 md:w-auto md:justify-start md:px-3'

  const iconButton = 'btn btn-ghost btn-circle btn-sm hover:text-accent md:btn-md'

  return (
    <>
      {/* Navbar */}
      <div className="sticky top-0 z-50 h-0">

        <header className={`navbar main-head absolute inset-x-0 top-0 flex items-center justify-between gap-1 px-4 py-2 text-base-content md:px-6 md:py-4 ${isScrolled ? 'bg-base-100 slidedown' : 'bg-base-100/0'}`}>
          <div className="contents md:flex md:items-center md:gap-6" id="Right">
            <button onClick={toggleMenu} aria-label="Menu" className={`order-5 ${textButton}`}>
              <FiMenu className="h-6 w-6 shrink-0 md:h-5 md:w-5" aria-hidden="true" />
              <span className="hidden h-6 items-center md:inline-flex">Menu</span>
            </button>

            <button onClick={toggleSearch} aria-label="Search" className={`order-4 ${textButton}`}>
              <FiSearch className="h-6 w-6 shrink-0 md:h-5 md:w-5" aria-hidden="true" />
              <span className="hidden h-6 items-center md:inline-flex">Search</span>
            </button>
          </div>

          <h1
            id="center"
            className="order-1 mr-auto whitespace-nowrap font-jost text-base font-bold uppercase tracking-[0.18em] min-[400px]:text-xl md:order-0 md:mr-0 md:pt-5 md:text-3xl md:tracking-[0.3em] lg:text-3xl"
          >
            Fashion Shop
          </h1>

          <div className="contents md:flex md:items-center md:justify-end md:gap-4" id="Left">
            <Link to="/Wishlist" aria-label="Cart" className={`order-2 md:order-0 ${iconButton}`}>
              <FiShoppingCart className="h-6 w-6" aria-hidden="true" />
            </Link>

            <div className="dropdown dropdown-hover dropdown-bottom dropdown-end order-3 md:dropdown-center md:order-0">
              <button tabIndex={0} role="button" aria-label="Account" className={iconButton}>
                <RiAccountCircleLine className="h-6 w-6" aria-hidden="true" />
              </button>

              <ul tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-box z-1 w-30 p-2 border border-base-300 shadow-lg">
                <li><a href="/sign-in">Sign In</a></li>
                <li><a href="/sign-up">Sign Up</a></li>
              </ul>
            </div>

            <label className={`swap swap-rotate max-md:hidden ${iconButton}`}>
              <input
                type="checkbox"
                checked={isDark}
                onChange={(e) => setTheme(e.target.checked ? 'tepian-dark' : 'tepian-light')}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              />
              <FiSun className="swap-off h-6 w-6" aria-hidden="true" />
              <FiMoon className="swap-on h-6 w-6" aria-hidden="true" />
            </label>
          </div>
        </header>
      </div>

      {/* Menu */}
      <Menu isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />

      {/* Search */}
      <Search isSearchOpen={isSearchOpen} toggleSearch={toggleSearch} />
    </>
  )
}