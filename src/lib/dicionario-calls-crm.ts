/**
 * Dicionário de Validações do Painel de Calls → CRM (v1.1).
 *
 * Camada de entrada, qualificação e handoff comercial. Não é fonte de verdade
 * de preço, contrato, link de cobrança ou despesa: SKU/preço/condição/link vêm
 * do catálogo homologado (product_catalog); despesa de terceiro nunca é caixa
 * do Clube.
 *
 * 02/09/2026 — v1.1: corrige a premissa de que a Planilha Mestre seria a fonte
 * viva. Pelas Decisões Canônicas de CRM/Catálogo/Planejador/Jornada (19/08) e
 * por `preco-canonico.ts`, a Planilha Mestre é legado de migração, reconciliação
 * e auditoria histórica — a fonte operacional é o catálogo homologado no Desk.
 *
 * 10/09/2026 — o dicionário deixa de ser só consulta: `leadParaRegistroCalls`
 * e `pendenciasDicionarioDoLead` avaliam o lead canônico do Painel de Calls.
 * Nenhuma função aqui envia, cobra ou grava em sistema externo. Pendência
 * informa; não trava rascunho.
 */

import { LISTAS_BASE_CA04 } from "@/lib/ca04-crm-mestre";
import {
  PRODUTOS_RECOMENDADOS,
  resultadoComercialDerivado,
  rotulo,
  type LeadDesk,
} from "@/lib/crm-desk";

export const DICIONARIO_CALLS_VERSAO = "1.1" as const;

export const PRINCIPIOS_GOVERNANCA_CALLS: readonly string[] = [
  "O Painel de Calls é a camada de entrada, qualificação e handoff comercial; não é fonte de verdade de preços, contratos, links de cobrança ou despesas.",
  "O catálogo homologado (product_catalog, no Desk) é a fonte de verdade para produto, preço, condição e link de cobrança. A Planilha Mestre é legado de auditoria histórica, não fonte operacional viva.",
  "Despesas de terceiros são registradas como previstas/aprovadas/pagas pelo cliente, nunca como desembolso do Clube ou reembolso futuro.",
  "Campos padronizados usam lista controlada com rejeição de entrada livre; observações ficam em campos de texto separados.",
  "Elegibilidade e via jurídica são triagem comercial/técnica preliminar, nunca decisão jurídica final.",
  "Todo lead que avançar tem próxima ação, responsável, data da próxima ação e origem do lead.",
];

