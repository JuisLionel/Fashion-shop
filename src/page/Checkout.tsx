import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi'
import siteData from '../../Data.json'
import { useAuth } from '../auth/useAuth'
import type { CartVariant, CheckoutOrder } from '../auth/authContext'
import { getPhoneInput, parsePhoneInput, PHONE_COUNTRIES, type CountryCode } from '../auth/phone'
import AnimatedContent from '../Components/animated-content'
import { TabTitle } from '../utils/GeneralFunction'

type CheckoutProduct = {
  id: string
  name: string
  main_image: string[]
  price_idr: number
  sale_price_idr: number | null
  sizes: string[]
  stock_by_size: Record<string, number | undefined>
}

const PRODUCTS = siteData.products as CheckoutProduct[]
const PROMO_CODES = siteData.site.checkoutPromoCodes
const formatPrice = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

type Address = CheckoutOrder['shippingAddress']
type DeliveryMethod = 'regular' | 'express'
type PaymentMethod = 'wallet' | 'bank-transfer' | 'cash-on-delivery' | 'card' | 'e-wallet'
type CheckoutPromoCode = (typeof PROMO_CODES)[number]

const FREE_SHIPPING_THRESHOLD = 300_000
const FREE_EXPRESS_SHIPPING_THRESHOLD = 900_000
const SHIPPING_PRICES: Record<DeliveryMethod, number> = { regular: 25_000, express: 50_000 }
const isShippingFree = (subtotal: number, method: DeliveryMethod, promo: CheckoutPromoCode | null) =>
  promo?.type === 'free-shipping' ||
  subtotal > (method === 'express' ? FREE_EXPRESS_SHIPPING_THRESHOLD : FREE_SHIPPING_THRESHOLD)
const PAYMENT_METHODS: { id: PaymentMethod; label: string; description: string }[] = [
  { id: 'wallet', label: 'Wallet', description: 'Pay using your available wallet balance.' },
  { id: 'bank-transfer', label: 'Bank transfer', description: 'Place the order as pending; transfer instructions are not connected.' },
  { id: 'cash-on-delivery', label: 'Cash on delivery', description: 'Place the order as pending; courier collection is not connected.' },
  { id: 'card', label: 'Credit or debit card', description: 'Preview option only; card processing is not connected.' },
  { id: 'e-wallet', label: 'E-wallet', description: 'Preview option only; e-wallet processing is not connected.' },
]

