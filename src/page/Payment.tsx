import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import siteData from '../../Data.json'
import { useAuth } from '../auth/useAuth'
import type { CheckoutOrder } from '../auth/authContext'
import AnimatedContent from '../Components/animated-content'
import { TabTitle } from '../utils/GeneralFunction'
import { parseCheckoutDraft, type PaymentMethod } from './checkout/types'

type PaymentProduct = {
  id: string
  name: string
  price_idr: number
  sale_price_idr: number | null
}

const PRODUCTS = siteData.products as PaymentProduct[]
const PROMO_CODES = siteData.site.checkoutPromoCodes
const PAYMENT_METHODS: { id: PaymentMethod; label: string; description: string }[] = [
  { id: 'wallet', label: 'Wallet', description: 'Pay using your available wallet balance.' },
  { id: 'bank-transfer', label: 'Bank transfer', description: 'Place the order as pending; transfer instructions are not connected.' },
  { id: 'cash-on-delivery', label: 'Cash on delivery', description: 'Place the order as pending; courier collection is not connected.' },
  { id: 'card', label: 'Credit or debit card', description: 'Preview option only; card processing is not connected.' },
  { id: 'e-wallet', label: 'E-wallet', description: 'Preview option only; e-wallet processing is not connected.' },
]
const SHIPPING_PRICES = { regular: 25_000, express: 50_000 }
const formatPrice = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

