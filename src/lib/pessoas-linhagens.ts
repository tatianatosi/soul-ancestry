/**
 * G-02 — Ficha piloto genealógica como origem canônica.
 *
 * Pessoa + relações estruturadas + linhagens + eventos + evidências
 * = árvore interna e linha do tempo interna.
 *
 * Regras invioláveis desta camada:
 * - nenhuma pesquisa externa, documento, pasta, contrato, cobrança, assinatura,
 *   mensagem ou publicação no App Cliente é executada aqui;
 * - nada é inferido: campo ausente permanece ausente e aparece como lacuna;
 * - árvore e timeline derivam apenas de registros persistidos, nunca de texto livre;
 * - fato confirmado exige evidência ou fonte vinculada;
 * - variante de nome nunca cria pessoa duplicada;
 * - relação "a confirmar" nunca é exibida como confirmada;
 * - linha dupla é configuração de análise: não duplica pessoa nem cria caso novo;
 * - conteúdo interno não é projetado ao App Cliente sem autorização futura.
 */

import { ANO_MINIMO_GENEALOGICO, dataValida, nomeValido } from "@/lib/validacao-pessoa";

export type Opcao = { id: string; rotulo: string };

export const STATUS_VERIFICACAO: Opcao[] = [
  { id: "confirmado", rotulo: "Confirmado" },
  { id: "provavel", rotulo: "Provável" },
  { id: "hipotese", rotulo: "Hipótese" },
  { id: "pendente", rotulo: "Pendente" },
  { id: "nao_aplicavel", rotulo: "Não aplicável" },
];

export const SEXO: Opcao[] = [
  { id: "feminino", rotulo: "Feminino" },
  { id: "masculino", rotulo: "Masculino" },
  { id: "nao_informado", rotulo: "Não informado" },
  { id: "a_confirmar", rotulo: "A confirmar" },
];

export const TIPOS_VARIANTE: Opcao[] = [
  { id: "grafia", rotulo: "Grafia" },
  { id: "traducao", rotulo: "Tradução" },
  { id: "italianizacao", rotulo: "Italianização" },
  { id: "aportuguesamento", rotulo: "Aportuguesamento" },
  { id: "apelido", rotulo: "Apelido" },
  { id: "erro_documental", rotulo: "Erro documental" },
  { id: "nome_religioso", rotulo: "Nome religioso" },
  { id: "outro", rotulo: "Outro" },
];

export const ESTADO_VALIDACAO_VARIANTE: Opcao[] = [
  { id: "a_confirmar", rotulo: "A confirmar" },
  { id: "em_analise", rotulo: "Em análise" },
  { id: "validada", rotulo: "Validada" },
  { id: "descartada", rotulo: "Descartada" },
];

export const NIVEIS_CONFIANCA: Opcao[] = [
  { id: "baixo", rotulo: "Baixo" },
  { id: "medio", rotulo: "Médio" },
  { id: "alto", rotulo: "Alto" },
];

export const TIPOS_RELACAO: Opcao[] = [
  { id: "pai_mae", rotulo: "Pai / mãe" },
  { id: "filho", rotulo: "Filho(a)" },
  { id: "conjuge", rotulo: "Cônjuge" },
  { id: "irmao", rotulo: "Irmão / irmã" },
  { id: "tutor_representante", rotulo: "Tutor / representante" },
  { id: "padrinho_madrinha", rotulo: "Padrinho / madrinha" },
  { id: "colateral", rotulo: "Colateral" },
  { id: "a_confirmar", rotulo: "A confirmar" },
];

/** CHECK genealogical_relationships.status_pesquisa (migration 20260822205306). */
export const STATUS_PESQUISA_RELACAO: Opcao[] = [
  { id: "a_confirmar", rotulo: "A confirmar" },
  { id: "pendente", rotulo: "Pendente" },
  { id: "hipotese", rotulo: "Hipótese" },
  { id: "provavel", rotulo: "Provável" },
  { id: "com_suporte", rotulo: "Com suporte documental" },
  { id: "confirmado", rotulo: "Confirmada" },
  { id: "refutado", rotulo: "Refutada" },
];

