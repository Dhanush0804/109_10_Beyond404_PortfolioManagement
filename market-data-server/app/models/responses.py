from typing import List, Optional
from pydantic import BaseModel, Field

class CandleData(BaseModel):
    timestamp: str = Field(..., description="ISO-8601 formatted timestamp with timezone offset")
    open: float = Field(..., description="Opening price")
    high: float = Field(..., description="Highest price")
    low: float = Field(..., description="Lowest price")
    close: float = Field(..., description="Closing price")
    volume: int = Field(..., description="Trading volume")

class MarketHistoryResponse(BaseModel):
    symbol: str = Field(..., description="Stock ticker symbol")
    interval: str = Field(..., description="Candle time frame interval")
    timezone: str = Field(..., description="Timezone of the market data")
    start: str = Field(..., description="Start timestamp")
    end: str = Field(..., description="End timestamp")
    count: int = Field(..., description="Number of candles returned")
    data: List[CandleData] = Field(..., description="List of OHLCV candles")

class QuoteResponse(BaseModel):
    symbol: str = Field(..., description="Stock ticker symbol")
    price: float = Field(..., description="Latest traded price")
    currency: str = Field(default="USD", description="Market currency")
    timestamp: str = Field(..., description="Timestamp of the quote")
    open: Optional[float] = Field(None, description="Session opening price")
    high: Optional[float] = Field(None, description="Session highest price")
    low: Optional[float] = Field(None, description="Session lowest price")
    previous_close: Optional[float] = Field(None, description="Previous session closing price")
    change: Optional[float] = Field(None, description="Price change from previous close")
    percent_change: Optional[float] = Field(None, description="Percentage change from previous close")
    volume: Optional[int] = Field(None, description="Session volume")

class SearchResultItem(BaseModel):
    symbol: str = Field(..., description="Stock ticker symbol")
    name: str = Field(..., description="Full company name or asset name")
    exchange: Optional[str] = Field(None, description="Exchange code, e.g. NASDAQ, NYSE, NSE")
    type: Optional[str] = Field(None, description="Asset type description, e.g. Equity, ETF, Cryptocurency")
    exchange_display: Optional[str] = Field(None, description="Human readable exchange description")

class SearchResponse(BaseModel):
    query: str = Field(..., description="Search query string")
    count: int = Field(..., description="Number of results found")
    results: List[SearchResultItem] = Field(..., description="List of search results")

class HealthResponse(BaseModel):
    status: str = Field(default="ok", description="Service health status")
    service: str = Field(default="yahoo-market-data", description="Service identifier")
    version: str = Field(default="1.0.0", description="Service semantic version")
    timestamp: str = Field(..., description="Current ISO-8601 timestamp")

class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Human readable error message")

class RangeExceededResponse(BaseModel):
    error: str = Field(default="range_exceeded", description="Error type identifier")
    message: str = Field(..., description="Error explanation")
    max_days: int = Field(..., description="Maximum allowed days for interval")
