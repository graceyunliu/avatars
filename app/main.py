"""FastAPI application entry point.

Phase 1 scope: this app only exposes a health check so we can confirm the
service boots and stays up. Session management, conversation routes, and
feedback generation are built in later phases.
"""

from fastapi import FastAPI

from app.core.config import get_settings
from app.core.logging import configure_logging

settings = get_settings()
configure_logging(settings.log_level)

app = FastAPI(title=settings.app_name)


@app.get("/health")
def health() -> dict[str, str]:
    """Liveness check used by deployment tooling and local smoke tests."""
    return {"status": "ok", "environment": settings.environment}
