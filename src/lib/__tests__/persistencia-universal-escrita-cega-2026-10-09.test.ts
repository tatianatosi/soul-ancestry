import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { exigirLinhaGravada } from "@/lib/persistencia.server";

/**
 * Persistência universal (09/10/2026).
 *
 * "Tudo que eu faço segue não salvando." Medido: 49 `update`/`upsert` na
 * camada de servidor não conferiam se alguma linha foi gravada. No Supabase um
 * `update` que bate em 0 linhas (RLS negou, id de outra organização, registro
 * arquivado) NÃO devolve erro — a tela mostrava "Salvo" e nada mudava.
 *
 * Regra: toda escrita POR ID passa por `gravarComVerificacao` ou pede a linha
 * de volta (`.select(...)`) e confere com `exigirLinhaGravada`. Arquivo novo que
 * grava por id sem isso quebra esta suíte.
 */

/** Exceções com motivo — efeito colateral onde erro fatal faria mais mal. */
const EXCECOES: Record<string, string> = {
  "perfil-institucional-persistido.server.ts:contract_versions":
    "`.is(institutional_profile_snapshot, null)`: só grava o snapshot uma vez — 0 linhas é o caso normal da segunda chamada.",
  "equipe.functions.ts:staff_access":
    "Fluxo de login/convite pelo cliente administrativo: carimbo de último acesso e vínculo de auth. Erro fatal aqui trancaria a equipe fora do sistema.",
  "portal.functions.ts:client_portal_access":
    "Fluxo de magic link do cliente (contadores de uso, vínculo de auth). Erro fatal aqui impediria o cliente de entrar.",
  "contrato-parametros.functions.ts:contract_case_parameters":
    "Recalcula o % de completude depois de outra gravação já confirmada — derivado, não o dado digitado.",
  "contrato-parametros.functions.ts:contract_parameter_previews":
    "Carimba `updated_by` no rascunho depois da gravação principal já confirmada.",
  "contratos.functions.ts:contract_versions":
    "Marca a versão como `validation_failed` no caminho de erro — o erro original já está sendo devolvido.",
  "achados-genealogicos.functions.ts:case_alerts":
    "Abre/resolve o alerta derivado do achado depois que o achado já foi gravado e confirmado — sinal, não o dado.",
  "d7-microentrega.server.ts:case_alerts":
    "Resolve o alerta de D7 depois que a micro-entrega já foi confirmada — sinal derivado.",
  "jornada-cliente.functions.ts:case_alerts":
    "Resolve o alerta de pendência depois da gravação principal já confirmada — sinal derivado.",
  "contrato-preparar.functions.ts:audit_logs":
    "Complementa o registro de auditoria da preparação; a auditoria não é o dado digitado.",
};

function arquivosServidor(): string[] {
  return readdirSync("src/lib")
    .filter((f) => f.endsWith(".functions.ts") || f.endsWith(".server.ts"))
    .filter((f) => f !== "persistencia.server.ts")
    .map((f) => join("src/lib", f));
}

/** Escritas por id (`.update(...)...eq("id", ...)`) que não pedem a linha de volta. */
function escritasCegasPorId(): { arquivo: string; tabela: string; linha: number }[] {
  const achados: { arquivo: string; tabela: string; linha: number }[] = [];
  for (const caminho of arquivosServidor()) {
    const s = readFileSync(caminho, "utf8");
    const re = /\.from\("([a-z_]+)"\)\s*\.update\(/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(s))) {
      const resto = s.slice(m.index, m.index + 1200);
      const fim = resto.search(/;\s*(\n|$)|,\s*\n\s*"[a-z_]+",\s*\n/);
      const cadeia = fim >= 0 ? resto.slice(0, fim + 1) : resto;
      if (!/\.eq\("id",/.test(cadeia)) continue; // em lote: 0 linhas pode ser legítimo
      if (/\.select\(/.test(cadeia)) continue; // pede a linha de volta
      achados.push({ arquivo: caminho, tabela: m[1], linha: s.slice(0, m.index).split("\n").length });
    }
  }
  return achados;
}

describe("persistência universal — nenhuma gravação por id às cegas", () => {
  it("toda gravação por id confere a linha gravada — ou é exceção declarada com motivo", () => {
    const semConferir = escritasCegasPorId().filter(
      (e) => !EXCECOES[`${e.arquivo.replace("src/lib/", "")}:${e.tabela}`],
    );
    expect(
      semConferir.map((e) => `${e.arquivo}:${e.linha} (${e.tabela})`),
      "gravação por id sem `.select` + `exigirLinhaGravada`",
    ).toEqual([]);
  });

  it("as exceções declaradas ainda existem (lista não envelhece calada)", () => {
    const vivas = new Set(escritasCegasPorId().map((e) => `${e.arquivo.replace("src/lib/", "")}:${e.tabela}`));
    for (const chave of Object.keys(EXCECOES)) expect(vivas.has(chave), chave).toBe(true);
  });

  it("cobertura medida em 09/10/2026: 24 gravações passaram a conferir a linha", () => {
    const total = arquivosServidor().reduce(
      (n, f) => n + (readFileSync(f, "utf8").match(/exigirLinhaGravada\(|erroOuNadaGravado\(/g)?.length ?? 0),
      0,
    );
    // 15 com exigirLinhaGravada + 9 com erroOuNadaGravado + a definição de erroOuNadaGravado
    expect(total).toBeGreaterThanOrEqual(25);
  });
});

describe("exigirLinhaGravada — o comportamento", () => {
  it("0 linhas gravadas é erro com o nome da tabela, nunca 'Salvo'", () => {
    expect(() => exigirLinhaGravada({ data: [], error: null }, "leads")).toThrow(/nada foi gravado em leads/);
    expect(() => exigirLinhaGravada({ data: null, error: null }, "crm_casos")).toThrow(/nada foi gravado em crm_casos/);
  });

  it("erro do banco é repassado como está", () => {
    expect(() => exigirLinhaGravada({ data: null, error: { message: "permission denied" } }, "x")).toThrow(
      "permission denied",
    );
  });

  it("uma ou mais linhas gravadas passa", () => {
    expect(() => exigirLinhaGravada({ data: [{ id: "a" }], error: null }, "leads")).not.toThrow();
    expect(() => exigirLinhaGravada({ data: { id: "a" }, error: null }, "leads")).not.toThrow();
  });
});