/** Listas próprias do dicionário (as demais reaproveitam LISTAS_BASE_CA04). */
export const LISTAS_DICIONARIO_CALLS = {
  "Etapa do funil": [
    "Novo lead",
    "Triagem",
    "Discovery agendada",
    "Discovery realizada",
    "Diagnóstico em elaboração",
    "Proposta enviada",
    "Negociação",
    "Contrato enviado",
    "Contrato assinado",
    "Pagamento inicial confirmado",
    "Onboarding",
    "Perdido",
    "Nutrição",
    "Encerrado sem aderência",
  ],
  "Responsável atual": [
    "SDR",
    "Closer",
    "Pesquisa",
    "Operações",
    "Financeiro",
    "Jurídico/parceiro",
    "A definir",
  ],
  "Elegibilidade preliminar": [
    "Forte",
    "Provável",
    "Possível com pesquisa",
    "Baixa",
    "Inconclusiva",
    "Sem aderência atual",
  ],
  "Marco jurídico de referência": [
    "Itália — Lei 91/1992",
    "Áustria — §58c StbG",
    "Alemanha — Art. 116(2)/§15 StAG",
    "Espanha — Ley 20/2022",
    "Portugal — Lei 37/1981",
    "Polônia — confirmação de cidadania",
    "Hungria — naturalização simplificada",
    "Luxemburgo — Lei de Nacionalidade",
    "Croácia — descendência",
    "Romênia — cidadania por descendência",
    "Outro/validar",
  ],
  "Documento-chave do ascendente": [
    "Certidão de nascimento",
    "Certidão de casamento",
    "Certidão de óbito",
    "Passaporte",
    "Registro de imigração",
    "Registro militar",
    "Registro religioso",
    "Naturalização/negativa de naturalização",
    "Registro consular",
    "Prova de perseguição",
    "Nenhum ainda",
  ],
  "Pendência documental prioritária": [
    "Certidão de nascimento",
    "Certidão de casamento",
    "Certidão de óbito",
    "Naturalização/negativa",
    "Passaporte",
    "Imigração",
    "Registro militar",
    "Registro religioso",
    "Retificação",
    "Tradução",
    "Apostila",
    "Prova histórica",
    "Documento pessoal do requerente",
    "Nenhuma",
    "A definir",
  ],
  "Estrutura familiar": [
    "Individual",
    "Casal",
    "Núcleo familiar",
    "Família ampliada",
    "Linha com menores",
    "A definir",
  ],
  "Produtos/serviços recomendados": [
    "Diagnóstico",
    "Pesquisa genealógica",
    "Assessoria completa",
    "Montagem de pasta",
    "Certidões",
    "Retificação",
    "Tradução",
    "Apostila",
    "Protocolo/acompanhamento",
    "Pós-cidadania",
    "Memória familiar",
    "Outro SKU — consultar catálogo homologado",
  ],
  "Faixa de despesas externas": [
    "Sem estimativa",
    "Até R$ 1.000",
    "R$ 1.001–3.000",
    "R$ 3.001–6.000",
    "R$ 6.001–10.000",
    "Acima de R$ 10.000",
    "Sob consulta",
  ],
  "Objeção predominante": [
    "Preço",
    "Prazo",
    "Falta de documentos",
    "Dúvida de elegibilidade",
    "Família/decisor",
    "Confiança",
    "Momento financeiro",
    "Idioma",
    "Comparação com concorrente",
    "Não houve",
    "Outro",
  ],
  "Nível de intenção": [
    "Alta — quer avançar",
    "Média — precisa avaliar",
    "Baixa — exploratório",
    "Sem intenção atual",
  ],
  "Resultado da Discovery": [
    "Avançar para diagnóstico",
    "Avançar para proposta",
    "Solicitar documentos",
    "Pesquisa prévia",
    "Nutrição",
    "Sem aderência",
    "Encerrar",
  ],
} as const;

export type NomeListaDicionario = keyof typeof LISTAS_DICIONARIO_CALLS;

/** Todas as listas usadas pelo dicionário, incluindo as herdadas do CA-04. */
export const LISTAS_BASE_CALLS: Record<string, readonly string[]> = {
  ...(LISTAS_BASE_CA04 as unknown as Record<string, readonly string[]>),
  ...(LISTAS_DICIONARIO_CALLS as unknown as Record<string, readonly string[]>),
};

export function valorPermitidoCalls(lista: string, valor: string | null | undefined): boolean {
  const opcoes = LISTAS_BASE_CALLS[lista];
  if (!opcoes) return false;
  return typeof valor === "string" && opcoes.includes(valor);
}

export type TipoCampoCalls =
  | "Texto automático"
  | "Texto"
  | "Data"
  | "E-mail"
  | "Número"
  | "URL"
  | "Checkbox"
  | "Pergunta da Mesa"
  | "Dropdown"
  | "Dropdown fixo"
  | "Dropdown dependente"
  | "Dropdown múltiplo controlado";

export type EtapaObrigatoria =
  | "Entrada"
  | "Diagnóstico"
  | "Qualificação"
  | "Discovery"
  | "Pós-Discovery"
  | "Proposta"
  | "Onboarding"
  | "Fechamento"
  | "Se perdido"
  | "Sempre";

export type CampoDicionario = {
  campo: string;
  tipo: TipoCampoCalls;
  obrigatorio_na_etapa: EtapaObrigatoria;
  /** Nome da lista controlada quando o campo é classificatório. */
  lista?: string;
  regra: string;
};

