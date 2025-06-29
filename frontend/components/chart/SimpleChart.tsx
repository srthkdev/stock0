"use client"

import { useEffect, useState } from "react"
import { fetchQuote } from "@/lib/finnhub/fetchQuote"
import { fetchChartData } from "@/lib/finnhub/fetchChartData"
import type { Range } from "@/types/finnhub"
import { cn } from "@/lib/utils"

interface SimpleChartProps {
  ticker: string
  range: Range
}

export default function SimpleChart({ ticker, range }: SimpleChartProps) {
  const [quote, setQuote] = useState<any>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const [quoteData, chartResponse] = await Promise.all([
          fetchQuote(ticker),
          fetchChartData(ticker, range)
        ])
        
        setQuote(quoteData)
        setChartData(chartResponse)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [ticker, range])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading chart data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 font-medium">Chart temporarily unavailable</div>
          <div className="text-sm text-muted-foreground mt-1">
            Using daily data only (free tier limitation)
          </div>
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">No data available</div>
      </div>
    )
  }

  const isPositive = quote.dp >= 0

  return (
    <div className="space-y-4">
      {/* Current Price Display */}
      <div className="text-center">
        <div className="text-3xl font-bold">
          ${quote.c?.toFixed(2)}
        </div>
        <div
          className={cn(
            "text-lg font-medium",
            isPositive ? "text-green-500" : "text-red-500"
          )}
        >
          {isPositive ? "+" : ""}
          {quote.d?.toFixed(2)} ({quote.dp?.toFixed(2)}%)
        </div>
      </div>

      {/* Simple Price Bars */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">Today's Range</div>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Low:</span> ${quote.l?.toFixed(2)}
          </div>
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded relative">
            <div 
              className={cn(
                "h-full rounded",
                isPositive ? "bg-green-500" : "bg-red-500"
              )}
              style={{
                width: `${((quote.c - quote.l) / (quote.h - quote.l)) * 100}%`
              }}
            />
          </div>
          <div>
            <span className="text-muted-foreground">High:</span> ${quote.h?.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Open:</span> ${quote.o?.toFixed(2)}
        </div>
        <div>
          <span className="text-muted-foreground">Prev Close:</span> ${quote.pc?.toFixed(2)}
        </div>
      </div>

      {/* Chart Data Info */}
      {chartData && chartData.c && chartData.c.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Historical data: {chartData.c.length} data points available
        </div>
      )}
    </div>
  )
} 