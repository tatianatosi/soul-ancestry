import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Corte ÓRFÃOS — onda 1: Pesquisa (03/10/2026).
 *
 * A varredura mediu 55 `createServerFn` sem nenhuma tela chamando; 49 eram
 * órfãos reais. A Proprietária apontou o motivo de isso importar: "muito
 * deles pode agilizar tudo que vem sendo repetido ao longo de semanas". Esta
 * onda fecha os da Pesquisa, e o achado é sempre o mesmo —
 *
 * | rota | importava | órfão |
 * |---|---|---|
 * | /plano-acao/$caseId | só `painelPlanoAcao` (leitor) | salvarItemPlano, salvarInstituicao, salvarEstimativa, arquivarRegistroG07 |
 * | /fontes-genealogicas | `painelFontes` + `salvarFonte` | salvarAvaliacaoFonte, salvarBacklogFonte, arquivarRegistroG08 |
 * | /pesquisa-evidencias/$caseId | exibia a visão de pesquisa | salvarVisaoPesquisa |
 *
 * Ou seja: telas que mostravam a fila, a matriz e o backlog, e nas quais era
 * impossível criar, corrigir ou arquivar qualquer coisa — só por SQL.
 */

const PLANO_ROTA = readFileSync("src/routes/_authenticated/plano-acao.$caseId.tsx", "utf8");
const PLANO_PAINEL = readFileSync("src/components/pesquisa/editar-plano-acao.tsx", "utf8");
const PLANO_FN = readFileSync("src/lib/plano-acao-pesquisa.functions.ts", "utf8");
const FONTES = readFileSync("src/routes/_authenticated/fontes-genealogicas.tsx", "utf8");
const HUB = readFileSync("src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx", "utf8");
const VISAO = readFileSync("src/components/pesquisa/editar-visao-pesquisa.tsx", "utf8");

describe("Plano de ação — os quatro escritores deixaram de ser órfãos", () => {
  it("a rota monta o painel de escrita", () => {
    expect(PLANO_ROTA).toContain("<EditarPlanoAcao");
    expect(PLANO_ROTA).toContain('from "@/components/pesquisa/editar-plano-acao"');
  });

  for (const fn of ["salvarItemPlano", "salvarInstituicao", "salvarEstimativa", "arquivarRegistroG07"]) {
    it(`${fn} é chamado pela UI`, () => {
      expect(PLANO_PAINEL).toContain(fn);
    });
  }

  it("a criação passou a reler o gravado, como a atualização já fazia", () => {
    /*
      Os três caminhos de criação usavam insert cru e devolviam sucesso sem
      conferir o gravado — contrariando a persistência universal do próprio
      repo. Religar um escritor que não relê seria entregar metade.
    */
    expect(PLANO_FN).toContain("inserirComVerificacao");
    expect(PLANO_FN).not.toMatch(/\.insert\(\{ \.\.\.valores, organization_id: organizationId/);
  });

  it("quem não pode editar vê o motivo, não um botão morto", () => {
    expect(PLANO_PAINEL).toContain("Seu papel lê o plano de ação, mas não o edita");
  });

  it("arquivar exige motivo e não apaga", () => {
    expect(PLANO_PAINEL).toContain("Nada é apagado fisicamente");
    expect(PLANO_PAINEL).toMatch(/motivo\.trim\(\)\.length >= 5/);
  });

  it("o painel não promete ação externa — plano é fila interna", () => {
    expect(PLANO_PAINEL).toContain("nada aqui contata instituição, envia mensagem, cobra ou publica no App");
    expect(PLANO_PAINEL).toContain("estimativa, nunca cobrança");
  });
});

describe("Catálogo de fontes — avaliação, backlog e arquivamento ligados", () => {
  for (const fn of ["salvarAvaliacaoFonte", "salvarBacklogFonte", "arquivarRegistroG08"]) {
    it(`${fn} é chamado pela tela`, () => {
      expect(FONTES).toContain(fn);
    });
  }

  it("a sugestão de ativação nasce exigindo aprovação humana, e nada é executado", () => {
    expect(FONTES).toContain("exigindo aprovação humana");
    expect(FONTES).toContain("Nenhuma consulta externa é disparada");
  });

  it("arquivar fonte exige motivo", () => {
    expect(FONTES).toContain("Escreva o motivo (mínimo 5 letras)");
  });
});

describe("Hub de Pesquisa — a visão exibida passou a ser editável", () => {
  it("o hub monta o editor da visão", () => {
    expect(HUB).toContain("<EditarVisaoPesquisa");
  });

  it("salvarVisaoPesquisa é chamado", () => {
    expect(VISAO).toContain("salvarVisaoPesquisa");
  });

  it("manda SÓ o que mudou — não reescreve campo gravado por outra tela", () => {
    expect(VISAO).toContain("if (v !== t(k)) mudados[k] = v");
    expect(VISAO).toContain("Nada mudou");
  });

  it("não inventa valor de situação: usa o vocabulário real", () => {
    expect(VISAO).toContain("Object.entries(STATUS_PESQUISA)");
  });

  it("a fronteira continua dita: hipótese é hipótese, nada vai ao App", () => {
    expect(VISAO).toContain("nem conclui parentesco");
    expect(VISAO).toContain("Nenhuma consulta, envio ou publicação é disparada");
  });
});
