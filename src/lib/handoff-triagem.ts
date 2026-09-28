/**
 * Corte U1 (28/09/2026) — "ficha única que se completa na jornada": o repasse
 * Discovery → caso leva a triagem já capturada no lead, para que Caso 360,
 * Planejador e Pesquisa não perguntem de novo.
 *
 * Regras:
 *   - só preenche campo VAZIO do destino; valor já existente nunca é
 *     sobrescrito (decisão humana anterior prevalece);
 *   - vocabulários do lead e do caso são diferentes: só copia quando há
 *     equivalente explícito no de-para abaixo — nunca inventa valor;
 *   - SPIN, hipótese e score não são copiados (dicionário canônico §6);
 *     fatos de Situação sim;
 *   - catálogo/SKU nunca entra.
 */
import type { LeadDesk } from "@/lib/crm-desk";
import { rotulo } from "@/lib/crm-desk";
import { normalizarRegistro } from "@/lib/discovery-registro";
import { PAISES_LINHA } from "@/lib/caso-ficha";

/** Via preliminar do lead → via do caso. Sem equivalente = não copia. */
export const VIA_LEAD_PARA_CASO: Record<string, string> = {
  reparacao_historica: "reparacao_historica_em_confirmacao",
  naturalizacao_residencia: "naturalizacao_residencia_em_confirmacao",
  via_a_confirmar: "a_definir",
};

/** Status da via do lead → status do caso. */
export const STATUS_VIA_LEAD_PARA_CASO: Record<string, string> = {
  confirmada_internamente: "confirmada_internamente",
  em_confirmacao_juridica: "em_confirmacao",
};

const vazio = (v: unknown) => v == null || String(v).trim() === "" || (Array.isArray(v) && v.length === 0);

/** Respostas narrativas da Discovery que descrevem a família (não SPIN de dor/implicação). */
const PERGUNTAS_FAMILIA: readonly { id: string; rotulo: string }[] = [
  { id: "pais_partida", rotulo: "Pessoa/história de partida" },
  { id: "participantes", rotulo: "Participantes" },
  { id: "ascendente", rotulo: "Ascendente" },
  { id: "o_que_ja_sabem", rotulo: "O que a família já sabe" },
  { id: "linha", rotulo: "Linha" },
  { id: "docs_em_maos", rotulo: "Documentos em mãos" },
];

/** Resumo da linha familiar vindo da Discovery — só fatos de Situação, com origem. */
export function resumoLinhaFamiliarDaDiscovery(lead: LeadDesk): string {
  const l = lead as unknown as Record<string, unknown>;
  const partes: string[] = [];
  if (!vazio(l.linha_transmissao)) partes.push(`Linha: ${rotulo("linha_transmissao", String(l.linha_transmissao))}`);
  if (!vazio(l.geracao_ascendente)) partes.push(`Geração do ascendente: ${rotulo("geracao_ascendente", String(l.geracao_ascendente))}`);
  if (!vazio(l.pais_linha_prioritaria)) partes.push(`País/linha: ${rotulo("pais_linha_prioritaria", String(l.pais_linha_prioritaria))}`);
  if (!vazio(l.localidades_conhecidas)) {
    const loc = Array.isArray(l.localidades_conhecidas) ? (l.localidades_conhecidas as string[]).join(", ") : String(l.localidades_conhecidas);
    partes.push(`Localidades conhecidas: ${loc}`);
  }
  if (!vazio(l.documentos_chave)) {
    const docs = Array.isArray(l.documentos_chave) ? (l.documentos_chave as string[]).map((d) => rotulo("documentos_chave", d)).join(", ") : String(l.documentos_chave);
    partes.push(`Documentos citados: ${docs}`);
  }
  if (!vazio(l.narrativa_familiar)) partes.push(`Narrativa familiar: ${String(l.narrativa_familiar).trim()}`);
  const registro = normalizarRegistro(l.discovery_registro);
  for (const p of PERGUNTAS_FAMILIA) {
    const r = registro.respostas[p.id];
    if (r?.texto) partes.push(`${p.rotulo} (${r.origem.replace(/_/g, " ")}): ${r.texto}`);
    else if (r?.nao_sabe) partes.push(`${p.rotulo}: não sabe / não tem agora`);
  }
  const linhaInvestigada = registro.pos_call.linha_investigada;
  if (linhaInvestigada) partes.push(`Linha investigada: ${linhaInvestigada}`);
  return partes.join("\n");
}

/** Brief interno do caso: resumo da call + linha familiar da Discovery, marcado "a confirmar". */
export function briefDaDiscovery(lead: LeadDesk): string | null {
  const linha = resumoLinhaFamiliarDaDiscovery(lead);
  const call = String(lead.resumo_call ?? "").trim();
  const blocos = [call ? `Resumo da call: ${call}` : "", linha].filter(Boolean);
  if (!blocos.length) return null;
  return `Vindo da Discovery (a confirmar):\n${blocos.join("\n")}`;
}

/** Patch para `crm_casos`: só campos vazios no caso, só com equivalente explícito. */
export function patchCasoDaTriagem(lead: LeadDesk, caso: Record<string, unknown>): Record<string, unknown> {
  const l = lead as unknown as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  const pais = String(l.pais_linha_prioritaria ?? "");
  if (vazio(caso.pais_linha_prioritaria) && PAISES_LINHA.some((o) => o.valor === pais)) patch.pais_linha_prioritaria = pais;
  if (vazio(caso.pais) && pais && pais !== "a_definir" && pais !== "multipais") patch.pais = rotulo("pais_linha_prioritaria", pais);
  const via = VIA_LEAD_PARA_CASO[String(l.via_juridica_preliminar ?? "")];
  if (vazio(caso.via_juridica_preliminar) && via) patch.via_juridica_preliminar = via;
  const status = STATUS_VIA_LEAD_PARA_CASO[String(l.status_via ?? "")];
  if (vazio(caso.status_via) && status) patch.status_via = status;
  if (vazio(caso.citizenship_track_id) && !vazio(l.trilha_referencia_id)) patch.citizenship_track_id = l.trilha_referencia_id;
  const brief = briefDaDiscovery(lead);
  if (vazio(caso.brief_interno) && brief) patch.brief_interno = brief;
  if (vazio(caso.dossie_mae_referencia) && !vazio(l.dossie_mae_ref)) patch.dossie_mae_referencia = l.dossie_mae_ref;
  return patch;
}

/** Patch para uma pessoa reaproveitada: completa só o que está vazio em `clientes`. */
export function patchClienteReaproveitado(
  cliente: Record<string, unknown>,
  doLead: { email: string | null; telefone: string | null; origem: string | null; indicado_por: string | null; pais_interesse: string | null },
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(doLead)) if (v && vazio(cliente[k])) patch[k] = v;
  return patch;
}
