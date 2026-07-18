"""Interface for the speech-to-text (transcription) provider.

Separating this from the conversation provider means we can swap
transcription vendors independently of whichever model plays the avatar.
"""

from abc import ABC, abstractmethod


class TranscriptionProvider(ABC):
    """Converts learner speech audio into text the app can reason about."""

    @abstractmethod
    def transcribe(self, audio_bytes: bytes) -> str:
        """Return the transcribed text for the given audio."""
        raise NotImplementedError
