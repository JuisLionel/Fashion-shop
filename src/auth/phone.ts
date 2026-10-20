import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js'

const regionNames = new Intl.DisplayNames(undefined, { type: 'region' })

export const PHONE_COUNTRIES = getCountries()
  .map((code) => ({
    code,
    callingCode: getCountryCallingCode(code),
    name: regionNames.of(code) ?? code,
  }))
  .sort((left, right) => left.name.localeCompare(right.name))

export function parsePhoneInput(value: string, country: CountryCode) {
  const parsed = parsePhoneNumberFromString(value, country)
  if (!parsed || !parsed.isValid()) {
    throw new Error('Enter a valid phone number for the selected country.')
  }
  return parsed
}

export function normalizePhoneNumber(value: string, country?: CountryCode): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const parsed = parsePhoneNumberFromString(trimmed, country)
  if (!parsed || !parsed.isValid()) {
    throw new Error('Enter a valid phone number, including its country code.')
  }
  return parsed.number
}

export function getPhoneInput(value: string | null, fallbackCountry: CountryCode = 'ID') {
  if (!value) return { country: fallbackCountry, nationalNumber: '' }

  const parsed = parsePhoneNumberFromString(value, fallbackCountry)
  if (parsed) {
    return {
      country: parsed.country ?? fallbackCountry,
      nationalNumber: parsed.nationalNumber,
    }
  }
  return { country: fallbackCountry, nationalNumber: value }
}

export type { CountryCode }
