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
      "elegibilidade_preliminar",
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

export type EtapaSpin = "situacao" | "problema" | "implicacao" | "necessidade";

export const ETAPAS_SPIN: readonly {
  chave: EtapaSpin;
  rotulo: string;
  paraQue: string;
  campoLead: "spin_situacao" | "spin_problema" | "spin_implicacao" | "spin_necessidade";
}[] = [
  {
    chave: "situacao",
    rotulo: "Situação",
    paraQue: "O que já está acontecendo: objetivo, país, quem participa e a linha familiar.",
    campoLead: "spin_situacao",
  },
  {
    chave: "problema",
    rotulo: "Problema",
    paraQue: "A dor ou lacuna objetiva: documento incerto, ruptura, o que falta confirmar.",
    campoLead: "spin_problema",
  },
  {
    chave: "implicacao",
    rotulo: "Implicação",
    paraQue: "O que muda se não estruturar: via, complexidade, idioma, pesquisa prévia.",
    campoLead: "spin_implicacao",
  },
  {
    chave: "necessidade",
    rotulo: "Necessidade",
    paraQue: "O valor verbalizado e o próximo passo: intenção, objeção, resultado e prazo.",
    campoLead: "spin_necessidade",
  },
];

/**
 * Uma pergunta da Mesa = um card. SPIN é a ordem da conversa, não checkbox.
 * Campos já existiam no lead; aqui cada pergunta ganha destino único.
 */
export type PerguntaMesa = {
  id: string;
  etapa: EtapaSpin;
  bloco: BlocoRoteiro["chave"];
  pergunta: string;
  campos: readonly string[];
};

export const PERGUNTAS_MESA: readonly PerguntaMesa[] = [
  {
    id: "objetivo",
    etapa: "situacao",
    bloco: "abertura",
    pergunta: "O que você gostaria de organizar, esclarecer ou viabilizar neste momento?",
    campos: ["objetivo"],
  },
  {
    id: "nacionalidades",
    etapa: "situacao",
    bloco: "abertura",
    pergunta:
      "Seu interesse está mais ligado a cidadania, origem familiar, documentos, memória ou uma combinação desses objetivos?",
    campos: ["nacionalidades_interesse"],
  },
  {
    id: "pais_partida",
    etapa: "situacao",
    bloco: "abertura",
    pergunta: "Há algum país, pessoa da família ou história que aparece como ponto de partida?",
    campos: ["pais_linha_prioritaria"],
  },
  {
    id: "participantes",
    etapa: "situacao",
    bloco: "abertura",
    pergunta: "Quem participa dessa decisão e quem pode estar envolvido na jornada?",
    campos: ["estrutura_familiar", "requerentes_potenciais"],
  },
  {
    id: "ascendente",
    etapa: "situacao",
    bloco: "linha_familiar",
    pergunta: "Quem é o ascendente que conecta a família a esse país?",
    campos: ["geracao_ascendente"],
  },
  {
    id: "o_que_ja_sabem",
    etapa: "situacao",
    bloco: "linha_familiar",
    pergunta: "O que vocês já sabem sobre nome, localidade, data e parentesco dessa pessoa?",
    campos: ["localidades_conhecidas"],
  },
  {
    id: "linha",
    etapa: "situacao",
    bloco: "linha_familiar",
    pergunta: "Essa linha parece paterna, materna ou ainda precisa ser confirmada?",
    campos: ["linha_transmissao"],
  },
  {
    id: "ruptura",
    etapa: "problema",
    bloco: "linha_familiar",
    pergunta:
      "Há casamento, mudança de nome, migração, naturalização, adoção, reconhecimento ou outra situação que mereça atenção?",
    campos: ["risco_ruptura"],
  },
  {
    id: "docs_em_maos",
    etapa: "problema",
    bloco: "documentos",
    pergunta: "Quais documentos a família já possui ou sabe onde localizar?",
    campos: ["estado_documental_inicial", "documentos_chave"],
  },
  {
    id: "incerteza",
    etapa: "problema",
    bloco: "documentos",
    pergunta: "Qual certidão, nome, data, local ou vínculo parece mais incerto?",
    campos: ["pendencia_documental_prioritaria"],
  },
  {
    id: "via_investigada",
    etapa: "implicacao",
    bloco: "trilha",
    pergunta: "Vocês já investigaram alguma via ou país específico?",
    campos: ["via_juridica_preliminar", "trilha_referencia_id", "marco_referencia_id"],
  },
  {
    id: "idioma",
    etapa: "implicacao",
    bloco: "trilha",
    pergunta: "Existe idioma, entrevista, deslocamento ou exigência externa que possa influenciar a jornada?",
    campos: ["exige_idioma_entrevista"],
  },
  {
    id: "pesquisa_previa",
    etapa: "implicacao",
    bloco: "trilha",
    pergunta: "Faz sentido registrar uma pesquisa prévia limitada? Qual seria o escopo?",
    campos: ["pesquisa_previa_autorizacao", "pesquisa_previa_escopo"],
  },
  {
    id: "revisao_juridica",
    etapa: "implicacao",
    bloco: "trilha",
    pergunta:
      "Há alguma informação que precise de revisão jurídica antes de ser apresentada como caminho possível?",
    campos: ["status_via", "confianca_triagem", "complexidade_documental"],
  },
  {
    id: "entender_para_decidir",
    etapa: "necessidade",
    bloco: "decisao",
    pergunta: "O que você precisa entender para decidir com segurança?",
    campos: ["nivel_intencao"],
  },
  {
    id: "preocupacao",
    etapa: "necessidade",
    bloco: "decisao",
    pergunta:
      "Sua principal preocupação é investimento, documentos, tempo, família, confiança, idioma ou outra questão?",
    campos: ["objecao_predominante"],
  },
  {
    id: "proximo_passo",
    etapa: "necessidade",
    bloco: "decisao",
    pergunta:
      "Qual próximo passo seria mais útil agora: diagnóstico, checklist, documentos, proposta, nova conversa ou nutrição?",
    campos: ["discovery_resultado", "proxima_acao", "proxima_acao_em"],
  },
  {
    id: "dono_do_passo",
    etapa: "necessidade",
    bloco: "decisao",
    pergunta: "Quem será responsável por esse próximo passo e qual prazo é realista?",
    campos: ["responsavel_nome", "area_responsavel"],
  },
  {
    id: "sinal_sintese",
    etapa: "necessidade",
    bloco: "decisao",
    pergunta: "Qual é o sinal-síntese preliminar desta conversa — sem parecer nem garantia?",
    campos: ["elegibilidade_preliminar"],
  },
];

