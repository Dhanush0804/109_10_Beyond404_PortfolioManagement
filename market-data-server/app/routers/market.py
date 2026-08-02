from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from app.dependencies import get_market_history_request, get_yahoo_service
from app.models.requests import MarketHistoryRequest
from app.models.responses import MarketHistoryResponse, QuoteResponse, RangeExceededResponse, ErrorResponse, SearchResponse
from app.services.yahoo_service import YahooService

router = APIRouter(prefix="/market", tags=["Market Data"])

@router.get(
    "/history",
    response_model=MarketHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve historical stock market data",
    description="Fetches OHLCV candle history for a given ticker symbol and interval within specified start and end dates.",
    responses={
        200: {"model": MarketHistoryResponse, "description": "Successfully retrieved market data"},
        400: {"model": RangeExceededResponse, "description": "Range limit exceeded or invalid date parameters"},
        404: {"model": ErrorResponse, "description": "Symbol not found or data unavailable"},
        422: {"model": ErrorResponse, "description": "Validation error (unsupported interval, missing parameters, etc.)"},
    },
)
async def get_market_history(
    req: MarketHistoryRequest = Depends(get_market_history_request),
    service: YahooService = Depends(get_yahoo_service),
) -> MarketHistoryResponse:
    """Fetch historical OHLCV candles from Yahoo Finance."""
    return await service.fetch_history(req)

@router.get(
    "/quote",
    response_model=QuoteResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve latest stock price and quote details",
    description="Fetches the most recent price, open, high, low, volume, and daily change percentage for a stock symbol.",
    responses={
        200: {"model": QuoteResponse, "description": "Successfully retrieved quote"},
        404: {"model": ErrorResponse, "description": "Symbol not found"},
        422: {"model": ErrorResponse, "description": "Invalid symbol format"},
    },
)
async def get_latest_quote(
    symbol: str = Query(..., description="Stock ticker symbol (e.g. AAPL, TSLA, BTC-USD)"),
    service: YahooService = Depends(get_yahoo_service),
) -> QuoteResponse:
    """Fetch latest price and daily metrics for a stock ticker."""
    return await service.fetch_latest_quote(symbol)

@router.get(
    "/recent",
    response_model=MarketHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve recent candle data relative to current time",
    description="Convenience endpoint to get recent candles (e.g. 5m, 1d) ending at current time without specifying start/end ISO timestamps.",
    responses={
        200: {"model": MarketHistoryResponse, "description": "Successfully retrieved recent market data"},
        400: {"model": RangeExceededResponse, "description": "Range limit exceeded"},
        404: {"model": ErrorResponse, "description": "Symbol not found or data unavailable"},
        422: {"model": ErrorResponse, "description": "Unsupported interval or invalid parameters"},
    },
)
async def get_recent_history(
    symbol: str = Query(..., description="Stock ticker symbol (e.g. AAPL, BTC-USD)"),
    interval: str = Query("5m", description="Candle interval (e.g. 1m, 5m, 1d)"),
    days: Optional[int] = Query(None, description="Number of past days from current time (default varies by interval)"),
    service: YahooService = Depends(get_yahoo_service),
) -> MarketHistoryResponse:
    """Fetch recent historical candles computed back from current UTC time."""
    return await service.fetch_recent_history(symbol=symbol, interval=interval, days=days)

@router.get(
    "/search",
    response_model=SearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Search stock ticker symbols and company names",
    description="Query Yahoo Finance search suggestions to get matching company names, tickers, exchanges, and asset types (e.g. for frontend autocomplete).",
    responses={
        200: {"model": SearchResponse, "description": "Successfully retrieved search suggestions"},
        404: {"model": ErrorResponse, "description": "Search index currently unavailable"},
    },
)
async def search_symbols(
    query: str = Query("", description="Search term, company name, or ticker symbol"),
    service: YahooService = Depends(get_yahoo_service),
) -> SearchResponse:
    """Search for symbols and company names matching the query string."""
    return await service.search_symbols(query)
