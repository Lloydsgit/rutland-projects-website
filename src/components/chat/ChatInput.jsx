import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Zap, Mic, MicOff, Paperclip, X, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const BROWSER_SITES = {
  youtube: "https://youtube.com", google: "https://google.com",
  gmail: "https://mail.google.com", github: "https://github.com",
  twitter: "https://twitter.com", news: "https://news.google.com",
  reddit: "https://reddit.com", linkedin: "https://linkedin.com",
  pipl: "https://pipl.com", shodan: "https://www.shodan.io",
  censys: "https://censys.io", opencorporates: "https://opencorporates.com",
  crunchbase: "https://crunchbase.com", "have i been pwned": "https://haveibeenpwned.com",
  "virus total": "https://virustotal.com", "wayback machine": "https://web.archive.org",
  "osint framework": "https://osintframework.com",
};

const NAV_CMDS = {
  memory: "/memory", dashboard: "/dashboard", settings: "/settings",
  goals: "/goals", chat: "/", jarvis: "/", intel: "/intel",
  dossier: "/dossier", commander: "/commander", workflows: "/workflows",
};

function processBrowserCommand(text, navigate) {
  const t = text.toLowerCase().trim();
  for (const [name, url] of Object.entries(BROWSER_SITES)) {
    if (t.includes(`open ${name}`) || t.includes(`launch ${name}`) || t.includes(`go to ${name}`)) {
      window.open(url, "_blank"); return `Opening ${name}…`;
    }
  }
  const searchMatch = t.match(/(?:search|look up|find|google)\s+(.+)/);
  if (searchMatch) { window.open(`https://google.com/search?q=${encodeURIComponent(searchMatch[1])}`, "_blank"); return `Searching "${searchMatch[1]}"…`; }
  for (const [name, path] of Object.entries(NAV_CMDS)) {
    if (t.includes(`open ${name}`) || t.includes(`show ${name}`) || t.includes(`go to ${name}`)) {
      navigate(path); return `Navigating to ${name}…`;
    }
  }
  return null;
}

