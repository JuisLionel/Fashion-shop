import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type Account, type AuthContextValue, type CartItem, type CartVariant, type CheckoutOrder, type WalletTransaction } from './authContext'
import { normalizePhoneNumber } from './phone'

const ACCOUNT_KEY = 'fashion-shop-account'
const CREDENTIAL_KEY = 'fashion-shop-credential'
const ACCOUNTS_KEY = 'fashion-shop-accounts'
const SESSION_KEY = 'fashion-shop-session'
const PASSWORD_ITERATIONS = 310_000
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const INITIAL_WALLET_BALANCE = 1_000_000

type Credential = {
  email: string
  salt: string
  passwordHash: string
  iterations: number
}

type StoredAccount = {
  account: Account
  credential: Credential
}

function parseStoredJson<T>(key: string): T | null {
  const value = localStorage.getItem(key)
  return value === null ? null : JSON.parse(value) as T
}

function getInitialAuthState(): { account: Account | null; storageError: string | null } {
  try {
    const accounts = getStoredAccounts()
    const session = parseStoredJson<{ email: string }>(SESSION_KEY)
    const account = accounts.find(({ account: savedAccount }) =>
      savedAccount.user.contact.email === session?.email
    )?.account ?? null
    if (account) return { account, storageError: null }
    return { account: null, storageError: null }
  } catch {
    return {
      account: null,
      storageError: 'We couldn’t load your account information. Please try again or contact support if the problem continues.',
    }
  }
}

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const decoded = atob(value)
  const bytes = new Uint8Array(new ArrayBuffer(decoded.length))
  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index)
  }
  return bytes
}

async function hashPassword(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    256
  )
  return new Uint8Array(hash)
}

async function createCredential(email: string, password: string): Promise<Credential> {
  const salt = new Uint8Array(new ArrayBuffer(16))
  crypto.getRandomValues(salt)
  const passwordHash = await hashPassword(password, salt, PASSWORD_ITERATIONS)
  return {
    email,
    salt: bytesToBase64(salt),
    passwordHash: bytesToBase64(passwordHash),
    iterations: PASSWORD_ITERATIONS,
  }
}

function isAccount(value: unknown): value is Account {
  if (typeof value !== 'object' || value === null || !('user' in value)) return false
  const user = value.user
  return typeof user === 'object' && user !== null &&
    'profile' in user && typeof user.profile === 'object' && user.profile !== null &&
    'contact' in user && typeof user.contact === 'object' && user.contact !== null &&
    'email' in user.contact && typeof user.contact.email === 'string'
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  return 'productId' in value && typeof value.productId === 'string' &&
    'quantity' in value && typeof value.quantity === 'number' &&
    Number.isInteger(value.quantity) && value.quantity > 0 &&
    (!('size' in value) || typeof value.size === 'string') &&
    (!('color' in value) || typeof value.color === 'string')
}

function isCredential(value: unknown): value is Credential {
  if (typeof value !== 'object' || value === null) return false
  return 'email' in value && typeof value.email === 'string' &&
    'salt' in value && typeof value.salt === 'string' &&
    'passwordHash' in value && typeof value.passwordHash === 'string' &&
    'iterations' in value && typeof value.iterations === 'number'
}

function isStoredAccount(value: unknown): value is StoredAccount {
  if (typeof value !== 'object' || value === null || !('account' in value) || !('credential' in value)) {
    return false
  }
  return isAccount(value.account) && isCredential(value.credential)
}

function addWallet(account: Account): Account {
  const wallet = account.user.wallet
  if (typeof wallet?.balance === 'number' && Number.isSafeInteger(wallet.balance) &&
      Array.isArray(wallet.transactions)) return account

  const createdAt = new Date().toISOString()
  const openingCredit: WalletTransaction = {
    id: crypto.randomUUID(),
    createdAt,
    type: 'credit',
    amount: INITIAL_WALLET_BALANCE,
    description: 'Welcome wallet balance',
  }
  return {
    ...account,
    user: {
      ...account.user,
      wallet: {
        balance: INITIAL_WALLET_BALANCE,
        currency: 'IDR',
        transactions: [openingCredit],
      },
    },
  }
}

