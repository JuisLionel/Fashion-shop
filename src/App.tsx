import { Routes, Route, Outlet, useLocation } from 'react-router'
import siteData from '../Data.json'
import Navbar from './Components/Navbar'
import Promo from './Components/Promo'
import Home from './page/Home'
import Product from './page/Shop'
import Wishlist from './page/Wishlist'
import NotFound from './page/404'
import Footers from './Components/Footers'

// Shared layout: promo banner + navbar on every page except 404
function Layout() {
  const { pathname } = useLocation()

  const isHome = pathname === '/'

  const isTherePromo = siteData.site.promo.enabled
  
    return (
    <>  
      {isTherePromo && <Promo />}
      <Navbar />
      <main className={isHome ? '' : 'pt-20'}>
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
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Placeholder title="Shop" />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/wishlist" element={<Wishlist />} />

          <Route path="/sign-in" element={<Placeholder title="Sign In" />} />
          <Route path="/sign-up" element={<Placeholder title="Sign Up" />} />
          <Route path="/account" element={<Placeholder title="My Account" />} />

          <Route path="/size-guide" element={<Placeholder title="Size Guide" />} />
          <Route path="/shipping" element={<Placeholder title="Shipping" />} />
          <Route path="/exchanges" element={<Placeholder title="Exchanges" />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footers />
    </div>
  )
}