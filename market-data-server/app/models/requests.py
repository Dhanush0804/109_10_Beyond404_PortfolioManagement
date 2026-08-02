import re
from datetime import datetime, timezone, timedelta
from typing import Annotated
from pydantic import BaseModel, Field, field_validator, model_validator
from app.utils.validators import SUPPORTED_INTERVALS, SYMBOL_REGEX, validate_range_limits
from app.utils.time_utils import is_timezone_aware

class MarketHistoryRequest(BaseModel):
    symbol: str = Field(..., description="Stock symbol (e.g. AAPL, TSLA, BTC-USD)")
    interval: str = Field(..., description="Candle interval (e.g. 1m, 5m, 1d)")
    start: datetime = Field(..., description="ISO-8601 datetime with timezone")
    end: datetime = Field(..., description="ISO-8601 datetime with timezone")
    adjusted: bool = Field(default=True, description="Whether to fetch split/dividend adjusted data")

    @field_validator("symbol", mode="before")
    @classmethod
    def uppercase_symbol(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().upper()
        return v

    @field_validator("symbol")
    @classmethod
    def validate_symbol(cls, v: str) -> str:
        if not re.match(SYMBOL_REGEX, v):
            raise ValueError(f"Invalid symbol format: '{v}'. Must match regex '{SYMBOL_REGEX}'")
        return v

    @field_validator("interval")
    @classmethod
    def validate_interval(cls, v: str) -> str:
        if v not in SUPPORTED_INTERVALS:
            raise ValueError(f"Unsupported interval '{v}'")
        return v

    @field_validator("start", "end")
    @classmethod
    def validate_timezone(cls, v: datetime) -> datetime:
        if not is_timezone_aware(v):
            raise ValueError("Datetime must be timezone-aware (ISO-8601 with timezone offset)")
        return v

    @model_validator(mode="after")
    def validate_date_ordering_and_future(self) -> "MarketHistoryRequest":
        # Rule 1: start < end
        if self.start >= self.end:
            raise ValueError("start datetime must be before end datetime")

        # Rule 2: end cannot be in future by > 5 minutes
        now_utc = datetime.now(timezone.utc)
        end_utc = self.end.astimezone(timezone.utc)
        if end_utc > now_utc + timedelta(minutes=5):
            raise ValueError("end datetime cannot be in the future by more than 5 minutes")

        return self

    def check_range_limit(self) -> None:
        """Explicitly validate range limit to raise RangeExceeded (HTTP 400)."""
        validate_range_limits(self.interval, self.start, self.end)
