import { cn } from "@/lib/utils"
import { fetchQuote } from "@/lib/finnhub/fetchQuote"

interface Sector {
  name: string
  price: number
  changePercent: number
}

// Sector ETF symbols for real data
const sectorETFs = [
  { name: "Technology", symbol: "XLK" },
  { name: "Energy", symbol: "XLE" },
  { name: "Discretionary", symbol: "XLY" },
  { name: "Staples", symbol: "XLP" },
  { name: "Communications", symbol: "XLC" },
  { name: "Industrials", symbol: "XLI" },
  { name: "Financials", symbol: "XLF" },
  { name: "Utilities", symbol: "XLU" },
  { name: "Materials", symbol: "XLB" },
  { name: "Real Estate", symbol: "XLRE" },
  { name: "Healthcare", symbol: "XLV" }
]

async function fetchSectorData(): Promise<Sector[]> {
  try {
    const quotes = await Promise.all(
      sectorETFs.map(sector => fetchQuote(sector.symbol))
    )

    return sectorETFs.map((sector, index) => ({
      name: sector.name,
      price: quotes[index].c || 0,
      changePercent: quotes[index].dp || 0
    }))
  } catch (error) {
    console.warn("Error fetching sector data:", error)
    throw error // Re-throw to let component handle the error
  }
}

export default async function EquitySectors() {
  try {
    const sectorData = await fetchSectorData()
    
    return (
      <div className="relative overflow-hidden rounded-lg">
        <div className="relative space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Equity Sectors</h3>
          {sectorData.map((sector: Sector) => (
            <div
              key={sector.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="font-medium text-foreground min-w-0 flex-1">
                {sector.name}
              </div>
              <div className="flex items-center gap-3 text-right">
                <div className="font-medium text-foreground">
                  ${sector.price.toFixed(2)}
                </div>
                <div
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-md min-w-[60px] text-center",
                    sector.changePercent > 0
                      ? "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                      : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                  )}
                >
                  {sector.changePercent > 0 ? "↗" : "↘"} {Math.abs(sector.changePercent).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Failed to fetch sector data:', error)
    
    return (
      <div className="relative overflow-hidden rounded-lg">
        <div className="relative flex flex-col items-center justify-center py-8 text-center">
          <div className="text-4xl mb-4">🏭</div>
          <h3 className="text-lg font-medium text-foreground mb-2">Finnhub API Not Available</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Unable to fetch sector ETF data. Please check your Finnhub API connection.
          </p>
        </div>
      </div>
    )
  }
} 