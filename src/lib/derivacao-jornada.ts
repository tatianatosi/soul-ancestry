/**
 * Motor de derivação operacional (entrada de triagem → plano de jornada).
 *
 * Instrumento INTERNO, determinístico e explicável. Ele apenas ORGANIZA o que
 * já foi registrado na ficha: não calcula direito, elegibilidade final, prazo
 * jurídico/institucional, não recomenda nem contrata produto, não cria
 * contrato ou cobrança, não inicia pesquisa externa e nada aqui é projetado ao
 * App Cliente sem sanitização e liberação humana.
 */

import type { LeadDesk } from "@/lib/crm-desk";

export const DERIVACAO_VERSAO = "derivacao-jornada-v1.0";

/** As 11 entradas canônicas lidas da ficha (nenhuma é inferida). */
export type EntradaDerivacao = {
  pais_linha_prioritaria?: string | null;
  nacionalidades_interesse?: string[] | null;
  estrutura_familiar?: string | null;
  geracao_ascendente?: string | null;
  linha_transmissao?: string | null;
  estado_documental_inicial?: string | null;
  complexidade_documental?: string | null;
  risco_ruptura?: string | null;
  objetivo?: string | null;
  via_juridica_preliminar?: string | null;
  status_via?: string | null;
  pesquisa_previa_autorizacao?: string | null;
  servico_inicial_aprovado?: string | null;
  sku_referencia?: string | null;
};

export type CampoEntrada = {
  chave: keyof EntradaDerivacao | "produto_escopo";
  rotulo: string;
  /** Sem este campo a jornada não avança de fase. */
  essencial: boolean;
};

export const CAMPOS_ENTRADA: CampoEntrada[] = [
  { chave: "pais_linha_prioritaria", rotulo: "País/linha prioritária", essencial: true },
  { chave: "nacionalidades_interesse", rotulo: "Nacionalidade de interesse", essencial: true },
  { chave: "estrutura_familiar", rotulo: "Estrutura familiar", essencial: true },
  { chave: "geracao_ascendente", rotulo: "Ascendente e geração identificados", essencial: true },
  { chave: "linha_transmissao", rotulo: "Linha de transmissão", essencial: true },
  { chave: "estado_documental_inicial", rotulo: "Estado documental inicial", essencial: true },
  { chave: "complexidade_documental", rotulo: "Complexidade documental", essencial: false },
  { chave: "risco_ruptura", rotulo: "Risco de ruptura", essencial: false },
  { chave: "objetivo", rotulo: "Objetivo declarado", essencial: true },
  { chave: "via_juridica_preliminar", rotulo: "Via preliminar interna", essencial: false },
  { chave: "pesquisa_previa_autorizacao", rotulo: "Autorização de pesquisa", essencial: false },
  { chave: "produto_escopo", rotulo: "Produto/escopo contratado", essencial: false },
];

export type FaseJornada =
  | "triagem_inicial"
  | "discovery_estruturado"
  | "leitura_preliminar_interna"
  | "proposta_e_escopo"
  | "formalizacao"
  | "onboarding"
  | "pesquisa_autorizada"
  | "entrega_e_acompanhamento";

export const ROTULO_FASE: Record<FaseJornada, string> = {
  triagem_inicial: "1. Triagem inicial",
  discovery_estruturado: "2. Discovery estruturado",
  leitura_preliminar_interna: "3. Leitura preliminar interna",
  proposta_e_escopo: "4. Proposta e escopo",
  formalizacao: "5. Formalização",
  onboarding: "6. Onboarding",
  pesquisa_autorizada: "7. Pesquisa autorizada",
  entrega_e_acompanhamento: "8. Entrega e acompanhamento",
};

export type ItemChecklist = {
  chave: string;
  rotulo: string;
  estado: "registrado" | "pendente";
};

export type Bloqueio = {
  codigo: string;
  regra: string;
  ativo: boolean;
  motivo: string;
};

export type ResultadoDerivacao = {
  versao: string;
  fase: FaseJornada;
  fase_rotulo: string;
  checklist_inicial: ItemChecklist[];
  perguntas_prioritarias: string[];
  dependencias_cliente: string[];
  pendencias_internas: string[];
  responsavel: string;
  proxima_acao_datada: { acao: string; data: string | null; estado: "definida" | "sem_data" | "ausente" };
  proximo_marco_verificavel: string;
  entrega_robusta_prevista: string;
  proxima_microentrega_possivel: string;
  revisao_humana_juridica: { necessaria: boolean; motivos: string[] };
  bloqueios: Bloqueio[];
};

function preenchido(v: unknown): boolean {
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "string") return v.trim().length > 0 && v !== "nao_informado" && v !== "a_confirmar";
  return v !== null && v !== undefined && v !== "";
}

function valorEntrada(l: LeadDesk, chave: CampoEntrada["chave"]): unknown {
  if (chave === "produto_escopo") return l.servico_inicial_aprovado ?? l.sku_referencia ?? null;
  return (l as Record<string, unknown>)[chave as string];
}

