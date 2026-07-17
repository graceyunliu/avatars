// Translates a German line to English for the transcript display.
// Cheap model, one call per line.
export async function POST(request) {
  try {
    const { text } = await request.json();
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Translate the given German text to natural English. Output ONLY the translation, nothing else. If the text is already English or mixed, translate the German parts and keep the English parts. Context: the text comes from a formal one-on-one conversation between a clerk and a customer, so 'Sie/Ihr/Ihre' is almost always the formal 'you/your' (not 'they/she'): 'Ihr Name ist Grace' → 'Your name is Grace', 'Sie sind verheiratet' → 'You are married'.",
          },
          { role: "user", content: text },
        ],
        temperature: 0,
      }),
    });
    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content ?? "";
    return Response.json({ translation });
  } catch (error) {
    console.error("Translation error:", error);
    return Response.json({ translation: "" }, { status: 500 });
  }
}
