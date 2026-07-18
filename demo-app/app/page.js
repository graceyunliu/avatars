"use client";

import { useEffect, useRef, useState } from "react";
import { SCENARIO } from "../lib/scenario";

// ---- Tap-to-hear: OpenAI TTS via /api/tts, cached per phrase after first play.
// (Browser speechSynthesis was tried first and rejected — too robotic for German.)
const audioCache = new Map(); // text -> object URL (or in-flight Promise)
let currentAudio = null;
let playSeq = 0; // guards against overlapping plays: latest click wins

// Fetch (or reuse) the audio for a phrase without playing it
async function getAudioUrl(text) {
  if (audioCache.has(text)) return audioCache.get(text);
  const promise = (async () => {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("TTS failed");
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  })();
  audioCache.set(text, promise); // cache the promise so double-clicks share one fetch
  const url = await promise;
  audioCache.set(text, url);
  return url;
}

async function speak(text) {
  const seq = ++playSeq; // this click is now the only one allowed to play
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  try {
    const url = await getAudioUrl(text);
    if (seq !== playSeq) return; // a newer click happened while we were loading — stay silent
    currentAudio = new Audio(url);
    currentAudio.play();
  } catch (e) {
    console.error(e);
  }
}

// Warm the cache in the background so taps feel instant
async function prefetchAudio(items) {
  for (const item of items) {
    try {
      await getAudioUrl(item.de);
    } catch {
      // non-fatal: the phrase will just load on first tap instead
    }
  }
}

function PhraseRow({ de, en, compact }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: compact ? "6px 0" : "8px 0",
        borderBottom: "1px solid #eef0f3",
      }}
    >
      <button
        onClick={() => speak(de)}
        aria-label={`Listen: ${de}`}
        style={{
          border: "1px solid #d6dae1",
          background: "#fff",
          borderRadius: 8,
          padding: "4px 10px",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        🔊
      </button>
      <div>
        <div style={{ fontSize: compact ? 14 : 16 }}>{de}</div>
        <div style={{ fontSize: 12.5, color: "#667", fontStyle: "italic" }}>{en}</div>
      </div>
    </div>
  );
}

// ---- Prep screen (tracker task B8): learn BEFORE you practice ----
function PrepScreen({ onStart, connecting }) {
  const [showVocab, setShowVocab] = useState(false);

  // Pre-generate all phrase audio in the background (one at a time) so
  // tap-to-hear is instant by the time the learner starts tapping.
  useEffect(() => {
    prefetchAudio([...SCENARIO.listeningCues, ...SCENARIO.phrases, ...SCENARIO.vocabulary]);
  }, []);
  return (
    <div>
      <div style={card()}>
        <div style={{ fontSize: 13, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>
          Your mission
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 16, lineHeight: 1.5 }}>{SCENARIO.mission}</p>
      </div>

      <div style={card()}>
        <h3 style={h3()}>👂 The clerk will ask you…</h3>
        <p style={hint()}>Listen to each one so you recognize it when you hear it.</p>
        {SCENARIO.listeningCues.map((c) => (
          <PhraseRow key={c.de} de={c.de} en={c.en} />
        ))}
      </div>

      <div style={card()}>
        <h3 style={h3()}>🗣 Phrases you can use</h3>
        <p style={hint()}>
          Tap 🔊, then say each phrase out loud at least once. Two minutes here makes the
          conversation ten times easier.
        </p>
        {SCENARIO.phrases.map((p) => (
          <PhraseRow key={p.de} de={p.de} en={p.en} />
        ))}
      </div>

      <div style={card()}>
        <button
          onClick={() => setShowVocab(!showVocab)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 15,
            padding: 0,
            color: "#2563eb",
          }}
        >
          {showVocab ? "▾ Hide" : "▸ Show"} words to know ({SCENARIO.vocabulary.length})
        </button>
        {showVocab &&
          SCENARIO.vocabulary.map((v) => <PhraseRow key={v.de} de={v.de} en={v.en} compact />)}
      </div>

      <button onClick={onStart} disabled={connecting} style={btnStyle("#2563eb")}>
        {connecting ? "Connecting…" : "I'm ready — start the conversation ▶"}
      </button>
      <p style={{ fontSize: 12.5, color: "#889", marginTop: 8 }}>
        Stuck during the conversation? Say &quot;I don&apos;t understand&quot; —{" "}
        {SCENARIO.avatarName} will help. The phrase list stays available.
      </p>
    </div>
  );
}

