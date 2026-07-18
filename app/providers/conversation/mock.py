"""Deterministic mock conversation provider.

Used in tests and local development before a real LLM is wired up. It
does not implement any stage-progression or scenario logic — that is
explicitly out of scope for Phase 1 — it just returns a fixed, predictable
reply so callers can exercise the rest of the system end to end.
"""

from app.providers.conversation.base import ConversationMessage, ConversationProvider

MOCK_REPLY = "Grüezi! Haben Sie einen Termin?"


class MockConversationProvider(ConversationProvider):
    """Always returns the same canned avatar reply, regardless of input."""

    def generate_reply(
        self, system_prompt: str, messages: list[ConversationMessage]
    ) -> str:
        return MOCK_REPLY
