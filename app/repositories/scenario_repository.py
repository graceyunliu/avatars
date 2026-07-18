"""Loads scenario JSON files and validates them against the Scenario schema.

Scenarios are content, not code — Grace (or anyone on the team) can add a
new scenario by dropping a JSON file into scenarios/ following the same
shape as zurich_registration_a1.json. This repository is the one place
that reads those files, so validation errors are caught in one spot
rather than wherever a scenario happens to be used.
"""

import json
from pathlib import Path

from pydantic import ValidationError

from app.models.scenario import Scenario


class ScenarioNotFoundError(Exception):
    """Raised when no scenario file matches the requested id."""


class ScenarioValidationError(Exception):
    """Raised when a scenario file's content doesn't match the schema."""


class ScenarioRepository:
    """Reads scenario JSON files from a directory and validates them."""

    def __init__(self, scenarios_dir: Path) -> None:
        self._scenarios_dir = scenarios_dir

    def load(self, scenario_id: str) -> Scenario:
        """Load and validate a scenario by its id (its JSON filename stem)."""
        path = self._scenarios_dir / f"{scenario_id}.json"
        if not path.is_file():
            raise ScenarioNotFoundError(f"No scenario file found for id '{scenario_id}'")

        raw = json.loads(path.read_text(encoding="utf-8"))
        try:
            return Scenario.model_validate(raw)
        except ValidationError as exc:
            raise ScenarioValidationError(
                f"Scenario file '{path.name}' failed validation: {exc}"
            ) from exc

    def list_ids(self) -> list[str]:
        """Return the ids of all scenario files available in the directory."""
        return sorted(p.stem for p in self._scenarios_dir.glob("*.json"))
