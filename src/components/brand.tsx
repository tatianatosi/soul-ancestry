import { useState } from "react";
import { cn } from "@/lib/utils";
import { BRAND_ASSET_PENDENTE, BRAND_LOGO_URL, BRAND_NAME } from "@/lib/brand-asset";

export type BrandLogoVariant = "client-light" | "client-dark" | "internal-minimal";

interface LogoProps {
  /** Altura do logo em px. Proporção sempre preservada. */
  size?: number;
  className?: string;
  showText?: boolean;
  textColor?: string;
  variant?: BrandLogoVariant;
}

const VARIANT_TEXT: Record<BrandLogoVariant, string> = {
  "client-light": "#1B2B4B",
  "client-dark": "#ECDFCD",
  "internal-minimal": "#C9A84C",
};

export function BrandLogo({
  size = 40,
  className,
  showText = true,
  textColor,
  variant = "client-dark",
}: LogoProps) {
  const minimal = variant === "internal-minimal";
  const cor = textColor ?? VARIANT_TEXT[variant];
  const alturaLogo = minimal ? Math.round(size * 0.8) : size;

  // Sem asset oficial: placeholder neutro, sem inventar marca.
  if (!BRAND_LOGO_URL) {
    return (
      <span
        className={cn("font-serif tracking-wide", className)}
        style={{ fontSize: Math.round(size * 0.5), color: cor }}
        data-brand-pending={BRAND_ASSET_PENDENTE ?? undefined}
      >
        {BRAND_NAME}
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src={BRAND_LOGO_URL}
        alt={BRAND_NAME}
        loading="lazy"
        decoding="async"
        style={{
          height: alturaLogo,
          width: "auto",
          objectFit: "contain",
          background: "transparent",
          padding: Math.max(2, Math.round(alturaLogo * 0.06)),
        }}
      />
      {showText && !minimal && (
        <span
          className="italic leading-none tracking-wide"
          style={{
            fontFamily: '"Great Vibes","Dancing Script","Cormorant Garamond",cursive',
            fontSize: Math.round(size * 0.7),
            color: cor,
          }}
        >
          {BRAND_NAME}
        </span>
      )}
    </div>
  );
}


export function AppSwitcher({
  current,
  onChange,
}: {
  current: "cliente" | "desk";
  onChange: (v: "cliente" | "desk") => void;
}) {
  return (
    <div className="sticky top-0 z-50 border-b bg-navy text-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <BrandLogo size={36} showText={true} textColor="#ECDFCD" />
          <span className="hidden sm:inline text-xs text-cream/60 uppercase tracking-widest">Protótipo</span>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-cream/20 bg-navy-soft/60 p-1">
          {(["cliente", "desk"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onChange(v)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:text-sm",
                current === v ? "bg-gold text-navy" : "text-cream/70 hover:text-cream",
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