export const TIPOS_EVENTO: Opcao[] = [
  { id: "nascimento", rotulo: "Nascimento" },
  { id: "batismo", rotulo: "Batismo" },
  { id: "casamento", rotulo: "Casamento" },
  { id: "morte", rotulo: "Morte" },
  { id: "sepultamento", rotulo: "Sepultamento" },
  { id: "residencia", rotulo: "Residência" },
  { id: "migracao", rotulo: "Migração" },
  { id: "servico_militar", rotulo: "Serviço militar" },
  { id: "patrimonio", rotulo: "Patrimônio" },
  { id: "outro", rotulo: "Outro" },
];

export const STATUS_VALIDACAO_EVENTO: Opcao[] = [
  { id: "pendente", rotulo: "Pendente" },
  { id: "em_revisao", rotulo: "Em revisão" },
  { id: "confirmado", rotulo: "Confirmado" },
  { id: "descartado", rotulo: "Descartado" },
];

/**
 * `genealogical_events.impact_type` (migration 20260822205306, coluna
 * aditiva) — o formulário de eventos nunca expôs este campo, embora o
 * servidor já o aceite (`CAMPOS_EVENTO`). Vocabulário exatamente do CHECK
 * real, nenhum valor novo.
 */
export const IMPACTO_EVENTO: Opcao[] = [
  { id: "familiar", rotulo: "Familiar" },
  { id: "patrimonial", rotulo: "Patrimonial" },
  { id: "migratorio", rotulo: "Migratório" },
  { id: "documental", rotulo: "Documental" },
  { id: "juridico", rotulo: "Jurídico" },
  { id: "memoria", rotulo: "Memória" },
];

export const TIPOS_LINHA: Opcao[] = [
  { id: "paterna", rotulo: "Paterna" },
  { id: "materna", rotulo: "Materna" },
  { id: "direta", rotulo: "Direta" },
  { id: "colateral", rotulo: "Colateral" },
  { id: "cidadania", rotulo: "Cidadania" },
  { id: "memoria_legado", rotulo: "Memória e legado" },
  { id: "dupla_familiar", rotulo: "Dupla familiar" },
  { id: "alternativa", rotulo: "Alternativa" },
  { id: "a_confirmar", rotulo: "A confirmar" },
];

export const STATUS_LINHA: Opcao[] = [
  { id: "em_estruturacao", rotulo: "Em estruturação" },
  { id: "em_pesquisa", rotulo: "Em pesquisa" },
  { id: "com_suporte", rotulo: "Com suporte" },
  { id: "bloqueada", rotulo: "Bloqueada" },
  { id: "concluida", rotulo: "Concluída" },
  { id: "descartada", rotulo: "Descartada" },
];

export const rotuloDe = (lista: Opcao[], id: unknown) =>
  lista.find((o) => o.id === id)?.rotulo ?? (id ? String(id) : "—");

/* ------------------------------------------------------------------ */
/* Tipos de leitura                                                    */
/* ------------------------------------------------------------------ */

export type Perfil = {
  id: string;
  research_person_id: string;
  case_id: string | null;
  nome_completo: string;
  nome_nascimento: string | null;
  sexo: string | null;
  nascimento_data: string | null;
  nascimento_data_aproximada: string | null;
  nascimento_localidade: string | null;
  morte_data: string | null;
  morte_data_aproximada: string | null;
  morte_localidade: string | null;
  causa_morte: string | null;
  sepultamento_localidade: string | null;
  status_verificacao: string;
  evidence_id: string | null;
  verified_at: string | null;
  internal_notes: string | null;
  /**
   * Gate da Árvore do App: só `aprovada` publica (04/10/2026). Eixo distinto
   * de `status_verificacao` e de `research_people.sensitivity_level` — ver
   * `visibilidade-arvore.ts`.
   */
  client_visibility?: string | null;
  archived_at?: string | null;
  /**
   * Vínculo opcional com a Pessoa Canônica (`clientes.id`). Corte U2
   * (docs/design-system/de-para-pessoa-unificada.md) — só gravado quando um
   * humano escolhe explicitamente "vincular a pessoa já cadastrada"; nunca
   * fusão automática.
   */
  client_id?: string | null;
};

