from pydantic import BaseModel, Field, validator
from typing import List, Optional
from enum import Enum


class RiskProfile(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"


class Goal(BaseModel):
    target_return: float = Field(..., ge=0, le=100, description="Target return percentage (0-100)")
    duration_years: int = Field(..., ge=1, le=50, description="Investment duration in years")


class StockPickRequest(BaseModel):
    budget: float = Field(..., gt=0, description="Investment budget in USD")
    sectors: List[str] = Field(..., min_items=1, max_items=3, description="Investment sectors (max 3)")
    risk_profile: RiskProfile = Field(..., description="Risk tolerance level")
    goal: Goal = Field(..., description="Investment goals")
    note: Optional[str] = Field(None, description="Additional preferences or notes")
    
    @validator('sectors')
    def validate_sectors(cls, v):
        valid_sectors = [
            "technology", "healthcare", "finance", "consumer", "energy", 
            "utilities", "materials", "industrials", "telecommunications", "real_estate"
        ]
        
        for sector in v:
            if sector.lower() not in valid_sectors:
                raise ValueError(f"Invalid sector: {sector}. Valid sectors: {', '.join(valid_sectors)}")
        
        return [sector.lower() for sector in v]
    
    @validator('budget')
    def validate_budget(cls, v):
        if v < 100:
            raise ValueError("Minimum budget is $100")
        return v 