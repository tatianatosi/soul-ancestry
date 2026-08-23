/**
 * Motor executável dos Anexos I–V do contrato-base (MODELO-ESTUDO + BASE-GEN-V2).
 *
 * Cada anexo é derivado por regra e fonte. Nada é inferido: campo sem fonte
 * rastreável permanece pendente e explica o efeito no gate. Este módulo é puro:
 * não envia, não assina, não cobra e não dispara pesquisa externa.
 */

import { CLAUSULA_DESPESAS_TERCEIROS, ESTADOS_DESPESA, type EstadoDespesa } from "@/lib/despesas-terceiros";
import { fonteOficialDePreco } from "@/lib/precos-sku";
import type { EstadoAnexo } from "@/lib/anexos-dicionario";
import {
  AVISO_PREPARO_PROCURACAO,
  bloqueiosProcuracaoEuropeia,
  type ContextoProcuracaoEuropeia,
} from "@/lib/procuracao-europeia";

export const MODELOS_PERMITIDOS = ["MODELO-ESTUDO", "BASE-GEN-V2"] as const;
export type ModeloPermitido = (typeof MODELOS_PERMITIDOS)[number];

export function modeloGeraPrevia(modelo?: string | null): boolean {
  return (MODELOS_PERMITIDOS as readonly string[]).includes(String(modelo ?? ""));
}

/* ---------------- fontes e precedência ---------------- */

export const PRECEDENCIA_FONTES = [
  "planejador_homologado",
  "proposta_os_aprovada",
  "crm_confirmado",
  "documento_conferido",
  "preenchimento_humano_confirmado",
  "importado_a_confirmar",
] as const;
export type FonteParametro = (typeof PRECEDENCIA_FONTES)[number];

export const FONTES_APOIO = ["whatsapp", "transcricao", "reuniao", "relato"] as const;
export type FonteApoio = (typeof FONTES_APOIO)[number];

export const ROTULO_FONTE: Record<string, string> = {
  planejador_homologado: "Planejador homologado",
  proposta_os_aprovada: "Proposta/OS aprovada",
  crm_confirmado: "CRM/cadastro confirmado",
  documento_conferido: "Documento conferido",
  preenchimento_humano_confirmado: "Preenchimento humano confirmado",
  importado_a_confirmar: "Importado a confirmar",
  whatsapp: "WhatsApp (apoio)",
  transcricao: "Transcrição (apoio)",
  reuniao: "Reunião (apoio)",
  relato: "Relato (apoio)",
  contrato_base: "Contrato-base",
  perfil_institucional: "Perfil institucional",
  politica_institucional: "Política institucional",
  configuracao_juridica: "Configuração jurídica",
  anexo: "Anexo",
};

export function fonteValidaParametro(fonte?: string | null): boolean {
  return (PRECEDENCIA_FONTES as readonly string[]).includes(String(fonte ?? ""));
}

export function precedencia(fonte: string): number {
  const i = (PRECEDENCIA_FONTES as readonly string[]).indexOf(fonte);
  return i < 0 ? Number.MAX_SAFE_INTEGER : i;
}

export type ConflitoFonte = {
  campo: string;
  valorAtual: string | null;
  origemAtual: string;
  valorConcorrente: string | null;
  origemConcorrente: string;
  transicaoBloqueada: GateContratual;
  exigeJustificativa: true;
};

/**
 * Conflito nunca escolhe valor: registra as duas origens e bloqueia só a transição afetada.
 */
export function conflitoDeFonte(input: {
  campo: string;
  valorAtual: string | null;
  origemAtual: string;
  valorConcorrente: string | null;
  origemConcorrente: string;
  transicaoBloqueada: GateContratual;
}): ConflitoFonte | null {
  if (input.valorAtual === input.valorConcorrente) return null;
  return { ...input, exigeJustificativa: true };
}

/* ---------------- gates ---------------- */

export const GATES = ["rascunho", "previa_final", "revisao_humana", "assinatura", "financeiro", "pesquisa_externa", "portal"] as const;
export type GateContratual = (typeof GATES)[number];

export const ROTULO_GATE: Record<GateContratual, string> = {
  rascunho: "Rascunho de trabalho",
  previa_final: "Prévia final",
  revisao_humana: "Revisão humana",
  assinatura: "Assinatura",
  financeiro: "Financeiro",
  pesquisa_externa: "Pesquisa externa",
  portal: "Portal/onboarding",
};

export const MARCA_RASCUNHO = "RASCUNHO INTERNO — INCOMPLETO — NÃO APTO PARA ASSINATURA";

/* ---------------- proposta/OS ---------------- */

export const ESTADOS_PROPOSTA_VALIDOS = ["aprovada", "aceita"] as const;
export const ESTADOS_PROPOSTA_INVALIDOS = ["rascunho", "enviada", "em_negociacao", "arquivada", "substituida", "recusada", "expirada"] as const;

export type PropostaVinculada = {
  id: string;
  caseId: string;
  estado: string;
  versao: string | null;
  produtoSku: string | null;
  produtoNome: string | null;
  fontePreco: string | null;
  valorContratado: string | null;
  modalidade: string | null;
  formaPagamento: string | null;
  parcelas: string | null;
  primeiroVencimento: string | null;
  proximoVencimento: string | null;
  servicosIncluidos: string[];
  /** null = a proposta não declara exclusões (não inventar redação). */
  servicosExcluidos: string[] | null;
  entregaveis: string[];
  objetivoEtapa: string | null;
  limitesDependencias: string[];
  /** Regra 5: SKU precisa estar ativo e homologado. null = não verificado. */
  skuAtivoHomologado?: boolean | null;
};

/** Modelo parametrizável do Anexo I — texto jurídico aprovado; instância técnica pendente de materialização/preenchimento. */
export const ANEXO_I_MODELO_VERSAO = "ANEXO-I-ORDEM-DE-SERVICO-v1.0";

/** Regras do motor do Anexo I — texto normativo, não editável por caso. */
export const REGRAS_MOTOR_ANEXO_I: string[] = [
  "Fonte obrigatória: proposta/OS aprovada, ativa e vinculada ao mesmo caso.",
  "Serviços, exclusões, fases, entregáveis, limites, dependências, produto, condição comercial e referência/versão são derivados da proposta.",
  "Não inventar exclusões. Sem exclusões expressas, registrar: “Não especificado na proposta/OS — revisão humana necessária”.",
  "Esse estado bloqueia revisão final e assinatura e nunca gera texto fictício.",
  "Produto/SKU precisa estar ativo e homologado.",
  "Preço e condição vêm da fonte comercial homologada ou da proposta aprovada autorizada.",
  "Não inferir vencimentos com base no número de parcelas.",
  "Proposta arquivada, substituída, recusada, expirada ou de outro caso não satisfaz o gate.",
];

