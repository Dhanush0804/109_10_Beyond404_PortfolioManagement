from datetime import datetime, timezone, timedelta

def is_timezone_aware(dt: datetime) -> bool:
    """Check if datetime object is timezone-aware."""
    return dt.tzinfo is not None and dt.tzinfo.utcoffset(dt) is not None

def validate_start_before_end(start: datetime, end: datetime) -> None:
    """Ensure start datetime strictly precedes end datetime."""
    if start >= end:
        raise ValueError("start datetime must be before end datetime")

def validate_not_future(end: datetime, max_future_minutes: float = 5.0) -> None:
    """Ensure end datetime does not exceed current time by more than max_future_minutes."""
    now_utc = datetime.now(timezone.utc)
    end_utc = end.astimezone(timezone.utc) if is_timezone_aware(end) else end.replace(tzinfo=timezone.utc)
    if end_utc > now_utc + timedelta(minutes=max_future_minutes):
        raise ValueError("end datetime cannot be in the future by more than 5 minutes")

def format_iso8601(dt: datetime) -> str:
    """Format datetime object into ISO-8601 string."""
    return dt.isoformat()