/** §2 — Campos do CRM e critérios de validação. */
export const CAMPOS_DICIONARIO_CALLS: readonly CampoDicionario[] = [
  { campo: "ID Lead", tipo: "Texto automático", obrigatorio_na_etapa: "Entrada", regra: "Formato sugerido: CA-LEAD-AAAA-SEQ. Não editar manualmente." },
  { campo: "Data de entrada", tipo: "Data", obrigatorio_na_etapa: "Entrada", regra: "Data válida." },
  { campo: "Nome completo", tipo: "Texto", obrigatorio_na_etapa: "Entrada", regra: "Obrigatório; não usar apelido como nome principal." },
  { campo: "WhatsApp", tipo: "Texto", obrigatorio_na_etapa: "Entrada", regra: "Formato E.164/DDD, quando disponível." },
  { campo: "E-mail", tipo: "E-mail", obrigatorio_na_etapa: "Diagnóstico", regra: "Formato de e-mail válido." },
  { campo: "Origem do lead", tipo: "Dropdown", obrigatorio_na_etapa: "Entrada", lista: "Origem do lead", regra: "Lista controlada; rejeitar entrada livre." },
  { campo: "Objetivo principal", tipo: "Dropdown", obrigatorio_na_etapa: "Entrada", lista: "Objetivo principal", regra: "Lista controlada; rejeitar entrada livre." },
  { campo: "Nacionalidade de interesse", tipo: "Dropdown múltiplo controlado", obrigatorio_na_etapa: "Qualificação", lista: "Nacionalidade de interesse", regra: "Múltipla escolha apenas dentro da lista." },
  { campo: "País/linha prioritária", tipo: "Dropdown", obrigatorio_na_etapa: "Qualificação", lista: "País/linha prioritária", regra: "Lista controlada; país é parâmetro, não catálogo paralelo." },
  { campo: "Status da call", tipo: "Dropdown", obrigatorio_na_etapa: "Entrada", lista: "Status da call", regra: "Lista controlada; rejeitar entrada livre." },
  { campo: "Etapa do funil", tipo: "Dropdown", obrigatorio_na_etapa: "Entrada", lista: "Etapa do funil", regra: "Lista controlada; rejeitar entrada livre." },
  { campo: "Responsável atual", tipo: "Dropdown", obrigatorio_na_etapa: "Entrada", lista: "Responsável atual", regra: "Lista controlada; todo lead ativo tem responsável." },
  { campo: "Elegibilidade preliminar", tipo: "Dropdown", obrigatorio_na_etapa: "Pós-Discovery", lista: "Elegibilidade preliminar", regra: "Triagem preliminar; nunca decisão jurídica final." },
  { campo: "Confiança da triagem", tipo: "Dropdown", obrigatorio_na_etapa: "Pós-Discovery", lista: "Confiança da triagem", regra: "Lista controlada; explicita a base da triagem." },
  { campo: "Via jurídica preliminar", tipo: "Dropdown", obrigatorio_na_etapa: "Pós-Discovery", lista: "Via jurídica preliminar", regra: "Preliminar; depende de validação documental e análise humana." },
  { campo: "Status da via", tipo: "Dropdown", obrigatorio_na_etapa: "Pós-Discovery", lista: "Status da via", regra: "Lista controlada; condiciona o que pode ser proposto." },
  { campo: "Marco jurídico de referência", tipo: "Dropdown", obrigatorio_na_etapa: "Pós-Discovery", lista: "Marco jurídico de referência", regra: "Referência normativa por país; uso interno." },
  { campo: "Geração do ascendente identificado", tipo: "Dropdown", obrigatorio_na_etapa: "Pós-Discovery", lista: "Geração do ascendente", regra: "Lista controlada; usar 'Ainda não identificado' quando aplicável." },
  { campo: "Linha de transmissão", tipo: "Dropdown", obrigatorio_na_etapa: "Pós-Discovery", lista: "Linha de transmissão", regra: "Lista controlada; rejeitar entrada livre." },
  { campo: "Risco de ruptura na linha", tipo: "Dropdown", obrigatorio_na_etapa: "Pós-Discovery", lista: "Risco de ruptura", regra: "Lista controlada; hipótese, não conclusão." },
  { campo: "Complexidade documental", tipo: "Dropdown", obrigatorio_na_etapa: "Pós-Discovery", lista: "Complexidade documental", regra: "Lista controlada; rejeitar entrada livre." },
  { campo: "Estado documental inicial", tipo: "Dropdown", obrigatorio_na_etapa: "Pós-Discovery", lista: "Estado documental inicial", regra: "Lista controlada; rejeitar entrada livre." },
  { campo: "Documento-chave do ascendente", tipo: "Dropdown múltiplo controlado", obrigatorio_na_etapa: "Pós-Discovery", lista: "Documento-chave do ascendente", regra: "Múltipla escolha apenas dentro da lista." },
  { campo: "Pendência documental prioritária", tipo: "Dropdown", obrigatorio_na_etapa: "Pós-Discovery", lista: "Pendência documental prioritária", regra: "Lista controlada; uma pendência prioritária por vez." },
  { campo: "Exige idioma/entrevista", tipo: "Dropdown", obrigatorio_na_etapa: "Pós-Discovery", lista: "Exige idioma/entrevista", regra: "Lista controlada; rejeitar entrada livre." },
  { campo: "Número de requerentes potenciais", tipo: "Número", obrigatorio_na_etapa: "Pós-Discovery", regra: "Inteiro positivo." },
  { campo: "Estrutura familiar", tipo: "Dropdown", obrigatorio_na_etapa: "Pós-Discovery", lista: "Estrutura familiar", regra: "Lista controlada; rejeitar entrada livre." },
  { campo: "Produtos/serviços recomendados", tipo: "Dropdown múltiplo controlado", obrigatorio_na_etapa: "Proposta", lista: "Produtos/serviços recomendados", regra: "Múltipla escolha apenas dentro da lista." },
  { campo: "SKU recomendado", tipo: "Dropdown dependente", obrigatorio_na_etapa: "Proposta", regra: "Somente SKUs ativos do catálogo homologado; depende de Produtos/serviços recomendados." },
  { campo: "Status de despesas de terceiros", tipo: "Dropdown", obrigatorio_na_etapa: "Proposta", lista: "Status de despesas de terceiros", regra: "Nunca lançar como caixa do Clube ou reembolso." },
  { campo: "Regra de despesas", tipo: "Dropdown fixo", obrigatorio_na_etapa: "Proposta", lista: "Regra de despesas", regra: "Lista fixa; o Clube não antecipa nem reembolsa despesa de terceiro." },
  { campo: "Faixa de despesas externas", tipo: "Dropdown", obrigatorio_na_etapa: "Proposta", lista: "Faixa de despesas externas", regra: "Faixa estimada; nunca valor digitado livremente como preço." },
  { campo: "Objeção predominante", tipo: "Dropdown", obrigatorio_na_etapa: "Pós-Discovery", lista: "Objeção predominante", regra: "Lista controlada; rejeitar entrada livre." },
  { campo: "Nível de intenção", tipo: "Dropdown", obrigatorio_na_etapa: "Pós-Discovery", lista: "Nível de intenção", regra: "Lista controlada; rejeitar entrada livre." },
  { campo: "Resultado da Discovery", tipo: "Dropdown", obrigatorio_na_etapa: "Pós-Discovery", lista: "Resultado da Discovery", regra: "Lista controlada; obrigatório quando a call foi realizada." },
  { campo: "Próxima ação", tipo: "Dropdown", obrigatorio_na_etapa: "Sempre", lista: "Próxima ação", regra: "Lista controlada; todo lead ativo tem próxima ação." },
  { campo: "Prazo da próxima ação", tipo: "Data", obrigatorio_na_etapa: "Sempre", regra: "Não pode ser anterior à data do registro." },
  { campo: "Resultado comercial", tipo: "Dropdown", obrigatorio_na_etapa: "Fechamento", lista: "Resultado comercial", regra: "Lista controlada; derivado dos dois eixos." },
  { campo: "Motivo de perda", tipo: "Dropdown", obrigatorio_na_etapa: "Se perdido", lista: "Motivo de perda", regra: "Obrigatório quando o resultado comercial é de perda." },
  { campo: "Consentimento de gravação", tipo: "Checkbox", obrigatorio_na_etapa: "Discovery", regra: "Sim/Não. Obrigatório antes de gravar." },
  { campo: "SPIN — Situação", tipo: "Pergunta da Mesa", obrigatorio_na_etapa: "Discovery", regra: "Pergunta da Mesa de Discovery no Painel de Calls. Completa quando deriva da resposta em objetivo, país, participantes ou linha familiar. Não é checkbox." },
  { campo: "SPIN — Problema", tipo: "Pergunta da Mesa", obrigatorio_na_etapa: "Discovery", regra: "Pergunta da Mesa: lacuna objetiva (documento incerto, ruptura). Completa quando deriva da resposta nesses campos. Não é checkbox." },
  { campo: "SPIN — Implicação", tipo: "Pergunta da Mesa", obrigatorio_na_etapa: "Discovery", regra: "Pergunta da Mesa: o que muda se não estruturar (via, complexidade, idioma, pesquisa prévia). Completa quando deriva da resposta. Não é checkbox." },
  { campo: "SPIN — Necessidade", tipo: "Pergunta da Mesa", obrigatorio_na_etapa: "Discovery", regra: "Pergunta da Mesa: valor verbalizado e próximo passo (intenção, objeção, resultado, prazo). Completa quando deriva da resposta. Não é checkbox." },
  { campo: "Link da gravação/transcrição", tipo: "URL", obrigatorio_na_etapa: "Pós-Discovery", regra: "Link válido; acesso interno restrito." },
  { campo: "Link do dossiê/pasta do caso", tipo: "URL", obrigatorio_na_etapa: "Onboarding", regra: "Um único dossiê-mãe por família/caso." },
];

