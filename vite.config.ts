import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { searchAddresses } from './api/_lib/addressSearch.js'

function sendJson(response: ServerResponse, status: number, body: Record<string, unknown>) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
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
      name: 'address-search-api',
      configureServer(server) {
        server.middlewares.use('/api/address-search', handleAddressSearch)
      },
    },
  ],
})
