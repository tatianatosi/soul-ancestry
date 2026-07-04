import { useState } from "react";
import { cn } from "@/lib/utils";
import sealAsset from "@/assets/clube-ancestral-seal.jpeg.asset.json";

interface LogoProps { size?: number; className?: string; showText?: boolean; textColor?: string; }
export function BrandLogo({ size = 44, className, showText = true, textColor }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src={sealAsset.url}
        alt="Clube Ancestral"
        width={size}
        height={size}
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span
          className="italic leading-none tracking-wide"
          style={{
            fontFamily: '"Great Vibes","Dancing Script","Cormorant Garamond",cursive',
            fontSize: Math.round(size * 0.62),
            color: textColor ?? "#1B2B4B",
          }}
        >
          Clube Ancestral
        </span>
      )}
    </div>
  );
}


export function AppSwitcher({ current, onChange }: { current: "cliente" | "desk"; onChange: (v: "cliente" | "desk") => void }) {
  return (
    <div className="sticky top-0 z-50 border-b bg-navy text-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <BrandLogo size={34} showText={true} textColor="#C9A84C" />
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