export type Variante = {
  id: string;
  person_id: string;
  variante: string;
  tipo: string;
  periodo: string | null;
  localidade: string | null;
  estado_validacao: string;
  nivel_confianca: string;
  evidence_id: string | null;
  source_id: string | null;
  observacao_interna: string | null;
  archived_at?: string | null;
};

export type Relacao = {
  id: string;
  person_from_id: string;
  person_to_id: string;
  relation_type: string;
  relation_date: string | null;
  relation_date_aproximada: string | null;
  locality: string | null;
  status_pesquisa: string;
  evidence_id: string | null;
  source_id: string | null;
  internal_notes: string | null;
  archived_at?: string | null;
};

export type Evento = {
  id: string;
  person_id: string;
  event_type: string;
  start_date: string | null;
  end_date: string | null;
  approximate_date: string | null;
  locality: string | null;
  description_internal: string | null;
  validation_status: string;
  evidence_id: string | null;
  source_id: string | null;
  impact_type?: string | null;
  data_precisao?: string;
  client_visibility?: string;
  archived_at?: string | null;
};

export type Linhagem = {
  id: string;
  case_id: string;
  family_id: string | null;
  nome_da_linha: string;
  pessoa_ancora_id: string | null;
  tipo_da_linha: string;
  citizenship_track_id: string | null;
  objetivo: string | null;
  geracao_alvo: string | null;
  status: string;
  evidencias_chave: string[];
  risco_principal: string | null;
  proximo_marco: string | null;
  responsavel: string | null;
  /**
   * Heatmap por ramo (02/10/2026). Aderência operacional/documental deste
   * ramo, 0–100 inteiro — nunca veredito jurídico, direito ou elegibilidade
   * definitiva. É o que alimenta `heatmap_pct_1..3` da Ficha Master.
   */
  aderencia_percentual?: number | null;
  archived_at?: string | null;
};

/* ------------------------------------------------------------------ */
/* Validações de gravação (espelham as travas do banco)                */
/* ------------------------------------------------------------------ */

const vazio = (v: unknown) => v === null || v === undefined || String(v).trim() === "";

export function validarPerfil(p: Partial<Perfil>): string[] {
  const erros: string[] = [];
  if (vazio(p.nome_completo)) erros.push("Nome completo é obrigatório.");
  /*
    Varredura de máscaras (03/10/2026): a Ficha Genealógica exigia apenas
    "não vazio" — aceitava "João 123" como nome e nascimento em 2090. Os
    validadores existiam em `validacao-pessoa.ts` desde 02/10 e nenhuma aba
    da ficha os usava. Aqui é o servidor, que é quem recusa; a tela apenas
    mostra o mesmo motivo antes.
  */
  if (!vazio(p.nome_completo) && !nomeValido(String(p.nome_completo))) {
    erros.push("Nome completo não pode conter números e precisa de ao menos duas letras.");
  }
  for (const [rotulo, valor] of [
    ["nascimento", p.nascimento_data],
    ["morte", p.morte_data],
  ] as const) {
    // Ancestral nascido antes de 1900 é o caso normal aqui — o piso é o
    // genealógico, não o de pessoa viva.
    if (!vazio(valor) && !dataValida(String(valor), { anoMinimo: ANO_MINIMO_GENEALOGICO })) {
      erros.push(
        `Data de ${rotulo} inválida: use dd/mm/aaaa ou ISO, a partir de ${ANO_MINIMO_GENEALOGICO} e nunca no futuro.`,
      );
    }
  }
  if (p.status_verificacao === "confirmado" && vazio(p.evidence_id)) {
    erros.push("Perfil confirmado exige evidência de suporte vinculada.");
  }
  if (p.nascimento_data && p.morte_data && p.morte_data < p.nascimento_data) {
    erros.push("Data de morte não pode ser anterior à data de nascimento.");
  }
  return erros;
}

export function validarVariante(v: Partial<Variante>, existentes: Variante[] = []): string[] {
  const erros: string[] = [];
  const texto = String(v.variante ?? "").trim();
  if (texto.length < 2) erros.push("Informe a variante de nome (mínimo 2 caracteres).");
  if (vazio(v.tipo)) erros.push("Informe o tipo da variante.");
  if (vazio(v.person_id)) erros.push("Variante precisa estar vinculada a uma pessoa já cadastrada.");
  if (v.estado_validacao === "validada" && vazio(v.evidence_id) && vazio(v.source_id)) {
    erros.push("Variante validada exige evidência ou fonte vinculada.");
  }
  const duplicada = existentes.some(
    (e) => e.id !== v.id && e.person_id === v.person_id && e.variante.trim().toLowerCase() === texto.toLowerCase(),
  );
  if (duplicada) erros.push("Esta variante já está registrada para a pessoa — variante não cria pessoa nova.");
  return erros;
}

