# AVATARS design system · v0.1

*Jul 19. This document is the anchor for all UI work — human or AI-generated. If a screen can't be built from these rules plus the primitives in `lib/ui.js`, extend the system first, then build the screen. Paste the "AI prompt block" at the bottom into any generation tool to keep outputs on-system.*

## Principles

1. **One red.** Red means exactly three things: the brand, the user ("you"), and the primary action. Never decoration. If a screen has two red buttons, one of them is wrong.
2. **Calm over clutter.** Our user is a nervous beginner mid-conversation. Every element must earn its place; when in doubt, remove. Whitespace and hairlines, not boxes and shadows.
3. **Progress, not gamification.** No points, hearts, streaks, badges, or lives. The only progress display is the mission tick bar — real steps in a real task. Failure costs nothing; "run it again" is the tone.
4. **Chrome in English, content in German.** All UI text (buttons, labels, hints) is English. German appears only as learning content — and interactive German always has tap-to-hear.
5. **The tick bar is the spine.** The 8-tick mission bar appears on every screen (live progress, debrief recap). It is the product's signature element.
6. **Honest states.** Never show UI for capabilities that don't exist (no fake HD badges, camera buttons, staged comparisons). The turn indicator reflects real audio state.

## Tokens (`lib/theme.js`)

| Token | Value | Use |
|---|---|---|
| `red` | #A32D2D | Brand wordmark, user labels, primary buttons |
| `redBright` | #E24B4A | Current tick, your-turn strip border |
| `redBg` / `redDark` | #FCEBEB / #791F1F | Pale red fill + its text (your-turn strip) |
| `ink` | #1a1a18 | Primary text |
| `sub` | #5F5E5A | Secondary text, translations |
| `faint` | #9a9891 | Muted labels, hints |
| `line` | #e5e3dc | ALL borders — 1px, no other border styles |
| `paper` / `panel` | #ffffff / #f6f5f1 | Card surface / page background |
| `dark` / `darkSoft` | #2C2C2A / #444441 | Matteo's tile / self-view tile — nowhere else |
| `cream` | #F1EFE8 | Line art + text on dark |
| `green` | #3B6D11 | Success marks only, sparingly |

## Typography

System sans (Helvetica lineage). Weights 400/500/600 only (600 = wordmark only).
- Wordmark: 19px/600, tight tracking, red
- Screen title: 20px/500 ink
- Body/German lines: 14–15.5px/400
- Translations: 12.5px italic `sub` — always directly under their German
- Micro-labels: 11px/500 UPPERCASE, 0.08em tracking, `faint` (red only for mission-critical labels)
- Chrome text: 12–13px

## Primitives (`lib/ui.js`)

- `SectionLabel` — uppercase micro-label above any block
- `TickBar` — the mission spine; 26×4px ticks, done=red, current=redBright, todo=line
- `PhraseChip` — tap-to-hear German; the ONLY interactive German element
- `RedButton` — primary action, max ONE per screen
- `GhostButton` — everything else
- `Bold` — renders `**bold**` from LLM output
- `MatteoArt` — interim line art; lives only on `dark` tiles

## Patterns

- **Shell**: every screen lives in the same card — wordmark header left, context (scenario · step · timer) right, max-width 860, 14px radius, screens swap inside. Consistent height between sibling screens.
- **Structure by hairline**: divide with 1px `line` borders, not nested cards. No shadows, no gradients.
- **Speaker layout**: Matteo left-aligned, user right-aligned with red label. German 15.5px, translation under.
- **Dark tile**: reserved exclusively for the "video call" presence (Matteo + self-view). Never used as decoration.
- **Turn-taking**: pill on the tile ("Matteo is speaking" / "Your turn") + red strip in transcript when it's the user's turn. Driven by real audio events.

## Voice and copy

- Sentence case everywhere; no exclamation marks in chrome (feedback content may earn one).
- Encourage without lying: "Almost there" is honest; "Great job!" after a failed mission is not.
- Help-seeking is framed as skill, never failure ("Asking to repeat is a skill").
- Anxiety-reduction over cleverness: "Speaks slowly, happy to repeat" beats any tagline.
- Verbs first on buttons: "Start the session", "Practice again", "End session". "Session" is the product's word, not "call".
- No em dashes in UI copy. Use a period or a colon. "Almost there. You reached the documents step," never "Almost there — you reached the documents step."

## AI prompt block

Paste with any request to generation tools:

> Follow the AVATARS design system: Swiss-clean, white surfaces, 1px hairline borders (#e5e3dc), no shadows/gradients/cards-in-cards. One accent red #A32D2D used ONLY for brand, the user's speech labels, and a single primary button per screen. Dark tile #2C2C2A reserved for the avatar video presence. System sans, weights 400/500 only; uppercase 11px micro-labels with 0.08em tracking. UI chrome in English, German only as learning content with audio buttons. Progress = a bar of 26×4px ticks (done #A32D2D, current #E24B4A, todo #e5e3dc). No gamification (no points/hearts/streaks/badges). Tone: calm, encouraging, honest.

## Open items

- Real Matteo portrait (A5) — replaces `MatteoArt`; style brief lives in the character prompt (manga, young, crew-neck, red lanyard)
- Coach persona (parked) — will need its own identity within these rules
- Product name — "AVATARS · SPEAK SWISS" is placeholder
- Dark mode — not designed; do not improvise it
