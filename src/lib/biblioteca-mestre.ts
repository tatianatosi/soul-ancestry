/**
 * Biblioteca Mestre — subáreas canônicas.
 * Não gera abas globais: são seções contextuais dentro da aba "Biblioteca Mestre".
 */

export type SubareaBiblioteca =
  | "acervo"
  | "bases"
  | "dicionarios"
  | "trilhas"
  | "juridico"
  | "governanca"
  | "modelos"
  | "top30"
  | "mapas"
  | "arquivo";

export interface SubareaBibliotecaMeta {
  chave: SubareaBiblioteca;
  label: string;
  finalidade: string;
  /** Campos/dimensões que a subárea deve catalogar. */
  dimensoes: readonly string[];
  /** Regra interna aplicada à subárea (sanitização, exposição, revisão). */
  regra: string;
}

export const SUBAREAS_BIBLIOTECA: readonly SubareaBibliotecaMeta[] = [
  {
    chave: "acervo",
    label: "Acervo",
    finalidade: "Modelos internos, referências operacionais, guias e materiais aprovados.",
    dimensoes: ["Tipo de peça", "Versão", "Status de aprovação", "Responsável", "Caso vinculado"],
    regra: "Somente material aprovado circula; rascunho permanece marcado como interno.",
  },
  {
    chave: "bases",
    label: "Bases Genealógicas",
    finalidade:
      "Catálogo de repositórios, arquivos, cartórios, bases públicas, fontes religiosas, imigração, naturalização, acervos e coleções.",
    dimensoes: ["País", "Localidade", "Tipo de acervo", "Cobertura temporal", "Forma de acesso", "Autorização"],
    regra: "Consulta externa só com autorização registrada; nenhuma coleta automática.",
  },
  {
    chave: "dicionarios",
    label: "Dicionários e taxonomias",
    finalidade:
      "Tipos de fonte, documento, evidência, estado de validação, relações, eventos, linhas, países, localidades e etiquetas.",
    dimensoes: ["Domínio", "Termo canônico", "Sinônimos", "Termos proibidos", "Versão"],
    regra: "Termo fora do dicionário não pode ser gravado como valor canônico.",
  },
  {
    chave: "trilhas",
    label: "Trilhas de pesquisa",
    finalidade: "Vias preliminares por país, com requisitos, documentos prioritários e riscos.",
    dimensoes: ["País", "Via preliminar", "Requisitos de entrada", "Documentos prioritários", "Riscos", "Autorização"],
    regra: "Trilha é preliminar e exige revisão humana; nunca vira parecer ao cliente.",
  },
  {
    chave: "juridico",
    label: "Regras jurídicas versionadas",
    finalidade: "Base normativa citável, sempre versionada e datada.",
    dimensoes: ["Fonte", "Versão", "Vigência", "Responsável", "Status de revisão", "Observação interna"],
    regra: "Sem cálculo automático de elegibilidade e sem parecer gerado por máquina.",
  },
  {
    chave: "governanca",
    label: "Governança",
    finalidade: "Fontes de verdade, decisões, políticas, retenção, LGPD, auditoria e nomenclaturas.",
    dimensoes: ["Decisão", "Data", "Responsável", "Política vinculada", "Escopo de retenção"],
    regra: "Decisão registrada é imutável; correção entra como nova decisão.",
  },
  {
    chave: "modelos",
    label: "Modelos F1/F2",
    finalidade: "Templates de relatório de fase com versões aprovadas e critérios de uso.",
    dimensoes: ["Modelo", "Versão aprovada", "Critério de uso", "Relatórios vinculados"],
    regra: "Relatório publicado precisa apontar para uma versão aprovada de modelo.",
  },
  {
    chave: "top30",
    label: "Catálogo Top 30",
    finalidade: "Produtos homologados com escopo, condição, preço vigente e histórico.",
    dimensoes: ["SKU", "Escopo", "Condição comercial", "Preço vigente", "Histórico de preço"],
    regra: "Catálogo é interno: nada aqui é exposto ao App Cliente.",
  },
  {
    chave: "mapas",
    label: "Mapas operacionais",
    finalidade: "Fluxos, checklists, gates, matriz de dependências e playbooks internos.",
    dimensoes: ["Fluxo", "Gates", "Dependências", "Checklist vinculado", "Playbook"],
    regra: "Mapa reflete o processo executável; divergência abre pendência de governança.",
  },
  {
    chave: "arquivo",
    label: "Arquivo histórico",
    finalidade: "Itens legados, descontinuados e preservados para referência.",
    dimensoes: ["Item", "Motivo do arquivamento", "Data", "Substituto vigente"],
    regra: "Sem exclusão física: item descontinuado é arquivado e permanece rastreável.",
  },
] as const;

