import { DataTable } from "@/components/stocks/markets/data-table"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DEFAULT_RANGE, DASHBOARD_TICKERS } from "@/lib/finnhub/constants"
import { Suspense } from "react"
import MarketsChart from "@/components/chart/MarketsChart"
import Link from "next/link"
import { columns } from "@/components/stocks/markets/columns"
import SectorPerformance from "@/components/stocks/SectorPerformance"
import { fetchQuote } from "@/lib/finnhub/fetchQuote"
import { fetchMarketNews } from "@/lib/finnhub/fetchNews"
import type { Range } from "@/types/finnhub"

function isMarketOpen() {
  const now = new Date()

  // Convert to New York time
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }
  const formatter = new Intl.DateTimeFormat([], options)

  const timeString = formatter.format(now)
  const [hour, minute] = timeString.split(":").map(Number)
  const timeInET = hour + minute / 60

  // Get the day of the week in New York time
  const dayInET = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  ).getDay()

  // Check if the current time is between 9:30 AM and 4:00 PM ET on a weekday
  if (dayInET >= 1 && dayInET <= 5 && timeInET >= 9.5 && timeInET < 16) {
    return true
  } else {
    return false
  }
}

// Major market indices
const majorIndices = [
  { symbol: "SPY", shortName: "S&P 500" },
  { symbol: "QQQ", shortName: "NASDAQ" },
  { symbol: "DIA", shortName: "Dow Jones" },
  { symbol: "IWM", shortName: "Russell 2000" },
]

// Popular stocks
const popularStocks = [
  { symbol: "AAPL", shortName: "Apple Inc." },
  { symbol: "MSFT", shortName: "Microsoft Corp." },
  { symbol: "GOOGL", shortName: "Alphabet Inc." },
  { symbol: "AMZN", shortName: "Amazon.com Inc." },
  { symbol: "TSLA", shortName: "Tesla Inc." },
  { symbol: "META", shortName: "Meta Platforms Inc." },
]

function getMarketSentiment(changePercentage: number | undefined) {
  if (!changePercentage) {
    return "neutral"
  }
  if (changePercentage > 0.1) {
    return "bullish"
  } else if (changePercentage < -0.1) {
    return "bearish"
  } else {
    return "neutral"
  }
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams?: {
    ticker?: string
    range?: string
  }
}) {
  const tickers = isMarketOpen() ? [...majorIndices, ...popularStocks] : DASHBOARD_TICKERS

  const ticker = searchParams?.ticker || tickers[0].symbol
  const range = (searchParams?.range as Range) || DEFAULT_RANGE
  
  const [news, ...quotes] = await Promise.all([
    fetchMarketNews(1),
    ...tickers.map(({ symbol }) => fetchQuote(symbol))
  ])

  const resultsWithTitles = quotes.map((quote, index) => {
    return {
      symbol: tickers[index].symbol,
      shortName: tickers[index].shortName,
      regularMarketPrice: quote.c,
      regularMarketChange: quote.d,
      regularMarketChangePercent: quote.dp,
    } as any
  })

  const marketSentiment = getMarketSentiment(
    resultsWithTitles[0]?.regularMarketChangePercent
  )

  const sentimentColor =
    marketSentiment === "bullish"
      ? "text-green-500"
      : marketSentiment === "bearish"
        ? "text-red-500"
        : "text-neutral-500"

  const sentimentBackground =
    marketSentiment === "bullish"
      ? "bg-green-500/10"
      : marketSentiment === "bearish"
        ? "bg-red-300/50 dark:bg-red-950/50"
        : "bg-neutral-500/10"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <Card className="relative flex h-full min-h-[15rem] flex-col justify-between overflow-hidden">
            <CardHeader>
              <CardTitle className="z-50 w-fit rounded-full px-4  py-2 font-medium dark:bg-neutral-100/5">
                The markets are{" "}
                <strong className={sentimentColor}>{marketSentiment}</strong>
              </CardTitle>
            </CardHeader>
            {news[0] && news[0].headline && (
              <CardFooter className="flex-col items-start">
                <p className="mb-2 text-sm font-semibold text-neutral-500 dark:text-neutral-500">
                  What you need to know today
                </p>
                <Link
                  prefetch={false}
                  href={news[0].url}
                  className="text-lg font-extrabold"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {news[0].headline}
                </Link>
              </CardFooter>
            )}
            <div
              className={`pointer-events-none absolute inset-0 z-0 h-[65%] w-[65%] -translate-x-[10%] -translate-y-[30%] rounded-full blur-3xl ${sentimentBackground}`}
            />
          </Card>
        </div>
        <div className="w-full lg:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sector Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading...</div>}>
                <SectorPerformance />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
      <div>
        <h2 className="py-4 text-xl font-medium">Markets</h2>
        <Card className="flex flex-col gap-4 p-6 lg:flex-row">
          <div className="w-full lg:w-1/2">
            <Suspense fallback={<div>Loading...</div>}>
              <DataTable columns={columns} data={resultsWithTitles} />
            </Suspense>
          </div>
          <div className="w-full lg:w-1/2">
            <Suspense fallback={<div>Loading...</div>}>
              <MarketsChart ticker={ticker} range={range} />
            </Suspense>
          </div>
        </Card>
      </div>
    </div>
  )
} 