export function propostaSatisfazGate(p: PropostaVinculada | null, caseId: string): { ok: boolean; motivo?: string } {
  if (!p) return { ok: false, motivo: "Nenhuma proposta/OS aprovada vinculada ao caso." };
  if (p.caseId !== caseId) return { ok: false, motivo: "Proposta pertence a outro caso: não alimenta o Anexo I." };
  if (!(ESTADOS_PROPOSTA_VALIDOS as readonly string[]).includes(p.estado)) {
    return { ok: false, motivo: `Proposta em estado "${p.estado}" não satisfaz gate contratual.` };
  }
  return { ok: true };
}

/* ---------------- estrutura comum ---------------- */

export type CampoRenderizado = {
  rotulo: string;
  valor: string | null;
  fonte: string;
  /** Texto exibido quando não há fonte — nunca substituído por valor fictício. */
  observacaoAusencia?: string;
};

export type AnexoGovernado = {
  codigo: string;
  titulo: string;
  finalidade: string;
  regra: string;
  condicional: boolean;
  aplicavel: boolean;
  obrigatorio: boolean;
  motivo: string;
  estado: EstadoAnexo;
  campos: CampoRenderizado[];
  pendencias: string[];
  impactoAusencia: string;
  destinos: GateContratual[];
  gatesBloqueados: GateContratual[];
};

function estadoDe(a: { aplicavel: boolean; obrigatorio: boolean; pendencias: string[]; registrado?: EstadoAnexo }): EstadoAnexo {
  if (a.registrado && ["em_revisao", "aprovado", "substituido", "arquivado"].includes(a.registrado)) return a.registrado;
  if (!a.aplicavel) return "nao_aplicavel";
  if (a.pendencias.length) return "pendente";
  return a.obrigatorio ? "obrigatorio" : "opcional";
}

/* ---------------- entradas ---------------- */

export type DespesaExternaAnexo = {
  item: string;
  finalidade: string | null;
  estimativa: string | null;
  valorReal: string | null;
  estado: EstadoDespesa;
  pagador: "cliente" | "clube_antecipa" | "terceiro_autorizado" | null;
  aprovacaoRegistrada: boolean;
  comprovante: boolean;
  fonte: string | null;
};

export const POLITICAS_DESPESA = [
  "nao_previstas_nesta_etapa",
  "incluidas_no_orcamento",
  "antecipadas_parcialmente_pelo_clube",
  "dependentes_de_aprovacao_individual",
  "pagas_diretamente_pela_cliente",
] as const;
export type PoliticaDespesaAnexo = (typeof POLITICAS_DESPESA)[number];

export const ROTULO_POLITICA_DESPESA: Record<PoliticaDespesaAnexo, string> = {
  nao_previstas_nesta_etapa: "Despesas não previstas nesta etapa",
  incluidas_no_orcamento: "Despesas incluídas no orçamento consolidado",
  antecipadas_parcialmente_pelo_clube: "Despesas antecipadas parcialmente pelo Clube Ancestral",
  dependentes_de_aprovacao_individual: "Despesas dependentes de aprovação individual da Cliente",
  pagas_diretamente_pela_cliente: "Despesas pagas diretamente pela Cliente",
};

export type AutorizacaoPesquisaAnexo = {
  finalidade: string | null;
  orgao: string | null;
  pessoas: string[];
  documentos: string[];
  temCustoExterno: boolean | null;
  tetoValor: string | null;
  prazoUso: string | null;
  aceiteRegistrado: boolean;
  aceiteEvidencia: string | null;
  orgaoExigeProcuracao: boolean;
  despesaVinculadaId: string | null;
  /** Regra 2: responsável interno pela autorização. */
  responsavelInterno?: string | null;
};

/** Modelo parametrizável do Anexo III — texto jurídico aprovado; instância técnica pendente de materialização/preenchimento. */
export const ANEXO_III_MODELO_VERSAO = "ANEXO-III-AUTORIZACAO-PESQUISA-v1.0";

/** Regras do motor do Anexo III — texto normativo, não editável por caso. */
export const REGRAS_MOTOR_ANEXO_III: string[] = [
  "Não criar automaticamente somente porque existe um caso.",
  "Exigir finalidade, órgão, pessoa relacionada, documento/informação, prazo de uso, responsável e vínculo ao caso.",
  "Havendo custo, vincular referência ao Anexo II e à aprovação aplicável.",
  "Se o órgão exigir procuração, o Anexo III não substitui o Anexo IV.",
  "Sem aceite específico rastreável, o status permanece pendente.",
  "Sem autorização aplicável, ficam bloqueados pesquisa nominal externa, pedido institucional, contato em nome do cliente e entrega derivada.",
  "O anexo não envia e-mail, WhatsApp, solicitação ou pesquisa externa automaticamente.",
];

/** Ações client-facing bloqueadas enquanto não houver autorização válida. */
export const ACOES_BLOQUEADAS_SEM_ANEXO_III: string[] = [
  "Pesquisa nominal externa",
  "Pedido institucional a órgão, cartório, paróquia, comune ou consulado",
  "Contato em nome do cliente",
  "Entrega derivada dessa pesquisa",
];

export const ESTADOS_PROCURACAO_ANEXO = [
  "nao_aplicavel",
  "nao_iniciada",
  "rascunho",
  "aguardando_assinatura",
  "assinada",
  "enviada",
  "respondida",
  "arquivada",
] as const;
export type EstadoProcuracaoAnexo = (typeof ESTADOS_PROCURACAO_ANEXO)[number];

export type ProcuracaoAnexo = {
  exigidaPorOrgao: boolean;
  /** Jurisdição: Brasil ou país europeu resolvido por fonte canônica (nunca default). */
  tipo: "brasil" | "europa" | null;
  finalidade: string | null;
  orgaoDestinatario: string | null;
  pessoas: string[];
  poderes: string[];
  status: EstadoProcuracaoAnexo;
  revisaoJuridicaAprovada: boolean;
  /** Regra 5: evidência de assinatura registrada, quando aplicável. */
  evidenciaAssinatura?: string | null;
  /** Contexto europeu resolvido (país, fonte, estado e conflito). */
  contextoEuropeu?: ContextoProcuracaoEuropeia | null;
  /** Campos que exigem fonte rastreável mesmo com país confirmado. */
  idioma?: string | null;
  modeloLocal?: string | null;
  requisitoFormal?: string | null;
};


