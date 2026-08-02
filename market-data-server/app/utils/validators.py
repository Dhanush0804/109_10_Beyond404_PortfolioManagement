import re
from datetime import datetime
from typing import Dict, Optional, Set
from app.exceptions import RangeExceeded

SUPPORTED_INTERVALS: Set[str] = {
    "1m", "2m", "5m", "15m", "30m", "60m", "90m",
    "1d", "5d", "1wk", "1mo", "3mo"
}

INTERVAL_MAX_DAYS: Dict[str, Optional[int]] = {
    "1m": 7,
    "2m": 60,
    "5m": 60,
    "15m": 60,
    "30m": 60,
    "60m": 730,
    "90m": 60,
    "1d": None,
    "5d": None,
    "1wk": None,
    "1mo": None,
    "3mo": None,
}

SYMBOL_REGEX = r"^[A-Z0-9.^-]{1,10}$"

def is_valid_symbol_format(symbol: str) -> bool:
    """Validate stock symbol format using regular expression."""
    return bool(re.match(SYMBOL_REGEX, symbol))

def validate_interval_supported(interval: str) -> None:
    """Validate whether an interval is in the supported intervals list."""
    if interval not in SUPPORTED_INTERVALS:
        raise ValueError(f"Interval '{interval}' is not supported")

def validate_range_limits(interval: str, start: datetime, end: datetime) -> None:
    """
    Validate requested date range against Yahoo Finance limits for the specified interval.
    Raises RangeExceeded if duration exceeds allowed max days.
    """
    max_days = INTERVAL_MAX_DAYS.get(interval)
    if max_days is not None:
        duration_days = (end - start).total_seconds() / 86400.0
        if duration_days > max_days:
            raise RangeExceeded(interval=interval, max_days=max_days)
