import { fetchLatestNews, type NewsArticle } from "@/lib/news/fetchNews"
import LatestNewsClient from "./LatestNewsClient"

export default async function LatestNews() {
  let news: NewsArticle[] = []
  let hasError = false
  
  try {
    news = await fetchLatestNews('day') // Default to daily news
  } catch (error) {
    console.error('Failed to fetch news:', error)
    hasError = true
  }
  
  if (hasError) {
    return (
      <div className="relative">
        <div className="relative flex flex-col items-center justify-center py-8 text-center">
          <div className="text-4xl mb-4">📰</div>
          <h3 className="text-lg font-medium text-foreground mb-2">News API Not Available</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Unable to fetch latest financial news. Please check if the news API server is running.
          </p>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Start the backend: <code className="bg-muted px-1 rounded">cd backend && source venv/bin/activate && python app.py --server</code>
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  return <LatestNewsClient initialNews={news} initialPeriod="day" />
} 