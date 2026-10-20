import { Link, Navigate, useParams } from 'react-router'
import siteData from '../../Data.json'
import { useAuth } from '../auth/useAuth'
import type { CartItem, CheckoutOrder } from '../auth/authContext'

type OrderProduct = { id: string; name: string; main_image: string[] }
const PRODUCTS = siteData.products as OrderProduct[]
const formatPrice = (value: number) => `Rp ${value.toLocaleString('id-ID')}`
const TRACKING_LOCATIONS = [
  { name: 'Jakarta, DKI Jakarta', latitude: -6.2088, longitude: 106.8456 },
  { name: 'Bandung, West Java', latitude: -6.9175, longitude: 107.6191 },
  { name: 'Yogyakarta, DI Yogyakarta', latitude: -7.7956, longitude: 110.3695 },
  { name: 'Surabaya, East Java', latitude: -7.2575, longitude: 112.7521 },
  { name: 'Denpasar, Bali', latitude: -8.65, longitude: 115.2167 },
  { name: 'Medan, North Sumatra', latitude: 3.5952, longitude: 98.6722 },
  { name: 'Makassar, South Sulawesi', latitude: -5.1477, longitude: 119.4327 },
] as const
const TRACKING_STATUSES = [
  'Preparing order',
  'Packed',
  'In transit',
  'Out for delivery',
  'Delivered',
] as const