/** Registro de lead avaliado pelas regras de dependência do §4. */
export type RegistroCallsCrm = {
  leadAtivo?: boolean;
  origemLead?: string | null;
  responsavelAtual?: string | null;
  etapaFunil?: string | null;
  statusCall?: string | null;
  elegibilidadePreliminar?: string | null;
  viaJuridicaPreliminar?: string | null;
  statusVia?: string | null;
  geracaoAscendente?: string | null;
  estadoDocumentalInicial?: string | null;
  resultadoDiscovery?: string | null;
  proximaAcao?: string | null;
  prazoProximaAcao?: string | null;
  dataRegistro?: string | null;
  resultadoComercial?: string | null;
  motivoPerda?: string | null;
  produtosRecomendados?: readonly string[];
  skuRecomendado?: string | null;
  /** Fonte operacional: product_catalog. `skuAtivoNaPlanilhaMestre` fica só como alias histórico. */
  skuAtivoNoCatalogoHomologado?: boolean;
  skuAtivoNaPlanilhaMestre?: boolean;
  ofertaProtocoloAssessoria?: boolean;
  statusDespesasTerceiros?: string | null;
  estimativaDespesasRegistrada?: boolean;
  responsavelPagador?: string | null;
  consentimentoGravacao?: boolean;
  linkGravacao?: string | null;
  contratoAssinado?: boolean;
  pagamentoInicialConfirmado?: boolean;
  linkDossie?: string | null;
  vinculoNucleoRegistrado?: boolean;
  fazParteDeNucleo?: boolean;
};