// Renders the summary's simple markdown (**headings**, bullets) without a library
function SummaryText({ text }) {
  const bold = (s) =>
    s.split("**").map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
  return (
    <div>
      {text.split("\n").map((line, i) => {
        const t = line.trim();
        if (!t) return null;
        const heading = t.match(/^\*\*(.+?)\*\*$/);
        if (heading)
          return (
            <h3 key={i} style={{ fontSize: 15.5, margin: "14px 0 4px", color: "#1e293b" }}>
              {heading[1]}
            </h3>
          );
        if (t.startsWith("- ") || t.startsWith("* "))
          return (
            <div key={i} style={{ display: "flex", gap: 8, margin: "4px 0" }}>
              <span>•</span>
              <span>{bold(t.slice(2))}</span>
            </div>
          );
        return (
          <p key={i} style={{ margin: "4px 0", lineHeight: 1.5 }}>
            {bold(t)}
          </p>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [phase, setPhase] = useState("prep"); // prep | connecting | live | ended | error
  const [lines, setLines] = useState([]); // {id, role, de, en}
  const [showPhrases, setShowPhrases] = useState(false); // in-conversation phrase panel
  const [summary, setSummary] = useState(null); // null | "loading" | "failed" | text
  const [coachNote, setCoachNote] = useState(null); // Matteo's audio-based impression
  const pcRef = useRef(null);
  const micRef = useRef(null);
  const audioRef = useRef(null);
  const dcRef = useRef(null);
  const coachWaiter = useRef(null); // resolver for the out-of-band coach response
  const nextId = useRef(1);
  const linesRef = useRef([]); // mirror of lines, readable inside stop()

  async function addLine(role, text) {
    if (!text || !text.trim()) return;
    const id = nextId.current++;
    linesRef.current = [...linesRef.current, { role, de: text.trim() }];
    setLines((prev) => [...prev, { id, role, de: text.trim(), en: "…" }]);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const { translation } = await res.json();
      setLines((prev) => prev.map((l) => (l.id === id ? { ...l, en: translation } : l)));
    } catch {
      setLines((prev) => prev.map((l) => (l.id === id ? { ...l, en: "" } : l)));
    }
  }

  async function start() {
    setPhase("connecting");
    setLines([]);
    try {
      const tokenResponse = await fetch("/api/token");
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.value;
      if (!EPHEMERAL_KEY) throw new Error("No token: " + JSON.stringify(data));

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioRef.current = audioEl;
      pc.ontrack = (e) => (audioEl.srcObject = e.streams[0]);

      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      micRef.current = ms;
      pc.addTrack(ms.getTracks()[0]);

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;
      dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        console.log(event.type, event); // dev logging — remove before demo day
        if (event.type === "conversation.item.input_audio_transcription.completed") {
          addLine("user", event.transcript);
        }
        if (event.type === "response.output_audio_transcript.done") {
          addLine("assistant", event.transcript);
        }
        // Out-of-band coach response (audio-based pronunciation impression)
        if (event.type === "response.done" && event.response?.metadata?.topic === "coach") {
          const item = event.response.output?.[0];
          const text =
            item?.content?.map((c) => c.text || c.transcript || "").join(" ").trim() || null;
          coachWaiter.current?.(text);
        }
      });
      dc.addEventListener("open", () => {
        setPhase("live");
        dc.send(JSON.stringify({ type: "response.create" }));
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });
      const answer = { type: "answer", sdp: await sdpResponse.text() };
      await pc.setRemoteDescription(answer);
    } catch (err) {
      console.error(err);
      setPhase("error");
    }
  }

  async function stop() {
    setPhase("ended");

    // 1. Before hanging up: ask Matteo (out-of-band, text-only, fail-soft)
    //    what he HEARD — he has the actual audio in his session context.
    //    The role-play conversation is not affected.
    try {
      if (dcRef.current?.readyState === "open") {
        const note = await Promise.race([
          new Promise((resolve) => {
            coachWaiter.current = resolve;
            dcRef.current.send(
              JSON.stringify({
                type: "response.create",
                response: {
                  conversation: "none",
                  metadata: { topic: "coach" },
                  output_modalities: ["text"],
                  instructions:
                    "Stop role-playing for this one response. You are a language coach reviewing the learner's spoken German from the ENTIRE conversation you just had — every one of their turns from greeting to goodbye, not just the last thing they said. Based on their actual pronunciation across the whole session: in English, max 60 words, name 1-2 specific German words or sounds that gave them the most trouble (with a simple tip each), and 1 thing they pronounced well. Be concrete and encouraging. If you truly heard too little speech across the whole conversation, say so honestly.",
                },
              })
            );
          }),
          new Promise((resolve) => setTimeout(() => resolve(null), 8000)), // fail-soft timeout
        ]);
        if (note) setCoachNote(note);
      }
    } catch (e) {
      console.error("Coach note failed (non-fatal):", e);
    }

    // 2. Now hang up
    micRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
    dcRef.current = null;

    // Generate the session summary (task B4) from the transcript
    const transcript = linesRef.current.map((l) => `${l.role}: ${l.de}`).join("\n");
    if (!transcript) return;
    setSummary("loading");
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      setSummary(data.summary || "failed");
    } catch {
      setSummary("failed");
    }
  }

  function reset() {
    setLines([]);
    linesRef.current = [];
    setSummary(null);
    setCoachNote(null);
    setPhase("prep");
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>🇨🇭 {SCENARIO.title}</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        Role-play with {SCENARIO.avatarName}, {SCENARIO.avatarRole.toLowerCase()}. A1 German.
      </p>

      {phase === "prep" || phase === "connecting" ? (
        <PrepScreen onStart={start} connecting={phase === "connecting"} />
      ) : (
        <>
          {phase === "live" ? (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={stop} style={btnStyle("#dc2626")}>
                ■ End conversation
              </button>
              <button onClick={() => setShowPhrases(!showPhrases)} style={btnStyle("#64748b")}>
                {showPhrases ? "Hide phrases" : "📋 Phrases"}
              </button>
            </div>
          ) : (
            <>
              {summary === "loading" && (
                <div style={card()}>
                  <p style={{ margin: 0, color: "#667" }}>
                    ✍️ Matteo is writing your feedback…
                  </p>
                </div>
              )}
              {summary === "failed" && (
                <div style={card()}>
                  <p style={{ margin: 0, color: "#b45309" }}>
                    Couldn&apos;t generate feedback this time — your transcript is below.
                  </p>
                </div>
              )}
              {coachNote && (
                <div style={{ ...card(), background: "#eff6ff", borderColor: "#bfdbfe" }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#1e40af",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}
                  >
                    🎧 What Matteo heard
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.5 }}>{coachNote}</p>
                </div>
              )}
              {summary && summary !== "loading" && summary !== "failed" && (
                <div style={{ ...card(), background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#166534",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}
                  >
                    Your session feedback
                  </div>
                  <SummaryText text={summary} />
                </div>
              )}
              <button onClick={reset} style={btnStyle("#2563eb")}>
                ↻ Practice again
              </button>
            </>
          )}

          {showPhrases && phase === "live" && (
            <div style={{ ...card(), marginTop: 12, maxHeight: 220, overflowY: "auto" }}>
              {SCENARIO.phrases.map((p) => (
                <PhraseRow key={p.de} de={p.de} en={p.en} compact />
              ))}
            </div>
          )}

          {phase === "error" && (
            <p style={{ color: "#dc2626" }}>
              Something went wrong — check the browser console and that your API key is set in
              .env.local.
            </p>
          )}

          <div style={{ marginTop: 20 }}>
            {lines.map((l) => (
              <div
                key={l.id}
                style={{
                  background: l.role === "assistant" ? "#fff" : "#e8f0fe",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 10,
                }}
              >
                <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>
                  {l.role === "assistant" ? SCENARIO.avatarName : "You"}
                </div>
                <div style={{ fontSize: 16 }}>{l.de}</div>
                <div style={{ fontSize: 13, color: "#667", marginTop: 4, fontStyle: "italic" }}>
                  {l.en}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function card() {
  return {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "14px 18px",
    marginBottom: 14,
  };
}
function h3() {
  return { margin: "0 0 2px", fontSize: 16 };
}
function hint() {
  return { margin: "0 0 8px", fontSize: 13, color: "#778" };
}
function btnStyle(color) {
  return {
    background: color,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "12px 24px",
    fontSize: 16,
    cursor: "pointer",
  };
}
