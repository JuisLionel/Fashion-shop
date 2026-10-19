import { useState } from 'react'
import { Link } from 'react-router'
import { FiMinus, FiPlus, FiPrinter, FiTrash2 } from 'react-icons/fi'
import siteData from '../../Data.json'
import { useAuth } from '../auth/useAuth'

type Product = {
  id: string
  name: string
  category: string
  main_image: string | string[]
  price_idr: number
  sale_price_idr: number | null
}

const PRODUCTS: Product[] = siteData.products
const formatPrice = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

export default function Cart() {
  const { account, isSignedIn, setCartQuantity } = useAuth()
  const [errorMessage, setErrorMessage] = useState('')
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const cartItems = Array.isArray(account?.user.cart)
    ? account.user.cart.filter(
      (item) => typeof item.productId === 'string' && Number.isInteger(item.quantity) && item.quantity > 0
    )
    : []
  const productsInCart = cartItems.flatMap((item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.productId)
    return product
      ? [{ product, quantity: item.quantity, size: item.size, color: item.color }]
      : []
  })
  const subtotal = productsInCart.reduce(
    (total, { product, quantity }) => total + (product.sale_price_idr ?? product.price_idr) * quantity,
    0
  )
  const itemCount = productsInCart.reduce((total, item) => total + item.quantity, 0)

  const changeQuantity = (
    productId: string,
    quantity: number,
    variant: { size?: string; color?: string } = {},
  ) => {
    try {
      setCartQuantity(productId, quantity, variant)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not update your cart.')
    }
  }

  if (!isSignedIn) {
    return (
      <section className="mx-auto flex min-h-96 max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="font-jost text-3xl font-light">Your shopping bag</h1>
        <p className="mt-3 font-jost text-base-content/70">Sign in to view and manage your shopping bag.</p>
        <Link to="/sign-in" className="btn btn-neutral mt-6 rounded-none font-jost">
          Sign in
        </Link>
      </section>
    )
  }

  return (
    <>
      <header className="relative flex h-44 items-center justify-center overflow-hidden bg-base-300 md:h-56">
        <img src="/hero.webp" alt="" className="theme-image-light absolute inset-0 h-full w-full object-cover" />
        <img
          src="/hero-dark.webp"
          alt=""
          aria-hidden="true"
          className="theme-image-dark absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative z-10 font-jost text-3xl font-light uppercase tracking-widest text-white md:text-4xl">
          Shopping Bag
        </h1>
      </header>

      <section className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10 md:py-14">
        {errorMessage && <p role="status" className="mb-6 font-jost text-sm text-error">{errorMessage}</p>}
        {checkoutMessage && <p role="status" className="mb-6 font-jost text-sm text-accent">{checkoutMessage}</p>}

        {productsInCart.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <p className="font-jost text-base-content/70">Your shopping bag is empty.</p>
            <Link to="/shop" className="btn btn-neutral mt-5 rounded-none font-jost uppercase tracking-widest">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-12">
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-base-300 pb-3">
                <h2 className="font-jost text-sm font-medium uppercase tracking-widest">Your selections ({itemCount})</h2>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 font-jost text-xs hover:text-accent"
                >
                  <FiPrinter aria-hidden="true" />
                  Print
                </button>
              </div>

              <ul className="divide-y divide-base-300">
                {productsInCart.map(({ product, quantity, size, color }) => {
                  const image = Array.isArray(product.main_image) ? product.main_image[0] : product.main_image
                  const price = product.sale_price_idr ?? product.price_idr
                  const variant = { size, color }

                  return (
                    <li key={`${product.id}-${size ?? ''}-${color ?? ''}`} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:gap-6">
                      <Link to={`/product/${product.id}`} className="block aspect-3/4 overflow-hidden bg-base-200">
                        <img src={image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
                      </Link>
                      <div className="min-w-0 font-jost">
                        <Link to={`/product/${product.id}`} className="font-medium hover:text-accent">{product.name}</Link>
                        <p className="mt-1 text-xs text-base-content/60">{product.category}</p>
                        {(size || color) && (
                          <p className="mt-1 text-xs text-base-content/60">
                            {[color && `Color: ${color}`, size && `Size: ${size}`].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        <p className="mt-3 text-sm sm:hidden">{formatPrice(price * quantity)}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-4">
                          <div className="inline-flex items-center border border-base-300">
                            <button
                              type="button"
                              aria-label={`Decrease ${product.name} quantity`}
                              onClick={() => changeQuantity(product.id, quantity - 1, variant)}
                              className="p-2 hover:text-accent"
                            >
                              {quantity === 1 ? <FiTrash2 className="h-3.5 w-3.5" /> : <FiMinus className="h-3.5 w-3.5" />}
                            </button>
                            <span className="min-w-8 text-center text-sm">{quantity}</span>
                            <button
                              type="button"
                              aria-label={`Increase ${product.name} quantity`}
                              onClick={() => changeQuantity(product.id, quantity + 1, variant)}
                              className="p-2 hover:text-accent"
                            >
                              <FiPlus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => changeQuantity(product.id, 0, variant)}
                            className="font-jost text-xs underline underline-offset-4 hover:text-accent"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <p className="hidden whitespace-nowrap pt-1 font-jost text-sm sm:block">
                        {formatPrice(price * quantity)}
                      </p>
                    </li>
                  )
                })}
              </ul>
            </div>

            <aside className="h-fit border border-base-300 p-5 font-jost sm:p-6">
              <h2 className="border-b border-base-300 pb-4 text-sm font-medium uppercase tracking-widest">Order summary</h2>
              <div className="space-y-4 py-5 text-sm">
                <div className="flex justify-between gap-4">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-4 text-base-content/60">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-base-300 pt-4 font-medium">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>
              <p className="mb-5 text-xs leading-relaxed text-base-content/60">
                Shipping and payment details will be confirmed before your order is placed.
              </p>
              <button
                type="button"
                onClick={() => setCheckoutMessage('Checkout is not available yet. Your cart has been saved to your account.')}
                className="btn btn-neutral w-full rounded-none font-jost uppercase tracking-widest"
              >
                Checkout
              </button>
              <Link to="/shop" className="mt-4 block text-center font-jost text-xs underline underline-offset-4 hover:text-accent">
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </section>
    </>
  )
}