export type BloqueioCalls = { regra: number; campo: string; mensagem: string };

const perdido = (resultado: string | null | undefined) =>
  typeof resultado === "string" && resultado.startsWith("Perdido");

/** §4 — Regras de dependência e bloqueio (avaliação somente leitura). */
export function avaliarBloqueiosCalls(r: RegistroCallsCrm): BloqueioCalls[] {
  const b: BloqueioCalls[] = [];

  if (r.skuRecomendado) {
    if (!r.produtosRecomendados || r.produtosRecomendados.length === 0) {
      b.push({
        regra: 1,
        campo: "SKU recomendado",
        mensagem: "Preencher 'Produtos/serviços recomendados' antes do SKU recomendado.",
      });
    }
    if (r.skuAtivoNoCatalogoHomologado === false || r.skuAtivoNaPlanilhaMestre === false) {
      b.push({
        regra: 1,
        campo: "SKU recomendado",
        mensagem: "Usar apenas SKU com status ATIVO no catálogo homologado.",
      });
    }
  }

  if (r.resultadoComercial === "Convertido") {
    if (!r.contratoAssinado || !r.pagamentoInicialConfirmado || !r.linkDossie) {
      b.push({
        regra: 2,
        campo: "Resultado comercial",
        mensagem:
          "Convertido exige contrato assinado, pagamento inicial confirmado e link do dossiê/pasta.",
      });
    }
  }

  if (r.etapaFunil === "Contrato assinado" && !r.contratoAssinado) {
    b.push({ regra: 3, campo: "Etapa do funil", mensagem: "Etapa 'Contrato assinado' exige contrato ou link correspondente." });
  }

  if (r.etapaFunil === "Onboarding" && !r.pagamentoInicialConfirmado) {
    b.push({ regra: 4, campo: "Etapa do funil", mensagem: "Etapa 'Onboarding' exige pagamento inicial confirmado." });
  }

  if (perdido(r.resultadoComercial) && !r.motivoPerda) {
    b.push({ regra: 5, campo: "Motivo de perda", mensagem: "Resultado de perda exige motivo de perda." });
  }

  if (r.statusCall === "Realizada" && (!r.resultadoDiscovery || !r.proximaAcao)) {
    b.push({ regra: 6, campo: "Status da call", mensagem: "Call realizada exige resultado da Discovery e próxima ação." });
  }

  if (
    (r.elegibilidadePreliminar === "Forte" || r.elegibilidadePreliminar === "Provável") &&
    (!r.viaJuridicaPreliminar || !r.geracaoAscendente || !r.estadoDocumentalInicial)
  ) {
    b.push({
      regra: 7,
      campo: "Elegibilidade preliminar",
      mensagem:
        "Elegibilidade Forte/Provável exige via jurídica preliminar, geração do ascendente e estado documental inicial.",
    });
  }

  if (r.statusVia === "Encerrada para novos pedidos" && r.ofertaProtocoloAssessoria) {
    b.push({
      regra: 8,
      campo: "Status da via",
      mensagem:
        "Via encerrada para novos pedidos: permitir apenas diagnóstico, pesquisa de alternativas ou nutrição.",
    });
  }

  if (r.statusDespesasTerceiros === "Aprovadas" && (!r.estimativaDespesasRegistrada || !r.responsavelPagador)) {
    b.push({
      regra: 9,
      campo: "Status de despesas de terceiros",
      mensagem:
        "Despesas aprovadas exigem estimativa registrada e responsável pagador; nunca lançar como desembolso do Clube.",
    });
  }

  if (r.consentimentoGravacao !== true && r.linkGravacao) {
    b.push({
      regra: 10,
      campo: "Link da gravação/transcrição",
      mensagem: "Sem consentimento de gravação, o link de gravação/transcrição não pode ser incluído.",
    });
  }

  if (r.fazParteDeNucleo && !r.vinculoNucleoRegistrado) {
    b.push({
      regra: 11,
      campo: "Vínculo ao núcleo",
      mensagem: "Cada requerente precisa de registro individual com vínculo ao núcleo, mesmo compartilhando o dossiê-mãe.",
    });
  }

  if (r.leadAtivo && (!r.responsavelAtual || !r.etapaFunil || !r.proximaAcao || !r.prazoProximaAcao)) {
    b.push({
      regra: 0,
      campo: "Lead ativo",
      mensagem: "Todo lead ativo precisa de responsável, etapa do funil e próxima ação datada.",
    });
  }

  if (r.prazoProximaAcao && r.dataRegistro && r.prazoProximaAcao < r.dataRegistro) {
    b.push({
      regra: 0,
      campo: "Prazo da próxima ação",
      mensagem: "O prazo da próxima ação não pode ser anterior à data do registro.",
    });
  }

  return b;
}

