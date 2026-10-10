/**
 * G-03 — Biblioteca de Evidências e Projeções Autorizadas.
 *
 * Princípio: integração invisível, evidência visível.
 * Cadeia: Fonte/material → Biblioteca de Evidências → Desk/Pesquisa →
 * Projeção autorizada → App Cliente / One-page / PDF aprovado.
 *
 * Espelho das travas do banco (fonte de verdade). Nada aqui consulta fonte
 * externa, publica no App Cliente ou cria documento externo.
 */

import { contemCpf } from "@/lib/validacao-pessoa";
import { contemFonteOuMecanismoTecnico } from "@/lib/onboarding-jornada";

export type NivelAcesso = "restrito" | "equipe_do_caso" | "cliente_autorizado";
export type Confianca = "INICIAL" | "BAIXO" | "MEDIO" | "ALTO";
export type Aprovacao = "draft" | "in_review" | "approved" | "published" | "archived";

export const NIVEIS_ACESSO: { id: NivelAcesso; rotulo: string; nota: string }[] = [
  { id: "restrito", rotulo: "Restrito", nota: "Só administração e pesquisa. Nunca projetável ao cliente." },
  { id: "equipe_do_caso", rotulo: "Equipe do caso", nota: "Time interno do caso. Não chega ao App sem projeção aprovada." },
  { id: "cliente_autorizado", rotulo: "Cliente autorizado", nota: "Elegível a projeção após aprovação humana e sanitização." },
];

export const FLUXO_EVIDENCIA: { id: string; rotulo: string; nota: string }[] = [
  { id: "recebida", rotulo: "Recebida", nota: "Material chegou; ainda não catalogado." },
  { id: "registrada", rotulo: "Registrada", nota: "Catalogada na biblioteca com identificação interna." },
  { id: "em_revisao", rotulo: "Em revisão", nota: "Sob análise de pesquisa." },
  { id: "divergente", rotulo: "Divergente", nota: "Conflita com outro registro; exige tratamento." },
  { id: "insuficiente", rotulo: "Insuficiente", nota: "Não sustenta o fato pretendido." },
  { id: "requer_complemento", rotulo: "Requer complemento", nota: "Falta peça ou informação adicional." },
  { id: "requer_retificacao", rotulo: "Requer retificação", nota: "Erro documental a corrigir na origem." },
  { id: "requer_traducao_apostila", rotulo: "Requer tradução/apostila", nota: "Pendência formal de tradução ou apostilamento." },
  { id: "rejeitada_inaplicavel", rotulo: "Rejeitada/inaplicável", nota: "Fora do escopo do caso." },
  { id: "aprovada_para_entrega", rotulo: "Aprovada para entrega", nota: "Pode compor projeção autorizada." },
  { id: "publicada", rotulo: "Publicada", nota: "Já projetada por instrumento aprovado." },
];

export const ESTADOS_EPISTEMICOS: { id: string; rotulo: string; nota: string }[] = [
  { id: "INFORMACAO_COMPARTILHADA_FAMILIA", rotulo: "Informação compartilhada pela família", nota: "Relato. Não valida vínculo, direito, cidadania ou relação." },
  { id: "DADO_PESQUISA_INICIAL", rotulo: "Dado de pesquisa inicial", nota: "Levantamento preliminar interno." },
  { id: "EM_VALIDACAO_DOCUMENTAL", rotulo: "Em validação documental", nota: "Documento em conferência." },
  { id: "VALIDADO_POR_DOCUMENTO", rotulo: "Validado por documento", nota: "Não equivale a parecer jurídico, cidadania reconhecida ou resultado garantido." },
  { id: "PENDENTE_CONFIRMACAO", rotulo: "Pendente de confirmação", nota: "Aguardando peça ou resposta." },
  { id: "NAO_APLICAVEL", rotulo: "Não aplicável", nota: "Sem efeito para este caso." },
];

