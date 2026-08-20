/**
 * G-06 — Achados Genealógicos e Encontros de Linhagem.
 *
 * Fluxo canônico: Fonte -> Evidência -> Validação interna -> Achado ->
 * Árvore/Linha do tempo -> Micro-entrega ou Relatório, se aprovado.
 *
 * Este módulo é espelho das travas do banco (fonte de verdade). Nada aqui
 * publica no App Cliente, envia mensagem ou afirma relação familiar.
 */

export type Relevancia = "baixa" | "media" | "alta" | "critica";
export type ValidacaoStatus = "rascunho" | "em_revisao" | "validado_internamente" | "divergente" | "arquivado";
export type Impacto = "nenhum" | "proposto" | "aplicado";
export type Aprovacao = "nao_submetido" | "em_aprovacao" | "aprovado" | "recusado";
export type ConfiancaInterna = "hipotese" | "indicio" | "consistente" | "documentado";

export const TIPOS_ACHADO: { id: string; rotulo: string; nota: string }[] = [
  { id: "registro_civil", rotulo: "Registro civil", nota: "Nascimento, casamento, óbito em cartório ou registro estatal." },
  { id: "registro_religioso", rotulo: "Registro religioso", nota: "Batismo, matrimônio, sepultamento em livro paroquial." },
  { id: "registro_militar", rotulo: "Registro militar", nota: "Alistamento, ficha de serviço, dispensa." },
  { id: "migracao", rotulo: "Migração", nota: "Lista de bordo, entrada, hospedaria, passaporte." },
  { id: "naturalizacao_nacionalidade", rotulo: "Naturalização/nacionalidade", nota: "Ato de naturalização, registro consular, perda ou manutenção." },
  { id: "patrimonio_notarial", rotulo: "Patrimônio/notarial", nota: "Escritura, inventário, procuração, contrato." },
  { id: "correspondencia_familiar", rotulo: "Correspondência familiar", nota: "Cartas e documentos privados fornecidos pela família." },
  { id: "foto_acervo_visual", rotulo: "Foto/acervo visual", nota: "Imagem datada ou identificada com apoio documental." },
  { id: "estrutura_familiar", rotulo: "Estrutura familiar", nota: "Composição de núcleo, filiação, irmandade documentada." },
  { id: "linha_do_tempo", rotulo: "Linha do tempo", nota: "Ordenação cronológica sustentada por registros." },
  { id: "localidade", rotulo: "Localidade", nota: "Identificação ou correção de topônimo e jurisdição." },
  { id: "documento_divergente", rotulo: "Documento divergente", nota: "Conflito entre registros: exige tratamento antes de conclusão." },
  { id: "resultado_negativo_pesquisa", rotulo: "Resultado negativo de pesquisa", nota: "Busca sem retorno: exige fonte consultada, data e próxima ação." },
  { id: "hipotese_pesquisa", rotulo: "Hipótese de pesquisa", nota: "Linha a testar. Nunca é apresentada como fato ou conexão confirmada." },
  { id: "outro", rotulo: "Outro (justificar)", nota: "Exige justificativa no resumo interno." },
];

export const TIPOS_ENCONTRO: { id: string; rotulo: string; nota: string }[] = [
  { id: "conexao_confirmada", rotulo: "Conexão confirmada", nota: "Exige validação interna e confiança documental." },
  { id: "convergencia_documental", rotulo: "Convergência documental", nota: "Dois conjuntos apontam para o mesmo contexto, sem afirmar parentesco." },
  { id: "separacao_de_ramos", rotulo: "Separação de ramos", nota: "Ponto em que as linhas se distinguem." },
  { id: "linha_paralela_relevante", rotulo: "Linha paralela relevante", nota: "Linha vizinha útil ao entendimento do caso." },
  { id: "dupla_linhagem_familiar", rotulo: "Dupla linhagem familiar", nota: "Duas linhas relevantes no mesmo núcleo." },
  { id: "marco_de_origem", rotulo: "Marco de origem", nota: "Único tipo que dispensa a segunda linha; ainda exige evidência." },
];

export const RELEVANCIAS: { id: Relevancia; rotulo: string }[] = [
  { id: "baixa", rotulo: "Baixa" },
  { id: "media", rotulo: "Média" },
  { id: "alta", rotulo: "Alta" },
  { id: "critica", rotulo: "Crítica" },
];

export const STATUS_VALIDACAO: { id: ValidacaoStatus; rotulo: string }[] = [
  { id: "rascunho", rotulo: "Rascunho" },
  { id: "em_revisao", rotulo: "Em revisão" },
  { id: "validado_internamente", rotulo: "Validado internamente" },
  { id: "divergente", rotulo: "Divergente" },
  { id: "arquivado", rotulo: "Arquivado" },
];

export const IMPACTOS: { id: Impacto; rotulo: string }[] = [
  { id: "nenhum", rotulo: "Nenhum" },
  { id: "proposto", rotulo: "Proposto (aguarda revisão)" },
  { id: "aplicado", rotulo: "Aplicado (após validação)" },
];

