const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DEFAULT_VOICE_ID = "IKne3meq5aSn9XLyUdCD";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { voice_id } = await req.json().catch(() => ({}));

    // Aggregate data
    const [alerts, tasks, goals] = await Promise.all([
      db.entities.IntelAlert.filter({ read: false }),
      db.entities.CommanderTask.filter({ status: "pending" }),
      db.entities.Goal.filter({ status: "active" }),
    ]);

    const criticalAlerts = alerts.filter(a => a.severity === "critical" || a.severity === "warn");
    const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

    // Build brief script
    let script = `Good morning. Today is ${today}. Here is your operational briefing.\n\n`;

    if (criticalAlerts.length > 0) {
      script += `INTELLIGENCE ALERTS. You have ${criticalAlerts.length} priority alert${criticalAlerts.length > 1 ? "s" : ""}. `;
      criticalAlerts.slice(0, 3).forEach(a => {
        script += `${a.severity.toUpperCase()}: ${a.title}. `;
      });
      script += "\n\n";
    } else {
      script += `INTELLIGENCE STATUS: All clear. No critical alerts.\n\n`;
    }

    if (tasks.length > 0) {
      script += `COMMANDER QUEUE. ${tasks.length} pending objective${tasks.length > 1 ? "s" : ""}. `;
      tasks.slice(0, 2).forEach(t => {
        script += `${t.objective?.slice(0, 80)}. `;
      });
      script += "\n\n";
    }

    if (goals.length > 0) {
      script += `ACTIVE GOALS. You have ${goals.length} active goal${goals.length > 1 ? "s" : ""} in progress. `;
      const topGoal = goals.sort((a, b) => (b.progress || 0) - (a.progress || 0))[0];
      if (topGoal) script += `Leading: ${topGoal.title} at ${topGoal.progress || 0}% completion. `;
      script += "\n\n";
    }

    script += `All systems nominal. Standing by for your command.`;

    // Generate TTS via ElevenLabs
    const voiceId = voice_id || DEFAULT_VOICE_ID;
    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": Deno.env.get("ELEVENLABS_API_KEY"),
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text: script,
        model_id: "eleven_turbo_v2_5",
        voice_settings: { stability: 0.5, similarity_boost: 0.85, style: 0.2, use_speaker_boost: true },
      }),
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.text();
      // Return script only if TTS fails
      return Response.json({ script, audio_b64: null, error: err });
    }

    const audioBuffer = await ttsRes.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    return Response.json({ script, audio_b64: base64, alerts_count: criticalAlerts.length, tasks_count: tasks.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});