export default function ChatInput({ onSend, isLoading, placeholder = "Command, Sir…", atsActive = false }) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceStatus, setVoiceStatus] = useState(""); // "listening" | "processing" | ""
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const lastTranscriptRef = useRef("");

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSubmit = useCallback((textOverride) => {
    const text = textOverride || input.trim();
    if (!text || isLoading) return;
    onSend(text, attachedFiles.length ? attachedFiles : undefined);
    setInput("");
    setAttachedFiles([]);
  }, [input, isLoading, onSend, attachedFiles]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ── Voice ──────────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice not supported in this browser.");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-GB";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;
    lastTranscriptRef.current = "";

    rec.onstart = () => {
      setIsListening(true);
      setVoiceStatus("listening");
    };

    rec.onresult = (e) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      const combined = (lastTranscriptRef.current + " " + final).trim();
      if (final) lastTranscriptRef.current = combined;
      setTranscript(interim || combined);
      setInput(interim || combined);

      // Reset silence timer on new speech
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        const finalText = lastTranscriptRef.current || interim;
        if (finalText.trim()) {
          const cmdResult = processBrowserCommand(finalText.trim(), navigate);
          if (cmdResult) {
            setInput("");
            lastTranscriptRef.current = "";
            setIsListening(false);
            setVoiceStatus(cmdResult);
            setTimeout(() => setVoiceStatus(""), 3000);
            if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
          } else {
            stopListening(finalText.trim());
          }
        }
      }, 1800); // auto-send after 1.8s of silence
    };

    rec.onerror = () => {
      setIsListening(false);
      setVoiceStatus("");
    };

    rec.onend = () => {
      setIsListening(false);
      setVoiceStatus("");
    };

    rec.start();
  }, []);

  const stopListening = useCallback((autoText) => {
    clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setVoiceStatus("");
    setTranscript("");
    if (autoText) {
      handleSubmit(autoText);
      lastTranscriptRef.current = "";
    }
  }, [handleSubmit]);

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // ── File attachment ────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const attached = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
      local: true,
    }));
    setAttachedFiles((prev) => [...prev, ...attached]);
    fileInputRef.current.value = "";
  };

  const removeFile = (idx) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className={`p-3 transition-colors duration-700`} style={{ borderTop: atsActive ? "1px solid rgba(255,61,61,0.15)" : "1px solid rgba(232,236,239,0.05)", background: "rgba(10,10,15,0.7)", backdropFilter: "blur(24px)" }}>
      {/* Attached files */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-wrap gap-1.5 mb-2 max-w-4xl mx-auto">
            {attachedFiles.map((f, i) => (
              <div key={i} className="relative group flex flex-col items-center gap-1">
                {f.type?.startsWith('image/') ? (
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-primary/20">
                    <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                    <button onClick={() => removeFile(i)}
                      className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-md px-2 py-1 text-[10px] font-mono text-primary/70">
                    <Paperclip className="w-2.5 h-2.5" />
                    <span className="max-w-[100px] truncate">{f.name}</span>
                    <button onClick={() => removeFile(i)} className="ml-0.5 text-primary/40 hover:text-primary/80"><X className="w-2.5 h-2.5" /></button>
                  </div>
                )}
                {f.type?.startsWith('image/') && (
                  <span className="text-[8px] font-mono text-foreground/25 max-w-[56px] truncate">{f.name}</span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice status */}
      <AnimatePresence>
        {isListening && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 mb-2 max-w-4xl mx-auto">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <motion.div key={i} className={`w-0.5 rounded-full ${atsActive ? "bg-red-500" : "bg-primary"}`}
                  animate={{ height: [4, 12, 6, 16, 4][i % 5] }}
                  transition={{ duration: 0.4, delay: i * 0.08, repeat: Infinity, repeatType: "reverse" }}
                />
              ))}
            </div>
            <span className={`text-[10px] font-mono ${atsActive ? "text-red-400" : "text-primary/60"}`}>
              Listening... auto-sends on silence
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* Attach file */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-foreground/20 hover:text-foreground/60 transition-colors flex-shrink-0"
          title="Attach file"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,audio/*,.pdf,.txt,.md,.json,.csv,.docx,.xlsx" className="hidden" onChange={handleFileSelect} />

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : placeholder}
            rows={1}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm text-foreground/80 placeholder:text-foreground/15 focus:outline-none resize-none font-mono transition-colors ${
              atsActive
                ? "border-red-900/20 focus:border-red-700/35"
                : "border-foreground/6 focus:border-sky-cyan/25"
            }`}
          style={{ background: "rgba(28,28,30,0.5)", fontWeight: 300 }}
          />
        </div>

        {/* Voice button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={toggleVoice}
          className={`p-2.5 rounded-lg border transition-all flex-shrink-0 ${
            isListening
              ? atsActive
                ? "bg-red-900/30 border-red-700/50 text-red-400"
                : "bg-primary/20 border-primary/40 text-primary"
              : "bg-card/30 border-primary/5 text-muted-foreground/30 hover:text-foreground/60"
          }`}
          title={isListening ? "Stop" : "Voice"}
        >
          {isListening ? (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
              <MicOff className="w-4 h-4" />
            </motion.div>
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </motion.button>

        {/* Send */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSubmit()}
          disabled={(!input.trim() && !attachedFiles.length) || isLoading}
          className={`p-2.5 rounded-lg transition-all flex-shrink-0 ${
            (input.trim() || attachedFiles.length) && !isLoading
              ? atsActive
                ? "bg-red-900/30 border border-red-700/50 text-red-400 hover:bg-red-900/50"
                : "bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30"
              : "bg-card/30 border border-primary/5 text-muted-foreground/30"
          }`}
        >
          {isLoading ? <Zap className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
        </motion.button>
      </div>
    </div>
  );
}