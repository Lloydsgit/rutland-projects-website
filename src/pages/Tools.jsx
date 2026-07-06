const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";

import HudPanel from "../components/hud/HudPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Zap, Search, Loader2, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Tools() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-lg text-foreground tracking-wide">Tactical Tools</h1>
          <p className="text-xs text-muted-foreground/50 font-mono">Specialized utilities at your command.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PhishingChecker />
          <ContentFactory />
          <LinkAnalyzer />
          <QuickResearch />
        </div>
      </div>
    </div>
  );
}

function PhishingChecker() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await db.integrations.Core.InvokeLLM({
        prompt: `Analyze this URL for phishing/scam indicators. Check domain reputation patterns, common scam signs, and provide a safety verdict.\n\nURL: ${url}\n\nProvide: verdict (SAFE/CAUTION/DANGER), confidence (1-10), reasons (array of strings), recommendation.`,
        response_json_schema: {
          type: "object",
          properties: {
            verdict: { type: "string" },
            confidence: { type: "number" },
            reasons: { type: "array", items: { type: "string" } },
            recommendation: { type: "string" },
          },
        },
        add_context_from_internet: true,
      });
      setResult(res);
    } catch (e) {
      setError(e?.message || "Request failed");
    }
    setLoading(false);
  };

  const verdictStyle = {
    SAFE: { icon: CheckCircle, color: "text-success-green", bg: "bg-success-green/10" },
    CAUTION: { icon: AlertTriangle, color: "text-alert-amber", bg: "bg-alert-amber/10" },
    DANGER: { icon: XCircle, color: "text-alert-red", bg: "bg-alert-red/10" },
  };

  return (
    <HudPanel title="Anti-Phishing Shield" glowing>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input placeholder="Paste URL to scan..." value={url} onChange={(e) => setUrl(e.target.value)} className="bg-background/50 border-primary/10 text-xs flex-1" />
          <Button onClick={check} disabled={loading} className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs" size="sm">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
          </Button>
        </div>
        {error && (
          <div className="rounded-lg p-3" style={{ background: "rgba(200,16,46,0.1)", border: "1px solid rgba(200,16,46,0.2)" }}>
            <p className="text-[10px] font-mono" style={{ color: "rgba(200,16,46,0.7)" }}>{error}</p>
            {error.includes("limit of integrations") && (
              <p className="text-[9px] font-mono mt-1" style={{ color: "rgba(200,16,46,0.4)" }}>Integration credits exhausted — resets 2026-07-01. Upgrade your plan to continue.</p>
            )}
          </div>
        )}
        {result && (
          <div className={`rounded-lg p-3 ${verdictStyle[result.verdict]?.bg || "bg-primary/5"}`}>
            <div className="flex items-center gap-2">
              {verdictStyle[result.verdict]?.icon && (
                <span className={verdictStyle[result.verdict].color}>
                  {(() => { const I = verdictStyle[result.verdict].icon; return <I className="w-4 h-4" />; })()}
                </span>
              )}
              <span className={`font-heading text-sm tracking-wider ${verdictStyle[result.verdict]?.color}`}>{result.verdict}</span>
              <span className="text-[10px] font-mono text-muted-foreground/50">conf: {result.confidence}/10</span>
            </div>
            {result.reasons?.map((r, i) => (
              <p key={i} className="text-[10px] text-muted-foreground/60 mt-1 ml-6">• {r}</p>
            ))}
            <p className="text-xs text-foreground/70 mt-2 ml-6">{result.recommendation}</p>
          </div>
        )}
      </div>
    </HudPanel>
  );
}

