import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { historicoSanitizado, solicitacoesAbertasCliente } from "@/lib/portal-dados-vivos";

/**
 * REVERIFICACAO-ADVERSARIAL-GIOVANNA (27/09/2026) — os dois gaps reais da
 * Ficha Piloto da Giovanna que a auditoria anterior declarou "conectados":
 *  - #47-49 Conta > Histórico (3 marcos): texto fixo duplicado, zero consulta;
 *  - #6/#28 Documento foco / Pendência principal: só frase genérica do motor.
 */
describe("histórico da Conta (case_timeline_events aprovado para o cliente)", () => {
  it("só passa visibility=cliente_aprovado com resumo, no máximo 3, mais recente primeiro", () => {
    const r = historicoSanitizado([
      { id: "a", visibility: "interno", summary_client_approved: "Não deve aparecer", occurred_at: "2026-09-20" },
      { id: "b", visibility: "cliente_aprovado", summary_client_approved: "   ", occurred_at: "2026-09-21" },
      { id: "c", visibility: "cliente_aprovado", summary_client_approved: "Caso criado.", occurred_at: "2026-09-01" },
      { id: "d", visibility: "cliente_aprovado", summary_client_approved: "Árvore paterna expandida.", occurred_at: "2026-09-10" },
      { id: "e", visibility: "cliente_aprovado", summary_client_approved: "Erwin conectado.", occurred_at: "2026-09-15" },
      { id: "f", visibility: "cliente_aprovado", summary_client_approved: "Mais antigo.", occurred_at: "2026-08-01" },
    ]);
    expect(r.map((m) => m.id)).toEqual(["e", "d", "c"]);
    expect(r.every((m) => !/Não deve aparecer/.test(m.texto))).toBe(true);
  });

  it("resumo aprovado com termo interno (hipótese) não atravessa, mesma fronteira das publicações", () => {
    const r = historicoSanitizado([
      {
        id: "h",
        visibility: "cliente_aprovado",
        summary_client_approved: "Hipótese de origem em Rodeio.",
        occurred_at: "2026-09-20",
      },
    ]);
    expect(r).toEqual([]);
  });

  it("nunca expõe o title interno do evento — o tipo de saída nem tem esse campo", () => {
    const [m] = historicoSanitizado([
      {
        id: "x",
        visibility: "cliente_aprovado",
        summary_client_approved: "Texto para a família.",
        occurred_at: null,
        created_at: "2026-09-02",
      },
    ]);
    expect(Object.keys(m!).sort()).toEqual(["data", "id", "texto"]);
    expect(m!.data).toBe("2026-09-02");
  });

  it("a Conta lê a fonte real e não repete mais o placeholder duplicado", () => {
    const conta = readFileSync("src/routes/portal/conta.tsx", "utf8");
    expect(conta).toContain("data-conta-marcos");
    expect(conta).toContain("vivo.data?.historico");
    expect(conta.split("Ainda não há conversas disponíveis neste espaço.").length - 1).toBe(1);
  });

  it("o servidor do portal lê case_timeline_events só aprovados, do caso ativo, sem resumo interno", () => {
    const fn = readFileSync("src/lib/portal-dados-vivos.functions.ts", "utf8");
    expect(fn).toContain('.from("case_timeline_events")');
    expect(fn).toContain('.eq("visibility", "cliente_aprovado")');
    expect(fn).not.toContain("summary_internal");
  });

  it("existe escritor real no Desk (antes todo escritor gravava visibility interno fixo)", () => {
    const escritor = readFileSync("src/lib/timeline-caso.functions.ts", "utf8");
    expect(escritor).toContain('visibility: "cliente_aprovado"');
    expect(escritor).toContain("gravarComVerificacao");
    const caso360 = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    expect(caso360).toContain("aprovarEventoTimelineParaCliente");
    expect(caso360).toContain("Marcos aprovados para o App Cliente");
  });
});

describe("Documentos > Solicitados nomeia o documento pedido", () => {
  it("só pedidos abertos e com título; recusado traz o motivo", () => {
    const r = solicitacoesAbertasCliente([
      {
        id: "1",
        titulo: "Ato de nascimento italiano de Alessandro Prade",
        status: "aguardando",
        prazo: "2026-10-15T00:00:00Z",
      },
      { id: "2", titulo: "Certidão de casamento", status: "recusado", motivo_recusa: "Arquivo ilegível." },
      { id: "3", titulo: "Já recebido", status: "recebido" },
      { id: "4", titulo: "   ", status: "aguardando" },
    ]);
    expect(r.map((s) => s.id)).toEqual(["1", "2"]);
    expect(r[0]!.prazo).toBe("2026-10-15");
    expect(r[0]!.motivoRecusa).toBeNull();
    expect(r[1]!.recusado).toBe(true);
    expect(r[1]!.motivoRecusa).toBe("Arquivo ilegível.");
  });

  it("a aba Documentos renderiza cada pedido e liga o envio ao pedido", () => {
    const docs = readFileSync("src/routes/portal/documentos.tsx", "utf8");
    expect(docs).toContain("data-documentos-solicitados-lista");
    expect(docs).toContain("<EnviarDocumento casoId={casoAtivo} solicitacaoId={s.id} />");
    // O envio geral continua existindo (fidelidade-visual-2026-09-23).
    expect(docs).toContain("<EnviarDocumento casoId={casoAtivo} />");
  });
});
