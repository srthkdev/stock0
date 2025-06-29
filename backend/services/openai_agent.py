import os
from typing import List, Optional
from openai import OpenAI
from dotenv import load_dotenv
from models.request import StockPickRequest
from models.response import StockRecommendation

load_dotenv()


class OpenAIAgent:
    """OpenAI agent for providing personalized investment reasoning."""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = None
        
        if self.api_key and self.api_key != "your_openai_api_key_here":
            try:
                self.client = OpenAI(api_key=self.api_key)
                print("✅ OpenAI API connected")
            except Exception as e:
                print(f"⚠️ OpenAI initialization failed: {str(e)}")
                self.client = None
        else:
            print("📝 No OpenAI API key found - using basic reasoning")
    
    def generate_portfolio_reasoning(
        self, 
        request: StockPickRequest, 
        recommendations: List[StockRecommendation],
        total_allocated: float,
        remaining_cash: float
    ) -> Optional[str]:
        """Generate personalized reasoning for the portfolio recommendations."""
        
        if not self.client:
            return self._generate_basic_reasoning(request, recommendations, total_allocated)
        
        try:
            # Prepare portfolio summary
            portfolio_summary = self._prepare_portfolio_summary(recommendations)
            
            # Create prompt for OpenAI
            prompt = self._create_reasoning_prompt(request, portfolio_summary, total_allocated, remaining_cash)
            
            # Get response from OpenAI
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional financial advisor providing personalized investment reasoning. Be concise, professional, and focus on the user's specific goals and preferences."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"❌ OpenAI reasoning failed: {str(e)}")
            return self._generate_basic_reasoning(request, recommendations, total_allocated)
    
    def enhance_stock_justifications(
        self, 
        request: StockPickRequest, 
        recommendations: List[StockRecommendation]
    ) -> List[StockRecommendation]:
        """Enhance individual stock justifications using OpenAI."""
        
        if not self.client or len(recommendations) == 0:
            return recommendations
        
        try:
            for rec in recommendations:
                enhanced_justification = self._get_enhanced_justification(request, rec)
                if enhanced_justification:
                    rec.justification = enhanced_justification
            
            return recommendations
            
        except Exception as e:
            print(f"❌ OpenAI justification enhancement failed: {str(e)}")
            return recommendations
    
    def _prepare_portfolio_summary(self, recommendations: List[StockRecommendation]) -> str:
        """Prepare a summary of the portfolio for reasoning."""
        
        summary_lines = []
        total_investment = sum(rec.price * rec.quantity for rec in recommendations)
        
        for rec in recommendations:
            investment = rec.price * rec.quantity
            percentage = (investment / total_investment) * 100
            summary_lines.append(
                f"- {rec.ticker} ({rec.name}): {rec.quantity} shares @ ${rec.price:.2f} "
                f"= ${investment:.2f} ({percentage:.1f}% of portfolio)"
            )
        
        return "\n".join(summary_lines)
    
    def _create_reasoning_prompt(
        self, 
        request: StockPickRequest, 
        portfolio_summary: str, 
        total_allocated: float, 
        remaining_cash: float
    ) -> str:
        """Create a prompt for portfolio reasoning."""
        
        prompt = f"""
Provide personalized investment reasoning for this portfolio recommendation:

INVESTOR PROFILE:
- Budget: ${request.budget:,.2f}
- Risk Profile: {request.risk_profile}
- Target Return: {request.goal.target_return}% over {request.goal.duration_years} years
- Preferred Sectors: {', '.join(request.sectors)}
- Additional Notes: {request.note or 'None'}

RECOMMENDED PORTFOLIO:
{portfolio_summary}

ALLOCATION SUMMARY:
- Total Allocated: ${total_allocated:,.2f}
- Remaining Cash: ${remaining_cash:,.2f}
- Allocation Rate: {(total_allocated/request.budget)*100:.1f}%

Please provide a concise explanation (3-4 sentences) of why this portfolio aligns with the investor's goals, risk profile, and preferences. Focus on sector diversification, risk management, and potential for meeting the target return.
"""
        return prompt
    
    def _get_enhanced_justification(self, request: StockPickRequest, rec: StockRecommendation) -> Optional[str]:
        """Get enhanced justification for a specific stock."""
        
        try:
            prompt = f"""
Provide a brief investment justification (1-2 sentences) for including {rec.ticker} ({rec.name}) in a portfolio:

- Sector: {rec.sector}
- Investment: {rec.quantity} shares @ ${rec.price:.2f}
- Investor's risk profile: {request.risk_profile}
- Investor's goal: {request.goal.target_return}% return over {request.goal.duration_years} years
- Additional context: {request.note or 'Standard investment goals'}

Focus on why this stock fits the investor's specific profile and goals.
"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a financial analyst providing concise stock investment justifications."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=150,
                temperature=0.6
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"❌ Failed to enhance justification for {rec.ticker}: {str(e)}")
            return None
    
    def _generate_basic_reasoning(
        self, 
        request: StockPickRequest, 
        recommendations: List[StockRecommendation], 
        total_allocated: float
    ) -> str:
        """Generate basic reasoning when OpenAI is not available."""
        
        sectors = list(set(rec.sector for rec in recommendations))
        allocation_rate = (total_allocated / request.budget) * 100
        
        reasoning = f"This diversified portfolio spans {len(sectors)} sectors ({', '.join(sectors)}) "
        reasoning += f"with {allocation_rate:.1f}% of your ${request.budget:,.2f} budget allocated across "
        reasoning += f"{len(recommendations)} carefully selected stocks. "
        
        if request.risk_profile == "low":
            reasoning += "The selection emphasizes stability and dividend-paying companies suitable for conservative investors. "
        elif request.risk_profile == "moderate":
            reasoning += "The mix balances growth potential with stability, appropriate for moderate risk tolerance. "
        else:
            reasoning += "The portfolio includes growth-oriented stocks with higher return potential for aggressive investors. "
        
        reasoning += f"This allocation aims to achieve your {request.goal.target_return}% target return "
        reasoning += f"over {request.goal.duration_years} years through strategic sector diversification."
        
        return reasoning
    
    async def chat_with_portfolio(self, message: str, portfolio_context: dict, user_id: str) -> str:
        """Chat with portfolio using AI analysis."""
        
        if not self.client:
            return self._generate_basic_chat_response(message, portfolio_context)
        
        try:
            # Create prompt for portfolio chat
            prompt = self._create_chat_prompt(message, portfolio_context)
            
            # Get response from OpenAI
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert financial advisor and portfolio analyst. You provide personalized investment advice based on the user's portfolio data and market knowledge. 

Key guidelines:
- Be conversational but professional
- Use specific data from their portfolio when relevant
- Provide actionable insights and recommendations
- Explain complex concepts in simple terms
- Always consider their risk profile and investment goals
- Use emojis sparingly but appropriately
- Keep responses concise but informative (2-4 sentences typically)"""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=400,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"❌ OpenAI portfolio chat failed: {str(e)}")
            return self._generate_basic_chat_response(message, portfolio_context)
    
    def _create_chat_prompt(self, message: str, portfolio_context: dict) -> str:
        """Create a prompt for portfolio chat."""
        
        # Extract key portfolio metrics
        portfolio_name = portfolio_context.get("portfolio_name", "Portfolio")
        total_value = portfolio_context.get("total_value", 0)
        total_invested = portfolio_context.get("total_invested", 0)
        gain_loss = portfolio_context.get("gain_loss", 0)
        gain_loss_percent = portfolio_context.get("gain_loss_percent", 0)
        holdings_count = portfolio_context.get("holdings_count", 0)
        risk_profile = portfolio_context.get("risk_profile", "moderate")
        investment_goal = portfolio_context.get("investment_goal", "growth")
        
        # Build holdings summary
        holdings_summary = ""
        holdings = portfolio_context.get("holdings", [])
        if holdings:
            top_holdings = sorted(holdings, key=lambda x: x.get("total_value", 0), reverse=True)[:5]
            holdings_summary = "\nTop Holdings:\n"
            for holding in top_holdings:
                ticker = holding.get("ticker", "")
                name = holding.get("name", "")
                sector = holding.get("sector", "")
                total_val = holding.get("total_value", 0)
                gain_loss_pct = holding.get("gain_loss_percent", 0)
                holdings_summary += f"- {ticker} ({name}) - {sector}: ${total_val:,.2f} ({gain_loss_pct:+.1f}%)\n"
        
        # Build analysis summary
        analysis_summary = ""
        analysis = portfolio_context.get("analysis", {})
        if analysis:
            sector_allocation = analysis.get("sector_allocation", {})
            if sector_allocation:
                analysis_summary += "\nSector Allocation:\n"
                for sector, percentage in sorted(sector_allocation.items(), key=lambda x: x[1], reverse=True):
                    analysis_summary += f"- {sector}: {percentage:.1f}%\n"
            
            recommendations = analysis.get("recommendations", [])
            if recommendations:
                analysis_summary += f"\nCurrent Recommendations:\n"
                for rec in recommendations[:3]:
                    analysis_summary += f"- {rec}\n"
        
        prompt = f"""
USER QUESTION: "{message}"

PORTFOLIO CONTEXT:
Portfolio: {portfolio_name}
Current Value: ${total_value:,.2f}
Total Invested: ${total_invested:,.2f}
Gain/Loss: ${gain_loss:,.2f} ({gain_loss_percent:+.1f}%)
Holdings: {holdings_count} stocks
Risk Profile: {risk_profile}
Investment Goal: {investment_goal}
{holdings_summary}
{analysis_summary}

Please provide a helpful, personalized response to the user's question based on their specific portfolio data and context. Be conversational but professional.
"""
        return prompt
    
    def _generate_basic_chat_response(self, message: str, portfolio_context: dict) -> str:
        """Generate basic chat response when OpenAI is not available."""
        
        portfolio_name = portfolio_context.get("portfolio_name", "your portfolio")
        total_value = portfolio_context.get("total_value", 0)
        holdings_count = portfolio_context.get("holdings_count", 0)
        gain_loss_percent = portfolio_context.get("gain_loss_percent", 0)
        
        message_lower = message.lower()
        
        if "performance" in message_lower or "how" in message_lower:
            if gain_loss_percent > 0:
                return f"Your portfolio '{portfolio_name}' is performing well with a {gain_loss_percent:.1f}% gain! With {holdings_count} holdings worth ${total_value:,.2f}, you're on a positive trajectory. Consider reviewing your top performers to understand what's driving the gains."
            elif gain_loss_percent < 0:
                return f"Your portfolio '{portfolio_name}' is currently down {abs(gain_loss_percent):.1f}%, but this is normal market fluctuation. With {holdings_count} holdings worth ${total_value:,.2f}, focus on your long-term strategy and consider if any rebalancing is needed."
            else:
                return f"Your portfolio '{portfolio_name}' is holding steady with {holdings_count} holdings worth ${total_value:,.2f}. This stability can be good for long-term growth - consider your investment timeline and goals."
        
        elif "holdings" in message_lower or "stocks" in message_lower:
            return f"Your portfolio '{portfolio_name}' contains {holdings_count} stock holdings with a total value of ${total_value:,.2f}. I can help you analyze individual positions, sector allocation, or overall portfolio balance. What specific aspect would you like to explore?"
        
        elif "risk" in message_lower:
            return f"Based on your portfolio of {holdings_count} holdings worth ${total_value:,.2f}, I can help assess your risk exposure. Diversification across sectors and proper position sizing are key to managing risk. Would you like me to analyze your sector allocation or individual position sizes?"
        
        else:
            return f"I'm here to help with your portfolio '{portfolio_name}' which has {holdings_count} holdings worth ${total_value:,.2f}. I can analyze performance, suggest rebalancing, explain your holdings, or discuss investment strategies. What would you like to know more about?" 