import { useState } from "react";
import { cn } from "@/lib/utils";

interface LogoProps { size?: number; className?: string; showText?: boolean; }
export function BrandLogo({ size = 44, className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
        <circle cx="50" cy="50" r="48" fill="#1B2B4B" stroke="#C9A84C" strokeWidth="2" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.5" />
        {/* Ground line */}
        <line x1="24" y1="60" x2="76" y2="60" stroke="#C9A84C" strokeWidth="0.6" opacity="0.5" />
        {/* Trunk */}
        <path d="M50 60 L50 38" stroke="#C9A84C" strokeWidth="2.8" strokeLinecap="round" />
        {/* Canopy branches */}
        <path d="M50 44 Q42 40 36 32 M50 40 Q44 32 42 24 M50 40 Q56 32 58 24 M50 44 Q58 40 64 32 M50 48 Q40 46 32 42 M50 48 Q60 46 68 42" stroke="#C9A84C" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {/* Leaves */}
        {[[36,32],[64,32],[42,24],[58,24],[50,20],[32,42],[68,42],[40,28],[60,28],[46,22],[54,22]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="2.6" fill="#C9A84C" />
        ))}
        {/* Prominent roots growing downward */}
        <path d="M50 60 Q46 66 42 72 Q40 76 38 80" stroke="#C9A84C" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M50 60 Q54 66 58 72 Q60 76 62 80" stroke="#C9A84C" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M50 60 L50 82" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M50 60 Q44 64 38 66 Q34 68 32 70" stroke="#C9A84C" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M50 60 Q56 64 62 66 Q66 68 68 70" stroke="#C9A84C" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.85" />
        {/* Root tips */}
        {[[38,80],[62,80],[50,82],[32,70],[68,70]].map(([x,y],i)=>(
          <circle key={`r${i}`} cx={x} cy={y} r="1.2" fill="#C9A84C" />
        ))}
      </svg>
      {showText && (
        <div className="leading-tight">
          <div className="font-serif text-lg font-semibold text-navy italic">Clube</div>
          <div className="font-serif text-lg font-semibold text-gold italic -mt-1">Ancestral</div>
        </div>
      )}
    </div>
  );
}

export function AppSwitcher({ current, onChange }: { current: "cliente" | "desk"; onChange: (v: "cliente" | "desk") => void }) {
  return (
    <div className="sticky top-0 z-50 border-b bg-navy text-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <BrandLogo size={32} showText={false} />
          <span className="font-serif text-base italic text-gold">Clube Ancestral</span>
          <span className="hidden sm:inline text-xs text-cream/60 uppercase tracking-widest">Protótipo</span>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-cream/20 bg-navy-soft/60 p-1">
          {(["cliente","desk"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onChange(v)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:text-sm",
                current === v ? "bg-gold text-navy" : "text-cream/70 hover:text-cream"
              )}
            >
              {v === "cliente" ? "App Cliente" : "Desk Intelligence"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function useToggle<T extends string>(initial: T) {
  const [v, set] = useState<T>(initial);
  return [v, set] as const;
}
