/**
 * Contrato de superfície — Caso 360 × Pessoa 360 × superfícies donas.
 *
 * Fonte normativa: AGENTS / CA-FICHAS-009 (oito superfícies distintas),
 * navegação Desk (`Pessoas & Casos` — sem copiar contrato nem pesquisa),
 * mockup 17 + auditoria 47 (cenário macro, não dump de motores).
 *
 * Caso 360 = macro operacional do **caso** (situação, próxima ação,
 * responsável, prazo, motivo, impacto + pontes).
 * Pessoa 360 = macro da **pessoa** no Clube Ancestral (todas as nuances dela).
 * Pesquisa / Contrato-financeiro = superfícies próprias — o Caso só resume e aponta.
 */

export const CASO_360_MACRO = {
  titulo: "Caso 360 — macro operacional do caso",
  resumo:
    "Situação, próxima ação, responsável, prazo, motivo e impacto. Pesquisa, contrato e financeiro moram nas superfícies donas; aqui só ponte e resumo.",
  fronteiraPessoa:
    "Pessoa 360 é o macro da pessoa no Clube Ancestral — não duplicar dossiê civil aqui.",
  fronteiraPesquisa:
    "Pesquisa genealógica e evidências: abrir a superfície de Pesquisa — sem muro de links no meio da ficha.",
  fronteiraFinanceiro:
    "Formalização e financeiro: abrir Contratos / Financeiro — sem formulário de pagamento embutido no macro.",
} as const;

/** Contagem "comprovada" no resumo: só status do CHECK vigente de evidences. */
export const STATUS_EVIDENCIA_COMPROVADA_RESUMO = "aprovada_para_entrega" as const;

/** Rotas donas — uma ponte cada, não lista infinita no card. */
export const PONTE_PESQUISA_CASO = "/pesquisa-evidencias/$caseId" as const;
export const PONTE_FINANCEIRO = "/financeiro" as const;
export const PONTE_CONTRATOS = "/contratos" as const;