export type CorSemaforo = "verde" | "amarelo" | "laranja" | "vermelho" | "neutro";

export type RegraFormatacao = { condicao: string; cor: CorSemaforo };

/** §5 — Formatação condicional recomendada. */
export const FORMATACAO_CONDICIONAL_CALLS: readonly RegraFormatacao[] = [
  { condicao: "Etapa do funil 'Contrato assinado', 'Pagamento inicial confirmado' ou 'Onboarding'", cor: "verde" },
  { condicao: "'Proposta enviada' e 'Negociação' sem próxima ação vencida", cor: "amarelo" },
  { condicao: "'No-show', 'Perdido' ou próxima ação atrasada", cor: "vermelho" },
  { condicao: "Elegibilidade 'Forte' ou 'Provável'", cor: "verde" },
  { condicao: "Elegibilidade 'Inconclusiva' ou 'Possível com pesquisa'", cor: "amarelo" },
  { condicao: "Elegibilidade 'Baixa' ou 'Sem aderência atual'", cor: "vermelho" },
  { condicao: "Status da via 'Aberta com prazo', 'Restrita', 'Encerrada para novos pedidos' ou 'Em confirmação jurídica'", cor: "amarelo" },
  { condicao: "Complexidade documental 'Alta' ou 'Muito alta'", cor: "laranja" },
  { condicao: "Status de despesas 'Aguardando aprovação' ou 'Pendência do cliente'", cor: "amarelo" },
  { condicao: "Próxima ação vencida", cor: "vermelho" },
];

