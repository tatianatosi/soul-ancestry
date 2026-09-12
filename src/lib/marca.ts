/**
 * FONTE DE VERDADE VISUAL — Clube Ancestral (Guia de Marca oficial,
 * aceite da Proprietária em 23/08/2026; reenvio arquivado 11/09/2026).
 *
 * Regras:
 * - Estes valores existem para superfícies que NÃO podem usar token CSS
 *   (e-mail transacional, PDF, SVG gerado). Em tela, use sempre os tokens
 *   de `src/styles.css` (`bg-navy`, `text-gold`, `border-border`, …).
 * - Proibido criar paleta paralela, azul "aproximado" ou logo improvisado.
 * - Conflito entre CSS, mockup e Guia de Marca resolve-se pelo Guia.
 * - Site institucional (SEO) ≠ app Vercel — ver SITE_OFICIAL e adendo 2026-09-11.
 */

/** Site institucional / marketing. Não apontar este domínio ao app Vercel. */
export const SITE_OFICIAL = "https://clubeancestral.com.br/" as const;

/**
 * Logotipos oficiais (zip logotipo-clube → public/marca/).
 * Variante 1 = mesma arte já usada como favicon (`public/clube-ancestral-logo.svg`).
 * Telas devem usar `<BrandLogo />` / `BRAND_LOGO_URL`, não inventar SVG.
 */
export const MARCA_LOGOS = {
  variante1: "/marca/logo-variante-1.svg",
  variante2: "/marca/logo-variante-2.svg",
  variante3: "/marca/logo-variante-3.svg",
  /** Alias estável (favicon / compat); bytes idênticos à variante 1. */
  principal: "/clube-ancestral-logo.svg",
} as const;

/** Guia de Marca OKI (8 páginas) — fonte enviada pela proprietária. */
export const MARCA_GUIA_PATH =
  "docs/evolucao/recuperados/marca-oficial-2026-09-11/Apresentacao-Clube-Ancestral-OKI.pdf" as const;
/** Cópia irmã arquivada (mesmo guia visual). */
export const MARCA_GUIA_PATH_LEGADO =
  "docs/evolucao/recuperados/marca-oficial-2026-09-11/CA-MARCA-Guia-Apresentacao-8-paginas.pdf" as const;

export const MARCA_CORES = {
  /** Azul oficial. Substitui o azul retirado #1B2B4B. */
  azul: "#2F4B6E",
  azulClaro: "#40628B",
  dourado: "#FCB73A",
  douradoClaro: "#FFD98A",
  creme: "#ECDFCD",
  fundo: "#F7F1E7",
  terracota: "#9A3A2F",
  preto: "#101010",
  borda: "#DCCDB6",
  branco: "#FFFFFF",
} as const;

/** Azuis retirados do produto: nenhuma superfície de cliente pode usá-los. */
export const AZUIS_RETIRADOS = ["#1B2B4B", "#1b2b4b", "#2A3D63"] as const;

/**
 * Tipografia em uso no app: Cormorant Garamond (títulos) + Montserrat (corpo).
 * O guia impresso declara Amolina (logo) + Montserrat (UI) — corpo já alinhado
 * via `--font-sans` / Google Fonts em `__root.tsx`. Script decorativo Amolina
 * permanece dívida (só com ordem explícita).
 */
export const MARCA_TIPOGRAFIA = {
  titulos: '"Cormorant Garamond", ui-serif, Georgia, serif',
  corpo: '"Montserrat", ui-sans-serif, system-ui, sans-serif',
  /** Fallback para e-mail, onde webfont não é garantida. */
  emailTitulos: 'Georgia, "Times New Roman", serif',
  emailCorpo: 'Arial, Helvetica, sans-serif',
  /** Declaração do guia impresso. */
  guiaImpressoDecorativa: "Amolina Boutique Script",
  guiaImpressoFuncional: "Montserrat",
} as const;

/**
 * Hierarquia tipográfica única do App Cliente. Usada nas telas do portal
 * para que título, subtítulo, corpo, legenda, botão e estado tenham o
 * mesmo peso visual em todas as superfícies do cliente.
 */
export const TIPO_CLIENTE = {
  titulo: "font-serif text-2xl leading-tight text-navy",
  subtitulo: "mt-1 text-sm text-navy/70",
  secao: "font-serif text-xl text-navy",
  corpo: "text-sm text-navy/80",
  legenda: "text-xs text-navy/60",
  etiqueta: "text-[11px] font-medium uppercase tracking-widest text-navy/60",
  botao:
    "inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
  botaoDiscreto:
    "inline-flex items-center gap-2 rounded-lg border border-navy/20 px-3 py-1.5 text-sm text-navy transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
  cartao: "rounded-xl border border-navy/10 bg-white p-5 shadow-[0_1px_2px_rgba(16,16,16,0.04)]",
  aviso: "rounded-lg border border-navy/10 bg-cream/70 p-3 text-sm text-navy/80",
} as const;