export default function PaymentPage() {
  const { account, isSignedIn, placeOrder } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const draft = parseCheckoutDraft(location.state)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet')
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState('')

  const cart = account?.user.cart ?? []
  const products = cart.flatMap((item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.productId)
    return product ? [{ ...item, product }] : []
  })
  const subtotal = products.reduce(
    (sum, item) => sum + (item.product.sale_price_idr ?? item.product.price_idr) * item.quantity,
    0,
  )
  const appliedPromo = PROMO_CODES.find((promo) => promo.code === draft?.promoCode) ?? null
  const discount = appliedPromo?.type === 'percentage'
    ? Math.round(subtotal * appliedPromo.value / 100)
    : appliedPromo?.type === 'fixed'
      ? Math.min(subtotal, appliedPromo.value)
      : 0
  const shipping = appliedPromo?.type === 'free-shipping' ||
    subtotal > (draft?.deliveryMethod === 'express' ? 900_000 : 300_000)
    ? 0
    : SHIPPING_PRICES[draft?.deliveryMethod ?? 'regular']
  const total = Math.max(0, subtotal - discount) + shipping

  if (!isSignedIn) {
    return (
      <section className="mx-auto flex min-h-96 max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="font-jost text-3xl font-light">Sign in to check out</h1>
        <p className="mt-3 font-jost text-base-content/70">Your cart will be ready when you return.</p>
        <Link to="/sign-in" className="btn btn-neutral mt-6 rounded-none font-jost">Sign in</Link>
      </section>
    )
  }

  if (!draft) return <Navigate to="/checkout" replace />
  if (products.length === 0) return <Navigate to="/cart" replace />

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    try {
      const id = `ORDER-${crypto.randomUUID()}`
      const selectedMethod = PAYMENT_METHODS.find((method) => method.id === paymentMethod)
      const orderDetails: Omit<CheckoutOrder, 'createdAt' | 'items'> = {
        id,
        status: paymentMethod === 'wallet' ? 'paid' : 'pending',
        subtotal,
        discount,
        promoCode: appliedPromo?.code,
        shipping,
        total,
        shippingAddress: draft.address,
        deliveryMethod: draft.deliveryMethod,
        paymentMethod: selectedMethod?.label ?? 'Wallet',
      }
      placeOrder(orderDetails)
      setOrderId(id)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not place your order.')
    }
  }

  TabTitle(orderId ? 'Order placed | Fashion Shop' : 'Payment | Fashion Shop')

  if (orderId) {
    return (
      <AnimatedContent distance={24} duration={0.6} className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        <p className="font-jost text-xs uppercase tracking-[0.25em] text-accent">
          {paymentMethod === 'wallet' ? 'Payment confirmed' : 'Order received'}
        </p>
        <h1 className="mt-4 font-jost text-4xl font-light">
          {paymentMethod === 'wallet' ? 'Thank you for your order.' : 'Your order has been placed.'}
        </h1>
        <p className="mt-4 font-jost text-sm text-base-content/65">Order number: {orderId}</p>
        <p className="mt-2 max-w-lg font-jost text-sm leading-relaxed text-base-content/65">
          {paymentMethod === 'wallet'
            ? 'Your order was paid with your wallet balance.'
            : 'Your order is saved as pending. This payment option is a preview and no payment was processed.'}
        </p>
        <Link to="/shop" className="btn btn-neutral mt-8 rounded-none font-jost uppercase tracking-widest">
          Continue shopping
        </Link>
      </AnimatedContent>
    )
  }

  return (
    <AnimatedContent distance={24} duration={0.6} className="mx-auto max-w-360 px-6 py-10 md:px-12 md:py-14">
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start">
        <div className="space-y-8 rounded-lg border border-base-content/15 bg-base-100 p-6 sm:p-8">
          <section>
            <div className="flex items-center justify-between gap-4">
              <h1 className="font-jost text-xl font-medium">Shipping address</h1>
            </div>
            <address className="mt-4 space-y-1 font-jost text-sm not-italic text-base-content/70">
              <p>Name: {draft.address.fullName}</p>
              <p>Address: {draft.address.address}</p>
              <p>City: {draft.address.city}</p>
              <p>Postal Code: {draft.address.postalCode}</p>
              <p>Country: {draft.address.country}</p>
              <p>Phone: {draft.address.phone}</p>
              <p>Email: {draft.address.email}</p>
            </address>
            <p className="mt-3 font-jost text-sm text-base-content/65">
              {draft.deliveryMethod === 'regular' ? 'Regular' : 'Express'} shipping · {shipping === 0 ? 'Free' : formatPrice(shipping)}
            </p>
          </section>

          <section>
            <h2 className="font-jost text-xl font-medium">Payment method</h2>
            <p className="mt-2 font-jost text-sm text-base-content/65">
              Wallet balance: Rp {account?.user.wallet.balance.toLocaleString('id-ID')}
              {paymentMethod === 'wallet' && total > (account?.user.wallet.balance ?? 0) && (
                <> · <Link to="/account/wallet" className="underline hover:text-accent">Top up your wallet</Link></>
              )}
            </p>
            <div className="mt-4 grid gap-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 font-jost text-sm transition-colors ${paymentMethod === method.id ? 'border-accent bg-base-200/60' : 'border-base-content/15 hover:border-base-content/35'}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="radio radio-sm mt-0.5"
                  />
                  <span>
                    <span className="block font-medium">{method.label}</span>
                    <span className="mt-1 block text-xs text-base-content/55">{method.description}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-3 font-jost text-xs text-base-content/55">
              Preview checkout only. Payment providers are not connected.
            </p>
          </section>
        </div>

        <aside className="rounded-lg border border-base-content/15 bg-base-100 p-6 sm:p-8 lg:sticky lg:top-24">
          <h2 className="font-jost text-xl font-medium">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {products.map((item) => {
              const unitPrice = item.product.sale_price_idr ?? item.product.price_idr
              return (
                <li key={`${item.productId}-${item.size ?? ''}-${item.color ?? ''}`} className="flex justify-between gap-4 font-jost text-sm">
                  <span className="min-w-0">
                    <span className="block truncate">{item.product.name}</span>
                    <span className="mt-0.5 block text-xs text-base-content/55">
                      {item.quantity} × {formatPrice(unitPrice)}
                    </span>
                  </span>
                  <span className="shrink-0">{formatPrice(unitPrice * item.quantity)}</span>
                </li>
              )
            })}
          </ul>
          <dl className="mt-6 space-y-3 border-t border-base-content/10 pt-5 font-jost text-sm">
            <div className="flex justify-between"><dt className="text-base-content/60">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            {discount > 0 && (
              <div className="flex justify-between gap-4 text-success">
                <dt>Discount · {appliedPromo?.code}</dt>
                <dd>−{formatPrice(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-base-content/60">Shipping</dt>
              <dd className="text-right">{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-base-content/10 pt-4 text-base font-medium">
              <dt>Total</dt><dd>{formatPrice(total)}</dd>
            </div>
          </dl>
          {error && <p role="alert" className="mt-4 font-jost text-sm text-error">{error}</p>}
          <button type="submit" className="btn btn-neutral mt-6 w-full rounded-md font-jost">
            {paymentMethod === 'wallet' ? 'Pay with wallet' : 'Place order'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/checkout', { state: draft })}
            className="btn btn-ghost mt-2 w-full rounded-md font-jost"
          >
            Edit shipping address
          </button>
        </aside>
      </form>
    </AnimatedContent>
  )
}
