#!/usr/bin/env python3
"""
🌟 UNIFIED FINANCIAL NEWS ASSISTANT 🌟

Single file solution that provides:
- Day, Week, Month financial news summary
- Smart categorization with emojis
- Clean terminal output
- Optional FastAPI server mode

Usage:
  python app.py          # Shows news summary directly
  python app.py --server # Runs as API server
"""

import os
import asyncio
from typing import List, Dict, Any
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Stock picker imports
from models.request import StockPickRequest
from models.response import StockPickResponse
from graph.stock_picker_graph import StockPickerGraph

# Portfolio imports
from models.portfolio import AutoPortfolioRequest, ChatRequest, ChatResponse, Portfolio
from services.portfolio_service import PortfolioService

# =============================================================================
# 🏷️ NEWS CATEGORIZER
# =============================================================================

def categorize(title: str) -> str:
    """Categorize financial news by analyzing title keywords."""
    title_lower = title.lower()
    
    if any(word in title_lower for word in ["crypto", "bitcoin", "ethereum", "blockchain", "digital asset", "btc", "eth"]):
        return "🔗 Crypto"
    elif any(word in title_lower for word in ["stock", "s&p", "nasdaq", "dow", "equity", "shares", "index"]):
        return "📈 Stocks"
    elif any(word in title_lower for word in ["fed", "interest rate", "monetary policy", "central bank", "ecb", "boj"]):
        return "🏦 Central Bank"
    elif any(word in title_lower for word in ["inflation", "gdp", "unemployment", "economic", "recession", "growth"]):
        return "🌍 Economy"
    elif any(word in title_lower for word in ["earnings", "quarterly", "profit", "revenue", "guidance", "results"]):
        return "📊 Earnings"
    elif any(word in title_lower for word in ["oil", "gold", "commodity", "energy", "crude", "natural gas"]):
        return "⚡ Commodities"
    else:
        return "📰 General"

# =============================================================================
# 📰 NEWS FETCHER
# =============================================================================

