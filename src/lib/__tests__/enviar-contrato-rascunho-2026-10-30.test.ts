import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * 30/10/2026 — "Enviar ao cliente" era um stub fixo: `tentarEtapaExterna`
 * sempre devolvia `ok:false`, "Etapa desabilitada nesta fase", para
 * qualquer etapa, inclusive "envio". Investigando o resto do app descobri
 * que NENHUM lugar do código dispara e-mail/WhatsApp de verdade — toda
 * comunicação externa (ver `caso-canonico.functions.ts#sincronizarProximaAcao`)
 * cria um rascunho em `communication_queue` com `requires_human_approval:
 * true`, e uma pessoa aprova e envia por fora do app. A Proprietária
 * confirmou que "envio" do contrato deve seguir esse mesmo padrão, não
 * ganhar o primeiro envio 100% automático do sistema.
 *
 * "envio" passa a criar esse rascunho de verdade (nunca um e-mail real).
 * "assinatura"/"cobranca"/"pesquisa_externa" continuam recusadas — não
 * ganharam integração nenhuma.
 */
const fn = readFileSync("src/lib/contratos.functions.ts", "utf8");
const tela = readFileSync("src/routes/_authenticated/contratos.$id.tsx", "utf8");

function blocoDe(nomeExport: string, tamanho = 6000) {
  const inicio = fn.indexOf(`export const ${nomeExport}`);
  expect(inicio, `${nomeExport} não encontrado`).toBeGreaterThan(-1);
  return fn.slice(inicio, inicio + tamanho);
}

describe("tentarEtapaExterna — envio vira rascunho real, nunca um envio automático", () => {
  const bloco = blocoDe("tentarEtapaExterna");

  it("cria um rascunho em communication_queue aguardando aprovação humana", () => {
    expect(bloco).toContain('.from("communication_queue")');
    expect(bloco).toContain('status: "awaiting_approval"');
    expect(bloco).toContain("requires_human_approval: true");
  });

  it("não dispara nenhum e-mail nem chama provedor externo — nenhum lugar do arquivo faz isso", () => {
    expect(fn).not.toMatch(/resend|RESEND_API_KEY|sendEmail|nodemailer|smtp/i);
  });

  it("bloqueia quando a versão mais recente está vazia, antes de criar rascunho", () => {
    expect(bloco).toContain("diagnosticarVersaoContratual");
    expect(bloco).toContain("diagnostico.vazia");
    expect(bloco).toContain('"versao_vazia"');
  });

  it("não duplica: reaproveita rascunho já aguardando aprovação para o mesmo caso", () => {
    expect(bloco).toContain('.in("status", ["draft_created", "awaiting_approval"])');
    expect(bloco).toContain("nada duplicado");
  });

  it("registra evento e timeline do caso ao criar o rascunho", () => {
    expect(bloco).toContain('"send_drafted"');
    expect(bloco).toContain("registrarTimelineCaso");
  });

  it("a mensagem de sucesso é honesta: diz rascunho, não diz enviado", () => {
    expect(bloco).toContain("Nenhum e-mail foi enviado ainda");
  });

  it("assinatura, cobrança e pesquisa externa continuam recusadas, sem integração nova", () => {
    expect(bloco).toContain('data.etapa !== "envio"');
    expect(bloco).toContain("Etapa desabilitada nesta fase");
  });

  it("contrato assinado continua imutável: recusa preparar envio", () => {
    expect(bloco).toContain('contrato.status === "signed"');
  });
});

describe("tela do contrato — texto do botão bate com o que a ação realmente faz", () => {
  it("não promete envio nem diz 'desabilitado'; descreve o rascunho e a aprovação", () => {
    const inicio = tela.indexOf('rotulo="Enviar ao cliente"');
    expect(inicio).toBeGreaterThan(-1);
    const bloco = tela.slice(inicio, inicio + 400);
    expect(bloco).toContain("rascunho de envio");
    expect(bloco).toContain("aguardando sua aprovação");
    expect(bloco).not.toContain("desabilitado");
  });
});
