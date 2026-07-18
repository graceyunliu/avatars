// Tap-to-hear audio: OpenAI TTS via /api/tts, cached per phrase, latest-click-wins.
const audioCache = new Map();
let currentAudio = null;
let playSeq = 0;

export async function getAudioUrl(text) {
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
  audioCache.set(text, promise);
  const url = await promise;
  audioCache.set(text, url);
  return url;
}

export async function speak(text) {
  const seq = ++playSeq;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  try {
    const url = await getAudioUrl(text);
    if (seq !== playSeq) return;
    currentAudio = new Audio(url);
    currentAudio.play();
  } catch (e) {
    console.error(e);
  }
}

export async function prefetchAudio(items) {
  for (const item of items) {
    try {
      await getAudioUrl(item.de);
    } catch {}
  }
}
