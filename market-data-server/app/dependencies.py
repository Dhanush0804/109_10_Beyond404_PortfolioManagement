from datetime import datetime
from typing import Annotated
from fastapi import Query
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

from app.models.requests import MarketHistoryRequest
from app.services.yahoo_service import YahooService

_yahoo_service_instance = YahooService()

def get_yahoo_service() -> YahooService:
    """Dependency provider for YahooService."""
    return _yahoo_service_instance

def get_market_history_request(
    symbol: Annotated[str, Query(description="Stock symbol, e.g. AAPL")],
    interval: Annotated[str, Query(description="Candle interval, e.g. 5m, 1d")],
    start: Annotated[datetime, Query(description="Start datetime in ISO-8601 with timezone")],
    end: Annotated[datetime, Query(description="End datetime in ISO-8601 with timezone")],
    adjusted: Annotated[bool, Query(description="Whether to return adjusted data")] = True,
) -> MarketHistoryRequest:
    """
    Dependency to construct and validate MarketHistoryRequest from query params.
    Translates Pydantic ValidationError into FastAPI RequestValidationError (422)
    and enforces RangeExceeded limits (400).
    """
    try:
        req = MarketHistoryRequest(
            symbol=symbol,
            interval=interval,
            start=start,
            end=end,
            adjusted=adjusted,
        )
    except ValidationError as exc:
        raise RequestValidationError(exc.errors())

    req.check_range_limit()
    return req