/** Modelo condicional do Anexo IV — texto jurídico aprovado; instância técnica pendente de materialização/preenchimento. */
export const ANEXO_IV_MODELO_VERSAO = "ANEXO-IV-PROCURACAO-ESPECIFICA-v1.0";

/** Regras do motor do Anexo IV — texto normativo, não editável por caso. */
export const REGRAS_MOTOR_ANEXO_IV: string[] = [
  "É sempre condicional; não derivar automaticamente somente por país ou rota.",
  "Exigir finalidade específica, órgão destinatário, pessoas vinculadas, poderes necessários e revisão humana/jurídica.",
  "Estados permitidos: não iniciada, rascunho, aguardando assinatura, assinada, enviada, respondida, arquivada, não aplicável.",
  "Não criar procuração real, não enviar, não assinar e não inferir poderes.",
  "Quando exigida para atividade externa, bloquear a ação até instrumento aprovado e evidência de assinatura quando aplicável.",
  "Procuração é separada de autorização de pesquisa; uma não substitui a outra.",
  "A procuração de atuação europeia é parametrizada pelo país da proposta/OS, SKU homologado, Planejador ou caso — Itália nunca é default.",
  "Conflito de país entre fontes canônicas, ou país a confirmar, bloqueia preparação, revisão, assinatura e uso do Anexo IV.",
];


export const IMPACTOS_CONTROLADOS = ["sem_alteracao", "novo_prazo_estimado", "novo_valor", "despesa_externa_a_aprovar"] as const;
export type ImpactoControlado = (typeof IMPACTOS_CONTROLADOS)[number];

export type AlteracaoEscopoAnexo = {
  solicitada: boolean;
  escopoOriginalSnapshot: string | null;
  alteracao: string | null;
  motivo: string | null;
  impactoPrazo: ImpactoControlado | null;
  impactoFinanceiro: ImpactoControlado | null;
  novoValor: string | null;
  fonteNovoValor: string | null;
  aceiteRegistrado: boolean;
  aceiteEvidencia: string | null;
  /** Regra 3: responsável, fonte e revisão da alteração. */
  responsavelAlteracao?: string | null;
  fonteAlteracao?: string | null;
  revisaoInternaRegistrada?: boolean;
  /** Regra 6: vínculo ao Anexo II quando houver despesa externa a aprovar. */
  despesaVinculadaId?: string | null;
  /** Regra 9: alteração nunca reescreve anexo histórico/contrato assinado. */
  contratoAssinadoReferencia?: string | null;
  dataSolicitacao?: string | null;
};

/** Modelo parametrizável do Anexo V — texto jurídico aprovado; instância técnica pendente de materialização/preenchimento. */
export const ANEXO_V_MODELO_VERSAO = "ANEXO-V-ALTERACAO-DE-ESCOPO-v1.0";

/** Regras do motor do Anexo V — texto normativo, não editável por caso. */
export const REGRAS_MOTOR_ANEXO_V: string[] = [
  "Criar somente quando houver mudança formal do escopo aprovado.",
  "Escopo original é snapshot da OS/Proposta/Anexo I vigente.",
  "Exigir descrição, motivo, impacto em prazo, impacto financeiro, responsável, fonte, revisão e aceite aplicável.",
  "“Sem alteração” é valor controlado, não texto livre.",
  "Novo valor vem de SKU/preço homologado ou exceção comercial autorizada; preço livre é proibido.",
  "Despesa externa a aprovar vincula o Anexo II; não cria cobrança.",
  "Depois do aceite, gerar nova versão do Anexo I e snapshot por evento de governança.",
  "Sem aceite aplicável, a alteração não entra no escopo vigente.",
  "Nunca alterar retroativamente contrato assinado ou anexo histórico.",
];

export type EntradaAnexosIaV = {
  caseId: string;
  clienteNome: string | null;
  responsavel: string | null;
  dataContratacao: string | null;
  contratoBaseVersao: string;
  modelo: string;
  proposta: PropostaVinculada | null;
  politicaDespesas: PoliticaDespesaAnexo | null;
  despesas: DespesaExternaAnexo[];
  autorizacaoPesquisa: AutorizacaoPesquisaAnexo | null;
  procuracao: ProcuracaoAnexo | null;
  alteracaoEscopo: AlteracaoEscopoAnexo | null;
  estados?: Record<string, EstadoAnexo>;
};

const AUSENTE = "Sem fonte rastreável — não preenchido por inferência.";

/* ---------------- Anexo I ---------------- */

