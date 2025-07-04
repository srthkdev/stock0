// Define the PredefinedScreenerModules type locally since the import is not working
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

type ScreenerOption = {
  label: string
  value: PredefinedScreenerModules
}

export const ScreenerOptions: ScreenerOption[] = [
  { label: "Most Actives", value: "most_actives" },
  { label: "Day Gainers", value: "day_gainers" },
  { label: "Day Losers", value: "day_losers" },
  { label: "Growth Technology Stocks", value: "growth_technology_stocks" },
  { label: "The Most Shorted Stocks", value: "most_shorted_stocks" },
  { label: "Undervalued Growth Stocks", value: "undervalued_growth_stocks" },
  { label: "Aggressive Small Caps", value: "aggressive_small_caps" },
  { label: "Conservative Foreign Funds", value: "conservative_foreign_funds" },
  { label: "High Yield Bond", value: "high_yield_bond" },
  { label: "Portfolio Anchors", value: "portfolio_anchors" },
  { label: "Small Cap Gainers", value: "small_cap_gainers" },
  { label: "Solid Large Growth Funds", value: "solid_large_growth_funds" },
  { label: "Solid Midcap Growth Funds", value: "solid_midcap_growth_funds" },
  { label: "Top Mutual Funds", value: "top_mutual_funds" },
  { label: "Undervalued Large Caps", value: "undervalued_large_caps" },
]
