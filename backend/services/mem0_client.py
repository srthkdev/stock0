import os
from typing import List, Optional, Dict, Any
from mem0 import Memory
from datetime import datetime

from models.portfolio import Portfolio, ChatMessage


class Mem0Client:
    """Mem0 client for memory management and portfolio chat"""
    
    def __init__(self):
        self.api_key = os.getenv("MEM0_API_KEY")
        self.client = None
        
        if not self.api_key or self.api_key == "your_mem0_api_key_here":
            print("⚠️ No Mem0 API key found - using basic memory management")
            self.client = None
            return
            
        try:
            # Initialize Mem0 client with simple configuration
            # Use default configuration which should work with current version
            self.client = Memory()
            print("✅ Mem0 client initialized")
        except Exception as e:
            print(f"❌ Mem0 initialization failed: {str(e)}")
            print("⚠️ Falling back to mock memory management")
            self.client = None
    
    async def add_portfolio_memory(self, user_id: str, portfolio: Portfolio) -> bool:
        """Add portfolio information to user's memory"""
        if not self.client:
            return self._mock_add_portfolio_memory(user_id, portfolio)
        
        try:
            # Create memory context about the portfolio
            memory_text = self._create_portfolio_memory_text(portfolio)
            
            # Add to memory with user context
            self.client.add(
                messages=[{"role": "user", "content": memory_text}],
                user_id=user_id,
                metadata={
                    "portfolio_id": portfolio.id,
                    "portfolio_name": portfolio.name,
                    "type": "portfolio_info"
                }
            )
            
            print(f"✅ Added portfolio memory for user {user_id}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to add portfolio memory: {str(e)}")
            return False
    
    async def get_portfolio_context(self, user_id: str, portfolio_id: str) -> str:
        """Get relevant portfolio context for chat"""
        if not self.client:
            return self._mock_get_portfolio_context(user_id, portfolio_id)
        
        try:
            # Search for relevant memories
            memories = self.client.search(
                query=f"portfolio {portfolio_id} holdings investments",
                user_id=user_id,
                limit=5
            )
            
            if not memories:
                return "No specific portfolio context found."
            
            # Combine relevant memories
            context_parts = []
            for memory in memories:
                if memory.get("memory"):
                    context_parts.append(memory["memory"])
            
            return "\n".join(context_parts)
            
        except Exception as e:
            print(f"❌ Failed to get portfolio context: {str(e)}")
            return "Unable to retrieve portfolio context."
    
    async def add_chat_context(self, user_id: str, portfolio_id: str, message: str, response: str) -> bool:
        """Add chat interaction to memory"""
        if not self.client:
            return self._mock_add_chat_context(user_id, portfolio_id, message, response)
        
        try:
            # Create memory from the chat interaction
            memory_text = f"User asked: {message}\nAssistant responded: {response}"
            
            self.client.add(
                messages=[{"role": "user", "content": memory_text}],
                user_id=user_id,
                metadata={
                    "portfolio_id": portfolio_id,
                    "type": "chat_interaction",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to add chat context: {str(e)}")
            return False
    
    async def add_chat_memory(self, user_id: str, portfolio_id: str, message: str, response: str) -> bool:
        """Add chat memory (alias for add_chat_context)"""
        return await self.add_chat_context(user_id, portfolio_id, message, response)
    
    async def get_user_investment_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user's investment profile from memory"""
        if not self.client:
            return self._mock_get_user_investment_profile(user_id)
        
        try:
            # Search for investment-related memories
            memories = self.client.search(
                query="investment preferences risk tolerance goals sectors",
                user_id=user_id,
                limit=10
            )
            
            profile = {
                "risk_tolerance": "moderate",
                "preferred_sectors": [],
                "investment_goals": [],
                "past_decisions": []
            }
            
            # Extract insights from memories
            for memory in memories:
                memory_text = memory.get("memory", "").lower()
                
                # Extract risk tolerance
                if "conservative" in memory_text or "low risk" in memory_text:
                    profile["risk_tolerance"] = "low"
                elif "aggressive" in memory_text or "high risk" in memory_text:
                    profile["risk_tolerance"] = "high"
                
                # Extract sectors
                sectors = ["technology", "healthcare", "finance", "energy", "consumer"]
                for sector in sectors:
                    if sector in memory_text and sector not in profile["preferred_sectors"]:
                        profile["preferred_sectors"].append(sector)
            
            return profile
            
        except Exception as e:
            print(f"❌ Failed to get user investment profile: {str(e)}")
            return {"risk_tolerance": "moderate", "preferred_sectors": [], "investment_goals": []}
    
    async def update_portfolio_memory(self, user_id: str, portfolio_id: str, updates: str) -> bool:
        """Update portfolio memory with new information"""
        if not self.client:
            return self._mock_update_portfolio_memory(user_id, portfolio_id, updates)
        
        try:
            # Add the updates as new memory
            self.client.add(
                messages=[{"role": "user", "content": f"Portfolio update: {updates}"}],
                user_id=user_id,
                metadata={
                    "portfolio_id": portfolio_id,
                    "type": "portfolio_update",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to update portfolio memory: {str(e)}")
            return False
    
    def _create_portfolio_memory_text(self, portfolio: Portfolio) -> str:
        """Create memory text from portfolio data"""
        memory_parts = [
            f"Portfolio: {portfolio.name}",
            f"Total invested: ${portfolio.total_invested:,.2f}",
            f"Risk profile: {portfolio.preferences.risk_profile}",
            f"Investment goal: {portfolio.preferences.investment_goal}",
            f"Target return: {portfolio.preferences.target_return}%",
            f"Time horizon: {portfolio.preferences.time_horizon_years} years",
            f"Preferred sectors: {', '.join(portfolio.preferences.preferred_sectors)}",
        ]
        
        if portfolio.holdings:
            memory_parts.append("Holdings:")
            for holding in portfolio.holdings:
                memory_parts.append(
                    f"- {holding.ticker} ({holding.name}): {holding.quantity} shares @ ${holding.average_price:.2f}"
                )
        
        if portfolio.preferences.notes:
            memory_parts.append(f"Additional notes: {portfolio.preferences.notes}")
        
        return "\n".join(memory_parts)
    
    # Mock Methods (for when Mem0 is not available)
    def _mock_add_portfolio_memory(self, user_id: str, portfolio: Portfolio) -> bool:
        """Mock portfolio memory addition"""
        print(f"📝 Mock: Added portfolio memory for user {user_id}, portfolio {portfolio.name}")
        return True
    
    def _mock_get_portfolio_context(self, user_id: str, portfolio_id: str) -> str:
        """Mock portfolio context retrieval"""
        print(f"📝 Mock: Retrieved portfolio context for user {user_id}, portfolio {portfolio_id}")
        return "Mock portfolio context: This is a diversified portfolio with technology and healthcare holdings."
    
    def _mock_add_chat_context(self, user_id: str, portfolio_id: str, message: str, response: str) -> bool:
        """Mock chat context addition"""
        print(f"📝 Mock: Added chat context for user {user_id}, portfolio {portfolio_id}")
        return True
    
    def _mock_get_user_investment_profile(self, user_id: str) -> Dict[str, Any]:
        """Mock user investment profile"""
        print(f"📝 Mock: Retrieved investment profile for user {user_id}")
        return {
            "risk_tolerance": "moderate",
            "preferred_sectors": ["technology", "healthcare"],
            "investment_goals": ["growth"],
            "past_decisions": []
        }
    
    def _mock_update_portfolio_memory(self, user_id: str, portfolio_id: str, updates: str) -> bool:
        """Mock portfolio memory update"""
        print(f"📝 Mock: Updated portfolio memory for user {user_id}, portfolio {portfolio_id}")
        return True 