import { 
  Palette, Video, Tv, Brain, BookOpen, Bot, Search, 
  ShieldAlert, Users, User, Eye, Star, Lightbulb, Radio
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const DOMAINS = [
  { id: 1, name: "Aesthetic Intelligence", icon: Palette },
  { id: 2, name: "Content Creation", icon: Video },
  { id: 3, name: "Anime Intelligence", icon: Tv },
  { id: 4, name: "Elite Frameworks", icon: Brain },
  { id: 5, name: "Mastermind Knowledge", icon: BookOpen },
  { id: 6, name: "AI Tools", icon: Bot },
  { id: 7, name: "OSINT", icon: Search },
  { id: 8, name: "Cybersecurity", icon: ShieldAlert },
  { id: 9, name: "Human Intelligence", icon: Users },
  { id: 10, name: "Personal Context", icon: User },
  { id: 11, name: "Spy Intelligence", icon: Eye },
  { id: 12, name: "Entertainment Intel", icon: Star },
  { id: 13, name: "ATS System", icon: Lightbulb },
  { id: 14, name: "Podcast Mastermind", icon: Radio },
];

export default function DomainRail({ activeDomains = [], collapsed = false }) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col items-center gap-1 py-3 px-1 border-r border-primary/10 bg-background/50">
        <div className="text-[8px] font-heading text-primary/40 tracking-widest mb-2 uppercase">
          {collapsed ? "D" : "Domains"}
        </div>
        {DOMAINS.map((domain) => {
          const Icon = domain.icon;
          const isActive = activeDomains.includes(domain.id);
          return (
            <Tooltip key={domain.id}>
              <TooltipTrigger asChild>
                <button
                  className={`p-1.5 rounded transition-all duration-300 ${
                    isActive
                      ? "text-primary bg-primary/10 border-glow"
                      : "text-muted-foreground/40 hover:text-primary/60 hover:bg-primary/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card border-primary/20 text-foreground">
                <p className="text-xs font-mono">{domain.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}