export function perguntaDaMesaPorCampo(campo: string): PerguntaMesa | undefined {
  return PERGUNTAS_MESA.find((p) => p.campos.includes(campo));
}

export function perguntasDaEtapa(etapa: EtapaSpin): readonly PerguntaMesa[] {
  return PERGUNTAS_MESA.filter((p) => p.etapa === etapa);
}

function valorCampoPreenchido(l: LeadDesk, campo: string): boolean {
  const v = (l as unknown as Record<string, unknown>)[campo];
  if (Array.isArray(v)) return v.length > 0;
  return v !== null && v !== undefined && String(v).trim() !== "";
}

export function perguntaRespondida(l: LeadDesk, p: PerguntaMesa): boolean {
  return p.campos.some((c) => valorCampoPreenchido(l, c));
}

export type ProgressoSpin = {
  chave: EtapaSpin;
  rotulo: string;
  preenchidas: number;
  total: number;
  completo: boolean;
};

export function progressoSpin(l: LeadDesk): ProgressoSpin[] {
  return ETAPAS_SPIN.map((e) => {
    const perguntas = perguntasDaEtapa(e.chave);
    const preenchidas = perguntas.filter((p) => perguntaRespondida(l, p)).length;
    return {
      chave: e.chave,
      rotulo: e.rotulo,
      preenchidas,
      total: perguntas.length,
      completo: perguntas.length > 0 && preenchidas === perguntas.length,
    };
  });
}

/** Flags da tabela leads seguem a resposta da Mesa — não um checkbox solto. */
export function spinDerivadoDoLead(l: LeadDesk): {
  spin_situacao: boolean;
  spin_problema: boolean;
  spin_implicacao: boolean;
  spin_necessidade: boolean;
} {
  const p = progressoSpin(l);
  const de = (chave: EtapaSpin) => (p.find((x) => x.chave === chave)?.preenchidas ?? 0) > 0;
  return {
    spin_situacao: de("situacao"),
    spin_problema: de("problema"),
    spin_implicacao: de("implicacao"),
    spin_necessidade: de("necessidade"),
  };
}

