"use client";

// AVATARS design system — reusable primitives.
// Rules and rationale: see DESIGN.md. Tokens: lib/theme.js.
// New screens should compose from these instead of restyling by hand.

import { T, font } from "./theme";
import { speak } from "./audio";

// Uppercase micro-label above any content block. Red only for mission-critical labels.
export function SectionLabel({ children, color = T.faint }) {
  return (
    <p style={{ margin: "0 0 6px", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color, fontWeight: 500 }}>
      {children}
    </p>
  );
}

// The mission progress motif — appears on every screen. current is 1-based.
export function TickBar({ current, total = 8, label }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 26,
            height: 4,
            borderRadius: 2,
            background: i < current - 1 ? T.red : i === current - 1 ? T.redBright : T.line,
          }}
        />
      ))}
      {label && <span style={{ marginLeft: 8, fontSize: 12, color: T.sub }}>{label}</span>}
    </div>
  );
}

// A German phrase you can tap to hear. The ONLY interactive German element.
export function PhraseChip({ de }) {
  return (
    <button
      onClick={() => speak(de)}
      style={{
        fontSize: 12.5,
        padding: "6px 12px",
        borderRadius: 8,
        border: `1px solid ${T.line}`,
        background: T.paper,
        color: T.ink,
        cursor: "pointer",
        fontFamily: font,
      }}
    >
      🔊 {de}
    </button>
  );
}

// Primary action. MAX ONE per screen — the one-red rule.
export function RedButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontSize: 14,
        background: disabled ? T.faint : T.red,
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "10px 22px",
        cursor: disabled ? "default" : "pointer",
        fontFamily: font,
      }}
    >
      {children}
    </button>
  );
}

// Secondary action. Use freely.
export function GhostButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 13,
        background: T.paper,
        color: T.ink,
        border: `1px solid ${T.line}`,
        borderRadius: 8,
        padding: "8px 16px",
        cursor: "pointer",
        fontFamily: font,
      }}
    >
      {children}
    </button>
  );
}

// Inline **bold** renderer for LLM-generated text.
export function Bold({ text }) {
  const parts = String(text).split("**");
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <strong key={i} style={{ fontWeight: 500 }}>{p}</strong> : p))}
    </>
  );
}

// Matteo line art (interim — replaced by real portrait when A5 lands).
// Always sits on the dark tile (T.dark), drawn in cream.
export function MatteoArt({ size = 150 }) {
  return (
    <svg viewBox="0 0 120 150" width={size} height={size * 1.25} role="img" aria-label="Matteo">
      <path d="M 38 38 Q 36 16 60 14 Q 84 16 82 38 Q 86 36 85 44 Q 84 50 80 50" fill="none" stroke={T.cream} strokeWidth="2.5" />
      <path d="M 38 38 Q 34 36 35 44 Q 36 50 40 50" fill="none" stroke={T.cream} strokeWidth="2.5" />
      <path d="M 40 50 Q 42 66 60 68 Q 78 66 80 50 L 80 40 Q 78 42 72 40" fill="none" stroke={T.cream} strokeWidth="2.5" />
      <path d="M 42 20 Q 50 12 62 16 Q 74 12 80 22 Q 74 18 66 20 Q 56 14 48 20 Q 44 20 42 20" fill={T.cream} />
      <circle cx="51" cy="42" r="2.2" fill={T.cream} />
      <circle cx="69" cy="42" r="2.2" fill={T.cream} />
      <path d="M 52 56 Q 60 61 68 56" fill="none" stroke={T.cream} strokeWidth="2.2" />
      <path d="M 60 68 L 60 78" stroke={T.cream} strokeWidth="2.5" />
      <path d="M 30 110 Q 32 84 60 82 Q 88 84 90 110 L 90 120 L 30 120 Z" fill="none" stroke={T.cream} strokeWidth="2.5" />
      <path d="M 48 84 Q 60 92 72 84" fill="none" stroke={T.cream} strokeWidth="2.2" />
    </svg>
  );
}