export function anexoIOrdemServico(e: EntradaAnexosIaV): AnexoGovernado {
  const conf = propostaSatisfazGate(e.proposta, e.caseId);
  const p = conf.ok ? e.proposta! : null;
  const pend: string[] = [];
  if (!conf.ok) pend.push(conf.motivo!);
  if (p) {
    if (!p.produtoSku) pend.push("Produto/SKU ausente na proposta aprovada.");
    else if (p.skuAtivoHomologado !== true) {
      pend.push(
        p.skuAtivoHomologado === false
          ? "Produto/SKU não está ativo e homologado no catálogo: Anexo I não pode ser finalizado."
          : "Situação do SKU não verificada no catálogo homologado — verificação humana necessária.",
      );
    }
    if (!fonteOficialDePreco(p.fontePreco)) {
      pend.push("Preço/condição sem fonte comercial homologada: valor não pode ser renderizado.");
    }
    if (p.servicosExcluidos === null) {
      pend.push("Exclusões não especificadas na proposta/OS — revisão humana necessária.");
    }
    if (!p.entregaveis.length) pend.push("Entregáveis não derivados da proposta/OS.");
    if (!p.primeiroVencimento) pend.push("Primeiro vencimento não formalizado (não inferido pelo número de parcelas).");
  }

  const precoOk = Boolean(p && fonteOficialDePreco(p.fontePreco));
  const campos: CampoRenderizado[] = [
    { rotulo: "Contrato-Base (versão/data)", valor: e.contratoBaseVersao, fonte: "contrato_base" },
    { rotulo: "Código do caso", valor: e.caseId, fonte: "crm_confirmado" },
    { rotulo: "Cliente", valor: e.clienteNome, fonte: "crm_confirmado", observacaoAusencia: AUSENTE },
    { rotulo: "CPF", valor: null, fonte: "documento_conferido", observacaoAusencia: "Renderizado somente quando exigido e autorizado." },
    { rotulo: "Produto/SKU", valor: p?.produtoSku ?? null, fonte: "proposta_os_aprovada", observacaoAusencia: AUSENTE },
    { rotulo: "Produto contratado", valor: p?.produtoNome ?? null, fonte: "proposta_os_aprovada", observacaoAusencia: AUSENTE },
    { rotulo: "Data de contratação", valor: e.dataContratacao, fonte: "crm_confirmado", observacaoAusencia: AUSENTE },
    { rotulo: "Responsável Clube Ancestral", valor: e.responsavel, fonte: "crm_confirmado", observacaoAusencia: AUSENTE },
    {
      rotulo: "1. Escopo contratado",
      valor: p?.servicosIncluidos.length ? p.servicosIncluidos.join(" · ") : null,
      fonte: "proposta_os_aprovada",
      observacaoAusencia: AUSENTE,
    },
    {
      rotulo: "1.1 Exclusões",
      valor: p?.servicosExcluidos?.length ? p.servicosExcluidos.join(" · ") : null,
      fonte: "proposta_os_aprovada",
      observacaoAusencia: "não especificado na proposta/OS — revisão humana necessária",
    },
    { rotulo: "2. Objetivo da etapa inicial", valor: p?.objetivoEtapa ?? null, fonte: "proposta_os_aprovada", observacaoAusencia: AUSENTE },
    {
      rotulo: "3. Entregáveis",
      valor: p?.entregaveis.length ? p.entregaveis.join(" · ") : null,
      fonte: "proposta_os_aprovada",
      observacaoAusencia: AUSENTE,
    },
    { rotulo: "4. Modalidade escolhida", valor: p?.modalidade ?? null, fonte: "proposta_os_aprovada", observacaoAusencia: AUSENTE },
    {
      rotulo: "4.1 Valor contratado",
      valor: precoOk ? (p?.valorContratado ?? null) : null,
      fonte: "proposta_os_aprovada",
      observacaoAusencia: "Sem fonte comercial homologada — valor bloqueado.",
    },
    { rotulo: "4.2 Forma de pagamento", valor: p?.formaPagamento ?? null, fonte: "proposta_os_aprovada", observacaoAusencia: AUSENTE },
    { rotulo: "4.3 Parcelas/recorrência", valor: p?.parcelas ?? null, fonte: "proposta_os_aprovada", observacaoAusencia: AUSENTE },
    {
      rotulo: "4.4 Primeiro vencimento",
      valor: p?.primeiroVencimento ?? null,
      fonte: "proposta_os_aprovada",
      observacaoAusencia: "Vencimento não formalizado — não inferido pelo número de parcelas.",
    },
    {
      rotulo: "4.5 Próximo vencimento",
      valor: p?.proximoVencimento ?? null,
      fonte: "proposta_os_aprovada",
      observacaoAusencia: "Vencimento não formalizado — não inferido pelo número de parcelas.",
    },
    {
      rotulo: "5. Condições específicas",
      valor: p?.limitesDependencias.length ? p.limitesDependencias.join(" · ") : null,
      fonte: "proposta_os_aprovada",
      observacaoAusencia: AUSENTE,
    },
    {
      rotulo: "6. Aceite",
      valor: null,
      fonte: "configuracao_juridica",
      observacaoAusencia: "Aceite eletrônico registrado apenas em evento de assinatura — não simulado.",
    },
  ];

  const aplicavel = true;
  return {
    codigo: "ANEXO_I_ORDEM_SERVICO",
    titulo: "Anexo I — Ordem de Serviço do caso",
    finalidade: "Traduz a proposta/OS aprovada em escopo, entregáveis e condição comercial do caso.",
    regra: "Obrigatório quando existir proposta/OS aprovada e vinculada ao mesmo caso. Texto derivado, nunca livre.",
    condicional: false,
    aplicavel,
    obrigatorio: true,
    motivo: conf.ok ? "Proposta/OS aprovada vinculada ao caso." : conf.motivo!,
    estado: estadoDe({ aplicavel, obrigatorio: true, pendencias: pend, registrado: e.estados?.["ANEXO_I_ORDEM_SERVICO"] }),
    campos,
    pendencias: pend,
    impactoAusencia: "Sem Anexo I válido não há escopo contratado: prévia final, revisão e assinatura ficam bloqueadas.",
    destinos: ["previa_final", "revisao_humana", "assinatura", "financeiro"],
    gatesBloqueados: pend.length ? ["previa_final", "revisao_humana", "assinatura", "financeiro"] : [],
  };
}

/* ---------------- Anexo II ---------------- */

export function anexoIIDespesas(e: EntradaAnexosIaV): AnexoGovernado {
  const pend: string[] = [];
  if (!e.politicaDespesas) pend.push("Política de despesas externas não selecionada (valor controlado).");
  for (const d of e.despesas) {
    if (!d.finalidade) pend.push(`Despesa "${d.item}": finalidade ausente.`);
    if (!d.pagador) pend.push(`Despesa "${d.item}": responsável pagador não definido.`);
    if (!d.aprovacaoRegistrada && (["aprovada", "paga_diretamente_pelo_cliente"] as string[]).includes(d.estado)) {
      pend.push(`Despesa "${d.item}": aprovação não registrada antes da execução.`);
    }
    if ((d.estimativa || d.valorReal) && !d.fonte) pend.push(`Despesa "${d.item}": valor sem fonte rastreável.`);
    if (d.pagador === "clube_antecipa") {
      pend.push(`Despesa "${d.item}": antecipação exige exceção formal com teto, comprovante e prazo de reembolso.`);
    }
  }

  const campos: CampoRenderizado[] = [
    { rotulo: "Caso", valor: e.caseId, fonte: "crm_confirmado" },
    { rotulo: "Cliente", valor: e.clienteNome, fonte: "crm_confirmado", observacaoAusencia: AUSENTE },
    {
      rotulo: "Política aplicável",
      valor: e.politicaDespesas ? ROTULO_POLITICA_DESPESA[e.politicaDespesas] : null,
      fonte: "politica_institucional",
      observacaoAusencia: "Selecionar uma das cinco opções controladas.",
    },
    { rotulo: "Política institucional padrão", valor: CLAUSULA_DESPESAS_TERCEIROS, fonte: "politica_institucional" },
    ...e.despesas.map((d) => ({
      rotulo: `Item — ${d.item}`,
      valor: [d.finalidade, d.estimativa, d.valorReal, d.estado, d.aprovacaoRegistrada ? "aprovada" : "sem aprovação"]
        .filter(Boolean)
        .join(" | "),
      fonte: d.fonte ?? "importado_a_confirmar",
    })),
    {
      rotulo: "Regra de ajuste",
      valor:
        "Valor real materialmente acima da estimativa, despesa não prevista ou serviço adicional exigem aprovação da Cliente antes de assumir o custo, salvo urgência previamente autorizada.",
      fonte: "politica_institucional",
    },
    {
      rotulo: "Adiantamento excepcional",
      valor: "Exige fornecedor/órgão, finalidade, teto, comprovante, prazo e forma de reembolso e aceite específico.",
      fonte: "politica_institucional",
    },
  ];

  const aplicavel = e.politicaDespesas !== "nao_previstas_nesta_etapa";
  return {
    codigo: "ANEXO_II_DESPESAS_EXTERNAS",
    titulo: "Anexo II — Controle de despesas externas",
    finalidade: "Registra política, estimativas, aprovações e comprovantes de despesas de terceiros.",
    regra: "Despesas de terceiros nunca entram como receita, custo próprio, reembolso ou cobrança padrão do Clube.",
    condicional: false,
    aplicavel,
    obrigatorio: aplicavel,
    motivo: aplicavel ? "Há política de despesas aplicável ao caso." : "Política declarada: despesas não previstas nesta etapa.",
    estado: estadoDe({ aplicavel, obrigatorio: aplicavel, pendencias: pend, registrado: e.estados?.["ANEXO_II_DESPESAS_EXTERNAS"] }),
    campos,
    pendencias: pend,
    impactoAusencia: "Sem política e aprovação registradas, nenhuma despesa pode ser executada em nome da Cliente.",
    destinos: ["previa_final", "revisao_humana", "financeiro"],
    gatesBloqueados: pend.length ? ["previa_final", "revisao_humana"] : [],
  };
}

