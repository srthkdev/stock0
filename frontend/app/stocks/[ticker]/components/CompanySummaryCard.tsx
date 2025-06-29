import { fetchCompanyProfile } from "@/lib/finnhub/fetchCompanyProfile"
import { Card, CardContent } from "../../../../components/ui/card"
import ReadMoreText from "../../../../components/ui/read-more-text"
import Link from "next/link"

export default async function CompanySummaryCard({
  ticker,
}: {
  ticker: string
}) {
  const data = await fetchCompanyProfile(ticker)

  if (!data || !data.name) {
    return null
  }

  const {
    name,
    finnhubIndustry,
    country,
    shareOutstanding,
    weburl,
    ipo,
    marketCapitalization,
    exchange,
    currency,
  } = data

  // Create a business summary from available data
  const businessSummary = `${name} is a company listed on ${exchange} and operates in the ${finnhubIndustry} industry. The company is based in ${country} and has ${shareOutstanding ? shareOutstanding.toLocaleString() : 'N/A'} shares outstanding. With a market capitalization of ${marketCapitalization ? `$${(marketCapitalization * 1000000).toLocaleString()}` : 'N/A'}, the company went public in ${ipo || 'N/A'}.`

  return (
    <Card className="group relative min-h-max overflow-hidden">
      <div className="absolute z-0 h-full w-full bg-gradient-to-t from-neutral-50 via-neutral-200 to-neutral-50 bg-size-200 bg-pos-0 blur-2xl transition-all duration-500 group-hover:bg-pos-100 dark:from-black dark:via-blue-950 dark:to-black" />

      <CardContent className="z-50 flex h-full w-full flex-col items-start justify-center gap-6 py-10 text-sm lg:flex-row">
        <div className="z-50 max-w-2xl text-pretty font-medium">
          <ReadMoreText text={businessSummary} truncateLength={500} />
        </div>
        <div className="z-50 min-w-fit font-medium text-muted-foreground">
          <div>
            Company: <span className="text-foreground ">{name}</span>
          </div>
          <div>
            Industry: <span className="text-foreground ">{finnhubIndustry}</span>
          </div>
          <div>
            Country: <span className="text-foreground ">{country}</span>
          </div>
          <div>
            Exchange: <span className="text-foreground ">{exchange}</span>
          </div>
          <div>
            Currency: <span className="text-foreground ">{currency}</span>
          </div>
          <div>
            IPO Date: <span className="text-foreground ">{ipo || 'N/A'}</span>
          </div>
          <div>
            Market Cap:{" "}
            <span className="text-foreground ">
              {marketCapitalization 
                ? `$${(marketCapitalization * 1000000).toLocaleString()}`
                : 'N/A'
              }
            </span>
          </div>
          <div>
            Shares Outstanding:{" "}
            <span className="text-foreground ">
              {shareOutstanding?.toLocaleString() || 'N/A'}
            </span>
          </div>
          {weburl && (
            <div>
              Website:{" "}
              <span className="text-foreground ">
                <Link
                  href={weburl}
                  className="text-blue-600 hover:underline dark:text-blue-500"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {weburl}
                </Link>
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
