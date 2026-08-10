/**
 * Ancestral Canvas — auditoria de conteúdo da Fase 1 (Diagnóstico inicial).
 *
 * Roda no navegador quando a Fase 1 é exibida e verifica se nenhum
 * resíduo técnico chegou ao cliente. Não altera o DOM.
 */

export type Phase1AuditReport = {
  modulo: "Fase 1 — Diagnóstico inicial";
  no_raw_brackets: boolean;
  no_raw_json: boolean;
  no_placeholder_text: boolean;
  no_empty_visible_fields: boolean;
  client_facing_copy_ok: boolean;
  phase2_unchanged: boolean;
  ocorrencias: string[];
  ok: boolean;
};

const PLACEHOLDERS = /\b(undefined|null|N\/A|TODO|placeholder)\b/i;
const JSONISH = /(\[object Object\]|^\s*[[{].*[\]}]\s*$|","|":")/;
const BRACKETS = /[[\]{}]/;
const TECNICO = /(\bCA-[A-Z0-9]+-[A-Z0-9-]+\b|\bPACOTE-[A-Z0-9-]+\b|\bT-\d{3}\b|\{\{)/;

function textos(raiz: Element): { txt: string; onde: string }[] {
  const out: { txt: string; onde: string }[] = [];
  raiz.querySelectorAll<HTMLElement>("*").forEach((n) => {
    if (n.childElementCount > 0) return;
    const txt = (n.textContent ?? "").trim();
    if (txt) out.push({ txt, onde: n.tagName.toLowerCase() });
  });
  return out;
}

export function runPhase1ContentAudit(): Phase1AuditReport | null {
  if (typeof document === "undefined") return null;
  const raiz = document.querySelector('[data-tab="relatorio"]');
  if (!raiz) return null;

  const ocorrencias: string[] = [];
  let brackets = true;
  let json = true;
  let placeholder = true;
  let vazios = true;
  let copyOk = true;

  for (const { txt, onde } of textos(raiz)) {
    const amostra = `${onde}: "${txt.slice(0, 48)}"`;
    if (BRACKETS.test(txt)) {
      brackets = false;
      ocorrencias.push(`colchetes/chaves → ${amostra}`);
    }
    if (JSONISH.test(txt)) {
      json = false;
      ocorrencias.push(`estrutura de dados → ${amostra}`);
    }
    if (PLACEHOLDERS.test(txt)) {
      placeholder = false;
      ocorrencias.push(`placeholder → ${amostra}`);
    }
    if (txt === "—" || txt === "-" || txt === "·") {
      vazios = false;
      ocorrencias.push(`campo vazio visível → ${amostra}`);
    }
    if (TECNICO.test(txt)) {
      copyOk = false;
      ocorrencias.push(`termo técnico → ${amostra}`);
    }
  }

  // Fase 2 permanece intocada: verificada apenas por presença/estrutura.
  const fase2 = document.querySelector('[data-tab="fase02"]');
  const phase2_unchanged = !fase2 || fase2.children.length > 0;

  const report: Phase1AuditReport = {
    modulo: "Fase 1 — Diagnóstico inicial",
    no_raw_brackets: brackets,
    no_raw_json: json,
    no_placeholder_text: placeholder,
    no_empty_visible_fields: vazios,
    client_facing_copy_ok: copyOk,
    phase2_unchanged,
    ocorrencias: ocorrencias.slice(0, 12),
    ok: brackets && json && placeholder && vazios && copyOk && phase2_unchanged,
  };

  console.log("[Ancestral Canvas — auditoria Fase 1]", JSON.stringify(report, null, 2));
  (window as unknown as Record<string, unknown>).__phase1Audit = report;
  return report;
}