export function validarRelacao(r: Partial<Relacao>): string[] {
  const erros: string[] = [];
  if (vazio(r.person_from_id) || vazio(r.person_to_id)) erros.push("Selecione as duas pessoas da relação.");
  if (r.person_from_id && r.person_from_id === r.person_to_id) {
    erros.push("Uma pessoa não pode ter relação consigo mesma.");
  }
  if (vazio(r.relation_type)) erros.push("Informe o tipo de relação.");
  if (
    (r.status_pesquisa === "confirmado" || r.status_pesquisa === "com_suporte") &&
    vazio(r.evidence_id) &&
    vazio(r.source_id)
  ) {
    erros.push("Relação só sai de \u201ca confirmar\u201d com evidência ou fonte vinculada.");
  }
  return erros;
}

export function validarEvento(e: Partial<Evento>): string[] {
  const erros: string[] = [];
  if (vazio(e.person_id)) erros.push("Selecione a pessoa do evento.");
  if (vazio(e.event_type)) erros.push("Informe o tipo do evento.");
  if (e.validation_status === "confirmado" && vazio(e.evidence_id) && vazio(e.source_id)) {
    erros.push("Evento confirmado exige evidência ou fonte vinculada.");
  }
  if (e.start_date && e.end_date && e.end_date < e.start_date) {
    erros.push("Data final não pode ser anterior à data inicial.");
  }
  return erros;
}

export function validarLinhagem(l: Partial<Linhagem>, existentes: Linhagem[] = []): string[] {
  const erros: string[] = [];
  if (vazio(l.nome_da_linha)) erros.push("Informe o nome da linha.");
  if (vazio(l.case_id)) erros.push("Linhagem precisa estar vinculada a um caso.");
  const duplicada = existentes.some(
    (e) =>
      e.id !== l.id &&
      e.case_id === l.case_id &&
      e.nome_da_linha.trim().toLowerCase() === String(l.nome_da_linha ?? "").trim().toLowerCase(),
  );
  if (duplicada) erros.push("Já existe uma linha com este nome neste caso.");
  return erros;
}

/* ------------------------------------------------------------------ */
/* Derivação da árvore interna                                         */
/* ------------------------------------------------------------------ */

export type NoArvore = {
  personId: string;
  nome: string;
  status: string;
  geracao: number;
  filhos: NoArvore[];
  relacaoComPai: { tipo: string; status: string } | null;
  conjuges: { personId: string; nome: string; status: string }[];
};

const ativos = <T extends { archived_at?: string | null }>(lista: T[]) => lista.filter((i) => !i.archived_at);

/** Relação vira aresta pai→filho apenas a partir de registro persistido. */
export function arestasFiliacao(relacoes: Relacao[]) {
  const arestas: { pai: string; filho: string; tipo: string; status: string }[] = [];
  for (const r of ativos(relacoes)) {
    if (r.status_pesquisa === "refutado" || r.status_pesquisa === "descartado") continue;
    if (r.relation_type === "pai_mae") {
      arestas.push({ pai: r.person_from_id, filho: r.person_to_id, tipo: r.relation_type, status: r.status_pesquisa });
    } else if (r.relation_type === "filho") {
      arestas.push({ pai: r.person_to_id, filho: r.person_from_id, tipo: r.relation_type, status: r.status_pesquisa });
    }
  }
  return arestas;
}

/**
 * Monta a árvore interna a partir de perfis e relações persistidos.
 * Nenhum parentesco é inferido: só existe aresta se houver relação gravada.
 */
