import { useState, useMemo } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

const MAX_WORDS_INLINE = 80;

function safeCopy(text) {
  if (navigator.clipboard && document.hasFocus()) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}
function fallbackCopy(text) {
  const el = document.createElement('textarea');
  el.value = text;
  el.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Copy, Zap, CheckCircle2, AlertCircle, Loader2, ChevronRight, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ActionChip, { parseChips } from "./ActionChip";

const FunctionDisplay = ({ toolCall, atsActive }) => {
  const [expanded, setExpanded] = useState(false);
  const name = toolCall?.name || 'Function';
  const status = toolCall?.status || 'pending';
  const results = toolCall?.results;

  const parsedResults = (() => {
    if (!results) return null;
    try { return typeof results === 'string' ? JSON.parse(results) : results; } catch { return results; }
  })();

  const isError = results && (
    (typeof results === 'string' && /error|failed/i.test(results)) ||
    (parsedResults?.success === false)
  );

  const statusConfig = {
    pending: { icon: Clock, color: 'text-slate-400', text: 'Pending' },
    running: { icon: Loader2, color: 'text-slate-500', text: 'Running...', spin: true },
    in_progress: { icon: Loader2, color: 'text-slate-500', text: 'Running...', spin: true },
    completed: isError ? { icon: AlertCircle, color: 'text-red-500', text: 'Failed' } : { icon: CheckCircle2, color: 'text-green-600', text: 'Done' },
    success: { icon: CheckCircle2, color: 'text-green-600', text: 'Done' },
    failed: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' },
    error: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' }
  }[status] || { icon: Zap, color: 'text-slate-500', text: '' };

  const Icon = statusConfig.icon;
  const formattedName = name.split('.').reverse().join(' ').toLowerCase();

  return (
    <div className="mt-1.5 text-xs">
      <button onClick={() => setExpanded(!expanded)}
        className={cn("flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all hover:opacity-80",
          atsActive ? "bg-red-950/20 border-red-900/30" : "bg-card/50 border-primary/10"
        )}>
        <Icon className={cn("h-3 w-3", statusConfig.color, statusConfig.spin && "animate-spin")} />
        <span className="text-foreground/60">{formattedName}</span>
        {statusConfig.text && <span className="text-foreground/30">· {statusConfig.text}</span>}
        {!statusConfig.spin && (toolCall.arguments_string || results) && (
          <ChevronRight className={cn("h-3 w-3 text-foreground/30 transition-transform ml-auto", expanded && "rotate-90")} />
        )}
      </button>
      {expanded && !statusConfig.spin && (
        <div className="mt-1 ml-3 pl-3 border-l border-primary/10 space-y-1.5">
          {toolCall.arguments_string && (
            <pre className="bg-card/50 rounded p-2 text-[10px] text-foreground/50 whitespace-pre-wrap">
              {(() => { try { return JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2); } catch { return toolCall.arguments_string; } })()}
            </pre>
          )}
          {parsedResults && (
            <pre className="bg-card/50 rounded p-2 text-[10px] text-foreground/50 whitespace-pre-wrap max-h-40 overflow-auto">
              {typeof parsedResults === 'object' ? JSON.stringify(parsedResults, null, 2) : parsedResults}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default function MessageBubble({ message, atsActive }) {
  const isUser = message.role === 'user';
  const [expanded, setExpanded] = useState(false);

  // Parse chips from assistant messages
  const { chips, body } = !isUser && message.content ? parseChips(message.content) : { chips: [], body: message.content };

  // Truncation logic for assistant messages
  const { displayBody, isTruncated } = useMemo(() => {
    if (isUser || !body) return { displayBody: body, isTruncated: false };
    const words = body.split(/\s+/);
    if (words.length <= MAX_WORDS_INLINE) return { displayBody: body, isTruncated: false };
    return {
      displayBody: expanded ? body : words.slice(0, MAX_WORDS_INLINE).join(' ') + '...',
      isTruncated: true,
    };
  }, [body, isUser, expanded]);

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className={cn(
          "h-6 w-6 rounded-full border flex items-center justify-center mt-0.5 flex-shrink-0",
          atsActive ? "border-red-700/40" : "border-primary/20"
        )}>
          <div className={cn("h-1.5 w-1.5 rounded-full", atsActive ? "bg-red-500" : "bg-primary/60")} />
        </div>
      )}
      <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
        {/* Action chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap mb-1">
            {chips.map((chip, i) => (
              <ActionChip key={i} text={chip} atsActive={atsActive} />
            ))}
          </div>
        )}

        {/* File attachments (user) */}
        {message.file_urls?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {message.file_urls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                className="text-[10px] font-mono text-primary/50 hover:text-primary/80 border border-primary/10 rounded px-2 py-0.5">
                attachment {i + 1}
              </a>
            ))}
          </div>
        )}

        {/* Message content */}
        {(isUser ? message.content : body) && (
          <div className={cn(
            "rounded-xl px-3.5 py-2.5",
            isUser
              ? atsActive ? "bg-red-950/30 border border-red-900/20 text-foreground/90" : "bg-card/80 border border-primary/15 text-foreground/90"
              : atsActive ? "bg-red-950/10 border border-red-900/10" : "bg-card/40 border border-primary/5"
          )}>
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <div className="relative group">
                <ReactMarkdown
                  className={cn("text-sm prose prose-sm max-w-none leading-relaxed",
                    atsActive
                      ? "[&>*]:text-red-200/80 prose-headings:text-red-300/70 prose-code:text-red-300/60"
                      : "prose-invert prose-headings:text-foreground/70 prose-code:text-foreground/60"
                  )}
                  components={{
                    code: ({ inline, className, children, ...props }) => {
                      if (inline) return <code className="px-1 py-0.5 rounded bg-primary/5 text-foreground/60 text-xs">{children}</code>;
                      return (
                        <div className="relative group/code my-2">
                          <pre className="bg-card/80 rounded-lg p-3 overflow-x-auto text-xs border border-primary/5">
                            <code className={className} {...props}>{children}</code>
                          </pre>
                          <Button size="icon" variant="ghost"
                            className="absolute top-1.5 right-1.5 h-5 w-5 opacity-0 group-hover/code:opacity-100"
                            onClick={() => { safeCopy(String(children)); toast.success("Copied"); }}>
                            <Copy className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      );
                    },
                    p: ({ children }) => <p className="my-1 leading-relaxed text-foreground/80">{children}</p>,
                    ul: ({ children }) => <ul className="my-1 ml-4 list-disc text-foreground/80">{children}</ul>,
                    ol: ({ children }) => <ol className="my-1 ml-4 list-decimal text-foreground/80">{children}</ol>,
                    li: ({ children }) => <li className="my-0.5">{children}</li>,
                    h1: ({ children }) => <h1 className="text-base font-heading my-2 text-foreground/80">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-sm font-heading my-1.5 text-foreground/70">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xs font-heading my-1 text-foreground/60 uppercase tracking-wider">{children}</h3>,
                    hr: () => <hr className="border-primary/10 my-3" />,
                    blockquote: ({ children }) => (
                      <blockquote className={cn("border-l-2 pl-3 my-2 italic text-foreground/60", atsActive ? "border-red-700/40" : "border-primary/20")}>{children}</blockquote>
                    ),
                    strong: ({ children }) => <strong className="font-semibold text-foreground/90">{children}</strong>,
                    a: ({ children, ...props }) => <a {...props} target="_blank" className="text-primary/70 underline underline-offset-2 hover:text-primary">{children}</a>,
                  }}
                >
                  {displayBody}
                </ReactMarkdown>
                {isTruncated && (
                  <button
                    onClick={() => setExpanded(e => !e)}
                    className="mt-2 flex items-center gap-1 text-[9px] font-mono transition-all"
                    style={{ color: "rgba(200,16,46,0.6)" }}
                  >
                    {expanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                    {expanded ? "Collapse" : "Open in Canvas"}
                  </button>
                )}
                <Button size="icon" variant="ghost"
                  className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-40 hover:opacity-80"
                  onClick={() => { safeCopy(body); toast.success("Copied"); }}>
                  <Copy className="h-2.5 w-2.5" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tool calls */}
        {message.tool_calls?.length > 0 && (
          <div className="space-y-0.5 mt-1 w-full">
            {message.tool_calls.map((toolCall, idx) => (
              <FunctionDisplay key={idx} toolCall={toolCall} atsActive={atsActive} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}