/** Despesa de terceiro nunca é receita, custo próprio, reembolso ou cobrança do Clube. */
export function classificacaoFinanceiraDespesa(): "nao_contabilizavel_como_receita_ou_custo_do_clube" {
  return "nao_contabilizavel_como_receita_ou_custo_do_clube";
}

export const ESTADOS_DESPESA_ANEXO = ESTADOS_DESPESA;

/* ---------------- Anexo III ---------------- */

export function anexoIIIAutorizacao(e: EntradaAnexosIaV): AnexoGovernado {
  const a = e.autorizacaoPesquisa;
  const aplicavel = Boolean(a);
  const pend: string[] = [];
  if (a) {
    if (!a.finalidade) pend.push("Finalidade da pesquisa não descrita.");
    if (!a.orgao) pend.push("Órgão/entidade destinatária não informado.");
    if (!a.pessoas.length) pend.push("Pessoas relacionadas não informadas.");
    if (!a.documentos.length) pend.push("Documento/informação solicitada não descrita.");
    if (!a.prazoUso) pend.push("Prazo de uso da autorização não definido.");
    if (!a.responsavelInterno) pend.push("Responsável interno pela autorização não informado.");
    if (a.temCustoExterno && !a.despesaVinculadaId) pend.push("Custo externo declarado sem vínculo ao Anexo II.");
    if (a.temCustoExterno && !a.tetoValor) pend.push("Custo externo declarado sem teto autorizado.");
    if (!a.aceiteRegistrado || !a.aceiteEvidencia) pend.push("Aceite específico da Cliente não registrado com evidência.");
    if (a.orgaoExigeProcuracao) pend.push("Órgão exige instrumento próprio: autorização não substitui o Anexo IV.");
  }

  const campos: CampoRenderizado[] = [
    { rotulo: "Caso", valor: e.caseId, fonte: "crm_confirmado" },
    { rotulo: "Cliente", valor: e.clienteNome, fonte: "crm_confirmado", observacaoAusencia: AUSENTE },
    { rotulo: "Finalidade", valor: a?.finalidade ?? null, fonte: "preenchimento_humano_confirmado", observacaoAusencia: AUSENTE },
    { rotulo: "Órgão/entidade", valor: a?.orgao ?? null, fonte: "preenchimento_humano_confirmado", observacaoAusencia: AUSENTE },
    { rotulo: "Pessoa(s) relacionada(s)", valor: a?.pessoas.join(", ") || null, fonte: "crm_confirmado", observacaoAusencia: AUSENTE },
    { rotulo: "Documento(s) solicitado(s)", valor: a?.documentos.join(", ") || null, fonte: "preenchimento_humano_confirmado", observacaoAusencia: AUSENTE },
    {
      rotulo: "Há custo externo estimado?",
      valor: a?.temCustoExterno == null ? null : a.temCustoExterno ? "SIM" : "NÃO",
      fonte: "preenchimento_humano_confirmado",
      observacaoAusencia: AUSENTE,
    },
    { rotulo: "Valor/teto autorizado", valor: a?.tetoValor ?? null, fonte: "anexo", observacaoAusencia: AUSENTE },
    { rotulo: "Prazo de uso", valor: a?.prazoUso ?? null, fonte: "preenchimento_humano_confirmado", observacaoAusencia: AUSENTE },
    {
      rotulo: "Responsável Clube Ancestral",
      valor: a?.responsavelInterno ?? null,
      fonte: "preenchimento_humano_confirmado",
      observacaoAusencia: AUSENTE,
    },
    {
      rotulo: "Aceite/assinatura",
      valor: a?.aceiteRegistrado ? a.aceiteEvidencia : null,
      fonte: "documento_conferido",
      observacaoAusencia: "Sem aceite específico rastreável — pesquisa externa bloqueada.",
    },
  ];

  return {
    codigo: "ANEXO_III_AUTORIZACAO_PESQUISA",
    titulo: "Anexo III — Autorização específica de pesquisa",
    finalidade: "Autoriza uma pesquisa nominal específica, com órgão, pessoas, documentos, teto e prazo.",
    regra: "Condicional e específico: não nasce por existir caso e não substitui procuração.",
    condicional: true,
    aplicavel,
    obrigatorio: aplicavel,
    motivo: aplicavel ? "Autorização específica solicitada para este caso." : "Nenhuma pesquisa externa específica solicitada.",
    estado: estadoDe({ aplicavel, obrigatorio: aplicavel, pendencias: pend, registrado: e.estados?.["ANEXO_III_AUTORIZACAO_PESQUISA"] }),
    campos,
    pendencias: pend,
    impactoAusencia:
      "Sem autorização válida ficam bloqueados: pesquisa nominal externa, pedido institucional, contato em nome do cliente e entrega derivada. Nenhum envio é automático.",
    destinos: ["pesquisa_externa", "revisao_humana"],
    gatesBloqueados: !aplicavel || pend.length ? ["pesquisa_externa"] : [],
  };
}

/** Pesquisa externa só é liberada por aceite específico rastreável — nunca por inferência. */
export function pesquisaExternaLiberada(a: AutorizacaoPesquisaAnexo | null): boolean {
  if (!a) return false;
  if (a.orgaoExigeProcuracao) return false;
  if (a.temCustoExterno && (!a.despesaVinculadaId || !a.tetoValor)) return false;
  return Boolean(
    a.finalidade &&
      a.orgao &&
      a.pessoas.length &&
      a.documentos.length &&
      a.prazoUso &&
      a.responsavelInterno &&
      a.aceiteRegistrado &&
      a.aceiteEvidencia,
  );
}

