from fastapi import Request, status
from fastapi.responses import JSONResponse

class YahooMarketException(Exception):
    """Base exception class for Yahoo Market Data Server."""
    pass

class YahooDataUnavailable(YahooMarketException):
    """Raised when Yahoo Finance returns no data or encounters an unrecoverable error."""
    def __init__(self, message: str = "Market data unavailable for requested parameters"):
        self.message = message
        super().__init__(self.message)

class SymbolNotFound(YahooMarketException):
    """Raised when a stock symbol cannot be found or yields no results."""
    def __init__(self, symbol: str):
        self.symbol = symbol
        self.message = f"Symbol '{symbol}' not found or has no market data"
        super().__init__(self.message)

class InvalidDateRange(YahooMarketException):
    """Raised when date range logic is violated."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class InvalidInterval(YahooMarketException):
    """Raised when an unsupported interval is requested."""
    def __init__(self, interval: str):
        self.interval = interval
        self.message = f"Interval '{interval}' is not supported"
        super().__init__(self.message)

class RangeExceeded(YahooMarketException):
    """Raised when the requested date range exceeds Yahoo Finance interval limits."""
    def __init__(self, interval: str, max_days: int):
        self.interval = interval
        self.max_days = max_days
        self.error = "range_exceeded"
        self.message = f"Interval {interval} supports a maximum of {max_days} days"
        super().__init__(self.message)

# Global Exception Handlers
async def range_exceeded_handler(request: Request, exc: RangeExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": exc.error,
            "message": exc.message,
            "max_days": exc.max_days,
        },
    )

async def yahoo_data_unavailable_handler(request: Request, exc: YahooDataUnavailable) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": exc.message},
    )

async def symbol_not_found_handler(request: Request, exc: SymbolNotFound) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": exc.message},
    )

async def invalid_date_range_handler(request: Request, exc: InvalidDateRange) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.message},
    )

async def invalid_interval_handler(request: Request, exc: InvalidInterval) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.message},
    )