function getStableHash(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function getTrackingPreview(orderId: string) {
  const hash = getStableHash(orderId)
  return {
    location: TRACKING_LOCATIONS[hash % TRACKING_LOCATIONS.length],
    status: TRACKING_STATUSES[(hash >>> 8) % TRACKING_STATUSES.length],
  }
}

function getMapEmbedUrl(latitude: number, longitude: number) {
  const padding = 0.045
  const bounds = [
    longitude - padding,
    latitude - padding,
    longitude + padding,
    latitude + padding,
  ].join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bounds)}&layer=mapnik&marker=${latitude}%2C${longitude}`
}

function isCartItem(value: unknown): value is CartItem {
  return typeof value === 'object' && value !== null &&
    'productId' in value && typeof value.productId === 'string' &&
    'quantity' in value && typeof value.quantity === 'number'
}

function isOrder(value: unknown): value is CheckoutOrder {
  if (typeof value !== 'object' || value === null) return false
  return 'id' in value && typeof value.id === 'string' &&
    'createdAt' in value && typeof value.createdAt === 'string' &&
    'status' in value && (value.status === 'paid' || value.status === 'pending') &&
    'items' in value && Array.isArray(value.items) && value.items.every(isCartItem) &&
    'subtotal' in value && typeof value.subtotal === 'number' &&
    'shipping' in value && (typeof value.shipping === 'number' || value.shipping === null) &&
    'total' in value && typeof value.total === 'number' &&
    'shippingAddress' in value && typeof value.shippingAddress === 'object' && value.shippingAddress !== null &&
    'deliveryMethod' in value && typeof value.deliveryMethod === 'string' &&
    'paymentMethod' in value && typeof value.paymentMethod === 'string'
}

function OrderStatus({ status }: { status: CheckoutOrder['status'] }) {
  return (
    <span className={`inline-flex border px-2.5 py-1 font-jost text-xs uppercase tracking-wide ${status === 'paid' ? 'border-success/40 text-success' : 'border-warning/40 text-warning'}`}>
      {status === 'paid' ? 'Paid' : 'Pending'}
    </span>
  )
}

export function OrdersPage() {
  const { account } = useAuth()
  if (!account) return <Navigate to="/sign-in" replace />

  const orders = account.user.orders
    .filter(isOrder)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))

  return (
    <section className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-base-300 pb-8">
            <div>
              <p className="font-jost text-xs uppercase tracking-[0.25em] text-accent">Account</p>
              <h1 className="mt-3 font-jost text-3xl font-light md:text-4xl">My orders</h1>
            </div>
            <Link to="/shop" className="btn btn-outline rounded-none font-jost uppercase tracking-widest">Continue shopping</Link>
          </div>

          {orders.length > 0 ? (
            <ul className="mt-8 divide-y divide-base-300 border-y border-base-300">
              {orders.map((order) => (
                <li key={order.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="font-jost">
                    <p className="text-sm font-medium">Order {order.id}</p>
                    <p className="mt-1 text-xs text-base-content/60">
                      {new Date(order.createdAt).toLocaleString()} · {order.items.reduce((count, item) => count + item.quantity, 0)} item(s)
                    </p>
                    <p className="mt-1 text-sm">{formatPrice(order.total)} · {order.paymentMethod}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <OrderStatus status={order.status} />
                    <Link to={`/orders/${encodeURIComponent(order.id)}`} className="btn btn-outline btn-sm rounded-none font-jost">
                      View order
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 border-y border-base-300 py-10 text-center">
              <p className="font-jost text-base-content/65">You haven’t placed any orders yet.</p>
              <Link to="/shop" className="btn btn-neutral mt-5 rounded-none font-jost uppercase tracking-widest">Start shopping</Link>
            </div>
          )}
    </section>
  )
}

export function OrderDetailsPage() {
  const { id } = useParams()
  const { account } = useAuth()
  if (!account) return <Navigate to="/sign-in" replace />

  const order = account.user.orders.find((entry) => isOrder(entry) && entry.id === id)
  if (!isOrder(order)) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-jost text-3xl font-light">Order not found</h1>
        <p className="mt-3 font-jost text-sm text-base-content/65">This order isn’t available in this account’s browser history.</p>
        <Link to="/orders" className="btn btn-neutral mt-6 rounded-none font-jost">Back to orders</Link>
      </section>
    )
  }

  const tracking = getTrackingPreview(order.id)

  return (
    <section className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-20">
          <Link to="/orders" className="font-jost text-sm underline underline-offset-4 hover:text-accent">Back to orders</Link>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-base-300 pb-6">
            <div>
              <p className="font-jost text-xs uppercase tracking-[0.25em] text-accent">Order details</p>
              <h1 className="mt-3 font-jost text-2xl font-light md:text-3xl">{order.id}</h1>
              <p className="mt-2 font-jost text-sm text-base-content/60">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <OrderStatus status={order.status} />
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <section>
              <div className="mb-8 border border-base-300">
                <div className="flex flex-wrap items-start justify-between gap-3 p-5">
                  <div>
                    <p className="font-jost text-xs uppercase tracking-[0.2em] text-accent">Tracking preview</p>
                    <h2 className="mt-2 font-jost text-lg font-medium">{tracking.status}</h2>
                    <p className="mt-1 font-jost text-sm text-base-content/65">{tracking.location.name}</p>
                  </div>
                  <span className="border border-base-content/20 px-2.5 py-1 font-jost text-xs text-base-content/60">
                    Sample updates
                  </span>
                </div>
                <iframe
                  title={`Sample shipment map near ${tracking.location.name}`}
                  src={getMapEmbedUrl(tracking.location.latitude, tracking.location.longitude)}
                  className="h-72 w-full border-0 bg-base-200 sm:h-96"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
                <p className="p-4 font-jost text-xs text-base-content/55">
                  Sample tracking data · not connected to a carrier.
                </p>
              </div>

              <h2 className="font-jost text-lg font-medium">Items</h2>
              <ul className="mt-4 divide-y divide-base-300 border-y border-base-300">
                {order.items.map((item, index) => {
                  const product = PRODUCTS.find((entry) => entry.id === item.productId)
                  return (
                    <li key={`${item.productId}-${item.size ?? ''}-${item.color ?? ''}-${index}`} className="flex gap-4 py-4">
                      {product && (
                        <img src={product.main_image[0]} alt="" className="h-24 w-18 object-cover" />
                      )}
                      <div className="flex flex-1 justify-between gap-4 font-jost text-sm">
                        <div>
                          <p className="font-medium">{product?.name ?? item.productId}</p>
                          <p className="mt-1 text-xs text-base-content/60">
                            {[item.size, item.color].filter(Boolean).join(' · ') || 'Standard'} · Qty {item.quantity}
                          </p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
              <h2 className="mt-8 font-jost text-lg font-medium">Delivery address</h2>
              <address className="mt-3 space-y-1 font-jost text-sm not-italic text-base-content/70">
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                <p>{order.shippingAddress.phone} · {order.shippingAddress.email}</p>
              </address>
            </section>

            <aside className="h-fit border border-base-300 p-5 font-jost">
              <h2 className="border-b border-base-300 pb-4 text-sm font-medium uppercase tracking-widest">Summary</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-base-content/65">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
                {(order.discount ?? 0) > 0 && (
                  <div className="flex justify-between gap-3 text-success">
                    <dt>Discount{order.promoCode ? ` · ${order.promoCode}` : ''}</dt>
                    <dd>−{formatPrice(order.discount ?? 0)}</dd>
                  </div>
                )}
                {order.promoCode && (order.discount ?? 0) === 0 && (
                  <div className="flex justify-between gap-3 text-success">
                    <dt>Promo · {order.promoCode}</dt>
                    <dd>Applied</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3"><dt className="text-base-content/65">Shipping · {order.deliveryMethod}</dt><dd>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping ?? 0)}</dd></div>
                <div className="flex justify-between gap-3 border-t border-base-300 pt-4 font-medium"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
              </dl>
              <p className="mt-4 border-t border-base-300 pt-4 text-sm">Payment: {order.paymentMethod}</p>
              {order.status === 'pending' && (
                <p className="mt-3 text-xs leading-relaxed text-warning">
                  Payment for this order is pending. This storefront preview does not process external payment methods.
                </p>
              )}
            </aside>
          </div>
    </section>
  )
}
