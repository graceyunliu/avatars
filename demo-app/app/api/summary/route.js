// Generates the end-of-session feedback from the transcript (tracker task B4).
// Ordinary (non-realtime) LLM call — costs a fraction of a cent per session.
import { SUMMARY_PROMPT } from "../../../lib/summaryPrompt";

export async function POST(request) {
  try {
    const { transcript } = await request.json();
    if (!transcript || !transcript.trim()) {
      return Response.json({ summary: "" }, { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SUMMARY_PROMPT },
          { role: "user", content: `Here is the transcript:\n\n${transcript}` },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Summary error:", data);
      return Response.json({ error: data }, { status: 500 });
    }
    const summary = data.choices?.[0]?.message?.content ?? "";
    return Response.json({ summary });
  } catch (error) {
    console.error("Summary error:", error);
    return Response.json({ error: "Summary failed" }, { status: 500 });
  }
}