export const CONFIANCAS: { id: ConfiancaInterna; rotulo: string }[] = [
  { id: "hipotese", rotulo: "Hipótese" },
  { id: "indicio", rotulo: "Indício" },
  { id: "consistente", rotulo: "Consistente" },
  { id: "documentado", rotulo: "Documentado" },
];

export const APROVACOES: { id: Aprovacao; rotulo: string }[] = [
  { id: "nao_submetido", rotulo: "Não submetido" },
  { id: "em_aprovacao", rotulo: "Em aprovação" },
  { id: "aprovado", rotulo: "Aprovado" },
  { id: "recusado", rotulo: "Recusado" },
];

export const DISCLAIMER_PADRAO =
  "Conteúdo histórico-documental de pesquisa. Não constitui conclusão jurídica, " +
  "reconhecimento de cidadania nem garantia de resultado.";

/** Expressões recusadas em qualquer texto destinado ao cliente. */
export const TERMOS_PROIBIDOS = [
  "garantido",
  "garantia de",
  "com certeza",
  "certamente",
  "sem duvida",
  "prova definitiva",
  "voce tem direito",
  "direito garantido",
  "cidadania garantida",
  "aprovacao garantida",
  "cura",
  "curar",
  "trauma ancestral",
  "ferida ancestral",
  "energia ancestral",
  "karma",
  "destino",
  "missao de alma",
  "alma da familia",
  "herdou a forca",
  "herdou a coragem",
  "sangue guerreiro",
  "dna de",
  "temperamento herdado",
  "traco de personalidade ancestral",
  "espirito de superacao herdado",
];

const semAcento = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function termoProibido(texto: string | null | undefined): string | null {
  if (!texto || !texto.trim()) return null;
  const t = semAcento(texto);
  return TERMOS_PROIBIDOS.find((termo) => t.includes(termo)) ?? null;
}

export type AchadoEntrada = {
  finding_type: string;
  evidence_links?: string[];
  source_links?: string[];
  internal_summary?: string | null;
  negative_source_consulted_at?: string | null;
  negative_next_action?: string | null;
  validation_status?: ValidacaoStatus;
  eligible_for_client_deliverable?: boolean;
  client_deliverable_id?: string | null;
  tree_impact?: Impacto;
  timeline_impact?: Impacto;
  planning_impact?: string | null;
};

export type Bloqueio = { codigo: string; mensagem: string };

/** Espelho das travas do banco para o achado. Banco continua sendo a autoridade. */
export function validarAchado(a: AchadoEntrada): Bloqueio[] {
  const b: Bloqueio[] = [];
  const evid = a.evidence_links ?? [];
  const fontes = a.source_links ?? [];
  const status = a.validation_status ?? "rascunho";

  if (evid.length === 0 && fontes.length === 0) {
    b.push({ codigo: "ACHADO_SEM_EVIDENCIA", mensagem: "Informe ao menos uma evidência ou fonte antes de gravar o achado." });
  }
  if (a.finding_type === "resultado_negativo_pesquisa") {
    if (fontes.length === 0 || !a.negative_source_consulted_at || !(a.negative_next_action ?? "").trim()) {
      b.push({
        codigo: "RESULTADO_NEGATIVO_INCOMPLETO",
        mensagem: "Resultado negativo exige fonte consultada, data da consulta e próxima ação alternativa.",
      });
    }
  }
  if (a.finding_type === "outro" && !(a.internal_summary ?? "").trim()) {
    b.push({ codigo: "OUTRO_SEM_JUSTIFICATIVA", mensagem: 'Tipo "Outro" exige justificativa no resumo interno.' });
  }
  if (a.finding_type === "hipotese_pesquisa" && status === "validado_internamente") {
    b.push({
      codigo: "HIPOTESE_NAO_VALIDAVEL",
      mensagem: "Hipótese de pesquisa não pode ser validada; converta o tipo quando houver documento.",
    });
  }
  if (a.eligible_for_client_deliverable && status !== "validado_internamente") {
    b.push({ codigo: "ELEGIBILIDADE_SEM_VALIDACAO", mensagem: "Só achado validado internamente pode virar entrega ao cliente." });
  }
  if (a.client_deliverable_id && !a.eligible_for_client_deliverable) {
    b.push({ codigo: "ENTREGA_SEM_ELEGIBILIDADE", mensagem: "Vincule a entrega apenas após marcar o achado como elegível." });
  }
  if ((a.tree_impact === "aplicado" || a.timeline_impact === "aplicado") && status !== "validado_internamente") {
    b.push({ codigo: "IMPACTO_SEM_REVISAO", mensagem: "Árvore e linha do tempo só recebem impacto aplicado após validação interna." });
  }
  const termo = termoProibido(a.planning_impact);
  if (termo) b.push({ codigo: "LINGUAGEM_PROIBIDA", mensagem: `Expressão "${termo}" não é aceita.` });
  return b;
}

