import os
import requests
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()


class FinnhubClient:
    """Client for interacting with Finnhub API to fetch stock data."""
    
    def __init__(self):
        self.api_key = os.getenv("FINNHUB_API_KEY")
        self.base_url = "https://finnhub.io/api/v1"
        
        if not self.api_key or self.api_key == "your_finnhub_api_key_here":
            print("⚠️ No valid Finnhub API key found - using mock data")
            self.api_key = None
    
    def _make_request(self, endpoint: str, params: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
        """Make a request to Finnhub API."""
        if not self.api_key:
            return None
            
        url = f"{self.base_url}/{endpoint}"
        params = params or {}
        params["token"] = self.api_key
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"❌ Finnhub API error: {str(e)}")
            return None
    
    def get_sector_stocks(self, sector: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top stocks for a specific sector."""
        
        # Sector mapping to common tickers
        sector_tickers = {
            "technology": ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "ADBE", "CRM", "ORCL"],
            "healthcare": ["JNJ", "UNH", "PFE", "ABT", "TMO", "DHR", "BMY", "AMGN", "GILD", "CVS"],
            "finance": ["JPM", "BAC", "WFC", "C", "GS", "MS", "USB", "PNC", "TFC", "COF"],
            "consumer": ["PG", "KO", "PEP", "WMT", "HD", "MCD", "NKE", "SBUX", "TGT", "LOW"],
            "energy": ["XOM", "CVX", "COP", "EOG", "SLB", "MPC", "VLO", "PSX", "KMI", "OKE"],
            "utilities": ["NEE", "SO", "DUK", "D", "AEP", "EXC", "XEL", "SRE", "PEG", "PCG"],
            "materials": ["LIN", "APD", "SHW", "FCX", "NEM", "DOW", "DD", "PPG", "IFF", "ALB"],
            "industrials": ["BA", "CAT", "GE", "HON", "UPS", "RTX", "LMT", "MMM", "FDX", "DE"],
            "telecommunications": ["VZ", "T", "TMUS", "CMCSA", "DIS", "NFLX", "CHTR", "VZ", "S", "DISH"],
            "real_estate": ["AMT", "PLD", "CCI", "EQIX", "PSA", "WELL", "SPG", "O", "VICI", "EXR"]
        }
        
        tickers = sector_tickers.get(sector, [])[:limit]
        stocks = []
        
        for ticker in tickers:
            stock_data = self.get_stock_quote(ticker)
            if stock_data:
                # Get company profile for more details
                profile = self.get_company_profile(ticker)
                
                stocks.append({
                    "ticker": ticker,
                    "name": profile.get("name", ticker) if profile else ticker,
                    "sector": sector.title(),
                    "price": stock_data.get("c", 0),  # current price
                    "change": stock_data.get("d", 0),  # change
                    "change_percent": stock_data.get("dp", 0),  # change percent
                    "beta": self._get_mock_beta(ticker),  # Mock beta for risk calculation
                    "market_cap": profile.get("marketCapitalization", 0) if profile else 0
                })
        
        return stocks
    
    def get_stock_quote(self, ticker: str) -> Optional[Dict[str, Any]]:
        """Get current quote for a stock."""
        if self.api_key:
            return self._make_request(f"quote", {"symbol": ticker})
        else:
            # Mock data when no API key
            return self._get_mock_quote(ticker)
    
    def get_company_profile(self, ticker: str) -> Optional[Dict[str, Any]]:
        """Get company profile information."""
        if self.api_key:
            return self._make_request(f"stock/profile2", {"symbol": ticker})
        else:
            # Mock data when no API key
            return self._get_mock_profile(ticker)
    
    def _get_mock_quote(self, ticker: str) -> Dict[str, Any]:
        """Generate mock quote data for testing."""
        import random
        base_prices = {
            "AAPL": 192.50, "MSFT": 415.30, "GOOGL": 140.20, "AMZN": 155.80, "NVDA": 875.30,
            "JNJ": 158.90, "UNH": 520.40, "PFE": 28.50, "JPM": 185.60, "BAC": 38.90,
            "PG": 165.70, "KO": 60.20, "XOM": 118.30, "NEE": 75.40, "LIN": 442.10
        }
        
        base_price = base_prices.get(ticker, random.uniform(50, 200))
        change = random.uniform(-5, 5)
        
        return {
            "c": round(base_price, 2),  # current price
            "d": round(change, 2),  # change
            "dp": round((change / base_price) * 100, 2),  # change percent
            "h": round(base_price * 1.02, 2),  # high
            "l": round(base_price * 0.98, 2),  # low
            "o": round(base_price * 0.995, 2),  # open
            "pc": round(base_price - change, 2)  # previous close
        }
    
    def _get_mock_profile(self, ticker: str) -> Dict[str, Any]:
        """Generate mock company profile for testing."""
        companies = {
            "AAPL": {"name": "Apple Inc.", "marketCapitalization": 3000000},
            "MSFT": {"name": "Microsoft Corporation", "marketCapitalization": 2800000},
            "GOOGL": {"name": "Alphabet Inc.", "marketCapitalization": 1800000},
            "AMZN": {"name": "Amazon.com Inc.", "marketCapitalization": 1600000},
            "NVDA": {"name": "NVIDIA Corporation", "marketCapitalization": 2200000},
            "JNJ": {"name": "Johnson & Johnson", "marketCapitalization": 450000},
            "UNH": {"name": "UnitedHealth Group Inc.", "marketCapitalization": 500000},
            "JPM": {"name": "JPMorgan Chase & Co.", "marketCapitalization": 550000},
            "PG": {"name": "The Procter & Gamble Company", "marketCapitalization": 400000},
            "XOM": {"name": "Exxon Mobil Corporation", "marketCapitalization": 480000}
        }
        
        return companies.get(ticker, {"name": f"{ticker} Corp.", "marketCapitalization": 100000})
    
    def _get_mock_beta(self, ticker: str) -> float:
        """Generate mock beta values for risk assessment."""
        import random
        # Tech stocks typically have higher beta
        if ticker in ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA"]:
            return round(random.uniform(1.1, 1.8), 2)
        # Utilities and consumer staples have lower beta
        elif ticker in ["NEE", "PG", "KO", "JNJ"]:
            return round(random.uniform(0.3, 0.9), 2)
        # Others in between
        else:
            return round(random.uniform(0.8, 1.3), 2) 