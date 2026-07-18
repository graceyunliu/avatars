"""External-service integrations, behind provider interfaces.

Each subpackage (conversation, transcription, speech) defines an
abstract interface plus a deterministic mock implementation. Real
providers (e.g. an LLM API, a speech-to-text API, a text-to-speech API)
are plugged in behind these interfaces in a later phase — the rest of
the app is written against the interface, not a specific vendor.
"""