function ContentFactory() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await db.integrations.Core.InvokeLLM({
        prompt: `You are a content strategist for @tejas.unrealistic. Given this input, generate multi-format content.\n\nInput: ${input}\n\nGenerate: long_form_hook (compelling opening), short_hooks (5 short-form hooks for reels/shorts), caption (Instagram caption with hashtags), tweet_thread (3-5 tweet thread), email_subject and email_body (newsletter version).`,
        response_json_schema: {
          type: "object",
          properties: {
            long_form_hook: { type: "string" },
            short_hooks: { type: "array", items: { type: "string" } },
            caption: { type: "string" },
            tweet_thread: { type: "array", items: { type: "string" } },
            email_subject: { type: "string" },
            email_body: { type: "string" },
          },
        },
      });
      setResult(res);
    } catch (e) {
      setError(e?.message || "Request failed");
    }
    setLoading(false);
  };

  return (
    <HudPanel title="Content Factory">
      <div className="space-y-2">
        <Textarea placeholder="Drop your idea, voice memo transcript, or topic..." value={input} onChange={(e) => setInput(e.target.value)} className="bg-background/50 border-primary/10 text-xs h-20" />
        <Button onClick={generate} disabled={loading} className="w-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs font-mono" size="sm">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Zap className="w-3.5 h-3.5 mr-1" />}
          Generate Content
        </Button>
        {error && (
          <div className="rounded-lg p-3" style={{ background: "rgba(200,16,46,0.1)", border: "1px solid rgba(200,16,46,0.2)" }}>
            <p className="text-[10px] font-mono" style={{ color: "rgba(200,16,46,0.7)" }}>{error}</p>
            {error.includes("limit of integrations") && (
              <p className="text-[9px] font-mono mt-1" style={{ color: "rgba(200,16,46,0.4)" }}>Integration credits exhausted — resets 2026-07-01. Upgrade your plan to continue.</p>
            )}
          </div>
        )}
        {result && (
          <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
            <div className="text-[10px] font-heading text-primary/50 tracking-wider">LONG-FORM HOOK</div>
            <p className="text-xs text-foreground/70">{result.long_form_hook}</p>
            <div className="text-[10px] font-heading text-primary/50 tracking-wider mt-2">SHORT HOOKS</div>
            {result.short_hooks?.map((h, i) => <p key={i} className="text-xs text-foreground/60">• {h}</p>)}
            <div className="text-[10px] font-heading text-primary/50 tracking-wider mt-2">CAPTION</div>
            <p className="text-xs text-foreground/60 whitespace-pre-wrap">{result.caption}</p>
          </div>
        )}
      </div>
    </HudPanel>
  );
}

function LinkAnalyzer() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult("");
    setError(null);
    try {
      const res = await db.integrations.Core.InvokeLLM({
        prompt: `Analyze this URL/article and provide a structured summary with: key takeaways, named entities, frameworks mentioned, action items, and non-obvious insights.\n\nURL: ${url}`,
        add_context_from_internet: true,
      });
      setResult(res);
    } catch (e) {
      setError(e?.message || "Request failed");
    }
    setLoading(false);
  };

  return (
    <HudPanel title="Auto-Research">
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input placeholder="Paste URL or article link..." value={url} onChange={(e) => setUrl(e.target.value)} className="bg-background/50 border-primary/10 text-xs flex-1" />
          <Button onClick={analyze} disabled={loading} className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs" size="sm">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          </Button>
        </div>
        {error && (
          <div className="rounded-lg p-3" style={{ background: "rgba(200,16,46,0.1)", border: "1px solid rgba(200,16,46,0.2)" }}>
            <p className="text-[10px] font-mono" style={{ color: "rgba(200,16,46,0.7)" }}>{error}</p>
            {error.includes("limit of integrations") && (
              <p className="text-[9px] font-mono mt-1" style={{ color: "rgba(200,16,46,0.4)" }}>Integration credits exhausted — resets 2026-07-01. Upgrade your plan to continue.</p>
            )}
          </div>
        )}
        {result && (
          <div className="max-h-48 overflow-y-auto text-xs text-foreground/70">
            <ReactMarkdown className="prose prose-invert prose-xs max-w-none [&>*:first-child]:mt-0">{result}</ReactMarkdown>
          </div>
        )}
      </div>
    </HudPanel>
  );
}

function QuickResearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const research = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult("");
    setError(null);
    try {
      const res = await db.integrations.Core.InvokeLLM({
        prompt: `Run deep research on: ${query}\n\nProvide a structured operator report with:\n1. Executive summary (2-3 sentences)\n2. Key findings\n3. Sources and confidence levels\n4. Contradictions flagged\n5. Action items\n\nBe thorough and cite sources where possible.`,
        add_context_from_internet: true,
      });
      setResult(res);
    } catch (e) {
      setError(e?.message || "Request failed");
    }
    setLoading(false);
  };

  return (
    <HudPanel title="Deep Research">
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input placeholder="Research topic..." value={query} onChange={(e) => setQuery(e.target.value)} className="bg-background/50 border-primary/10 text-xs flex-1" />
          <Button onClick={research} disabled={loading} className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs" size="sm">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          </Button>
        </div>
        {error && (
          <div className="rounded-lg p-3" style={{ background: "rgba(200,16,46,0.1)", border: "1px solid rgba(200,16,46,0.2)" }}>
            <p className="text-[10px] font-mono" style={{ color: "rgba(200,16,46,0.7)" }}>{error}</p>
            {error.includes("limit of integrations") && (
              <p className="text-[9px] font-mono mt-1" style={{ color: "rgba(200,16,46,0.4)" }}>Integration credits exhausted — resets 2026-07-01. Upgrade your plan to continue.</p>
            )}
          </div>
        )}
        {result && (
          <div className="max-h-48 overflow-y-auto text-xs text-foreground/70">
            <ReactMarkdown className="prose prose-invert prose-xs max-w-none [&>*:first-child]:mt-0">{result}</ReactMarkdown>
          </div>
        )}
      </div>
    </HudPanel>
  );
}