import { createContext } from 'react'

export type CartItem = {
  productId: string
  quantity: number
  size?: string
  color?: string
}

export type CartVariant = Pick<CartItem, 'size' | 'color'>

export type WalletTransaction = {
  id: string
  createdAt: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  orderId?: string
}

export type Account = {
  user: {
    id: string
    role: 'user'
    profile: {
      username: string
      full_name: string | null
      birth_date: string | null
    }
    contact: {
      email: string
      phone: string | null
    }
    addresses: unknown[]
    Shipping_status: unknown[]
    orders: unknown[]
    cart: CartItem[]
    wallet: {
      balance: number
      currency: 'IDR'
      transactions: WalletTransaction[]
    }
    preferences: {
      sizes: {
        top: string | null
        bottom: string | null
        shoes: string | null
      }
      favorite_categories: string[]
      currency: string | null
      locale: string | null
      notifications: {
        email: boolean | null
        sms: boolean | null
      }
    }
    wishlist: string[]
    last_search: {
      query: string | null
      searched_at: string | null
    }
    account_metadata: {
      created_at: string
      last_login_at: string | null
    }
    conected_Social: string | null
  }
}

export type SignUpDetails = {
  username: string
  fullName: string
  birthDate: string
  email: string
  phone: string
  password: string
}

export type UpdateProfileDetails = {
  username: string
  fullName: string
  birthDate: string
  email: string
  phone: string
}

export type CheckoutOrder = {
  id: string
  createdAt: string
  status: 'pending' | 'paid'
  items: CartItem[]
  subtotal: number
  discount?: number
  promoCode?: string
  shipping: number | null
  total: number
  shippingAddress: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
    country: string
  }
  deliveryMethod: string
  paymentMethod: string
}

export type AuthContextValue = {
  account: Account | null
  isSignedIn: boolean
  storageError: string | null
  signUp: (details: SignUpDetails) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  signOut: () => void
  updateProfile: (details: UpdateProfileDetails) => void
  addToCart: (productId: string, variant?: CartVariant) => void
  setCartQuantity: (productId: string, quantity: number, variant?: CartVariant) => void
  changeCartItemVariant: (
    productId: string,
    quantity: number,
    fromVariant: CartVariant,
    toVariant: CartVariant,
  ) => void
  placeOrder: (order: Omit<CheckoutOrder, 'createdAt' | 'items'>) => CheckoutOrder
  topUpWallet: (amount: number) => WalletTransaction
  toggleWishlist: (productId: string) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