export function montarArvore(perfis: Perfil[], relacoes: Relacao[], ancoraPersonId?: string | null): NoArvore[] {
  const vivos = ativos(perfis);
  const porPessoa = new Map(vivos.map((p) => [p.research_person_id, p]));
  const arestas = arestasFiliacao(relacoes);
  const paisDe = new Map<string, string[]>();
  const filhosDe = new Map<string, { filho: string; tipo: string; status: string }[]>();
  for (const a of arestas) {
    if (!porPessoa.has(a.pai) || !porPessoa.has(a.filho)) continue;
    paisDe.set(a.filho, [...(paisDe.get(a.filho) ?? []), a.pai]);
    filhosDe.set(a.pai, [...(filhosDe.get(a.pai) ?? []), { filho: a.filho, tipo: a.tipo, status: a.status }]);
  }

  const conjugesDe = new Map<string, string[]>();
  for (const r of ativos(relacoes)) {
    if (r.relation_type !== "conjuge" || r.status_pesquisa === "refutado" || r.status_pesquisa === "descartado") continue;
    conjugesDe.set(r.person_from_id, [...(conjugesDe.get(r.person_from_id) ?? []), r.person_to_id]);
    conjugesDe.set(r.person_to_id, [...(conjugesDe.get(r.person_to_id) ?? []), r.person_from_id]);
  }

  const nomeDe = (id: string) => porPessoa.get(id)?.nome_completo ?? "Pessoa não identificada";
  const statusDe = (id: string) => porPessoa.get(id)?.status_verificacao ?? "pendente";

  const construir = (id: string, geracao: number, visitados: Set<string>, relacao: NoArvore["relacaoComPai"]): NoArvore => {
    visitados.add(id);
    const filhos = (filhosDe.get(id) ?? [])
      .filter((f) => !visitados.has(f.filho))
      .map((f) => construir(f.filho, geracao + 1, visitados, { tipo: f.tipo, status: f.status }));
    return {
      personId: id,
      nome: nomeDe(id),
      status: statusDe(id),
      geracao,
      filhos,
      relacaoComPai: relacao,
      conjuges: Array.from(new Set(conjugesDe.get(id) ?? []))
        .filter((c) => porPessoa.has(c))
        .map((c) => ({ personId: c, nome: nomeDe(c), status: statusDe(c) })),
    };
  };

  const visitados = new Set<string>();
  const raizes: NoArvore[] = [];
  const ordem = vivos.map((p) => p.research_person_id);
  const preferencial = ancoraPersonId && porPessoa.has(ancoraPersonId) ? [ancoraPersonId, ...ordem] : ordem;
  for (const id of preferencial) {
    if (visitados.has(id)) continue;
    if ((paisDe.get(id) ?? []).length > 0) continue; // não é raiz
    raizes.push(construir(id, 0, visitados, null));
  }
  // pessoas restantes (ciclos ou sem raiz alcançável) entram como raízes soltas
  for (const id of ordem) {
    if (!visitados.has(id)) raizes.push(construir(id, 0, visitados, null));
  }
  return raizes;
}

export function contarNos(nos: NoArvore[]): number {
  return nos.reduce((total, n) => total + 1 + contarNos(n.filhos), 0);
}

/* ------------------------------------------------------------------ */
/* Pesquisa G1...Gn — geração ascendente a partir de uma pessoa âncora  */
/* ------------------------------------------------------------------ */

/** Teto da leitura por geração no Desk: a linhagem do Clube vai até G10. */
export const GERACAO_MAXIMA_LINHAGEM = 10;

export type PessoaGeracao = {
  personId: string;
  nome: string;
  status: string;
  /** G1 = âncora (convenção do App: G1 "Você"); sobe +1 por geração de pais. */
  geracao: number;
};

/**
 * Sobe pela filiação a partir de `ancoraPersonId` (a mesma pessoa que
 * `lineage_paths.pessoa_ancora_id` já registra para a linha escolhida),
 * devolvendo cada pessoa com sua geração ascendente (G1=âncora, G2=pais,
 * G3=avós...). Convenção oposta a `montarArvore` (que desce do ancestral
 * mais antigo, G0, para o mais novo) — esta função serve à visão G1...Gn
 * que o App e a Árvore já usam (`portal-arvore-geracoes.ts`,
 * `app_projections.geracao_cliente`), para o Desk falar a mesma convenção.
 * Nenhum parentesco é inferido: só sobe por aresta de filiação persistida.
 */
