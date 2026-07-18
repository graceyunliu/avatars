"""Mock providers must be deterministic so tests never depend on a real API."""

from app.providers.conversation.mock import MOCK_REPLY, MockConversationProvider
from app.providers.speech.mock import MOCK_AUDIO_BYTES, MockSpeechProvider
from app.providers.transcription.mock import (
    MOCK_TRANSCRIPT,
    MockTranscriptionProvider,
)


def test_mock_conversation_provider_is_deterministic():
    provider = MockConversationProvider()
    assert provider.generate_reply("any system prompt", []) == MOCK_REPLY
    assert provider.generate_reply("different prompt", []) == MOCK_REPLY


def test_mock_transcription_provider_is_deterministic():
    provider = MockTranscriptionProvider()
    assert provider.transcribe(b"anything") == MOCK_TRANSCRIPT


def test_mock_speech_provider_is_deterministic():
    provider = MockSpeechProvider()
    assert provider.synthesize("any text") == MOCK_AUDIO_BYTES
