from typing import List, Dict, Any, Tuple
from ..models.request import StockPickRequest
from ..models.response import StockRecommendation
from .finnhub_client import FinnhubClient


class StockPicker:
    """Core logic for picking stocks based on budget, risk, and goals."""
    
    def __init__(self):
        self.finnhub = FinnhubClient()
    
    def pick_stocks(self, request: StockPickRequest) -> Tuple[List[StockRecommendation], float, float]:
        """
        Main method to pick stocks based on request parameters.
        Returns: (recommendations, total_allocated, remaining_cash)
        """
        
        # Step 1: Fetch stocks for each sector
        all_stocks = []
        for sector in request.sectors:
            sector_stocks = self.finnhub.get_sector_stocks(sector, limit=5)
            all_stocks.extend(sector_stocks)
        
        # Step 2: Filter by risk profile
        filtered_stocks = self._filter_by_risk(all_stocks, request.risk_profile)
        
        # Step 3: Sort by various criteria (market cap, price stability, etc.)
        sorted_stocks = self._sort_stocks(filtered_stocks, request.risk_profile)
        
        # Step 4: Allocate budget across selected stocks
        recommendations = self._allocate_budget(sorted_stocks, request.budget, request.sectors)
        
        # Step 5: Calculate totals
        total_allocated = sum(rec.price * rec.quantity for rec in recommendations)
        remaining_cash = request.budget - total_allocated
        
        return recommendations, total_allocated, remaining_cash
    
    def _filter_by_risk(self, stocks: List[Dict[str, Any]], risk_profile: str) -> List[Dict[str, Any]]:
        """Filter stocks based on risk profile using beta values."""
        
        if risk_profile == "low":
            # Beta < 1.0 for low risk
            return [stock for stock in stocks if stock.get("beta", 1.0) < 1.0]
        elif risk_profile == "moderate":
            # Beta between 0.8 and 1.3 for moderate risk
            return [stock for stock in stocks if 0.8 <= stock.get("beta", 1.0) <= 1.3]
        else:  # high risk
            # Beta > 1.0 for high risk, or keep all stocks
            return stocks
    
    def _sort_stocks(self, stocks: List[Dict[str, Any]], risk_profile: str) -> List[Dict[str, Any]]:
        """Sort stocks based on risk profile preferences."""
        
        if risk_profile == "low":
            # Prefer larger market cap and lower volatility
            return sorted(stocks, key=lambda x: (-x.get("market_cap", 0), x.get("beta", 1.0)))
        elif risk_profile == "moderate":
            # Balance between market cap and growth potential
            return sorted(stocks, key=lambda x: (-x.get("market_cap", 0), -abs(x.get("change_percent", 0))))
        else:  # high risk
            # Prefer higher growth potential (higher change_percent)
            return sorted(stocks, key=lambda x: -x.get("change_percent", 0))
    
    def _allocate_budget(self, stocks: List[Dict[str, Any]], budget: float, sectors: List[str]) -> List[StockRecommendation]:
        """Allocate budget across selected stocks."""
        
        if not stocks:
            return []
        
        recommendations = []
        remaining_budget = budget
        
        # Allocate budget per sector first
        budget_per_sector = budget / len(sectors)
        
        # Group stocks by sector
        stocks_by_sector = {}
        for stock in stocks:
            sector = stock["sector"].lower()
            if sector not in stocks_by_sector:
                stocks_by_sector[sector] = []
            stocks_by_sector[sector].append(stock)
        
        # Allocate within each sector
        for sector in sectors:
            sector_stocks = stocks_by_sector.get(sector, [])
            if not sector_stocks:
                continue
            
            sector_budget = min(budget_per_sector, remaining_budget)
            
            # Select top 2-3 stocks per sector
            selected_stocks = sector_stocks[:min(3, len(sector_stocks))]
            stock_budget = sector_budget / len(selected_stocks)
            
            for stock in selected_stocks:
                if remaining_budget <= 0:
                    break
                
                price = stock["price"]
                if price <= 0:
                    continue
                
                # Calculate quantity (minimum 1 share)
                max_quantity = int(min(stock_budget, remaining_budget) / price)
                quantity = max(1, max_quantity) if max_quantity > 0 else 0
                
                if quantity > 0 and (quantity * price) <= remaining_budget:
                    # Determine risk match
                    risk_match = self._get_risk_match(stock)
                    
                    # Generate justification
                    justification = self._generate_justification(stock, quantity, price)
                    
                    recommendation = StockRecommendation(
                        ticker=stock["ticker"],
                        name=stock["name"],
                        sector=stock["sector"],
                        price=price,
                        quantity=quantity,
                        risk_match=risk_match,
                        justification=justification
                    )
                    
                    recommendations.append(recommendation)
                    remaining_budget -= (quantity * price)
        
        return recommendations
    
    def _get_risk_match(self, stock: Dict[str, Any]) -> str:
        """Determine if stock matches risk profile."""
        beta = stock.get("beta", 1.0)
        
        if beta < 0.8:
            return "✅ Low Risk"
        elif beta <= 1.3:
            return "✅ Moderate Risk"
        else:
            return "⚠️ High Risk"
    
    def _generate_justification(self, stock: Dict[str, Any], quantity: int, price: float) -> str:
        """Generate justification for stock selection."""
        
        beta = stock.get("beta", 1.0)
        change_percent = stock.get("change_percent", 0)
        market_cap = stock.get("market_cap", 0)
        
        justifications = []
        
        # Beta-based reasoning
        if beta < 1.0:
            justifications.append("stable low-volatility stock")
        elif beta > 1.3:
            justifications.append("high-growth potential stock")
        else:
            justifications.append("balanced risk-return profile")
        
        # Market cap reasoning
        if market_cap > 1000000:  # > $1T
            justifications.append("large-cap stability")
        elif market_cap > 100000:  # > $100B
            justifications.append("established market position")
        
        # Performance reasoning
        if change_percent > 2:
            justifications.append("strong recent performance")
        elif change_percent < -2:
            justifications.append("potential value opportunity")
        
        # Investment amount reasoning
        investment = quantity * price
        if investment > 1000:
            justifications.append("significant portfolio allocation")
        
        return f"Selected for {', '.join(justifications[:3])}" 