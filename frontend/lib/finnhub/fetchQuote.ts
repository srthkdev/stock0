import { unstable_noStore as noStore } from "next/cache"
import { createFinnhubUrl } from "./config"
import type { FinnhubQuote } from "@/types/finnhub"

export async function fetchQuote(ticker: string): Promise<FinnhubQuote> {
  noStore()

  try {
    const url = createFinnhubUrl('/quote', { symbol: ticker })
    const response = await fetch(url, {
      next: { revalidate: 60 } // Cache for 1 minute
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: FinnhubQuote = await response.json()
    
    if (data.c === 0 && data.d === 0 && data.dp === 0) {
      throw new Error(`No data available for ticker: ${ticker}`)
    }

    return data
  } catch (error) {
    console.error("Failed to fetch stock quote", error)
    throw new Error("Failed to fetch stock quote.")
  }
} 