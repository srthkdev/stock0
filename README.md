# Stock0

A comprehensive stock market platform with AI-powered portfolio management, real-time market data, and intelligent stock analysis. Built with Next.js frontend and Python FastAPI backend.

## 🚀 Features

### Frontend (Next.js)
- 🔐 **Google Authentication** - Secure OAuth login with Appwrite
- 📊 **Real-time Market Data** - Live stock prices and market indices
- 📈 **Interactive Charts** - Market visualization with Visx/D3.js
- 🔍 **Advanced Stock Screener** - Filter stocks by multiple criteria
- 💼 **AI Portfolio Management** - Smart portfolio creation and chat interface
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🌙 **Dark Mode** - Complete theme switching support

### Backend (Python FastAPI)
- 🤖 **AI Stock Picker** - LangGraph-powered intelligent stock selection
- 💬 **Portfolio Chat** - AI assistant for portfolio analysis and advice
- 📰 **Financial News** - Categorized daily, weekly, and monthly news summaries
- 🧠 **Memory Integration** - Persistent user preferences with Mem0
- 🔗 **RESTful API** - Complete backend API for all features
- ⚡ **Real-time Processing** - Fast async operations

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI components
- **Visx/D3.js** - Data visualization
- **Zustand** - State management
- **Appwrite** - Authentication and database

### Backend
- **FastAPI** - Modern Python web framework
- **LangGraph** - AI workflow orchestration
- **OpenAI** - Large language models
- **Mem0** - AI memory and personalization
- **Tavily** - Real-time news aggregation
- **Finnhub** - Financial market data
- **Appwrite** - Database and user management

## 📁 Project Structure

```
Stock0/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App Router pages
│   │   ├── (landing)/       # Landing page
│   │   ├── dashboard/       # Market dashboard
│   │   ├── screener/        # Stock screener
│   │   ├── portfolio/       # AI portfolio management
│   │   └── stocks/          # Individual stock pages
│   ├── components/          # Reusable UI components
│   │   ├── ai/             # AI chat components
│   │   ├── chart/          # Chart components
│   │   ├── stocks/         # Stock-specific components
│   │   └── ui/             # Base UI components
│   └── lib/                # Utilities and API clients
├── backend/                 # Python FastAPI backend
│   ├── graph/              # LangGraph workflows
│   ├── models/             # Pydantic data models
│   ├── services/           # Business logic services
│   └── app.py              # Main FastAPI application
└── setup.sh               # Quick setup script
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Python 3.8+
- Appwrite account
- OpenAI API key
- Finnhub API key (optional)
- Tavily API key (optional)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd Stock0
chmod +x setup.sh
./setup.sh
```

### 2. Environment Configuration

#### Frontend (.env.local)
```bash
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_STORAGE_ID=your_storage_id
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your_users_collection_id
APPWRITE_API_KEY=your_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Backend (.env)
```bash
# API Keys
OPENAI_API_KEY=your_openai_key
FINNHUB_API_KEY=your_finnhub_key
TAVILY_API_KEY=your_tavily_key
MEM0_API_KEY=your_mem0_key

# Appwrite
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_PORTFOLIOS_COLLECTION_ID=your_portfolios_collection_id
```

### 3. Development

#### Start Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py --server
```

#### Start Frontend
```bash
cd frontend
bun install
bun dev
```

Visit `http://localhost:3000` for the frontend and `http://localhost:8000` for the API.

## 📚 API Documentation

### Stock Analysis Endpoints
- `POST /api/stock-pick` - AI-powered stock recommendations
- `POST /api/portfolio/create` - Create auto-managed portfolio
- `POST /api/portfolio/chat` - Chat with portfolio AI
- `GET /api/portfolio/{user_id}` - Get user portfolios

### News Endpoints
- `GET /api/news/day` - Today's financial news
- `GET /api/news/week` - Weekly financial news
- `GET /api/news/month` - Monthly financial news
- `GET /api/news/all` - All periods combined

### Utility Endpoints
- `GET /health` - API health check
- `POST /api/article/full` - Full article content

## 🔧 Configuration

### Appwrite Setup
1. Create project at [Appwrite Console](https://cloud.appwrite.io)
2. Configure Google OAuth provider
3. Create database and collections
4. Set up API keys and permissions

### Google OAuth Setup
1. Create project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Configure authorized origins and redirect URIs

## 🤖 AI Features

### Smart Portfolio Creation
- Analyzes user preferences and risk tolerance
- Automatically selects diversified stock portfolio
- Provides detailed reasoning for each selection
- Continuous optimization based on market conditions

### Portfolio Chat Assistant
- Natural language portfolio analysis
- Investment advice and recommendations
- Performance insights and explanations
- Personalized suggestions based on user history

### Financial News Intelligence
- Categorized news summaries (Stocks, Economy, Crypto, etc.)
- Multi-timeframe analysis (daily, weekly, monthly)
- Smart content filtering and relevance scoring

## 📊 Market Data

### Real-time Data Sources
- **Yahoo Finance** - Stock prices and market data
- **Finnhub** - Professional financial data (optional)
- **Tavily** - Real-time news aggregation

### Supported Features
- Live stock quotes and charts
- Market indices and sector performance
- Company financials and ratios
- News and sentiment analysis

## 🔒 Security

- OAuth 2.0 authentication via Appwrite
- Server-side API key management
- Protected routes with middleware
- Secure data transmission (HTTPS)
- Environment variable configuration

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
bun run build
# Deploy to Vercel
```

### Backend (Railway/Render)
```bash
cd backend
# Configure production environment variables
# Deploy to your preferred platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@stock0.com
- 🐛 Issues: [GitHub Issues](https://github.com/srthkdev/Stock0/issues)
- 📖 Documentation: [Wiki](https://github.com/srthkdev/Stock0/wiki)

---

**Stock0** - Intelligent Stock Market Analysis Platform
