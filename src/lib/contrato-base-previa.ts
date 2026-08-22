/**
 * Prévia TESTE do contrato-base consolidado v1.0.
 *
 * Dados fictícios, marcados como TESTE, sem qualquer vínculo com caso real,
 * cliente, proposta, cobrança ou assinatura. Serve exclusivamente para
 * comprovar renderização das cláusulas fixas, das variáveis com origem e
 * estado, dos anexos derivados e dos bloqueios explicáveis.
 */

import { dicionarioAnexos, type RegraAnexo } from "@/lib/anexos-dicionario";
import { CLAUSULA_DESPESAS_TERCEIROS } from "@/lib/despesas-terceiros";
import { MATRIZ_RENDERIZACAO, type LinhaRenderizacao } from "@/lib/contrato-base-consolidado";

export const MARCA_PREVIA_TESTE = "RASCUNHO INCOMPLETO — PRÉVIA TESTE, SEM DADOS REAIS";

export type OrigemParametro =
  | "planejador"
  | "proposta_os"
  | "crm_confirmado"
  | "documento_conferido"
  | "importado_a_confirmar"
  | "ausente";

export const ROTULO_ORIGEM: Record<OrigemParametro, string> = {
  planejador: "Planejador homologado",
  proposta_os: "Proposta/OS aprovada",
  crm_confirmado: "CRM/cadastro confirmado",
  documento_conferido: "Documento conferido",
  importado_a_confirmar: "Importado a confirmar",
  ausente: "Sem fonte válida",
};

export type EstadoParametro = "confirmado" | "a_confirmar" | "pendente" | "conflito";

export const ROTULO_ESTADO_PARAMETRO: Record<EstadoParametro, string> = {
  confirmado: "Confirmado",
  a_confirmar: "A confirmar",
  pendente: "Pendente",
  conflito: "Conflito de fonte",
};

export type VariavelPrevia = {
  campo: string;
  rotulo: string;
  grupo: string;
  valor: string | null;
  origem: OrigemParametro;
  estado: EstadoParametro;
  versaoFonte: string | null;
};

/** Núcleo fictício: dois adultos e um dependente menor, para exercitar as regras familiares. */
export const VARIAVEIS_TESTE: VariavelPrevia[] = [
  { campo: "perfil_institucional", rotulo: "Perfil institucional", grupo: "Contratada", valor: "PERFIL-INST-v1.0", origem: "planejador", estado: "confirmado", versaoFonte: "v1.0" },
  { campo: "partes_signatarias", rotulo: "Partes signatárias", grupo: "Partes", valor: "TESTE Requerente Um || TESTE Requerente Dois", origem: "crm_confirmado", estado: "confirmado", versaoFonte: null },
  { campo: "beneficiarios", rotulo: "Beneficiários", grupo: "Estrutura familiar", valor: "TESTE Requerente Um || TESTE Requerente Dois", origem: "planejador", estado: "confirmado", versaoFonte: null },
  { campo: "dependentes", rotulo: "Dependentes", grupo: "Estrutura familiar", valor: "TESTE Dependente Menor (TESTE Requerente Um)", origem: "planejador", estado: "confirmado", versaoFonte: null },
  { campo: "representacao_legal", rotulo: "Representação legal", grupo: "Estrutura familiar", valor: "TESTE Dependente Menor, menor, representado por TESTE Requerente Um para atos documentais.", origem: "documento_conferido", estado: "a_confirmar", versaoFonte: null },
  { campo: "produto_sku", rotulo: "Produto/SKU", grupo: "Objeto", valor: "SKU-TESTE-000 — modalidade de teste", origem: "proposta_os", estado: "a_confirmar", versaoFonte: null },
  { campo: "pais_rota", rotulo: "País/rota", grupo: "Objeto", valor: "País de teste", origem: "planejador", estado: "confirmado", versaoFonte: null },
  { campo: "escopo_resumo", rotulo: "Resumo de escopo", grupo: "Escopo", valor: "Escopo fictício de demonstração técnica da prévia.", origem: "proposta_os", estado: "a_confirmar", versaoFonte: null },
  { campo: "servicos_excluidos", rotulo: "Exclusões formais", grupo: "Escopo", valor: null, origem: "ausente", estado: "pendente", versaoFonte: null },
  { campo: "valor_total", rotulo: "Valor total", grupo: "Comercial", valor: null, origem: "ausente", estado: "pendente", versaoFonte: null },
  { campo: "forma_pagamento", rotulo: "Forma de pagamento", grupo: "Comercial", valor: null, origem: "ausente", estado: "pendente", versaoFonte: null },
  { campo: "parcelas", rotulo: "Parcelas e vencimentos", grupo: "Comercial", valor: null, origem: "ausente", estado: "pendente", versaoFonte: null },
  { campo: "despesas_externas", rotulo: "Despesas de terceiros", grupo: "Terceiros", valor: "Estimativa pendente", origem: "planejador", estado: "pendente", versaoFonte: null },
  { campo: "prazo_referencia", rotulo: "Prazo de referência", grupo: "Prazo", valor: null, origem: "ausente", estado: "pendente", versaoFonte: null },
  { campo: "politica_privacidade", rotulo: "Política de dados", grupo: "Dados e consentimentos", valor: "Política vigente aplicável", origem: "planejador", estado: "a_confirmar", versaoFonte: null },
  { campo: "metodo_assinatura", rotulo: "Método de assinatura", grupo: "Assinatura", valor: null, origem: "ausente", estado: "pendente", versaoFonte: null },
];

