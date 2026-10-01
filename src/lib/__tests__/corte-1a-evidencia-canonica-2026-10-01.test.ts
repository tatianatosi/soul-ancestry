import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  DE_PARA_WORKFLOW_PARA_STATUS,
  ESTADO_INICIAL,
  EVIDENCE_STATUS_EN,
  estadoFinoDaLinha,
  parDeEstado,
  validarEvidencia,
  validarMudancaDeEstado,
} from "@/lib/evidencia-canonica";
import { STATUS_EVIDENCIA_CHECK } from "@/lib/pesquisa-cadeia";

/**
 * Corte 1a (01/10/2026) — Fonte e Evidência Únicas: um só escritor.
 * `research_evidence_items` é a canônica (única com dado real; `evidences`
 * estava vazia). O grafo de 11 estados foi preservado por coluna aditiva com
 * o MESMO CHECK — nada de vocabulário novo.
 */
const ler = (p: string) => readFileSync(p, "utf8");

describe("de-para de estado: desce granularidade, nunca inventa", () => {
  it("todo estado do grafo tem destino, e todo destino é válido no CHECK existente", () => {
    for (const fino of STATUS_EVIDENCIA_CHECK) {
      const grosso = DE_PARA_WORKFLOW_PARA_STATUS[fino];
      expect(grosso, `faltou de-para de ${fino}`).toBeTruthy();
      expect(EVIDENCE_STATUS_EN).toContain(grosso);
    }
    // 11 estados finos, 5 grossos usados: o de-para é lossy de propósito.
    expect(STATUS_EVIDENCIA_CHECK).toHaveLength(11);
  });

  it("o par gravado é sempre coerente; valor inventado é recusado", () => {
    expect(parDeEstado("em_revisao")).toEqual({ workflow_status: "em_revisao", evidence_status: "under_review" });
    expect(parDeEstado("publicada")).toEqual({ workflow_status: "publicada", evidence_status: "validated" });
    // alias antigo continua entrando pelo canonizador, nunca é gravado cru
    expect(parDeEstado("validada_internamente")?.workflow_status).toBe("aprovada_para_entrega");
    expect(parDeEstado("inventado")).toBeNull();
    expect(parDeEstado("")).toBeNull();
  });

  it("linha anterior ao corte vira 'recebida' — o sistema não adivinha o estado fino", () => {
    expect(estadoFinoDaLinha({ evidence_status: "under_review" })).toBe("recebida");
    expect(estadoFinoDaLinha({ workflow_status: "divergente", evidence_status: "inconclusive" })).toBe("divergente");
    expect(ESTADO_INICIAL).toBe("recebida");
  });
});

describe("o grafo continua valendo, agora para todo escritor", () => {
  const base = { autor: "u1", justificativa: "documento conferido", origem: "cartorio" };

  it("transição permitida passa; proibida é recusada", () => {
    expect(validarMudancaDeEstado({ de: "recebida", para: "registrada", ...base }).ok).toBe(true);
    // de divergente nunca se vai direto para entrega
    const r = validarMudancaDeEstado({ de: "divergente", para: "aprovada_para_entrega", ...base });
    expect(r.ok).toBe(false);
    expect(r.erro).toMatch(/não permitida/);
  });

  it("exige autor, justificativa e origem", () => {
    expect(validarMudancaDeEstado({ de: "recebida", para: "registrada", ...base, autor: null }).ok).toBe(false);
    expect(validarMudancaDeEstado({ de: "recebida", para: "registrada", ...base, justificativa: "ok" }).ok).toBe(false);
    expect(validarMudancaDeEstado({ de: "recebida", para: "registrada", ...base, origem: "" }).ok).toBe(false);
  });

  it("estado desconhecido é recusado antes de qualquer gravação", () => {
    expect(validarMudancaDeEstado({ de: "recebida", para: "inventado", ...base }).ok).toBe(false);
  });
});

describe("validação de evidência", () => {
  it("exige título e tipo do vocabulário real", () => {
    expect(validarEvidencia({ titulo: "Certidão de nascimento", tipo: "document" })).toEqual([]);
    expect(validarEvidencia({ titulo: "ab", tipo: "document" }).join(" ")).toMatch(/título/);
    expect(validarEvidencia({ titulo: "Certidão", tipo: "inventado" }).join(" ")).toMatch(/tipo/);
  });
});

describe("escritor único: ninguém mais grava evidência", () => {
  // Corte 0 (01/10): o corpo do escritor saiu para `.server.ts` (padrão do repo
  // para lógica de servidor compartilhada), e `.functions.ts` virou a casca HTTP.
  // O teste passa a olhar os dois juntos: o que importa é que a cadeia
  // releitura → auditoria → timeline exista no módulo canônico, não em qual
  // dos dois arquivos cada linha mora.
  const canonico =
    ler("src/lib/evidencia-canonica.functions.ts") + ler("src/lib/evidencia-canonica.server.ts");

  it("o módulo canônico grava com releitura, audita e registra na timeline", () => {
    for (const t of [
      '.from("research_evidence_items")',
      "inserirComVerificacao(",
      "gravarComVerificacao(",
      "validarMudancaDeEstado(",
      "audit_logs",
      "registrarTimelineCaso(",
    ])
      expect(canonico).toContain(t);
  });

  it("os quatro escritores concorrentes foram aposentados com mensagem que diz para onde ir", () => {
    for (const f of [
      "src/lib/biblioteca-evidencias.functions.ts",
      "src/lib/fontes-documentos-integracao.functions.ts",
      "src/lib/pesquisa-cadeia.functions.ts",
      "src/lib/golive-escritores.functions.ts",
    ])
      expect(ler(f), f).toContain("throw new Error(EVIDENCIA_ESCRITOR_APOSENTADO)");
  });

  it("nenhum escritor novo de `evidences` sobrou no módulo canônico", () => {
    expect(canonico).not.toContain('.from("evidences")');
    expect(canonico).not.toContain('.from("evidencias")');
  });

  it("a migration carrega o CHECK já aprovado, sem termo novo", () => {
    const sql = ler("supabase/migrations/20261001140000_research_evidence_items_workflow_status.sql");
    expect(sql).toContain("rei_workflow_status_ck");
    for (const v of STATUS_EVIDENCIA_CHECK) expect(sql, `faltou ${v}`).toContain(`'${v}'`);
    // aditiva: nunca NOT NULL, nunca default que reescreva linha existente
    expect(sql).toContain("ADD COLUMN IF NOT EXISTS workflow_status text;");
    expect(sql).not.toMatch(/workflow_status\s+text\s+NOT NULL/i);
  });
});
