// Text-to-speech for the prep screen phrases — OpenAI TTS.
// Cost: fractions of a cent per phrase; the browser caches each phrase after first play.
export async function POST(request) {
  try {
    const { text } = await request.json();
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "ash",
        input: text,
        instructions:
          "Speak in clear, natural German. Slightly slow pace, as if modeling pronunciation for a beginner language learner. Calm, friendly tone.",
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("TTS error:", err);
      return new Response(err, { status: 500 });
    }

    return new Response(response.body, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return new Response("TTS failed", { status: 500 });
  }
}
