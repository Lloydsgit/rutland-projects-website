const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };


// ── IRIS TTS Engine ──────────────────────────────────────────────────────────
// NEVER uses browser speechSynthesis. Always uses real TTS providers.
// Fallback chain: ElevenLabs (backend function) → Core.GenerateSpeech → error
// Both are real cloud TTS providers — no browser TTS ever.

let currentAudio = null;
let currentController = null;

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (currentController) {
    currentController.abort();
    currentController = null;
  }
}

export async function speak(text, voiceId) {
  if (!text?.trim()) return;
  
  // Stop any current speech
  stopSpeaking();
  
  const clean = text
    .replace(/\[.*?\]/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/─+/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\n{3,}/g, "\n")
    .trim()
    .slice(0, 2500);
  
  if (!clean) return;
  
  const storedVoice = voiceId || localStorage.getItem("iris-tts-voice") || null;
  
  // Provider 1: ElevenLabs (via backend function — uses ELEVENLABS_API_KEY)
  try {
    currentController = new AbortController();
    const res = await db.functions.invoke('elevenlabsTTS', { 
      text: clean, 
      voice_id: storedVoice 
    });
    const audio_b64 = res?.data?.audio_b64;
    if (audio_b64) {
      const audio = new Audio(`data:audio/mpeg;base64,${audio_b64}`);
      currentAudio = audio;
      await audio.play();
      return;
    }
    throw new Error("No audio from ElevenLabs");
  } catch (elError) {
    // Provider 2: Core.GenerateSpeech (platform TTS — different engine)
    try {
      const res2 = await db.integrations.Core.GenerateSpeech({ 
        text: clean.slice(0, 5000),
        voice: "storm",
      });
      if (res2?.url) {
        const audio = new Audio(res2.url);
        currentAudio = audio;
        await audio.play();
        return;
      }
      throw new Error("No audio from GenerateSpeech");
    } catch (gsError) {
      // All real TTS providers exhausted — do NOT fall back to browser TTS
      console.error("[IRIS TTS] All providers failed:", { elevenlabs: elError?.message, generateSpeech: gsError?.message });
    }
  }
}

export function isSpeaking() {
  return currentAudio && !currentAudio.paused;
}