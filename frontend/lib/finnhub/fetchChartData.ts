import { unstable_noStore as noStore } from "next/cache"
import { createFinnhubUrl } from "./config"
import type { FinnhubCandle, Range, Resolution } from "@/types/finnhub"
import { RESOLUTION_MAP } from "@/types/finnhub"

export function getTimeRange(range: Range): { from: number; to: number } {
  const now = Math.floor(Date.now() / 1000) // Current time in seconds
  const secondsPerDay = 24 * 60 * 60
  
  switch (range) {
    case "1d":
      // For 1 day with daily resolution, get last 5 days to show some data
      return { from: now - (5 * secondsPerDay), to: now }
    case "1w":
      // For 1 week
      return { from: now - (7 * secondsPerDay), to: now }
    case "1m":
      // For 1 month
      return { from: now - (30 * secondsPerDay), to: now }
    case "3m":
      // For 3 months
      return { from: now - (90 * secondsPerDay), to: now }
    case "1y":
      // For 1 year
      return { from: now - (365 * secondsPerDay), to: now }
    default:
      return { from: now - (5 * secondsPerDay), to: now }
  }
}

export async function fetchChartData(
  ticker: string,
  range: Range
): Promise<FinnhubCandle> {
  noStore()

  // For free tier accounts without historical data access,
  // return empty chart data immediately to avoid 403 errors
  console.log(`Chart data not available for ${ticker} (free tier limitation)`)
  
  return {
    c: [],
    h: [],
    l: [],
    o: [],
    s: 'no_data',
    t: [],
    v: []
  }

  // Commented out the actual API call since it returns 403
  /*
  try {
    const { from, to } = getTimeRange(range)
    const resolution = RESOLUTION_MAP[range]
    
    console.log(`Fetching chart data for ${ticker}:`, {
      range,
      resolution,
      from: new Date(from * 1000).toISOString(),
      to: new Date(to * 1000).toISOString()
    })
    
    const url = createFinnhubUrl('/stock/candle', {
      symbol: ticker.toUpperCase(), // Ensure uppercase
      resolution,
      from: from.toString(),
      to: to.toString()
    })

    console.log('Finnhub URL:', url)

    const response = await fetch(url, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    const data: FinnhubCandle = await response.json()
    console.log('API Response:', data)
    
    if (data.s === 'no_data') {
      console.warn(`No chart data available for ticker: ${ticker}`)
      return {
        c: [],
        h: [],
        l: [],
        o: [],
        s: 'no_data',
        t: [],
        v: []
      }
    }

    if (data.s !== 'ok') {
      console.warn(`API returned status: ${data.s} for ticker: ${ticker}`)
      return {
        c: [],
        h: [],
        l: [],
        o: [],
        s: data.s,
        t: [],
        v: []
      }
    }

    return data
  } catch (error) {
    console.error("Failed to fetch chart data for", ticker, error)
    
    return {
      c: [],
      h: [],
      l: [],
      o: [],
      s: 'error',
      t: [],
      v: []
    }
  }
  */
} 