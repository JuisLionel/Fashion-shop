import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import SearchMenu from './SeacrhMenu'
import Menu from './Menu'
import ContactMenu from './ContactMenu'

import siteData from '../../Data.json'

import { PiHandbagSimpleLight } from 'react-icons/pi'
import { FiMoon, FiSun, FiSearch, FiMenu, FiPlus, FiUser } from 'react-icons/fi'

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
  const isDark = theme === 'tepian-dark'

  const [isScrolled, setIsScrolled] = useState(false)

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isContactOpen, setContactOpen] = useState(false)

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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen)
  const toggleContact = () => setContactOpen(!isContactOpen)

  const color = isScrolled ? '!text-base-content' : '!text-[#111111]'

  const textButton =
    `btn btn-ghost btn-sm inline-flex h-10 min-h-10 w-10 min-w-10 cursor-pointer items-center justify-center gap-2 rounded-full p-0 font-jost text-xl font-normal leading-none hover:!text-accent md:btn-md md:h-12 md:min-h-12 md:w-auto md:min-w-0 md:px-3 ${color}`

  const iconButton =
    `btn btn-ghost btn-sm inline-flex h-10 min-h-10 w-10 min-w-10 items-center justify-center rounded-full p-0 hover:!text-accent md:btn-md md:h-12 md:min-h-12 md:w-12 md:min-w-12 ${color}`

  return (
    <>
      <div className="sticky top-0 z-50 h-0">
        <header
          className={`navbar main-head absolute inset-x-0 top-0 flex flex-nowrap items-center justify-between gap-1 px-4 py-2 md:px-6 md:py-4 ${isScrolled ? 'bg-base-100 text-base-content slidedown' : 'bg-base-100/0 text-[#111111]'
            }`}
        >
          <div className="flex items-center gap-1 max-md:contents md:gap-6" id="Right">
            <button onClick={toggleMenu} aria-label="Menu" className={`order-5 ${textButton}`}>
              <FiMenu className="h-6 w-6 shrink-0 md:h-5 md:w-5" strokeWidth={1.5} aria-hidden="true" />
              <span className="hidden leading-none md:block">menu</span>
            </button>

            <button onClick={toggleSearch} aria-label="Search" className={`order-4 ${textButton}`}>
              <FiSearch className="h-6 w-6 shrink-0 md:h-5 md:w-5" strokeWidth={1.5} aria-hidden="true" />
              <span className="hidden leading-none md:block">search</span>
            </button>
          </div>

          <h1
            id="center"
            className="whitespace-nowrap font-jost text-xl font-bold uppercase tracking-[0.25em] max-md:order-1 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:text-3xl md:tracking-[0.3em]"
          >
            <span className="md:hidden">Fashion</span>
            <span className="hidden md:inline">{siteData.site.brand.name}</span>
          </h1>

          <div className="flex items-center justify-end gap-1 max-md:contents md:gap-4" id="Left">
            <button onClick={toggleContact} aria-label="Contact" className={`max-md:hidden ${textButton}`}>
              <FiPlus className="h-6 w-6 shrink-0 md:h-5 md:w-5" strokeWidth={1.5} aria-hidden="true" />
              <span className="hidden leading-none md:block">contact us</span>
            </button>

            <Link to="/Wishlist" aria-label="Wishlist" className={`order-2 max-md:ml-auto md:order-0 ${iconButton}`}>
              <PiHandbagSimpleLight className="h-6 w-6" aria-hidden="true" />
            </Link>

            <div className="dropdown dropdown-hover dropdown-bottom dropdown-end order-3 md:order-0">
              <button tabIndex={0} role="button" aria-label="Account" className={iconButton}>
                <FiUser className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
              </button>

              <ul
                tabIndex={-1}
                className="dropdown-content menu z-1 w-44 rounded-box border border-base-300 bg-base-100 p-2 text-base-content shadow-lg"
              >
                <li><a href="/sign-in">Sign In</a></li>
                <li><a href="/sign-up">Sign Up</a></li>

                <li className="mt-1 border-t border-base-300 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      setTheme(isDark ? 'tepian-light' : 'tepian-dark')
                      e.currentTarget.blur()
                    }}
                    aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                  >
                    {isDark ? (
                      <FiMoon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <FiSun className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                    {isDark ? 'Dark' : 'Light'}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>
      </div>

      {/* Menu */}
      <Menu isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />

      {/* Search */}
      <SearchMenu isSearchOpen={isSearchOpen} toggleSearch={toggleSearch} />

      {/* Contact */}
      <ContactMenu isOpen={isContactOpen} onClose={toggleContact} />
    </>
  )
}