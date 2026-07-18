"""Deterministic mock speech provider for tests and local dev."""

from app.providers.speech.base import SpeechProvider

# Placeholder "audio" — deterministic, non-empty, and cheap to assert on in tests.
MOCK_AUDIO_BYTES = b"MOCK_AUDIO"


class MockSpeechProvider(SpeechProvider):
    """Always returns the same canned audio bytes, regardless of text input."""

    def synthesize(self, text: str) -> bytes:
        return MOCK_AUDIO_BYTES