export function geracaoAscendente(
  ancoraPersonId: string | null | undefined,
  perfis: Perfil[],
  relacoes: Relacao[],
): PessoaGeracao[] {
  if (!ancoraPersonId) return [];
  const vivos = ativos(perfis);
  const porPessoa = new Map(vivos.map((p) => [p.research_person_id, p]));
  if (!porPessoa.has(ancoraPersonId)) return [];

  const arestas = arestasFiliacao(relacoes);
  const paisDe = new Map<string, string[]>();
  for (const a of arestas) {
    if (!porPessoa.has(a.pai) || !porPessoa.has(a.filho)) continue;
    paisDe.set(a.filho, [...(paisDe.get(a.filho) ?? []), a.pai]);
  }
  const nomeDe = (id: string) => porPessoa.get(id)?.nome_completo ?? "Pessoa não identificada";
  const statusDe = (id: string) => porPessoa.get(id)?.status_verificacao ?? "pendente";

  const resultado: PessoaGeracao[] = [];
  const visitados = new Set<string>();
  let atual = [ancoraPersonId];
  let geracao = 1;
  // teto defensivo: nunca um laço infinito por dado circular não-tratado
  while (atual.length > 0 && geracao <= 20) {
    const proximos: string[] = [];
    for (const id of atual) {
      if (visitados.has(id)) continue;
      visitados.add(id);
      resultado.push({ personId: id, nome: nomeDe(id), status: statusDe(id), geracao });
      for (const pai of paisDe.get(id) ?? []) {
        if (!visitados.has(pai)) proximos.push(pai);
      }
    }
    atual = proximos;
    geracao += 1;
  }
  return resultado;
}

/* ------------------------------------------------------------------ */
/* Linha do tempo interna                                              */
/* ------------------------------------------------------------------ */

export type ItemTimeline = {
  id: string;
  personId: string;
  pessoa: string;
  tipo: string;
  rotuloTipo: string;
  dataOrdenacao: string;
  dataExibicao: string;
  aproximada: boolean;
  localidade: string | null;
  status: string;
  comEvidencia: boolean;
  descricao: string | null;
};

/** Timeline derivada de eventos persistidos; sem data, ordena ao final. */
export function montarTimeline(perfis: Perfil[], eventos: Evento[]): ItemTimeline[] {
  const nomes = new Map(perfis.map((p) => [p.research_person_id, p.nome_completo]));
  const itens = ativos(eventos).map((e) => {
    const data = e.start_date ?? "";
    return {
      id: e.id,
      personId: e.person_id,
      pessoa: nomes.get(e.person_id) ?? "Pessoa não identificada",
      tipo: e.event_type,
      rotuloTipo: rotuloDe(TIPOS_EVENTO, e.event_type),
      dataOrdenacao: data || "9999-12-31",
      dataExibicao: data || (e.approximate_date ? `${e.approximate_date} (aprox.)` : "Data não informada"),
      aproximada: !data && Boolean(e.approximate_date),
      localidade: e.locality,
      status: e.validation_status,
      comEvidencia: Boolean(e.evidence_id || e.source_id),
      descricao: e.description_internal,
    } satisfies ItemTimeline;
  });
  return itens.sort((a, b) => a.dataOrdenacao.localeCompare(b.dataOrdenacao));
}

/* ------------------------------------------------------------------ */
/* Lacunas e próximas pesquisas                                        */
/* ------------------------------------------------------------------ */

export type Lacuna = { chave: string; pessoa: string | null; descricao: string; prioridade: "alta" | "media" };

