"""Interface for the text-to-speech provider.

Kept separate from the conversation provider so the avatar's "voice"
(vendor, accent, latency characteristics) can be chosen independently of
which model decides what the avatar says.
"""

from abc import ABC, abstractmethod


class SpeechProvider(ABC):
    """Synthesizes spoken audio for a line of avatar dialogue."""

    @abstractmethod
    def synthesize(self, text: str) -> bytes:
        """Return audio bytes for the given text."""
        raise NotImplementedError
