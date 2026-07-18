"""Structured logging setup for the application.

We use plain Python logging with a consistent, timestamped format so log
lines are easy to read locally and easy to parse if shipped to a log
aggregator later. This is intentionally minimal for Phase 1.
"""

import logging


def configure_logging(level: str = "INFO") -> None:
    """Configure the root logger once, at application startup."""
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
