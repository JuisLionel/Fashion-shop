import type { IncomingMessage, ServerResponse } from 'node:http'
import { lookupAddress } from './_lib/reverseGeocode.js'

type ReverseGeocodeRequest = IncomingMessage & {
  body?: unknown
}

function sendJson(response: ServerResponse, status: number, body: Record<string, unknown>) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

export default async function reverseGeocode(request: ReverseGeocodeRequest, response: ServerResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    sendJson(response, 405, { error: 'Use POST to look up a location.' })
    return
  }

  if (!request.body || typeof request.body !== 'object') {
    sendJson(response, 400, { error: 'A latitude and longitude are required.' })
    return
  }

  const body = request.body as Record<string, unknown>
  const latitude = body.latitude
  const longitude = body.longitude
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    sendJson(response, 400, { error: 'The coordinates are invalid.' })
    return
  }

  try {
    const location = await lookupAddress(latitude, longitude)
    sendJson(response, 200, location)
  } catch (reason) {
    sendJson(response, 502, {
      error: reason instanceof Error ? reason.message : 'The address lookup service failed.',
    })
  }
}
