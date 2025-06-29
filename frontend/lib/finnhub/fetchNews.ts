import { unstable_noStore as noStore } from "next/cache"
import { createFinnhubUrl } from "./config"
import type { FinnhubNews } from "@/types/finnhub"

export async function fetchCompanyNews(ticker: string, count: number = 5): Promise<FinnhubNews[]> {
  noStore()

  try {
    const from = new Date()
    from.setDate(from.getDate() - 7) // Last 7 days
    const to = new Date()

    const url = createFinnhubUrl('/company-news', {
      symbol: ticker,
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    })

    const response = await fetch(url, {
      next: { revalidate: 1800 } // Cache for 30 minutes
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: FinnhubNews[] = await response.json()
    
    return data.slice(0, count)
  } catch (error) {
    console.error("Failed to fetch company news", error)
    // Return empty array instead of throwing error
    return []
  }
}

export async function fetchMarketNews(count: number = 10): Promise<FinnhubNews[]> {
  noStore()

  try {
    const url = createFinnhubUrl('/news', {
      category: 'general'
    })

    const response = await fetch(url, {
      next: { revalidate: 1800 } // Cache for 30 minutes
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: FinnhubNews[] = await response.json()
    
    return data.slice(0, count)
  } catch (error) {
    console.error("Failed to fetch market news", error)
    // Return empty array instead of throwing error
    return []
  }
} 