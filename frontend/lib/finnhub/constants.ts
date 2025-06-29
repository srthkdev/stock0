import type { Range } from "@/types/finnhub"

export const DEFAULT_TICKER = "AAPL"
export const DEFAULT_RANGE: Range = "1d"

export const VALID_RANGES: Range[] = ["1d", "1w", "1m", "3m", "1y"]

// Popular market indices and their Finnhub symbols
export const MARKET_INDICES = {
  SP500: "^GSPC",
  NASDAQ: "^IXIC", 
  DOW: "^DJI",
  RUSSELL2000: "^RUT"
}

// Major market tickers for dashboard
export const DASHBOARD_TICKERS = [
  { symbol: "AAPL", shortName: "Apple Inc." },
  { symbol: "MSFT", shortName: "Microsoft Corp." },
  { symbol: "GOOGL", shortName: "Alphabet Inc." },
  { symbol: "AMZN", shortName: "Amazon.com Inc." },
  { symbol: "TSLA", shortName: "Tesla Inc." },
  { symbol: "META", shortName: "Meta Platforms Inc." },
  { symbol: "NVDA", shortName: "NVIDIA Corp." },
  { symbol: "NFLX", shortName: "Netflix Inc." }
] 