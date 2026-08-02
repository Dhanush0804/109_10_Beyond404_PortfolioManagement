import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.exceptions import (
    RangeExceeded, range_exceeded_handler,
    YahooDataUnavailable, yahoo_data_unavailable_handler,
    SymbolNotFound, symbol_not_found_handler,
    InvalidDateRange, invalid_date_range_handler,
    InvalidInterval, invalid_interval_handler,
)
from app.routers import health, market

# Configure structured logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("market_data_server")

app = FastAPI(
    title="Yahoo Market Data API",
    description="Production-ready FastAPI microservice for retrieving historical stock market data from Yahoo Finance.",
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Exception Handlers
app.add_exception_handler(RangeExceeded, range_exceeded_handler)
app.add_exception_handler(YahooDataUnavailable, yahoo_data_unavailable_handler)
app.add_exception_handler(SymbolNotFound, symbol_not_found_handler)
app.add_exception_handler(InvalidDateRange, invalid_date_range_handler)
app.add_exception_handler(InvalidInterval, invalid_interval_handler)

# Request Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    params = request.query_params
    symbol = params.get("symbol", "-")
    interval = params.get("interval", "-")
    start = params.get("start", "-")
    end = params.get("end", "-")

    logger.info(
        f"Incoming Request: {request.method} {request.url.path} | "
        f"symbol={symbol} interval={interval} start={start} end={end}"
    )

    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(
            f"Completed Request: {request.method} {request.url.path} | "
            f"Status={response.status_code} | ExecutionTime={process_time:.2f}ms"
        )
        return response
    except Exception as exc:
        process_time = (time.time() - start_time) * 1000
        logger.error(
            f"Failed Request: {request.method} {request.url.path} | "
            f"Error={str(exc)} | ExecutionTime={process_time:.2f}ms"
        )
        raise exc

# Include API Router with prefix /api/v1
api_v1_prefix = "/api/v1"
app.include_router(health.router, prefix=api_v1_prefix)
app.include_router(market.router, prefix=api_v1_prefix)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
