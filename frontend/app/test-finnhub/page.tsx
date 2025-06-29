import { fetchQuote } from "@/lib/finnhub/fetchQuote"
import { fetchCompanyProfile } from "@/lib/finnhub/fetchCompanyProfile"
import { fetchChartData } from "@/lib/finnhub/fetchChartData"
import { fetchCompanyNews } from "@/lib/finnhub/fetchNews"

export default async function TestFinnhub() {
  const ticker = "AAPL"
  
  try {
    const [quote, profile, chartData, news] = await Promise.all([
      fetchQuote(ticker),
      fetchCompanyProfile(ticker),
      fetchChartData(ticker, "1d"),
      fetchCompanyNews(ticker, 3)
    ])

    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Finnhub API Test - {ticker}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Quote Data</h2>
            <div className="space-y-2">
              <p><strong>Current Price:</strong> ${quote.c}</p>
              <p><strong>Change:</strong> ${quote.d}</p>
              <p><strong>Change %:</strong> {quote.dp}%</p>
              <p><strong>High:</strong> ${quote.h}</p>
              <p><strong>Low:</strong> ${quote.l}</p>
              <p><strong>Open:</strong> ${quote.o}</p>
              <p><strong>Previous Close:</strong> ${quote.pc}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Company Profile</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Country:</strong> {profile.country}</p>
              <p><strong>Currency:</strong> {profile.currency}</p>
              <p><strong>Exchange:</strong> {profile.exchange}</p>
              <p><strong>Industry:</strong> {profile.finnhubIndustry}</p>
              <p><strong>IPO:</strong> {profile.ipo}</p>
              <p><strong>Market Cap:</strong> ${profile.marketCapitalization}M</p>
              <p><strong>Website:</strong> <a href={profile.weburl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{profile.weburl}</a></p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Chart Data</h2>
            <div className="space-y-2">
              <p><strong>Status:</strong> {chartData.s}</p>
              <p><strong>Data Points:</strong> {chartData.c?.length || 0}</p>
              {chartData.c && chartData.c.length > 0 && (
                <>
                  <p><strong>First Price:</strong> ${chartData.c[0]}</p>
                  <p><strong>Last Price:</strong> ${chartData.c[chartData.c.length - 1]}</p>
                </>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent News</h2>
            <div className="space-y-4">
              {news.map((article, index) => (
                <div key={article.id} className="border-b pb-2">
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">
                    {article.headline}
                  </a>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {article.source} - {new Date(article.datetime * 1000).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-red-500">Error Testing Finnhub API</h1>
        <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg">
          <p className="text-red-800 dark:text-red-200">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            Make sure your NEXT_PUBLIC_FINNHUB_API_KEY is set in your environment variables.
          </p>
        </div>
      </div>
    )
  }
} 