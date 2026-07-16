# Anmeldung Practice — Demo App (Walking Skeleton)

Voice role-play with Matteo, the Zurich registration clerk. OpenAI Realtime (speech-to-speech) + Next.js, deployable to Vercel.

**What works in this skeleton (tracker task B2 + part of B3):** start button → live German voice conversation → transcript with English translation under each line → end button.
**Not yet built:** prep screen (B8), avatar portrait (A5/B3), session summary screen (B4), help buttons (B5).

## Run locally

1. Install [Node.js](https://nodejs.org) (LTS) if you don't have it: `node -v` to check.
2. In this folder:
   ```
   npm install
   cp .env.example .env.local
   ```
3. Open `.env.local` and paste your real OpenAI API key (same account you used for the playground).
4. ```
   npm run dev
   ```
5. Open http://localhost:3000, click **Start conversation**, allow the microphone. Matteo greets you first.

## Deploy to Vercel

1. Push this `demo-app` folder to your GitHub repo (it can live as a subfolder).
2. In Vercel: **Add New → Project → import the repo**. If demo-app is a subfolder, set **Root Directory** to `demo-app`.
3. In the project's **Settings → Environment Variables**, add `OPENAI_API_KEY` with your key.
4. Deploy. The mic requires HTTPS — Vercel gives you that automatically.

## How it's wired

- `lib/prompt.js` — Matteo's system prompt (v0.3). Single source of truth for behavior; keep in sync with the .md doc in Drive.
- `app/api/token/route.js` — server-side: exchanges our real API key for a short-lived browser token (`/v1/realtime/client_secrets`). The real key never reaches the browser.
- `app/page.js` — browser: WebRTC connection to OpenAI (`/v1/realtime/calls`), mic in, Matteo's voice out, transcripts via the data channel.
- `app/api/translate/route.js` — one cheap LLM call per line for the English translation.

## Debugging notes

- Every Realtime event is logged to the browser console (F12) — if transcripts don't appear, look there for event names and errors. Remove the console.log before demo day.
- If the learner transcript is missing but Matteo's works: the input transcription config in `app/api/token/route.js` is the thing to check against the current OpenAI docs.
- Costs: each conversation ≈ $0.04–0.11/min (measured). Watch usage at platform.openai.com/usage.