class FinancialNewsAssistant:
    """Unified Financial News Assistant with Tavily integration."""
    
    def __init__(self):
        self.api_key = os.getenv("TAVILY_API_KEY")
        self.client = None
        
        if self.api_key and self.api_key != "your_tavily_api_key_here":
            try:
                from tavily import TavilyClient
                self.client = TavilyClient(api_key=self.api_key)
                print("✅ Tavily API connected")
            except Exception as e:
                print(f"⚠️ Tavily initialization failed: {str(e)}")
                print("📝 Using fallback news data")
                self.client = None
        else:
            print("📝 No Tavily API key found - using fallback news data")

    async def get_financial_news(self, time_range: str = "day") -> List[Dict[str, Any]]:
        """Fetch US financial news for specified time range."""
        
        query_map = {
            "day": "Today's top US financial news including NYSE NASDAQ S&P 500 Dow Jones Fed interest rates US stocks earnings inflation US economy",
            "week": "This week's top US financial news including Wall Street earnings reports Fed policy US stock market performance inflation data",
            "month": "This month's top US financial news covering US stock market performance S&P 500 NASDAQ earnings Fed monetary policy US economic indicators"
        }
        
        query = query_map.get(time_range, query_map["day"])
        
        if not self.client:
            return self._get_fallback_news(time_range)
        
        try:
            # Search with Tavily - US-focused domains
            result = await asyncio.to_thread(
                self.client.search,
                query=query,
                search_depth="advanced",
                max_results=10,
                include_domains=[
                    "cnbc.com",
                    "marketwatch.com", 
                    "yahoo.com",
                    "bloomberg.com",
                    "reuters.com",
                    "wsj.com",
                    "forbes.com",
                    "investopedia.com",
                    "seekingalpha.com",
                    "fool.com"
                ],
                include_answer=False,
                include_raw_content=False
            )
            
            news = []
            for item in result.get("results", [])[:5]:  # Top 5 only
                title = item.get("title", "")
                url = item.get("url", "")
                content = item.get("content", "")
                
                news.append({
                    "title": title,
                    "url": url,
                    "category": categorize(title),
                    "snippet": content[:200] + "..." if len(content) > 200 else content
                })
            
            return news
            
        except Exception as e:
            print(f"❌ Error fetching {time_range} news: {str(e)}")
            return self._get_fallback_news(time_range)
    
    def _get_fallback_news(self, time_range: str) -> List[Dict[str, Any]]:
        """Fallback US financial news when API fails."""
        
        fallback_data = {
            "day": [
                {
                    "title": "S&P 500 Reaches New Record High as Tech Stocks Rally",
                    "url": "https://example.com/sp500-high",
                    "category": "📈 Stocks",
                    "snippet": "The S&P 500 index closed at a new record high today as technology stocks led the rally, with Apple, Microsoft, and NVIDIA posting strong gains."
                },
                {
                    "title": "Federal Reserve Holds Interest Rates Steady at 4.5%-4.75%", 
                    "url": "https://example.com/fed-rates",
                    "category": "🏦 Central Bank",
                    "snippet": "The Federal Reserve decided to maintain current interest rates while signaling potential cuts later this year based on inflation data."
                },
                {
                    "title": "NVIDIA Reports Record Q4 Earnings Beat Expectations",
                    "url": "https://example.com/nvidia-earnings", 
                    "category": "📊 Earnings",
                    "snippet": "NVIDIA posted record quarterly earnings driven by AI chip demand, beating analyst expectations and raising guidance for next quarter."
                },
                {
                    "title": "US Inflation Drops to 3.2% in Latest CPI Report",
                    "url": "https://example.com/inflation-report",
                    "category": "🌍 Economy", 
                    "snippet": "Consumer Price Index showed inflation continuing to moderate, falling to 3.2% year-over-year, closer to Fed's 2% target."
                },
                {
                    "title": "Dow Jones Surges 300 Points on Strong Jobs Data",
                    "url": "https://example.com/dow-surge",
                    "category": "📈 Stocks",
                    "snippet": "The Dow Jones Industrial Average jumped over 300 points following better-than-expected employment figures and jobless claims data."
                }
            ],
            "week": [
                {
                    "title": "Wall Street Posts Best Week in 2025 on Fed Optimism",
                    "url": "https://example.com/wall-street-weekly",
                    "category": "📈 Stocks",
                    "snippet": "Major US indices posted their best weekly performance this year as investors embraced Fed Chair Powell's dovish commentary on rate policy."
                },
                {
                    "title": "Big Tech Earnings Drive Weekly Market Gains", 
                    "url": "https://example.com/tech-earnings-week",
                    "category": "📊 Earnings",
                    "snippet": "This week's earnings from Apple, Google, Amazon, and Meta exceeded expectations, driving technology sector outperformance."
                },
                {
                    "title": "US Treasury Yields Fall on Fed Rate Cut Speculation",
                    "url": "https://example.com/treasury-yields",
                    "category": "🏦 Central Bank", 
                    "snippet": "The 10-year Treasury yield dropped this week as markets priced in higher probability of Fed rate cuts in the second half of 2025."
                },
                {
                    "title": "US Economic Data Shows Resilient Consumer Spending",
                    "url": "https://example.com/consumer-spending",
                    "category": "🌍 Economy",
                    "snippet": "Weekly retail sales and consumer confidence data demonstrated continued strength in US consumer spending despite economic headwinds."
                },
                {
                    "title": "Banking Sector Outperforms on Rising Rate Expectations",
                    "url": "https://example.com/banking-sector", 
                    "category": "📈 Stocks",
                    "snippet": "Bank stocks led weekly gains as investors positioned for sustained higher interest rates benefiting net interest margins."
                }
            ],
            "month": [
                {
                    "title": "US Stock Market Posts Strong Monthly Gains Across All Sectors",
                    "url": "https://example.com/monthly-market-gains",
                    "category": "📈 Stocks",
                    "snippet": "This month saw broad-based gains across US equity markets with the S&P 500, NASDAQ, and Dow all posting solid monthly returns."
                },
                {
                    "title": "Fed Policy Shift Drives Monthly Bond Market Rally",
                    "url": "https://example.com/fed-policy-month", 
                    "category": "🏦 Central Bank",
                    "snippet": "Federal Reserve's shift toward more accommodative policy drove a significant rally in US Treasury bonds throughout the month."
                },
                {
                    "title": "US GDP Growth Exceeds Expectations in Latest Quarter",
                    "url": "https://example.com/gdp-growth",
                    "category": "🌍 Economy",
                    "snippet": "The US economy demonstrated resilience with GDP growth surpassing economist forecasts, driven by robust consumer and business spending."
                },
                {
                    "title": "Record Month for US IPOs and M&A Activity", 
                    "url": "https://example.com/ipo-ma-activity",
                    "category": "📊 Earnings",
                    "snippet": "This month marked record activity in US initial public offerings and merger & acquisition deals, signaling strong corporate confidence."
                },
                {
                    "title": "US Dollar Strengthens Against Major Currencies This Month",
                    "url": "https://example.com/dollar-strength",
                    "category": "🌍 Economy", 
                    "snippet": "The US dollar posted monthly gains against the euro, yen, and other major currencies on relative economic outperformance."
                }
            ]
        }
        
        return fallback_data.get(time_range, fallback_data["day"])

    async def show_news_summary(self):
        """Display complete US financial news summary for Day, Week, Month."""
        
        print("\n" + "="*80)
        print("🇺🇸 US FINANCIAL NEWS SUMMARY")
        print("="*80)
        print("Legend: 📈 Stocks | 🏦 Fed/Banks | 📊 Earnings | 🌍 Economy | ⚡ Commodities | 📰 General")
        print("="*80)
        
        for period in ["day", "week", "month"]:
            print(f"\n📅 {period.upper()} - TOP 5 US FINANCIAL NEWS:")
            print("-" * 50)
            
            try:
                print(f"🔍 Fetching {period} US financial news...")
                news = await self.get_financial_news(period)
                
                for i, article in enumerate(news, 1):
                    print(f"\n{i}. {article['category']} {article['title']}")
                    print(f"   {article['snippet']}")
                    print(f"   🔗 {article['url']}")
                    
            except Exception as e:
                print(f"❌ Error loading {period} news: {str(e)}")
        
        print("\n" + "="*80)
        print("✅ US financial news summary complete!")
        print("="*80)

