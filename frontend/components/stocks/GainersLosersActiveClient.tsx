"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"

interface Stock {
  symbol: string
  shortName: string
  regularMarketPrice: number
  regularMarketChange: number
  regularMarketChangePercent: number
  regularMarketVolume?: number
}

function StockList({ stocks }: { stocks: Stock[] }) {
  return (
    <div className="space-y-3">
      {stocks.map((stock) => (
        <div
          key={stock.symbol}
          className="flex items-center justify-between text-sm"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs font-bold text-foreground">
              {stock.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="font-medium text-foreground">{stock.symbol}</div>
              <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                {stock.shortName}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">
              ${stock.regularMarketPrice?.toFixed(2) || 'N/A'}
            </div>
            <div
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-md",
                stock.regularMarketChangePercent > 0
                  ? "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
              )}
            >
              {stock.regularMarketChangePercent > 0 ? "+" : ""}
              {stock.regularMarketChangePercent?.toFixed(1) || '0.0'}%
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface GainersLosersActiveProps {
  data: {
    gainers: Stock[]
    losers: Stock[]
    actives: Stock[]
  }
}

export default function GainersLosersActiveClient({ data }: GainersLosersActiveProps) {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers' | 'actives'>('gainers')

      return (
      <div className="relative overflow-hidden rounded-lg">
      <div className="relative space-y-4">
        {/* Tab Navigation */}
        <div className="flex rounded-lg bg-muted p-1">
          <button
            onClick={() => setActiveTab('gainers')}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === 'gainers'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Gainers
          </button>
          <button
            onClick={() => setActiveTab('losers')}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === 'losers'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Losers
          </button>
          <button
            onClick={() => setActiveTab('actives')}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === 'actives'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Active
          </button>
        </div>

        {/* Content */}
        <StockList stocks={data[activeTab]} />
      </div>
    </div>
  )
} 