import type { MouseEvent } from 'react'
import { FiShoppingBag } from 'react-icons/fi'
import { useAuth } from '../auth/useAuth'
import { pulseIcon } from './pulseIcon'
import { useNotifications } from './useNotifications'

type ProductCartButtonProps = {
  productId: string
  productName: string
  className?: string
}

export default function ProductCartButton({
  productId,
  productName,
  className = 'h-9 w-9',
}: ProductCartButtonProps) {
  const { account, addToCart } = useAuth()
  const { notifyError } = useNotifications()
  const inCart = account?.user.cart.some(
    (item) => item.productId === productId && Number.isInteger(item.quantity) && item.quantity > 0
  ) ?? false

  const addProductToCart = (event: MouseEvent<HTMLButtonElement>) => {
    pulseIcon(event.currentTarget)
    try {
      addToCart(productId)
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Could not add this product to your cart.')
    }
  }

  return (
    <button
      type="button"
      onClick={addProductToCart}
      aria-label={`Add ${productName} to cart${inCart ? ', already in cart' : ''}`}
      className={`flex items-center justify-center rounded-full bg-base-100 text-base-content shadow-sm transition-colors hover:bg-base-content hover:text-base-100 ${className}`}
    >
      <FiShoppingBag
        className={`h-4 w-4 ${inCart ? 'text-green-500' : ''}`}
        aria-hidden="true"
      />
    </button>
  )
}
