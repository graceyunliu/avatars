"""Application configuration.

All runtime settings (which environment we're running in, where scenario
and prompt files live, how verbose logging should be) are read from
environment variables so the same code can run locally, in CI, and later
in production without code changes. See .env.example for the full list
of variables a deployer can set.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Repository root, used to resolve default paths for scenarios/ and prompts/
# regardless of the current working directory the app is started from.
REPO_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Typed, validated application settings loaded from environment/.env."""

    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_", extra="ignore")

    app_name: str = "avatars-backend"
    environment: str = "development"
    log_level: str = "INFO"

    # Where scenario JSON files and prompt markdown files are stored.
    # Defaults point at the repo-level scenarios/ and prompts/ folders.
    scenarios_dir: Path = REPO_ROOT / "scenarios"
    prompts_dir: Path = REPO_ROOT / "prompts"


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (env vars are read once per process)."""
    return Settings()
