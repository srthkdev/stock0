import { unstable_noStore as noStore } from "next/cache"
import { createFinnhubUrl } from "./config"
import type { FinnhubCompanyProfile } from "@/types/finnhub"

export async function fetchCompanyProfile(ticker: string): Promise<FinnhubCompanyProfile> {
  noStore()

  try {
    const url = createFinnhubUrl('/stock/profile2', { symbol: ticker })
    const response = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: FinnhubCompanyProfile = await response.json()
    
    if (!data.name) {
      throw new Error(`No company profile available for ticker: ${ticker}`)
    }

    return data
  } catch (error) {
    console.error("Failed to fetch company profile", error)
    throw new Error("Failed to fetch company profile.")
  }
} 