import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { CANAIS_CONSENTIMENTO, validarLead } from "@/lib/crm-desk";
import { AVISO_PRIVACIDADE } from "@/lib/decisoes-da-proprietaria";
import { INDICADORES_LEADS, indicadoresLeads, leadNoIndicador } from "@/lib/crm-vivo-metricas";

/**
 * D-01 (03/10/2026) — "pode ligar o gate de consentimento aos 11 leads
 * lembrando que temos a politica de privacidade e anexo de lgpd em contrato
 * esse gate é no desk".
 *
 * O gate existia por lead e exigia 4 campos digitados, um deles a versão do
 * aviso — e o banco recusa "concedido" sem data, canal e versão. Não havia
 * nem lista de quem está sem consentimento, nem como dizer que a base é o
 * aviso publicado ou o anexo de LGPD do contrato.
 */

const lead = (p: Record<string, unknown> = {}) => ({ nome: "L", ...p }) as never;

describe("as duas bases que a Proprietária nomeou existem como canal", () => {
  it("aviso publicado no site e anexo de LGPD do contrato", () => {
    const valores = CANAIS_CONSENTIMENTO.map((c) => c.valor);
    expect(valores).toContain("aviso_site");
    expect(valores).toContain("anexo_lgpd_contrato");
  });

  it("os canais antigos de conversa continuam — nada foi substituído", () => {
    const valores = CANAIS_CONSENTIMENTO.map((c) => c.valor);
    for (const v of ["verbal_em_call", "whatsapp", "email", "formulario", "termo_assinado"]) {
      expect(valores).toContain(v);
    }
  });
});

describe("o gate continua exigindo os três campos — nada foi afrouxado", () => {
  it('"concedido" sem data, canal ou versão é recusado', () => {
    const campos = validarLead(lead({ consentimento_status: "concedido" })).map((e) => e.campo);
    expect(campos).toContain("consentimento_em");
    expect(campos).toContain("consentimento_canal");
    expect(campos).toContain("consentimento_versao_aviso");
  });

  it("com a base do aviso publicado, passa", () => {
    const erros = validarLead(
      lead({
        consentimento_status: "concedido",
        consentimento_em: "2026-10-03T10:00",
        consentimento_canal: "aviso_site",
        consentimento_versao_aviso: AVISO_PRIVACIDADE.versao,
      }),
    );
    expect(erros.filter((e) => e.campo.startsWith("consentimento"))).toEqual([]);
  });

  it("gravação sem consentimento concedido continua recusada", () => {
    const erros = validarLead(lead({ consentimento_status: "pendente", gravacao_link_interno: "drive://x" }));
    expect(erros.map((e) => e.campo)).toContain("gravacao_link_interno");
  });
});

describe("o Desk passa a ter a lista de quem está sem consentimento", () => {
  it("o indicador existe em /leads", () => {
    expect(INDICADORES_LEADS.map((i) => i.chave)).toContain("sem_consentimento");
  });

  it("conta lead sem consentimento e não conta lead concedido", () => {
    const hoje = new Date("2026-10-03T12:00:00Z");
    expect(leadNoIndicador(lead({ consentimento_status: "nao_solicitado" }), "sem_consentimento", hoje)).toBe(true);
    expect(leadNoIndicador(lead({}), "sem_consentimento", hoje)).toBe(true);
    expect(leadNoIndicador(lead({ consentimento_status: "concedido" }), "sem_consentimento", hoje)).toBe(false);
    expect(leadNoIndicador(lead({ consentimento_status: "recusado" }), "sem_consentimento", hoje)).toBe(false);
  });

  it("lead de teste/demo nunca entra na conta — a pendência é dos leads reais", () => {
    const r = indicadoresLeads(
      [
        lead({ demo: true, consentimento_status: "nao_solicitado", estagio: "novo" }),
        lead({ dados_teste: true, consentimento_status: "nao_solicitado", estagio: "novo" }),
        lead({ consentimento_status: "nao_solicitado", estagio: "novo" }),
      ],
      new Date("2026-10-03T12:00:00Z"),
    );
    expect(r.sem_consentimento).toBe(1);
  });
});

describe("a tela do Desk oferece a base documental, sem decidir pela pessoa", () => {
  const tela = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");

  it("mostra o aviso publicado e o anexo contratual, com link", () => {
    expect(tela).toMatch(/AVISO_PRIVACIDADE\.url/);
    expect(tela).toMatch(/AVISO_PRIVACIDADE\.anexoContratual/);
  });

  it("os dois botões preenchem canal e versão de uma vez", () => {
    expect(tela).toMatch(/Preencher pelo aviso publicado no site/);
    expect(tela).toMatch(/Preencher pelo anexo de privacidade e LGPD do contrato/);
    expect(tela).toMatch(/consentimento_versao_aviso: AVISO_PRIVACIDADE\.versao/);
  });

  it("diz em texto que o botão não substitui o consentimento de quem não deu", () => {
    expect(tela).toMatch(/não substitui o consentimento de quem não o deu/);
  });

  it("o botão preenche o formulário — a gravação continua pelo salvar validado", () => {
    // nenhuma chamada de servidor dentro do onClick dos dois botões
    const bloco = tela.slice(tela.indexOf("Preencher pelo aviso publicado"), tela.indexOf("Revise a data e o canal"));
    expect(bloco).not.toMatch(/mutate\(|useServerFn|salvarLeadDesk/);
  });
});
