/**
 * Checklist jurídico automático por contrato.
 *
 * Derivação pura (sem escrita, sem ação externa) a partir dos dados já
 * carregados na ficha do instrumento. Não emite juízo de mérito sobre o caso:
 * apenas conformidade formal do instrumento.
 */

export type EstadoItemChecklist = "ok" | "pendente" | "bloqueio";

export type ItemChecklistJuridico = {
  chave: string;
  label: string;
  grupo: "Partes" | "Objeto e escopo" | "Comercial" | "Cláusulas" | "Anexos" | "Versão";
  estado: EstadoItemChecklist;
  detalhe: string;
  bloqueante: boolean;
};

export type ResumoChecklistJuridico = {
  itens: ItemChecklistJuridico[];
  total: number;
  conformes: number;
  pendentes: number;
  bloqueios: number;
  aptoParaRevisaoHumana: boolean;
};

type Lista = Array<Record<string, unknown>>;

export type EntradaChecklistJuridico = {
  contrato: Record<string, unknown> | null | undefined;
  partes?: Lista;
  escopo?: Lista;
  clausulas?: Lista;
  anexos?: Lista;
  versoes?: Lista;
  /** Valor total e prazo de execução — não existem em `contracts`; vêm dos
   * parâmetros do Planejador vinculados (contract_parameter_values), quando houver. */
  valorReferencia?: string | number | null;
  prazoReferencia?: string | null;
};

const ANEXOS_OBRIGATORIOS = ["I", "II", "III", "IV", "V"] as const;

function ativos(lista: Lista | undefined): Lista {
  return (lista ?? []).filter((r) => !r["archived_at"]);
}

function texto(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function item(
  chave: string,
  label: string,
  grupo: ItemChecklistJuridico["grupo"],
  ok: boolean,
  detalheOk: string,
  detalhePendente: string,
  bloqueante = true,
): ItemChecklistJuridico {
  return {
    chave,
    label,
    grupo,
    estado: ok ? "ok" : bloqueante ? "bloqueio" : "pendente",
    detalhe: ok ? detalheOk : detalhePendente,
    bloqueante,
  };
}

export function montarChecklistJuridico(entrada: EntradaChecklistJuridico): ResumoChecklistJuridico {
  const c = entrada.contrato ?? {};
  const partes = ativos(entrada.partes);
  const escopo = ativos(entrada.escopo);
  const clausulas = ativos(entrada.clausulas);
  const anexos = ativos(entrada.anexos);
  const versoes = entrada.versoes ?? [];

  // Valores reais da coluna `role` em contract_parties (contratada = "provider",
  // contratante = "contracting_client") — nunca os rótulos em português do
  // checklist, que não existem no banco e faziam este item falhar sempre.
  const contratada = partes.some((p) => texto(p["role"]) === "provider");
  const contratante = partes.some((p) => texto(p["role"]) === "contracting_client");
  const partesSemDocumento = partes.filter((p) => !texto(p["document_number"]));

  const anexosPresentes = new Set(anexos.map((a) => texto(a["annex_code"]).toUpperCase()));
  const anexosFaltantes = ANEXOS_OBRIGATORIOS.filter((code) => !anexosPresentes.has(code) && !anexosPresentes.has(`ANEXO ${code}`));

  // contract_clause_overrides não tem `status`/`approved_at` — a aprovação real
  // é `requires_human_review` (false = já aprovado/sem revisão pendente) e
  // `reviewed_at`. O checklist antigo checava colunas inexistentes e por isso
  // marcava toda alteração de cláusula como pendente, sempre.
  const overridesPendentes = clausulas.filter((cl) => cl["requires_human_review"] === true && !texto(cl["reviewed_at"]));

  const itens: ItemChecklistJuridico[] = [
    item("parte_contratada", "Contratada qualificada", "Partes", contratada, "Contratada identificada.", "Nenhuma parte com papel de contratada."),
    item("parte_contratante", "Contratante identificado", "Partes", contratante, "Contratante identificado.", "Nenhuma parte com papel de contratante."),
    item(
      "partes_documento",
      "Documentos das partes",
      "Partes",
      partes.length > 0 && partesSemDocumento.length === 0,
      "Todas as partes possuem documento.",
      partes.length === 0 ? "Nenhuma parte cadastrada." : `${partesSemDocumento.length} parte(s) sem documento.`,
    ),
    item("objeto", "Objeto do instrumento", "Objeto e escopo", texto(c["title"]).length > 0, "Objeto descrito.", "Título/objeto não preenchido."),
    item(
      "escopo_itens",
      "Escopo delimitado",
      "Objeto e escopo",
      escopo.length > 0,
      `${escopo.length} item(ns) de escopo.`,
      "Nenhum item de escopo vinculado.",
    ),
    item(
      "escopo_exclusoes",
      "Exclusões declaradas",
      "Objeto e escopo",
      escopo.some((e) => texto(e["category"]) === "exclusao"),
      "Exclusões declaradas no escopo.",
      "Escopo sem exclusões declaradas.",
      false,
    ),
    item(
      "valor",
      "Valor e forma de pagamento",
      "Comercial",
      Number(entrada.valorReferencia ?? 0) > 0,
      "Valor total definido.",
      "Valor total ausente ou zerado — verifique os parâmetros do Planejador.",
    ),
    item(
      "prazo",
      "Prazo de execução",
      "Comercial",
      texto(entrada.prazoReferencia).length > 0 || Boolean(c["effective_end_date"]),
      "Prazo definido.",
      "Prazo de execução não definido — verifique os parâmetros do Planejador.",
    ),
    item(
      "clausulas_override",
      "Cláusulas alteradas aprovadas",
      "Cláusulas",
      overridesPendentes.length === 0,
      clausulas.length ? "Todas as alterações de cláusula estão aprovadas." : "Corpo padrão sem alterações.",
      `${overridesPendentes.length} alteração(ões) de cláusula sem aprovação.`,
    ),
    item(
      "anexos_obrigatorios",
      "Anexos I a V vinculados",
      "Anexos",
      anexosFaltantes.length === 0,
      "Anexos I a V vinculados ao instrumento.",
      `Anexos ausentes: ${anexosFaltantes.join(", ")}.`,
    ),
    item(
      "anexos_conteudo",
      "Anexos sem texto pendente",
      "Anexos",
      anexos.length > 0 && anexos.every((a) => texto(a["status"]) !== "placeholder" && texto(a["status"]) !== "draft"),
      "Anexos com conteúdo homologado.",
      anexos.length === 0 ? "Nenhum anexo vinculado." : "Há anexos em rascunho/placeholder.",
      false,
    ),
    item(
      "versao_gerada",
      "Versão interna gerada",
      "Versão",
      versoes.length > 0,
      `Última versão: v${versoes[0]?.["version_number"] ?? "?"}.`,
      "Nenhuma versão interna gerada.",
    ),
    item(
      "versao_renderizada",
      "Versão renderizada sem falha",
      "Versão",
      versoes.length > 0 && !texto(versoes[0]?.["render_error"]),
      "Renderização concluída.",
      versoes.length === 0 ? "Sem versão para renderizar." : "A última versão apresentou falha de renderização.",
    ),
  ];

  const bloqueios = itens.filter((i) => i.estado === "bloqueio").length;
  const pendentes = itens.filter((i) => i.estado === "pendente").length;

  return {
    itens,
    total: itens.length,
    conformes: itens.filter((i) => i.estado === "ok").length,
    pendentes,
    bloqueios,
    aptoParaRevisaoHumana: bloqueios === 0,
  };
}