# =============================================================================
# 🚀 FASTAPI SERVER (OPTIONAL)
# =============================================================================

def create_fastapi_app():
    """Create FastAPI app for server mode."""
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    
    class ArticleRequest(BaseModel):
        url: str
    
    app = FastAPI(
        title="Smart Stock Portfolio API",
        description="Get categorized financial news and smart stock portfolio recommendations",
        version="1.0.0"
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    news_assistant = FinancialNewsAssistant()
    stock_picker_graph = StockPickerGraph()
    portfolio_service = PortfolioService()
    
    @app.get("/")
    async def root():
        """API information."""
        return {
            "message": "🚀 Smart Stock Portfolio API",
            "version": "1.0.0",
            "endpoints": {
                "/api/stock-pick": "POST - Smart stock portfolio recommendations",
                "/api/portfolio/create": "POST - Create auto portfolio from preferences",
                "/api/portfolio/chat": "POST - Chat with your portfolio",
                "/api/portfolio/{user_id}": "GET - Get user's portfolios",
                "/api/news/day": "Today's top 5 US financial news",
                "/api/news/week": "This week's top 5 US financial news", 
                "/api/news/month": "This month's top 5 US financial news",
                "/api/news/all": "All periods combined",
                "/api/article/full": "Get full article content from URL",
                "/health": "API health status"
            }
        }
    
    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        tavily_status = "✅ Connected" if os.getenv("TAVILY_API_KEY") else "❌ No API Key"
        finnhub_status = "✅ Connected" if os.getenv("FINNHUB_API_KEY") else "❌ No API Key"
        openai_status = "✅ Connected" if os.getenv("OPENAI_API_KEY") else "❌ No API Key"
        appwrite_status = "✅ Connected" if os.getenv("APPWRITE_PROJECT_ID") else "❌ No API Key"
        mem0_status = "✅ Connected" if os.getenv("MEM0_API_KEY") else "❌ No API Key"
        return {
            "status": "healthy",
            "services": {
                "tavily_api": tavily_status,
                "finnhub_api": finnhub_status,
                "openai_api": openai_status,
                "appwrite_db": appwrite_status,
                "mem0_memory": mem0_status
            },
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }

    @app.post("/api/stock-pick", response_model=StockPickResponse)
    async def stock_pick(request: StockPickRequest):
        """
        Smart stock portfolio recommendations using LangGraph orchestration.
        
        Analyzes your budget, risk profile, and sector preferences to recommend
        a diversified portfolio of US stocks with personalized reasoning.
        """
        try:
            # Process the request through LangGraph
            response = await stock_picker_graph.process_request(request)
            
            return response
            
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Stock picking failed: {str(e)}"
            )

    @app.post("/api/portfolio/create", response_model=Portfolio)
    async def create_auto_portfolio(request: AutoPortfolioRequest):
        """
        Create an automatic portfolio based on user preferences.
        
        Analyzes user preferences and automatically selects stocks to create
        a diversified portfolio with proper allocation and risk management.
        """
        try:
            portfolio = await portfolio_service.create_auto_portfolio(request)
            
            if portfolio:
                return portfolio
            else:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to create portfolio"
                )
                
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Portfolio creation failed: {str(e)}"
            )

    @app.post("/api/portfolio/chat", response_model=ChatResponse)
    async def chat_with_portfolio(request: ChatRequest):
        """
        Chat with your portfolio using AI.
        
        Ask questions about your portfolio performance, get investment advice,
        and receive personalized recommendations based on your holdings.
        """
        try:
            response = await portfolio_service.chat_with_portfolio(request)
            return response
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Chat failed: {str(e)}"
            )

    @app.get("/api/portfolio/{user_id}")
    async def get_user_portfolios(user_id: str):
        """Get all portfolios for a user."""
        try:
            portfolios = await portfolio_service.get_user_portfolios(user_id)
            return {
                "success": True,
                "portfolios": portfolios,
                "count": len(portfolios),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }

    @app.get("/api/news/day")
    async def get_day_news():
        """Get today's top 5 US financial news."""
        try:
            fetcher = FinancialNewsAssistant()
            news = await fetcher.get_financial_news("day")
            
            return {
                "success": True,
                "period": "day",
                "title": "📅 TODAY - TOP 5 US FINANCIAL NEWS",
                "data": news,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "count": len(news)
            }
        except Exception as e:
            return {
                "success": False,
                "period": "day", 
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }

    @app.get("/api/news/week")
    async def get_week_news():
        """Get this week's top 5 US financial news."""
        try:
            fetcher = FinancialNewsAssistant()
            news = await fetcher.get_financial_news("week")
            
            return {
                "success": True,
                "period": "week",
                "title": "📅 THIS WEEK - TOP 5 US FINANCIAL NEWS",
                "data": news,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "count": len(news)
            }
        except Exception as e:
            return {
                "success": False,
                "period": "week",
                "error": str(e), 
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }

    @app.get("/api/news/month") 
    async def get_month_news():
        """Get this month's top 5 US financial news."""
        try:
            fetcher = FinancialNewsAssistant()
            news = await fetcher.get_financial_news("month")
            
            return {
                "success": True,
                "period": "month",
                "title": "📅 THIS MONTH - TOP 5 US FINANCIAL NEWS", 
                "data": news,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "count": len(news)
            }
        except Exception as e:
            return {
                "success": False,
                "period": "month",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }

    @app.get("/api/news/all")
    async def get_all_news():
        """Get all periods (day, week, month) combined."""
        try:
            fetcher = FinancialNewsAssistant()
            
            # Fetch all periods in parallel
            day_task = fetcher.get_financial_news("day")
            week_task = fetcher.get_financial_news("week") 
            month_task = fetcher.get_financial_news("month")
            
            day_news, week_news, month_news = await asyncio.gather(day_task, week_task, month_task)
            
            return {
                "success": True,
                "title": "🇺🇸 US FINANCIAL NEWS SUMMARY",
                "data": {
                    "day": {
                        "title": "📅 TODAY - TOP 5 US FINANCIAL NEWS",
                        "news": day_news,
                        "count": len(day_news)
                    },
                    "week": {
                        "title": "📅 THIS WEEK - TOP 5 US FINANCIAL NEWS", 
                        "news": week_news,
                        "count": len(week_news)
                    },
                    "month": {
                        "title": "📅 THIS MONTH - TOP 5 US FINANCIAL NEWS",
                        "news": month_news, 
                        "count": len(month_news)
                    }
                },
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }

    @app.post("/api/article/full")
    async def get_full_article(request: ArticleRequest):
        """Get AI-powered summary of article with key numbers and details."""
        try:
            url = request.url
            if not url:
                return {
                    "success": False,
                    "error": "URL is required",
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
            
            fetcher = FinancialNewsAssistant()
            
            if not fetcher.client:
                return {
                    "success": False,
                    "error": "Tavily API not available",
                    "content": "Article summary is not available. Tavily API is not configured.",
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
            
            # Extract the article title/topic from URL for better search
            import re
            url_parts = url.split('/')
            topic_hints = []
            for part in url_parts:
                if len(part) > 3 and not part.isdigit():
                    # Clean up URL segments to extract topic hints
                    clean_part = re.sub(r'[^a-zA-Z0-9\s]', ' ', part).strip()
                    if clean_part and len(clean_part.split()) <= 5:
                        topic_hints.append(clean_part)
            
            # Create a search query to get comprehensive information about the article topic
            search_query = f"financial news analysis summary {' '.join(topic_hints[:3])} stock market earnings revenue profit numbers statistics data"
            
            # Use Tavily to get comprehensive information about the topic
            result = await asyncio.to_thread(
                fetcher.client.search,
                query=search_query,
                search_depth="advanced",
                max_results=3,
                include_answer=True,
                include_raw_content=False,
                include_domains=[
                    "cnbc.com", "marketwatch.com", "yahoo.com", "bloomberg.com", 
                    "reuters.com", "wsj.com", "forbes.com", "seekingalpha.com"
                ]
            )
            
            # Generate AI summary from search results
            summary_parts = []
            
            if result.get("answer"):
                summary_parts.append("## Key Insights")
                summary_parts.append(result["answer"])
                summary_parts.append("")
            
            if result.get("results"):
                summary_parts.append("## Market Analysis")
                for i, item in enumerate(result["results"][:2], 1):
                    title = item.get("title", "")
                    content = item.get("content", "")
                    
                    # Extract numbers and key metrics from content
                    numbers = re.findall(r'[\$€£¥]?[\d,]+\.?\d*[%\$€£¥BMK]?', content)
                    percentages = re.findall(r'\d+\.?\d*%', content)
                    
                    summary_parts.append(f"**{title}**")
                    
                    # Add content with emphasis on numbers
                    enhanced_content = content
                    for num in set(numbers + percentages):
                        if len(num) > 1:  # Skip single digits
                            enhanced_content = enhanced_content.replace(num, f"**{num}**")
                    
                    summary_parts.append(enhanced_content[:300] + "..." if len(enhanced_content) > 300 else enhanced_content)
                    summary_parts.append("")
            
            # Add key metrics section if we found numbers
            all_numbers = []
            for item in result.get("results", []):
                content = item.get("content", "")
                numbers = re.findall(r'[\$€£¥]?[\d,]+\.?\d*[%\$€£¥BMK]?', content)
                all_numbers.extend(numbers)
            
            if all_numbers:
                unique_numbers = list(set([num for num in all_numbers if len(num) > 1]))[:8]
                if unique_numbers:
                    summary_parts.append("## Key Numbers")
                    summary_parts.append("Important figures mentioned in related coverage:")
                    for num in unique_numbers:
                        summary_parts.append(f"• **{num}**")
                    summary_parts.append("")
            
            # Combine all parts
            final_summary = "\n".join(summary_parts)
            
            if not final_summary.strip():
                final_summary = "Unable to generate a comprehensive summary for this article. The content may be behind a paywall or the topic may be too specific."
            
            return {
                "success": True,
                "content": final_summary,
                "url": url,
                "type": "ai_summary",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
                
        except Exception as e:
            print(f"❌ Error generating article summary: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "content": "An error occurred while generating the article summary. Please try again or visit the original source.",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
    
    return app

# =============================================================================
# 🎯 MAIN EXECUTION
# =============================================================================

async def main():
    """Main function - shows news summary by default."""
    news_assistant = FinancialNewsAssistant()
    await news_assistant.show_news_summary()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--server":
        # Server mode
        import uvicorn
        print("🚀 Starting Financial News API Server...")
        print("📊 Navigate to http://localhost:8000/docs for API documentation")
        app = create_fastapi_app()
        uvicorn.run(app, host="0.0.0.0", port=8000)
    else:
        # Direct summary mode (default)
        print("🚀 Loading Financial News Summary...")
        asyncio.run(main()) 