/** §7 — Critérios de aceite da implementação. */
export const CRITERIOS_ACEITE_CALLS: readonly string[] = [
  "Todas as colunas classificatórias usam lista controlada e rejeitam entrada livre.",
  "Campos de texto livre existem apenas para resumo da call, observações, narrativa familiar e links.",
  "Nenhum SKU, preço ou link de cobrança é digitado livremente no Painel de Calls.",
  "Nenhuma despesa de terceiro é lançada como caixa do Clube ou reembolso.",
  "Todo lead ativo possui responsável, etapa do funil e próxima ação datada.",
  "Todo caso convertido possui contrato, pagamento inicial e um único link de dossiê-mãe.",
];

/** §6 — Mapeamento para o Painel de Calls atual. */
export const MAPEAMENTO_PAINEL_CALLS: readonly string[] = [
  "CA-04 / CRM Mestre é o mapa de regras do mesmo sistema do Painel de Calls — mesma tabela leads, sem segunda ficha.",
  "O dicionário avalia o lead canônico em /calls. Pendência informa; não trava rascunho.",
  "Campos classificatórios do Painel usam CATALOGOS do CRM Vivo (slugs persistidos); os rótulos cobrem as listas do dicionário.",
  "SKU, preço e link vêm do catálogo homologado. A Planilha Mestre não volta como fonte viva.",
  "O comparativo jurídico alimenta a triagem, mas não substitui o cadastro operacional do lead.",
];

const campoVazio = (v: unknown) => v === null || v === undefined || String(v).trim() === "";

const NUCLEO_ESTRUTURAS = new Set(["nucleo_familiar", "familia_ampliada", "linha_com_menores"]);
const EIXO_GANHO = new Set([
  "contrato_assinado",
  "pagamento_inicial_confirmado",
  "cliente_ativo",
  "onboarding_iniciado",
  "caso_ativo",
]);

function etapaFunilDoLead(l: LeadDesk): string | null {
  const formalizacao = String(l.eixo_formalizacao ?? "");
  if (formalizacao === "contrato_assinado") return "Contrato assinado";
  if (formalizacao === "onboarding_iniciado") return "Onboarding";
  if (formalizacao === "pagamento_inicial_confirmado") return "Pagamento inicial confirmado";
  if (formalizacao === "contrato_enviado") return "Contrato enviado";
  const comercial = rotulo("eixo_comercial", l.eixo_comercial);
  return comercial === "—" ? null : comercial;
}

function resultadoParaDicionario(l: LeadDesk): string | null {
  if (l.eixo_comercial === "perdido") {
    const motivo = rotulo("motivo_perda", l.motivo_perda);
    return motivo === "—" ? "Perdido" : `Perdido — ${motivo}`;
  }
  if (EIXO_GANHO.has(String(l.eixo_formalizacao ?? ""))) return "Convertido";
  const derivado = resultadoComercialDerivado(l);
  return derivado === "Em andamento comercial" ? null : derivado;
}

