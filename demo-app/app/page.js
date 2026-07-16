"use client";

import { useRef, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("idle"); // idle | connecting | live | ended | error
  const [lines, setLines] = useState([]); // {id, role, de, en}
  const pcRef = useRef(null);
  const micRef = useRef(null);
  const audioRef = useRef(null);
  const nextId = useRef(1);

  // Add a transcript line, then fetch its English translation
  async function addLine(role, text) {
    if (!text || !text.trim()) return;
    const id = nextId.current++;
    setLines((prev) => [...prev, { id, role, de: text.trim(), en: "…" }]);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const { translation } = await res.json();
      setLines((prev) =>
        prev.map((l) => (l.id === id ? { ...l, en: translation } : l))
      );
    } catch {
      setLines((prev) => prev.map((l) => (l.id === id ? { ...l, en: "" } : l)));
    }
  }

  async function start() {
    setStatus("connecting");
    setLines([]);
    try {
      // 1. Get ephemeral key from our server (real API key never reaches the browser)
      const tokenResponse = await fetch("/api/token");
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.value;
      if (!EPHEMERAL_KEY) throw new Error("No token: " + JSON.stringify(data));

      // 2. WebRTC peer connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Play Matteo's audio
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioRef.current = audioEl;
      pc.ontrack = (e) => (audioEl.srcObject = e.streams[0]);

      // Send our microphone
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      micRef.current = ms;
      pc.addTrack(ms.getTracks()[0]);

      // 3. Data channel: transcripts + events arrive here
      const dc = pc.createDataChannel("oai-events");
      dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        // Log everything while we're in development — remove before demo day
        console.log(event.type, event);

        // Learner's speech, transcribed
        if (event.type === "conversation.item.input_audio_transcription.completed") {
          addLine("user", event.transcript);
        }
        // Matteo's speech, transcribed (full turn)
        if (event.type === "response.output_audio_transcript.done") {
          addLine("assistant", event.transcript);
        }
      });
      dc.addEventListener("open", () => {
        setStatus("live");
        // Ask Matteo to speak first (the greeting)
        dc.send(JSON.stringify({ type: "response.create" }));
      });

      // 4. SDP offer/answer with OpenAI
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
      setStatus("error");
    }
  }

  function stop() {
    micRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
    setStatus("ended");
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 22 }}>🇨🇭 Anmeldung Practice</h1>
      <p style={{ color: "#555" }}>
        Role-play: registering at the Zurich residents&apos; office. Matteo, the
        clerk, speaks simple German. Say &quot;I don&apos;t understand&quot; any
        time for help.
      </p>

      {status !== "live" ? (
        <button
          onClick={start}
          disabled={status === "connecting"}
          style={btnStyle("#2563eb")}
        >
          {status === "connecting" ? "Connecting…" : "▶ Start conversation"}
        </button>
      ) : (
        <button onClick={stop} style={btnStyle("#dc2626")}>
          ■ End conversation
        </button>
      )}

      {status === "error" && (
        <p style={{ color: "#dc2626" }}>
          Something went wrong — check the browser console and that your API key
          is set in .env.local.
        </p>
      )}

      <div style={{ marginTop: 24 }}>
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
              {l.role === "assistant" ? "Matteo" : "You"}
            </div>
            <div style={{ fontSize: 16 }}>{l.de}</div>
            <div style={{ fontSize: 13, color: "#667", marginTop: 4, fontStyle: "italic" }}>
              {l.en}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
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
