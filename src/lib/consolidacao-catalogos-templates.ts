/**
 * CA-OPS-03 — CONSOLIDAÇÃO DOS CATÁLOGOS DE TEMPLATES
 *
 * Havia dois catálogos concorrentes de "modelos":
 *  1. `/biblioteca-mensagens` — catálogo operacional real, com dados próprios
 *     (message_templates / message_template_versions / message_template_usage),
 *     versão, vigência, gates e log de uso manual.
 *  2. `bib-templates-com` ("Modelos institucionais") — entrada de catálogo dentro
 *     da Biblioteca Mestre, sem fonte de dados própria implementada.
 *
 * Decisão consolidada: `/biblioteca-mensagens` é a FONTE CANÔNICA ÚNICA de
 * qualquer modelo de comunicação. `bib-templates-com` deixa de ser catálogo
 * paralelo e passa a ser um APONTADOR HISTÓRICO (alias) para a fonte canônica.
 *
 * Invariantes:
 *  - Nenhuma rota existente é removida ou renomeada.
 *  - Nenhum registro, versão ou log de uso é apagado: histórico preservado.
 *  - O alias nunca hospeda conteúdo próprio nem duplica modelo.
 *  - Nada é enviado automaticamente; a consolidação é apenas de catálogo.
 */

export type PapelCatalogoTemplate = "canonico" | "alias_historico";

export type CatalogoTemplate = {
  id: string;
  rotulo: string;
  papel: PapelCatalogoTemplate;
  /** Rota navegável real. `null` quando a entrada não tem superfície própria. */
  rota: string | null;
  /** Fonte de dados real; `null` quando não existe fonte própria. */
  fonte: string | null;
  /** Para alias: id do catálogo canônico que prevalece. */
  prevalece?: string;
  observacao: string;
};

export const CATALOGO_CANONICO_TEMPLATES: CatalogoTemplate = {
  id: "biblioteca-mensagens",
  rotulo: "Biblioteca de Mensagens",
  papel: "canonico",
  rota: "/biblioteca-mensagens",
  fonte: "message_templates / message_template_versions / message_template_usage",
  observacao:
    "Fonte única de modelos de comunicação: versão, vigência, gates e log de uso manual. Preserva todo o histórico existente.",
};

export const CATALOGO_ALIAS_TEMPLATES: CatalogoTemplate = {
  id: "bib-templates-com",
  rotulo: "Modelos institucionais",
  papel: "alias_historico",
  rota: null,
  fonte: null,
  prevalece: "biblioteca-mensagens",
  observacao:
    "Entrada histórica da Biblioteca Mestre. Mantida no catálogo para não perder rastro, mas sem conteúdo próprio: encaminha para a Biblioteca de Mensagens.",
};

export const CATALOGOS_TEMPLATE: CatalogoTemplate[] = [
  CATALOGO_CANONICO_TEMPLATES,
  CATALOGO_ALIAS_TEMPLATES,
];

/** Regra de precedência aplicável a qualquer superfície do Desk. */
export const PRECEDENCIA_TEMPLATES = {
  vencedor: CATALOGO_CANONICO_TEMPLATES.id,
  rotaVencedora: "/biblioteca-mensagens",
  perdedores: [CATALOGO_ALIAS_TEMPLATES.id],
  regra:
    "Qualquer comunicação com lead, cliente ou caso usa exclusivamente o modelo vigente da Biblioteca de Mensagens. A entrada 'Modelos institucionais' não é fonte e não pode ser usada como origem de texto.",
  historicoPreservado: true,
  rotasRemovidas: [] as string[],
  decisaoHumanaPendente: false,
} as const;

/** Resolve qual catálogo responde por um identificador de catálogo/módulo. */
export function resolverCatalogoTemplate(id: string): CatalogoTemplate | null {
  const direto = CATALOGOS_TEMPLATE.find((c) => c.id === id);
  if (!direto) return null;
  if (direto.papel === "alias_historico" && direto.prevalece) {
    return CATALOGOS_TEMPLATE.find((c) => c.id === direto.prevalece) ?? direto;
  }
  return direto;
}

/** Rota canônica a abrir a partir de qualquer entrada de catálogo de templates. */
export function rotaCanonicaTemplates(id: string): string {
  return resolverCatalogoTemplate(id)?.rota ?? PRECEDENCIA_TEMPLATES.rotaVencedora;
}

/** Um alias jamais pode ser usado como fonte de conteúdo. */
export function podeSerFonteDeTemplate(id: string): boolean {
  return CATALOGOS_TEMPLATE.find((c) => c.id === id)?.papel === "canonico";
}
