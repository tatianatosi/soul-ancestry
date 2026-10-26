/**
 * P0 do App Cliente (24/10/2026) — Documentos da Ana, sem inventar documentos.
 * Checklist consolidado com contador, montado SÓ com pedidos reais da equipe
 * (`portal_document_requests`); sem pedidos, "Em preparação".
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { checklistDocumentalCliente, solicitacoesAbertasCliente } from "@/lib/portal-dados-vivos";

const pedido = (id: string, status: string, extra: Record<string, unknown> = {}) => ({
  id,
  status,
  titulo: `Pedido ${id}`,
  descricao: null,
  prazo: null,
  motivo_recusa: null,
  obrigatorio: true,
  ...extra,
});

describe("checklistDocumentalCliente", () => {
  it("sem pedidos, a lista é vazia: nada é inventado", () => {
    expect(checklistDocumentalCliente([])).toEqual({ itens: [], total: 0, concluidos: 0 });
  });

  it("traduz cada estado para a linguagem da família", () => {
    const c = checklistDocumentalCliente([
      pedido("a", "aceito"),
      pedido("b", "recebido"),
      pedido("c", "em_revisao"),
      pedido("d", "aguardando", { prazo: "2026-11-30T00:00:00Z" }),
      pedido("e", "recusado", { prazo: "2026-11-15" }),
    ]);
    const por = Object.fromEntries(c.itens.map((i) => [i.id, [i.tom, i.rotulo]]));
    expect(por).toEqual({
      a: ["ok", "Recebido"],
      b: ["analise", "Em análise"],
      c: ["analise", "Em análise"],
      d: ["pendente", "Pendente de envio"],
      e: ["pendente", "Precisa reenviar"],
    });
  });

  it("contador: só pedidos aceitos contam como concluídos", () => {
    const c = checklistDocumentalCliente([pedido("a", "aceito"), pedido("b", "aceito"), pedido("c", "recebido"), pedido("d", "aguardando")]);
    expect(c.total).toBe(4);
    expect(c.concluidos).toBe(2);
  });

  it("pedidos cancelados e sem título não entram na conta", () => {
    const c = checklistDocumentalCliente([pedido("a", "aceito"), pedido("x", "cancelado"), pedido("y", "aguardando", { titulo: "   " })]);
    expect(c.total).toBe(1);
    expect(c.itens.map((i) => i.id)).toEqual(["a"]);
  });

  it("prazo só aparece para o que ainda está pendente, só a data", () => {
    const c = checklistDocumentalCliente([pedido("a", "aceito", { prazo: "2026-11-30" }), pedido("b", "aguardando", { prazo: "2026-11-30T10:00:00Z" })]);
    expect(c.itens.find((i) => i.id === "a")!.prazo).toBeNull();
    expect(c.itens.find((i) => i.id === "b")!.prazo).toBe("2026-11-30");
  });

  it("cada título vem do pedido da equipe, não de lista pronta", () => {
    const c = checklistDocumentalCliente([pedido("a", "aguardando", { titulo: "Certidão de casamento de Adair" })]);
    expect(c.itens[0].titulo).toBe("Certidão de casamento de Adair");
  });

  it("os pedidos abertos (seção Solicitados) continuam só aguardando/recusado", () => {
    const linhas = [pedido("a", "aceito"), pedido("b", "aguardando"), pedido("c", "recusado"), pedido("d", "em_revisao")];
    expect(solicitacoesAbertasCliente(linhas).map((s) => s.id)).toEqual(["b", "c"]);
  });
});

describe("tela de Documentos da família", () => {
  const tela = readFileSync("src/routes/portal/documentos.tsx", "utf8");
  const vivas = readFileSync("src/lib/portal-dados-vivos.functions.ts", "utf8");

  it("o envio de documento aparece no estado vazio E quando há pedidos (login real)", () => {
    const real = tela.slice(tela.indexOf("data-aba-documentos-vivo"));
    // 26/10/2026 — Lovable (mockup17) removeu a caixa "Entregas → atalho para
    // Legado" (e o CTA "Conhecer o Legado" que vivia nela). O botão de envio
    // "catch-all" segue sempre visível no fim de Solicitados.
    expect(real).toMatch(/A lista de documentos será apresentada quando for compartilhada com você[\s\S]*?<EnviarDocumento casoId=\{casoAtivo\} \/>/); // estado vazio
    expect(real).toMatch(/<EnviarDocumento casoId=\{casoAtivo\} solicitacaoId=\{s\.id\} \/>/); // em cada pedido
    expect((real.match(/<EnviarDocumento /g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it("o checklist consolidado existe no login real, acima das seções, e na prévia da equipe", () => {
    const real = tela.slice(tela.indexOf("data-aba-documentos-vivo"));
    expect(real).toMatch(/<ChecklistDocumental checklist=\{vivo\.data\?\.checklist\} \/>/);
    expect(tela).toMatch(/\{comItens \? \(\s*<span className="app-chip" data-tom="ok" data-checklist-contador>/);
  });

  it("sem pedidos continua 'Em preparação' e o checklist não tem nenhum título fixo", () => {
    const comp = tela.slice(tela.indexOf("function ChecklistDocumental("), tela.indexOf("function ChecklistDocumental(") + 2600);
    expect(comp).toContain("Em preparação");
    // Só rótulos de estado; nenhum nome de documento escrito no código do checklist.
    expect(comp).not.toMatch(/Certid[ãa]o|Graz|Dossiê|Registro da|Passaporte|Naturaliza/);
  });

  // 25/10/2026, decisão da Proprietária: os documentos da Ana vêm dos registros
  // liberados no banco, com o nome real do arquivo — nenhuma lista fixa na tela.
  it("a tela não traz lista fixa de documentos; liberados vêm do registro real", () => {
    expect(tela).not.toMatch(/ACERVO_EM_CONFERENCIA|Graz|Viena · 1938/);
    expect(tela).toMatch(/d\.liberado_cliente/);
  });

  it("a leitura traz todos os pedidos do caso, sem arquivados, e a contagem de pendência segue restrita", () => {
    expect(vivas).toMatch(/\.is\("archived_at", null\)/);
    expect(vivas).toMatch(/p\.status === "aguardando" \|\| p\.status === "recusado"/);
    expect(vivas).toMatch(/checklist: checklistDocumentalCliente\(pedidos\)/);
  });
});
