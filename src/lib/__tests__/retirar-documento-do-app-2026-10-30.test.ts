import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * 30/10/2026 — P0-2 do plano mestre. A Proprietária decidiu retirar do App os
 * documentos da Ana até haver versão sanitizada; o guard de `documents` só
 * aceita a mudança de sessão autenticada, então a retirada é uma ação do Desk.
 */
const servidor = readFileSync("src/lib/documentos.functions.ts", "utf8");
const inicio = servidor.indexOf("export const retirarDocumentoDoApp");
const funcao = servidor.slice(inicio, servidor.indexOf("\n/* =====", inicio));
const painel = readFileSync("src/components/privacidade/painel.tsx", "utf8");

describe("retirarDocumentoDoApp — servidor", () => {
  it("exige sessão autenticada, papel de gestão de documentos e motivo", () => {
    expect(inicio).toBeGreaterThan(-1);
    expect(funcao).toContain("requireSupabaseAuth");
    expect(funcao).toContain("PAPEIS_UPLOAD.includes(papel)");
    expect(funcao).toMatch(/motivo\.trim\(\)\.length < 5/);
  });

  it("só desliga a liberação: não arquiva nem apaga", () => {
    expect(funcao).toContain('liberado_cliente: false, status: "pendente_de_revisao"');
    expect(funcao).not.toContain("archived_at");
    expect(funcao).not.toContain(".delete(");
  });

  it("confere a releitura e registra o motivo na linha do tempo do caso", () => {
    expect(funcao).toContain("exigirPersistenciaConferida(payload, r.registro)");
    expect(funcao).toContain("Documento retirado do App Cliente");
    expect(funcao).toContain("summaryInternal: motivo");
  });
});

describe("painel de privacidade — botão Retirar do App", () => {
  it("só aparece em documento liberado ao cliente e pede motivo pela ação operacional", () => {
    const i = painel.indexOf('rotulo="Retirar do App"');
    expect(i).toBeGreaterThan(-1);
    const antes = painel.slice(Math.max(0, i - 300), i);
    expect(antes).toContain('d["liberado_cliente"] === true');
    expect(antes).toContain("<AcaoOperacional");
    expect(painel).toContain("retirarDoApp({ data: { id: d[\"id\"], motivo } })");
  });
});
