# Avatars — AI Language Coach for Expats

An AI-avatar language-learning app that helps newly arrived expatriates
practise real-life situations — registering with the municipal office,
calling a landlord, visiting a doctor — through spoken role-play with an
AI avatar, followed by clear, encouraging feedback.

## MVP scope (staged build)

This backend is being built in phases. **Phase 1 (this state of the repo)**
is the repository foundation only:

- FastAPI project skeleton with a `/health` endpoint
- The `Scenario` data model and the first scenario content
  (`zurich_registration_a1` — registering at the Zurich municipal office)
- The avatar's system prompt and the session-summary (feedback) prompt
- Abstract interfaces for the three external services the app will need
  later (conversation, transcription, speech), each with a deterministic
  mock implementation so the app runs with no external API calls
- Tests covering the above

Not yet built (later phases): API routes beyond `/health`, session
management, real conversation/stage-progression logic, mission
evaluation, feedback generation, a frontend, voice integration, and
deployment tooling.

> Note: `demo-app/` is a separate, earlier Next.js prototype exploring the
> voice loop end to end. It is not part of this Python backend and is left
> as-is.

## Project layout

```
app/
  main.py                    FastAPI app, /health endpoint
  core/                      settings, logging
  models/scenario.py         Scenario Pydantic schema
  providers/                 conversation / transcription / speech interfaces + mocks
  repositories/               loads & validates scenario JSON files
scenarios/                   scenario content (JSON, validated against app/models/scenario.py)
prompts/                     avatar system prompt + session-summary prompt (Markdown)
tests/                       pytest suite
```

## Setup

Requires Python 3.11+.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
```

## Run

```bash
uvicorn app.main:app --reload
```

Then check `http://localhost:8000/health`.

## Test

```bash
pytest
```

All tests run offline against mock providers and local scenario/prompt
files — no external API calls or credentials are required.
