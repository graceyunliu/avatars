"""The Scenario schema must accept well-formed data and reject bad data."""

import pytest
from pydantic import ValidationError

from app.models.scenario import Scenario

MINIMAL_VALID_SCENARIO = {
    "id": "test-scenario",
    "title": "Test Scenario",
    "location": "Test City",
    "target_language": "de-CH",
    "feedback_language": "en",
    "cefr_level": "A1",
    "learner_profile": {
        "native_language": "English",
        "nationality": "American",
        "reason_for_move": "Work",
        "immigration_context": "Non-EU/EFTA",
    },
    "avatar": {"name": "Matteo", "role": "Clerk", "tone": ["friendly"]},
    "mission": "Do the thing.",
    "learning_objectives": ["Say hello"],
    "preparation_phrases": [{"de": "Hallo", "en": "Hello"}],
    "conversation_stages": [
        {"order": 1, "name": "greeting", "description": "Say hello."}
    ],
    "success_criteria": ["Learner said hello"],
    "factual_constraints": ["Nothing costs anything"],
    "help_rules": {
        "repeat": "Repeat slower.",
        "english_help": "Offer English once.",
        "speak_slower": "Slow down if asked.",
        "max_repetitions_same_question": 2,
    },
    "feedback_rules": {
        "tone": ["warm"],
        "max_words": 100,
        "sections": ["Mission result"],
        "result_mapping": {"3": "Mission complete!"},
    },
    "estimated_duration_minutes": 2,
}


def test_minimal_valid_scenario_parses():
    scenario = Scenario.model_validate(MINIMAL_VALID_SCENARIO)
    assert scenario.id == "test-scenario"
    assert scenario.conversation_stages[0].order == 1
    assert scenario.preparation_phrases[0].de == "Hallo"


def test_missing_required_field_is_rejected():
    broken = dict(MINIMAL_VALID_SCENARIO)
    del broken["mission"]
    with pytest.raises(ValidationError):
        Scenario.model_validate(broken)


def test_wrong_type_for_nested_field_is_rejected():
    broken = json_copy(MINIMAL_VALID_SCENARIO)
    # conversation_stages entries must have an int order, not a string.
    broken["conversation_stages"][0]["order"] = "one"
    with pytest.raises(ValidationError):
        Scenario.model_validate(broken)


def json_copy(data: dict) -> dict:
    import copy

    return copy.deepcopy(data)
