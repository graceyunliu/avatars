"""Deterministic mock transcription provider for tests and local dev."""

from app.providers.transcription.base import TranscriptionProvider

MOCK_TRANSCRIPT = "Ich möchte mich anmelden."


class MockTranscriptionProvider(TranscriptionProvider):
    """Always returns the same canned transcript, regardless of audio input."""

    def transcribe(self, audio_bytes: bytes) -> str:
        return MOCK_TRANSCRIPT