export const NATUREZAS: { id: string; rotulo: string; nota: string }[] = [
  { id: "documental_oficial", rotulo: "Documental oficial", nota: "Registro emitido por autoridade civil, religiosa ou estatal." },
  { id: "documental_nao_oficial", rotulo: "Documental não oficial", nota: "Documento privado, cópia simples ou transcrição de terceiro." },
  { id: "colaborativa_familiar", rotulo: "Colaborativa familiar", nota: "Relato ou material da família. Nunca valida sozinha." },
  { id: "registro_interno", rotulo: "Registro interno", nota: "Anotação de trabalho da equipe." },
  { id: "busca_negativa", rotulo: "Busca negativa", nota: "Consulta sem retorno. Evidência válida com fonte, data e próxima ação." },
  { id: "material_de_apoio", rotulo: "Material de apoio", nota: "Contexto histórico ou territorial, sem força probatória." },
];

export const CONFIANCAS: { id: Confianca; rotulo: string; ordem: number }[] = [
  { id: "INICIAL", rotulo: "Inicial", ordem: 0 },
  { id: "BAIXO", rotulo: "Baixo", ordem: 1 },
  { id: "MEDIO", rotulo: "Médio", ordem: 2 },
  { id: "ALTO", rotulo: "Alto", ordem: 3 },
];

export const DESTINOS: { id: string; rotulo: string }[] = [
  { id: "app", rotulo: "App Cliente" },
  { id: "one_page", rotulo: "One-page" },
  { id: "pdf_aprovado", rotulo: "PDF aprovado" },
];

export const APROVACOES: { id: Aprovacao; rotulo: string }[] = [
  { id: "draft", rotulo: "Rascunho" },
  { id: "in_review", rotulo: "Em revisão" },
  { id: "approved", rotulo: "Aprovada" },
  { id: "published", rotulo: "Publicada" },
  { id: "archived", rotulo: "Arquivada" },
];

/**
 * Vocabulário único de estados da microentrega (marco jurídico/achado →
 * caso → microentrega → App Cliente), pedido pela proprietária em 09/09/2026.
 * `app_projections.approval_status` é o único escritor/leitor ativo — não
 * migra dado nem renomeia coluna, só normaliza para exibição/relatório.
 * "planejada" nunca é produzida hoje: o fluxo real começa direto em rascunho
 * (não existe estado "planejada mas não iniciada" na Biblioteca de Evidências).
 * "liberada" e "publicada" são o mesmo `approval_status = "published"`,
 * diferenciados por `effective_from` (futuro/nulo = liberada; já vigente =
 * publicada) — reaproveita a coluna que já existe, sem campo novo.
 */
export type EstadoMicroentrega =
  | "planejada"
  | "em_producao"
  | "em_revisao"
  | "aprovada"
  | "liberada"
  | "publicada"
  | "arquivada";

export function estadoMicroentrega(
  p: { approval_status?: string | null; effective_from?: string | null },
  hoje = new Date(),
): EstadoMicroentrega {
  const status = p.approval_status ?? "draft";
  if (status === "archived") return "arquivada";
  if (status === "in_review") return "em_revisao";
  if (status === "approved") return "aprovada";
  if (status === "published") {
    return p.effective_from && new Date(p.effective_from) <= hoje ? "publicada" : "liberada";
  }
  return "em_producao";
}

export const ROTULO_ESTADO_MICROENTREGA: Record<EstadoMicroentrega, string> = {
  planejada: "Planejada",
  em_producao: "Em produção",
  em_revisao: "Em revisão",
  aprovada: "Aprovada",
  liberada: "Liberada",
  publicada: "Publicada",
  arquivada: "Arquivada",
};

export const DISCLAIMER_PROJECAO =
  "Registro documental do trabalho de pesquisa. Não constitui parecer jurídico, reconhecimento de cidadania nem garantia de resultado.";

export const ordemConfianca = (c: string) => CONFIANCAS.find((x) => x.id === c)?.ordem ?? 0;

/* ============ VALIDAÇÕES DE EVIDÊNCIA ============ */

export type ResultadoValidacao = { ok: boolean; erros: string[] };

