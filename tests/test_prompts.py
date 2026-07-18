"""The prompt files that drive the avatar and the feedback coach must load."""

from app.core.config import get_settings


def test_system_prompt_loads_and_mentions_matteo():
    settings = get_settings()
    path = settings.prompts_dir / "zurich_registration_system.md"
    text = path.read_text(encoding="utf-8")

    assert text.strip() != ""
    assert "Matteo" in text
    assert "Grüezi" in text


def test_session_summary_prompt_loads_and_has_expected_sections():
    settings = get_settings()
    path = settings.prompts_dir / "session_summary.md"
    text = path.read_text(encoding="utf-8")

    assert text.strip() != ""
    for heading in ["Mission result", "What you did well", "Three things to improve"]:
        assert heading in text
