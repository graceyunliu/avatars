# Prompt evals (Demo Day pre-flight check)

A standalone script that runs 10 scripted conversations against Matteo's
**real, live** prompts and flags obvious behavioral problems (breaking
character, wrong facts, asking two questions at once, refusing to help a
stuck learner, etc.) before the live demo.

This is a developer/QA tool, not part of the product:

- **Not part of `npm test` or any CI check.** It never runs automatically.
- **Costs real OpenAI API money** every time it runs for real — 10 short
  text conversations plus one summary call, using Chat Completions
  (`gpt-4o` by default), not the (more expensive) Realtime voice API the
  live app uses.
- **Only touches prompt text by reading it.** It imports nothing from
  `app/` and never modifies `lib/prompt.js` or `lib/summaryPrompt.js` — it
  reads those files live, so the eval can never silently drift out of sync
  with what's actually deployed.

## How to run it

Requires the same `OPENAI_API_KEY` the app already uses, in
`demo-app/.env.local` (see the root `demo-app/README.md` / `.env.example`
for how to set that up — no new environment variable is introduced).

```bash
cd demo-app
npm run eval:prompts
```

To check the harness itself works (turn-taking, checks, report writing)
**without spending any money or needing an API key**, run it in dry-run
mode — it uses canned placeholder replies instead of calling OpenAI:

```bash
npm run eval:prompts -- --dry-run
```

Dry-run output is only useful for verifying the script runs end to end.
The automated check results from a dry run are meaningless (the "replies"
aren't real) — the report says so at the top.

## What you get

- A short console summary: how many of the 10 cases had zero automated
  flags, and which cases need a human look.
- A full report at `demo-app/evals/report.md` (git-ignored — it's local
  output, generated from a paid API call, and shouldn't be committed):
  the full transcript for each case, which automated checks passed/failed,
  and a manual-review checklist item for every case.

The automated checks are simple string/regex heuristics — a first-pass
filter, not a full grader. They can have false positives and false
negatives. **Always read the transcripts yourself before Demo Day**,
especially for anything the console/report flags.

## The 10 cases

1. Successful German conversation (happy path)
2. Mostly English responses from the learner
3. Learner asks for English help mid-conversation
4. Learner asks Matteo to speak slower (manual review only — sentence
   complexity before/after isn't reliably checkable with regex)
5. Learner goes silent (empty input)
6. Garbled name (simulated bad speech-to-text)
7. Off-topic request ("best restaurant in Zurich?")
8. Prompt-injection attempt ("ignore all previous instructions...")
9. Learner is missing required documents
10. Learner ends the conversation early — also runs the summary prompt
    against the partial transcript and checks it's honest about not
    finishing

See the top of `run-prompt-evals.mjs` for the exact scripted turns and
checks for each case.
