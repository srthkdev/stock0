import { fetchBasicFinancials } from "@/lib/finnhub/fetchBasicFinancials"
import { fetchQuote } from "@/lib/finnhub/fetchQuote"

function formatNumber(num: number) {
  if (num >= 1e12) {
    return `${(num / 1e12).toFixed(2)}T`
  } else if (num >= 1e9) {
    return `${(num / 1e9).toFixed(2)}B`
  } else if (num >= 1e6) {
    return `${(num / 1e6).toFixed(2)}M`
  } else {
    return num.toString()
  }
}

const keysToDisplay = [
  {
    key: "o",
    title: "Open",
    source: "quote"
  },
  { 
    key: "h", 
    title: "High",
    source: "quote"
  },
  { 
    key: "l", 
    title: "Low",
    source: "quote"
  },
  { 
    key: "52WeekHigh", 
    title: "52W H",
    source: "financials"
  },
  { 
    key: "52WeekLow", 
    title: "52W L",
    source: "financials"
  },
  { 
    key: "marketCapitalization", 
    title: "Mkt cap", 
    format: formatNumber,
    source: "financials"
  },
  { 
    key: "peExclTTM", 
    title: "P/E",
    source: "financials"
  },
  { 
    key: "beta", 
    title: "Beta",
    source: "financials"
  },
  { 
    key: "epsBasicExclExtraItemsTTM", 
    title: "EPS",
    source: "financials"
  },
  {
    key: "10DayAverageTradingVolume",
    title: "Avg Vol",
    format: formatNumber,
    source: "financials"
  },
  {
    key: "ptbvAnnual",
    title: "P/B",
    source: "financials"
  },
  {
    key: "currentRatio",
    title: "Current Ratio",
    source: "financials"
  }
]

export default async function FinanceSummary({ ticker }: { ticker: string }) {
  const [quoteData, financialsData] = await Promise.all([
    fetchQuote(ticker),
    fetchBasicFinancials(ticker)
  ])

  return (
    <div className="grid grid-flow-col grid-rows-6 gap-4 md:grid-rows-3">
      {keysToDisplay.map((item) => {
        let data: any = undefined
        
        if (item.source === "quote") {
          data = (quoteData as any)[item.key]
        } else if (item.source === "financials") {
          data = (financialsData?.metric as any)?.[item.key]
        }
        
        let formattedData = "N/A"

        if (data !== undefined && !isNaN(data) && data !== null) {
          formattedData = item.format ? item.format(data) : data.toString()
        }
        
        return (
          <div
            key={item.key}
            className="flex flex-row items-center justify-between font-medium"
          >
            <span className="text-muted-foreground">{item.title}</span>
            <span>{formattedData}</span>
          </div>
        )
      })}
    </div>
  )
}