function getStoredAccounts(): StoredAccount[] {
  const storedAccounts = parseStoredJson<unknown>(ACCOUNTS_KEY)
  if (Array.isArray(storedAccounts)) {
    if (!storedAccounts.every(isStoredAccount)) {
      throw new Error('Your account information is unavailable. Please try again or contact support if the problem continues.')
    }
    const accounts = storedAccounts.map((entry) => ({
      ...entry,
      account: addWallet(entry.account),
    }))
    if (accounts.some((entry, index) => entry.account !== storedAccounts[index].account)) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
    }
    return accounts
  }

  const legacyAccount = parseStoredJson<unknown>(ACCOUNT_KEY)
  const legacyCredential = parseStoredJson<unknown>(CREDENTIAL_KEY)
  if (isAccount(legacyAccount) && isCredential(legacyCredential)) {
    return [{ account: addWallet(legacyAccount), credential: legacyCredential }]
  }
  return []
}

function equalBytes(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index]
  return difference === 0
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState(getInitialAuthState)

  useEffect(() => {
    const reloadAccount = () => setAuthState(getInitialAuthState())
    window.addEventListener('storage', reloadAccount)
    return () => window.removeEventListener('storage', reloadAccount)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    account: authState.account,
    isSignedIn: authState.account !== null,
    storageError: authState.storageError,
    async signUp(details) {
      const email = details.email.trim().toLowerCase()
      const username = details.username.trim()
      const phone = normalizePhoneNumber(details.phone)
      if (!username || !email || !details.password) {
        throw new Error('Please complete the required fields.')
      }
      if (!EMAIL_PATTERN.test(email)) {
        throw new Error('Enter a valid email address, such as name@example.com.')
      }
      if (details.password.length < 8) {
        throw new Error('Your password must be at least 8 characters.')
      }

      const accounts = getStoredAccounts()
      if (accounts.some(({ account }) => account.user.contact.email === email)) {
        throw new Error('An account with this email already exists. Sign in or use another email.')
      }

      const now = new Date().toISOString()
      const account: Account = {
        user: {
          id: crypto.randomUUID(),
          role: 'user',
          profile: {
            username,
            full_name: details.fullName.trim() || null,
            birth_date: details.birthDate || null,
          },
          contact: {
            email,
            phone,
          },
          addresses: [],
          Shipping_status: [],
          orders: [],
          cart: [],
          wallet: {
            balance: INITIAL_WALLET_BALANCE,
            currency: 'IDR',
            transactions: [{
              id: crypto.randomUUID(),
              createdAt: now,
              type: 'credit',
              amount: INITIAL_WALLET_BALANCE,
              description: 'Welcome wallet balance',
            }],
          },
          preferences: {
            sizes: { top: null, bottom: null, shoes: null },
            favorite_categories: [],
            currency: null,
            locale: null,
            notifications: { email: null, sms: null },
          },
          wishlist: [],
          last_search: { query: null, searched_at: null },
          account_metadata: { created_at: now, last_login_at: now },
          conected_Social: null,
        },
      }
      const credential = await createCredential(email, details.password)

      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, { account, credential }]))
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email }))
      setAuthState({ account, storageError: null })
    },
    async signIn(emailInput, password) {
      const email = emailInput.trim().toLowerCase()
      if (!EMAIL_PATTERN.test(email)) {
        throw new Error('Enter a valid email address, such as name@example.com.')
      }
      const accounts = getStoredAccounts()
      const storedAccount = accounts.find(({ account }) => account.user.contact.email === email)

      if (!storedAccount) {
        throw new Error('We couldn’t find an account with this email. Check the address or create an account.')
      }
      const { account, credential: credentialValue } = storedAccount
      if (credentialValue.email !== email || account.user.contact.email !== email) {
        throw new Error('Email or password is incorrect.')
      }

      const suppliedHash = await hashPassword(
        password,
        base64ToBytes(credentialValue.salt),
        credentialValue.iterations
      )
      if (!equalBytes(suppliedHash, base64ToBytes(credentialValue.passwordHash))) {
        throw new Error('Email or password is incorrect.')
      }

      const updatedAccount: Account = {
        ...account,
        user: {
          ...account.user,
          account_metadata: {
            ...account.user.account_metadata,
            last_login_at: new Date().toISOString(),
          },
        },
      }
      const updatedAccounts = accounts.map((entry) =>
        entry.account.user.contact.email === email
          ? { ...entry, account: updatedAccount }
          : entry
      )
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email }))
      setAuthState({ account: updatedAccount, storageError: null })
    },
    async changePassword(currentPassword, newPassword) {
      const currentAccount = authState.account
      if (!currentAccount) {
        throw new Error('Sign in to change your password.')
      }
      if (!currentPassword) {
        throw new Error('Enter your current password.')
      }
      if (newPassword.length < 8) {
        throw new Error('Your new password must be at least 8 characters.')
      }

      const accounts = getStoredAccounts()
      const storedAccount = accounts.find(
        ({ account }) => account.user.id === currentAccount.user.id
      )
      if (!storedAccount) {
        throw new Error('We couldn’t find your account. Please sign in again.')
      }

      const suppliedHash = await hashPassword(
        currentPassword,
        base64ToBytes(storedAccount.credential.salt),
        storedAccount.credential.iterations
      )
      if (!equalBytes(suppliedHash, base64ToBytes(storedAccount.credential.passwordHash))) {
        throw new Error('Your current password is incorrect.')
      }

      const credential = await createCredential(
        storedAccount.account.user.contact.email,
        newPassword
      )
      const updatedAccounts = accounts.map((entry) =>
        entry.account.user.id === currentAccount.user.id
          ? { ...entry, credential }
          : entry
      )
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
    },
    signOut() {
      localStorage.removeItem(SESSION_KEY)
      setAuthState({ account: null, storageError: null })
    },
    updateProfile(details) {
      const currentAccount = authState.account
      if (!currentAccount) {
        throw new Error('Sign in to update your account.')
      }

      const username = details.username.trim()
      const email = details.email.trim().toLowerCase()
      if (!username) {
        throw new Error('Enter a username.')
      }
      if (!EMAIL_PATTERN.test(email)) {
        throw new Error('Enter a valid email address, such as name@example.com.')
      }

      const accounts = getStoredAccounts()
      const storedAccount = accounts.find(
        ({ account }) => account.user.id === currentAccount.user.id
      )
      if (!storedAccount) {
        throw new Error('We couldn’t find your account. Please sign in again.')
      }
      if (accounts.some(({ account }) =>
        account.user.id !== currentAccount.user.id &&
        account.user.contact.email.toLowerCase() === email
      )) {
        throw new Error('An account with this email already exists.')
      }
      if (accounts.some(({ account }) =>
        account.user.id !== currentAccount.user.id &&
        account.user.profile.username.toLowerCase() === username.toLowerCase()
      )) {
        throw new Error('That username is already in use.')
      }

      const updatedAccount: Account = {
        ...storedAccount.account,
        user: {
          ...storedAccount.account.user,
          profile: {
            ...storedAccount.account.user.profile,
            username,
            full_name: details.fullName.trim() || null,
            birth_date: details.birthDate || null,
          },
          contact: {
            ...storedAccount.account.user.contact,
            email,
            phone: normalizePhoneNumber(details.phone),
          },
        },
      }
      const updatedAccounts = accounts.map((entry) =>
        entry.account.user.id === currentAccount.user.id
          ? {
              ...entry,
              account: updatedAccount,
              credential: { ...entry.credential, email },
            }
          : entry
      )

      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email }))
      setAuthState({ account: updatedAccount, storageError: null })
    },
    addToCart(productId, variant = {}) {
      const currentAccount = authState.account
      if (!currentAccount) {
        throw new Error('Sign in to add products to your cart.')
      }

      const accounts = getStoredAccounts()
      const storedAccount = accounts.find(
        ({ account }) => account.user.id === currentAccount.user.id
      )
      if (!storedAccount) {
        throw new Error('We couldn’t find your account. Please sign in again.')
      }

      const cart = Array.isArray(storedAccount.account.user.cart)
        ? storedAccount.account.user.cart.filter(isCartItem)
        : []
      const matchesVariant = (item: CartItem) =>
        item.productId === productId && item.size === variant.size && item.color === variant.color
      const existingItem = cart.find(matchesVariant)
      const nextCart = existingItem
        ? cart.map((item) => matchesVariant(item)
          ? { ...item, quantity: item.quantity + 1 }
          : item)
        : [...cart, { productId, quantity: 1, ...variant }]
      const updatedAccount: Account = {
        ...storedAccount.account,
        user: {
          ...storedAccount.account.user,
          cart: nextCart,
        },
      }
      const updatedAccounts = accounts.map((entry) =>
        entry.account.user.id === currentAccount.user.id
          ? { ...entry, account: updatedAccount }
          : entry
      )

      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
      setAuthState({ account: updatedAccount, storageError: null })
    },
    setCartQuantity(productId, quantity, variant: CartVariant = {}) {
      const currentAccount = authState.account
      if (!currentAccount) {
        throw new Error('Sign in to update your cart.')
      }

      if (!Number.isInteger(quantity) || quantity < 0) {
        throw new Error('Cart quantity must be a non-negative whole number.')
      }

      const accounts = getStoredAccounts()
      const storedAccount = accounts.find(
        ({ account }) => account.user.id === currentAccount.user.id
      )
      if (!storedAccount) {
        throw new Error('We couldn’t find your account. Please sign in again.')
      }

      const cart = Array.isArray(storedAccount.account.user.cart)
        ? storedAccount.account.user.cart.filter(isCartItem)
        : []
      const matchesVariant = (item: CartItem) =>
        item.productId === productId && item.size === variant.size && item.color === variant.color
      const nextCart = quantity === 0
        ? cart.filter((item) => !matchesVariant(item))
        : cart.some(matchesVariant)
          ? cart.map((item) => matchesVariant(item) ? { ...item, quantity } : item)
          : [...cart, { productId, quantity, ...variant }]
      const updatedAccount: Account = {
        ...storedAccount.account,
        user: {
          ...storedAccount.account.user,
          cart: nextCart,
        },
      }
      const updatedAccounts = accounts.map((entry) =>
        entry.account.user.id === currentAccount.user.id
          ? { ...entry, account: updatedAccount }
          : entry
      )

      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
      setAuthState({ account: updatedAccount, storageError: null })
    },
    changeCartItemVariant(productId, quantity, fromVariant, toVariant) {
      const currentAccount = authState.account
      if (!currentAccount) throw new Error('Sign in to update your cart.')
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error('Cart quantity must be a positive whole number.')
      }
      if (fromVariant.size === toVariant.size && fromVariant.color === toVariant.color) return

      const accounts = getStoredAccounts()
      const storedAccount = accounts.find(({ account }) => account.user.id === currentAccount.user.id)
      if (!storedAccount) throw new Error('We couldn’t find your account. Please sign in again.')

      const cart = Array.isArray(storedAccount.account.user.cart)
        ? storedAccount.account.user.cart.filter(isCartItem)
        : []
      const matchesVariant = (item: CartItem, variant: CartVariant) =>
        item.productId === productId && item.size === variant.size && item.color === variant.color
      const sourceItem = cart.find((item) => matchesVariant(item, fromVariant))
      if (!sourceItem) throw new Error('That item is no longer in your cart.')

      const targetItem = cart.find((item) => matchesVariant(item, toVariant))
      const nextCart = cart.filter((item) =>
        !matchesVariant(item, fromVariant) && !matchesVariant(item, toVariant)
      )
      nextCart.push({
        productId,
        quantity: quantity + (targetItem?.quantity ?? 0),
        ...toVariant,
      })

      const updatedAccount: Account = {
        ...storedAccount.account,
        user: {
          ...storedAccount.account.user,
          cart: nextCart,
        },
      }
      const updatedAccounts = accounts.map((entry) =>
        entry.account.user.id === currentAccount.user.id
          ? { ...entry, account: updatedAccount }
          : entry
      )

      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
      setAuthState({ account: updatedAccount, storageError: null })
    },
    placeOrder(orderDetails) {
      const currentAccount = authState.account
      if (!currentAccount) throw new Error('Sign in to place your order.')

      const accounts = getStoredAccounts()
      const storedAccount = accounts.find(({ account }) => account.user.id === currentAccount.user.id)
      if (!storedAccount) throw new Error('We couldn’t find your account. Please sign in again.')
      const items = Array.isArray(storedAccount.account.user.cart)
        ? storedAccount.account.user.cart.filter(isCartItem)
        : []
      if (items.length === 0) throw new Error('Your cart is empty.')
      if (!Number.isSafeInteger(orderDetails.total) || orderDetails.total <= 0) {
        throw new Error('The order total is invalid.')
      }

      const isWalletPayment = orderDetails.paymentMethod === 'Wallet'
      const wallet = storedAccount.account.user.wallet
      if (isWalletPayment && wallet.balance < orderDetails.total) {
        throw new Error('Your wallet balance is too low. Top up your wallet or choose another payment method.')
      }

      const order: CheckoutOrder = {
        ...orderDetails,
        createdAt: new Date().toISOString(),
        items,
      }
      const updatedAccount: Account = {
        ...storedAccount.account,
        user: {
          ...storedAccount.account.user,
          cart: [],
          orders: [...storedAccount.account.user.orders, order],
          addresses: [...storedAccount.account.user.addresses, order.shippingAddress],
          wallet: isWalletPayment
            ? {
                ...wallet,
                balance: wallet.balance - order.total,
                transactions: [...wallet.transactions, {
                  id: crypto.randomUUID(),
                  createdAt: order.createdAt,
                  type: 'debit',
                  amount: order.total,
                  description: `Payment for order ${order.id}`,
                  orderId: order.id,
                }],
              }
            : wallet,
        },
      }
      const updatedAccounts = accounts.map((entry) =>
        entry.account.user.id === currentAccount.user.id ? { ...entry, account: updatedAccount } : entry
      )
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
      setAuthState({ account: updatedAccount, storageError: null })
      return order
    },
    topUpWallet(amount) {
      const currentAccount = authState.account
      if (!currentAccount) throw new Error('Sign in to top up your wallet.')
      if (!Number.isSafeInteger(amount) || amount <= 0) {
        throw new Error('Enter a whole-number amount greater than Rp 0.')
      }

      const accounts = getStoredAccounts()
      const storedAccount = accounts.find(({ account }) => account.user.id === currentAccount.user.id)
      if (!storedAccount) throw new Error('We couldn’t find your account. Please sign in again.')

      const wallet = storedAccount.account.user.wallet
      if (!Number.isSafeInteger(wallet.balance + amount)) {
        throw new Error('The wallet balance is too large to update.')
      }
      const transaction: WalletTransaction = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        type: 'credit',
        amount,
        description: 'Wallet top-up',
      }
      const updatedAccount: Account = {
        ...storedAccount.account,
        user: {
          ...storedAccount.account.user,
          wallet: {
            ...wallet,
            balance: wallet.balance + amount,
            transactions: [...wallet.transactions, transaction],
          },
        },
      }
      const updatedAccounts = accounts.map((entry) =>
        entry.account.user.id === currentAccount.user.id
          ? { ...entry, account: updatedAccount }
          : entry
      )

      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
      setAuthState({ account: updatedAccount, storageError: null })
      return transaction
    },
    toggleWishlist(productId) {
      const currentAccount = authState.account
      if (!currentAccount) {
        throw new Error('Sign in to save products to your wishlist.')
      }

      const accounts = getStoredAccounts()
      const storedAccount = accounts.find(
        ({ account }) => account.user.id === currentAccount.user.id
      )
      if (!storedAccount) {
        throw new Error('We couldn’t find your account. Please sign in again.')
      }

      const wishlist = Array.isArray(storedAccount.account.user.wishlist)
        ? storedAccount.account.user.wishlist.filter((id): id is string => typeof id === 'string')
        : []
      const nextWishlist = wishlist.includes(productId)
        ? wishlist.filter((id) => id !== productId)
        : [...wishlist, productId]
      const updatedAccount: Account = {
        ...storedAccount.account,
        user: {
          ...storedAccount.account.user,
          wishlist: nextWishlist,
        },
      }
      const updatedAccounts = accounts.map((entry) =>
        entry.account.user.id === currentAccount.user.id
          ? { ...entry, account: updatedAccount }
          : entry
      )

      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
      setAuthState({ account: updatedAccount, storageError: null })
    },
  }), [authState])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
