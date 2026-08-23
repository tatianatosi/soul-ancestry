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
  "client-light": "#2F4B6E",
  "client-dark": "#ECDFCD",
  "internal-minimal": "#FCB73A",
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


// CA-UX-04: o controle de alternância App Cliente/Desk pertencia ao protótipo e
// foi retirado do runtime; consulte o índice histórico em docs/historico/mockups.

export function useToggle<T extends string>(initial: T) {
  const [v, set] = useState<T>(initial);
  return [v, set] as const;
}