/** Lista o que falta, sem inferir nada e sem sugerir consulta externa automática. */
export function calcularLacunas(
  perfis: Perfil[],
  relacoes: Relacao[],
  eventos: Evento[],
  linhagens: Linhagem[],
): Lacuna[] {
  const lacunas: Lacuna[] = [];
  for (const p of ativos(perfis)) {
    if (!p.nascimento_data && !p.nascimento_data_aproximada) {
      lacunas.push({ chave: `nasc:${p.id}`, pessoa: p.nome_completo, descricao: "Data de nascimento ausente (exata ou aproximada).", prioridade: "alta" });
    }
    if (!p.nascimento_localidade) {
      lacunas.push({ chave: `nascloc:${p.id}`, pessoa: p.nome_completo, descricao: "Localidade de nascimento ausente.", prioridade: "media" });
    }
    if (p.status_verificacao !== "confirmado" && p.status_verificacao !== "nao_aplicavel") {
      lacunas.push({ chave: `verif:${p.id}`, pessoa: p.nome_completo, descricao: `Identidade em estado \u201c${rotuloDe(STATUS_VERIFICACAO, p.status_verificacao)}\u201d — falta evidência de suporte.`, prioridade: "alta" });
    }
  }
  const nomes = new Map(perfis.map((p) => [p.research_person_id, p.nome_completo]));
  for (const r of ativos(relacoes)) {
    if (
      r.status_pesquisa === "a_confirmar" ||
      r.status_pesquisa === "pendente" ||
      r.status_pesquisa === "hipotese" ||
      r.status_pesquisa === "em_pesquisa"
    ) {
      const de = nomes.get(r.person_from_id) ?? "—";
      const para = nomes.get(r.person_to_id) ?? "—";
      lacunas.push({
        chave: `rel:${r.id}`,
        pessoa: de,
        descricao: `Relação ${rotuloDe(TIPOS_RELACAO, r.relation_type).toLowerCase()} com ${para} ainda a confirmar.`,
        prioridade: "alta",
      });
    }
  }
  for (const e of ativos(eventos)) {
    if (!e.evidence_id && !e.source_id) {
      lacunas.push({
        chave: `ev:${e.id}`,
        pessoa: nomes.get(e.person_id) ?? null,
        descricao: `Evento ${rotuloDe(TIPOS_EVENTO, e.event_type).toLowerCase()} sem evidência ou fonte vinculada.`,
        prioridade: "media",
      });
    }
  }
  for (const l of ativos(linhagens)) {
    if (!l.pessoa_ancora_id) {
      lacunas.push({ chave: `lin:${l.id}`, pessoa: null, descricao: `Linha \u201c${l.nome_da_linha}\u201d sem pessoa âncora definida.`, prioridade: "alta" });
    }
    if (!l.proximo_marco) {
      lacunas.push({ chave: `linm:${l.id}`, pessoa: null, descricao: `Linha \u201c${l.nome_da_linha}\u201d sem próximo marco registrado.`, prioridade: "media" });
    }
  }
  return lacunas;
}

/* ------------------------------------------------------------------ */
/* Barreira de projeção ao App Cliente                                 */
/* ------------------------------------------------------------------ */

export const MOTIVO_SEM_PROJECAO =
  "Conteúdo interno de pesquisa. Projeção ao App Cliente exige devolutiva aprovada — não há leitura direta destes registros.";

/** O App Cliente nunca lê perfis, relações, eventos ou notas internas. */
export function projecaoClienteBloqueada(): { publicavel: false; motivo: string } {
  return { publicavel: false, motivo: MOTIVO_SEM_PROJECAO };
}

/**
 * Heatmap de aderência (campos 14/16/18 da Ficha Master, Prioridade 2 de
 * 02/10/2026) — percentual do ramo (`lineage_paths.aderencia_percentual`,
 * migration 20261002120000). Nunca aceita símbolo "%"; sempre inteiro de
 * 0 a 100. `null`/`undefined` passam (campo opcional, limpa o valor).
 */
export function validarAderenciaPercentual(bruto: unknown): number | null {
  if (bruto === null || bruto === undefined) return null;
  if (typeof bruto === "string") {
    if (bruto.includes("%")) {
      throw new Error("Aderência é gravada sem o símbolo %, só o número de 0 a 100.");
    }
    /*
      03/10/2026 — defeito achado ao escrever o teste do item 6: `Number("")`
      é 0, e 0 passa no intervalo. Campo em branco virava "0% de aderência"
      gravado no banco, em vez de "não calculada". A tela já tratava; o
      servidor, que é quem recusa, não. Branco é ausência de dado, nunca zero.
    */
    if (bruto.trim() === "") return null;
  }
  const n = Number(bruto);
  if (!Number.isInteger(n) || n < 0 || n > 100) {
    throw new Error("Aderência precisa ser um número inteiro entre 0 e 100.");
  }
  return n;
}
