import { cn } from "@/lib/utils"
import { fetchScreenerStocks } from "@/lib/yahoo-finance/fetchScreenerStocks"

interface Stock {
  symbol: string
  shortName: string
  regularMarketPrice: number
  regularMarketChange: number
  regularMarketChangePercent: number
  regularMarketVolume?: number
}

async function fetchGainersLosersActive() {
  try {
    const [gainers, losers, actives] = await Promise.all([
      fetchScreenerStocks("day_gainers", 4),
      fetchScreenerStocks("day_losers", 4), 
      fetchScreenerStocks("most_actives", 4)
    ])

    return {
      gainers: gainers.quotes?.slice(0, 4) || [],
      losers: losers.quotes?.slice(0, 4) || [],
      actives: actives.quotes?.slice(0, 4) || []
    }
  } catch (error) {
    console.warn("Error fetching gainers/losers/active:", error)
    throw error // Re-throw to let component handle the error
  }
}



import GainersLosersActiveClient from "./GainersLosersActiveClient"

export default async function GainersLosersActive() {
  try {
    const data = await fetchGainersLosersActive()
    return <GainersLosersActiveClient data={data} />
  } catch (error) {
    console.error('Failed to fetch gainers/losers/active data:', error)
    
    // Return error state
          return (
        <div className="relative overflow-hidden rounded-lg">
        <div className="relative flex flex-col items-center justify-center py-8 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-foreground mb-2">Yahoo Finance API Not Available</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Unable to fetch market movers data. Please check your Yahoo Finance API connection.
          </p>
        </div>
      </div>
    )
  }
} 