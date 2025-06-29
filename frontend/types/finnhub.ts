export interface FinnhubQuote {
  c: number  // Current price
  d: number  // Change
  dp: number // Percent change
  h: number  // High price of the day
  l: number  // Low price of the day
  o: number  // Open price of the day
  pc: number // Previous close price
  t: number  // Timestamp
}

export interface FinnhubCandle {
  c: number[] // Close prices
  h: number[] // High prices
  l: number[] // Low prices
  o: number[] // Open prices
  s: string   // Status
  t: number[] // Timestamps
  v: number[] // Volume data
}

export interface FinnhubCompanyProfile {
  country: string
  currency: string
  exchange: string
  ipo: string
  marketCapitalization: number
  name: string
  phone: string
  shareOutstanding: number
  ticker: string
  weburl: string
  logo: string
  finnhubIndustry: string
}

export interface FinnhubNews {
  category: string
  datetime: number
  headline: string
  id: number
  image: string
  related: string
  source: string
  summary: string
  url: string
}

export interface FinnhubBasicFinancials {
  metric: {
    '10DayAverageTradingVolume': number
    '13WeekPriceReturnDaily': number
    '26WeekPriceReturnDaily': number
    '3MonthAverageTradingVolume': number
    '52WeekHigh': number
    '52WeekLow': number
    '52WeekLowDate': string
    '52WeekPriceReturnDaily': number
    beta: number
    currentRatio: number
    epsBasicExclExtraItemsAnnual: number
    epsBasicExclExtraItemsTTM: number
    epsExclExtraItemsAnnual: number
    epsExclExtraItemsTTM: number
    epsGrowth3Y: number
    epsGrowth5Y: number
    epsGrowthQuarterlyYoy: number
    epsGrowthTTMYoy: number
    epsInclExtraItemsAnnual: number
    epsInclExtraItemsTTM: number
    epsNormalizedAnnual: number
    marketCapitalization: number
    peBasicExclExtraTTM: number
    peExclExtraAnnual: number
    peExclExtraHighTTM: number
    peExclTTM: number
    peInclExtraTTM: number
    peNormalizedAnnual: number
    pfcfShareAnnual: number
    pfcfShareTTM: number
    pretaxMargin5Y: number
    pretaxMarginAnnual: number
    pretaxMarginTTM: number
    'priceRelativeToS&P50013Week': number
    'priceRelativeToS&P50026Week': number
    'priceRelativeToS&P5004Week': number
    'priceRelativeToS&P50052Week': number
    'priceRelativeToS&P500Ytd': number
    psAnnual: number
    psTTM: number
    ptbvAnnual: number
    ptbvQuarterly: number
    quickRatio: number
    receivablesTurnoverAnnual: number
    receivablesTurnoverTTM: number
    revenueEmployeeAnnual: number
    revenueEmployeeTTM: number
    revenueGrowth3Y: number
    revenueGrowth5Y: number
    revenueGrowthQuarterlyYoy: number
    revenueGrowthTTMYoy: number
    revenuePerShareAnnual: number
    revenuePerShareTTM: number
    revenueShareGrowth5Y: number
    roaRfy: number
    roaa5Y: number
    roae5Y: number
    roaeTTM: number
    roeRfy: number
    roeTTM: number
    roi5Y: number
    roiAnnual: number
    roiTTM: number
    tangibleBookValuePerShareAnnual: number
    tangibleBookValuePerShareQuarterly: number
    tbvCagr5Y: number
    'totalDebt/totalEquityAnnual': number
    'totalDebt/totalEquityQuarterly': number
    totalDebtCagr5Y: number
  }
  series: {
    annual: any
    quarterly: any
  }
}

export type Range = "1d" | "1w" | "1m" | "3m" | "1y"
export type Resolution = "1" | "5" | "15" | "30" | "60" | "D" | "W" | "M"

export const RESOLUTION_MAP: Record<Range, Resolution> = {
  "1d": "D",   // Use daily for 1 day (free tier compatible)
  "1w": "D",   // Use daily for 1 week
  "1m": "D",   // Use daily for 1 month
  "3m": "D",   // Use daily for 3 months
  "1y": "W"    // Use weekly for 1 year
} 