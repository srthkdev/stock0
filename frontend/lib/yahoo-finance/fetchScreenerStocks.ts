import { unstable_noStore as noStore } from "next/cache"
import yahooFinance from "yahoo-finance2"

// Define types locally since the imports are not working
type PredefinedScreenerModules = 
  | "most_actives"
  | "day_gainers" 
  | "day_losers"
  | "growth_technology_stocks"
  | "most_shorted_stocks"
  | "undervalued_growth_stocks"
  | "aggressive_small_caps"
  | "conservative_foreign_funds"
  | "high_yield_bond"
  | "portfolio_anchors"
  | "small_cap_gainers"
  | "solid_large_growth_funds"
  | "solid_midcap_growth_funds"
  | "top_mutual_funds"
  | "undervalued_large_caps";

interface ScreenerOptions {
  scrIds: PredefinedScreenerModules;
  count: number;
  region: string;
  lang: string;
}

interface ScreenerResult {
  quotes: any[];
  count: number;
  start: number;
  total: number;
}

const ITEMS_PER_PAGE = 40

export async function fetchScreenerStocks(query: string, count?: number) {
  noStore()

  // PAGINATION IS HANDLED BY TENSTACK TABLE

  const queryOptions: ScreenerOptions = {
    scrIds: query as PredefinedScreenerModules,
    count: count ? count : ITEMS_PER_PAGE,
    region: "US",
    lang: "en-US",
  }

  try {
    const response: ScreenerResult = await yahooFinance.screener(queryOptions, {
      validateResult: false,
    })

    return response
  } catch (error) {
    console.log("Failed to fetch screener stocks", error)
    throw new Error("Failed to fetch screener stocks.")
  }
}
