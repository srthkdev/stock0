import { fetchCompanyNews } from "@/lib/finnhub/fetchNews"
import Link from "next/link"
import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from "date-fns"

function timeAgo(timestamp: number) {
  const publishDate = new Date(timestamp * 1000)
  const now = new Date()

  const diffInMinutes = differenceInMinutes(now, publishDate)
  const diffInHours = differenceInHours(now, publishDate)
  const diffInDays = differenceInDays(now, publishDate)

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  } else {
    return `${diffInDays} days ago`
  }
}

export default async function News({ ticker }: { ticker: string }) {
  const newsData = await fetchCompanyNews(ticker, 5)
  const url = `https://finnhub.io/`

  return (
    <div className="w-4/5">
      {newsData.length === 0 && (
        <div className="py-4 text-center text-sm font-medium text-muted-foreground">
          No Recent Stories
        </div>
      )}
      {newsData.length > 0 && (
        <>
          <Link
            href={url}
            prefetch={false}
            className="group flex w-fit flex-row items-center gap-2 pb-4 text-sm font-medium text-blue-500"
          >
            See More Data from Finnhub
            <i>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </i>
          </Link>
          <div className="flex flex-col gap-2">
            {newsData.map((article) => (
              <Link
                key={article.id}
                href={article.url}
                prefetch={false}
                className="flex flex-col gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {article.source} - {timeAgo(article.datetime)}
                </span>
                <span className="font-semibold">{article.headline}</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {article.summary.substring(0, 150)}...
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