export function subareaBiblioteca(chave: string): SubareaBibliotecaMeta | null {
  return SUBAREAS_BIBLIOTECA.find((s) => s.chave === chave) ?? null;
}

/* ------------------------------------------------------------------ */
/* Centro de Inteligência — mapa das 9 áreas (CA11)                    */
/* ------------------------------------------------------------------ */

export type LinhaCentroInteligencia = {
  area: string;
  casa: string;
  fonte: string;
  tipo: "catalogo_org" | "caso_scoped" | "componente_global";
  nota: string;
};

/**
 * CA11-CENTRO-INTELIGENCIA (09/09/2026) — mapa de onde cada área do Centro
 * de Inteligência realmente mora hoje. Não move dado nem cria tabela: só
 * declara a casa de cada núcleo e nomeia a fonte concorrente onde ela existe
 * de fato, para que a próxima decisão de unificação parta de um diagnóstico
 * único, e não de nove leituras dispersas.
 */
export const MAPA_CENTRO_INTELIGENCIA: readonly LinhaCentroInteligencia[] = [
  {
    area: "Bases por país/rota",
    casa: "Biblioteca Mestre → Bases Genealógicas (aqui) e /fontes-genealogicas (edição completa)",
    fonte: "genealogical_sources_catalog",
    tipo: "catalogo_org",
    nota: "Catálogo único: mesma tabela nas duas telas, sem duplicação. Biblioteca Mestre resume; /fontes-genealogicas edita.",
  },
  {
    area: "Fontes",
    casa: "Catálogo aqui (Bases Genealógicas); fonte consultada por caso abre em /pesquisa-evidencias/$caseId",
    fonte: "genealogical_sources_catalog (catálogo) · research_sources (uso por caso)",
    tipo: "catalogo_org",
    nota: "Caso 360 e Pesquisa e Documentos apenas abrem o caso; nenhuma base é copiada para dentro do caso.",
  },
  {
    area: "Trilhas/marcos",
    casa: "Biblioteca Mestre → Trilhas de pesquisa (aqui); marco jurídico por caso em /casos/$caseId (Validação Jurídica)",
    fonte: "citizenship_tracks (trilha) · legal_reference_milestones (marco por caso)",
    tipo: "catalogo_org",
    nota: "Trilha é referência de país; marco é a aplicação dela a um caso — já resolvido no corte CA08-JURIDICO-PROPORCIONAL, não duplicado aqui.",
  },
  {
    area: "Evidências",
    casa: "/pesquisa-modulo (índice) → /pesquisa-evidencias/$caseId e /biblioteca-evidencias/$caseId por caso",
    fonte: "evidences · research_evidence_items",
    tipo: "caso_scoped",
    nota: "Fonte concorrente real: achados e o índice de pesquisa gravam em research_evidence_items; a cadeia de custódia e a biblioteca de evidências gravam em evidences. Duas tabelas para o mesmo conceito — não unificadas neste corte.",
  },
  {
    area: "Pessoas/relações/linhagens",
    casa: "/pessoas-linhagens/$caseId",
    fonte: "research_people · genealogical_person_profiles · name_variants / research_name_variants",
    tipo: "caso_scoped",
    nota: "Fonte concorrente real: duas tabelas de variante de nome (name_variants e research_name_variants) e um perfil adicional (genealogical_person_profiles) sobre a mesma pessoa — declarado, não corrigido neste corte.",
  },
  {
    area: "Hipóteses/lacunas",
    casa: "/pesquisa-modulo e /pesquisa-evidencias/$caseId (achados: facts_to_confirm, negative_next_action)",
    fonte: "genealogical_findings (achados) · pesquisa (sistema legado, ver nota)",
    tipo: "caso_scoped",
    nota: "Fonte concorrente real e a mais grave: /pesquisa (tabela pesquisa, blocos hipóteses/pessoas/evidências) é sistema legado paralelo ao atual (research_*/evidences/genealogical_findings) — dado de um caso pode estar em qualquer um dos dois, desconectados. Não reativado nem estendido neste corte.",
  },
  {
    area: "Modelos/linguagem",
    casa: "Biblioteca Mestre → Modelos F1/F2 e Dicionários e taxonomias (aqui)",
    fonte: "master_library_items (categoria modelo) · controlled_taxonomies",
    tipo: "catalogo_org",
    nota: "Sem fonte concorrente: única leitura, já dentro da Biblioteca Mestre.",
  },
  {
    area: "Conteúdos/microentregas",
    casa: "/biblioteca-mensagens (conteúdo editorial) · client_deliverables por caso (Caso 360)",
    fonte: "editorial_content_items · client_deliverables",
    tipo: "caso_scoped",
    nota: "Fronteira já decidida em 27/08/2026: conteúdo editorial mora em Biblioteca de Mensagens, nunca duplicado aqui — Biblioteca Mestre só aponta.",
  },
  {
    area: "Assistente de Pesquisa",
    casa: "Aba do dossiê de pesquisa (/pesquisa-modulo/$id, /pesquisa/$id) e widget flutuante global do Desk",
    fonte: "componente único AssistentePesquisa (pesquisa-ia.server.ts)",
    tipo: "componente_global",
    nota: "Sem duplicação: o mesmo componente é reaproveitado em toda superfície — nunca uma segunda implementação de assistente.",
  },
] as const;

