from pydantic import BaseModel
from typing import List, Optional


class StockRecommendation(BaseModel):
    ticker: str
    name: str
    sector: str
    price: float
    quantity: int
    risk_match: str
    justification: str


class StockPickResponse(BaseModel):
    portfolio: List[StockRecommendation]
    total_allocated: float
    remaining_cash: float
    summary: Optional[str] = None 