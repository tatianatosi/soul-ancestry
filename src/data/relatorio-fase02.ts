/**
 * Ancestral Canvas — Relatório Completo (Fase 02).
 *
 * Módulo NOVO e isolado: não substitui o Relatório Visual (Fase 01).
 * Conteúdo estruturado por seções navegáveis, preparado para receber dados reais.
 */

import type { CaseRecord, PhaseStatus } from "./case-registry";

export type SecaoFase02 = {
  id: string;
  titulo: string;
  resumo: string;
  paragrafos: string[];
  itens?: string[];
};

export const FASE02_MICROCOPY =
  "Esta é a versão aprofundada da sua pesquisa genealógica, construída a partir da evolução mostrada no Relatório Visual.";

export const FASE02_STATUS_TOM: Record<PhaseStatus, string> = {
  "Não prevista": "border-navy/20 bg-navy/5 text-navy/60",
  Prevista: "border-gold/50 bg-gold/15 text-navy",
  "Em produção": "border-plum/40 bg-plum/10 text-plum",
  "Em revisão": "border-terracotta/40 bg-terracotta/10 text-terracotta",
  "Diagnóstico inicial disponível": "border-gold/50 bg-gold/10 text-navy",
  Entregue: "border-sage/40 bg-sage/15 text-sage",
};

/** Índice do Relatório Completo — mesma espinha dorsal para todos os casos. */
export function secoesFase02(c: CaseRecord): SecaoFase02[] {
  const pendentes = c.documents.filter((d) => d.status === "Pendente de documento").map((d) => d.item);
  const emAnalise = c.documents.filter((d) => d.status === "Em análise").map((d) => d.item);
  return [
    {
      id: "sumario",
      titulo: "Sumário executivo",
      resumo: "Leitura condensada do caso e do estágio atual da pesquisa.",
      paragrafos: [
        `Caso ${c.id} — ${c.clientName}. Linha de trabalho: ${c.citizenshipPath}.`,
        c.confidenceNote,
        `Estado atual: ${c.caseStatus}. Próxima ação registrada: ${c.nextAction}.`,
      ],
    },
    {
      id: "escopo",
      titulo: "Objetivo e escopo da pesquisa",
      resumo: "O que esta fase se propõe a investigar e o que fica fora.",
      paragrafos: [
        "Aprofundar a cadeia de parentesco, consolidar evidências documentais e desenhar caminhos possíveis de continuidade.",
        "Não integram o escopo desta fase: protocolo de processos, honorários advocatícios de contencioso, emissão de certidões, traduções, apostilas e taxas públicas.",
      ],
    },
    {
      id: "metodologia",
      titulo: "Metodologia e fontes consultadas",
      resumo: "Como a pesquisa é conduzida e quais fontes sustentam cada achado.",
      paragrafos: ["Cada informação recebe uma classificação de confiança e é rastreada até a fonte que a sustenta."],
      itens: c.sources.length ? c.sources : ["Fontes a registrar após o início da pesquisa"],
    },
    {
      id: "linhagem",
      titulo: "Linhagem e cadeia geracional",
      resumo: "Pessoas mapeadas e o grau de comprovação de cada vínculo.",
      paragrafos: ["Vínculos sem documento correspondente permanecem como hipótese de pesquisa."],
      itens: c.people.map((p) => `${p.nome} — ${p.papel} · ${p.confianca}${p.nota ? ` (${p.nota})` : ""}`),
    },
    {
      id: "contexto",
      titulo: "Contexto histórico, geográfico e migratório",
      resumo: "O cenário que explica deslocamentos, grafias e registros.",
      paragrafos: [
        `Leitura do contexto de origem ligado a ${c.country} e do percurso migratório da família, quando documentado.`,
        "O contexto orienta a busca em arquivos, mas não substitui prova documental.",
      ],
    },
    {
      id: "achados",
      titulo: "Achados e documentos relevantes",
      resumo: "O que já foi localizado e o que está em verificação.",
      paragrafos: emAnalise.length ? [] : ["Ainda não há achados consolidados nesta fase."],
      itens: emAnalise,
    },
    {
      id: "elegibilidade",
      titulo: "Análise de elegibilidade e caminhos possíveis",
      resumo: "Análise preliminar — sem validação jurídica final.",
      paragrafos: [
        "Os caminhos descritos aqui são análise preliminar e dependem de validação documental e jurídica.",
        c.confidenceNote,
      ],
    },
    {
      id: "lacunas",
      titulo: "Lacunas, hipóteses e limitações",
      resumo: "O que falta, o que é hipótese e onde a pesquisa tem limites.",
      paragrafos: pendentes.length ? [] : ["Nenhuma lacuna registrada até o momento."],
      itens: pendentes,
    },
    {
      id: "plano",
      titulo: "Plano de ação recomendado",
      resumo: "Ordem sugerida de providências.",
      paragrafos: [],
      itens: [c.nextAction, "Consolidar documentos pendentes na pasta do caso", "Revisar hipóteses após novos documentos", "Definir continuidade com a equipe"],
    },
    {
      id: "catalogo",
      titulo: "Catálogo documental / anexos",
      resumo: "Inventário item a item com status e responsável.",
      paragrafos: [],
      itens: c.documents.map((d) => `${d.item} — ${d.status} · ${d.origem} · ${d.responsavel}`),
    },
    {
      id: "controle",
      titulo: "Controle de versão, data e responsável",
      resumo: "Metadados do relatório.",
      paragrafos: [
        `Responsável: ${c.caseOwner}. Última atualização: ${c.lastUpdate}.`,
        "Versões anteriores permanecem arquivadas na aba Legado.",
      ],
    },
  ];
}