/** Nenhuma subárea da Biblioteca Mestre pode ser projetada no App Cliente. */
export function exposicaoAppCliente(): false {
  return false;
}

/** Status canônicos de itens versionados da Biblioteca. */
export const STATUS_BIBLIOTECA = ["rascunho", "em_revisao", "aprovado", "arquivado"] as const;
export type StatusBiblioteca = (typeof STATUS_BIBLIOTECA)[number];

/** Domínios de taxonomia controlada reutilizados por Pesquisa e Evidências. */
export const DOMINIOS_TAXONOMIA = [
  "tipo_fonte",
  "tipo_documento",
  "tipo_evidencia",
  "estado_evidencia",
  "tipo_achado",
  "tipo_relacao",
  "tipo_evento",
  "linha_transmissao",
  "pais_localidade",
  "etiqueta_operacional",
  "categoria_risco",
  "estado_pesquisa",
  "estado_relatorio",
] as const;
export type DominioTaxonomia = (typeof DOMINIOS_TAXONOMIA)[number];

/**
 * Regra jurídica só é aplicável a um caso quando aprovada, vigente e não arquivada.
 * Nunca produz conclusão automática: apenas habilita a referência para revisão humana.
 */
export function regraAplicavelACaso(
  regra: { status: string; vigencia_inicio?: string | null; vigencia_fim?: string | null; archived_at?: string | null },
  hoje = new Date(),
): boolean {
  if (regra.archived_at) return false;
  if (regra.status !== "aprovado") return false;
  const dia = hoje.toISOString().slice(0, 10);
  if (regra.vigencia_inicio && regra.vigencia_inicio > dia) return false;
  if (regra.vigencia_fim && regra.vigencia_fim < dia) return false;
  return true;
}

/** Somente item homologado, vigente e não arquivado pode ser selecionado em proposta. */
export function itemElegivelParaProposta(item: {
  status_homologacao?: string | null;
  elegivel_para_proposta?: boolean | null;
  archived_at?: string | null;
  vigencia_fim?: string | null;
  vigencia_estado?: string | null;
}): boolean {
  if (item.archived_at) return false;
  // Substituído, suspenso ou arquivado sai de qualquer seletor de nova utilização.
  if (
    item.vigencia_estado === "substituido" ||
    item.vigencia_estado === "suspenso" ||
    item.vigencia_estado === "arquivado"
  ) {
    return false;
  }
  if (item.status_homologacao !== "homologado") return false;
  if (!item.elegivel_para_proposta) return false;
  if (item.vigencia_fim && item.vigencia_fim < new Date().toISOString().slice(0, 10)) return false;
  return true;
}


/** Arquivamento lógico exige motivo; exclusão física nunca é permitida. */
export function validarArquivamento(_motivo: string): { ok: boolean; erro?: string } {
  return { ok: true };
}
