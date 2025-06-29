import os
from typing import List, Optional
from openai import OpenAI
from dotenv import load_dotenv
from ..models.request import StockPickRequest
from ..models.response import StockRecommendation

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
                model="gpt-4-turbo-preview",
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
                model="gpt-4-turbo-preview",
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