function rotuloProduto(valor: string): string {
  return PRODUTOS_RECOMENDADOS.find((o) => o.valor === valor)?.rotulo ?? valor;
}

/** Traduz o lead persistido (slugs) para o vocabulário do dicionário (rótulos). */
export function leadParaRegistroCalls(l: LeadDesk): RegistroCallsCrm {
  const produtos = (l.produtos_recomendados ?? []).map(rotuloProduto);
  return {
    leadAtivo: !l.archived_at && !["perdido", "encerrado_sem_aderencia"].includes(String(l.eixo_comercial)),
    origemLead: campoVazio(l.origem) ? null : rotulo("origem", l.origem),
    responsavelAtual: l.responsavel_nome ?? null,
    etapaFunil: etapaFunilDoLead(l),
    statusCall: campoVazio(l.status_call) ? null : rotulo("status_call", l.status_call),
    elegibilidadePreliminar: campoVazio(l.elegibilidade_preliminar)
      ? null
      : rotulo("elegibilidade_preliminar", l.elegibilidade_preliminar),
    viaJuridicaPreliminar: campoVazio(l.via_juridica_preliminar)
      ? null
      : rotulo("via_juridica_preliminar", l.via_juridica_preliminar),
    statusVia:
      String(l.status_via) === "inviavel_preliminar"
        ? "Encerrada para novos pedidos"
        : campoVazio(l.status_via)
          ? null
          : rotulo("status_via", l.status_via),
    geracaoAscendente: campoVazio(l.geracao_ascendente) ? null : rotulo("geracao_ascendente", l.geracao_ascendente),
    estadoDocumentalInicial: campoVazio(l.estado_documental_inicial)
      ? null
      : rotulo("estado_documental_inicial", l.estado_documental_inicial),
    resultadoDiscovery: campoVazio(l.discovery_resultado) ? null : rotulo("discovery_resultado", l.discovery_resultado),
    proximaAcao: campoVazio(l.proxima_acao) ? null : rotulo("proxima_acao", l.proxima_acao),
    prazoProximaAcao: l.proxima_acao_em ? String(l.proxima_acao_em).slice(0, 10) : null,
    dataRegistro: l.created_at ? String(l.created_at).slice(0, 10) : null,
    resultadoComercial: resultadoParaDicionario(l),
    motivoPerda: campoVazio(l.motivo_perda) ? null : rotulo("motivo_perda", l.motivo_perda),
    produtosRecomendados: produtos,
    skuRecomendado: l.sku_referencia ?? null,
    ofertaProtocoloAssessoria: (l.produtos_recomendados ?? []).includes("protocolo_acompanhamento"),
    statusDespesasTerceiros: campoVazio(l.despesas_terceiros_status)
      ? null
      : rotulo("despesas_terceiros_status", l.despesas_terceiros_status),
    estimativaDespesasRegistrada: !campoVazio(l.despesas_terceiros_faixa),
    consentimentoGravacao: String(l.consentimento_status) === "concedido" || l.consentimento_gravacao === true,
    linkGravacao: l.gravacao_link_interno ?? null,
    contratoAssinado: !campoVazio(l.contrato_link_interno),
    pagamentoInicialConfirmado: !campoVazio(l.asaas_evento_referencia),
    linkDossie: l.dossie_link_interno ?? l.dossie_mae_ref ?? null,
    vinculoNucleoRegistrado: !campoVazio(l.nucleo_id),
    fazParteDeNucleo: NUCLEO_ESTRUTURAS.has(String(l.estrutura_familiar)) || !campoVazio(l.nucleo_id),
  };
}

/** Regras do dicionário aplicadas ao lead vivo. Informam; não travam gravação. */
export function pendenciasDicionarioDoLead(l: LeadDesk): { campo: string; motivo: string }[] {
  return avaliarBloqueiosCalls(leadParaRegistroCalls(l)).map((b) => ({
    campo: b.campo,
    motivo: `CA-04 · regra ${b.regra}: ${b.mensagem}`,
  }));
}
