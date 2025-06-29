# News API Setup

This document explains how to set up the financial news integration between the frontend and the FastAPI backend.

## Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install fastapi uvicorn python-dotenv tavily-python
   ```

3. **Create a `.env` file in the backend directory:**
   ```bash
   # Optional: Add Tavily API key for real news data
   TAVILY_API_KEY=your_tavily_api_key_here
   ```

4. **Start the FastAPI server:**
   ```bash
   python app.py --server
   ```

   The API will be available at: `http://localhost:8000`

## Frontend Setup

1. **Add environment variable to your `.env.local` file:**
   ```bash
   NEXT_PUBLIC_NEWS_API_URL=http://localhost:8000
   ```

2. **The frontend will automatically connect to the news API**

## API Endpoints

The backend provides the following endpoints:

- `GET /api/news/day` - Today's top 5 financial news
- `GET /api/news/week` - This week's top 5 financial news  
- `GET /api/news/month` - This month's top 5 financial news
- `GET /api/news/all` - All periods combined
- `GET /health` - API health check

## Features

- **Real-time Financial News**: Fetches latest US financial news from Tavily API
- **Smart Categorization**: Automatically categorizes news by type (Stocks, Fed, Earnings, etc.)
- **No Mock Data**: All components show "API Not Available" messages when backend is offline
- **Caching**: Frontend caches news for 5 minutes to improve performance
- **Error Handling**: Clear error messages when APIs are unavailable
- **Multiple Data Sources**: 
  - News: FastAPI backend with Tavily integration
  - Market Data: Yahoo Finance API for gainers/losers/actives
  - Stock Data: Finnhub API for quotes, sectors, and company profiles

## Testing

1. **Check if backend is running:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Test news endpoint:**
   ```bash
   curl http://localhost:8000/api/news/day
   ```

3. **View API documentation:**
   Open `http://localhost:8000/docs` in your browser

## Troubleshooting

- **CORS Issues**: The backend includes CORS middleware for all origins
- **Network Errors**: Frontend falls back to sample data if backend is unreachable
- **API Key**: Tavily API key is optional - the backend works with fallback data
- **Port Conflicts**: Change the port in `app.py` if 8000 is already in use 