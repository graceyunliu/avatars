"use client";

import { useEffect, useRef, useState } from "react";
import { SCENARIO } from "../lib/scenario";
import { STAGES, detectStage } from "../lib/stages";
import { T, font } from "../lib/theme";
import { speak, prefetchAudio } from "../lib/audio";
import { SectionLabel, TickBar, PhraseChip, RedButton, GhostButton, Bold, MatteoArt } from "../lib/ui";

// ---- Summary parsing: A4 prompt emits fixed **headings**; render them as cards
function parseSummary(text) {
  const sections = {};
  let current = null;
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const h = line.match(/^\*\*(.+?)\*\*$/);
    if (h) {
      current = h[1];
      sections[current] = [];
    } else if (current && line) {
      sections[current].push(line.replace(/^[-*]\s*/, ""));
    }
  }
  return sections;
}

// ---- Prep screen
function PrepScreen({ onStart, connecting }) {
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    prefetchAudio([...SCENARIO.listeningCues, ...SCENARIO.phrases, ...SCENARIO.vocabulary]);
  }, []);

  const shownPhrases = showAll ? SCENARIO.phrases : SCENARIO.phrases.slice(0, 5);

  return (
    <>
      <div style={{ padding: "20px 18px 14px" }}>
        <SectionLabel color={T.red}>Your mission</SectionLabel>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: T.ink }}>{SCENARIO.title}</h2>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: T.sub, lineHeight: 1.5, maxWidth: 540 }}>
          {SCENARIO.mission}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", borderTop: `1px solid ${T.line}` }}>
        <div style={{ padding: "14px 18px", borderRight: `1px solid ${T.line}` }}>
          <SectionLabel>You&apos;ll meet</SectionLabel>
          <div style={{ background: T.dark, borderRadius: 10, height: 130, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MatteoArt size={80} />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 500, color: T.ink }}>{SCENARIO.avatarName}</p>
          <p style={{ margin: 0, fontSize: 12, color: T.sub, lineHeight: 1.4 }}>
            {SCENARIO.avatarRole}. Speaks slowly, happy to repeat.
          </p>
        </div>

        <div>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.line}` }}>
            <SectionLabel>He will ask you</SectionLabel>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SCENARIO.listeningCues.map((c) => (
                <PhraseChip key={c.de} de={c.de} />
              ))}
            </div>
          </div>
          <div style={{ padding: "14px 18px" }}>
            <SectionLabel>Phrases to practice out loud</SectionLabel>
            <p style={{ margin: "0 0 10px", fontSize: 12.5, color: T.sub }}>
              Tap to hear, then say each one at least once. Two minutes here makes the session ten times easier.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 18px" }}>
              {shownPhrases.map((p) => (
                <div
                  key={p.de}
                  onClick={() => speak(p.de)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${T.line}`, cursor: "pointer" }}
                >
                  <span style={{ fontSize: 13.5, color: T.ink }}>
                    {p.de}
                    <br />
                    <span style={{ fontSize: 11.5, color: T.faint, fontStyle: "italic" }}>{p.en}</span>
                  </span>
                  <span style={{ color: T.red, fontSize: 13 }}>🔊</span>
                </div>
              ))}
              {showAll &&
                SCENARIO.vocabulary.map((v) => (
                  <div
                    key={v.de}
                    onClick={() => speak(v.de)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${T.line}`, cursor: "pointer" }}
                  >
                    <span style={{ fontSize: 13.5, color: T.ink }}>
                      {v.de}
                      <br />
                      <span style={{ fontSize: 11.5, color: T.faint, fontStyle: "italic" }}>{v.en}</span>
                    </span>
                    <span style={{ color: T.red, fontSize: 13 }}>🔊</span>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setShowAll(!showAll)}
              style={{ marginTop: 8, fontSize: 12, color: T.sub, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: font }}
            >
              {showAll ? "Show less ▴" : `Show all ${SCENARIO.phrases.length} phrases + ${SCENARIO.vocabulary.length} words ▾`}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderTop: `1px solid ${T.line}` }}>
        <span style={{ fontSize: 12, color: T.faint }}>
          Say &quot;I don&apos;t understand&quot; any time — {SCENARIO.avatarName} will help
        </span>
        <RedButton onClick={onStart} disabled={connecting}>
          {connecting ? "Connecting…" : "I'm ready — start the session"}
        </RedButton>
      </div>
    </>
  );
}

// ---- Main
export default function Home() {
  const [phase, setPhase] = useState("prep"); // prep | connecting | live | ended | error
  const [lines, setLines] = useState([]);
  const [summary, setSummary] = useState(null); // null | "loading" | "failed" | text
  const [coachNote, setCoachNote] = useState(null);
  const [stage, setStage] = useState(1);
  const [matteoSpeaking, setMatteoSpeaking] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  const pcRef = useRef(null);
  const micRef = useRef(null);
  const audioRef = useRef(null);
  const dcRef = useRef(null);
  const coachWaiter = useRef(null);
  const nextId = useRef(1);
  const linesRef = useRef([]);
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  async function addLine(role, text) {
    if (!text || !text.trim()) return;
    const id = nextId.current++;
    linesRef.current = [...linesRef.current, { role, de: text.trim() }];
    setLines((prev) => [...prev, { id, role, de: text.trim(), en: "…" }]);
    if (role === "assistant") {
      const s = detectStage(text);
      if (s) setStage((prev) => Math.max(prev, s));
    }
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
    linesRef.current = [];
    setStage(1);
    setSeconds(0);
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
        console.log(event.type, event);
        if (event.type === "conversation.item.input_audio_transcription.completed") {
          addLine("user", event.transcript);
        }
        if (event.type === "response.output_audio_transcript.done") {
          addLine("assistant", event.transcript);
        }
        if (event.type === "output_audio_buffer.started") setMatteoSpeaking(true);
        if (event.type === "output_audio_buffer.stopped" || event.type === "output_audio_buffer.cleared") {
          setMatteoSpeaking(false);
        }
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
          new Promise((resolve) => setTimeout(() => resolve(null), 8000)),
        ]);
        if (note) setCoachNote(note);
      }
    } catch (e) {
      console.error("Coach note failed (non-fatal):", e);
    }

    micRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
    dcRef.current = null;
    setMatteoSpeaking(false);

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
    setStage(1);
    setSeconds(0);
    setShowTranscript(false);
    setPhase("prep");
  }

  let sections = summary && summary !== "loading" && summary !== "failed" ? parseSummary(summary) : null;
  const parseWorked = sections && Object.keys(sections).length >= 3;
  if (sections && !parseWorked) sections = null; // fall back to raw rendering below
  const verdict = sections?.["Mission result"]?.join(" ") || "";

  const headerRight =
    phase === "live" ? (
      <span style={{ fontSize: 12, color: T.faint }}>
        Anmeldung · step {stage} of 8 · <span style={{ color: T.red }}>● live {mmss}</span>
      </span>
    ) : phase === "ended" ? (
      <span style={{ fontSize: 12, color: T.faint }}>Anmeldung · {mmss}</span>
    ) : (
      <span style={{ fontSize: 12, color: T.faint }}>Scenario 1 of 10 · A1</span>
    );

  return (
    <main style={{ fontFamily: font, background: T.panel, minHeight: "100vh", padding: 18 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", background: T.paper, border: `1px solid ${T.line}`, borderRadius: 14, overflow: "hidden" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${T.line}` }}>
          <span style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: T.red }}>
            AVATARS
            <span style={{ color: T.faint, fontWeight: 400, fontSize: 12, letterSpacing: "0.06em" }}> · SPEAK SWISS</span>
          </span>
          {headerRight}
        </div>

        {(phase === "prep" || phase === "connecting") && (
          <PrepScreen onStart={start} connecting={phase === "connecting"} />
        )}

        {phase === "error" && (
          <div style={{ padding: 18 }}>
            <p style={{ color: T.red, fontSize: 14 }}>
              Something went wrong — check the browser console and that your API key is set in .env.local.
            </p>
            <GhostButton onClick={reset}>Back</GhostButton>
          </div>
        )}

        {phase === "live" && (
          <div style={{ display: "grid", gridTemplateColumns: "230px 1fr" }}>
            <div style={{ position: "relative", background: T.dark, minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MatteoArt size={140} />
              <div style={{ position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.cream, background: "rgba(255,255,255,0.12)", padding: "4px 10px", borderRadius: 999 }}>
                {matteoSpeaking ? "🔊 Matteo is speaking" : "🎙 Your turn"}
              </div>
              <div style={{ position: "absolute", bottom: 12, left: 12 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#fff" }}>{SCENARIO.avatarName}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#B4B2A9" }}>Einwohneramt Zürich</p>
              </div>
              <div style={{ position: "absolute", bottom: 12, right: 12, width: 54, height: 70, background: T.darkSoft, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                <span style={{ fontSize: 10, color: "#B4B2A9" }}>you</span>
                <span style={{ fontSize: 14 }}>{matteoSpeaking ? "🎧" : "🎙"}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", minHeight: 420 }}>
              <div style={{ padding: "12px 18px 0" }}>
                <TickBar current={stage} label={STAGES[stage - 1]} />
              </div>

              <div style={{ flex: 1, padding: "14px 18px", overflowY: "auto", maxHeight: 260 }}>
                {lines.map((l) => (
                  <div key={l.id} style={{ marginBottom: 13, textAlign: l.role === "user" ? "right" : "left" }}>
                    <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: l.role === "user" ? T.red : T.faint, fontWeight: 500 }}>
                      {l.role === "user" ? "You" : SCENARIO.avatarName}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 15.5, color: T.ink }}>{l.de}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12.5, color: T.sub, fontStyle: "italic" }}>{l.en}</p>
                  </div>
                ))}
                {!matteoSpeaking && lines.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, borderLeft: `2px solid ${T.redBright}`, padding: "6px 10px", background: T.redBg }}>
                    <span style={{ fontSize: 12.5, color: T.redDark }}>🎙 Your turn — speak in German, or say &quot;I don&apos;t understand&quot;</span>
                  </div>
                )}
                <div ref={transcriptEndRef} />
              </div>

              <div style={{ padding: "12px 18px", borderTop: `1px solid ${T.line}` }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <PhraseChip de="Können Sie das bitte wiederholen?" />
                  <PhraseChip de="Können Sie bitte langsamer sprechen?" />
                  <PhraseChip de="Ich verstehe nicht." />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "12px 18px", borderTop: `1px solid ${T.line}` }}>
                <RedButton onClick={stop}>End session</RedButton>
              </div>
            </div>
          </div>
        )}

        {phase === "ended" && (
          <div>
            <div style={{ padding: "18px 18px 12px", borderBottom: `1px solid ${T.line}` }}>
              <SectionLabel color={T.red}>Session debrief</SectionLabel>
              <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 500, color: T.ink }}>
                {summary === "loading" ? "Wrapping up your session…" : verdict ? verdict.split(".")[0] + "." : "Session complete"}
              </h2>
              <TickBar current={stage + 1} label={`${stage} of 8 steps`} />
            </div>

            {summary === "loading" && (
              <p style={{ padding: 18, margin: 0, fontSize: 14, color: T.sub }}>✍️ Writing your feedback…</p>
            )}
            {summary === "failed" && (
              <p style={{ padding: 18, margin: 0, fontSize: 14, color: T.sub }}>
                Couldn&apos;t generate feedback this time — your transcript is below.
              </p>
            )}
            {summary && summary !== "loading" && summary !== "failed" && !sections && (
              <div style={{ padding: "14px 18px", fontSize: 13.5, lineHeight: 1.6, color: T.ink, whiteSpace: "pre-wrap" }}>
                <Bold text={summary} />
              </div>
            )}

            {(sections || coachNote) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                {coachNote && (
                  <div style={{ padding: "14px 18px", borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
                    <SectionLabel>🎧 What Matteo heard</SectionLabel>
                    <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: T.ink }}>{coachNote}</p>
                  </div>
                )}
                {sections?.["What you did well"] && (
                  <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.line}` }}>
                    <SectionLabel>✓ What you did well</SectionLabel>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6, color: T.ink }}>
                      {sections["What you did well"].map((item, i) => (
                        <li key={i}><Bold text={item} /></li>
                      ))}
                    </ul>
                  </div>
                )}
                {sections?.["Three things to improve"] && (
                  <div style={{ padding: "14px 18px", borderRight: `1px solid ${T.line}` }}>
                    <SectionLabel>↑ Three things to improve</SectionLabel>
                    <div style={{ fontSize: 13.5, lineHeight: 1.55, color: T.ink }}>
                      {sections["Three things to improve"].map((item, i) => (
                        <p key={i} style={{ margin: "0 0 6px" }}><Bold text={item} /></p>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ padding: "14px 18px" }}>
                  {sections?.["One word to practice"] && (
                    <div style={{ marginBottom: 10 }}>
                      <SectionLabel>Word to practice</SectionLabel>
                      <p style={{ margin: 0, fontSize: 14.5, color: T.ink }}><Bold text={sections["One word to practice"].join(" ")} /></p>
                    </div>
                  )}
                  {sections?.["Phrase to remember"] && (
                    <div>
                      <SectionLabel>Phrase to remember</SectionLabel>
                      <p style={{ margin: 0, fontSize: 14.5, color: T.ink }}><Bold text={sections["Phrase to remember"].join(" ")} /></p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {showTranscript && (
              <div style={{ padding: "14px 18px", borderTop: `1px solid ${T.line}`, maxHeight: 220, overflowY: "auto" }}>
                {lines.map((l) => (
                  <div key={l.id} style={{ marginBottom: 10 }}>
                    <p style={{ margin: 0, fontSize: 11, color: l.role === "user" ? T.red : T.faint, fontWeight: 500 }}>
                      {l.role === "user" ? "You" : SCENARIO.avatarName}
                    </p>
                    <p style={{ margin: 0, fontSize: 14, color: T.ink }}>{l.de}</p>
                    <p style={{ margin: 0, fontSize: 12, color: T.sub, fontStyle: "italic" }}>{l.en}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderTop: `1px solid ${T.line}` }}>
              <span style={{ fontSize: 12.5, color: T.sub }}>
                {sections?.["Next step"] ? <>→ <Bold text={sections["Next step"].join(" ")} /></> : ""}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <GhostButton onClick={() => setShowTranscript(!showTranscript)}>
                  {showTranscript ? "Hide transcript" : "View transcript"}
                </GhostButton>
                <RedButton onClick={reset}>Practice again</RedButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
