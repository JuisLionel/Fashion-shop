import AnimatedContent from '../Components/animated-content'
import { Link } from 'react-router'
import { FiHeart } from 'react-icons/fi'
import siteData from '../../Data.json'
import { useAuth } from '../auth/useAuth'
import { pulseIcon } from '../Components/pulseIcon'
import { useNotifications } from '../Components/useNotifications'
import ProductCartButton from '../Components/ProductCartButton'

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

export default function Wishlist() {
  const { account, isSignedIn, toggleWishlist } = useAuth()
  const { notifyError } = useNotifications()
  const savedIds = Array.isArray(account?.user.wishlist) ? account.user.wishlist : []
  const savedProducts = PRODUCTS.filter((product) => savedIds.includes(product.id))

  const runAction = (action: () => void) => {
    try {
      action()
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Could not update your wishlist.')
    }
  }

  if (!isSignedIn) {
    return (
      <section className="mx-auto flex min-h-96 max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        <FiHeart className="h-8 w-8 text-accent" aria-hidden="true" />
        <h1 className="mt-5 font-jost text-3xl font-light">Your wishlist</h1>
        <p className="mt-3 font-jost text-base-content/70">Sign in to view and save your favorite products.</p>
        <Link to="/sign-in" className="btn btn-neutral mt-6 rounded-none font-jost">Sign in</Link>
      </section>
    )
  }

  return (
    <AnimatedContent distance={30} duration={0.7}>
    <section className="w-full px-6 py-14 md:px-12 md:py-20">
      <header className="mb-8">
        <p className="font-jost text-sm text-base-content/60">Your saved items</p>
        <h1 className="mt-2 font-jost text-3xl font-light md:text-4xl">Wishlist</h1>
      </header>

      {savedProducts.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center text-center">
          <p className="font-jost text-base-content/70">Your wishlist is empty.</p>
          <Link to="/shop" className="btn btn-outline mt-5 rounded-none font-jost">Explore products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {savedProducts.map((product) => {
            const image = Array.isArray(product.main_image) ? product.main_image[0] : product.main_image
            return (
              <article key={product.id} className="group font-jost">
                <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-base-200">
                  <Link to={`/product/${product.id}`} aria-label={product.name} className="block h-full w-full">
                    <img src={image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
                  </Link>
                  <div className="absolute right-3 top-3 flex flex-col gap-2">
                    <button
                      type="button"
                      aria-label={`Remove ${product.name} from wishlist`}
                      onClick={(event) => {
                        pulseIcon(event.currentTarget)
                        runAction(() => toggleWishlist(product.id))
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-base-content text-base-100 transition-colors hover:bg-accent"
                    >
                      <FiHeart className="h-4 w-4 fill-current text-red-500" aria-hidden="true" />
                    </button>
                    <ProductCartButton productId={product.id} productName={product.name} />
                  </div>
                </div>
                <p className="mt-4 text-xs text-base-content/60">{product.category}</p>
                <Link to={`/product/${product.id}`} className="mt-1 block truncate font-medium hover:text-accent">
                  {product.name}
                </Link>
                <p className="mt-2 text-sm">
                  {product.sale_price_idr ? (
                    <>
                      <span className="font-medium">{formatPrice(product.sale_price_idr)}</span>
                      <span className="ml-2 text-base-content/50 line-through">{formatPrice(product.price_idr)}</span>
                    </>
                  ) : (
                    <span className="font-medium">{formatPrice(product.price_idr)}</span>
                  )}
                </p>
              </article>
            )
          })}
        </div>
      )}
    </section>
    </AnimatedContent>
  )
}
