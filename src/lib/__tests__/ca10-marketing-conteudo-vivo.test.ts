import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { proximaAcaoEditorial, rotuloStatusEditorial, ROTULO_LINK_EDITORIAL, STATUS_EDITORIAL } from "@/lib/message-library.functions";
import { casosPorOrigem } from "@/lib/marketing-aquisicao";

/*
 * CA10-MARKETING-CONTEUDO-VIVO (09/09/2026) — Marketing deixa de ser
 * dicionário estático (MAPA_MARKETING) e ganha leitura viva ligada a
 * origem, lead, conteúdo e ação: (1) "casos por origem" via
 * attribution_records.case_id + lead_source_id, nunca lido antes; (2) CTA
 * contextual em origem/campanha/caso; (3) Biblioteca de Mensagens deixa de
 * ignorar editorial_content_items.owner_id e editorial_content_links —
 * "Conteúdos editoriais" ganha responsável, próxima ação e vínculo. Nenhuma
 * automação externa, preço, condição comercial ou link de cobrança entra
 * nesta rodada.
 */

const messageLibraryFn = readFileSync("src/lib/message-library.functions.ts", "utf8");
const bibliotecaMensagensTsx = readFileSync("src/routes/_authenticated/biblioteca-mensagens.tsx", "utf8");
const marketingTsx = readFileSync("src/routes/_authenticated/marketing.tsx", "utf8");
const marketingAquisicaoTs = readFileSync("src/lib/marketing-aquisicao.ts", "utf8");

describe("CA10-MARKETING-CONTEUDO-VIVO — próxima ação editorial (8 estados reais)", () => {
  it("cobre todos os 8 estados do check constraint sem cair no genérico", () => {
    expect(STATUS_EDITORIAL.map((s) => s.valor)).toEqual([
      "ideia",
      "pauta_aprovada",
      "rascunho",
      "em_revisao",
      "aprovado",
      "agendado",
      "publicado",
      "arquivado",
    ]);
    for (const s of STATUS_EDITORIAL) {
      const acao = proximaAcaoEditorial(s.valor);
      expect(acao).not.toMatch(/^Sem próxima ação/);
      expect(acao.length).toBeGreaterThan(3);
    }
  });

  it("publicado e arquivado não pedem ação pendente; os demais pedem", () => {
    expect(proximaAcaoEditorial("publicado")).toMatch(/nenhuma ação/i);
    expect(proximaAcaoEditorial("arquivado")).toMatch(/nenhuma ação/i);
    expect(proximaAcaoEditorial("ideia")).toMatch(/aprovar pauta/i);
    expect(proximaAcaoEditorial("rascunho")).toMatch(/revisão/i);
  });

  it("estado fora do catálogo não inventa ação — devolve lacuna explícita", () => {
    expect(proximaAcaoEditorial("estado_inexistente")).toMatch(/sem próxima ação/i);
  });

  it("rótulo de status nunca expõe o valor bruto do banco quando catalogado", () => {
    expect(rotuloStatusEditorial("pauta_aprovada")).toBe("Pauta aprovada");
    expect(rotuloStatusEditorial("em_revisao")).toBe("Em revisão");
  });

  it("rótulo de vínculo cobre os 4 link_type do check constraint de editorial_content_links", () => {
    expect(Object.keys(ROTULO_LINK_EDITORIAL).sort()).toEqual(
      ["derivado_de", "referencia", "relacionado_a", "reutiliza_template"].sort(),
    );
  });
});

