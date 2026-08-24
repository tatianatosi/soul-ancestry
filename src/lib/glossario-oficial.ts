/**
 * Adendo — Glossário oficial nas validações humanas (11/08/2026).
 *
 * Referência oficial de linguagem para documentos internos, one-pages, PDFs,
 * App Cliente, Desk e comunicações. A presença de um termo no glossário não
 * autoriza sua afirmação em um caso individual.
 */

export const GLOSSARIO_DATA = "11/08/2026" as const;

export const REGRA_APLICACAO_GLOSSARIO =
  "Termos técnicos só aparecem em conteúdo cliente-facing quando são necessários, estão contextualmente corretos e o conteúdo está aprovado. A peça não antecipa rota jurídica, elegibilidade, prazo ou conclusão." as const;

export type TermoGlossario = {
  termo: string;
  uso_autorizado: string;
  restricao_no_caso: string;
};

export const VOCABULARIO_OFICIAL: readonly TermoGlossario[] = [
  {
    termo: "Jus Sanguinis",
    uso_autorizado: "Princípio de transmissão de cidadania pela linha familiar.",
    restricao_no_caso:
      "Não usar como confirmação de direito individual antes de validação documental e análise aplicável.",
  },
  {
    termo: "Jus Soli",
    uso_autorizado: "Princípio de atribuição pelo local de nascimento.",
    restricao_no_caso: "Uso educativo ou contextual; não usar como conclusão individual sem análise.",
  },
  {
    termo: "Dante Causa",
    uso_autorizado: "Ancestral europeu cuja linha de transmissão pode fundamentar pedido.",
    restricao_no_caso:
      "Usar apenas após pessoa e vínculo estarem suficientemente confirmados; antes disso, usar 'possível ascendente' ou 'referência familiar em confirmação'.",
  },
  {
    termo: "CNN — Certidão Negativa de Naturalização",
    uso_autorizado: "Documento brasileiro sobre naturalização de ancestral.",
    restricao_no_caso:
      "Usar como pendência/documento necessário quando aplicável; não afirmar resultado sem certidão revisada.",
  },
  {
    termo: "Inteiro Teor",
    uso_autorizado: "Modalidade de certidão brasileira com reprodução integral do registro.",
    restricao_no_caso: "Usar em checklist documental e orientação de próxima etapa quando aplicável.",
  },
  {
    termo: "Apostilamento de Haia",
    uso_autorizado: "Procedimento de autenticação para uso internacional.",
    restricao_no_caso:
      "Usar somente depois de definir que o documento será usado internacionalmente e a etapa permitir.",
  },
  {
    termo: "Tradução Juramentada",
    uso_autorizado: "Tradução oficial realizada por tradutor público juramentado.",
    restricao_no_caso: "Usar como etapa documental, nunca como promessa de aceitação por órgão estrangeiro.",
  },
  {
    termo: "Via Administrativa",
    uso_autorizado: "Caminho de reconhecimento perante órgão administrativo competente.",
    restricao_no_caso:
      "Não exibir como recomendação/rota do caso sem validação documental e análise humana aprovada.",
  },
  {
    termo: "Via Judicial",
    uso_autorizado: "Caminho de reconhecimento perante tribunal.",
    restricao_no_caso:
      "Não exibir como recomendação/rota do caso sem validação documental e análise humana aprovada.",
  },
  {
    termo: "Comune",
    uso_autorizado: "Município italiano ligado a nascimento, casamento ou falecimento.",
    restricao_no_caso:
      "Usar como localidade/órgão quando a identificação estiver confirmada ou qualificada como 'em confirmação documental'.",
  },
  {
    termo: "AIRE",
    uso_autorizado: "Cadastro consular italiano de cidadãos residentes no exterior.",
    restricao_no_caso:
      "Não usar em leitura inicial, salvo como conteúdo educativo aprovado e sem inferir que o cliente é elegível ou já reconhecido.",
  },
  {
    termo: "Decreto Tajani (Lei 74/2025)",
    uso_autorizado: "Reforma italiana de 2025.",
    restricao_no_caso:
      "Uso educativo e contextual; nunca aplicar automaticamente a caso individual sem análise atualizada e aprovada.",
  },
  {
    termo: "Regra de 1948",
    uso_autorizado:
      "Referência histórico-jurídica italiana sobre transmissão por mulheres antes de 01/01/1948.",
    restricao_no_caso:
      "Não usar na one-page ou no App como definição de rota antes de validação documental e análise humana aprovada.",
  },
  {
    termo: "Vínculo Efetivo",
    uso_autorizado: "Exigência aplicável a determinados casos portugueses.",
    restricao_no_caso:
      "Uso somente para Portugal e após enquadramento documental; não usar em casos italianos como requisito genérico.",
  },
  {
    termo: "Atribuição vs. Aquisição (Portugal)",
    uso_autorizado: "Distinção jurídica portuguesa.",
    restricao_no_caso: "Uso educativo ou técnico em casos portugueses; não usar como conclusão individual sem análise.",
  },
  {
    termo: "Foreign Births Register",
    uso_autorizado: "Registro irlandês aplicável a descendentes nascidos no exterior.",
    restricao_no_caso: "Uso somente em contexto irlandês; não aplicar como regra genérica.",
  },
  {
    termo: "Voivoda",
    uso_autorizado: "Autoridade administrativa regional polonesa.",
    restricao_no_caso: "Uso somente em contexto polonês; não aplicar como órgão genérico de cidadania.",
  },
];

