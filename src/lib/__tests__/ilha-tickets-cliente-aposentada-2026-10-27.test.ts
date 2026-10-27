import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { PORTAL_ABAS_CANONICAS } from "@/lib/portal-navegacao";

/**
 * Decisão da Proprietária, 27/10/2026, perguntada nominalmente na auditoria
 * de espectro completo: "o cliente ganha tickets e deve ir para as áreas
 * correspondentes no desk das suas demandas e o atendimento é feito pelo
 * whatsapp".
 *
 * Veredicto (padrão de `classificar-orfao`): APOSENTADA_CLASSIFICADA.
 * `/portal/casos/$id` + `/portal/mensagens/$id` (sistema de tickets
 * funcional, achado na auditoria, só alcançável por uma ferramenta de
 * debug interna hoje órfã) NÃO entra no App Cliente. O canal de
 * atendimento ao vivo continua sendo só o WhatsApp — já existe em
 * "Estamos por perto" na aba Conta (conta.tsx). Nada foi apagado: os
 * arquivos de rota continuam existindo, só não são promovidos a aba nem
 * linkados de lugar nenhum do App.
 *
 * Este teste trava a decisão, não o código morto: falha se alguém religar
 * a ilha numa das 7 abas canônicas no futuro, sem decisão nova da
 * Proprietária.
 */
describe("Ilha de tickets do cliente (/portal/casos/$id, /portal/mensagens/$id) — aposentada, não ligada", () => {
  it("nenhuma das 7 abas canônicas do App é a rota da ilha de tickets", () => {
    expect(PORTAL_ABAS_CANONICAS).not.toContain("Tickets");
    expect(PORTAL_ABAS_CANONICAS).not.toContain("Mensagens");
    expect(PORTAL_ABAS_CANONICAS.length).toBe(7);
  });

  it("o chrome do App (portal-shell.tsx) não lista link para a ilha de tickets", () => {
    const shell = readFileSync("src/components/portal/portal-shell.tsx", "utf8");
    expect(shell).not.toContain("/portal/casos/$id");
    expect(shell).not.toContain("/portal/mensagens/$id");
  });

  it("o atendimento ao vivo do cliente continua só WhatsApp, declarado na Conta", () => {
    const conta = readFileSync("src/routes/portal/conta.tsx", "utf8");
    expect(conta).toContain("Estamos por perto");
    expect(conta).toContain("WHATSAPP_ESPECIALISTA");
  });
});
