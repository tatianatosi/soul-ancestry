export type CanvasAuditReport = {
  projeto: "Ancestral Canvas";
  font_ok: boolean;
  contrast_ok: boolean;
  cards_por_bloco: Record<string, number>;
  jornada: {
    cards: number;
    todosComTokenAreia: boolean;
    cardsSemToken: string[];
  };
  telas: Record<string, boolean>;
  paleta: { navy: string; gold: string; cream: string; terracotta: string; areia: string };
  fontes: { display: string; body: string };
  falhas: { fonte: string[]; contraste: string[] };
  erros: string[];
  ok: boolean;
};

const consoleErrors: string[] = [];
const MIN_FONT_PX = 11;
const MIN_CONTRAST = 4.5;

if (typeof window !== "undefined" && !(window as any).__canvasAuditHooked) {
  (window as any).__canvasAuditHooked = true;
  const original = console.error;
  console.error = (...args: unknown[]) => {
    consoleErrors.push(args.map((a) => String(a)).join(" "));
    original(...args);
  };
}

function parseColor(value: string): [number, number, number, number] | null {
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  return [parts[0], parts[1], parts[2], parts[3] ?? 1];
}

function effectiveBackground(el: HTMLElement): [number, number, number] {
  let node: HTMLElement | null = el;
  while (node) {
    const c = parseColor(getComputedStyle(node).backgroundColor);
    if (c && c[3] > 0.6) return [c[0], c[1], c[2]];
    node = node.parentElement;
  }
  return [255, 255, 255];
}

function luminance([r, g, b]: [number, number, number]) {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(fg: [number, number, number], bg: [number, number, number]) {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

function blend(fg: [number, number, number, number], bg: [number, number, number]): [number, number, number] {
  const a = fg[3];
  return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a)];
}

const CARD_SELECTOR =
  '[class*="rounded-xl"][class*="border"], [class*="rounded-2xl"][class*="border"], [data-audit="jornada-card"]';

export function runCanvasAudit(): CanvasAuditReport | null {
  if (typeof document === "undefined") return null;

  const jornadaCards = Array.from(document.querySelectorAll<HTMLElement>('[data-audit="jornada-card"]'));
  const cardsSemToken = jornadaCards
    .filter((el) => !el.className.includes("bg-areia"))
    .map((el) => el.textContent?.slice(0, 40) ?? "card");

  const css = getComputedStyle(document.documentElement);
  const telas = ["home", "jornada", "radar", "arvore", "docs", "biblio", "conta"];

  const cards_por_bloco: Record<string, number> = {};
  const falhasFonte: string[] = [];
  const falhasContraste: string[] = [];

  for (const bloco of Array.from(document.querySelectorAll<HTMLElement>("[data-tab]"))) {
    const nome = bloco.dataset.tab ?? "bloco";
    const cards = Array.from(bloco.querySelectorAll<HTMLElement>(CARD_SELECTOR));
    cards_por_bloco[nome] = cards.length;

    for (const card of cards) {
      const nodes = Array.from(card.querySelectorAll<HTMLElement>("*")).filter(
        (n) => n.childElementCount === 0 && (n.textContent ?? "").trim().length > 0,
      );
      for (const n of nodes) {
        const s = getComputedStyle(n);
        const size = parseFloat(s.fontSize);
        const rotulo = (n.textContent ?? "").trim().slice(0, 32);
        if (size < MIN_FONT_PX) falhasFonte.push(`${nome}: "${rotulo}" ${size}px`);
        const fg = parseColor(s.color);
        if (!fg) continue;
        const bg = effectiveBackground(n);
        const ratio = contrastRatio(blend(fg, bg), bg);
        const large = size >= 24 || (size >= 18.66 && parseInt(s.fontWeight, 10) >= 600);
        if (ratio < (large ? 3 : MIN_CONTRAST)) {
          falhasContraste.push(`${nome}: "${rotulo}" ${ratio.toFixed(2)}:1`);
        }
      }
    }
  }

  const font_ok = falhasFonte.length === 0;
  const contrast_ok = falhasContraste.length === 0;

  const report: CanvasAuditReport = {
    projeto: "Ancestral Canvas",
    font_ok,
    contrast_ok,
    cards_por_bloco,
    jornada: {
      cards: jornadaCards.length,
      todosComTokenAreia: jornadaCards.length > 0 && cardsSemToken.length === 0,
      cardsSemToken,
    },
    telas: Object.fromEntries(telas.map((t) => [t, Boolean(document.querySelector(`[data-tab="${t}"]`))])),
    paleta: {
      navy: css.getPropertyValue("--navy").trim(),
      gold: css.getPropertyValue("--gold").trim(),
      cream: css.getPropertyValue("--cream").trim(),
      terracotta: css.getPropertyValue("--terracotta").trim(),
      areia: css.getPropertyValue("--areia").trim(),
    },
    fontes: {
      display: css.getPropertyValue("--font-serif").trim(),
      body: css.getPropertyValue("--font-sans").trim(),
    },
    falhas: { fonte: falhasFonte.slice(0, 12), contraste: falhasContraste.slice(0, 12) },
    erros: [...consoleErrors],
    ok: font_ok && contrast_ok && cardsSemToken.length === 0 && consoleErrors.length === 0,
  };

  console.log("[Ancestral Canvas — auditoria de legibilidade]", JSON.stringify(report, null, 2));
  (window as any).__canvasAudit = report;
  return report;
}