export type Substituicao = { evitar: string; usar: string };

/** Substituições obrigatórias de linguagem. */
export const SUBSTITUICOES_OBRIGATORIAS: readonly Substituicao[] = [
  {
    evitar: "ancestral identificado",
    usar: "possível ascendente / referência familiar em confirmação / ascendente validado por documento",
  },
  {
    evitar: "linha confirmada",
    usar: "linha familiar em análise / cadeia documental em organização / vínculo validado por documento",
  },
  { evitar: "caminho certo", usar: "próximo passo recomendado" },
  { evitar: "rota definida", usar: "análise de estratégia após evidências suficientes" },
  { evitar: "tem direito à cidadania", usar: "não há conclusão sobre cidadania nesta etapa" },
  {
    evitar: "elegível",
    usar: "em análise documental (salvo conteúdo diagnóstico separado e aprovado com regra própria)",
  },
  {
    evitar: "precisa judicializar",
    usar: "a avaliação de caminho administrativo ou judicial depende de validação documental e análise humana",
  },
  { evitar: "certidão completa", usar: "certidão em inteiro teor, quando esta for a modalidade necessária" },
  { evitar: "cartório italiano", usar: "comune, quando se tratar do município italiano competente" },
  { evitar: "registro de italiano fora do país", usar: "AIRE, somente quando tecnicamente aplicável" },
];

/** Termos liberados em one-page, WhatsApp e App Cliente. */
export const TERMOS_PERMITIDOS_CLIENTE: readonly string[] = [
  "linha familiar em análise",
  "referência familiar em confirmação",
  "documento solicitado / recebido / em conferência / validado por documento",
  "certidão em inteiro teor, CNN, Comune, Apostilamento de Haia ou Tradução Juramentada apenas como pendência/etapa aprovada e compreensível",
  "próximo passo recomendado",
];

/** Termos bloqueados em conteúdo cliente-facing sem liberação específica. */
export const TERMOS_BLOQUEADOS_CLIENTE: readonly string[] = [
  "Dante Causa como pessoa confirmada",
  "via administrativa",
  "via judicial",
  "Regra de 1948",
  "Decreto Tajani",
  "AIRE",
  "vínculo efetivo",
  "atribuição/aquisição",
  "conclusão de elegibilidade, rota, prazo, direito ou resultado",
];

/** Requisitos para registrar termo técnico no Desk interno. */
export const REQUISITOS_TERMO_DESK: readonly string[] = [
  "País e contexto aplicável",
  "Estado de validação",
  "Evidência/fonte interna associada",
  "Responsável pela análise",
  "Data de atualização",
  "Regra de visibilidade",
];

export const D06_CRITERIO_ELEVACAO =
  "A presença de termo técnico no Desk ou em documento não altera o estado da evidência. 'Dante Causa', 'Comune', 'CNN', 'via administrativa', 'via judicial' e demais termos do glossário devem estar vinculados a evidência, contexto nacional aplicável e revisão humana antes de qualquer projeção externa." as const;

export const D07_CHECKLIST_PDF: readonly string[] = [
  "Os termos técnicos do glossário usados no PDF são aplicáveis ao país e ao caso?",
  "O termo não antecipou rota, direito, prazo ou elegibilidade?",
  "Os termos foram explicados em linguagem simples quando destinados ao cliente?",
];

export const D11_GLOSSARIO_FINAL =
  "O Glossário público do Clube Ancestral é a fonte de terminologia técnica. A taxonomia de evidências do Bloco 5A é a fonte dos estados de validação. Nenhuma das duas substitui revisão humana de caso, análise jurídica aplicável ou autorização de publicação." as const;

export const CHECKLIST_VALIDACAO_TERMINOLOGICA: readonly string[] = [
  "O termo consta no Glossário oficial ou foi aprovado como termo novo?",
  "O termo é aplicável ao país e ao contexto do caso?",
  "O estado de validação está explícito quando necessário?",
  "O termo não transforma hipótese em fato?",
  "O termo não antecipa cidadania, elegibilidade, via, prazo ou resultado?",
  "A linguagem está compreensível para o cliente?",
  "Há responsável e data de revisão?",
];

const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/**
 * Verifica termos bloqueados e substituições obrigatórias em conteúdo
 * cliente-facing. Retorna avisos; não altera nem publica nada.
 */
export function revisarTerminologiaCliente(texto: string): string[] {
  const alvo = normalizar(texto);
  const avisos: string[] = [];

  for (const t of TERMOS_BLOQUEADOS_CLIENTE) {
    const chave = normalizar(t.split(" como ")[0]!.split(",")[0]!);
    if (chave.length >= 4 && alvo.includes(chave)) {
      avisos.push(`Termo bloqueado sem liberação específica em conteúdo do cliente: "${t}".`);
    }
  }

  for (const s of SUBSTITUICOES_OBRIGATORIAS) {
    if (alvo.includes(normalizar(s.evitar))) {
      avisos.push(`Substituir "${s.evitar}" por: ${s.usar}.`);
    }
  }

  return avisos;
}
