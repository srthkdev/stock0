from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class RiskProfile(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"


class InvestmentGoal(str, Enum):
    GROWTH = "growth"
    INCOME = "income"
    BALANCED = "balanced"
    RETIREMENT = "retirement"
    EDUCATION = "education"


class PortfolioPreferences(BaseModel):
    """User preferences for automatic portfolio creation"""
    budget: float = Field(..., gt=0, description="Total investment budget")
    risk_profile: RiskProfile = Field(..., description="Risk tolerance")
    investment_goal: InvestmentGoal = Field(..., description="Primary investment goal")
    target_return: float = Field(..., ge=0, le=100, description="Target annual return %")
    time_horizon_years: int = Field(..., ge=1, le=50, description="Investment time horizon")
    preferred_sectors: List[str] = Field(..., min_items=1, max_items=5, description="Preferred sectors")
    exclude_sectors: Optional[List[str]] = Field(default=[], description="Sectors to exclude")
    notes: Optional[str] = Field(None, description="Additional preferences")


class StockHolding(BaseModel):
    """Individual stock holding in portfolio"""
    ticker: str = Field(..., description="Stock ticker symbol")
    name: str = Field(..., description="Company name")
    sector: str = Field(..., description="Company sector")
    quantity: int = Field(..., gt=0, description="Number of shares")
    average_price: float = Field(..., gt=0, description="Average purchase price")
    current_price: Optional[float] = Field(None, description="Current market price")
    total_value: Optional[float] = Field(None, description="Current total value")
    gain_loss: Optional[float] = Field(None, description="Unrealized gain/loss")
    gain_loss_percent: Optional[float] = Field(None, description="Gain/loss percentage")
    justification: Optional[str] = Field(None, description="Why this stock was selected")


class Portfolio(BaseModel):
    """Complete portfolio model"""
    id: Optional[str] = Field(None, description="Portfolio ID")
    user_id: str = Field(..., description="User ID from Appwrite")
    name: str = Field(..., description="Portfolio name")
    description: Optional[str] = Field(None, description="Portfolio description")
    preferences: PortfolioPreferences = Field(..., description="User preferences")
    holdings: List[StockHolding] = Field(..., description="Stock holdings")
    total_invested: float = Field(..., description="Total amount invested")
    current_value: Optional[float] = Field(None, description="Current portfolio value")
    cash_remaining: float = Field(default=0, description="Uninvested cash")
    total_gain_loss: Optional[float] = Field(None, description="Total unrealized gain/loss")
    total_gain_loss_percent: Optional[float] = Field(None, description="Total gain/loss percentage")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    is_active: bool = Field(default=True, description="Whether portfolio is active")


class ChatMessage(BaseModel):
    """Chat message model"""
    id: Optional[str] = Field(None, description="Message ID")
    portfolio_id: str = Field(..., description="Portfolio ID")
    user_id: str = Field(..., description="User ID")
    role: str = Field(..., description="Message role (user/assistant)")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Message timestamp")
    metadata: Optional[Dict[str, Any]] = Field(default={}, description="Additional metadata")


class PortfolioAnalysis(BaseModel):
    """Portfolio analysis response"""
    portfolio_id: str
    total_value: float
    total_invested: float
    gain_loss: float
    gain_loss_percent: float
    sector_allocation: Dict[str, float]
    risk_metrics: Dict[str, float]
    recommendations: List[str]
    last_updated: datetime


class AutoPortfolioRequest(BaseModel):
    """Request for automatic portfolio creation"""
    user_id: str = Field(..., description="User ID from Appwrite")
    portfolio_name: str = Field(..., description="Name for the portfolio")
    preferences: PortfolioPreferences = Field(..., description="Investment preferences")


class ChatRequest(BaseModel):
    """Chat request model"""
    portfolio_id: str = Field(..., description="Portfolio ID")
    user_id: str = Field(..., description="User ID")
    message: str = Field(..., description="User message")


class ChatResponse(BaseModel):
    """Chat response model"""
    message: str = Field(..., description="Assistant response")
    portfolio_analysis: Optional[PortfolioAnalysis] = Field(None, description="Portfolio analysis if requested")
    suggestions: Optional[List[str]] = Field(None, description="Follow-up suggestions") 