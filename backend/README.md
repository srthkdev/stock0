# Stock0 Backend

A powerful Python FastAPI backend providing AI-powered stock analysis, portfolio management, and financial news aggregation.

## 🚀 Features

- 🤖 **AI Stock Picker** - LangGraph-orchestrated intelligent stock selection
- 💼 **Portfolio Management** - Auto-portfolio creation and AI chat interface
- 📰 **Financial News** - Categorized news summaries with Tavily integration
- 🧠 **Memory System** - Persistent user preferences with Mem0
- ⚡ **Async Processing** - High-performance async operations
- 📊 **Market Data** - Real-time stock data via Finnhub
- 🔗 **RESTful API** - Complete REST API with OpenAPI documentation

## 🛠️ Tech Stack

- **FastAPI** - Modern Python web framework
- **LangGraph** - AI workflow orchestration
- **OpenAI** - Large language models (GPT-4)
- **Mem0** - AI memory and personalization
- **Tavily** - Real-time news aggregation
- **Finnhub** - Financial market data API
- **Appwrite** - Database and user management
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server

## 📁 Project Structure

```
backend/
├── app.py                   # Main FastAPI application
├── requirements.txt         # Python dependencies
├── env.example             # Environment variables template
├── graph/                  # LangGraph workflows
│   └── stock_picker_graph.py
├── models/                 # Pydantic data models
│   ├── request.py          # Request models
│   ├── response.py         # Response models
│   └── portfolio.py        # Portfolio models
└── services/               # Business logic services
    ├── openai_agent.py     # OpenAI integration
    ├── finnhub_client.py   # Market data client
    ├── mem0_client.py      # Memory system client
    ├── appwrite_client.py  # Database client
    ├── picker.py           # Stock picking logic
    └── portfolio_service.py # Portfolio management
```

## 🚀 Quick Start

### 1. Environment Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Variables

Copy and configure environment variables:

```bash
cp env.example .env
```

Required environment variables:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Finnhub API (for market data)
FINNHUB_API_KEY=your_finnhub_api_key

# Tavily API (for news)
TAVILY_API_KEY=your_tavily_api_key

# Mem0 API (for memory)
MEM0_API_KEY=your_mem0_api_key

# Appwrite Configuration
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_PORTFOLIOS_COLLECTION_ID=your_portfolios_collection_id
```

### 3. Run the Application

#### Development Mode
```bash
python app.py --server
```

#### Production Mode
```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

#### Direct News Summary (CLI)
```bash
python app.py
```

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

## 📚 API Documentation

### Core Endpoints

#### Health Check
```http
GET /health
```
Returns API health status and service connectivity.

#### Root Information
```http
GET /
```
Returns API information and available endpoints.

### Stock Analysis

#### Smart Stock Picker
```http
POST /api/stock-pick
Content-Type: application/json

{
  "budget": 10000,
  "risk_level": "moderate",
  "sectors": ["technology", "healthcare"],
  "investment_horizon": "long_term",
  "user_id": "user123"
}
```

Returns AI-generated stock recommendations with detailed analysis.

### Portfolio Management

#### Create Auto Portfolio
```http
POST /api/portfolio/create
Content-Type: application/json

{
  "user_id": "user123",
  "budget": 50000,
  "risk_tolerance": "moderate",
  "investment_goals": ["growth", "income"],
  "sectors": ["technology", "healthcare", "finance"],
  "time_horizon": "long_term"
}
```

#### Chat with Portfolio
```http
POST /api/portfolio/chat
Content-Type: application/json

{
  "user_id": "user123",
  "portfolio_id": "portfolio456",
  "message": "How is my portfolio performing?",
  "conversation_id": "conv789"
}
```

#### Get User Portfolios
```http
GET /api/portfolio/{user_id}
```

### Financial News

#### Daily News
```http
GET /api/news/day
```

#### Weekly News
```http
GET /api/news/week
```

#### Monthly News
```http
GET /api/news/month
```

#### All News Periods
```http
GET /api/news/all
```

#### Full Article Content
```http
POST /api/article/full
Content-Type: application/json

{
  "url": "https://example.com/article"
}
```

## 🤖 AI Components

### LangGraph Stock Picker

The stock picker uses LangGraph to orchestrate a multi-step AI workflow:

