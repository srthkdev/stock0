import { cn } from "@/lib/utils"
import { fetchChartData } from "@/lib/finnhub/fetchChartData"
import type { Range } from "@/types/finnhub"
import AreaClosedChart from "./AreaClosedChart"
import { fetchQuote } from "@/lib/finnhub/fetchQuote"
import { fetchCompanyProfile } from "@/lib/finnhub/fetchCompanyProfile"

interface StockGraphProps {
  ticker: string
  range: Range
}

const rangeTextMapping = {
  "1d": "Today",
  "1w": "Past Week",
  "1m": "Past Month",
  "3m": "Past 3 Months",
  "1y": "Past Year",
}

function calculatePriceChange(firstPrice: number, currentPrice: number) {
  if (!firstPrice || !currentPrice) return 0
  return ((currentPrice - firstPrice) / firstPrice) * 100
}

export default async function StockChart({
  ticker,
  range,
}: StockGraphProps) {
  const [chartData, quoteData, profileData] = await Promise.all([
    fetchChartData(ticker, range),
    fetchQuote(ticker),
    fetchCompanyProfile(ticker)
  ])

  const priceChange = chartData.c.length > 0 ? 
    calculatePriceChange(chartData.c[0], chartData.c[chartData.c.length - 1]) : 0

  const ChartQuotes = chartData.t
    .map((timestamp, index) => ({
      date: new Date(timestamp * 1000),
      close: chartData.c[index]?.toFixed(2),
    }))
    .filter((quote) => quote.close !== undefined)

  return (
    <div className="h-[27.5rem] w-full">
      <div>
        <div className="space-x-1 text-muted-foreground">
          <span className="font-bold text-primary">{ticker}</span>
          <span>·</span>
          <span>{profileData.exchange}</span>
          <span>{profileData.name}</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold">
            {quoteData.c?.toLocaleString(undefined, {
              style: "currency",
              currency: profileData.currency || "USD",
            })}
          </span>
          <span
            className={cn(
              "text-sm font-medium",
              quoteData.dp > 0
                ? "text-green-500"
                : quoteData.dp < 0
                  ? "text-red-500"
                  : "text-neutral-500"
            )}
          >
            {quoteData.dp > 0 ? "+" : ""}
            {quoteData.d?.toFixed(2)} ({quoteData.dp?.toFixed(2)}%)
          </span>
        </div>

        <div className="flex flex-row items-end justify-between">
          <div className="space-x-1">
            <span className="text-sm text-muted-foreground">
              Open: ${quoteData.o?.toFixed(2)} | 
              High: ${quoteData.h?.toFixed(2)} | 
              Low: ${quoteData.l?.toFixed(2)} | 
              Prev Close: ${quoteData.pc?.toFixed(2)}
            </span>
          </div>
          <span className="space-x-1 whitespace-nowrap font-semibold">
            {priceChange !== 0 && rangeTextMapping[range] !== "" && (
              <span
                className={cn(
                  priceChange > 0
                    ? "text-green-800 dark:text-green-400"
                    : "text-red-800 dark:text-red-500"
                )}
              >
                {priceChange > 0
                  ? `+${priceChange.toFixed(2)}%`
                  : `${priceChange.toFixed(2)}%`}
              </span>
            )}
            <span className="text-muted-foreground">
              {rangeTextMapping[range]}
            </span>
          </span>
        </div>
      </div>
      {ChartQuotes.length === 0 && (
        <div className="flex h-full items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-lg font-medium text-muted-foreground">
              📊 Chart data requires paid plan
            </div>
            <div className="text-sm text-muted-foreground">
              Real-time quotes are available above
            </div>
            <div className="text-xs text-muted-foreground">
              Upgrade to Finnhub paid plan for historical charts
            </div>
          </div>
        </div>
      )}
      {ChartQuotes.length > 0 && (
        <AreaClosedChart chartQuotes={ChartQuotes} range={range} />
      )}
    </div>
  )
}
