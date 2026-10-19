import { Routes, Route, Outlet, useLocation } from 'react-router'
import siteData from '../Data.json'
import Navbar from './Components/Navbar'
import Promo from './Components/Promo'
import Home from './page/Home'
import ShopPage  from './page/Shop'
import Product from './page/Product'
import Cart from './page/Cart'
import Wishlist from './page/Wishlist'
import NotFound from './page/404'
import Footers from './Components/Footers'
import { AuthProvider } from './auth/AuthProvider'
import { AccountPage, AccountSectionPage, SignInPage, SignUpPage } from './page/Auth'

// Shared layout: promo banner + navbar on every page except 404
function Layout() {
  const { pathname } = useLocation()

  const isHome = pathname === '/'

  const isTherePromo = siteData.site.promo.enabled
  
    return (
    <>  
      {isTherePromo && <Promo />}
      <Navbar isHome={isHome} />
      <main>
        <Outlet />
      </main>
    </>
  )
}

// Temporary page for routes you haven't built yet
function Placeholder({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="font-jost text-4xl font-bold">{title}</h1>
      <p className="mt-4 font-jost font-light text-base-content/70">This page is coming soon.</p>
    </section>
  )
}

export default function App() {
  return (
    <div
      className="min-h-screen bg-base-100 text-base-content"
      onDragStart={(event) => event.preventDefault()}
    >
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />

            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/orders" element={<Placeholder title="orders" />} />
            <Route path="/account/wallet" element={<AccountSectionPage section="wallet" title="My wallet" />} />

            <Route path="/size-guide" element={<Placeholder title="Size Guide" />} />
            <Route path="/shipping" element={<Placeholder title="Shipping" />} />
            <Route path="/exchanges" element={<Placeholder title="Exchanges" />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>

        <FooterForCurrentRoute />
      </AuthProvider>
    </div>
  )
}

function FooterForCurrentRoute() {
  const { pathname } = useLocation()
  const hideFooter = pathname === '/sign-in' || pathname === '/sign-up' || pathname.startsWith('/account')

  return hideFooter ? null : <Footers />
}