const PERGUNTA_POR_CAMPO: Record<string, string> = {
  pais_linha_prioritaria: "Qual país concentra a linha prioritária desta família?",
  nacionalidades_interesse: "Qual nacionalidade de interesse deve orientar a leitura interna?",
  estrutura_familiar: "Quem compõe a estrutura familiar e quem pode participar da jornada?",
  geracao_ascendente: "Qual ascendente conecta a família ao país e em que geração ele está?",
  linha_transmissao: "A linha de transmissão é paterna, materna ou ainda precisa ser confirmada?",
  estado_documental_inicial: "Quais documentos a família já tem em mãos hoje?",
  complexidade_documental: "Há registros divergentes, faltantes ou em cartórios distintos?",
  risco_ruptura: "Existe naturalização, mudança de nome, adoção ou outro evento que mereça atenção?",
  objetivo: "Qual é o objetivo declarado da família neste momento?",
  via_juridica_preliminar: "Qual via preliminar interna está sendo considerada, sem conclusão jurídica?",
  pesquisa_previa_autorizacao: "A família autoriza formalmente a pesquisa e em qual escopo?",
  produto_escopo: "Qual produto/escopo foi efetivamente aprovado na proposta/OS?",
};

const DEPENDENCIA_POR_CAMPO: Record<string, string> = {
  estrutura_familiar: "Confirmar a composição familiar e os possíveis requerentes.",
  geracao_ascendente: "Informar nome, datas e localidades do ascendente.",
  estado_documental_inicial: "Enviar os documentos já disponíveis na família.",
  pesquisa_previa_autorizacao: "Registrar a autorização de pesquisa com escopo e limite.",
};

