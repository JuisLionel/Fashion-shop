import { useEffect } from 'react'
import { Routes, Route, Outlet, Navigate, Link, useLocation } from 'react-router'
import siteData from '../Data.json'
import Navbar from './Components/Navbar'
import Promo from './Components/Promo'
import Home from './page/Home'
import ShopPage from './page/Shop'
import Product from './page/Product'
import Cart from './page/Cart'
import Wishlist from './page/Wishlist'
import Checkout from './page/Checkout'
import { OrderDetailsPage, OrdersPage } from './page/Orders'
import NotFound from './page/404'
import Footers from './Components/Footers'
import { AuthProvider } from './auth/AuthProvider'
import AccountPage from './page/auth/AccountPage'
import SignInPage from './page/auth/SignInPage'
import SignUpPage from './page/auth/SignUpPage'
import WalletPage from './page/auth/WalletPage'

import ClickSpark from './Components/ClickSpark'
import { NotificationsProvider } from './Components/Notifications'

function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const isHome = pathname === '/'
  const hidePromo = ['/wishlist', '/account', '/account/wallet', '/cart'].includes(pathname)

  const isTherePromo = siteData.site.promo.enabled

  return (
    <ClickSpark
      sparkColor="#b77936"
      shape="line"
      sparkCount={8}
      sparkSize={14}
      sparkRadius={30}
      duration={500}
    >
      {isTherePromo && !hidePromo && <Promo />}
      <Navbar isHome={isHome} />
      <main>
        <Outlet />
      </main>
      <Footers />
    </ClickSpark>
  )
}

export default function App() {
  return (
    <div
      className="min-h-screen bg-base-100 text-base-content"
      onDragStart={(event) => event.preventDefault()}
    >
      <AuthProvider>
        <NotificationsProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product" element={<Navigate to="/shop" replace />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/wishlist" element={<Wishlist />} />

              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailsPage />} />
              <Route path="/account/wallet" element={<WalletPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationsProvider>
      </AuthProvider>
    </div>
  )
}