/* ---------------- Anexo IV ---------------- */

export function anexoIVProcuracao(e: EntradaAnexosIaV): AnexoGovernado {
  const p = e.procuracao;
  const aplicavel = Boolean(p?.exigidaPorOrgao);
  const pend: string[] = [];
  const ctx = p?.tipo === "europa" ? (p.contextoEuropeu ?? null) : null;
  const bloqueioPais = ctx ? bloqueiosProcuracaoEuropeia(ctx) : null;
  if (aplicavel && bloqueioPais?.bloqueado) pend.push(...bloqueioPais.motivos);
  if (aplicavel && p) {
    if (!p.finalidade) pend.push("Finalidade específica não definida.");
    if (!p.orgaoDestinatario) pend.push("Órgão destinatário não definido.");
    if (!p.pessoas.length) pend.push("Pessoas vinculadas não definidas.");
    if (!p.poderes.length) pend.push("Poderes necessários não definidos — não podem ser inferidos.");
    if (!p.revisaoJuridicaAprovada) pend.push("Revisão humana/jurídica pendente.");
    if (["assinada", "enviada", "respondida"].includes(p.status) && !p.evidenciaAssinatura)
      pend.push("Status declara assinatura, mas não há evidência de assinatura registrada.");
    if (p.revisaoJuridicaAprovada && p.status === "nao_iniciada")
      pend.push("Instrumento aprovado ainda não iniciado — atividade externa segue bloqueada.");
  }

  const campos: CampoRenderizado[] = [
    { rotulo: "Caso", valor: e.caseId, fonte: "crm_confirmado" },
    { rotulo: "Tipo", valor: p?.tipo ? p.tipo.toUpperCase() : null, fonte: "configuracao_juridica", observacaoAusencia: AUSENTE },
    {
      rotulo: "Jurisdição da procuração",
      valor: p?.tipo === "brasil" ? "Brasil" : ctx ? `${ctx.jurisdiction_scope} · ${ctx.country_label}` : null,
      fonte: "configuracao_juridica",
      observacaoAusencia: AUSENTE,
    },
    {
      rotulo: "Título aplicável",
      valor: p?.tipo === "brasil" ? "Procuração para atuação no Brasil" : (ctx?.title ?? null),
      fonte: "configuracao_juridica",
      observacaoAusencia: AUSENTE,
    },
    {
      rotulo: "Origem do país",
      valor: ctx ? ctx.source_label : null,
      fonte: "configuracao_juridica",
      observacaoAusencia: "País europeu sem fonte canônica — não presumir Itália nem qualquer outro país.",
    },
    { rotulo: "Idioma", valor: p?.idioma ?? null, fonte: "preenchimento_humano_confirmado", observacaoAusencia: "Idioma nunca é derivado do país." },
    { rotulo: "Modelo local", valor: p?.modeloLocal ?? null, fonte: "configuracao_juridica", observacaoAusencia: "Modelo local nunca é derivado do país." },
    {
      rotulo: "Requisito de assinatura/apostila/reconhecimento",
      valor: p?.requisitoFormal ?? null,
      fonte: "configuracao_juridica",
      observacaoAusencia: "Requisito formal nunca é derivado do país.",
    },
    { rotulo: "Finalidade", valor: p?.finalidade ?? null, fonte: "preenchimento_humano_confirmado", observacaoAusencia: AUSENTE },
    { rotulo: "Órgão destinatário", valor: p?.orgaoDestinatario ?? null, fonte: "preenchimento_humano_confirmado", observacaoAusencia: AUSENTE },
    { rotulo: "Pessoas vinculadas", valor: p?.pessoas.join(", ") || null, fonte: "crm_confirmado", observacaoAusencia: AUSENTE },
    { rotulo: "Poderes necessários", valor: p?.poderes.join(", ") || null, fonte: "configuracao_juridica", observacaoAusencia: "Poderes nunca são inferidos." },
    { rotulo: "Status", valor: (p?.status ?? "nao_aplicavel").toUpperCase(), fonte: "configuracao_juridica" },
    {
      rotulo: "Evidência de assinatura",
      valor: p?.evidenciaAssinatura ?? null,
      fonte: "documento_conferido",
      observacaoAusencia: "Sem evidência registrada — não presumir assinatura.",
    },
    {
      rotulo: "Observação",
      valor:
        AVISO_PREPARO_PROCURACAO,
      fonte: "contrato_base",
    },
  ];

  return {
    codigo: "ANEXO_IV_PROCURACAO",
    titulo: "Anexo IV — Procuração específica",
    finalidade: "Instrumento próprio exigido por órgão, com poderes definidos e texto jurídico aprovado.",
    regra: "Sempre condicional: não deriva do país/rota e não é substituído por consentimento.",
    condicional: true,
    aplicavel,
    obrigatorio: aplicavel,
    motivo: aplicavel ? "Órgão destinatário exige instrumento próprio." : "Nenhum órgão exigiu instrumento próprio até aqui.",
    estado: estadoDe({ aplicavel, obrigatorio: aplicavel, pendencias: pend, registrado: e.estados?.["ANEXO_IV_PROCURACAO"] }),
    campos,
    pendencias: pend,
    impactoAusencia:
      "Enquanto exigida e não aprovada, pesquisa/protocolo em nome do cliente permanece bloqueado. A procuração não substitui a autorização de pesquisa (Anexo III), nem o contrário.",
    destinos: ["pesquisa_externa", "revisao_humana", "assinatura"],
    gatesBloqueados: aplicavel && pend.length ? ["pesquisa_externa", "assinatura"] : [],
  };
}

/**
 * Regra 5: atividade externa que exige procuração só é liberada com instrumento
 * aprovado e, quando o estado indicar assinatura, evidência registrada.
 */
export function atividadeExternaComProcuracaoLiberada(p: ProcuracaoAnexo | null): boolean {
  if (!p || !p.exigidaPorOrgao) return false;
  if (p.tipo === "europa") {
    if (!p.contextoEuropeu) return false;
    if (bloqueiosProcuracaoEuropeia(p.contextoEuropeu).bloqueado) return false;
  }
  if (!p.finalidade || !p.orgaoDestinatario || !p.pessoas.length || !p.poderes.length) return false;
  if (!p.revisaoJuridicaAprovada) return false;
  if (!["assinada", "enviada", "respondida"].includes(p.status)) return false;
  return Boolean(p.evidenciaAssinatura);
}

