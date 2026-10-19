import { createContext } from 'react'

export type CartItem = {
  productId: string
  quantity: number
  size?: string
  color?: string
}

export type CartVariant = Pick<CartItem, 'size' | 'color'>

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

export type AuthContextValue = {
  account: Account | null
  isSignedIn: boolean
  storageError: string | null
  signUp: (details: SignUpDetails) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  addToCart: (productId: string, variant?: CartVariant) => void
  setCartQuantity: (productId: string, quantity: number, variant?: CartVariant) => void
  toggleWishlist: (productId: string) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
