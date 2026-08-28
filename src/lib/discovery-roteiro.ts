/**
 * Roteiro vivo de Discovery (CA-LOVABLE-CRM-Discovery-Roteiro-Vivo v1.0).
 *
 * Guia contextual de perguntas do Painel de Calls. NÃO é formulário obrigatório
 * integral e NÃO conclui elegibilidade, rota jurídica, prazo, preço ou contrato.
 * Toda triagem é preliminar e interna: linguagem de sinal, hipótese e a confirmar.
 */

import { MARCOS_BLOQUEIA_EXTERNO, type LeadDesk } from "@/lib/crm-desk";

export type BlocoRoteiro = {
  chave: string;
  titulo: string;
  perguntas: string[];
  /** Campos da ficha preenchidos quando houver resposta. */
  campos: string[];
};

export const ROTEIRO_DISCOVERY: BlocoRoteiro[] = [
  {
    chave: "abertura",
    titulo: "Abertura e contexto",
    perguntas: [
      "O que você gostaria de organizar, esclarecer ou viabilizar neste momento?",
      "Seu interesse está mais ligado a cidadania, origem familiar, documentos, memória ou uma combinação desses objetivos?",
      "Há algum país, pessoa da família ou história que aparece como ponto de partida?",
      "Quem participa dessa decisão e quem pode estar envolvido na jornada?",
    ],
    campos: [
      "objetivo",
      "nacionalidades_interesse",
      "pais_linha_prioritaria",
      "estrutura_familiar",
      "requerentes_potenciais",
      "responsavel_nome",
      "proxima_acao",
    ],
  },
  {
    chave: "linha_familiar",
    titulo: "Linha familiar e pessoas",
    perguntas: [
      "Quem é o ascendente que conecta a família a esse país?",
      "O que vocês já sabem sobre nome, localidade, data e parentesco dessa pessoa?",
      "Essa linha parece paterna, materna ou ainda precisa ser confirmada?",
      "Há casamento, mudança de nome, migração, naturalização, adoção, reconhecimento ou outra situação que mereça atenção?",
      "Existem menores, outros titulares ou familiares que possam precisar participar mais adiante?",
    ],
    campos: [
      "geracao_ascendente",
      "linha_transmissao",
      "localidades_conhecidas",
      "risco_ruptura",
      "estrutura_familiar",
      "requerentes_potenciais",
    ],
  },
  {
    chave: "documentos",
    titulo: "Documentos e lacunas",
    perguntas: [
      "Quais documentos a família já possui ou sabe onde localizar?",
      "Qual certidão, nome, data, local ou vínculo parece mais incerto?",
      "Há documentos de nascimento, casamento, óbito, imigração, naturalização, passaporte, igreja, exército ou consulado?",
      "O que seria mais útil confirmar primeiro para reduzir a incerteza?",
    ],
    campos: [
      "estado_documental_inicial",
      "documentos_chave",
      "pendencia_documental_prioritaria",
      "complexidade_documental",
      "confianca_triagem",
    ],
  },
  {
    chave: "trilha",
    titulo: "Trilha, requisitos e marcos",
    perguntas: [
      "Vocês já investigaram alguma via ou país específico?",
      "Existe idioma, entrevista, deslocamento ou exigência externa que possa influenciar a jornada?",
      "Faz sentido registrar uma pesquisa prévia limitada? Qual seria o escopo?",
      "Há alguma informação que precise de revisão jurídica antes de ser apresentada como caminho possível?",
    ],
    campos: [
      "via_juridica_preliminar",
      "status_via",
      "trilha_referencia_id",
      "marco_referencia_id",
      "exige_idioma_entrevista",
      "pesquisa_previa_autorizacao",
      "pesquisa_previa_escopo",
    ],
  },
  {
    chave: "decisao",
    titulo: "Decisão e próximo passo",
    perguntas: [
      "O que você precisa entender para decidir com segurança?",
      "Sua principal preocupação é investimento, documentos, tempo, família, confiança, idioma ou outra questão?",
      "Qual próximo passo seria mais útil agora: diagnóstico, checklist, documentos, proposta, nova conversa ou nutrição?",
      "Quem será responsável por esse próximo passo e qual prazo é realista?",
    ],
    campos: [
      "objecao_predominante",
      "nivel_intencao",
      "discovery_resultado",
      "proxima_acao",
      "proxima_acao_em",
      "area_responsavel",
      "responsavel_nome",
    ],
  },
];

export type ProgressoBlocoRoteiro = { chave: string; titulo: string; preenchidos: number; total: number; completo: boolean };

/**
 * 28/08/2026 — "o roteiro, o Painel de Calls... por que é tão difícil algo
 * que foi pedido mais de 3 vezes... o que se tem agora é só forms que não
 * me ajuda em nada" (Proprietária). O roteiro vivo era só uma lista estática
 * de perguntas impressa do lado do formulário, sem nenhuma ligação com o que
 * já foi preenchido. Esta função computa, por bloco, quantos campos do lead
 * já têm resposta — transforma lista em indicador real de progresso da call.
 */