export default function Checkout() {
  const { account, isSignedIn, placeOrder, setCartQuantity, changeCartItemVariant } = useAuth()
  const cart = account?.user.cart ?? []
  const products = cart.flatMap((item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.productId)
    return product ? [{ ...item, product }] : []
  })
  const subtotal = products.reduce((sum, item) => sum + (item.product.sale_price_idr ?? item.product.price_idr) * item.quantity, 0)
  const [address, setAddress] = useState<Address>({
    fullName: account?.user.profile.full_name ?? '',
    email: account?.user.contact.email ?? '',
    phone: account?.user.contact.phone ?? '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  })
  const [phoneInput, setPhoneInput] = useState(() =>
    getPhoneInput(account?.user.contact.phone ?? null)
  )
  const [checkoutStep, setCheckoutStep] = useState<'shipping' | 'payment'>('shipping')
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('regular')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet')
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null)
  const [promoMessage, setPromoMessage] = useState('')
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const appliedPromo = PROMO_CODES.find((promo) => promo.code === appliedPromoCode) ?? null
  const discount = appliedPromo?.type === 'percentage'
    ? Math.round(subtotal * appliedPromo.value / 100)
    : appliedPromo?.type === 'fixed'
      ? Math.min(subtotal, appliedPromo.value)
      : 0
  const shipping = isShippingFree(subtotal, deliveryMethod, appliedPromo)
    ? 0
    : SHIPPING_PRICES[deliveryMethod]
  const total = Math.max(0, subtotal - discount) + shipping

  const updateAddress = (field: keyof Address, value: string) => setAddress((current) => ({ ...current, [field]: value }))
  if (!isSignedIn) {
    return (
      <section className="mx-auto flex min-h-96 max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="font-jost text-3xl font-light">Sign in to check out</h1>
        <p className="mt-3 font-jost text-base-content/70">Your cart will be ready when you return.</p>
        <Link to="/sign-in" className="btn btn-neutral mt-6 rounded-none font-jost">Sign in</Link>
      </section>
    )
  }

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
        <Link to="/shop" className="btn btn-neutral mt-8 rounded-none font-jost uppercase tracking-widest">Continue shopping</Link>
      </AnimatedContent>
    )
  }

  if (products.length === 0) return <Navigate to="/cart" replace />

  const applyPromo = () => {
    const normalizedCode = promoInput.trim().toUpperCase()
    const promo = PROMO_CODES.find((entry) => entry.enabled && entry.code === normalizedCode)
    if (!promo) {
      setPromoMessage('That promo code is not valid.')
      return
    }
    setAppliedPromoCode(promo.code)
    setPromoInput(promo.code)
    setPromoMessage(
      promo.type === 'percentage'
        ? `${promo.value}% off your items has been applied.`
        : promo.type === 'fixed'
          ? `${formatPrice(promo.value)} off your items has been applied.`
          : 'Free shipping has been applied.',
    )
  }

  const removePromo = () => {
    setAppliedPromoCode(null)
    setPromoInput('')
    setPromoMessage('')
  }

  const changeQuantity = (productId: string, quantity: number, variant: CartVariant) => {
    try {
      setCartQuantity(productId, quantity, variant)
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not update your cart.')
    }
  }

  const changeSize = (
    productId: string,
    quantity: number,
    color: string | undefined,
    size: string | undefined,
    nextSize: string,
  ) => {
    const targetQuantity = account?.user.cart.find((item) =>
      item.productId === productId && item.size === nextSize && item.color === color
    )?.quantity ?? 0
    const product = PRODUCTS.find((item) => item.id === productId)
    const available = product?.stock_by_size[nextSize]
    if (available !== undefined && quantity + targetQuantity > available) {
      setError(`Only ${available} item${available === 1 ? '' : 's'} are available in size ${nextSize}.`)
      return
    }

    try {
      changeCartItemVariant(productId, quantity, { size, color }, { size: nextSize, color })
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not update the item size.')
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (checkoutStep === 'shipping') {
      try {
        const phone = parsePhoneInput(phoneInput.nationalNumber, phoneInput.country).number
        setAddress((current) => ({ ...current, phone }))
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Enter a valid phone number.')
        return
      }
      setCheckoutStep('payment')
      return
    }

    setIsSubmitting(true)
    try {
      const id = `ORDER-${crypto.randomUUID()}`
      placeOrder({
        id,
        status: paymentMethod === 'wallet' ? 'paid' : 'pending',
        subtotal,
        discount,
        promoCode: appliedPromo?.code,
        shipping,
        total,
        shippingAddress: address,
        deliveryMethod,
        paymentMethod: PAYMENT_METHODS.find((method) => method.id === paymentMethod)?.label ?? 'Wallet',
      })
      setOrderId(id)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not place your order.')
      setIsSubmitting(false)
    }
  }

  const labelClass = 'block font-jost text-sm text-base-content/70'
  const inputClass = 'mt-1.5 w-full rounded-md border border-base-content/20 bg-base-200/40 px-3 py-2.5 font-jost text-sm outline-none transition-colors placeholder:text-base-content/35 focus:border-accent'
  const optionClass = (selected: boolean) =>
    `flex cursor-pointer items-start gap-3 rounded-md border p-4 font-jost text-sm transition-colors ${selected ? 'border-accent bg-base-200/60' : 'border-base-content/15 hover:border-base-content/35'}`

  const fields: { field: keyof Address; label: string; type: string; span?: boolean; autoComplete?: string }[] = [
    { field: 'fullName', label: 'Full name', type: 'text', autoComplete: 'name' },
    { field: 'email', label: 'Email address', type: 'email', autoComplete: 'email' },
    { field: 'phone', label: 'Phone number', type: 'tel', autoComplete: 'tel' },
    { field: 'country', label: 'Country', type: 'text', autoComplete: 'off' },
    { field: 'address', label: 'Street address', type: 'text', span: true, autoComplete: 'street-address' },
    { field: 'city', label: 'City', type: 'text', autoComplete: 'address-level2' },
    { field: 'postalCode', label: 'Postal code', type: 'text', autoComplete: 'postal-code' },
  ]

  TabTitle('Checkout | Fashion Shop')

  return (
    <AnimatedContent distance={24} duration={0.6} className="mx-auto max-w-360 px-6 py-10 md:px-12 md:py-14">
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start">
        <div className="space-y-8 rounded-lg border border-base-content/15 bg-base-100 p-6 sm:p-8">
          {checkoutStep === 'shipping' ? (
            <section>
              <h1 className="font-jost text-xl font-medium">Shipping address</h1>
              <div className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2">
                {fields.map(({ field, label, type, span, autoComplete }) => field === 'phone' ? (
                  <label key={field} className={labelClass}>
                    {label}<span className="text-error">*</span>
                    <span className="mt-1.5 flex rounded-md border border-base-content/20 bg-base-200/40 focus-within:border-accent">
                      <select
                        aria-label="Phone country code"
                        autoComplete="tel-country-code"
                        value={phoneInput.country}
                        onChange={(event) => setPhoneInput((current) => ({
                          ...current,
                          country: event.target.value as CountryCode,
                        }))}
                        className="w-32 max-w-[42%] shrink-0 rounded-l-md border-r border-base-content/15 bg-transparent px-1.5 font-jost text-xs outline-none sm:w-36"
                      >
                        {PHONE_COUNTRIES.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.name} (+{item.callingCode})
                          </option>
                        ))}
                      </select>
                      <input
                        className="w-full min-w-0 bg-transparent px-3 py-2.5 font-jost text-sm outline-none placeholder:text-base-content/35"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel-national"
                        required
                        value={phoneInput.nationalNumber}
                        onChange={(event) => setPhoneInput((current) => ({
                          ...current,
                          nationalNumber: event.target.value,
                        }))}
                      />
                    </span>
                  </label>
                ) : (
                  <label key={field} className={`${labelClass} ${span ? 'sm:col-span-2' : ''}`}>
                    {label}<span className="text-error">*</span>
                    <input
                      className={inputClass}
                      type={type}
                      autoComplete={autoComplete}
                      required
                      value={address[field]}
                      onChange={(event) => updateAddress(field, event.target.value)}
                    />
                  </label>
                ))}
              </div>
              <h2 className="mt-8 font-jost text-xl font-medium">Shipping method</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {([
                  { id: 'regular', label: 'Regular', description: 'Estimated delivery in 3–5 business days' },
                  { id: 'express', label: 'Express', description: 'Estimated delivery in 1–2 business days' },
                ] as const).map((method) => {
                  const price = isShippingFree(subtotal, method.id, appliedPromo)
                    ? 0
                    : SHIPPING_PRICES[method.id]
                  return (
                    <label key={method.id} className={optionClass(deliveryMethod === method.id)}>
                      <input
                        type="radio"
                        name="delivery"
                        value={method.id}
                        checked={deliveryMethod === method.id}
                        onChange={() => setDeliveryMethod(method.id)}
                        className="radio radio-sm mt-0.5"
                      />
                      <span className="flex flex-1 flex-wrap justify-between gap-x-3 gap-y-1">
                        <span>
                          <span className="block font-medium">{method.label}</span>
                          <span className="mt-1 block text-xs text-base-content/55">{method.description}</span>
                        </span>
                        <span className="font-medium">{price === 0 ? 'Free' : formatPrice(price)}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </section>
          ) : (
            <>
              <section>
                <div className="flex items-center justify-between gap-4">
                  <h1 className="font-jost text-xl font-medium">Shipping address</h1>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('shipping')}
                    className="font-jost text-sm underline underline-offset-4 hover:text-accent"
                  >
                    Edit
                  </button>
                </div>
                <address className="mt-4 space-y-1 font-jost text-sm not-italic text-base-content/70">
                  <p>{address.fullName}</p>
                  <p>{address.address}</p>
                  <p>{address.city}, {address.postalCode}, {address.country}</p>
                  <p>{address.phone} · {address.email}</p>
                </address>
                <p className="mt-3 font-jost text-sm text-base-content/65">
                  {deliveryMethod === 'regular' ? 'Regular' : 'Express'} shipping · {shipping === 0 ? 'Free' : formatPrice(shipping)}
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
            </>
          )}
        </div>

        <aside className="rounded-lg border border-base-content/15 bg-base-100 p-6 sm:p-8 lg:sticky lg:top-24">
          <h2 className="font-jost text-xl font-medium">Your cart</h2>
          <ul className="mt-4 space-y-4">
            {products.map((item) => {
              const unitPrice = item.product.sale_price_idr ?? item.product.price_idr
              return (
                <li key={`${item.productId}-${item.size ?? ''}-${item.color ?? ''}`} className="grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={Array.isArray(item.product.main_image) ? item.product.main_image[0] : item.product.main_image}
                      alt=""
                      className="h-20 w-16 rounded-md object-cover"
                    />
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral px-1 font-jost text-[11px] text-neutral-content">{item.quantity}</span>
                  </div>
                  <div className="min-w-0 flex-1 font-jost text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 truncate font-medium">{item.product.name}</p>
                      <p className="shrink-0 text-xs font-medium">{formatPrice(unitPrice * item.quantity)}</p>
                    </div>
                    <p className="mt-0.5 text-xs text-base-content/55">{[item.size, item.color].filter(Boolean).join(' · ') || 'Standard'}</p>
                    <div className="mt-2 flex flex-nowrap items-center gap-2">
                      {item.size && item.product.sizes.length > 0 && (
                        <label className="flex shrink-0 items-center gap-1 text-xs text-base-content/65">
                          Size
                          <select
                            value={item.size}
                            onChange={(event) => changeSize(item.productId, item.quantity, item.color, item.size, event.target.value)}
                            className="select select-xs min-h-7 w-14 min-w-0 rounded-none border-base-content/20 bg-base-100 px-1"
                            aria-label={`Change ${item.product.name} size`}
                          >
                            {item.product.sizes.map((size) => {
                              const targetQuantity = account?.user.cart.find((cartItem) =>
                                cartItem.productId === item.productId && cartItem.size === size && cartItem.color === item.color
                              )?.quantity ?? 0
                              const available = item.product.stock_by_size[size]
                              const disabled = size !== item.size &&
                                available !== undefined && item.quantity + targetQuantity > available
                              return <option key={size} value={size} disabled={disabled}>{size}</option>
                            })}
                          </select>
                        </label>
                      )}
                      <div className="inline-flex shrink-0 items-center border border-base-content/15">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.product.name} quantity`}
                          onClick={() => changeQuantity(item.productId, item.quantity - 1, { size: item.size, color: item.color })}
                          className="p-1.5 hover:text-accent"
                        >
                          {item.quantity === 1
                            ? <FiTrash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            : <FiMinus className="h-3.5 w-3.5" aria-hidden="true" />}
                        </button>
                        <span className="min-w-7 text-center text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${item.product.name} quantity`}
                          disabled={item.size !== undefined &&
                            item.product.stock_by_size[item.size] !== undefined &&
                            item.quantity >= (item.product.stock_by_size[item.size] ?? 0)}
                          onClick={() => changeQuantity(item.productId, item.quantity + 1, { size: item.size, color: item.color })}
                          className="p-1.5 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <FiPlus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <section className="mt-6 border-y border-base-content/10 py-5" aria-labelledby="promo-code-title">
            <h3 id="promo-code-title" className="font-jost text-sm font-medium">Promo code</h3>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                aria-label="Promo code"
                autoComplete="off"
                value={promoInput}
                onChange={(event) => {
                  setPromoInput(event.target.value)
                  if (!appliedPromo) setPromoMessage('')
                }}
                readOnly={appliedPromo !== null}
                placeholder="Enter code"
                className="min-w-0 flex-1 rounded-md border border-base-content/20 bg-base-200/40 px-3 py-2 font-jost text-sm uppercase outline-none focus:border-accent"
              />
              {appliedPromo ? (
                <button type="button" onClick={removePromo} className="btn btn-outline btn-sm rounded-md font-jost normal-case">
                  Remove
                </button>
              ) : (
                <button type="button" onClick={applyPromo} disabled={!promoInput.trim()} className="btn btn-neutral btn-sm rounded-md font-jost normal-case disabled:opacity-50">
                  Apply
                </button>
              )}
            </div>
            {promoMessage && (
              <p role={appliedPromo ? 'status' : 'alert'} className={`mt-2 font-jost text-xs ${appliedPromo ? 'text-success' : 'text-error'}`}>
                {promoMessage}
              </p>
            )}
          </section>

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
            <div className="flex justify-between border-t border-base-content/10 pt-4 text-base font-medium"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
          </dl>

          {error && <p role="alert" className="mt-4 font-jost text-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-neutral mt-6 w-full rounded-md font-jost disabled:opacity-60"
          >
            {checkoutStep === 'shipping' ? 'Continue to payment'
              : isSubmitting ? 'Placing order…'
                : paymentMethod === 'wallet' ? 'Pay with wallet' : 'Place order'}
          </button>
        </aside>
      </form>
    </AnimatedContent>
  )
}