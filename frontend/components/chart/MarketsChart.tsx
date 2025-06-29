import { fetchChartData } from "@/lib/finnhub/fetchChartData"
import { Range } from "@/types/finnhub"
import AreaClosedChart from "./AreaClosedChart"
import { fetchQuote } from "@/lib/finnhub/fetchQuote"
import { fetchCompanyProfile } from "@/lib/finnhub/fetchCompanyProfile"

export default async function MarketsChart({
  ticker,
  range,
}: {
  ticker: string
  range: Range
}) {
  const [chartData, quoteData, profileData] = await Promise.all([
    fetchChartData(ticker, range),
    fetchQuote(ticker),
    fetchCompanyProfile(ticker)
  ])

  const stockQuotes = chartData.t
    .map((timestamp, index) => ({
      date: new Date(timestamp * 1000),
      close: chartData.c[index]?.toFixed(2),
    }))
    .filter((quote) => quote.close !== undefined)

  return (
    <>
      <div className="mb-0.5 font-medium">
        {profileData.name} ({ticker}){" "}
        {quoteData.c?.toLocaleString(undefined, {
          style: "currency",
          currency: profileData.currency || "USD",
        })}
      </div>
      {stockQuotes.length > 0 ? (
        <AreaClosedChart chartQuotes={stockQuotes} range={range} />
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="text-center space-y-1">
            <div className="text-sm font-medium text-muted-foreground">
              📈 Historical charts require paid plan
            </div>
            <div className="text-xs text-muted-foreground">
              Current price shown above
            </div>
          </div>
        </div>
      )}
    </>
  )
}
