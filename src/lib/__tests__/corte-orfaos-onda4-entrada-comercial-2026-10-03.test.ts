import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { ESTADOS_ACEITE, EVENTOS_CONVERSAO, validarTransicaoAceite } from "@/lib/conversao";
import { validarTriagem } from "@/lib/ancestralscan-triagem";

/**
 * Corte ÓRFÃOS onda 4 (03/10/2026) — entrada comercial.
 *
 * Os 6 escritores da entrada comercial existiam, testados, com ZERO chamador
 * de UI: `/conversao` mostrava o funil sem mover nada, e a triagem do Scan só
 * podia ser vista num lead que nunca nascia pelo Desk.
 */

const telaConversao = readFileSync("src/routes/_authenticated/conversao.tsx", "utf8");
const telaLeads = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");
const painelAceite = readFileSync("src/components/crm/avancar-aceite.tsx", "utf8");
const painelTriagem = readFileSync("src/components/crm/importar-triagem-scan.tsx", "utf8");

describe("os 6 órfãos passaram a ser chamados por tela", () => {
  it.each([
    ["avancarEstadoAceite", painelAceite],
    ["registrarEventoConversao", painelAceite],
    ["garantirTemplateOnboarding", painelAceite],
    ["importarTriagem", painelTriagem],
    ["criarLeadDeTriagem", painelTriagem],
    ["verificarDuplicidadeLead", painelTriagem],
  ])("%s tem chamador", (fn, arquivo) => {
    expect(arquivo).toContain(fn);
  });

  it("e os painéis estão montados nas rotas reais", () => {
    expect(telaConversao).toMatch(/AvancarAceite/);
    expect(telaLeads).toMatch(/ImportarTriagemScan/);
  });
});

describe("a regra de aceite não foi afrouxada ao ganhar tela", () => {
  it("contrato exige confirmação formal registrada — aceite verbal não basta", () => {
    const r = validarTransicaoAceite("contrato_enviado", { confirmacaoFormalRecebida: false });
    expect(r.permitido).toBe(false);
    expect(r.motivos.join(" ")).toMatch(/Aceite verbal não basta/);
  });

  it("a tela oferece só os estados da máquina, nunca texto livre", () => {
    expect(painelAceite).toMatch(/ESTADOS_ACEITE\.map/);
    expect(painelAceite).toMatch(/EVENTOS_CONVERSAO\.map/);
    expect(ESTADOS_ACEITE.length).toBe(10);
    expect(EVENTOS_CONVERSAO.length).toBe(13);
  });

  it("nenhuma ação externa é oferecida — não envia, não assina, não cobra", () => {
    expect(painelAceite).toMatch(/Não envia, não assina, não cobra/);
    expect(painelAceite).not.toMatch(/asaas|whatsapp|enviarMensagem/i);
  });
});

describe("a triagem do Scan entra auditável e orientativa", () => {
  it("exige versão, data e consentimento", () => {
    const e = validarTriagem({});
    expect(e.map((x) => x.campo)).toEqual(expect.arrayContaining(["versaoScan", "respondidoEm", "consentimentoStatus"]));
  });

  it("consentimento concedido carrega a versão do aviso publicado", () => {
    expect(painelTriagem).toMatch(/AVISO_PRIVACIDADE\.versao/);
  });

  it("a tela diz que o Scan não confirma elegibilidade, via, produto nem preço", () => {
    expect(painelTriagem).toMatch(/nunca confirma elegibilidade, via, produto, preço ou\s*\n?\s*direito/);
  });

  it("virar lead exige a triagem registrada primeiro", () => {
    expect(painelTriagem).toMatch(/Registre a triagem primeiro/);
  });

  it("a duplicidade é conferida antes de criar, não depois", () => {
    expect(painelTriagem).toMatch(/Conferir duplicidade antes de criar/);
  });
});
