export type LocationFields = {
  street: string
  city: string
  postalCode: string
  country: string
}

const getString = (value: unknown) => typeof value === 'string' ? value.trim() : ''

function getLocationFields(payload: unknown): LocationFields {
  if (!payload || typeof payload !== 'object') {
    return { street: '', city: '', postalCode: '', country: '' }
  }

  const data = payload as Record<string, unknown>
  const address = data.address && typeof data.address === 'object'
    ? data.address as Record<string, unknown>
    : data
  const houseNumber = getString(address.house_number ?? address.houseNumber)
  const road = getString(address.road ?? address.street ?? address.pedestrian ?? address.residential)

  return {
    street: [houseNumber, road].filter(Boolean).join(' ') || getString(address.streetAddress),
    city: getString(address.city ?? address.town ?? address.village ?? address.municipality),
    postalCode: getString(address.postcode ?? address.postalCode ?? address.postal_code),
    country: getString(address.country),
  }
}

export async function lookupAddress(latitude: number, longitude: number): Promise<LocationFields> {
  const configuredEndpoint = process.env.REVERSE_GEOCODING_ENDPOINT
  let url: URL
  let method: 'GET' | 'POST'
  let headers: Record<string, string>
  let body: string | undefined

  if (configuredEndpoint) {
    try {
      url = new URL(configuredEndpoint)
    } catch {
      throw new Error('The configured address lookup endpoint is invalid.')
    }
    if (url.protocol !== 'https:') {
      throw new Error('The configured address lookup endpoint must use HTTPS.')
    }
    method = 'POST'
    headers = { 'Content-Type': 'application/json', Accept: 'application/json' }
    const apiKey = process.env.REVERSE_GEOCODING_API_KEY
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`
    body = JSON.stringify({ latitude, longitude })
  } else {
    url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('zoom', '18')
    url.searchParams.set('lat', String(latitude))
    url.searchParams.set('lon', String(longitude))
    method = 'GET'
    headers = {
      Accept: 'application/json',
      'User-Agent': 'FashionShop/1.0 (checkout address lookup)',
    }
  }

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      body,
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    throw new Error('The address lookup service could not be reached. Please enter your address manually.')
  }

  if (!response.ok) {
    throw new Error('The address lookup service could not find an address. Please enter it manually.')
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error('The address lookup service returned an invalid response.')
  }

  const location = getLocationFields(payload)
  if (!location.street && !location.city && !location.postalCode && !location.country) {
    throw new Error('No address details were found for this location. Please enter them manually.')
  }

  return location
}
