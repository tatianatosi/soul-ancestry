import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// P18 (26/09/2026) — autorização explícita: "Aqueles que tiverem preços
// sugeridos na planilha mestre dos itens vivos podem ser ativos pois a regra
// sempre foi aceitar o preço sugerido ... em relação a Itália e Portugal veja
// o que já tem no planejador e aqueles produtos que faltam pode sincronizar
// ... o mesmo se aplica para os demais países".
const migracao = readFileSync(
  "supabase/migrations/20260926140000_aceita_preco_sugerido_e_promove_homologacao_real.sql",
  "utf8",
);

describe("P18 — aceitar preço sugerido, nunca sobrescrever divergência real", () => {
  it("só aceita o preço sugerido quando o vigente está vazio ou já bate com o sugerido", () => {
    const parte1 = migracao.slice(0, migracao.indexOf("Parte 2"));
    expect(parte1).toContain(
      "and (preco_comercial_vigente is null or preco_comercial_vigente = preco_sugerido_fonte)",
    );
  });

  it("nunca grava um preço inventado — sempre copia preco_sugerido_fonte, campo real da fonte", () => {
    const parte1 = migracao.slice(0, migracao.indexOf("Parte 2"));
    expect(parte1).toContain("preco_comercial_vigente = preco_sugerido_fonte");
  });

  it("preenche escopo_aprovado a partir de descricao_curta_fonte (dado real), nunca texto novo", () => {
    const parte2 = migracao.slice(migracao.indexOf("Parte 2"), migracao.indexOf("Parte 3"));
    expect(parte2).toContain("escopo_aprovado = descricao_curta_fonte");
    expect(parte2).toContain("and escopo_aprovado is null");
  });
});

describe("P18 — promoção de planner_catalog_feed é data-driven (join), nunca lista fixa", () => {
  it("só promove para ATIVO_HOMOLOGADO quando product_catalog confirma elegivel_para_proposta=true", () => {
    const parte3 = migracao.slice(migracao.indexOf("Parte 3"), migracao.indexOf("Parte 4"));
    expect(parte3).toContain("pc.elegivel_para_proposta = true");
    expect(parte3).toContain("pc.status_homologacao = 'homologado'");
    expect(parte3).toContain("and p.status_dictionary = 'ATIVO_SEM_PRECO_HOMOLOGADO'");
  });

  it("nunca promove itens CONDICIONAL_POR_CASO — regra só toca ATIVO_SEM_PRECO_HOMOLOGADO", () => {
    const parte3 = migracao.slice(migracao.indexOf("Parte 3"), migracao.indexOf("Parte 4"));
    expect(parte3).not.toContain("CONDICIONAL_POR_CASO");
  });

  it("registra nota honesta para itens com preço homologado mas Asaas pendente — não fabrica validação de link", () => {
    const parte4 = migracao.slice(migracao.indexOf("Parte 4"));
    expect(parte4).toContain("link Asaas ainda pendente");
    expect(parte4).toContain("CA-CID-002C");
    expect(parte4).toContain("CA-IND-005");
    expect(parte4).toContain("CA-IND-006");
    expect(parte4).not.toContain("status_link_asaas = 'validado'");
  });
});
