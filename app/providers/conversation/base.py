"""Interface for the conversation provider.

This is the seam between "the app" and "whatever generates the avatar's
next line" (a real LLM, later). Keeping it as an abstract interface now
means Phase 2 can add real stage-progression logic and swap in a real
model without the rest of the app needing to change.
"""

from abc import ABC, abstractmethod

from pydantic import BaseModel


class ConversationMessage(BaseModel):
    """One turn in the conversation transcript."""

    # "user" (the learner) or "assistant" (the avatar).
    role: str
    content: str


class ConversationProvider(ABC):
    """Produces the avatar's next reply given the conversation so far."""

    @abstractmethod
    def generate_reply(
        self, system_prompt: str, messages: list[ConversationMessage]
    ) -> str:
        """Return the avatar's next line of dialogue.

        system_prompt carries the avatar's character and rules (see
        prompts/zurich_registration_system.md); messages is the transcript
        so far, oldest first.
        """
        raise NotImplementedError
