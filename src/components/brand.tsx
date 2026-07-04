import { useState } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textColor?: string;
}

/**
 * Clube Ancestral — official brand seal (inline SVG).
 * Organic wax-seal blob (not a perfect circle) with layered navy outer,
 * terracotta inner ring, dark navy center, and a golden tree with
 * full leafy canopy and spreading roots.
 */
function SealSVG({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", background: "transparent" }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ca-outer" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#3d5f88" />
          <stop offset="70%" stopColor="#2F4B6E" />
          <stop offset="100%" stopColor="#1e3350" />
        </radialGradient>
        <radialGradient id="ca-root" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#FCB73A" />
          <stop offset="70%" stopColor="#e6c98a" />
          <stop offset="100%" stopColor="#ECDFCD" />
        </radialGradient>
        <filter id="ca-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {/* Organic wax blob — irregular edge, not a circle */}
      <path
        d="M100 8
           C132 6 158 22 172 44
           C186 66 194 84 190 110
           C186 138 172 166 146 182
           C122 196 96 196 72 188
           C46 178 22 158 12 130
           C4 104 6 78 20 54
           C34 30 60 12 100 8 Z"
        fill="url(#ca-outer)"
        filter="url(#ca-shadow)"
      />

      {/* Subtle depth ring — thin darker outline following the blob */}
      <path
        d="M100 14
           C130 12 154 26 168 46
           C182 68 188 86 184 110
           C180 134 168 160 144 176
           C122 190 96 190 74 182
           C50 174 28 154 18 128
           C10 104 12 80 24 58
           C38 34 62 18 100 14 Z"
        fill="none"
        stroke="#1a2c46"
        strokeWidth="1.2"
        opacity="0.6"
      />

      {/* Terracotta inner ring */}
      <path
        d="M100 30
           C126 28 148 42 160 62
           C170 82 174 98 168 118
           C160 142 146 160 128 168
           C110 176 88 176 72 168
           C54 160 38 144 30 124
           C24 104 28 82 40 62
           C52 44 74 32 100 30 Z"
        fill="none"
        stroke="#9a3a2f"
        strokeWidth="3.5"
      />

      {/* Dark inner disc */}
      <path
        d="M100 36
           C124 34 144 46 154 64
           C164 82 166 100 160 118
           C152 138 138 154 122 160
           C106 168 88 168 74 160
           C58 154 44 138 36 120
           C30 102 34 82 46 66
           C58 48 78 38 100 36 Z"
        fill="#101010"
      />

      {/* Tree — roots (spreading wide below trunk) */}
      <g fill="url(#ca-root)">
        {/* Main root fan */}
        <path d="M92 118 C86 128 80 138 68 142 C74 140 82 138 92 132 Z" />
        <path d="M100 120 L100 148 C102 148 104 148 106 148 L106 120 Z" />
        <path d="M108 118 C114 128 120 138 132 142 C126 140 118 138 108 132 Z" />
        <path d="M96 118 C90 132 82 144 72 150 C82 146 92 142 98 134 Z" />
        <path d="M104 118 C110 132 118 144 128 150 C118 146 108 142 102 134 Z" />
        {/* Fine tendrils */}
        <path d="M85 138 L78 152" stroke="#FCB73A" strokeWidth="1.3" fill="none" />
        <path d="M115 138 L122 152" stroke="#FCB73A" strokeWidth="1.3" fill="none" />
        <path d="M100 145 L100 158" stroke="#FCB73A" strokeWidth="1.5" fill="none" />
      </g>

      {/* Tree — trunk */}
      <path
        d="M94 78 L94 122 C94 124 96 126 100 126 C104 126 106 124 106 122 L106 78 Z"
        fill="#FCB73A"
      />

      {/* Tree — leafy canopy (multiple rounded clusters) */}
      <g fill="#FCB73A">
        <circle cx="100" cy="62" r="18" />
        <circle cx="80" cy="72" r="14" />
        <circle cx="120" cy="72" r="14" />
        <circle cx="72" cy="86" r="11" />
        <circle cx="128" cy="86" r="11" />
        <circle cx="88" cy="54" r="12" />
        <circle cx="112" cy="54" r="12" />
        <circle cx="100" cy="46" r="10" />
        <circle cx="90" cy="82" r="9" />
        <circle cx="110" cy="82" r="9" />
      </g>
    </svg>
  );
}

export function BrandLogo({ size = 44, className, showText = true, textColor }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <SealSVG size={size} />
      {showText && (
        <span
          className="italic leading-none tracking-wide"
          style={{
            fontFamily: '"Great Vibes","Dancing Script","Cormorant Garamond",cursive',
            fontSize: Math.round(size * 0.62),
            color: textColor ?? "#ECDFCD",
          }}
        >
          Clube Ancestral
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
          <span className="hidden sm:inline text-xs text-cream/60 uppercase tracking-widest">
            Protótipo
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-cream/20 bg-navy-soft/60 p-1">
          {(["cliente", "desk"] as const).map((v) => (
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
