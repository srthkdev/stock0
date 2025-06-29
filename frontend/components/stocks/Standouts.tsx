import { cn } from "@/lib/utils"
import { TrendingUp } from "lucide-react"
import { fetchQuote } from "@/lib/finnhub/fetchQuote"
import { fetchCompanyProfile } from "@/lib/finnhub/fetchCompanyProfile"
import { fetchBasicFinancials } from "@/lib/finnhub/fetchBasicFinancials"

interface StandoutStock {
  symbol: string
  company: string
  price: number
  changePercent: number
  volume: string
  marketCap: string
  peRatio: number
  dividendYield: string
  description: string
}

async function fetchStandoutStock(): Promise<StandoutStock> {
  const symbol = "NKE" // Featured stock - you can make this dynamic
  
  try {
    const [quote, profile, financials] = await Promise.all([
      fetchQuote(symbol),
      fetchCompanyProfile(symbol),
      fetchBasicFinancials(symbol)
    ])

    const volume = (quote.t || 0) > 1000000 
      ? `${(quote.t / 1000000).toFixed(2)}M` 
      : `${(quote.t || 0).toLocaleString()}`
    
    const marketCap = profile.marketCapitalization 
      ? `${(profile.marketCapitalization / 1000).toFixed(2)}B`
      : "N/A"

    const peRatio = financials.metric?.peBasicExclExtraTTM || 0
    const dividendYield = "N/A" // Dividend yield not available in basic financials

    return {
      symbol: profile.ticker,
      company: profile.name,
      price: quote.c || 0,
      changePercent: quote.dp || 0,
      volume,
      marketCap,
      peRatio,
      dividendYield,
      description: `${profile.name} is a leading company in the ${profile.finnhubIndustry} industry, based in ${profile.country}. The company has shown ${quote.dp > 0 ? 'positive' : 'negative'} momentum with a ${Math.abs(quote.dp || 0).toFixed(2)}% change in stock price, reflecting market sentiment and business performance.`
    }
  } catch (error) {
    console.warn("Error fetching standout stock data:", error)
    throw error // Re-throw to let component handle the error
  }
}

// Simple chart component with mock data points
function MiniChart() {
  const points = [
    { x: 0, y: 80 },
    { x: 10, y: 78 },
    { x: 20, y: 76 },
    { x: 30, y: 74 },
    { x: 40, y: 72 },
    { x: 50, y: 74 },
    { x: 60, y: 76 },
    { x: 70, y: 82 },
    { x: 80, y: 88 },
    { x: 90, y: 85 },
    { x: 100, y: 72 }
  ]

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  return (
    <div className="relative h-16 w-full">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        className="overflow-visible"
      >
        <path
          d={pathData}
          fill="none"
          stroke="rgb(34, 197, 94)"
          strokeWidth="1.5"
          className="drop-shadow-sm"
        />
      </svg>
      <div className="absolute bottom-1 left-0 text-xs text-muted-foreground">
        12:00 PM
      </div>
      <div className="absolute bottom-1 right-0 text-xs text-muted-foreground">
        3:00 PM
      </div>
    </div>
  )
}

export default async function Standouts() {
  try {
    const stock = await fetchStandoutStock()

    return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="relative space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Standouts</h3>
        
        {/* Stock Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
              <svg className="h-4 w-4 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.017 12.067c-.11 0-.224-.021-.33-.067-.212-.092-.35-.302-.35-.533V8.533c0-.231.138-.441.35-.533.212-.092.468-.046.642.117l3.183 2.967c.138.129.217.309.217.5s-.079.371-.217.5l-3.183 2.967c-.104.096-.238.15-.38.15-.088 0-.177-.017-.262-.05z"/>
              </svg>
            </div>
            <div>
              <div className="font-semibold text-foreground">{stock.company}</div>
              <div className="text-xs text-muted-foreground">{stock.symbol}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">${stock.price.toFixed(2)}</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-600 dark:text-green-400 font-medium">
                {stock.changePercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="my-4">
          <MiniChart />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Volume</div>
            <div className="font-medium">{stock.volume}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Market Cap</div>
            <div className="font-medium">{stock.marketCap}</div>
          </div>
          <div>
            <div className="text-muted-foreground">P/E Ratio</div>
            <div className="font-medium">{stock.peRatio.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Dividend Yield</div>
            <div className="font-medium">{stock.dividendYield}</div>
          </div>
        </div>
      </div>
    </div>
    )
  } catch (error) {
    console.error('Failed to fetch standout stock data:', error)
    
    return (
      <div className="relative">
        <div className="relative flex flex-col items-center justify-center py-8 text-center">
          <div className="text-4xl mb-4">🌟</div>
          <h3 className="text-lg font-medium text-foreground mb-2">Finnhub API Not Available</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Unable to fetch standout stock data. Please check your Finnhub API connection.
          </p>
        </div>
      </div>
    )
  }
} 