import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { searchAddresses } from './api/_lib/addressSearch.js'
import { lookupAddress } from './api/_lib/reverseGeocode.js'

function sendJson(response: ServerResponse, status: number, body: Record<string, unknown>) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

function isCoordinates(value: unknown): value is { latitude: number; longitude: number } {
  if (!value || typeof value !== 'object') return false
  const { latitude, longitude } = value as Record<string, unknown>
  return typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
}

function handleReverseGeocode(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    sendJson(response, 405, { error: 'Use POST to look up a location.' })
    return
  }

  void (async () => {
    let rawBody = ''
    for await (const chunk of request) {
      rawBody += typeof chunk === 'string' ? chunk : chunk.toString()
      if (rawBody.length > 16_384) {
        sendJson(response, 413, { error: 'The request body is too large.' })
        return
      }
    }

    let body: unknown
    try {
      body = JSON.parse(rawBody)
    } catch {
      sendJson(response, 400, { error: 'A valid JSON latitude and longitude are required.' })
      return
    }

    if (!isCoordinates(body)) {
      sendJson(response, 400, { error: 'The coordinates are invalid.' })
      return
    }

    try {
      const location = await lookupAddress(body.latitude, body.longitude)
      sendJson(response, 200, location)
    } catch (reason) {
      sendJson(response, 502, {
        error: reason instanceof Error ? reason.message : 'The address lookup service failed.',
      })
    }
  })().catch(() => {
    if (!response.writableEnded) {
      sendJson(response, 400, { error: 'Could not read the location lookup request.' })
    }
  })
}

function handleAddressSearch(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    sendJson(response, 405, { error: 'Use GET to search addresses.' })
    return
  }

  const query = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`).searchParams.get('q')?.trim() ?? ''
  if (query.length < 3 || query.length > 160) {
    sendJson(response, 400, { error: 'Enter between 3 and 160 characters to search addresses.' })
    return
  }

  void searchAddresses(query).then(
    (suggestions) => sendJson(response, 200, { suggestions }),
    (reason: unknown) => sendJson(response, 502, {
      error: reason instanceof Error ? reason.message : 'Address search failed.',
    }),
  )
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'reverse-geocoding-api',
      configureServer(server) {
        server.middlewares.use('/api/address-search', handleAddressSearch)
        server.middlewares.use('/api/reverse-geocode', handleReverseGeocode)
      },
    },
  ],
})
