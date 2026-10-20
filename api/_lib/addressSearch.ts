export type AddressSuggestion = {
  id: string
  label: string
  street: string
  city: string
  postalCode: string
  country: string
}

export type SearchBias = {
  latitude: number
  longitude: number
}

// Photon result types that describe an area, not a street or building.
// For these, `name` is the place name and must NOT be used as a street.
const PLACE_TYPES = new Set(['city', 'district', 'county', 'state', 'country', 'locality'])

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeAddressQuery(query: string): string {
  return query
    // Indonesian abbreviations
    .replace(/\bjl\.?\s*/gi, 'Jalan ')
    .replace(/\bgg\.?\s+/gi, 'Gang ')
    .replace(/\bII\b/gi, '2')
    // RT/RW neighbourhood units are almost never in OSM and hurt matching
    .replace(/\brt\.?\s*\d+(?:\s*\/?\s*rw\.?\s*\d+)?/gi, ' ')
    .replace(/\brw\.?\s*\d+/gi, ' ')
    // House numbers: only strip when followed by a digit, so words like
    // "Nova" or "Nomor Satu" are not destroyed. (Old regex also never matched "#".)
    .replace(/\b(?:no|nomor)\b\.?\s*\d[\w/-]*/gi, ' ')
    .replace(/#\s*\d[\w/-]*/g, ' ')
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatStreet(road: string, houseNumber: string, countryCode: string): string {
  if (!road) return ''
  if (!houseNumber) return road
  return countryCode === 'ID' ? `${road} No. ${houseNumber}` : `${houseNumber} ${road}`
}

function parseSuggestions(payload: unknown): AddressSuggestion[] {
  if (!payload || typeof payload !== 'object') return []
  const features = (payload as { features?: unknown }).features
  if (!Array.isArray(features)) return []

  const seen = new Set<string>()

  return features.flatMap((feature, index) => {
    if (!feature || typeof feature !== 'object') return []
    const rawProperties = (feature as { properties?: unknown }).properties
    if (!rawProperties || typeof rawProperties !== 'object') return []

    const p = rawProperties as Record<string, unknown>
    const type = asString(p.type)
    const name = asString(p.name)
    const countryCode = asString(p.countrycode).toUpperCase()
    const isPlace = PLACE_TYPES.has(type)

    // Only treat something as a street when Photon says it is one.
    const road = asString(p.street) || (type === 'street' ? name : '')
    const street = isPlace ? '' : formatStreet(road, asString(p.housenumber), countryCode)

    const placeName = type === 'city' || type === 'county' ? name : ''
    const district = asString(p.district)
    const city = asString(p.city) || placeName || district || asString(p.county)
    const postalCode = asString(p.postcode)
    const country = asString(p.country)

    // POIs (shops, malls...) keep their name in the label, but the name is not the street.
    const head = type === 'other' && name ? [name, street] : [street || name]
    const parts = [...head, district, city, asString(p.state), postalCode, country]
    const label = parts.filter((value, i) => value && parts.indexOf(value) === i).join(', ')

    if (!label || seen.has(label)) return []
    seen.add(label)

    const id = `${asString(p.osm_type)}-${asString(p.osm_id)}-${index}`
    return [{ id, label, street, city, postalCode, country }]
  })
}

export async function searchAddresses(query: string, bias?: SearchBias): Promise<AddressSuggestion[]> {
  const normalizedQuery = normalizeAddressQuery(query)
  const queries = [...new Set([query, normalizedQuery].filter((value) => value.length >= 3))]

  // Without a bias, Photon ranks results worldwide, so "Jalan Sudirman" can come
  // back from any city. Bias toward the user's location (or a configured default).
  const envLat = Number(process.env.ADDRESS_SEARCH_BIAS_LAT)
  const envLon = Number(process.env.ADDRESS_SEARCH_BIAS_LON)
  const effectiveBias: SearchBias | undefined = bias
    ?? (process.env.ADDRESS_SEARCH_BIAS_LAT && process.env.ADDRESS_SEARCH_BIAS_LON
      && Number.isFinite(envLat) && Number.isFinite(envLon)
      ? { latitude: envLat, longitude: envLon }
      : undefined)

  for (const searchQuery of queries) {
    const url = new URL('https://photon.komoot.io/api/')
    url.searchParams.set('q', searchQuery)
    url.searchParams.set('limit', '10')
    if (effectiveBias) {
      url.searchParams.set('lat', String(effectiveBias.latitude))
      url.searchParams.set('lon', String(effectiveBias.longitude))
      url.searchParams.set('zoom', '11') // city-sized area
      url.searchParams.set('location_bias_scale', '0.5')
    }

    let response: Response
    try {
      response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8_000),
      })
    } catch {
      throw new Error('Address search is unavailable. Please enter your address manually.')
    }

    if (!response.ok) {
      throw new Error('Address search is temporarily unavailable. Please enter your address manually.')
    }

    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      throw new Error('Address search returned invalid results.')
    }

    const suggestions = parseSuggestions(payload).slice(0, 6)
    if (suggestions.length > 0) return suggestions
  }

  return []
}