export type EncontroEntrada = {
  encounter_type: string;
  lineage_path_a_id?: string | null;
  lineage_path_b_id?: string | null;
  evidence_links_a?: string[];
  evidence_links_b?: string[];
  confidence_internal?: ConfiancaInterna;
  validation_status?: ValidacaoStatus;
  disclaimer_obrigatorio?: boolean;
  resumo_aprovado_cliente?: string | null;
  approval_status?: Aprovacao;
  client_deliverable_id?: string | null;
  tree_impact?: Impacto;
  timeline_impact?: Impacto;
  title_client?: string | null;
  repertorios_narrativos?: string | null;
  memoria_familiar?: string | null;
};

export function validarEncontro(e: EncontroEntrada): Bloqueio[] {
  const b: Bloqueio[] = [];
  const a1 = e.evidence_links_a ?? [];
  const a2 = e.evidence_links_b ?? [];
  const status = e.validation_status ?? "rascunho";
  const aprov = e.approval_status ?? "nao_submetido";

  if (e.encounter_type !== "marco_de_origem") {
    if (!e.lineage_path_a_id || !e.lineage_path_b_id) {
      b.push({ codigo: "ENCONTRO_SEM_DUAS_LINHAS", mensagem: "Informe as duas linhas de linhagem envolvidas." });
    } else if (e.lineage_path_a_id === e.lineage_path_b_id) {
      b.push({ codigo: "ENCONTRO_LINHAS_IGUAIS", mensagem: "As duas linhas precisam ser distintas." });
    }
    if (a1.length === 0 || a2.length === 0) {
      b.push({ codigo: "ENCONTRO_SEM_EVIDENCIA_POR_LADO", mensagem: "Cada linha precisa de ao menos uma evidência." });
    }
  } else if (a1.length === 0) {
    b.push({ codigo: "MARCO_SEM_EVIDENCIA", mensagem: "Marco de origem exige ao menos uma evidência." });
  }

  if (
    e.encounter_type === "conexao_confirmada" &&
    ((e.confidence_internal ?? "hipotese") === "hipotese" ||
      (e.confidence_internal ?? "hipotese") === "indicio" ||
      status !== "validado_internamente")
  ) {
    b.push({
      codigo: "CONEXAO_NAO_COMPROVADA",
      mensagem: "Conexão confirmada exige validação interna e confiança documental; registre como hipótese ou convergência.",
    });
  }

  if (aprov === "aprovado") {
    if (!e.disclaimer_obrigatorio) {
      b.push({ codigo: "ENCONTRO_SEM_DISCLAIMER", mensagem: "Aprovação exige disclaimer obrigatório marcado." });
    }
    if (!(e.resumo_aprovado_cliente ?? "").trim()) {
      b.push({ codigo: "ENCONTRO_SEM_RESUMO_APROVADO", mensagem: "Escreva o resumo sanitizado antes de aprovar." });
    }
    if (status !== "validado_internamente") {
      b.push({ codigo: "APROVACAO_SEM_VALIDACAO", mensagem: "Valide internamente antes de aprovar." });
    }
  }
  if (e.client_deliverable_id && aprov !== "aprovado") {
    b.push({ codigo: "PROJECAO_SEM_APROVACAO", mensagem: "Encontro sem aprovação não cria projeção para o cliente." });
  }
  if ((e.tree_impact === "aplicado" || e.timeline_impact === "aplicado") && status !== "validado_internamente") {
    b.push({ codigo: "IMPACTO_SEM_REVISAO", mensagem: "Árvore e linha do tempo só recebem impacto aplicado após validação interna." });
  }
  for (const campo of [e.title_client, e.resumo_aprovado_cliente, e.repertorios_narrativos, e.memoria_familiar]) {
    const termo = termoProibido(campo);
    if (termo) {
      b.push({ codigo: "LINGUAGEM_PROIBIDA", mensagem: `Expressão "${termo}" não é aceita em texto do cliente.` });
      break;
    }
  }
  return b;
}

export type ProjecaoCliente = {
  titulo: string;
  resumo: string;
  data_marco: string | null;
  disclaimer: string;
};

/**
 * Projeção cliente-facing: rascunho sanitizado, nunca publicação automática.
 * Retorna null enquanto faltar aprovação, disclaimer ou resumo sanitizado.
 * Nunca expõe resumo interno, evidências, fontes ou confiança.
 */
export function projetarEncontroParaCliente(e: Record<string, unknown>): ProjecaoCliente | null {
  if (e["approval_status"] !== "aprovado") return null;
  if (!e["disclaimer_obrigatorio"]) return null;
  const resumo = String(e["resumo_aprovado_cliente"] ?? "").trim();
  if (!resumo) return null;
  if (termoProibido(resumo)) return null;
  return {
    titulo: String(e["title_client"] ?? "").trim() || "Encontro de linhagem",
    resumo,
    data_marco: (e["data_marco"] as string | null) ?? null,
    disclaimer: DISCLAIMER_PADRAO,
  };
}

/** Campos que jamais atravessam para o App Cliente. */
export const CAMPOS_INTERNOS_BLOQUEADOS = [
  "resumo_interno",
  "internal_summary",
  "internal_notes",
  "evidence_links",
  "evidence_links_a",
  "evidence_links_b",
  "source_links",
  "confidence_internal",
  "validation_status",
  "facts_to_confirm",
  "planning_impact",
  "title_internal",
];
