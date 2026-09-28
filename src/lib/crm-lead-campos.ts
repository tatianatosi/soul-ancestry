/**
 * Colunas do lead canônico que as telas do CRM podem gravar (extraído de
 * `crm-desk.functions.ts` em 28/09/2026 para o handoff usar a mesma regra).
 */
export const CAMPOS_LEAD = [
  "nome",
  "email",
  "telefone",
  "origem",
  // CA03-PESSOA-UNICA-VINCULOS (09/09/2026): vínculo ausente — leads.case_id
  // existia desde sempre mas nenhum escritor gravava nele (leads.case_id era
  // nulo em todo o banco). Só é preenchido por confirmação humana explícita
  // (confirmarVinculoLeadPessoa, pessoa.functions.ts), nunca por fusão
  // automática de nome.
  "case_id",
  "area_responsavel",
  "responsavel_nome",
  "indicado_por",
  "proxima_acao",
  "proxima_acao_em",
  "eixo_comercial",
  "eixo_formalizacao",
  "objetivo",
  "nacionalidade",
  "via_juridica_preliminar",
  "status_via",
  "marco_preliminar",
  "discovery_resultado",
  "resumo_call",
  "resumo_validado",
  "call_agendada_em",
  "call_realizada_em",
  "proposta_link_interno",
  "proposta_referencia_interna",
  "contrato_link_interno",
  "asaas_evento_referencia",
  "motivo_perda",
  "servico_inicial_aprovado",
  "pagamento_previsto_em",
  "dados_teste",
  "narrativa_familiar",
  "observacoes",
  "ultimo_followup_em",
  "pais_interesse",
  // Ficha de Discovery/triagem (CA 04 v1.1)
  "status_call",
  "elegibilidade_preliminar",
  "confianca_triagem",
  "geracao_ascendente",
  "linha_transmissao",
  "risco_ruptura",
  "complexidade_documental",
  "estado_documental_inicial",
  "pendencia_documental_prioritaria",
  "exige_idioma_entrevista",
  "requerentes_potenciais",
  "estrutura_familiar",
  "objecao_predominante",
  "nivel_intencao",
  "produtos_recomendados",
  "sku_referencia",
  "despesas_terceiros_status",
  "despesas_terceiros_regra",
  "despesas_terceiros_faixa",
  "consentimento_gravacao",
  "spin_situacao",
  "spin_problema",
  "spin_implicacao",
  "spin_necessidade",
  "gravacao_link_interno",
  "dossie_link_interno",
  // Dossiê-mãe autorizado
  "dossie_ativo",
  "dossie_mae_ref",
  "dossie_ambiente",
  "dossie_nivel_acesso",
  "dossie_responsavel",
  // Consentimento, trilha e pesquisa prévia (Discovery v1.0)
  "consentimento_status",
  "consentimento_em",
  "consentimento_canal",
  "consentimento_versao_aviso",
  "nacionalidades_interesse",
  "pais_linha_prioritaria",
  "localidades_conhecidas",
  "documentos_chave",
  "trilha_referencia_id",
  "marco_referencia_id",
  "pesquisa_previa_autorizacao",
  "pesquisa_previa_escopo",
  "pesquisa_previa_limite",
] as const;


/** Só colunas editáveis do lead; texto vazio vira null. Mesma regra para /calls, /leads e handoff. */
export function limparCamposLead(entrada: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const campo of CAMPOS_LEAD) {
    if (!(campo in entrada)) continue;
    const v = entrada[campo];
    out[campo] = typeof v === "string" && v.trim() === "" ? null : v;
  }
  return out;
}