export function derivarJornada(lead: LeadDesk, hoje = new Date()): ResultadoDerivacao {
  const checklist: ItemChecklist[] = CAMPOS_ENTRADA.map((c) => ({
    chave: String(c.chave),
    rotulo: c.rotulo,
    estado: preenchido(valorEntrada(lead, c.chave)) ? "registrado" : "pendente",
  }));

  const faltantes = CAMPOS_ENTRADA.filter((c) => !preenchido(valorEntrada(lead, c.chave)));
  const essenciaisFaltando = faltantes.filter((c) => c.essencial);

  const pesquisaAutorizada = lead.pesquisa_previa_autorizacao === "registrada";
  const produtoContratado = preenchido(valorEntrada(lead, "produto_escopo"));
  const eixoF = lead.eixo_formalizacao ?? "";
  const eixoC = lead.eixo_comercial ?? "";

  let fase: FaseJornada = "triagem_inicial";
  if (eixoF === "caso_ativo" || eixoF === "cliente_ativo") fase = "entrega_e_acompanhamento";
  else if (eixoF === "onboarding_iniciado") fase = pesquisaAutorizada ? "pesquisa_autorizada" : "onboarding";
  else if (eixoF === "pagamento_inicial_confirmado") fase = "onboarding";
  else if (eixoF === "contrato_assinado" || eixoF === "contrato_enviado" || eixoF === "confirmacao_formal") fase = "formalizacao";
  else if (produtoContratado || eixoC === "proposta_enviada" || eixoC === "em_negociacao") fase = "proposta_e_escopo";
  else if (!essenciaisFaltando.length) fase = "leitura_preliminar_interna";
  else if (essenciaisFaltando.length <= 3) fase = "discovery_estruturado";

  const perguntas = faltantes.map((c) => PERGUNTA_POR_CAMPO[String(c.chave)]).filter(Boolean).slice(0, 6);

  const dependencias = faltantes
    .map((c) => DEPENDENCIA_POR_CAMPO[String(c.chave)])
    .filter((d): d is string => Boolean(d));
  if (lead.pendencia_documental_prioritaria) {
    dependencias.push(`Pendência documental prioritária: ${lead.pendencia_documental_prioritaria}.`);
  }

  const pendenciasInternas: string[] = [];
  if (!lead.responsavel_nome) pendenciasInternas.push("Definir responsável nominal pelo caso.");
  if (!lead.resumo_validado) pendenciasInternas.push("Validar internamente o resumo da call.");
  if (!lead.status_via || lead.status_via !== "vigente") {
    pendenciasInternas.push("Conferir vigência da via de referência antes de qualquer leitura interna.");
  }
  if (!pesquisaAutorizada) pendenciasInternas.push("Registrar autorização de pesquisa antes de qualquer ação externa.");
  if (fase === "proposta_e_escopo" && !produtoContratado) {
    pendenciasInternas.push("Confirmar produto/escopo aprovado na proposta/OS.");
  }

  const acao = lead.proxima_acao?.trim() ?? "";
  const data = lead.proxima_acao_em ?? null;
  const proxima_acao_datada = {
    acao: acao || "Definir próxima ação com o responsável.",
    data,
    estado: (acao ? (data ? "definida" : "sem_data") : "ausente") as "definida" | "sem_data" | "ausente",
  };

  const MARCO: Record<FaseJornada, string> = {
    triagem_inicial: "Call de discovery agendada e registrada.",
    discovery_estruturado: "Ficha com as entradas essenciais completas.",
    leitura_preliminar_interna: "Leitura preliminar interna revisada por pessoa responsável.",
    proposta_e_escopo: "Proposta/OS aprovada com escopo e condição comercial registrados.",
    formalizacao: "Contrato assinado registrado com evidência.",
    onboarding: "Onboarding iniciado com checklist inicial aberto.",
    pesquisa_autorizada: "Plano de pesquisa registrado dentro do escopo autorizado.",
    entrega_e_acompanhamento: "Micro-entrega publicada e reconhecida pelo cliente.",
  };

  const ENTREGA: Record<FaseJornada, string> = {
    triagem_inicial: "Resumo de triagem interno.",
    discovery_estruturado: "Brief de discovery consolidado.",
    leitura_preliminar_interna: "Leitura preliminar interna (não é parecer jurídico).",
    proposta_e_escopo: "Proposta/OS com escopo, inclusões e exclusões.",
    formalizacao: "Kit contratual completo com anexos aplicáveis.",
    onboarding: "Plano de onboarding com dependências mapeadas.",
    pesquisa_autorizada: "Relatório de fase com evidências e fontes.",
    entrega_e_acompanhamento: "Dossiê consolidado do núcleo familiar.",
  };

  const MICRO: Record<FaseJornada, string> = {
    triagem_inicial: "Organizar o que a família já sabe sobre a linha familiar.",
    discovery_estruturado: "Mapa inicial da família com nomes e localidades conhecidas.",
    leitura_preliminar_interna: "Checklist de documentos a reunir.",
    proposta_e_escopo: "Resumo do escopo em linguagem do cliente.",
    formalizacao: "Guia de próximos passos da formalização.",
    onboarding: "Lista personalizada de documentos por pessoa.",
    pesquisa_autorizada: "Registro de fonte consultada e status da busca.",
    entrega_e_acompanhamento: "Atualização de andamento do caso.",
  };

  const motivosRevisao: string[] = [];
  if (lead.risco_ruptura && preenchido(lead.risco_ruptura)) motivosRevisao.push("Risco de ruptura registrado na linha.");
  if (lead.complexidade_documental === "alta") motivosRevisao.push("Complexidade documental alta.");
  if (lead.status_via !== "vigente") motivosRevisao.push("Via de referência sem vigência confirmada.");
  if (lead.via_juridica_preliminar && lead.status_via !== "vigente") {
    motivosRevisao.push("Via preliminar registrada exige conferência jurídica.");
  }
  if (fase === "formalizacao" || fase === "pesquisa_autorizada") {
    motivosRevisao.push("Fase exige revisão humana antes de qualquer ato externo.");
  }

  const bloqueios: Bloqueio[] = [
    {
      codigo: "B1",
      regra: "Não calcula direito ou elegibilidade final",
      ativo: true,
      motivo: "Toda leitura é preliminar, interna e depende de confirmação humana.",
    },
    {
      codigo: "B2",
      regra: "Não calcula prazo jurídico/institucional",
      ativo: true,
      motivo: "Prazos dependem de autoridade externa e nunca são derivados aqui.",
    },
    {
      codigo: "B3",
      regra: "Não recomenda nem contrata produto automaticamente",
      ativo: true,
      motivo: produtoContratado
        ? "Produto/escopo exibido vem da proposta/OS aprovada, não desta derivação."
        : "Nenhum produto é sugerido: escopo só existe com proposta/OS aprovada.",
    },
    {
      codigo: "B4",
      regra: "Não cria contrato ou cobrança",
      ativo: true,
      motivo: "Formalização e financeiro seguem o motor contratual, com ação humana.",
    },
    {
      codigo: "B5",
      regra: "Não inicia pesquisa externa sem autorização",
      ativo: true,
      motivo: pesquisaAutorizada
        ? "Autorização registrada: liberação externa ainda depende de ato humano no módulo de pesquisa."
        : "Sem autorização registrada: nenhuma ação externa pode ser aberta.",
    },
    {
      codigo: "B6",
      regra: "Não mostra risco, hipótese ou score no App Cliente",
      ativo: true,
      motivo: "Este resultado é interno; ao cliente só chega micro-entrega sanitizada e liberada.",
    },
  ];

  void hoje;

  return {
    versao: DERIVACAO_VERSAO,
    fase,
    fase_rotulo: ROTULO_FASE[fase],
    checklist_inicial: checklist,
    perguntas_prioritarias: perguntas,
    dependencias_cliente: dependencias,
    pendencias_internas: pendenciasInternas,
    responsavel: lead.responsavel_nome?.trim() || "Não definido",
    proxima_acao_datada,
    proximo_marco_verificavel: MARCO[fase],
    entrega_robusta_prevista: ENTREGA[fase],
    proxima_microentrega_possivel: MICRO[fase],
    revisao_humana_juridica: { necessaria: motivosRevisao.length > 0, motivos: motivosRevisao },
    bloqueios,
  };
}
