# 🇺🇸 US Financial News API

A unified Python application that provides real-time US financial and stock market news with smart categorization. Built with FastAPI, Tavily API, and automatic fallback mechanisms.

## 🚀 Features

- **🇺🇸 US Market Focused**: NYSE, NASDAQ, S&P 500, Dow Jones, Federal Reserve news
- **📅 Multiple Time Periods**: Day, Week, Month news with separate API endpoints
- **🏷️ Smart Categorization**: Auto-categorizes news (📈 Stocks, 🏦 Fed/Banks, 📊 Earnings, etc.)
- **🔄 Two Operation Modes**: Direct terminal output OR FastAPI server
- **🛡️ Robust Fallbacks**: Works even without API keys using fallback data
- **⚡ High Performance**: Async operations with parallel news fetching
- **🌐 CORS Enabled**: Ready for frontend integration

## 🏗️ Project Structure

```
backend/
├── app.py              # Single unified application file
├── requirements.txt    # Python dependencies
└── README.md          # This documentation
```

## 🔧 Quick Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration (Optional)

For live news data, create a `.env` file:

```bash
# .env (optional - app works without API keys using fallback data)
TAVILY_API_KEY=your_tavily_api_key_here
```

**Get Tavily API Key**: https://tavily.com/ (Free tier available)

## 🚀 Usage

### Terminal Mode (Default)
Get news summary directly in terminal:

```bash
python app.py
```

**Output:**
```
🇺🇸 US FINANCIAL NEWS SUMMARY
Legend: 📈 Stocks | 🏦 Fed/Banks | 📊 Earnings | 🌍 Economy | ⚡ Commodities

📅 DAY - TOP 5 US FINANCIAL NEWS:
1. 📈 Stocks S&P 500 Reaches New Record High as Tech Stocks Rally
2. 🏦 Central Bank Federal Reserve Holds Interest Rates Steady at 4.5%-4.75%
...
```

### Server Mode
Run as FastAPI server for UI integration:

```bash
python app.py --server
```

Server starts at: **http://localhost:8000**

## 📡 API Endpoints

Perfect for frontend tabs (Day/Week/Month):

### 🏠 Root & Health
- **GET `/`** - API information and available endpoints
- **GET `/health`** - Health check with API key status

### 📅 Individual News Endpoints
- **GET `/api/news/day`** - Today's top 5 US financial news
- **GET `/api/news/week`** - This week's top 5 US financial news  
- **GET `/api/news/month`** - This month's top 5 US financial news
- **GET `/api/news/all`** - All periods combined (day + week + month)

### Response Format

```json
{
  "success": true,
  "period": "day",
  "title": "📅 TODAY - TOP 5 US FINANCIAL NEWS",
  "data": [
    {
      "title": "S&P 500 Reaches New Record High as Tech Stocks Rally",
      "url": "https://reuters.com/...",
      "category": "📈 Stocks",
      "snippet": "The S&P 500 index closed at a new record high today..."
    }
  ],
  "timestamp": "2025-01-27T15:30:00Z",
  "count": 5
}
```

## 🎯 News Categories

Auto-categorized with emoji indicators:

- **📈 Stocks** - NYSE, NASDAQ, S&P 500, individual stock performance
- **🏦 Fed/Banks** - Federal Reserve policy, interest rates, banking sector
- **📊 Earnings** - Corporate earnings reports, guidance, analyst updates
- **🌍 Economy** - GDP, inflation, employment, economic indicators
- **⚡ Commodities** - Oil, gold, agricultural products
- **📰 General** - Other financial news

## 🔍 News Sources

Prioritized US financial sources:
- **CNBC** (primary)
- **MarketWatch** 
- **Yahoo Finance**
- **Bloomberg** (US focus)
- **Reuters** (US business)
- **Wall Street Journal**
- **Forbes**, **Investopedia**, **Seeking Alpha**, **Motley Fool**

## 🛠️ Dependencies

```
fastapi>=0.104.1
uvicorn>=0.24.0
tavily-python>=0.3.3
python-dotenv>=1.0.0
```

## ⚙️ Configuration

### Environment Variables

```bash
# Optional - app works without these using fallback data
TAVILY_API_KEY=your_tavily_api_key_here    # For live news data
```

### Search Queries (US-Focused)

- **Day**: "Today's top US financial news including NYSE NASDAQ S&P 500 Dow Jones Fed interest rates US stocks earnings inflation US economy"
- **Week**: "This week's top US financial news including Wall Street earnings reports Fed policy US stock market performance inflation data"
- **Month**: "This month's top US financial news covering US stock market performance S&P 500 NASDAQ earnings Fed monetary policy US economic indicators"

## 🚨 Error Handling

- **✅ No API Key**: Works with realistic fallback data
- **🔄 API Failures**: Graceful fallback to cached/sample data
- **⚡ Fast Response**: All endpoints respond quickly even during failures
- **📝 Error Logging**: Clear error messages for debugging

## 🌐 Frontend Integration

### Example: React/Vue Tabs

```javascript
// Day Tab
fetch('/api/news/day')
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      displayNews(data.data); // Array of news objects
    }
  });

// Week Tab  
fetch('/api/news/week')
  .then(res => res.json())
  .then(data => displayNews(data.data));

// Month Tab
fetch('/api/news/month')
  .then(res => res.json()) 
  .then(data => displayNews(data.data));
```

### Example: Display News

```javascript
function displayNews(newsArray) {
  newsArray.forEach(article => {
    console.log(`${article.category} ${article.title}`);
    console.log(`Snippet: ${article.snippet}`);
    console.log(`URL: ${article.url}`);
  });
}
```

## 🚀 Deployment

### Local Development
```bash
python app.py --server
# Server: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Production
```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:create_fastapi_app() --bind 0.0.0.0:8000
```

### Docker (Optional)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
EXPOSE 8000
CMD ["python", "app.py", "--server"]
```

## 📊 API Testing

```bash
# Test endpoints
curl http://localhost:8000/api/news/day
curl http://localhost:8000/api/news/week  
curl http://localhost:8000/api/news/month
curl http://localhost:8000/api/news/all

# Health check
curl http://localhost:8000/health

# API docs (browser)
open http://localhost:8000/docs
```

## 🔮 Perfect For

- **📱 Financial News Apps** - Separate tabs for Day/Week/Month
- **📊 Trading Dashboards** - Real-time US market updates
- **🤖 Trading Bots** - Structured news data for analysis
- **📰 News Aggregators** - Categorized financial content
- **📈 Market Research** - US-focused financial insights

## 🎉 Why This Design?

- **🎯 Single File**: No complex architecture, easy to understand
- **🚀 Fast Setup**: Clone and run in seconds
- **🔧 Flexible**: Terminal output OR API server
- **🛡️ Reliable**: Works with or without API keys
- **📱 UI Ready**: Perfect JSON structure for frontend tabs
- **🇺🇸 Focused**: US markets only, no noise from global crypto

---

**Built with**: Python 3.8+, FastAPI, Tavily API, Async Programming

**Live Demo**: `python app.py` → See US financial news instantly! 