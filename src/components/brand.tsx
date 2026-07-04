import { useState } from "react";
import { cn } from "@/lib/utils";

interface LogoProps { size?: number; className?: string; showText?: boolean; }
export function BrandLogo({ size = 44, className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
        <circle cx="50" cy="50" r="48" fill="#1B2B4B" stroke="#C9A84C" strokeWidth="2" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.5" />
        {/* Tree trunk */}
        <path d="M50 68 L50 40" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" />
        {/* Branches */}
        <path d="M50 48 Q42 42 36 34 M50 44 Q58 38 64 30 M50 52 Q40 48 32 44 M50 50 Q60 46 68 42 M50 40 Q46 32 44 26 M50 40 Q54 32 56 26" stroke="#C9A84C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Leaves */}
        {[[36,34],[64,30],[32,44],[68,42],[44,26],[56,26],[50,22],[40,30],[60,34]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="3" fill="#C9A84C" />
        ))}
        {/* Roots */}
        <path d="M50 68 Q44 74 38 78 M50 68 Q56 74 62 78 M50 68 Q48 76 46 82 M50 68 Q52 76 54 82 M50 68 Q40 72 34 74 M50 68 Q60 72 66 74" stroke="#C9A84C" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.9" />
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
