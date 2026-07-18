// Mints a short-lived (ephemeral) key so the browser can talk to OpenAI Realtime
// without ever seeing our real API key. Real key stays server-side only.
import { MATTEO_PROMPT } from "../../../lib/prompt";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: {
            type: "realtime",
            model: "gpt-realtime-2.1",
            instructions: MATTEO_PROMPT,
            audio: {
              input: {
                // Enables transcripts of the learner's speech (server events)
                transcription: { model: "gpt-4o-transcribe" },
              },
              output: { voice: "cedar" },
            },
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("Token error:", data);
      return Response.json({ error: data }, { status: 500 });
    }
    return Response.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    return Response.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