describe("CA10-MARKETING-CONTEUDO-VIVO — Biblioteca de Mensagens lê owner_id e editorial_content_links", () => {
  it("passou a selecionar owner_id de editorial_content_items (antes nunca lido)", () => {
    expect(messageLibraryFn).toMatch(/from\("editorial_content_items"\)\s*\n\s*\.select\("[^"]*owner_id[^"]*"\)/);
  });

  it("passou a consultar editorial_content_links (tabela existia sem nenhum leitor)", () => {
    expect(messageLibraryFn).toContain('.from("editorial_content_links")');
  });

  it("resolve nome do responsável via staff_access — nunca texto livre do cliente", () => {
    expect(messageLibraryFn).toMatch(/from\("staff_access"\)/);
    expect(messageLibraryFn).toContain("nomePorOwner");
  });

  it("vínculo continua entidade-a-entidade — nunca pessoa, lead ou caso identificável", () => {
    // A regra editorial pré-existente (biblioteca-mensagens.tsx) proíbe vínculo a
    // pessoa/lead/caso; a leitura nova usa linked_entity_type/linked_entity_id
    // de editorial_content_links, nunca lead_id/case_id/cliente_id.
    const bloco = messageLibraryFn.slice(messageLibraryFn.indexOf('"editorial_content_links"'));
    expect(bloco.slice(0, 400)).not.toMatch(/lead_id|case_id|cliente_id/);
  });

  it("biblioteca-mensagens.tsx exibe responsável, próxima ação e vínculo — não é mais lista morta", () => {
    const bloco = bibliotecaMensagensTsx.slice(bibliotecaMensagensTsx.indexOf("Conteúdos editoriais"));
    expect(bloco).toContain("e.responsavel");
    expect(bloco).toContain("e.proximaAcao");
    expect(bloco).toContain("e.vinculos");
    expect(bloco).toMatch(/Sem responsável definido/);
    expect(bloco).toMatch(/Sem vínculo aplicável/);
  });

  it("a regra de LGPD do conteúdo editorial continua declarada na tela", () => {
    expect(bibliotecaMensagensTsx).toMatch(/Não podem ser vinculados a pessoa, lead ou caso identificável/);
  });
});

describe("CA10-MARKETING-CONTEUDO-VIVO — CTA contextual em Marketing", () => {
  it("origem (visão geral e catálogo de origem) abre Leads — nunca duplica a lista", () => {
    const matches = marketingTsx.match(/to="\/leads"/g) ?? [];
    // Links contextuais para Comercial (1) + visão geral (1) + catálogo de origem (1)
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  it("caso ligado a uma origem abre o Caso 360 correspondente", () => {
    expect(marketingTsx).toContain('to="/casos/$caseId"');
    expect(marketingTsx).toMatch(/params=\{\{\s*caseId:\s*c\.id\s*\}\}/);
  });

  it("campanhas registradas passam a ser listadas individualmente, não só contadas", () => {
    expect(marketingTsx).toContain('data-marketing="lista-campanhas"');
  });

  it("casosPorOrigem está importado e usado na tela (não é função morta)", () => {
    expect(marketingTsx).toContain("casosPorOrigem");
    expect(marketingTsx).toContain('data-marketing="casos-por-origem"');
  });

  it("sem caso ligado por atribuição a uma origem, mostra Sem dados suficientes — nunca zero fabricado", () => {
    expect(marketingTsx).toContain('data-marketing-vazio="casos-origem"');
  });

  it("nenhum preço, condição comercial, link de cobrança ou automação externa foi introduzido", () => {
    for (const termo of [/asaas/i, /boleto/i, /pix/i, /enviar whatsapp/i, /disparar/i]) {
      expect(marketingTsx).not.toMatch(termo);
    }
  });
});

describe("CA10-MARKETING-CONTEUDO-VIVO — casosPorOrigem é fonte real, nunca camada paralela", () => {
  it("reusa lead_sources/attribution_records/crm_casos já carregados — não cria tabela nova", () => {
    expect(marketingAquisicaoTs).toContain("export function casosPorOrigem");
    // A função só lê o que já está em EntradaAquisicao (fontes/atribuicoes/casos),
    // nunca faz uma nova consulta própria.
    const corpo = marketingAquisicaoTs.slice(
      marketingAquisicaoTs.indexOf("export function casosPorOrigem"),
      marketingAquisicaoTs.indexOf("export type LeituraMetrica"),
    );
    expect(corpo).not.toMatch(/supabase|\.from\(/);
  });

  it("propriedade honesta: origem sem atribuição válida não aparece no resultado", () => {
    expect(
      casosPorOrigem({
        leads: [],
        eventos: [],
        investimentos: [],
        campanhas: [],
        fontes: [{ id: "f1", nome: "Site" }],
        atribuicoes: [{ case_id: null, lead_source_id: "f1" }],
        casos: [],
      }),
    ).toEqual([]);
  });
});
