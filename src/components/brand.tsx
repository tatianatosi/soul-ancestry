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
  "client-light": "#13294B",
  "client-dark": "#F0EEE9",
  "internal-minimal": "#C2A84D",
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
  const [imagemFalhou, setImagemFalhou] = useState(false);

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
      {/*
        Se o arquivo do logo falhar por qualquer motivo (rota errada, asset
        removido, rede), a marca vira o nome escrito — nunca um ícone de
        imagem quebrada no cabeçalho.
      */}
      {imagemFalhou ? (
        <span
          className="font-serif tracking-wide"
          style={{ fontSize: Math.round(alturaLogo * 0.55), color: cor }}
          data-brand-logo-fallback="true"
        >
          {BRAND_NAME}
        </span>
      ) : (
        <img
          src={BRAND_LOGO_URL}
          alt={BRAND_NAME}
          loading="lazy"
          decoding="async"
          onError={() => setImagemFalhou(true)}
          style={{
            height: alturaLogo,
            width: "auto",
            objectFit: "contain",
            background: "transparent",
            padding: Math.max(2, Math.round(alturaLogo * 0.06)),
          }}
        />
      )}
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
