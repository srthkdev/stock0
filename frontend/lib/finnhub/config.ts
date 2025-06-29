export const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY
export const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1'

if (!FINNHUB_API_KEY) {
  console.warn('⚠️ NEXT_PUBLIC_FINNHUB_API_KEY is not set in environment variables')
  console.warn('Please add your Finnhub API key to .env.local')
}

export const createFinnhubUrl = (endpoint: string, params: Record<string, string> = {}) => {
  if (!FINNHUB_API_KEY) {
    throw new Error('Finnhub API key is not configured. Please set NEXT_PUBLIC_FINNHUB_API_KEY in your environment variables.')
  }

  const url = new URL(`${FINNHUB_BASE_URL}${endpoint}`)
  url.searchParams.append('token', FINNHUB_API_KEY)
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) { // Only add non-empty values
      url.searchParams.append(key, value)
    }
  })
  
  return url.toString()
} 