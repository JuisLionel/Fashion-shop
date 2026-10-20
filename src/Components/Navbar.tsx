import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import SearchMenu from './SeacrhMenu'
import Menu from './Menu'
import ContactMenu from './ContactMenu'
import { useAuth } from '../auth/useAuth'
import { pulseIcon } from './pulseIcon'

import { PiHandbagSimpleLight } from 'react-icons/pi'
import { FiMoon, FiSun, FiSearch, FiMenu, FiPlus, FiUser } from 'react-icons/fi'

const THEME_STORAGE_KEY = 'shirt-shop-theme'
type Theme = 'tepian-light' | 'tepian-dark'
type NavbarProps = { isHome: boolean }

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme === 'tepian-dark' || savedTheme === 'tepian-light') return savedTheme

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'tepian-dark'
    : 'tepian-light'
}

export default function Navbar({ isHome }: NavbarProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const isDark = theme === 'tepian-dark'

  const [isScrolled, setIsScrolled] = useState(false)

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isContactOpen, setContactOpen] = useState(false)
  const { account, isSignedIn, signOut } = useAuth()
  const cartCount = account?.user.cart
    .filter((item) => Number.isInteger(item.quantity) && item.quantity > 0)
    .reduce((total, item) => total + item.quantity, 0) ?? 0

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    if (!isHome) return

    const handleScroll = () => setIsScrolled(window.scrollY > 100)

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHome])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen)
  const toggleContact = () => setContactOpen(!isContactOpen)
  const signOutAndGoHome = () => {
    signOut()
    window.location.assign('/')
  }

  const navIsScrolled = isHome && isScrolled
  const color = navIsScrolled || !isHome || isDark ? '!text-base-content' : '!text-[#111111]'
  const headerColor = isHome && !navIsScrolled && !isDark ? 'text-[#111111]' : 'text-base-content'

  const textButton =
    `btn btn-ghost btn-sm inline-flex h-10 min-h-10 w-10 min-w-10 cursor-pointer items-center justify-center gap-2 rounded-none p-0 font-jost text-sm font-light tracking-wide leading-none hover:!text-accent md:btn-md md:h-12 md:min-h-12 md:w-auto md:min-w-0 md:px-3 ${color}`

  const iconButton =
    `btn btn-ghost btn-sm flex h-10 min-h-10 w-10 min-w-10 items-center justify-center rounded-none p-0 hover:!text-accent md:btn-md md:h-12 md:min-h-12 md:w-12 md:min-w-12 ${color}`

  return (
    <>
      <div className={`sticky top-0 z-50 ${isHome ? 'h-0' : ''}`}>
        <header
          className={`navbar main-head ${isHome ? 'absolute inset-x-0 top-0' : 'relative w-full'} flex flex-nowrap items-center justify-between gap-1 px-4 py-2 md:px-6 md:py-4 ${navIsScrolled || !isHome ? 'bg-base-100' : 'bg-base-100/0'} ${headerColor} ${navIsScrolled ? 'slidedown' : ''
            }`}
        >
          <div className="flex items-center gap-1 max-md:contents md:gap-6" id="Right">
            <button onClick={toggleMenu} aria-label="Menu" className={`order-5 ${textButton}`}>
              <FiMenu className="h-6 w-6 shrink-0 md:h-5 md:w-5" strokeWidth={1.5} aria-hidden="true" />
              <span className="hidden leading-none [text-box:trim-both_cap_alphabetic] md:block">Menu</span>
            </button>

            <button onClick={toggleSearch} aria-label="Search" className={`order-4 ${textButton}`}>
              <FiSearch className="h-6 w-6 shrink-0 md:h-5 md:w-5" strokeWidth={1.5} aria-hidden="true" />
              <span className="hidden leading-none [text-box:trim-both_cap_alphabetic] md:block">Search</span>
            </button>
          </div>
          <Link
            to="/"
            aria-label="Fashion Shop home"
            className="text-inherit no-underline max-md:order-1 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
          >
            <h1
              id="center"
              className="inline-flex whitespace-nowrap font-jost text-base font-bold uppercase gap-2 tracking-widest sm:text-lg md:text-3xl md:tracking-[0.18em]"
            >
              <span className="inline">Fashion</span>
              <span className="inline">Shop</span>
            </h1>
          </Link>

          <div className="flex items-center justify-end gap-1 max-md:contents md:gap-4" id="Left">
              <button onClick={toggleContact} aria-label="Contact" className={`max-md:hidden ${textButton}`}>
                <FiPlus className="h-6 w-6 shrink-0 md:h-5 md:w-5" strokeWidth={1.5} aria-hidden="true" />
                <span className="hidden leading-none [text-box:trim-both_cap_alphabetic] md:block">Contact us</span>
              </button>

              <Link
                to="/cart"
                aria-label={`Shopping bag${cartCount ? `, ${cartCount} items` : ''}`}
                onClick={(event) => pulseIcon(event.currentTarget)}
                className={`relative order-2 max-md:ml-auto md:order-0 ${iconButton}`}
              >
                <PiHandbagSimpleLight className="h-6 w-6" aria-hidden="true" />
                {cartCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-base-content px-1 font-jost text-[10px] text-base-100">
                    {cartCount}
                  </span>
                )}
              </Link>
              <div className="dropdown dropdown-hover dropdown-bottom dropdown-end order-3 md:order-0">
                <button tabIndex={0} role="button" aria-label="Account" className={iconButton}>
                  <FiUser className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
                </button>

                <ul
                  tabIndex={-1}
                  className="dropdown-content menu z-1 w-60 rounded-none border border-base-300 bg-base-100 p-2 text-base-content shadow-lg"
                >
                  {isSignedIn ? (
                    <>
                      <li><Link to="/orders" className="font-jost text-sm uppercase tracking-wide">My orders</Link></li>
                      <li><Link to="/account/wallet" className="font-jost text-sm uppercase tracking-wide">My wallet</Link></li>
                      <li><Link to="/wishlist" className="font-jost text-sm uppercase tracking-wide">My Wishlist</Link></li>
                      <li><Link to="/account" className="font-jost text-sm uppercase tracking-wide">My account settings</Link></li>
                      <li className="mt-1 border-t border-base-300 pt-1">
                        <button type="button" onClick={signOutAndGoHome} className="font-jost text-sm uppercase tracking-wide">Sign out</button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li><Link to="/sign-in">Sign In</Link></li>
                      <li><Link to="/sign-up">Sign Up</Link></li>
                    </>
                  )}

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