# Finnhub API Migration Guide

This document outlines the migration from Yahoo Finance API to Finnhub API for real-time stock market data.

## Overview

The application has been updated to use [Finnhub.io](https://finnhub.io/) as the primary data source for:
- Real-time stock quotes
- Historical chart data
- Company profiles
- Financial metrics
- Company news
- Market news

## Environment Setup

### Required Environment Variable

Add the following to your `.env.local` file:

```bash
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key_here
```

### Getting a Finnhub API Key

1. Visit [https://finnhub.io/](https://finnhub.io/)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key
5. Add it to your environment variables

## API Endpoints Used

### Stock Quote
- **Endpoint**: `/quote`
- **Usage**: Real-time stock prices, daily high/low, change data
- **Rate Limit**: 60 calls/minute (free tier)

### Stock Candles
- **Endpoint**: `/stock/candle`
- **Usage**: Historical price data for charts
- **Resolutions**: 1, 5, 15, 30, 60 minutes, D, W, M

### Company Profile
- **Endpoint**: `/stock/profile2`
- **Usage**: Company information, market cap, industry, etc.

### Basic Financials
- **Endpoint**: `/stock/metric`
- **Usage**: Financial ratios, P/E, market cap, etc.

### Company News
- **Endpoint**: `/company-news`
- **Usage**: Recent news articles for specific companies

### Market News
- **Endpoint**: `/news`
- **Usage**: General market news

## Key Changes

### File Structure
```
frontend/lib/finnhub/
├── config.ts              # API configuration
├── constants.ts           # Default values and mappings
├── fetchQuote.ts          # Stock quotes
├── fetchChartData.ts      # Historical data
├── fetchCompanyProfile.ts # Company information
├── fetchBasicFinancials.ts # Financial metrics
└── fetchNews.ts           # News data
```

### Data Mapping

#### Yahoo Finance → Finnhub
- `regularMarketPrice` → `c` (current price)
- `regularMarketChange` → `d` (change)
- `regularMarketChangePercent` → `dp` (change percent)
- `dayHigh` → `h` (high)
- `dayLow` → `l` (low)
- `open` → `o` (open)
- `previousClose` → `pc` (previous close)

#### Time Ranges
- `1d` → 5-minute resolution
- `1w` → 1-hour resolution
- `1m` → Daily resolution
- `3m` → Daily resolution
- `1y` → Weekly resolution

## Components Updated

### 1. StockChart (`/components/chart/StockChart.tsx`)
- Removed interval parameter
- Updated to use Finnhub quote and profile data
- Simplified price change calculation

### 2. MarketsChart (`/components/chart/MarketsChart.tsx`)
- Similar updates to StockChart
- Removed interval dependency

### 3. FinanceSummary (`/app/stocks/[ticker]/components/FinanceSummary.tsx`)
- Updated to use Finnhub basic financials
- Mapped financial metrics to Finnhub field names

### 4. News (`/app/stocks/[ticker]/components/News.tsx`)
- Updated to use Finnhub company news
- Changed data structure for articles

### 5. CompanySummaryCard (`/app/stocks/[ticker]/components/CompanySummaryCard.tsx`)
- Updated to use Finnhub company profile
- Generated business summary from available data

### 6. Dashboard (`/app/dashboard/page.tsx`)
- Updated market data fetching
- Simplified ticker structure
- Updated news integration

## Rate Limits & Caching

### Free Tier Limits
- 60 API calls per minute
- 30 calls per second

### Caching Strategy
- **Quotes**: 1 minute cache
- **Chart Data**: 5 minutes cache
- **Company Profile**: 1 hour cache
- **Financial Data**: 1 hour cache
- **News**: 30 minutes cache

## Testing

Visit `/test-finnhub` to verify the API integration is working correctly. This page will show:
- Real-time quote data
- Company profile information
- Chart data availability
- Recent news articles

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify the key is correctly set in `.env.local`
   - Ensure the key is active on Finnhub dashboard
   - Check if you've exceeded rate limits

2. **No Data Returned**
   - Some symbols may not be available on Finnhub
   - Try with major stocks like AAPL, MSFT, GOOGL
   - Check the browser console for error messages

3. **Rate Limit Exceeded**
   - Reduce the frequency of API calls
   - Implement longer caching periods
   - Consider upgrading to a paid plan

### Error Handling

All API functions include proper error handling:
- Network errors are caught and logged
- Invalid responses are handled gracefully
- Fallback values are provided where appropriate

## Benefits of Finnhub

1. **Real-time Data**: More up-to-date than Yahoo Finance
2. **Reliable API**: Better uptime and consistency
3. **Comprehensive Data**: Rich financial metrics and company information
4. **Professional Service**: Dedicated financial data provider
5. **Better Documentation**: Clear API documentation and examples

## Migration Checklist

- [x] Set up Finnhub API key
- [x] Create Finnhub API utilities
- [x] Update all components to use Finnhub
- [x] Remove Yahoo Finance dependencies
- [x] Test all functionality
- [x] Update documentation
- [x] Verify rate limits and caching

## Next Steps

1. Test the application thoroughly with your Finnhub API key
2. Monitor API usage to ensure you stay within rate limits
3. Consider upgrading to a paid plan for higher limits if needed
4. Implement additional error handling as needed
5. Add more financial metrics available through Finnhub API 