/* ---------------- Anexo V ---------------- */

export function anexoVAlteracaoEscopo(e: EntradaAnexosIaV): AnexoGovernado {
  const a = e.alteracaoEscopo;
  const aplicavel = Boolean(a?.solicitada);
  const pend: string[] = [];
  if (aplicavel && a) {
    if (!a.escopoOriginalSnapshot) pend.push("Escopo original sem snapshot da proposta/OS/Anexo I vigente.");
    if (!a.alteracao) pend.push("Alteração não descrita.");
    if (!a.motivo) pend.push("Motivo não descrito.");
    if (!a.impactoPrazo) pend.push("Impacto em prazo não informado (valor controlado).");
    if (!a.impactoFinanceiro) pend.push("Impacto financeiro não informado (valor controlado).");
    if (a.impactoFinanceiro === "novo_valor" && !fonteOficialDePreco(a.fonteNovoValor)) {
      pend.push("Novo valor exige SKU/preço homologado ou exceção comercial autorizada.");
    }
    if (a.impactoFinanceiro === "despesa_externa_a_aprovar" && !a.despesaVinculadaId) {
      pend.push("Despesa externa a aprovar sem vínculo ao Anexo II — nenhuma cobrança é criada por este termo.");
    }
    if (!a.responsavelAlteracao) pend.push("Responsável pela alteração não informado.");
    if (!a.fonteAlteracao) pend.push("Fonte da alteração não informada.");
    if (!a.revisaoInternaRegistrada) pend.push("Revisão interna da alteração não registrada.");
    if (!a.aceiteRegistrado || !a.aceiteEvidencia) pend.push("Aceite da Cliente não registrado: alteração não entra no escopo vigente.");
  }

  const campos: CampoRenderizado[] = [
    { rotulo: "Caso", valor: e.caseId, fonte: "crm_confirmado" },
    { rotulo: "Cliente", valor: e.clienteNome, fonte: "crm_confirmado", observacaoAusencia: AUSENTE },
    { rotulo: "Data", valor: a?.dataSolicitacao ?? null, fonte: "preenchimento_humano_confirmado", observacaoAusencia: AUSENTE },
    { rotulo: "Escopo original", valor: a?.escopoOriginalSnapshot ?? null, fonte: "anexo", observacaoAusencia: AUSENTE },
    { rotulo: "Alteração", valor: a?.alteracao ?? null, fonte: "preenchimento_humano_confirmado", observacaoAusencia: AUSENTE },
    { rotulo: "Motivo", valor: a?.motivo ?? null, fonte: "preenchimento_humano_confirmado", observacaoAusencia: AUSENTE },
    { rotulo: "Impacto em prazo", valor: a?.impactoPrazo ?? null, fonte: "preenchimento_humano_confirmado", observacaoAusencia: AUSENTE },
    { rotulo: "Impacto financeiro", valor: a?.impactoFinanceiro ?? null, fonte: "preenchimento_humano_confirmado", observacaoAusencia: AUSENTE },
    { rotulo: "Responsável", valor: a?.responsavelAlteracao ?? null, fonte: "preenchimento_humano_confirmado", observacaoAusencia: AUSENTE },
    { rotulo: "Fonte da alteração", valor: a?.fonteAlteracao ?? null, fonte: "preenchimento_humano_confirmado", observacaoAusencia: AUSENTE },
    {
      rotulo: "Revisão interna",
      valor: a?.revisaoInternaRegistrada ? "Registrada" : null,
      fonte: "documento_conferido",
      observacaoAusencia: "Revisão interna pendente.",
    },
    {
      rotulo: "Aceite",
      valor: a?.aceiteRegistrado ? a.aceiteEvidencia : null,
      fonte: "documento_conferido",
      observacaoAusencia: "A alteração só terá efeito após aceite da Cliente.",
    },
  ];

  return {
    codigo: "ANEXO_V_ALTERACAO_ESCOPO",
    titulo: "Anexo V — Termo de alteração de escopo",
    finalidade: "Formaliza mudança do escopo aprovado, com motivo, impactos e aceite.",
    regra: "Criado somente quando há mudança formal; não altera retroativamente contrato assinado ou anexo histórico.",
    condicional: true,
    aplicavel,
    obrigatorio: aplicavel,
    motivo: aplicavel ? "Alteração de escopo formalmente solicitada." : "Nenhuma alteração de escopo formalizada.",
    estado: estadoDe({ aplicavel, obrigatorio: aplicavel, pendencias: pend, registrado: e.estados?.["ANEXO_V_ALTERACAO_ESCOPO"] }),
    campos,
    pendencias: pend,
    impactoAusencia: "Sem aceite aplicável, a alteração não integra o escopo vigente nem gera nova versão do Anexo I.",
    destinos: ["revisao_humana", "previa_final"],
    gatesBloqueados: aplicavel && pend.length ? ["previa_final", "revisao_humana"] : [],
  };
}

/** Regra 7: aceite válido exige nova versão do Anexo I e snapshot de governança. */
export function novaVersaoAnexoIRequerida(a: AlteracaoEscopoAnexo | null): boolean {
  return Boolean(a?.solicitada && a.aceiteRegistrado && a.aceiteEvidencia && a.alteracao);
}

/** Regra 9: nada é reescrito retroativamente — a alteração sempre gera novo registro. */
export function alteracaoRetroativaBloqueada(a: AlteracaoEscopoAnexo | null): boolean {
  return Boolean(a?.contratoAssinadoReferencia);
}

/** Escopo vigente só muda com aceite registrado e evidência. */
export function escopoVigenteAposAlteracao(escopoAtual: string, a: AlteracaoEscopoAnexo | null): string {
  if (!a?.solicitada || !a.aceiteRegistrado || !a.aceiteEvidencia || !a.alteracao) return escopoAtual;
  return a.alteracao;
}

/* ---------------- consolidação ---------------- */

export function anexosIaV(e: EntradaAnexosIaV): AnexoGovernado[] {
  return [anexoIOrdemServico(e), anexoIIDespesas(e), anexoIIIAutorizacao(e), anexoIVProcuracao(e), anexoVAlteracaoEscopo(e)];
}

export type PendenciaContratual = {
  grupo:
    | "origem_ausente"
    | "confirmacao_humana"
    | "conflito_de_fontes"
    | "politica_institucional"
    | "escopo_os"
    | "anexo_obrigatorio"
    | "assinatura_revisao"
    | "condicao_comercial"
    | "autorizacao_pesquisa"
    | "representacao_procuracao";
  motivo: string;
  entidade: string;
  origem: string;
  responsavel: string;
  severidade: "bloqueante" | "alta" | "media";
  gate: GateContratual;
  rotaResolucao: string;
};

