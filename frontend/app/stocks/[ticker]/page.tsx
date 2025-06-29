import StockChart from "@/components/chart/StockChart"
import CompanySummaryCard from "@/app/stocks/[ticker]/components/CompanySummaryCard"
import FinanceSummary from "@/app/stocks/[ticker]/components/FinanceSummary"
import News from "@/app/stocks/[ticker]/components/News"
import { Card, CardContent } from "@/components/ui/card"
import { DEFAULT_RANGE, VALID_RANGES } from "@/lib/finnhub/constants"
import { Suspense } from "react"
import type { Metadata } from "next"
import { fetchQuote } from "@/lib/finnhub/fetchQuote"
import { fetchCompanyProfile } from "@/lib/finnhub/fetchCompanyProfile"
import type { Range } from "@/types/finnhub"

type Props = {
  params: {
    ticker: string
  }
  searchParams?: {
    ticker?: string
    range?: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ticker = params.ticker

  const [quoteData, profileData] = await Promise.all([
    fetchQuote(ticker),
    fetchCompanyProfile(ticker)
  ])
  
  const currentPrice = quoteData.c?.toLocaleString("en-US", {
    style: "currency",
    currency: profileData.currency || "USD",
  })

  return {
    title: `${ticker} ${currentPrice} - ${profileData.name}`,
    description: `Real-time stock data for ${profileData.name} (${ticker})`,
    keywords: [ticker, "stocks", profileData.name],
  }
}

export default async function StocksPage({ params, searchParams }: Props) {
  const ticker = params.ticker
  const range = VALID_RANGES.includes(searchParams?.range as Range) 
    ? (searchParams?.range as Range) 
    : DEFAULT_RANGE

  return (
    <div>
      <Card>
        <CardContent className="space-y-10 pt-6 lg:px-40 lg:py-14">
          <Suspense
            fallback={
              <div className="flex h-[27.5rem] items-center justify-center text-muted-foreground ">
                Loading...
              </div>
            }
          >
            <StockChart ticker={ticker} range={range} />
          </Suspense>
          <Suspense
            fallback={
              <div className="flex h-[10rem] items-center justify-center text-muted-foreground ">
                Loading...
              </div>
            }
          >
            <FinanceSummary ticker={ticker} />
          </Suspense>
          <Suspense
            fallback={
              <div className="flex h-[10rem] items-center justify-center text-muted-foreground ">
                Loading...
              </div>
            }
          >
            <CompanySummaryCard ticker={ticker} />
          </Suspense>
          <Suspense
            fallback={
              <div className="flex h-[20rem] items-center justify-center text-muted-foreground ">
                Loading...
              </div>
            }
          >
            <News ticker={ticker} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