export type BloqueioPrevia = { titulo: string; motivo: string; rotaResolucao: string };

export function anexosDaPreviaTeste(): RegraAnexo[] {
  const v = (campo: string) => VARIAVEIS_TESTE.find((x) => x.campo === campo)?.valor ?? "";
  return dicionarioAnexos({
    produto: v("produto_sku"),
    paisRota: v("pais_rota"),
    beneficiarios: v("beneficiarios"),
    dependentes: v("dependentes"),
    representacaoLegal: v("representacao_legal"),
    valorTotal: v("valor_total"),
    formaPagamento: v("forma_pagamento"),
    parcelas: v("parcelas"),
    escopoResumo: v("escopo_resumo"),
  });
}

/** Bloqueios derivados dos parâmetros e anexos — cada um com rota de resolução. */
export function bloqueiosDaPreviaTeste(anexos = anexosDaPreviaTeste()): BloqueioPrevia[] {
  const bloqueios: BloqueioPrevia[] = [];

  for (const p of VARIAVEIS_TESTE.filter((x) => x.estado === "pendente")) {
    bloqueios.push({
      titulo: `Parâmetro pendente: ${p.rotulo}`,
      motivo: "Campo sem fonte válida. Regra do motor: campo ausente permanece pendente e nunca é preenchido por inferência.",
      rotaResolucao: "Ficha parametrizável do caso → grupo " + p.grupo,
    });
  }

  for (const a of anexos.filter((x) => x.obrigatorio && x.pendencias.length)) {
    bloqueios.push({
      titulo: `Anexo obrigatório pendente: ${a.codigo}`,
      motivo: a.pendencias.join(" "),
      rotaResolucao: "Ficha parametrizável do caso → anexos aplicáveis",
    });
  }

  bloqueios.push({
    titulo: "Revisão humana/jurídica pendente",
    motivo: "Contrato-base v1.0 está em under_legal_review: não é vigente e não pode ser assinado.",
    rotaResolucao: "Governança → Contrato-base consolidado → itens a validar juridicamente",
  });

  return bloqueios;
}

export function previaTesteAssinavel() {
  return false;
}

export const OBSERVACAO_TERCEIROS_PREVIA = CLAUSULA_DESPESAS_TERCEIROS;

/** Situação de cada linha da matriz de renderização nesta prévia TESTE. */
export type SituacaoRenderizacao = LinhaRenderizacao & { situacao: "renderizado" | "renderizado_com_pendencia" };

export function matrizRenderizacaoPreviaTeste(anexos = anexosDaPreviaTeste()): SituacaoRenderizacao[] {
  const pendComercial = anexos.find((a) => a.codigo === "ANX-COMERCIAL");
  const pendentes = new Set<string>();
  if (!VARIAVEIS_TESTE.find((v) => v.campo === "valor_total")?.valor) pendentes.add("Comercial");
  if (!VARIAVEIS_TESTE.find((v) => v.campo === "prazo_referencia")?.valor) pendentes.add("Prazo");
  if (!VARIAVEIS_TESTE.find((v) => v.campo === "metodo_assinatura")?.valor) pendentes.add("Assinatura");
  if (!VARIAVEIS_TESTE.find((v) => v.campo === "servicos_excluidos")?.valor) pendentes.add("Inclusões e exclusões");
  if (pendComercial && !pendComercial.aplicavel) pendentes.add("Terceiros");

  return MATRIZ_RENDERIZACAO.map((l) => ({
    ...l,
    situacao: pendentes.has(l.bloco) ? "renderizado_com_pendencia" : "renderizado",
  }));
}
