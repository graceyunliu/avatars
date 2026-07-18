"""The scenario repository must load and validate the real scenario file."""

import pytest

from app.core.config import get_settings
from app.repositories.scenario_repository import (
    ScenarioNotFoundError,
    ScenarioRepository,
)


@pytest.fixture
def repository() -> ScenarioRepository:
    settings = get_settings()
    return ScenarioRepository(settings.scenarios_dir)


def test_loads_zurich_registration_scenario(repository: ScenarioRepository):
    scenario = repository.load("zurich_registration_a1")

    assert scenario.id == "zurich-registration-a1"
    assert scenario.title == "Registering at the Municipal Office"
    assert scenario.cefr_level == "A1"
    assert scenario.avatar.name == "Matteo"
    assert len(scenario.conversation_stages) == 8
    assert len(scenario.preparation_phrases) == 10
    assert scenario.help_rules.max_repetitions_same_question == 2
    assert scenario.feedback_rules.result_mapping["3"] == "Mission complete!"


def test_list_ids_includes_zurich_registration(repository: ScenarioRepository):
    assert "zurich_registration_a1" in repository.list_ids()


def test_unknown_scenario_id_raises(repository: ScenarioRepository):
    with pytest.raises(ScenarioNotFoundError):
        repository.load("does-not-exist")