export function validarEvidencia(v: Record<string, unknown>): ResultadoValidacao {
  const erros: string[] = [];
  const s = (k: string) => String(v[k] ?? "").trim();

  if (!s("case_id")) erros.push("Vincule a evidência a um caso.");
  if (!s("title_internal")) erros.push("Informe o título interno da evidência.");
  if (!s("evidence_type")) erros.push("Informe o tipo de evidência.");
  if (!NATUREZAS.some((n) => n.id === s("evidence_nature"))) erros.push("Informe a natureza da evidência.");

  if (s("evidence_nature") === "busca_negativa") {
    if (!s("negative_search_source")) erros.push("Busca negativa exige fonte consultada.");
    if (!s("negative_search_date")) erros.push("Busca negativa exige data da consulta.");
    if (!s("negative_search_next_action")) erros.push("Busca negativa exige próxima ação possível.");
  }

  if (s("evidence_nature") === "colaborativa_familiar") {
    if (s("epistemic_validation_status") === "VALIDADO_POR_DOCUMENTO")
      erros.push("Fonte colaborativa não valida sozinha vínculo, direito, cidadania ou relação.");
    if (s("confidence_level") === "ALTO") erros.push("Fonte colaborativa não atinge confiança alta sem documento.");
  }

  if (s("epistemic_validation_status") === "VALIDADO_POR_DOCUMENTO") {
    if (!["documental_oficial", "documental_nao_oficial"].includes(s("evidence_nature")))
      erros.push("Validação por documento exige evidência de natureza documental.");
    if (!s("reviewed_by") || !s("reviewed_at")) erros.push("Validação por documento exige responsável e data da revisão.");
  }

  return { ok: erros.length === 0, erros };
}

/** Elevação de confiança: sem salto INICIAL → ALTO e sempre com responsável, data e justificativa. */
export function validarElevacaoConfianca(entrada: {
  anterior: string;
  nova: string;
  justificativa?: string;
  revisadoPor?: string;
  revisadoEm?: string;
}): ResultadoValidacao {
  const erros: string[] = [];
  const a = ordemConfianca(entrada.anterior);
  const n = ordemConfianca(entrada.nova);
  if (n <= a) return { ok: true, erros };
  if (a === 0 && n === 3) erros.push("Salto de confiança INICIAL para ALTO não é permitido: eleve por etapas.");
  if (!entrada.revisadoPor) erros.push("Elevação de confiança exige responsável pela revisão.");
  if (!entrada.revisadoEm) erros.push("Elevação de confiança exige data da revisão.");
  return { ok: erros.length === 0, erros };
}

/* ============ SANITIZAÇÃO E PROJEÇÃO ============ */

const PADRAO_TECNICO = /(https?:\/\/|www\.|drive\.google|storage\/|\/storage|s3:\/\/|supabase\.co|\.pdf|\.jpg|\.png)/i;
const PADRAO_INTERNO =
  /(hipótese|hipotese|risco|suspeita|transcri|nota interna|uso interno|confidencial|probabilidade|chance de êxito|chance de exito|garantid|parecer jurídico|parecer juridico)/i;
// P5 (26/09/2026) — `contemCpf` agora mora em `validacao-pessoa.ts` (fonte
// única, reutilizada também por `achados-genealogicos.ts`, `jornada-cliente.ts`,
// `onboarding-jornada.ts` e `portal-linguagem-viva.ts` — ver corte "quais
// filtros podem ser reutilizáveis entre as abas e o app").

/** Conteúdo cru, URL interna, transcrição, risco, hipótese, CPF ou dado de terceiro nunca chegam ao App. */
export function conteudoProjetavel(texto: string): ResultadoValidacao {
  const erros: string[] = [];
  if (!texto.trim()) erros.push("Projeção exige conteúdo sanitizado.");
  if (PADRAO_TECNICO.test(texto)) erros.push("Conteúdo com URL, link ou referência de arquivo interno não pode compor projeção.");
  if (PADRAO_INTERNO.test(texto))
    erros.push("Conteúdo com hipótese, risco, transcrição, nota interna ou juízo de mérito não pode compor projeção.");
  if (contemCpf(texto)) erros.push("Conteúdo com CPF não pode compor projeção — nunca vai ao App Cliente.");
  // Governança 5A (Corte 1-quater): nome técnico de fonte, token, API, score e RG
  // também ficam fora do App. Antes só o portal filtrava na leitura; agora a
  // fila de publicação recusa já na aprovação.
  if (contemFonteOuMecanismoTecnico(texto))
    erros.push("Conteúdo com nome técnico de fonte, token, API, score ou RG não pode compor projeção.");
  return { ok: erros.length === 0, erros };
}

