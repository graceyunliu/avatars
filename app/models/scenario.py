"""The Scenario data model — the blueprint for one practice role-play.

A "scenario" is everything the app needs to run one practice situation
end to end: who the learner is playing, who the AI avatar is, what the
learner is trying to accomplish, the phrases they can prepare with, the
step-by-step shape the conversation should take, how "success" is judged,
the real-world facts the avatar must get right, how the avatar should
help a struggling learner, and how the end-of-session feedback should be
written.

Product/content people (e.g. Grace) edit scenarios as JSON files in
scenarios/. This module is the strict schema those files are checked
against, so a typo or missing field is caught immediately instead of
causing confusing behavior later in a live conversation.
"""

from pydantic import BaseModel, Field


class PreparationPhrase(BaseModel):
    """One phrase the learner can rehearse before starting, German + English."""

    de: str
    en: str


class LearnerProfile(BaseModel):
    """Who the learner is playing in this role-play (their cover story)."""

    native_language: str
    nationality: str
    reason_for_move: str
    immigration_context: str


class Avatar(BaseModel):
    """The AI character the learner talks to, and how it should come across."""

    name: str
    role: str
    # Adjectives guiding the avatar's personality, e.g. "friendly", "patient".
    tone: list[str]


class ConversationStage(BaseModel):
    """One step in the conversation the avatar should walk the learner through.

    Stages are ordered and are meant to be handled one at a time — this is
    the backbone that later phases use to know "where we are" in the
    role-play and what the avatar should be asking about next.
    """

    order: int
    name: str
    description: str


class HelpRules(BaseModel):
    """How the avatar should support a learner who is stuck.

    These rules exist so a beginner never feels abandoned mid-conversation:
    there's always a next, gentler step (repeat slower, offer English,
    slow down permanently) rather than the avatar just repeating itself.
    """

    repeat: str
    english_help: str
    speak_slower: str
    # Safety valve: after this many attempts at the same question, the
    # avatar should accept its best guess and move on rather than drilling
    # the learner, which would feel discouraging.
    max_repetitions_same_question: int


class FeedbackRules(BaseModel):
    """How the end-of-session feedback summary should be written and scored.

    result_mapping keys are the number of success_criteria met ("3", "2",
    "0-1") mapped to the headline verdict shown to the learner — this is
    the pass/fail-free scoring logic for the mission.
    """

    tone: list[str]
    max_words: int
    sections: list[str]
    result_mapping: dict[str, str]


class Scenario(BaseModel):
    """A complete, ready-to-run practice scenario.

    This is the top-level object loaded from a scenarios/*.json file and
    validated against this schema before the app will use it.
    """

    id: str
    title: str
    location: str
    # BCP-47 language tags, e.g. "de-CH" for Swiss German, "en" for English.
    target_language: str
    feedback_language: str
    # CEFR proficiency level the scenario is written for (e.g. "A1").
    cefr_level: str

    learner_profile: LearnerProfile
    avatar: Avatar

    # The single goal the learner is trying to achieve in this role-play.
    mission: str
    learning_objectives: list[str]
    preparation_phrases: list[PreparationPhrase]
    conversation_stages: list[ConversationStage]

    # Plain-language checklist used to judge whether the mission succeeded.
    success_criteria: list[str]

    # Real-world facts the avatar must state correctly (fees, deadlines,
    # required documents) — these are not up for creative interpretation
    # by the conversation model, since getting them wrong could mislead
    # an actual newcomer relying on this for real-life prep.
    factual_constraints: list[str]

    help_rules: HelpRules
    feedback_rules: FeedbackRules

    estimated_duration_minutes: int = Field(gt=0)
