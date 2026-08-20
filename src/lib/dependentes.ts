/**
 * Parâmetro `dependentes` — estrutura, catálogos controlados e regras.
 *
 * Dependente não é signatário automático, não gera cobrança própria e não
 * recebe acesso independente ao App sem representação aplicável.
 */

export const STATUS_REPRESENTACAO = [
  { valor: "pendente", rotulo: "Pendente" },
  { valor: "documentada", rotulo: "Documentada" },
  { valor: "nao_aplicavel", rotulo: "Não aplicável" },
] as const;
export type StatusRepresentacao = (typeof STATUS_REPRESENTACAO)[number]["valor"];

export const VINCULOS_DEPENDENTE = [
  { valor: "filho", rotulo: "Filho(a)" },
  { valor: "enteado", rotulo: "Enteado(a)" },
  { valor: "conjuge", rotulo: "Cônjuge/companheiro(a)" },
  { valor: "tutelado", rotulo: "Tutelado(a)/curatelado(a)" },
  { valor: "outro_vinculo", rotulo: "Outro vínculo declarado" },
] as const;

export type Dependente = {
  id?: string;
  dependent_person_id?: string | null;
  case_id: string;
  nome_completo: string;
  vinculo_com_titular: string;
  titular_responsavel_legal_id?: string | null;
  titular_responsavel_legal_nome?: string | null;
  status_representacao: StatusRepresentacao;
  documento_representacao_referencia_interna?: string | null;
  participa_do_contrato: boolean;
  possui_acesso_app: boolean;
  anexo_individual_aplicavel: boolean;
  observacao_interna?: string | null;
};

export function rotuloStatusRepresentacao(v: string | null | undefined): string {
  return STATUS_REPRESENTACAO.find((s) => s.valor === v)?.rotulo ?? "—";
}

/** Dependente “participa” quando entra em contrato, App ou anexo individual. */
export function participaDeFormalizacao(d: Dependente): boolean {
  return Boolean(d.participa_do_contrato || d.possui_acesso_app || d.anexo_individual_aplicavel);
}

export type BloqueioDependente = { codigo: string; descricao: string; dependente: string };

/**
 * Bloqueios de formalização gerados pelos dependentes. A simples existência de
 * um dependente nunca bloqueia: só participação em contrato, App ou anexo.
 */
export function bloqueiosDependentes(lista: Dependente[]): BloqueioDependente[] {
  const out: BloqueioDependente[] = [];
  for (const d of lista) {
    const participa = participaDeFormalizacao(d);
    if (participa && d.status_representacao !== "documentada") {
      out.push({
        codigo: "DEPENDENTE_REPRESENTACAO_PENDENTE",
        descricao: `${d.nome_completo}: participa de contrato, App ou anexo individual sem representação documentada.`,
        dependente: d.nome_completo,
      });
    }
    if (participa && (!d.dependent_person_id || !d.titular_responsavel_legal_id)) {
      out.push({
        codigo: "DEPENDENTE_SEM_VINCULO_POR_ID",
        descricao: `${d.nome_completo}: participação exige pessoa dependente e responsável legal referenciados por ID.`,
        dependente: d.nome_completo,
      });
    }
    if (d.possui_acesso_app && d.status_representacao !== "documentada") {
      out.push({
        codigo: "DEPENDENTE_APP_SEM_REPRESENTACAO",
        descricao: `${d.nome_completo}: acesso ao App exige representação documentada.`,
        dependente: d.nome_completo,
      });
    }
    if (d.status_representacao === "documentada" && !d.documento_representacao_referencia_interna) {
      out.push({
        codigo: "DEPENDENTE_DOCUMENTO_SEM_REFERENCIA",
        descricao: `${d.nome_completo}: representação documentada sem referência interna do documento.`,
        dependente: d.nome_completo,
      });
    }
  }
  return out;
}


/** Anexo individual só é aplicável quando explicitamente marcado no dependente. */
export function anexosImpactados(lista: Dependente[]): string[] {
  const anexos = new Set<string>();
  for (const d of lista) {
    if (d.anexo_individual_aplicavel) anexos.add("ANX-INDIVIDUAL");
    if (d.status_representacao !== "nao_aplicavel") anexos.add("ANX-REPRESENTACAO");
  }
  return [...anexos].sort();
}

/** Valor textual do parâmetro `dependentes` na ficha (sem dado sensível). */
export function resumoParametroDependentes(lista: Dependente[]): string {
  if (!lista.length) return "Nenhum dependente declarado.";
  return lista
    .map(
      (d) =>
        `${d.nome_completo} (${d.vinculo_com_titular}; representação ${rotuloStatusRepresentacao(d.status_representacao).toLowerCase()}${
          d.participa_do_contrato ? "; participa do contrato" : ""
        })`,
    )
    .join(" · ");
}