1. **Market Analysis** - Analyzes current market conditions
2. **Risk Assessment** - Evaluates user risk profile
3. **Sector Analysis** - Reviews sector performance and trends
4. **Stock Selection** - Selects optimal stocks based on criteria
5. **Portfolio Construction** - Creates balanced portfolio allocation
6. **Reasoning Generation** - Provides detailed explanations

### Memory System

Uses Mem0 for persistent user memory:
- Investment preferences and history
- Risk tolerance and behavior patterns
- Portfolio performance tracking
- Personalized recommendations

### News Intelligence

Categorizes financial news into:
- 📈 **Stocks** - Market and equity news
- 🏦 **Central Bank** - Fed and monetary policy
- 📊 **Earnings** - Company earnings and results
- 🌍 **Economy** - Economic indicators and data
- ⚡ **Commodities** - Oil, gold, and commodity news
- 🔗 **Crypto** - Cryptocurrency and blockchain
- 📰 **General** - Other financial news

## 🔧 Configuration

### OpenAI Setup
1. Get API key from [OpenAI Platform](https://platform.openai.com)
2. Set `OPENAI_API_KEY` in environment variables
3. Configure model preferences in `services/openai_agent.py`

### Finnhub Setup
1. Register at [Finnhub.io](https://finnhub.io)
2. Get free or paid API key
3. Set `FINNHUB_API_KEY` in environment variables

### Tavily Setup
1. Sign up at [Tavily](https://tavily.com)
2. Get API key for news aggregation
3. Set `TAVILY_API_KEY` in environment variables

### Mem0 Setup
1. Register at [Mem0](https://mem0.ai)
2. Get API key for memory services
3. Set `MEM0_API_KEY` in environment variables

### Appwrite Setup
1. Create project at [Appwrite Console](https://cloud.appwrite.io)
2. Create database and collections
3. Configure API keys and permissions
4. Set Appwrite variables in environment

## 🧪 Testing

### Run Tests
```bash
python -m pytest test_portfolio.py -v
```

### Manual Testing
```bash
# Test portfolio creation
python test_portfolio.py
```

### API Testing
Use the interactive docs at `http://localhost:8000/docs` or tools like:
- Postman
- curl
- HTTPie

## 📊 Data Models

### Stock Pick Request
```python
class StockPickRequest(BaseModel):
    budget: float
    risk_level: str  # "conservative", "moderate", "aggressive"
    sectors: List[str]
    investment_horizon: str  # "short_term", "medium_term", "long_term"
    user_id: str
```

### Portfolio Models
```python
class Portfolio(BaseModel):
    id: str
    user_id: str
    name: str
    total_value: float
    stocks: List[StockHolding]
    created_at: datetime
    updated_at: datetime
```

### Chat Models
```python
class ChatRequest(BaseModel):
    user_id: str
    portfolio_id: str
    message: str
    conversation_id: Optional[str]

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    timestamp: datetime
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build image
docker build -t stock0-backend .

# Run container
docker run -p 8000:8000 --env-file .env stock0-backend
```

### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### Render Deployment
1. Connect GitHub repository
2. Set environment variables
3. Deploy with `uvicorn app:app --host 0.0.0.0 --port $PORT`

## 🔒 Security

- Environment variable configuration
- API key validation
- Rate limiting (configurable)
- CORS middleware
- Input validation with Pydantic
- Secure database connections

## 📈 Performance

- Async/await for concurrent operations
- Connection pooling for databases
- Caching for frequently accessed data
- Optimized LangGraph workflows
- Efficient memory management

## 🐛 Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify all API keys are correctly set
   - Check key permissions and quotas

2. **Database Connection Issues**
   - Verify Appwrite configuration
   - Check network connectivity

3. **Memory Errors**
   - Ensure Mem0 API key is valid
   - Check memory service status

4. **News Fetching Issues**
   - Verify Tavily API key
   - Check rate limits

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
python app.py --server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

### Development Guidelines
- Follow PEP 8 style guidelines
- Add type hints to all functions
- Write comprehensive docstrings
- Include unit tests for new features
- Update API documentation

## 📄 License

This project is licensed under the MIT License.

---

**Stock0 Backend** - Intelligent Financial API Platform 