export function progressoRoteiro(l: LeadDesk, roteiro: BlocoRoteiro[] = ROTEIRO_DISCOVERY): ProgressoBlocoRoteiro[] {
  const vazio = (v: unknown) => v === null || v === undefined || String(v).trim() === "";
  return roteiro.map((b) => {
    const total = b.campos.length;
    const preenchidos = b.campos.filter((c) => !vazio((l as unknown as Record<string, unknown>)[c])).length;
    return { chave: b.chave, titulo: b.titulo, preenchidos, total, completo: total > 0 && preenchidos === total };
  });
}

export type SinalQualidade = { chave: string; rotulo: string; motivo: string };

export type ContextoTrilha = {
  status_via?: string | null;
  status_marco?: string | null;
};

/**
 * Sinais de qualidade da ficha. Sempre texto + motivo: cor nunca é a única
 * informação. Nenhum sinal conclui elegibilidade ou libera ação externa.
 */
export function sinaisQualidadeLead(l: LeadDesk, ctx: ContextoTrilha = {}): SinalQualidade[] {
  const s: SinalQualidade[] = [];
  const vazio = (v: unknown) => v === null || v === undefined || String(v).trim() === "";
  const ativo = !l.archived_at && !["perdido", "encerrado_sem_aderencia"].includes(String(l.eixo_comercial));

  if (ativo && (vazio(l.area_responsavel) || vazio(l.responsavel_nome))) {
    s.push({ chave: "sem_responsavel", rotulo: "Sem responsável", motivo: "Lead ativo exige área responsável e responsável nominal." });
  }
  if (ativo && vazio(l.proxima_acao)) {
    s.push({ chave: "sem_proxima_acao", rotulo: "Sem próxima ação", motivo: "Lead ativo exige próxima ação definida." });
  }
  if (ativo && l.proxima_acao_em && new Date(l.proxima_acao_em) < new Date(new Date().toISOString().slice(0, 10))) {
    s.push({ chave: "prazo_vencido", rotulo: "Prazo vencido", motivo: `Próxima ação vencida em ${l.proxima_acao_em}.` });
  }
  if (!vazio(l.gravacao_link_interno) && String(l.consentimento_status) !== "concedido") {
    s.push({
      chave: "consentimento_ausente",
      rotulo: "Consentimento ausente para gravação",
      motivo: "Há referência de gravação/transcrição sem consentimento concedido, datado, com canal e versão do aviso.",
    });
  }
  if (ctx.status_marco && MARCOS_BLOQUEIA_EXTERNO.includes(ctx.status_marco)) {
    s.push({
      chave: "marco_a_revisar",
      rotulo: "Marco a revisar/desatualizado",
      motivo: "Marco visível internamente, mas não pode sustentar rota, protocolo ou comunicação externa até revalidação humana.",
    });
  }
  if (["forte", "provavel"].includes(String(l.elegibilidade_preliminar))) {
    const faltas = [
      vazio(l.confianca_triagem) ? "confiança da triagem" : null,
      vazio(l.via_juridica_preliminar) ? "via preliminar" : null,
      vazio(l.geracao_ascendente) ? "geração do ascendente" : null,
      vazio(l.linha_transmissao) ? "linha de transmissão" : null,
      vazio(l.estado_documental_inicial) ? "estado documental inicial" : null,
    ].filter(Boolean);
    if (faltas.length) {
      s.push({
        chave: "triagem_incompleta",
        rotulo: "Triagem forte/provável incompleta",
        motivo: `Faltam: ${faltas.join(", ")}. Segue como sinal preliminar, não elegibilidade comprovada.`,
      });
    }
  }
  if (String(l.pesquisa_previa_autorizacao) !== "registrada") {
    s.push({
      chave: "pesquisa_externa_bloqueada",
      rotulo: "Pesquisa externa bloqueada",
      motivo: "Sem autorização registrada: nenhuma pesquisa nominal, pedido institucional ou contato com órgão em nome do cliente.",
    });
  }
  const viaCritica = ["restrita", "encerrada", "em_confirmacao_juridica"];
  if (ctx.status_via && viaCritica.includes(ctx.status_via)) {
    s.push({
      chave: "via_critica",
      rotulo: "Via restrita/encerrada/em confirmação jurídica",
      motivo: "Não apresentar essa via como caminho disponível em proposta ou comunicação externa.",
    });
  }
  return s;
}

/** Pesquisa nominal externa só com autorização aplicável registrada. */
export function pesquisaExternaPermitida(l: LeadDesk): boolean {
  return String(l.pesquisa_previa_autorizacao) === "registrada";
}

/** Marco a revisar/desatualizado/encerrado nunca sustenta comunicação externa. */
export function marcoUsavelExternamente(statusMarco: string | null | undefined): boolean {
  return String(statusMarco) === "vigente";
}