export function indicePrimeiraPerguntaPendente(l: LeadDesk): number {
  const i = PERGUNTAS_MESA.findIndex((p) => !perguntaRespondida(l, p));
  return i < 0 ? 0 : i;
}

export type ProgressoBlocoRoteiro = { chave: string; titulo: string; preenchidos: number; total: number; completo: boolean };

/**
 * CA02-CRM-VIVO-PAINEL-CALLS (09/09/2026) — "o problema é formulário sobre
 * formulário e perguntas SPIN sem local evidente para resposta/destino".
 * Cada campo do roteiro ganha aqui o que faltava para virar card completo:
 * por que a pergunta importa, para onde a resposta vai e o que muda quando
 * ela é respondida. Não é campo novo — é o texto que faltava ao lado do
 * campo que já existe.
 */
export type TipoControleRoteiro = "select" | "multi" | "texto" | "numero" | "data" | "trilha" | "marco";

export type MetaCampoRoteiro = {
  tipo: TipoControleRoteiro;
  porQueImporta: string;
  destino: string;
  consequencia: string;
};

export const META_CAMPO_ROTEIRO: Record<string, MetaCampoRoteiro> = {
  objetivo: {
    tipo: "select",
    porQueImporta: "Define o que a pessoa veio resolver — orienta toda a conversa.",
    destino: "Ficha do lead — objetivo",
    consequencia: "Alinha o restante do roteiro ao que a pessoa realmente busca.",
  },
  nacionalidades_interesse: {
    tipo: "multi",
    porQueImporta: "Aponta o país-alvo, base para trilha jurídica e marco aplicável.",
    destino: "Ficha do lead → trilha jurídica",
    consequencia: "Filtra as trilhas e marcos mostrados no bloco Trilha.",
  },
  pais_linha_prioritaria: {
    tipo: "select",
    porQueImporta: "Quando há mais de um país, diz por qual seguir primeiro.",
    destino: "Ficha do lead — radar de elegibilidade",
    consequencia: "Reordena a prioridade de pesquisa e a leitura do radar.",
  },
  estrutura_familiar: {
    tipo: "select",
    porQueImporta: "Muda quem mais participa da jornada e do custo.",
    destino: "Ficha do lead — composição familiar",
    consequencia: "Ajusta quem entra como requerente potencial.",
  },
  requerentes_potenciais: {
    tipo: "numero",
    porQueImporta: "Dimensiona o escopo — uma pessoa ou uma família inteira.",
    destino: "Ficha do lead — dimensionamento",
    consequencia: "Sinal de porte para a triagem, sem calcular preço aqui.",
  },
  responsavel_nome: {
    tipo: "texto",
    porQueImporta: "Sem responsável nominal, o próximo passo não tem dono.",
    destino: "Ficha do lead — responsável",
    consequencia: "Some do sinal 'sem responsável' assim que preenchido.",
  },
  proxima_acao: {
    tipo: "select",
    porQueImporta: "É o compromisso que sai desta call — sem isso, a call não avança nada.",
    destino: "Ficha do lead — próxima ação",
    consequencia: "Com prazo definido, habilita criar/atualizar a tarefa do caso (quando já há caso).",
  },
  geracao_ascendente: {
    tipo: "select",
    porQueImporta: "Situa a que distância está o ascendente que conecta ao país.",
    destino: "Ficha do lead — linha familiar",
    consequencia: "Alimenta o radar de elegibilidade preliminar.",
  },
  linha_transmissao: {
    tipo: "select",
    porQueImporta: "Paterna, materna ou a confirmar muda a via jurídica aplicável.",
    destino: "Ficha do lead — linha familiar",
    consequencia: "Alimenta o radar de elegibilidade preliminar.",
  },
  localidades_conhecidas: {
    tipo: "texto",
    porQueImporta: "Comuna, paróquia ou província já conhecida acelera a pesquisa depois.",
    destino: "Ficha do lead — pesquisa futura",
    consequencia: "Vira ponto de partida da pesquisa genealógica, se o caso avançar.",
  },
  risco_ruptura: {
    tipo: "select",
    porQueImporta: "Casamento, mudança de nome ou adoção podem exigir prova extra.",
    destino: "Ficha do lead — complexidade",
    consequencia: "Eleva a complexidade documental esperada.",
  },
  estado_documental_inicial: {
    tipo: "select",
    porQueImporta: "O que a família já tem em mãos muda o ponto de partida real.",
    destino: "Ficha do lead — documentos",
    consequencia: "Base do estado documental mostrado na triagem.",
  },
  documentos_chave: {
    tipo: "multi",
    porQueImporta: "Marca quais documentos-chave já existem ou faltam.",
    destino: "Ficha do lead — documentos",
    consequencia: "Alimenta o radar de elegibilidade (item de documento-chave).",
  },
  pendencia_documental_prioritaria: {
    tipo: "select",
    porQueImporta: "Diz o que confirmar primeiro para reduzir a maior incerteza.",
    destino: "Ficha do lead — documentos",
    consequencia: "Vira o item prioritário da pesquisa, se o caso avançar.",
  },
  complexidade_documental: {
    tipo: "select",
    porQueImporta: "Sinaliza se a jornada documental tende a ser simples ou longa.",
    destino: "Ficha do lead — qualificação",
    consequencia: "Aparece como selo na lista de calls (alta/muito alta em destaque).",
  },
  confianca_triagem: {
    tipo: "select",
    porQueImporta: "Diz o quanto confiar no sinal preliminar registrado aqui.",
    destino: "Ficha do lead — qualificação",
    consequencia: "Exigido para elegibilidade Forte/Provável sustentar o handoff.",
  },
  via_juridica_preliminar: {
    tipo: "select",
    porQueImporta: "Hipótese de caminho jurídico — nunca parecer, sempre preliminar.",
    destino: "Ficha do lead — trilha",
    consequencia: "Exigido para elegibilidade Forte/Provável sustentar o handoff.",
  },
  status_via: {
    tipo: "select",
    porQueImporta: "Diz se a via segue vigente, restrita ou em confirmação jurídica.",
    destino: "Ficha do lead — trilha (herdado da trilha selecionada)",
    consequencia: "Via restrita/encerrada nunca pode virar caminho comunicado ao cliente.",
  },
  trilha_referencia_id: {
    tipo: "trilha",
    porQueImporta: "Ancora a call numa trilha jurídica real, não numa impressão solta.",
    destino: "Biblioteca Mestre — trilha jurídica",
    consequencia: "Mostra o contexto interno resumido da trilha; nunca vai ao App.",
  },
  marco_referencia_id: {
    tipo: "marco",
    porQueImporta: "Liga a um marco jurídico já homologado, quando existir.",
    destino: "Biblioteca Mestre — marco jurídico",
    consequencia: "Marco a revisar/desatualizado não sustenta comunicação externa.",
  },
  exige_idioma_entrevista: {
    tipo: "select",
    porQueImporta: "Idioma ou entrevista consular muda o preparo necessário.",
    destino: "Ficha do lead — trilha",
    consequencia: "Sinal para a equipe se antecipar a essa exigência.",
  },
  pesquisa_previa_autorizacao: {
    tipo: "select",
    porQueImporta: "Sem autorização registrada, nenhuma pesquisa nominal externa pode sair.",
    destino: "Ficha do lead — autorização de pesquisa",
    consequencia: "Libera (ou mantém bloqueada) qualquer pesquisa externa em nome do cliente.",
  },
  pesquisa_previa_escopo: {
    tipo: "multi",
    porQueImporta: "Delimita exatamente o que foi autorizado a pesquisar.",
    destino: "Ficha do lead — autorização de pesquisa",
    consequencia: "Só existe com autorização registrada — sem isso, fica bloqueado.",
  },
  elegibilidade_preliminar: {
    tipo: "select",
    porQueImporta: "É o sinal-síntese da call — resume o que a triagem indica até aqui.",
    destino: "Ficha do lead — qualificação",
    consequencia: "Sinal Forte/Provável passa a exigir via preliminar, geração e linha de transmissão para sustentar o handoff.",
  },
  objecao_predominante: {
    tipo: "select",
    porQueImporta: "Nomear a objeção real evita repetir a mesma barreira na próxima call.",
    destino: "Ficha do lead — qualificação",
    consequencia: "Orienta o próximo contato a tratar a objeção certa.",
  },
  nivel_intencao: {
    tipo: "select",
    porQueImporta: "Mede o quanto a pessoa já decidiu seguir, além da elegibilidade.",
    destino: "Ficha do lead — qualificação",
    consequencia: "Ajuda a priorizar quem atender primeiro na fila de calls.",
  },
  discovery_resultado: {
    tipo: "select",
    porQueImporta: "É a conclusão da Discovery — decide para onde o lead vai depois.",
    destino: "Handoff da Discovery",
    consequencia: "Determina o destino: proposta, nutrição ou encerrar sem aderência.",
  },
  proxima_acao_em: {
    tipo: "data",
    porQueImporta: "Próxima ação sem prazo não é compromisso, é intenção.",
    destino: "Ficha do lead — próxima ação",
    consequencia: "Com o campo acima preenchido, habilita criar/atualizar a tarefa do caso.",
  },
  area_responsavel: {
    tipo: "select",
    porQueImporta: "Diz qual área do Desk é dona deste lead agora.",
    destino: "Ficha do lead — responsável",
    consequencia: "Some do sinal 'sem responsável' assim que preenchido.",
  },
};

