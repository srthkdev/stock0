import { unstable_noStore as noStore } from "next/cache"
import { createFinnhubUrl } from "./config"
import type { FinnhubBasicFinancials } from "@/types/finnhub"

export async function fetchBasicFinancials(ticker: string): Promise<FinnhubBasicFinancials> {
  noStore()

  try {
    const url = createFinnhubUrl('/stock/metric', { 
      symbol: ticker,
      metric: 'all'
    })
    const response = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: FinnhubBasicFinancials = await response.json()
    
    if (!data.metric) {
      throw new Error(`No financial data available for ticker: ${ticker}`)
    }

    return data
  } catch (error) {
    console.error("Failed to fetch basic financials", error)
    throw new Error("Failed to fetch basic financials.")
  }
} 