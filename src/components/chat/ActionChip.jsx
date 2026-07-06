import { Brain, Search, FileText, Wrench, Shield, Phone, Bot, Activity, Pin, MessageSquare, Zap, Globe } from "lucide-react";
import { motion } from "framer-motion";

const CHIP_ICONS = {
  "Memory": Brain,
  "Search": Search,
  "File": FileText,
  "Tool": Wrench,
  "Risk": Shield,
  "Call": Phone,
  "Agent": Bot,
  "ATS": Activity,
  "Pin": Pin,
  "Chat": MessageSquare,
  "Deploy": Zap,
  "Web": Globe,
};

function getIcon(text) {
  for (const [key, Icon] of Object.entries(CHIP_ICONS)) {
    if (text.toLowerCase().includes(key.toLowerCase())) return Icon;
  }
  return Zap;
}

export default function ActionChip({ text, atsActive }) {
  const Icon = getIcon(text);
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono mr-1 mb-1 ${
        atsActive
          ? "border-red-800/50 bg-red-950/30 text-red-400"
          : "border-primary/20 bg-primary/8 text-primary/70"
      }`}
    >
      <Icon className="w-2.5 h-2.5" />
      {text}
    </motion.span>
  );
}

// Parse [ ... ] chips from message content
export function parseChips(content) {
  const chips = [];
  const regex = /\[([^\]]+)\]/g;
  let match;
  let cleanContent = content;
  const lines = content.split("\n");
  const chipLines = [];
  const bodyLines = [];

  for (const line of lines) {
    if (/^\s*\[.+\]\s*$/.test(line.trim())) {
      // line is entirely a chip
      const m = line.match(/\[([^\]]+)\]/g);
      if (m) m.forEach((c) => chipLines.push(c.replace(/[\[\]]/g, "").trim()));
    } else {
      // check inline chips at start
      const inlineMatch = line.match(/^(\s*\[[^\]]+\]\s*)+/);
      if (inlineMatch) {
        const inChips = line.match(/\[([^\]]+)\]/g);
        if (inChips) inChips.forEach((c) => chipLines.push(c.replace(/[\[\]]/g, "").trim()));
        bodyLines.push(line.replace(/^(\s*\[[^\]]+\]\s*)+/, "").trim());
      } else {
        bodyLines.push(line);
      }
    }
  }

  return {
    chips: chipLines,
    body: bodyLines.join("\n").trim(),
  };
}