/** Evidência elegível a projeção: nunca restrita e sempre aprovada para entrega. */
export function evidenciaProjetavel(ev: Record<string, unknown>): ResultadoValidacao {
  const erros: string[] = [];
  if (ev["access_level"] === "restrito") erros.push("Evidência restrita não pode ser projetada ao cliente.");
  if (!["aprovada_para_entrega", "publicada"].includes(String(ev["workflow_status"])))
    erros.push("Somente evidência aprovada para entrega pode ser projetada.");
  if (ev["archived_at"]) erros.push("Evidência arquivada não pode ser projetada.");
  return { ok: erros.length === 0, erros };
}

/**
 * Marco jurídico elegível a projeção: mesma trava que evidência, mas a favor
 * da regra jurídica vinculada (`versioned_legal_rules.status = "aprovado"`),
 * não do marco em si — o marco (`legal_reference_milestones`) é só a citação;
 * quem garante revisão humana é a regra. Fecha o elo pedido em 09/09/2026:
 * marco jurídico/achado aprovado → microentrega.
 */
export function marcoJuridicoProjetavel(regra: {
  status?: string | null;
  archived_at?: string | null;
}): ResultadoValidacao {
  const erros: string[] = [];
  if (regra.archived_at) erros.push("Regra jurídica arquivada não pode ser projetada.");
  if (regra.status !== "aprovado") erros.push("Somente regra jurídica aprovada pode virar projeção ao cliente.");
  return { ok: erros.length === 0, erros };
}

export function validarProjecao(p: Record<string, unknown>, evidencia?: Record<string, unknown>): ResultadoValidacao {
  const erros: string[] = [...conteudoProjetavel(String(p["content_sanitized"] ?? "")).erros];
  if (!DESTINOS.some((d) => d.id === p["destination"])) erros.push("Informe o destino da projeção.");
  if (!String(p["projection_type"] ?? "").trim()) erros.push("Informe o tipo de projeção.");
  const status = String(p["approval_status"] ?? "draft");
  if (["approved", "published"].includes(status)) {
    if (!p["approved_by"] || !p["approved_at"]) erros.push("Aprovação de projeção exige aprovador e data.");
    if (evidencia) erros.push(...evidenciaProjetavel(evidencia).erros);
  }
  return { ok: erros.length === 0, erros };
}

/**
 * O que o App Cliente pode ler de uma evidência: nada diretamente.
 * Só projeções com approval_status = published e conteúdo sanitizado.
 */
export function itensVisiveisNoApp(
  evidencias: Record<string, unknown>[],
  projecoes: Record<string, unknown>[],
): { evidencias: never[]; projecoes: { id: string; conteudo: string; destino: string; disclaimer: string }[] } {
  void evidencias;
  const visiveis = projecoes
    .filter((p) => p["approval_status"] === "published" && !p["archived_at"] && p["destination"] === "app")
    .filter((p) => conteudoProjetavel(String(p["content_sanitized"] ?? "")).ok)
    .map((p) => ({
      id: String(p["id"]),
      conteudo: String(p["content_sanitized"]),
      destino: String(p["destination"]),
      disclaimer: DISCLAIMER_PROJECAO,
    }));
  return { evidencias: [], projecoes: visiveis };
}

/** Cadeia auditável evidência → validação → projeção, para leitura interna. */
export function cadeiaDaEvidencia(
  evidencia: Record<string, unknown>,
  validacoes: Record<string, unknown>[],
  projecoes: Record<string, unknown>[],
) {
  const id = String(evidencia["id"]);
  return {
    evidencia,
    validacoes: validacoes
      .filter((v) => v["evidence_id"] === id)
      .sort((a, b) => String(a["revisado_em"]).localeCompare(String(b["revisado_em"]))),
    projecoes: projecoes.filter((p) => p["source_entity_type"] === "evidence" && p["source_entity_id"] === id),
    publicadaNoApp: projecoes.some(
      (p) => p["source_entity_id"] === id && p["approval_status"] === "published" && p["destination"] === "app",
    ),
  };
}
