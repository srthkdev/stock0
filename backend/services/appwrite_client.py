import os
from typing import List, Optional, Dict, Any
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
from appwrite.exception import AppwriteException
from datetime import datetime
import json
import uuid

from models.portfolio import Portfolio, ChatMessage, StockHolding


class AppwriteClient:
    """Appwrite client for database operations"""
    
    def __init__(self):
        self.client = Client()
        self.endpoint = os.getenv("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1")
        self.project_id = os.getenv("APPWRITE_PROJECT_ID")
        self.api_key = os.getenv("APPWRITE_API_KEY")
        self.database_id = os.getenv("APPWRITE_DATABASE_ID", "stock0_db")
        
        if not self.project_id or not self.api_key:
            print("⚠️ Appwrite credentials not found - database operations will be mocked")
            self.client = None
            return
            
        try:
            self.client.set_endpoint(self.endpoint)
            self.client.set_project(self.project_id)
            self.client.set_key(self.api_key)
            
            self.databases = Databases(self.client)
            print("✅ Appwrite client initialized")
        except Exception as e:
            print(f"❌ Appwrite initialization failed: {str(e)}")
            self.client = None
    
    # Portfolio Operations
    async def create_portfolio(self, portfolio: Portfolio) -> Optional[str]:
        """Create a new portfolio in database"""
        if not self.client:
            return self._mock_create_portfolio(portfolio)
        
        try:
            portfolio_id = str(uuid.uuid4())
            portfolio_data = {
                "user_id": portfolio.user_id,
                "name": portfolio.name,
                "description": portfolio.description or "",
                "preferences": json.dumps(portfolio.preferences.dict()),
                "holdings": json.dumps([holding.dict() for holding in portfolio.holdings]),
                "total_invested": portfolio.total_invested,
                "current_value": portfolio.current_value or 0,
                "cash_remaining": portfolio.cash_remaining,
                "total_gain_loss": portfolio.total_gain_loss or 0,
                "total_gain_loss_percent": portfolio.total_gain_loss_percent or 0,
                "created_at": portfolio.created_at.isoformat(),
                "updated_at": portfolio.updated_at.isoformat(),
                "is_active": portfolio.is_active
            }
            
            result = self.databases.create_document(
                database_id=self.database_id,
                collection_id="portfolios",
                document_id=portfolio_id,
                data=portfolio_data
            )
            
            return result["$id"]
            
        except AppwriteException as e:
            print(f"❌ Failed to create portfolio: {str(e)}")
            return None
    
    async def get_portfolio(self, portfolio_id: str) -> Optional[Portfolio]:
        """Get portfolio by ID"""
        if not self.client:
            return self._mock_get_portfolio(portfolio_id)
        
        try:
            result = self.databases.get_document(
                database_id=self.database_id,
                collection_id="portfolios",
                document_id=portfolio_id
            )
            
            return self._document_to_portfolio(result)
            
        except AppwriteException as e:
            print(f"❌ Failed to get portfolio: {str(e)}")
            return None
    
    async def get_user_portfolios(self, user_id: str) -> List[Portfolio]:
        """Get all portfolios for a user"""
        if not self.client:
            return self._mock_get_user_portfolios(user_id)
        
        try:
            result = self.databases.list_documents(
                database_id=self.database_id,
                collection_id="portfolios",
                queries=[
                    Query.equal("user_id", user_id),
                    Query.equal("is_active", True)
                ]
            )
            
            portfolios = []
            for doc in result["documents"]:
                portfolio = self._document_to_portfolio(doc)
                if portfolio:
                    portfolios.append(portfolio)
            
            return portfolios
            
        except AppwriteException as e:
            print(f"❌ Failed to get user portfolios: {str(e)}")
            return []
    
    async def update_portfolio(self, portfolio_id: str, portfolio: Portfolio) -> bool:
        """Update portfolio in database"""
        if not self.client:
            return self._mock_update_portfolio(portfolio_id, portfolio)
        
        try:
            portfolio_data = {
                "name": portfolio.name,
                "description": portfolio.description or "",
                "preferences": json.dumps(portfolio.preferences.dict()),
                "holdings": json.dumps([holding.dict() for holding in portfolio.holdings]),
                "total_invested": portfolio.total_invested,
                "current_value": portfolio.current_value or 0,
                "cash_remaining": portfolio.cash_remaining,
                "total_gain_loss": portfolio.total_gain_loss or 0,
                "total_gain_loss_percent": portfolio.total_gain_loss_percent or 0,
                "updated_at": datetime.utcnow().isoformat(),
            }
            
            self.databases.update_document(
                database_id=self.database_id,
                collection_id="portfolios",
                document_id=portfolio_id,
                data=portfolio_data
            )
            
            return True
            
        except AppwriteException as e:
            print(f"❌ Failed to update portfolio: {str(e)}")
            return False
    
    async def delete_portfolio(self, portfolio_id: str) -> bool:
        """Soft delete portfolio (mark as inactive)"""
        if not self.client:
            return self._mock_delete_portfolio(portfolio_id)
        
        try:
            self.databases.update_document(
                database_id=self.database_id,
                collection_id="portfolios",
                document_id=portfolio_id,
                data={"is_active": False}
            )
            
            return True
            
        except AppwriteException as e:
            print(f"❌ Failed to delete portfolio: {str(e)}")
            return False
    
    # Chat Operations
    async def save_chat_message(self, message: ChatMessage) -> Optional[str]:
        """Save chat message to database"""
        if not self.client:
            return self._mock_save_chat_message(message)
        
        try:
            message_id = str(uuid.uuid4())
            message_data = {
                "portfolio_id": message.portfolio_id,
                "user_id": message.user_id,
                "role": message.role,
                "content": message.content,
                "timestamp": message.timestamp.isoformat(),
                "metadata": json.dumps(message.metadata or {})
            }
            
            result = self.databases.create_document(
                database_id=self.database_id,
                collection_id="chat_messages",
                document_id=message_id,
                data=message_data
            )
            
            return result["$id"]
            
        except AppwriteException as e:
            print(f"❌ Failed to save chat message: {str(e)}")
            return None
    
    async def get_chat_messages(self, portfolio_id: str, limit: int = 50) -> List[ChatMessage]:
        """Get chat messages for a portfolio"""
        if not self.client:
            return self._mock_get_chat_messages(portfolio_id, limit)
        
        try:
            result = self.databases.list_documents(
                database_id=self.database_id,
                collection_id="chat_messages",
                queries=[
                    Query.equal("portfolio_id", portfolio_id),
                    Query.order_desc("timestamp"),
                    Query.limit(limit)
                ]
            )
            
            messages = []
            for doc in result["documents"]:
                message = self._document_to_chat_message(doc)
                if message:
                    messages.append(message)
            
            return messages[::-1]  # Reverse to get chronological order
            
        except AppwriteException as e:
            print(f"❌ Failed to get chat messages: {str(e)}")
            return []
    
    # Helper Methods
    def _document_to_portfolio(self, doc: Dict[str, Any]) -> Optional[Portfolio]:
        """Convert Appwrite document to Portfolio model"""
        try:
            from models.portfolio import PortfolioPreferences
            
            preferences_data = json.loads(doc["preferences"])
            holdings_data = json.loads(doc["holdings"])
            
            preferences = PortfolioPreferences(**preferences_data)
            holdings = [StockHolding(**holding) for holding in holdings_data]
            
            return Portfolio(
                id=doc["$id"],
                user_id=doc["user_id"],
                name=doc["name"],
                description=doc.get("description"),
                preferences=preferences,
                holdings=holdings,
                total_invested=doc["total_invested"],
                current_value=doc.get("current_value"),
                cash_remaining=doc["cash_remaining"],
                total_gain_loss=doc.get("total_gain_loss"),
                total_gain_loss_percent=doc.get("total_gain_loss_percent"),
                created_at=datetime.fromisoformat(doc["created_at"]),
                updated_at=datetime.fromisoformat(doc["updated_at"]),
                is_active=doc["is_active"]
            )
            
        except Exception as e:
            print(f"❌ Failed to convert document to portfolio: {str(e)}")
            return None
    
    def _document_to_chat_message(self, doc: Dict[str, Any]) -> Optional[ChatMessage]:
        """Convert Appwrite document to ChatMessage model"""
        try:
            metadata = json.loads(doc.get("metadata", "{}"))
            
            return ChatMessage(
                id=doc["$id"],
                portfolio_id=doc["portfolio_id"],
                user_id=doc["user_id"],
                role=doc["role"],
                content=doc["content"],
                timestamp=datetime.fromisoformat(doc["timestamp"]),
                metadata=metadata
            )
            
        except Exception as e:
            print(f"❌ Failed to convert document to chat message: {str(e)}")
            return None
    
    # Mock Methods (for when Appwrite is not available)
    def _mock_create_portfolio(self, portfolio: Portfolio) -> str:
        """Mock portfolio creation"""
        portfolio_id = str(uuid.uuid4())
        print(f"📝 Mock: Created portfolio {portfolio_id} for user {portfolio.user_id}")
        return portfolio_id
    
    def _mock_get_portfolio(self, portfolio_id: str) -> Optional[Portfolio]:
        """Mock portfolio retrieval"""
        print(f"📝 Mock: Retrieved portfolio {portfolio_id}")
        return None
    
    def _mock_get_user_portfolios(self, user_id: str) -> List[Portfolio]:
        """Mock user portfolios retrieval"""
        print(f"📝 Mock: Retrieved portfolios for user {user_id}")
        return []
    
    def _mock_update_portfolio(self, portfolio_id: str, portfolio: Portfolio) -> bool:
        """Mock portfolio update"""
        print(f"📝 Mock: Updated portfolio {portfolio_id}")
        return True
    
    def _mock_delete_portfolio(self, portfolio_id: str) -> bool:
        """Mock portfolio deletion"""
        print(f"📝 Mock: Deleted portfolio {portfolio_id}")
        return True
    
    def _mock_save_chat_message(self, message: ChatMessage) -> str:
        """Mock chat message save"""
        message_id = str(uuid.uuid4())
        print(f"📝 Mock: Saved chat message {message_id}")
        return message_id
    
    def _mock_get_chat_messages(self, portfolio_id: str, limit: int) -> List[ChatMessage]:
        """Mock chat messages retrieval"""
        print(f"📝 Mock: Retrieved {limit} chat messages for portfolio {portfolio_id}")
        return [] 