/** Rótulo curto de cada campo do roteiro — o mesmo texto usado no CRM de leads. */
export const ROTULO_CAMPO_ROTEIRO: Record<string, string> = {
  objetivo: "Objetivo",
  nacionalidades_interesse: "Nacionalidades de interesse",
  pais_linha_prioritaria: "País/linha prioritária",
  estrutura_familiar: "Estrutura familiar",
  requerentes_potenciais: "Requerentes potenciais",
  responsavel_nome: "Responsável nominal",
  proxima_acao: "Próxima ação",
  geracao_ascendente: "Geração do ascendente",
  linha_transmissao: "Linha de transmissão",
  localidades_conhecidas: "Localidades conhecidas (comuna, paróquia, província)",
  risco_ruptura: "Risco de ruptura",
  estado_documental_inicial: "Estado documental inicial",
  documentos_chave: "Documentos-chave já indicados",
  pendencia_documental_prioritaria: "Pendência documental prioritária",
  complexidade_documental: "Complexidade documental",
  confianca_triagem: "Confiança da triagem",
  via_juridica_preliminar: "Via jurídica preliminar",
  status_via: "Status da via",
  trilha_referencia_id: "Trilha jurídica de referência",
  marco_referencia_id: "Marco jurídico de referência",
  exige_idioma_entrevista: "Exige idioma/entrevista",
  pesquisa_previa_autorizacao: "Autorização de pesquisa prévia",
  pesquisa_previa_escopo: "Escopo autorizado da pesquisa prévia",
  objecao_predominante: "Objeção predominante",
  nivel_intencao: "Nível de intenção",
  discovery_resultado: "Resultado da Discovery",
  proxima_acao_em: "Prazo da próxima ação",
  area_responsavel: "Área responsável",
  elegibilidade_preliminar: "Elegibilidade preliminar",
};

