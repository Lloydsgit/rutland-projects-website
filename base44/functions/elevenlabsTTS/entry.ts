const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DEFAULT_VOICE_ID = "IKne3meq5aSn9XLyUdCD"; // Christopher — British

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, voice_id } = await req.json();
    if (!text) return Response.json({ error: 'No text provided' }, { status: 400 });

    const voiceId = voice_id || DEFAULT_VOICE_ID;

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

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": Deno.env.get("ELEVENLABS_API_KEY"),
          "Content-Type": "application/json",
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({
          text: clean,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.85,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: err }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    // Return as base64 JSON — avoids binary transport issues with Axios
    const base64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    return Response.json({ audio_b64: base64, voice_id: voiceId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});