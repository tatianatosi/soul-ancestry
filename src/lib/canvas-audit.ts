export type CanvasAuditReport = {
  projeto: "Ancestral Canvas";
  jornada: {
    cards: number;
    todosComTokenAreia: boolean;
    cardsSemToken: string[];
  };
  telas: Record<string, boolean>;
  paleta: { navy: string; gold: string; cream: string; terracotta: string };
  fontes: { display: string; body: string };
  erros: string[];
  ok: boolean;
};

const consoleErrors: string[] = [];

if (typeof window !== "undefined" && !(window as any).__canvasAuditHooked) {
  (window as any).__canvasAuditHooked = true;
  const original = console.error;
  console.error = (...args: unknown[]) => {
    consoleErrors.push(args.map((a) => String(a)).join(" "));
    original(...args);
  };
}

export function runCanvasAudit(): CanvasAuditReport | null {
  if (typeof document === "undefined") return null;

  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-audit="jornada-card"]'));
  const cardsSemToken = cards
    .filter((el) => !el.className.includes("bg-areia"))
    .map((el) => el.textContent?.slice(0, 40) ?? "card");

  const css = getComputedStyle(document.documentElement);
  const telas = ["home", "jornada", "radar", "arvore", "docs", "biblio", "conta"];

  const report: CanvasAuditReport = {
    projeto: "Ancestral Canvas",
    jornada: {
      cards: cards.length,
      todosComTokenAreia: cards.length > 0 && cardsSemToken.length === 0,
      cardsSemToken,
    },
    telas: Object.fromEntries(
      telas.map((t) => [t, Boolean(document.querySelector(`[data-tab="${t}"]`))]),
    ),
    paleta: {
      navy: css.getPropertyValue("--navy").trim(),
      gold: css.getPropertyValue("--gold").trim(),
      cream: css.getPropertyValue("--cream").trim(),
      terracotta: css.getPropertyValue("--terracotta").trim(),
    },
    fontes: {
      display: css.getPropertyValue("--font-serif").trim(),
      body: css.getPropertyValue("--font-sans").trim(),
    },
    erros: [...consoleErrors],
    ok: cardsSemToken.length === 0 && consoleErrors.length === 0,
  };

  console.log("[Ancestral Canvas — auditoria]", JSON.stringify(report, null, 2));
  (window as any).__canvasAudit = report;
  return report;
}