export const ROTULO_GRUPO_PENDENCIA: Record<PendenciaContratual["grupo"], string> = {
  origem_ausente: "Origem ausente",
  confirmacao_humana: "Confirmação humana",
  conflito_de_fontes: "Conflito de fontes",
  politica_institucional: "Política institucional",
  escopo_os: "Escopo/OS",
  anexo_obrigatorio: "Anexo obrigatório",
  assinatura_revisao: "Assinatura/revisão",
  condicao_comercial: "Condição comercial",
  autorizacao_pesquisa: "Autorização de pesquisa",
  representacao_procuracao: "Representação/procuração",
};

const GRUPO_POR_ANEXO: Record<string, PendenciaContratual["grupo"]> = {
  ANEXO_I_ORDEM_SERVICO: "escopo_os",
  ANEXO_II_DESPESAS_EXTERNAS: "politica_institucional",
  ANEXO_III_AUTORIZACAO_PESQUISA: "autorizacao_pesquisa",
  ANEXO_IV_PROCURACAO: "representacao_procuracao",
  ANEXO_V_ALTERACAO_ESCOPO: "escopo_os",
};

export function pendenciasDosAnexos(anexos: AnexoGovernado[], responsavel = "Operações"): PendenciaContratual[] {
  return anexos.flatMap((a) =>
    a.pendencias.map((motivo) => ({
      grupo: GRUPO_POR_ANEXO[a.codigo] ?? "anexo_obrigatorio",
      motivo,
      entidade: a.codigo,
      origem: a.regra,
      responsavel,
      severidade: (a.obrigatorio ? "bloqueante" : "alta") as PendenciaContratual["severidade"],
      gate: a.gatesBloqueados[0] ?? "revisao_humana",
      rotaResolucao: `Preparação contratual → Anexos aplicáveis → ${a.codigo}`,
    })),
  );
}

/** Gates efetivamente bloqueados. Rascunho de trabalho nunca é bloqueado. */
export function gatesBloqueados(input: {
  anexos: AnexoGovernado[];
  modelo: string;
  perfilInstitucionalAtivo: boolean;
  metodoAssinaturaConfigurado: boolean;
  revisorHumanoAprovado: boolean;
  conflitos: ConflitoFonte[];
}): { gate: GateContratual; motivo: string }[] {
  const out: { gate: GateContratual; motivo: string }[] = [];
  if (!modeloGeraPrevia(input.modelo)) {
    out.push({ gate: "previa_final", motivo: "Modelo diferente de MODELO-ESTUDO + BASE-GEN-V2 não gera prévia." });
  }
  if (!input.perfilInstitucionalAtivo) {
    out.push({ gate: "assinatura", motivo: "Perfil institucional ausente ou não vigente (under_legal_review)." });
  }
  if (!input.metodoAssinaturaConfigurado) {
    out.push({ gate: "assinatura", motivo: "Método institucional de assinatura em estado a_configurar." });
  }
  if (!input.revisorHumanoAprovado) {
    out.push({ gate: "assinatura", motivo: "Revisor humano/jurídico pendente." });
  }
  for (const a of input.anexos) {
    for (const g of a.gatesBloqueados) out.push({ gate: g, motivo: `${a.codigo}: ${a.pendencias[0] ?? "pendência registrada"}` });
  }
  for (const c of input.conflitos) {
    out.push({ gate: c.transicaoBloqueada, motivo: `Conflito de fonte em ${c.campo}: exige revisão humana e justificativa.` });
  }
  return out;
}

export function gateLiberado(gate: GateContratual, bloqueios: { gate: GateContratual }[]): boolean {
  if (gate === "rascunho") return true;
  return !bloqueios.some((b) => b.gate === gate);
}

/* ---------------- derivação a partir da ficha parametrizável ---------------- */

export type ValorFicha = { campo: string; valor?: string | null; origem?: string | null; status?: string | null };

const lista = (v?: string | null) =>
  String(v ?? "")
    .split(/\|\||;|\n/)
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Leitura somente-derivada da ficha do caso. Nenhum dado é escrito ou inferido:
 * proposta só vale como fonte quando o parâmetro comercial veio de proposta confirmada.
 */
export function entradaDeValores(input: {
  caseId: string;
  clienteNome: string | null;
  responsavel: string | null;
  contratoBaseVersao: string;
  modelo: string;
  valores: ValorFicha[];
}): EntradaAnexosIaV {
  const get = (campo: string) => input.valores.find((v) => v.campo === campo) ?? null;
  const val = (campo: string) => {
    const v = get(campo)?.valor;
    return v && String(v).trim() ? String(v) : null;
  };
  const sku = get("produto_sku");
  const propostaConfirmada = sku?.origem === "proposta" && sku?.status === "confirmado";

  const proposta: PropostaVinculada | null = sku?.origem === "proposta"
    ? {
        id: `PROPOSTA::${input.caseId}`,
        caseId: input.caseId,
        estado: propostaConfirmada ? "aprovada" : "importado_a_confirmar",
        versao: null,
        produtoSku: val("produto_sku"),
        produtoNome: val("objeto_contrato"),
        fontePreco: get("valor_total")?.status === "confirmado" ? "planilha_mestre" : (get("valor_total")?.origem ?? null),
        valorContratado: val("valor_total"),
        modalidade: val("forma_pagamento"),
        formaPagamento: val("forma_pagamento"),
        parcelas: val("parcelas"),
        primeiroVencimento: lista(val("vencimentos"))[0] ?? null,
        proximoVencimento: lista(val("vencimentos"))[1] ?? null,
        servicosIncluidos: lista(val("servicos_incluidos")),
        servicosExcluidos: val("servicos_excluidos") ? lista(val("servicos_excluidos")) : null,
        entregaveis: lista(val("fases_entregas")),
        objetivoEtapa: val("escopo_resumo"),
        limitesDependencias: lista(val("prazos_referencia")),
      }
    : null;

  return {
    caseId: input.caseId,
    clienteNome: input.clienteNome ?? val("contratante_nome"),
    responsavel: input.responsavel ?? val("revisor_responsavel"),
    dataContratacao: val("data_assinatura"),
    contratoBaseVersao: input.contratoBaseVersao,
    modelo: input.modelo,
    proposta,
    politicaDespesas: val("despesas_externas") ? "dependentes_de_aprovacao_individual" : null,
    despesas: [],
    // Condicionais: só nascem por decisão humana registrada, nunca por existir caso.
    autorizacaoPesquisa: null,
    procuracao: null,
    alteracaoEscopo: null,
  };
}
