import type { CheckoutOrder } from '../../auth/authContext'

export type Address = CheckoutOrder['shippingAddress']
export type DeliveryMethod = 'regular' | 'express'
export type PaymentMethod = 'wallet' | 'bank-transfer' | 'cash-on-delivery' | 'card' | 'e-wallet'

export type CheckoutDraft = {
  address: Address
  deliveryMethod: DeliveryMethod
  promoCode: string | null
}

function isAddress(value: unknown): value is Address {
  if (typeof value !== 'object' || value === null) return false
  const address = value as Record<string, unknown>
  return ['fullName', 'email', 'phone', 'address', 'city', 'postalCode', 'country']
    .every((field) => typeof address[field] === 'string')
}

export function parseCheckoutDraft(value: unknown): CheckoutDraft | null {
  if (typeof value !== 'object' || value === null) return null
  const draft = value as Record<string, unknown>
  if (!isAddress(draft.address)) return null
  if (draft.deliveryMethod !== 'regular' && draft.deliveryMethod !== 'express') return null
  if (draft.promoCode !== null && typeof draft.promoCode !== 'string') return null

  return {
    address: draft.address,
    deliveryMethod: draft.deliveryMethod,
    promoCode: draft.promoCode,
  }
}