export type EstadoRespostaRoteiro = "confirmado" | "informado_a_confirmar" | "hipotese" | "pendente";

export const ROTULO_ESTADO_RESPOSTA: Record<EstadoRespostaRoteiro, string> = {
  confirmado: "Confirmado",
  informado_a_confirmar: "Informado — a confirmar",
  hipotese: "Hipótese",
  pendente: "Pendente",
};

function valorPreenchido(v: unknown): boolean {
  if (Array.isArray(v)) return v.length > 0;
  return v !== null && v !== undefined && String(v).trim() !== "";
}

/**
 * Estado de UMA resposta do roteiro. Nunca lê banco: recebe o que a tela já
 * tem — valor salvo no lead canônico, valor em rascunho (ainda não gravado,
 * de digitação ou de achado aplicado) e se a pessoa marcou esta resposta
 * como hipótese nesta sessão. Nada aqui vira fato só porque apareceu numa
 * conversa — só "gravado no lead" é confirmado.
 */
export function estadoResposta(args: {
  valorSalvo: unknown;
  valorRascunho: unknown;
  emRascunho: boolean;
  marcadaComoHipotese: boolean;
}): EstadoRespostaRoteiro {
  const valorAtual = args.emRascunho ? args.valorRascunho : args.valorSalvo;
  if (!valorPreenchido(valorAtual)) return "pendente";
  if (args.marcadaComoHipotese) return "hipotese";
  if (args.emRascunho) return "informado_a_confirmar";
  return "confirmado";
}

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
