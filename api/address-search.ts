import type { IncomingMessage, ServerResponse } from 'node:http'
import { searchAddresses, type SearchBias } from './_lib/addressSearch.js'

function sendJson(response: ServerResponse, status: number, body: Record<string, unknown>) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

function parseBias(params: URLSearchParams): SearchBias | undefined {
  const rawLat = params.get('lat')
  const rawLon = params.get('lon')
  if (!rawLat || !rawLon) return undefined
  const latitude = Number(rawLat)
  const longitude = Number(rawLon)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return undefined
  return { latitude, longitude }
}

export default async function addressSearch(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    sendJson(response, 405, { error: 'Use GET to search addresses.' })
    return
  }

  const params = new URL(request.url ?? '/', `https://${request.headers.host ?? 'localhost'}`).searchParams
  const query = params.get('q')?.trim() ?? ''
  if (query.length < 3 || query.length > 160) {
    sendJson(response, 400, { error: 'Enter between 3 and 160 characters to search addresses.' })
    return
  }

  try {
    sendJson(response, 200, { suggestions: await searchAddresses(query, parseBias(params)) })
  } catch (reason) {
    sendJson(response, 502, {
      error: reason instanceof Error ? reason.message : 'Address search failed.',
    })
  }
}