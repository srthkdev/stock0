from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime
import asyncio

from models.portfolio import (
    Portfolio, StockHolding, PortfolioPreferences, AutoPortfolioRequest,
    ChatRequest, ChatResponse, PortfolioAnalysis, ChatMessage
)
from models.request import StockPickRequest, Goal
from models.response import StockRecommendation
from .picker import StockPicker
from .openai_agent import OpenAIAgent
from .finnhub_client import FinnhubClient
from .appwrite_client import AppwriteClient
from .mem0_client import Mem0Client


class PortfolioService:
    """Comprehensive portfolio service integrating all components"""
    
    def __init__(self):
        self.stock_picker = StockPicker()
        self.openai_agent = OpenAIAgent()
        self.finnhub = FinnhubClient()
        self.appwrite = AppwriteClient()
        self.mem0 = Mem0Client()
    
    async def create_auto_portfolio(self, request: AutoPortfolioRequest) -> Optional[Portfolio]:
        """Create portfolio automatically from user preferences"""
        try:
            print(f"🚀 Creating auto portfolio for user {request.user_id}")
            
            # Convert preferences to stock pick request
            stock_request = self._preferences_to_stock_request(request.preferences)
            
            # Get stock recommendations
            recommendations, total_allocated, remaining_cash = self.stock_picker.pick_stocks(stock_request)
            
            # Convert recommendations to holdings
            holdings = self._recommendations_to_holdings(recommendations)
            
            # Update current prices
            await self._update_current_prices(holdings)
            
            # Create portfolio object
            portfolio = Portfolio(
                user_id=request.user_id,
                name=request.portfolio_name,
                description=f"Auto-generated portfolio based on {request.preferences.investment_goal} strategy",
                preferences=request.preferences,
                holdings=holdings,
                total_invested=total_allocated,
                cash_remaining=remaining_cash,
                current_value=sum(h.total_value or 0 for h in holdings),
                total_gain_loss=sum(h.gain_loss or 0 for h in holdings),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Calculate gain/loss percentage
            if portfolio.total_invested > 0:
                portfolio.total_gain_loss_percent = (portfolio.total_gain_loss / portfolio.total_invested) * 100
            
            # Save to database
            portfolio_id = await self.appwrite.create_portfolio(portfolio)
            if portfolio_id:
                portfolio.id = portfolio_id
                
                # Add to memory
                await self.mem0.add_portfolio_memory(request.user_id, portfolio)
                
                print(f"✅ Created portfolio {portfolio_id} with {len(holdings)} holdings")
                return portfolio
            else:
                print("❌ Failed to save portfolio to database")
                return None
                
        except Exception as e:
            print(f"❌ Failed to create auto portfolio: {str(e)}")
            return None
    
    async def get_user_portfolios(self, user_id: str) -> List[Portfolio]:
        """Get all portfolios for a user"""
        try:
            portfolios = await self.appwrite.get_user_portfolios(user_id)
            
            # Update current values for all portfolios
            for portfolio in portfolios:
                await self._update_portfolio_values(portfolio)
            
            return portfolios
            
        except Exception as e:
            print(f"❌ Failed to get user portfolios: {str(e)}")
            return []
    
    async def get_portfolio(self, portfolio_id: str) -> Optional[Portfolio]:
        """Get portfolio by ID with updated values"""
        try:
            portfolio = await self.appwrite.get_portfolio(portfolio_id)
            if portfolio:
                await self._update_portfolio_values(portfolio)
            return portfolio
            
        except Exception as e:
            print(f"❌ Failed to get portfolio: {str(e)}")
            return None
    
    async def update_portfolio(self, portfolio_id: str, portfolio: Portfolio) -> bool:
        """Update portfolio in database"""
        try:
            portfolio.updated_at = datetime.utcnow()
            success = await self.appwrite.update_portfolio(portfolio_id, portfolio)
            
            if success:
                # Update memory
                updates = f"Portfolio {portfolio.name} updated with {len(portfolio.holdings)} holdings"
                await self.mem0.update_portfolio_memory(portfolio.user_id, portfolio_id, updates)
            
            return success
            
        except Exception as e:
            print(f"❌ Failed to update portfolio: {str(e)}")
            return False
    
    async def analyze_portfolio(self, portfolio_id: str) -> Optional[PortfolioAnalysis]:
        """Analyze portfolio performance and provide insights"""
        try:
            portfolio = await self.get_portfolio(portfolio_id)
            if not portfolio:
                return None
            
            # Calculate sector allocation
            sector_allocation = {}
            total_value = portfolio.current_value or 0
            
            for holding in portfolio.holdings:
                sector = holding.sector
                value = holding.total_value or 0
                if sector in sector_allocation:
                    sector_allocation[sector] += value
                else:
                    sector_allocation[sector] = value
            
            # Convert to percentages
            if total_value > 0:
                sector_allocation = {k: (v / total_value) * 100 for k, v in sector_allocation.items()}
            
            # Calculate risk metrics
            risk_metrics = self._calculate_risk_metrics(portfolio)
            
            # Generate recommendations
            recommendations = await self._generate_portfolio_recommendations(portfolio)
            
            return PortfolioAnalysis(
                portfolio_id=portfolio_id,
                total_value=total_value,
                total_invested=portfolio.total_invested,
                gain_loss=portfolio.total_gain_loss or 0,
                gain_loss_percent=portfolio.total_gain_loss_percent or 0,
                sector_allocation=sector_allocation,
                risk_metrics=risk_metrics,
                recommendations=recommendations,
                last_updated=datetime.utcnow()
            )
            
        except Exception as e:
            print(f"❌ Failed to analyze portfolio: {str(e)}")
            return None
    
    async def chat_with_portfolio(self, request: ChatRequest) -> ChatResponse:
        """Chat with portfolio using AI and memory"""
        try:
            # Get portfolio context
            portfolio = await self.appwrite.get_portfolio(request.portfolio_id)
            if not portfolio:
                return ChatResponse(
                    message="Portfolio not found. Please check the portfolio ID.",
                    suggestions=["View my portfolios", "Create new portfolio"]
                )
            
            # Update portfolio values
            await self._update_portfolio_values(portfolio)
            
            # Get portfolio analysis for context
            analysis = await self.analyze_portfolio(request.portfolio_id)
            
            # Prepare context for AI agent
            portfolio_context = self._prepare_portfolio_context(portfolio, analysis)
            
            # Get AI response using OpenAI agent
            ai_response = await self.openai_agent.chat_with_portfolio(
                message=request.message,
                portfolio_context=portfolio_context,
                user_id=request.user_id
            )
            
            # Generate contextual suggestions
            suggestions = self._generate_chat_suggestions(request.message, portfolio)
            
            # Save messages
            user_message = ChatMessage(
                portfolio_id=request.portfolio_id,
                user_id=request.user_id,
                role="user",
                content=request.message,
                timestamp=datetime.utcnow()
            )
            await self.appwrite.save_chat_message(user_message)
            
            ai_message = ChatMessage(
                portfolio_id=request.portfolio_id,
                user_id=request.user_id,
                role="assistant",
                content=ai_response,
                timestamp=datetime.utcnow()
            )
            await self.appwrite.save_chat_message(ai_message)
            
            # Add memory to Mem0
            await self.mem0.add_chat_memory(
                user_id=request.user_id,
                portfolio_id=request.portfolio_id,
                message=request.message,
                response=ai_response
            )
            
            return ChatResponse(
                message=ai_response,
                suggestions=suggestions,
                portfolio_analysis=analysis
            )
            
        except Exception as e:
            print(f"❌ Failed to process chat: {str(e)}")
            return ChatResponse(
                message="I'm sorry, I encountered an error while analyzing your portfolio. Please try again.",
                suggestions=["Try asking about portfolio performance", "Show my holdings", "Get investment recommendations"]
            )
    
    async def get_chat_history(self, portfolio_id: str, limit: int = 50) -> List[ChatMessage]:
        """Get chat history for a portfolio"""
        try:
            return await self.appwrite.get_chat_messages(portfolio_id, limit)
        except Exception as e:
            print(f"❌ Failed to get chat history: {str(e)}")
            return []
    
    # Helper Methods
    def _preferences_to_stock_request(self, preferences: PortfolioPreferences) -> StockPickRequest:
        """Convert portfolio preferences to stock pick request"""
        from models.request import RiskProfile as StockRiskProfile
        
        # Map risk profiles
        risk_mapping = {
            "low": StockRiskProfile.LOW,
            "moderate": StockRiskProfile.MODERATE,
            "high": StockRiskProfile.HIGH
        }
        
        return StockPickRequest(
            budget=preferences.budget,
            sectors=preferences.preferred_sectors,
            risk_profile=risk_mapping.get(preferences.risk_profile, StockRiskProfile.MODERATE),
            goal=Goal(
                target_return=preferences.target_return,
                duration_years=preferences.time_horizon_years
            ),
            note=preferences.notes
        )
    
    def _recommendations_to_holdings(self, recommendations: List[StockRecommendation]) -> List[StockHolding]:
        """Convert stock recommendations to portfolio holdings"""
        holdings = []
        for rec in recommendations:
            holding = StockHolding(
                ticker=rec.ticker,
                name=rec.name,
                sector=rec.sector,
                quantity=rec.quantity,
                average_price=rec.price,
                current_price=rec.price,
                total_value=rec.price * rec.quantity,
                gain_loss=0,
                gain_loss_percent=0,
                justification=rec.justification
            )
            holdings.append(holding)
        return holdings
    
    async def _update_current_prices(self, holdings: List[StockHolding]):
        """Update current prices for all holdings"""
        try:
            for holding in holdings:
                quote = self.finnhub.get_stock_quote(holding.ticker)
                if quote and quote.get("c"):
                    holding.current_price = quote["c"]
                    holding.total_value = holding.current_price * holding.quantity
                    
                    cost_basis = holding.average_price * holding.quantity
                    holding.gain_loss = holding.total_value - cost_basis
                    if cost_basis > 0:
                        holding.gain_loss_percent = (holding.gain_loss / cost_basis) * 100
                        
        except Exception as e:
            print(f"⚠️ Failed to update some prices: {str(e)}")
    
    async def _update_portfolio_values(self, portfolio: Portfolio):
        """Update portfolio current values"""
        try:
            await self._update_current_prices(portfolio.holdings)
            
            # Recalculate portfolio totals
            portfolio.current_value = sum(h.total_value or 0 for h in portfolio.holdings)
            portfolio.total_gain_loss = sum(h.gain_loss or 0 for h in portfolio.holdings)
            
            if portfolio.total_invested > 0:
                portfolio.total_gain_loss_percent = (portfolio.total_gain_loss / portfolio.total_invested) * 100
                
        except Exception as e:
            print(f"⚠️ Failed to update portfolio values: {str(e)}")
    
    def _calculate_risk_metrics(self, portfolio: Portfolio) -> Dict[str, float]:
        """Calculate portfolio risk metrics"""
        try:
            # Simple risk metrics based on sector diversification and volatility
            sectors = list(set(h.sector for h in portfolio.holdings))
            diversification_score = min(len(sectors) / 5, 1.0) * 100  # Max 5 sectors for full diversification
            
            # Risk score based on user's risk profile
            risk_scores = {"low": 30, "moderate": 60, "high": 90}
            risk_score = risk_scores.get(portfolio.preferences.risk_profile, 60)
            
            return {
                "diversification_score": diversification_score,
                "risk_score": risk_score,
                "sector_count": len(sectors),
                "holding_count": len(portfolio.holdings)
            }
            
        except Exception as e:
            print(f"⚠️ Failed to calculate risk metrics: {str(e)}")
            return {}
    
    async def _generate_portfolio_recommendations(self, portfolio: Portfolio) -> List[str]:
        """Generate portfolio recommendations"""
        try:
            recommendations = []
            
            # Check diversification
            sectors = list(set(h.sector for h in portfolio.holdings))
            if len(sectors) < 3:
                recommendations.append("Consider diversifying across more sectors to reduce risk")
            
            # Check performance
            if portfolio.total_gain_loss_percent and portfolio.total_gain_loss_percent < -10:
                recommendations.append("Portfolio is down significantly - consider reviewing underperforming holdings")
            elif portfolio.total_gain_loss_percent and portfolio.total_gain_loss_percent > 20:
                recommendations.append("Strong performance! Consider taking some profits or rebalancing")
            
            # Check cash allocation
            if portfolio.cash_remaining > portfolio.total_invested * 0.1:
                recommendations.append("You have significant cash remaining - consider investing more for better returns")
            
            return recommendations[:3]  # Limit to 3 recommendations
            
        except Exception as e:
            print(f"⚠️ Failed to generate recommendations: {str(e)}")
            return ["Review your portfolio regularly and consider rebalancing"]
    
    def _generate_chat_suggestions(self, message: str, portfolio: Portfolio) -> List[str]:
        """Generate follow-up suggestions"""
        suggestions = [
            "Analyze my portfolio performance",
            "Show me my sector allocation",
            "What are my best performing stocks?",
            "Should I rebalance my portfolio?",
            "How can I reduce risk?"
        ]
        
        # Customize based on message context
        message_lower = message.lower()
        if "performance" in message_lower:
            suggestions = [
                "Show me my worst performing stocks",
                "Compare to market benchmarks",
                "What's driving my returns?",
                "Should I take profits?",
                "Rebalancing recommendations"
            ]
        elif "risk" in message_lower:
            suggestions = [
                "How diversified is my portfolio?",
                "What's my risk score?",
                "Suggest defensive stocks",
                "How to hedge my positions?",
                "Safe investment options"
            ]
        
        return suggestions[:3]
    
    def _prepare_portfolio_context(self, portfolio: Portfolio, analysis: Optional[PortfolioAnalysis]) -> Dict[str, Any]:
        """Prepare portfolio context for AI agent"""
        context = {
            "portfolio_name": portfolio.name,
            "total_value": portfolio.current_value or 0,
            "total_invested": portfolio.total_invested,
            "gain_loss": portfolio.total_gain_loss or 0,
            "gain_loss_percent": portfolio.total_gain_loss_percent or 0,
            "holdings_count": len(portfolio.holdings),
            "cash_remaining": portfolio.cash_remaining or 0,
            "risk_profile": portfolio.preferences.risk_profile,
            "investment_goal": portfolio.preferences.investment_goal,
            "target_return": portfolio.preferences.target_return,
            "time_horizon": portfolio.preferences.time_horizon_years,
            "holdings": []
        }
        
        # Add holdings details
        for holding in portfolio.holdings:
            context["holdings"].append({
                "ticker": holding.ticker,
                "name": holding.name,
                "sector": holding.sector,
                "quantity": holding.quantity,
                "current_price": holding.current_price,
                "total_value": holding.total_value or 0,
                "gain_loss": holding.gain_loss or 0,
                "gain_loss_percent": holding.gain_loss_percent or 0
            })
        
        # Add analysis if available
        if analysis:
            context["analysis"] = {
                "sector_allocation": analysis.sector_allocation,
                "risk_metrics": analysis.risk_metrics,
                "recommendations": analysis.recommendations
            }
        
        return context 